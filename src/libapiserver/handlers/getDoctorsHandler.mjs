import {
  getDoctors,
} from '@dmitry-n-medvedev/quno-libdata';
import {
  LIMIT_MAX_VALUE,
} from '@dmitry-n-medvedev/quno-libdata/constants/LIMIT_MAX_VALUE.mjs';

const QUERY = Object.freeze({
  limit: LIMIT_MAX_VALUE,
  offset: 0,
  orderBy: {},
});

const parseOrderByClause = (orderBySearchParam = null) => {
  if (orderBySearchParam === null) {
    return Object.freeze({});
  }

  const [field, order] = orderBySearchParam.split(':');

  return Object.freeze({
    [field]: order,
  });
}

export const getDoctorsHandler = async (res = null, req = null, redis = null, index = null) => {
  if ([res, req, redis, index].includes(null) === true) {
    throw new ReferenceError('res || req || redis || index is undefined');
  }

  const query = Object.freeze({
    ...QUERY,
    ...{
      limit: Number(req.getQuery('limit')) ?? 0,
      offset: Number(req.getQuery('offset')) ?? 0,
      orderBy: parseOrderByClause(req.getQuery('orderBy')),
    },
  });

  res.aborted = false;

  res.onAborted(() => {
    res.aborted = true;
  });
  
  if (res.aborted === false) {
    res.end(JSON.stringify(await getDoctors(redis, index, query)));
  } else {
    res.end(JSON.stringify([]));
  }
};
