import {
  LIMIT_MAX_VALUE,
} from './constants/LIMIT_MAX_VALUE.mjs';
import {
  deserializeDoctor,
} from './helpers/deserializeDoctor.mjs';
/**
 * Returns the number of doctors in the database.
 * 
 * @param redis - Redis instance.
 * @param index - Redis search index name.
 */
export const getDoctorsNumber = async (redis = null, index = null) => {
  if ([redis, index].includes(null)) {
    throw new ReferenceError('redis || index are undefined');
  }

  const command = [
    'FT.SEARCH',
    index,
    '*',
    'LIMIT',
    0,
    0,
  ];

  return (await redis.rawCallAsync(command))[0] ?? 0;
};

const orderByClause = (orderByObject = null) => {
  if (Object.keys(orderByObject).length === 0) {
    return [null];
  }

  return Object.freeze ([
    'SORTBY',
    ...Object.entries(orderByObject),
  ].flat());
};

/**
 * This should return the list of all doctors, with ordering, sorting and pagination capabilities.
 * 
 * @param redis - Redis instance.
 * @param index - Redis search index name.
 * 
 * The following parameters should be accepted via query parameters:
 * @param limit - max number of records to return
 * @param offset - number of records to skip when returning the results
 * @param orderBy - field to order the results by. It should accept only -1 (for descending sorting) and 1 (ascending sorting)
 */
export const getDoctors = async (redis = null, index = null, query = null) => {
  if ([redis, index, query].includes(null)) {
    throw new ReferenceError('redis || index || query are undefined');
  }

  const {
    limit = LIMIT_MAX_VALUE,
    offset = 0,
    orderBy = null,
  } = query;

  const command = [
    'FT.SEARCH',
    index,
    '*',
    ...orderByClause(orderBy),
    'LIMIT',
    offset,
    limit,
  ].filter((statement) => statement !== null);

  const response = await redis.rawCallAsync(command);
  const result = [];

  for (let i = 1; i < response.length; i += 2) {
    const doctorId = response[i];
    const doctorFields = response[i + 1];

    result.push(deserializeDoctor(doctorId, doctorFields));
  }

  return Object.freeze(result);
};

export const getDoctor = async (redis = null, id = null) => {
  if ([redis, id].includes(null)) {
    throw new ReferenceError('redis || id is undefined');
  }

  const command = [
    'HGETALL',
    id,
  ];

  return deserializeDoctor(id, (await redis.rawCallAsync(command)));
};

