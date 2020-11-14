import mocha from 'mocha';
import chai from 'chai';
import {
  resolve as resolvePath,
} from 'path';
import {
  doctorsJsonToRedisCommands,
} from '../helpers/doctorsJsonToRedisCommands.mjs';

const {
  describe,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('massInsert', () => {
  it('should produce redis commands in a stream', () => new Promise((resolve, reject) => {
    const doctorsJsonPath = resolvePath('../../db/seed/doctors.json');
    const redisCommandsStream = doctorsJsonToRedisCommands(doctorsJsonPath);
    const handleRedisCommand = (command) => {
      expect(command[0]).to.equal('HMSET');
    };

    redisCommandsStream.on('data', handleRedisCommand);
    redisCommandsStream.once('close', resolve);
    redisCommandsStream.once('error', reject);
  }));
});