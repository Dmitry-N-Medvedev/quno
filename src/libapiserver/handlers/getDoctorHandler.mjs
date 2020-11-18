import {
  getDoctor,
} from '@dmitry-n-medvedev/quno-libdata';

export const getDoctorHandler = async (res = null, req = null, redis = null, index = null) => {
  if ([res, req, redis, index].includes(null) === true) {
    throw new ReferenceError('res || req || redis || index is undefined');
  }

  res.aborted = false;

  res.onAborted(() => {
    res.aborted = true;
  });

  if (res.aborted === false) {
    res.end(JSON.stringify(await getDoctor(redis, req.getParameter(0) ?? '')));
  } else {
    res.end(JSON.stringify([]));
  }
};