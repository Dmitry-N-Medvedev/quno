import Parser from 'stream-json/Parser.js';
import {
  createReadStream,
} from 'fs';
import {
  Transform,
} from 'stream';
import {
  pipeline,
} from 'stream';
import {
  nanoid,
} from 'nanoid';

export const doctorsJsonToRedisCommands = (inputFilePath = null) => {
  let object = null;
  let currentKey = null;

  const parser = new Parser({
    objectMode: true,
  });

  const toRedisCommandsStream = new Transform({
    objectMode: true,
  });

  toRedisCommandsStream._transform = function doTransform (doctor, encoding, callback) {
    callback(null, ['HMSET', `doctor:${nanoid(10)}`, ...Object.entries(doctor).flat()]);
  };

  parser.on('data', function handleData (data) {
    switch (data.name) {
      case 'startObject': {
        object = {};

        break;
      }
      case 'endObject': {
        toRedisCommandsStream.write(object);

        object = null;
        currentKey = null;

        break;
      }
      case 'keyValue': {
        currentKey = data.value;

        break;
      }
      case 'stringValue': {
        object[currentKey] = data.value;

        break;
      }
      case 'numberValue': {
        object[currentKey] = Number(data.value);

        break;
      }
      default: {
        break;
      }
    }
  });

  parser.on('close', () => {
    toRedisCommandsStream.end();
  });

  // return toRedisCommandsStream;

  pipeline(
    createReadStream(inputFilePath),
    parser,
    (error) => {
      if (error) {
        console.error(error);
      }
    },
  );

  return toRedisCommandsStream;
};
