/* eslint-disable */
"use strict";

var dbm;
var type;
var seed;
var fs = require("fs");
var path = require("path");
var Promise;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function (db) {
  var filePath = path.join(
    __dirname,
    "sqls",
    "20201109125509-initial-migration-up.sql"
  );
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
      if (err) return reject(err);
      console.log("received data: " + data);

      resolve(data);
    });
  })
    .then(function (data) {
      return db.runSql(data);
    })

    .then(function () {
      const doctors = require("../seed/doctors.json");
      return Promise.all(
        doctors.map(async (doctor) =>
          db.runSql(`
        INSERT INTO doctors
          (${Object.keys(doctor)})
        VALUES
          (${Object.values(doctor).map((val) =>
            typeof val === "string" ? `'${val}'` : val
          )})
      `)
        )
      );
    });
};

exports.down = function (db) {
  var filePath = path.join(
    __dirname,
    "sqls",
    "20201109125509-initial-migration-down.sql"
  );
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
      if (err) return reject(err);
      console.log("received data: " + data);

      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports._meta = {
  version: 1,
};
