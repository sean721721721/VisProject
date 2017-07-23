/* eslint-disable */
var fs = require('fs');
var nodejieba = require("nodejieba");


var path = "../data/saveposts_2014-03-01_2014-04-01_136845026417486_4-10-(17)-2017.json";
var data = JSON.parse(fs.readFileSync(path, 'UTF-8'));

var text = data.data[0].message;
console.log(text)
var result = nodejieba.cut(text);
console.log(result);

