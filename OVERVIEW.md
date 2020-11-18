# Overview

[![Build Status](https://travis-ci.com/Dmitry-N-Medvedev/quno.svg?branch=main)](https://travis-ci.com/Dmitry-N-Medvedev/quno)
[![Maintainability](https://api.codeclimate.com/v1/badges/527e94d184b1094f44be/maintainability)](https://codeclimate.com/github/Dmitry-N-Medvedev/quno/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/527e94d184b1094f44be/test_coverage)](https://codeclimate.com/github/Dmitry-N-Medvedev/quno/test_coverage)
[![Coverage Status](https://coveralls.io/repos/github/Dmitry-N-Medvedev/quno/badge.svg?branch=main)](https://coveralls.io/github/Dmitry-N-Medvedev/quno?branch=main)

> Since we want you to feel a bit of our stack, we initialized the challenge code base with a small boilerplate that use these technologies. So feel free to start from there.
> However, it is not mandatory. Please feel free to use whatever tools you feel like are the best ones for the job and the ones you are most comfortable with.

## On technical requirements

> You are expected to use NodeJS and Typescript

This piece of software is based upon NodeJS for sure. But. It contains no code in Typescript. Give me please a second to explain this.

Typescript is definitely the way to go - all that type safety at development time and stuff. Unfortunately for me, I was never required to use Typescript, hence you will see plain javascript only. Sorry about this.

On the other hand, the codebase can be converted seamlessly to Typescript should need arise.

> You are expected to describe how to deploy your application (**no need to think about database deployment - the database is expected to be accessed through a connection string passed as an ENV Var**)

At the moment of writing there is no *how to deploy*, but the options are:

1. deploy the Redis + RediSearch to a docker container
2. deploy the application to a separate container
3. deploy the Nginx in front of the application
   1. setup caching
4. knit the application with the database via the ENV

A way better approach would be to use the unikernel solution, rather than the docker. I would recommend to go for the [NanoVMS](https://ops.city/). There are good technical reasons behind it. Please see the [why](https://ops.city/why) for an overview.

> You are expected to use a serverless technology of your choice (AWS Lambda, Google Cloud Functions, Azure Functions, etc) and define a proper local development process.

Even though I did play with the AWS Lambda in the past, I am far from being an expert in it. So for now I decided to stick to what I have already successfully used. Which should not sound like I am reluctant to give it a try, of course. Quite on the contrary - I would definitely spend time to master it all given a chance to.

> You are expected to use a SQL database of your choice.

As you can tell from the [libdata](src/libdata/README.md), there is no SQL database involved. [Redis](https://redis.io/) + [RediSearch 2.0](https://github.com/RediSearch/RediSearch) are used exclusively.

There are (I believe) reasons behind this:

1. the nature of data being manipulated requires no relational functionality.
   1. it does however involves schema (have a look at [specs-setup-teardown.mjs](src/specs/specs-setup-teardown.mjs))
   2. tailoring the schema to your needs requires *way less* fidgeting, than a relational schema would require
      1. changing the *search index schema* does not force you to change the underlaying data
      2. changing the data does not force you to change the *search index schema*
      3. you can have more than one *search index schema* for the same data if you will (kind of a view on data)
2. any SQL database (on the same hardware) is tangibly slower than Redis + RediSearch.
   1. I should probably have put some links to *Redis vs whatever* speed comparisons. Will do it later.

In a real project, I would definitely use a relational database as the long-term data storage. The data would be read from that database, ETL'ed to Redis [protocol](https://redis.io/topics/protocol) and pushed to the Redis database.

A change to the data in the Redis would be propagated back to the relational database eventually.

> You are free to use any testing framework you want. You don't need to test everything in your code. The minimum we expect is a unit test of the POST endpoint.

I use a combination of [mocha](https://mochajs.org/) + [chai](https://www.chaijs.com/api/bdd/).

You are welcome to peek into [src/libdata/specs/LibData.spec.mjs](src/libdata/specs/LibData.spec.mjs), [src/libapiserver/specs/LibApiServer.spec.mjs](src/libapiserver/specs/LibApiServer.spec.mjs), and [src/specs/specs-setup-teardown.mjs](src/specs/specs-setup-teardown.mjs) to see them in action.

You will not see that *everything* is covered with tests though.

> Our production database is terrible at dealing with writes, although very good in dealing with reads. It can have a write-latency of up to 1 second. Therefore, you have to come up with a good solution to the `POST /doctors` endpoint to return responses within the time that product wants.

This has not been addressed in the code. Generally, my approach would be - fix database latency in the first place to not be forced to introduce code that has to compensate for it. It is an architectural realm, rather than anything else.

On the other hand, if the workflow of saving a doctor to the database, for some reason, cannot take less time than 1 second, we could come up with something like two-phase action, where:

A POST is made to the Api Server which immediately returns with the following structure:

```json
{
  "token": "ebefe9bc-d78c-48e2-969e-cf0f4fd9dada",
  "interval": 100,
}
```

where:

* the `token` is the id of the workflow responsible to write to the database
* the `interval` is the number of milliseconds the client code should check back to see if the workflow has completed

After the `interval` has elapsed the client code would call the Api Server to learn the status of the workflow.

> (Optional) Protect the endpoints with an API Key.

Not implemented.

## The stack

1. node@15.2.1
2. pnpm@5.12.0
3. Redis + RediSearch 2.0
4. [uWebsockets.js](https://github.com/uNetworking/uWebSockets.js) as the application server library/framework (instead of express.js and alternatives) - this is the fastest web framework available for NodeJS nowadays.

## How to see it in action

1. please install the latest NodeJS (as of the moment of writing it is the `15.2.1` version)
2. please install the magnificient [pnpm](https://pnpm.js.org/en/installation) package manager ( and save yourself hundreds of megabytes of your disk space)
3. please [install](https://redis.io/download) the Redis database
4. please install the [RediSearch 2.0](https://redislabs.com/blog/getting-started-with-redisearch-2-0/) module
5. in the project root directory run the following command: `pnpm --recursive install`
6. in the project root directory run `pnpm --recursive run test` to verify all the tests complete without errors

> **NOTE**: you can have the Redis + RediSearch 2.0 combination running in a docker container as described in the [https://redislabs.com/blog/getting-started-with-redisearch-2-0/](https://redislabs.com/blog/getting-started-with-redisearch-2-0/) article. I have them both running directly on my laptop.

## Where to get the source code

This project is published on [github](https://github.com/Dmitry-N-Medvedev/quno).

> **NOTE**: the project is being built and tested on travis-ci.
> You will see that the build is failing.
> The reason for that is I still cannot figure out why loading RediSearch into the Redis fails on the travis-ci.
> As soon as I learn how to do it properly the failing build will be fixed.