import Redis from 'redis-fast-driver';

let redis = null;

import {
  doctorsJsonToRedisCommands,
} from './helpers/doctorsJsonToRedisCommands.mjs';

const redisEventPromise = (redis, event) => new Promise((resolve) => redis.once(event, resolve));

const createRediSearchIndex = async (redis, searchIndex, searchPrefix) => {
  return redis.rawCallAsync([
    'FT.CREATE',
    searchIndex,
    'ON',
    'HASH',
    'PREFIX',
    '1',
    searchPrefix,
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
const populateRedisWithData = (redis, searchPrefix, pathToDoctorsJSON) => new Promise((resolve, reject) => {
  const redisCommandsStream = doctorsJsonToRedisCommands(pathToDoctorsJSON, searchPrefix);
  const handleRedisCommand = async (command) => redis.rawCallAsync(command);

  redisCommandsStream.on('data', handleRedisCommand);
  redisCommandsStream.once('close', resolve);
  redisCommandsStream.once('error', reject);
});
const clearRedisData = (redis) => redis.rawCallAsync(['FLUSHDB']);
const dropRediSearchIndex = async (redis, index) => {
  try {
    await redis.rawCallAsync(['FT.DROPINDEX', index]);
  } catch {} finally {
    return Promise.resolve();
  }
};
const initRedis = (redisOptions) => {
  if (redis !== null) {
    return Promise.resolve();
  }

  redis = new Redis(redisOptions);
  redis.connect();

  return Promise.all([
    redisEventPromise(redis, 'ready'),
    redisEventPromise(redis, 'connect'),
  ]);
};

export const setup = async (redisOptions, searchIndex, searchPrefix, doctorsJson) => {
  await initRedis(redisOptions);
  await createRediSearchIndex(redis, searchIndex, searchPrefix);
  await populateRedisWithData(redis, searchPrefix, doctorsJson);

  return redis;
};

export const clean = async (searchIndex) => {
  await dropRediSearchIndex(redis, searchIndex);
  await clearRedisData(redis);
  await redis.end();
  await redisEventPromise(redis, 'end');

  redis = null;
};
