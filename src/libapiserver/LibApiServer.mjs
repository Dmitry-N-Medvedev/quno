import uWs from 'uWebSockets.js';
import Redis from 'redis-fast-driver';
import {
  getDoctorsHandler,
} from './handlers/getDoctorsHandler.mjs';
import {
  getDoctorHandler,
} from './handlers/getDoctorHandler.mjs';
import {
  postDoctorsHandler,
} from './handlers/postDoctorsHandler.mjs';

let CONFIG = null;
let SERVER = null;
let HANDLE = null;
let REDIS = null;

const redisEventPromise = (redis, event) => new Promise((resolve) => redis.once(event, resolve));

const connectToRedis = async (redisConfig) => {
  REDIS = new Redis(redisConfig);
  REDIS.connect();

  return Promise.all([
    redisEventPromise(REDIS, 'ready'),
    redisEventPromise(REDIS, 'connect'),
  ]);
};

const disconnectFromRedis = async () => {
  await REDIS.end();
  return redisEventPromise(REDIS, 'end');
};

export const isRunning = () => HANDLE !== null;

export const start = async (config = null) => {
  if (SERVER !== null) {
    return;
  }

  if (config === null) {
    throw new ReferenceError('config is undefined');
  }

  if (Object.keys(config).length === 0) {
    throw new TypeError('config is empty');
  }

  CONFIG = Object.freeze(Object.assign(Object.create(null), config));

  await connectToRedis(CONFIG.redis);

  const startUWS = () => new Promise((resolve, reject) => {
    SERVER = new uWs.App({})
      .get('/doctors', async (res, req) => getDoctorsHandler(res, req, REDIS, CONFIG.constants.REDISEARCH_INDEX_NAME))
      .get('/doctors/:id', async (res, req) => getDoctorHandler(res, req, REDIS, CONFIG.constants.REDISEARCH_INDEX_NAME))
      .post('/doctors', async (res, req) => postDoctorsHandler(res, req, REDIS, CONFIG.constants.REDISEARCH_PREFIX))
      .listen(CONFIG.uWs.port, (handle = null) => {
        if (handle === null) {
          return reject(new Error(`cannot listen on ${CONFIG.uWs.port} port`));
        }
  
        HANDLE = handle;

        return resolve();
      });
  });

  try {
    return startUWS();
  } catch (error) {
    throw error;
  }
};

export const stop = async () => {
  await disconnectFromRedis();

  if (HANDLE !== null) {
    uWs.us_listen_socket_close(HANDLE);

    HANDLE = null;
  }
};
