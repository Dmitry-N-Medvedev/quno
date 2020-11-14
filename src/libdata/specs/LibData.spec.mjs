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
  getDoctors,
} from '../LibData.mjs';

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

  it('should getDoctors', async () => {
    const query = Object.freeze({
      limit: 3,
      offset: 0,
      orderBy: {
        field: null,
      },
    });
    const doctors = await getDoctors(redisInstance, REDISEARCH_INDEX_NAME, query);

    console.debug({doctors});

    expect(Array.isArray(doctors));
  }).timeout(0);
});
