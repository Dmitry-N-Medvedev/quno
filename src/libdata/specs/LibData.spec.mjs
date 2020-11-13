import mocha from 'mocha';
import chai from 'chai';

const {
  describe,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('LibData', () => {
  it('should pass a stub test', async () => {
    expect(true).to.be.true;
  });
});
