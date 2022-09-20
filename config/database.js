const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

let connection = [];

establishConnection = function (callback) {
  MongoClient.connect(process.env.DB_STRING, function (err, db) {
    assert.equal(null, err);
    connection = db;
    console.log(`Connection established`);
    if (typeof callback === "function" && callback) callback(connection);
  });
};

function getConnection() {
  return connection;
}

module.exports = {
  establishConnection: establishConnection,
  getConnection: getConnection,
};
