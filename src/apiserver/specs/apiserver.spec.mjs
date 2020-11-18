import mocha from 'mocha';
import chai from 'chai';

const {
  describe,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('apiserver', () => {
  it('should just succeed', async () => {
    return expect(true).to.be.true;
  });
});

