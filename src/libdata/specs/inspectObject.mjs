import {
  inspect,
} from 'util';

export const inspectObject = (object) => {
  console.debug(
    inspect(object, {
      colors: true,
      depth: null,
      maxArrayLength: null,
      maxStringLength: null,
    }),
  );
};
