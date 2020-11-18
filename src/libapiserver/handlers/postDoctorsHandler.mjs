import {
  saveDoctor,
} from '@dmitry-n-medvedev/quno-libdata';

const readJson = (res, cb, err) => {
  let buffer;

  res.onData((ab, isLast) => {
    let chunk = Buffer.from(ab);

    if (isLast) {
      let json = null;

      if (buffer) {
        try {
          json = JSON.parse(Buffer.concat([buffer, chunk]));
        } catch (e) {
          res.close();

          return;
        }

        cb(json);
      } else {
        try {
          json = JSON.parse(chunk);
        } catch (e) {
          res.close();

          return;
        }
        cb(json);
      }
    } else {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk]);
      } else {
        buffer = Buffer.concat([chunk]);
      }
    }
  });

  res.onAborted(err);
};

export const postDoctorsHandler = async (res = null, req = null, redis = null, searchPrefix = null) => {
  if ([res, req, redis, searchPrefix].includes(null) === true) {
    throw new ReferenceError('res || req || redis || searchPrefix is undefined');
  }

  const result = Object.freeze({
    id: null,
  });

  res.aborted = false;

  res.onAborted(() => {
    res.aborted = true;
  });
  
  if (res.aborted === false) {
    readJson(res, async (doctor) => {
      res.end(
        JSON.stringify(
          Object.assign(
            Object.create(null),
            result,
            {
              id: await saveDoctor(redis, JSON.parse(doctor), searchPrefix),
            },
          )
        )
      );
    });
  } else {
    res.end(JSON.stringify(result));
  }
};
