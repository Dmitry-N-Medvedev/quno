import mocha from 'mocha';
import chai from 'chai';
import {
  resolve as resolvePath,
} from 'path';
import Redis from 'redis-fast-driver';
import {
  doctorsJsonToRedisCommands,
} from '../helpers/doctorsJsonToRedisCommands.mjs';
import {
  getDoctorsNumber,
  getDoctors,
} from '../LibData.mjs';
import {
  LIMIT_MAX_VALUE,
} from '../constants/LIMIT_MAX_VALUE.mjs';
import {
  inspectObject,
} from './inspectObject.mjs';
import {
  SORT_ORDER,
} from '../constants/SORT_ORDER.mjs';

const {
  describe,
  it,
  before,
  after,
} = mocha;
const {
  expect,
} = chai;

const REDISEARCH_INDEX_NAME = 'doctorsIndex';
const REDISEARCH_PREFIX = 'doctor:';

const populateRedisWithData = (redis, pathToDoctorsJSON) => new Promise((resolve, reject) => {
    const redisCommandsStream = doctorsJsonToRedisCommands(pathToDoctorsJSON, REDISEARCH_PREFIX);
    const handleRedisCommand = async (command) => redis.rawCallAsync(command);

    redisCommandsStream.on('data', handleRedisCommand);
    redisCommandsStream.once('close', resolve);
    redisCommandsStream.once('error', reject);
});
const clearRedisData = (redis) => redis.rawCallAsync(['FLUSHALL', 'ASYNC']);
const createRediSearchIndex = async (redis) => {
  return redis.rawCallAsync([
    'FT.CREATE',
    REDISEARCH_INDEX_NAME,
    'ON',
    'HASH',
    'PREFIX',
    '1',
    REDISEARCH_PREFIX,
    'SCHEMA',
    'slug',
    'TAG',
    'SORTABLE',
    'name',
    'TEXT',
    'SORTABLE',
    'city',
    'TAG',
    'SORTABLE',
    'country',
    'TAG',
    'SORTABLE',
    'quno_score_number',
    'NUMERIC',
    'SORTABLE',
    'ratings_average',
    'NUMERIC',
    'SORTABLE',
    'treatments_last_year',
    'NUMERIC',
    'SORTABLE',
    'years_experience',
    'NUMERIC',
    'SORTABLE',
    'base_price',
    'NUMERIC',
    'SORTABLE',
    'avatar_url',
    'TEXT',
  ]);
};
const dropRediSearchIndex = async (redis) => redis.rawCallAsync(['FT.DROPINDEX', REDISEARCH_INDEX_NAME]);

describe('LibData', () => {
  const redisEventPromise = (redis, event) => new Promise((resolve) => redis.once(event, resolve));
  const doctorsJson = resolvePath('../../db/seed/doctors.json');
  const redisOptions = Object.freeze({
    host: '127.0.0.1',
    port: 6379,
    maxRetries: 0,
    db: 0,
    autoConnect: false,
    doNotSetClientName: false,
    doNotRunQuitOnEnd: false,
  });
  let redisInstance = null;

  before(async () => {
    redisInstance = new Redis(redisOptions);
    redisInstance.connect();

    await Promise.all([
      redisEventPromise(redisInstance, 'ready'),
      redisEventPromise(redisInstance, 'connect'),
    ]);

    expect(redisInstance.ready);
    expect(redisInstance.readyFirstTime);

    await createRediSearchIndex(redisInstance);

    return populateRedisWithData(redisInstance, doctorsJson);
  });

  after(async () => {
    await dropRediSearchIndex(redisInstance);
    await clearRedisData(redisInstance);
    await redisInstance.end();
    await redisEventPromise(redisInstance, 'end');

    expect(redisInstance.ready === false);
    expect(redisInstance.destroyed === true);

    redisInstance = null;
  });

  it('should return the total number of doctors', async () => {
    const doctorsNumber = await getDoctorsNumber(redisInstance, REDISEARCH_INDEX_NAME);

    expect(Number.isInteger(doctorsNumber)).to.be.true;
  });

  it('should get all the doctors from the DB', async () => {
    const query = Object.freeze({
      limit: LIMIT_MAX_VALUE,
      offset: 0,
      orderBy: {},
    });
    const doctors = await getDoctors(redisInstance, REDISEARCH_INDEX_NAME, query);

    expect(doctors.length > 0).to.be.true;
  }).timeout(0);

  it('should get a paginated list of doctors', async () => {
    const pageSize = 3;
    let currentPage = 0;
    let doctors = null;

    do {
      const pageQuery = Object.freeze({
        limit: pageSize,
        offset: currentPage * pageSize,
        orderBy: {},
      });

      doctors = await getDoctors(redisInstance, REDISEARCH_INDEX_NAME, pageQuery);
      currentPage += 1;
    } while (doctors.length > 0);
  });

  it(`should order doctors list by the "quno_score_number" field ${SORT_ORDER.ASC}`, async () => {
    const query = Object.freeze({
      limit: LIMIT_MAX_VALUE,
      offset: 0,
      orderBy: {
        quno_score_number: SORT_ORDER.ASC,
      },
    });
    const doctors = await getDoctors(redisInstance, REDISEARCH_INDEX_NAME, query);

    expect(doctors.length > 0).to.be.true;

    doctors.map((doctor) => doctor.quno_score_number).forEach((quno_score_number, index, array) => {
      if (index < array.length -1) {
        expect(quno_score_number <= array[index + 1]).to.be.true;
      }
    });
  });
});
