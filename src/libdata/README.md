# LibData

It is a database adapter for Redis.

## API

1. `getDoctors` returns a list of all doctors, with ordering, sorting and pagination capabilities
2. `getDoctor` returns details of the doctor identified by the `id`
3. `saveDoctor` saves the doctor represented by the payload in the body in the database

### a doctor struct

```javascript
  {
    "slug": "dr-lay-raphael",
    "name": "Dr. Lay Raphael",
    "city": "Citampian",
    "country": "Indonesia",
    "quno_score_number": 8.5,
    "ratings_average": 4.8,
    "treatments_last_year": 2490,
    "years_experience": 15,
    "base_price": 1355.76,
    "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
  },
```

### getDoctors

This should return the list of all doctors, with ordering, sorting and pagination capabilities. The following parameters should be accepted via query parameters:

* `limit`: max number of records to return
* `offset`: number of records to skip when returning the results
* `orderBy:{field}`: field to order the results by. It should accept only -1 (for descending sorting) and 1 (ascending sorting)

### getDoctor

This should return the doctor represented by the id `id`.

### saveDoctor

This endpoint should simply receive the payload of a doctor, validate and add it to the database.

**This endpoint should not take more than 300ms to return a response. Please check the technical requirements for more information about it.**

**IMPORTANT:** Doctors should have a dynamic property called `qunoscoreText`. It is the text representation of the `qunoScoreNumber`. As of now, the mapping is the following (however, we don't want to store this in a datbase so we are able to change the mapping easily):

* `Excelent`: 9 <= `qunoScoreNumber` <= 10
* `Very Good`: 8 <= `qunoScoreNumber` < 9
* `Good`: 7 <= `qunoScoreNumber` < 8
* `Regular`: 6 <= `qunoScoreNumber` < 7
* `Bad`: 0 <= `qunoScoreNumber` < 6

## NOTE

The initial data for the doctors is given in the [doctors.json](db/../../../db/seed/doctors.json).
