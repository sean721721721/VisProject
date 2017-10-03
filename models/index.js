/* eslint-disable */
module.exports = function (app) {
    var files = ["post"];
    files.forEach(function (file) {
        require("./" + file)(app);
    });
};