import {
  config,
} from 'dotenv';
import {
  start,
  stop,
  isRunning,
} from '@dmitry-n-medvedev/quno-libapiserver/LibApiServer.mjs';

config();

const handleSignal = () => {
  stop().then(() => {
    console.debug('\n\nexiting now\n\n');

    process.exit(0);
  });
};

const libApiServerConfig = Object.freeze({
  redis: {
    host: process.env.APISERVER_REDIS_HOST,
    port: parseInt(process.env.APISERVER_REDIS_PORT, 10),
    maxRetries: parseInt(process.env.APISERVER_REDIS_MAX_RETRIES, 10),
    db: parseInt(process.env.APISERVER_REDIS_DB, 10),
    autoConnect: false,
    doNotSetClientName: false,
    doNotRunQuitOnEnd: false,
  },
  uWs: {
    port: parseInt(process.env.APISERVER_UWS_PORT, 10),
  },
  constants: {
    REDISEARCH_INDEX_NAME: process.env.APISERVER_REDISEARCH_INDEX_NAME,
    REDISEARCH_PREFIX: process.env.APISERVER_REDISEARCH_PREFIX,
  },
});

process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);

await start(libApiServerConfig);

console.debug(`started on ${libApiServerConfig.uWs.port}`);