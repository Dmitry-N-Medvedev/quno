# Quno Backend Code Challenge


## Introduction

Hey there! Welcome to Qunomedical's Backend code challenge. We are happy you are interested in our company and are taking your time to solve this challenge.

The primary goal of this challenge is to assess, without using too much of your time, how comfortable you are with basic aspects of Backend Software development and Software development in general, especially within the context of Qunomedical's tech stack.

We also want to use this challenge as an opportunity to get you in touch with a little bit of our tech stack and the problems we try to solve here.

Feel free to give your opinion and suggestions about it.

## Deadline

You have a week to return this challenge to our HR department, however, this challenge was designed not to take much more than a few hours (hopefully). We are mindful of your time.

In order to deliver the challenge, simply send it zipped via email to our HR representative or push it to a private git repository with access to https://github.com/araujoigor

## Objectives

As mentioned, we want to assess your expertise as a developer and give you a small taste of what we do here at Quno.

Here is what you need to deliver:

1. A backend application that follows product and technical requirements.
2. A document briefly explaining how to deploy your code and also explaining your decisions, especially if you deviated from any specific point on the specs.

This is how we will be grading your challenge:

1. Did you follow the specs? If not, did you have a good reason for it?
2. How did you fill the gaps in the specs?
3. How easy is to follow your code (clean, documented, good commit messages, etc)
4. Is your code tested? **PS: You don't need to test everything. We just want to make sure you are comfortable writing tests.**
5. Is it easy to deploy your solution to the cloud provider of your choice? **(You don't need to think about Database deployment, only application deployment - the database is assumed to be available through a connection string given as an ENV Variable)**.
5. How you communicate difficulties or feedback back to the Product team.

## Specs

Here you find the specs of the project.

### **Product requirements**

Here at Quno, we want to connect the best doctors with our patients so they can have high-quality, affordable treatments. So the customers must know the doctors as best as they can. For this, we want to create an API that allows our frontend clients to query for doctors in the system and to create new doctors if need be.

The endpoint URLs are expected to be the following:

1. `GET /doctors`, which should return the list of all doctors, with ordering, sorting and pagination capabilities.
2. `GET /doctors/{id}`, which should return the details of the doctor identified by the `id`
3. `POST /doctors`, which should save the doctor represented by the payload in the body in the database.

#### `GET /doctors`

This endpoint should return the list of all doctors, with ordering, sorting and pagination capabilities. The following parameters should be accepted via query parameters:

* `limit`: max number of records to return
* `offset`: number of records to skip when returning the results
* `orderBy:{field}`: field to order the results by. It should accept only -1 (for descending sorting) and 1 (ascending sorting)

#### `GET /doctors/{id}`

This endpoint should return the doctor represented by the id `id`.

#### `POST /doctors`

This endpoint should simply receive the payload of a doctor, validate and add it to the database.

**This endpoint should not take more than 300ms to return a response. Please check the technical requirements for more information about it.**

**IMPORTANT:** Doctors should have a dynamic property called `qunoscoreText`. It is the text representation of the `qunoScoreNumber`. As of now, the mapping is the following (however, we don't want to store this in a datbase so we are able to change the mapping easily):

* `Excelent`: 9 <= `qunoScoreNumber` <= 10
* `Very Good`: 8 <= `qunoScoreNumber` < 9
* `Good`: 7 <= `qunoScoreNumber` < 8
* `Regular`: 6 <= `qunoScoreNumber` < 7
* `Bad`: 0 <= `qunoScoreNumber` < 6

### **Technical requirements**

1. You are expected to use NodeJS and Typescript (Typescript must be running on [strict](https://www.typescriptlang.org/tsconfig#strict) mode).
2. You are expected to describe how to deploy your application (**no need to think about database deployment - the database is expected to be accessed through a connection string passed as an ENV Var**)
3. You are expected to use a serverless technology of your choice (AWS Lambda, Google Cloud Functions, Azure Functions, etc) and define a proper local development process.
4. You are expected to use a SQL database of your choice.
5. You are free to use any testing framework you want. You don't need to test everything in your code. **The minimum we expect is a unit test of the POST endpoint.**
6. Our production database is terrible at dealing with writes, although very good in dealing with reads. It can have a write-latency of up to 1 second. Therefore, you have to come up with a good solution to the `POST /doctors` endpoint to return responses within the time that product wants.
7. (Optional) Protect the endpoints with an API Key.

The initial data for the doctors is given in the `db/migrations/seed` folder.

## Getting started

As explained below on the [Suggestions](#Suggestions) section, we already created a boiler-plate for you to work with (which you are free to change as we deem fit).

The boiler plate uses the [Serverless framework](https://serverless.com), with the [Serverless Offline plugin](https://github.com/dherault/serverless-offline), [docker-compose](https://docs.docker.com/compose/) with a `postgres:12-alpine` docker image, migration management with [db-migrate](https://db-migrate.readthedocs.io), eslint, and typescript.

In order to get started simply run the following:

1. Install and execute [Docker](https://www.docker.com/)
2. Run `yarn install` on the root of the project folder to install the dependencies.
3. Run `docker-compose` on the root of the project to start the database.
4. Run the migrations by executing `yarn db:migration up` (you can rollback the migration by running `yarn db:migration down`).
5. Run `yarn dev` to start the example server
6. Run `curl http://localhost:4000/dr-cayla-loftie --verbose` to test the example endpoint.

The migration already takes care of creating the `doctors` table and seeding it with some data. But you are free to change this setup as you feel like.

## Suggestions

Here at Quno we work with [Serverless](https://serverless.com), [AWS Lambda](https://aws.amazon.com/lambda/), [PostgreSQL](https://) and we love it. We believe these tools are very good for the problems we are trying to solve.

Since we want you to feel a bit of our stack, we initialized the challenge code base with a small boilerplate that use these technologies. So feel free to start from there. **However, it is not mandatory. Please feel free to use whatever tools you feel like are the best ones for the job and the ones you are most comfortable with.**

## Contact us

In case you have any doubts, please do not hesitate to contact our HR team, which will forward your message to us.

We wish you the best of luck!