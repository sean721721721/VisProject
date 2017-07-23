/* eslint-disable */
var fs = require('fs');

var callback = function callback(req, res) {
  fs.readFile('./data/148475335184300-2017-1-16.json', 'UTF-8', function (err, res0) {
    if (err) throw err;
    console.log(res0);
    res.send(res0);
  });
}

var exports = module.exports = {};
exports.callback = callback;