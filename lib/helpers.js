/* eslint-disable */
'use strict';

exports.UpperCase = function (msg) {
    return msg.toUpperCase();
};

exports.toJSON = function (object) {
    return JSON.stringify(object);
};

exports.toURL = function (id) {
    var str = id.split("_")
    if (str.length === 1) {
        var result = "<a href=\"https://www.facebook.com/" + id + "\">" + "userid: " + id + "</a>"
    } else {
        result = "<a href=\"https://www.facebook.com/" + str[0] + "/posts/" + str[1] + "\">" + "userid: " + id + "</a>"
    }
    return result;
};

exports.count = function (array) {
    return array.length;
}