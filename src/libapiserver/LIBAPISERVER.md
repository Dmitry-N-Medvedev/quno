# libApiServer

The endpoint URLs are expected to be the following:

1. `GET /doctors`, which should return the list of all doctors, with ordering, sorting and pagination capabilities.
2. `GET /doctors/{id}`, which should return the details of the doctor identified by the `id`
3. `POST /doctors`, which should save the doctor represented by the payload in the body in the database.

## `GET /doctors`

This endpoint should return the list of all doctors, with ordering, sorting and pagination capabilities. The following parameters should be accepted via query parameters:

* `limit`: max number of records to return
* `offset`: number of records to skip when returning the results
* `orderBy:{field}`: field to order the results by. It should accept only -1 (for descending sorting) and 1 (ascending sorting)

## `GET /doctors/{id}`

This endpoint should return the doctor represented by the id `id`.

## `POST /doctors`

This endpoint should simply receive the payload of a doctor, validate and add it to the database.
