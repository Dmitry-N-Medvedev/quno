export const arrayToObject = (array = null) => {
  if (array === null) {
    throw new ReferenceError('array is undefined');
  }

  if (Array.isArray(array) === false) {
    throw new TypeError('array is not of Array type');
  }

  if (array.length === 0) {
    return Object.create(null);
  }

  const result = {};

  for (let i = 0; i < array.length; i += 2) {
    result[array[i]] = array[i + 1];
  }

  return Object.freeze(result);
};
