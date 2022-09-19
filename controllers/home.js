module.exports = {
  getIndex: (req, res) => {
    res.sendFile("./index.html");
  },
};
