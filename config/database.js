const MongoClient = require("mongodb").MongoClient;

const dbConnect = function () {
  MongoClient.connect(process.env.DB_STRING)
    .then((client) => {
      console.log("Connected to database");
      db = client.db("drinks_cabinet");
    })
    .catch((error) => console.log(error));
};

module.exports = dbConnect;
