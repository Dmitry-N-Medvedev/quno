import {
  arrayToObject,
} from './arrayToObject.mjs';

const normalizeFieldTypes = (object = null) => {
  if (object === null) {
    throw new ReferenceError('object is undefined');
  }

  if (Object.keys(object).length === 0) {
    return Object.create(null);
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(object).map(([key, value]) => [key, Number(value) || value]),
    ),
  );
};

export const deserializeDoctor = (doctorId = null, doctorFields = null) => {
  return Object.freeze({
    id: doctorId,
    ...normalizeFieldTypes(
      arrayToObject(doctorFields),
    ),
  });
};
