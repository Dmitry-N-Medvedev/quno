import {
  arrayToObject,
} from './arrayToObject.mjs';
import {
  QunoscoreEnum,
} from '../constants/QunoscoreEnum.mjs';

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

const calculateQunoscoreText = (doctorStruct) => {
  const qunoScoreNumber = doctorStruct.quno_score_number ?? 0;

  return (Object.entries(QunoscoreEnum).find(([qunoscoreText, [lo, hi]]) => (qunoScoreNumber >= lo && qunoScoreNumber <= hi)) ?? ['N/A'])[0];
};

export const deserializeDoctor = (doctorId = null, doctorFields = null) => {
  const doctorStruct = normalizeFieldTypes(
    arrayToObject(doctorFields),
  );
  return Object.freeze({
    id: doctorId,
    ...doctorStruct,
    ...{
      qunoscoreText: calculateQunoscoreText(doctorStruct),
    },
  });
};
