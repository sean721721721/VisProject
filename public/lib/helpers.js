/* eslint-disable */
/*
//old setups for server
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
        result = "<a href=\"https://www.facebook.com/" + str[0] + "/posts/" + str[1] + "\">" + "postid: " + id + "</a>"
    }
    return result;
};

exports.count = function (array) {
    return array.length;
}
*/
(function () {
    var register = function (Handlebars) {

        var helpers = {
            // put all of your helpers inside this object
            UpperCase: function (msg) {
                return msg.toUpperCase();
            },

            toJSON: function (object) {
                return JSON.stringify(object);
            },

            toURL: function (id) {
                var str = id.split("_")
                if (str.length === 1) {
                    var result = "<a href=\"https://www.facebook.com/" + id + "\">" + "userid: " + id + "</a>"
                } else {
                    result = "<a href=\"https://www.facebook.com/" + str[0] + "/posts/" + str[1] + "\">" + "postid: " + id + "</a>"
                }
                return result;
            },

            count: function (array) {
                return array.length;
            },

            getPartialByName: function (name, data, options) {
                var template = Handlebars.partials[name];
                if (template) {
                    if (typeof template !== 'function') {
                        template = Handlebars.compile(template);
                    }
                    return template(data, options);
                }
            }
        };

        if (Handlebars && typeof Handlebars.registerHelper === "function") {
            // register helpers
            for (var prop in helpers) {
                Handlebars.registerHelper(prop, helpers[prop]);
            }
        } else {
            // just return helpers object if we can't register helpers here
            return helpers;
        }

    };

    // client
    if (typeof window !== "undefined") {
        // since all partials and templates precompiled into the same bucket, do this to allow partial lookups to work
        Handlebars.partials = Handlebars.templates;
        register(Handlebars);
    }
    // server
    else {
        module.exports.register = register;
        module.exports.helpers = register(null);
    }
})();