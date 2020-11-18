import {
  resolve as resolvePath,
} from 'path';
import mocha from 'mocha';
import chai from 'chai';
import {
  nanoid,
} from 'nanoid';
import got from 'got';
import {
  setup,
  clean,
} from '../../specs/specs-setup-teardown.mjs';
import {
  start,
  stop,
  isRunning,
} from '../LibApiServer.mjs';
import {
  SORT_ORDER,
} from '@dmitry-n-medvedev/quno-libdata/constants/SORT_ORDER.mjs';
import {
  LIMIT_MAX_VALUE,
} from '@dmitry-n-medvedev/quno-libdata/constants/LIMIT_MAX_VALUE.mjs';

import {
  getDoctors,
} from '@dmitry-n-medvedev/quno-libdata';

const {
  describe,
  it,
  before,
  after,
} = mocha;
const {
  expect,
} = chai;

describe('LibApiServer', () => {
  const libApiServerConfig = Object.freeze({
    redis: {
      host: '127.0.0.1',
      port: 6379,
      maxRetries: 0,
      db: 0,
      autoConnect: false,
      doNotSetClientName: false,
      doNotRunQuitOnEnd: false,
    },
    uWs: {
      port: 9001,
    },
    constants: {
      REDISEARCH_INDEX_NAME: 'doctorsIndex',
      REDISEARCH_PREFIX: 'doctor',
    },
  });
  const GOT_DONT_RETRY_ON_FAILURE = 0;
  const REDISEARCH_INDEX_NAME = 'doctorsIndex';
  const REDISEARCH_PREFIX = 'doctor';
  const doctorsJson = resolvePath('../../db/seed/doctors.json');

  let redisInstance = null;

  before(async () => {
    redisInstance = await setup(libApiServerConfig.redis, REDISEARCH_INDEX_NAME, REDISEARCH_PREFIX, doctorsJson);
    return start(libApiServerConfig);
  });

  after(async () => {
    await stop();
    return clean(REDISEARCH_INDEX_NAME);
  });

  it('this endpoint should return the list of all doctors', async () => {
    const searchParams = new URLSearchParams([
      ['limit', '0'],
      ['offset', '0'],
      ['orderBy', `quno_score_number:${SORT_ORDER.ASC}`],
    ]);
    try {
      const { body } = await got(`http://localhost:${libApiServerConfig.uWs.port}/doctors`, {
        retry: GOT_DONT_RETRY_ON_FAILURE,
        searchParams,
      });
  
      expect(body.length > 0).to.be.true;
    } catch (error) {
      console.log(error);

      throw error;
    }
  });

  it('this endpoint should return the doctor represented by the id', async () => {
    const searchParams = new URLSearchParams([
      ['limit', 0],
      ['offset', 0],
      ['orderBy', undefined],
    ]);
    const getAllQuery = Object.freeze({
      limit: LIMIT_MAX_VALUE,
      offset: 0,
      orderBy: {},
    });
    const doctors = await getDoctors(redisInstance, REDISEARCH_INDEX_NAME, getAllQuery);
    const id = (doctors[0]).id;

    try {
      const {
        body
      } = await got(`http://localhost:${libApiServerConfig.uWs.port}/doctors/${id}`, {
        retry: GOT_DONT_RETRY_ON_FAILURE,
        searchParams,
      });

      expect(body.length > 0).to.be.true;
    } catch (error) {
      console.log(error);

      throw error;
    }
  });

  it('this endpoint should simply receive the payload of a doctor, validate and add it to the database', async () => {
    const name = `Dr. ${nanoid(3)} ${nanoid(5)}`;
    const newDoctor = Object.freeze({
      slug: name.replace(/\s+/g, '-').replace(/\W+/g, '-').toLowerCase(),
      name,
      city: nanoid(10),
      country: nanoid(10),
      quno_score_number: Math.random() * 10,
      ratings_average: Math.random() * 5,
      treatments_last_year: Math.random() * 365,
      years_experience: Math.random() * 15,
      base_price: Math.random() * 1500,
      avatar_url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    });

    try {
      const {
        body
      } = await got.post(`http://localhost:${libApiServerConfig.uWs.port}/doctors`, {
        json: JSON.stringify(newDoctor),
      });

      const {
        id,
      } = JSON.parse(body);

      expect(id.length > 0).to.be.true;
    } catch (error) {
      console.log(error);

      throw error;
    }
  });
});
