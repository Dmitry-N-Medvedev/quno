const LIMIT_MAX_VALUE = 1000000;

/**
 * This should return the list of all doctors, with ordering, sorting and pagination capabilities.
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
    orderBy: {
      field = null,
    }
  } = query;

  // FT.SEARCH idx:movie "war" RETURN 3 title release_year rating
  // FT.SEARCH idx:movie "*" LIMIT 0 0

  const command = [
    'FT.SEARCH',
    index,
    '*',
    'LIMIT',
    offset,
    limit,
  ];

  console.debug({
    command,
  });

  return redis.rawCallAsync(command);
};
