/**
 * A Twitter library in JavaScript
 *
 * @package   codebird
 * @version   2.6.0
 * @author    Jublo Solutions <support@jublo.net>
 * @copyright 2010-2015 Jublo Solutions <support@jublo.net>
 * @license   http://opensource.org/licenses/GPL-3.0 GNU Public License 3.0
 * @link      https://github.com/jublonet/codebird-php
 */

/* jshint curly: true,
          eqeqeq: true,
          latedef: true,
          quotmark: double,
          undef: true,
          unused: true,
          trailing: true,
          laxbreak: true */
/* global window,
          document,
          navigator,
          console,
          Ti,
          ActiveXObject,
          module,
          define,
          require */
(function (undefined) {
"use strict";

/**
 * Array.indexOf polyfill
 */
if (! Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0); i < this.length; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

/**
 * A Twitter library in JavaScript
 *
 * @package codebird
 * @subpackage codebird-js
 */
/* jshint -W098 */
var Codebird = function () {
/* jshint +W098 */

    /**
     * The OAuth consumer key of your registered app
     */
    var _oauth_consumer_key = null;

    /**
     * The corresponding consumer secret
     */
    var _oauth_consumer_secret = null;

    /**
     * The app-only bearer token. Used to authorize app-only requests
     */
    var _oauth_bearer_token = null;

    /**
     * The API endpoint base to use
     */
    var _endpoint_base = "https://api.twitter.com/";

    /**
     * The media API endpoint base to use
     */
    var _endpoint_base_media = "https://upload.twitter.com/";

    /**
     * The API endpoint to use
     */
    var _endpoint = _endpoint_base + "1.1/";

    /**
     * The media API endpoint to use
     */
    var _endpoint_media = _endpoint_base_media + "1.1/";

    /**
     * The API endpoint base to use
     */
    var _endpoint_oauth = _endpoint_base;

    /**
     * API proxy endpoint
     */
    var _endpoint_proxy = "https://api.jublo.net/codebird/";

    /**
     * The API endpoint to use for old requests
     */
    var _endpoint_old = _endpoint_base + "1/";

    /**
     * Use JSONP for GET requests in IE7-9
     */
    var _use_jsonp = (typeof navigator !== "undefined"
        && typeof navigator.userAgent !== "undefined"
        && (navigator.userAgent.indexOf("Trident/4") > -1
            || navigator.userAgent.indexOf("Trident/5") > -1
            || navigator.userAgent.indexOf("MSIE 7.0") > -1
        )
    );

    /**
     * Whether to access the API via a proxy that is allowed by CORS
     * Assume that CORS is only necessary in browsers
     */
    var _use_proxy = (typeof navigator !== "undefined"
        && typeof navigator.userAgent !== "undefined"
    );

    /**
     * The Request or access token. Used to sign requests
     */
    var _oauth_token = null;

    /**
     * The corresponding request or access token secret
     */
    var _oauth_token_secret = null;

    /**
     * The current Codebird version
     */
    var _version = "2.6.0";

    /**
     * Sets the OAuth consumer key and secret (App key)
     *
     * @param string key    OAuth consumer key
     * @param string secret OAuth consumer secret
     *
     * @return void
     */
    var setConsumerKey = function (key, secret) {
        _oauth_consumer_key = key;
        _oauth_consumer_secret = secret;
    };

    /**
     * Sets the OAuth2 app-only auth bearer token
     *
     * @param string token OAuth2 bearer token
     *
     * @return void
     */
    var setBearerToken = function (token) {
        _oauth_bearer_token = token;
    };

    /**
     * Gets the current Codebird version
     *
     * @return string The version number
     */
    var getVersion = function () {
        return _version;
    };

    /**
     * Sets the OAuth request or access token and secret (User key)
     *
     * @param string token  OAuth request or access token
     * @param string secret OAuth request or access token secret
     *
     * @return void
     */
    var setToken = function (token, secret) {
        _oauth_token = token;
        _oauth_token_secret = secret;
    };

    /**
     * Enables or disables CORS proxy
     *
     * @param bool use_proxy Whether to use CORS proxy or not
     *
     * @return void
     */
    var setUseProxy = function (use_proxy) {
        _use_proxy = !! use_proxy;
    };

    /**
     * Sets custom CORS proxy server
     *
     * @param string proxy Address of proxy server to use
     *
     * @return void
     */
    var setProxy = function (proxy) {
        // add trailing slash if missing
        if (! proxy.match(/\/$/)) {
            proxy += "/";
        }
        _endpoint_proxy = proxy;
    };

    /**
     * Parse URL-style parameters into object
     *
     * version: 1109.2015
     * discuss at: http://phpjs.org/functions/parse_str
     * +   original by: Cagri Ekin
     * +   improved by: Michael White (http://getsprink.com)
     * +    tweaked by: Jack
     * +   bugfixed by: Onno Marsman
     * +   reimplemented by: stag019
     * +   bugfixed by: Brett Zamir (http://brett-zamir.me)
     * +   bugfixed by: stag019
     * -    depends on: urldecode
     * +   input by: Dreamer
     * +   bugfixed by: Brett Zamir (http://brett-zamir.me)
     * %        note 1: When no argument is specified, will put variables in global scope.
     *
     * @param string str String to parse
     * @param array array to load data into
     *
     * @return object
     */
    var _parse_str = function (str, array) {
        var glue1 = "=",
            glue2 = "&",
            array2 = String(str).replace(/^&?([\s\S]*?)&?$/, "$1").split(glue2),
            i, j, chr, tmp, key, value, bracket, keys, evalStr,
            fixStr = function (str) {
                return decodeURIComponent(str).replace(/([\\"'])/g, "\\$1").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
            };
        if (! array) {
            array = this.window;
        }

        for (i = 0; i < array2.length; i++) {
            tmp = array2[i].split(glue1);
            if (tmp.length < 2) {
                tmp = [tmp, ""];
            }
            key = fixStr(tmp[0]);
            value = fixStr(tmp[1]);
            while (key.charAt(0) === " ") {
                key = key.substr(1);
            }
            if (key.indexOf("\0") !== -1) {
                key = key.substr(0, key.indexOf("\0"));
            }
            if (key && key.charAt(0) !== "[") {
                keys = [];
                bracket = 0;
                for (j = 0; j < key.length; j++) {
                    if (key.charAt(j) === "[" && !bracket) {
                        bracket = j + 1;
                    } else if (key.charAt(j) === "]") {
                        if (bracket) {
                            if (!keys.length) {
                                keys.push(key.substr(0, bracket - 1));
                            }
                            keys.push(key.substr(bracket, j - bracket));
                            bracket = 0;
                            if (key.charAt(j + 1) !== "[") {
                                break;
                            }
                        }
                    }
                }
                if (!keys.length) {
                    keys = [key];
                }
                for (j = 0; j < keys[0].length; j++) {
                    chr = keys[0].charAt(j);
                    if (chr === " " || chr === "." || chr === "[") {
                        keys[0] = keys[0].substr(0, j) + "_" + keys[0].substr(j + 1);
                    }
                    if (chr === "[") {
                        break;
                    }
                }
                /* jshint -W061 */
                evalStr = "array";
                for (j = 0; j < keys.length; j++) {
                    key = keys[j];
                    if ((key !== "" && key !== " ") || j === 0) {
                        key = "'" + key + "'";
                    } else {
                        key = eval(evalStr + ".push([]);") - 1;
                    }
                    evalStr += "[" + key + "]";
                    if (j !== keys.length - 1 && eval("typeof " + evalStr) === "undefined") {
                        eval(evalStr + " = [];");
                    }
                }
                evalStr += " = '" + value + "';\n";
                eval(evalStr);
                /* jshint +W061 */
            }
        }
    };

    /**
     * Get allowed API methods, sorted by GET or POST
     * Watch out for multiple-method "account/settings"!
     *
     * @return array $apimethods
     */
    var getApiMethods = function () {
        var httpmethods = {
            GET: [
                "account/settings",
                "account/verify_credentials",
                "application/rate_limit_status",
                "blocks/ids",
                "blocks/list",
                "direct_messages",
                "direct_messages/sent",
                "direct_messages/show",
                "favorites/list",
                "followers/ids",
                "followers/list",
                "friends/ids",
                "friends/list",
                "friendships/incoming",
                "friendships/lookup",
                "friendships/lookup",
                "friendships/no_retweets/ids",
                "friendships/outgoing",
                "friendships/show",
                "geo/id/:place_id",
                "geo/reverse_geocode",
                "geo/search",
                "geo/similar_places",
                "help/configuration",
                "help/languages",
                "help/privacy",
                "help/tos",
                "lists/list",
                "lists/members",
                "lists/members/show",
                "lists/memberships",
                "lists/ownerships",
                "lists/show",
                "lists/statuses",
                "lists/subscribers",
                "lists/subscribers/show",
                "lists/subscriptions",
                "mutes/users/ids",
                "mutes/users/list",
                "oauth/authenticate",
                "oauth/authorize",
                "saved_searches/list",
                "saved_searches/show/:id",
                "search/tweets",
                "statuses/home_timeline",
                "statuses/mentions_timeline",
                "statuses/oembed",
                "statuses/retweeters/ids",
                "statuses/retweets/:id",
                "statuses/retweets_of_me",
                "statuses/show/:id",
                "statuses/user_timeline",
                "trends/available",
                "trends/closest",
                "trends/place",
                "users/contributees",
                "users/contributors",
                "users/profile_banner",
                "users/search",
                "users/show",
                "users/suggestions",
                "users/suggestions/:slug",
                "users/suggestions/:slug/members",

                // Internal
                "users/recommendations",
                "account/push_destinations/device",
                "activity/about_me",
                "activity/by_friends",
                "statuses/media_timeline",
                "timeline/home",
                "help/experiments",
                "search/typeahead",
                "search/universal",
                "discover/universal",
                "conversation/show",
                "statuses/:id/activity/summary",
                "account/login_verification_enrollment",
                "account/login_verification_request",
                "prompts/suggest",

                "beta/timelines/custom/list",
                "beta/timelines/timeline",
                "beta/timelines/custom/show"
            ],
            POST: [
                "account/remove_profile_banner",
                "account/settings__post",
                "account/update_delivery_device",
                "account/update_profile",
                "account/update_profile_background_image",
                "account/update_profile_banner",
                "account/update_profile_colors",
                "account/update_profile_image",
                "blocks/create",
                "blocks/destroy",
                "direct_messages/destroy",
                "direct_messages/new",
                "favorites/create",
                "favorites/destroy",
                "friendships/create",
                "friendships/destroy",
                "friendships/update",
                "lists/create",
                "lists/destroy",
                "lists/members/create",
                "lists/members/create_all",
                "lists/members/destroy",
                "lists/members/destroy_all",
                "lists/subscribers/create",
                "lists/subscribers/destroy",
                "lists/update",
                "media/upload",
                "mutes/users/create",
                "mutes/users/destroy",
                "oauth/access_token",
                "oauth/request_token",
                "oauth2/invalidate_token",
                "oauth2/token",
                "saved_searches/create",
                "saved_searches/destroy/:id",
                "statuses/destroy/:id",
                "statuses/lookup",
                "statuses/retweet/:id",
                "statuses/update",
                "statuses/update_with_media", // deprecated, use media/upload
                "users/lookup",
                "users/report_spam",

                // Internal
                "direct_messages/read",
                "account/login_verification_enrollment__post",
                "push_destinations/enable_login_verification",
                "account/login_verification_request__post",

                "beta/timelines/custom/create",
                "beta/timelines/custom/update",
                "beta/timelines/custom/destroy",
                "beta/timelines/custom/add",
                "beta/timelines/custom/remove"
            ]
        };
        return httpmethods;
    };

    /**
     * Main API handler working on any requests you issue
     *
     * @param string   fn            The member function you called
     * @param array    params        The parameters you sent along
     * @param function callback      The callback to call with the reply
     * @param bool     app_only_auth Whether to use app-only auth
     *
     * @return mixed The API reply encoded in the set return_format
     */

    var __call = function (fn, params, callback, app_only_auth) {
        if (typeof params === "undefined") {
            params = {};
        }
        if (typeof app_only_auth === "undefined") {
            app_only_auth = false;
        }
        if (typeof callback !== "function" && typeof params === "function") {
            callback = params;
            params = {};
            if (typeof callback === "boolean") {
                app_only_auth = callback;
            }
        } else if (typeof callback === "undefined") {
            callback = function () {};
        }
        switch (fn) {
        case "oauth_authenticate":
        case "oauth_authorize":
            return this[fn](params, callback);

        case "oauth2_token":
            return this[fn](callback);
        }
        // reset token when requesting a new token (causes 401 for signature error on 2nd+ requests)
        if (fn === "oauth_requestToken") {
            setToken(null, null);
        }
        // parse parameters
        var apiparams = {};
        if (typeof params === "object") {
            apiparams = params;
        } else {
            _parse_str(params, apiparams); //TODO
        }

        // map function name to API method
        var method = "";
        var param, i, j;

        // replace _ by /
        var path = fn.split("_");
        for (i = 0; i < path.length; i++) {
            if (i > 0) {
                method += "/";
            }
            method += path[i];
        }

        // undo replacement for URL parameters
        var url_parameters_with_underscore = ["screen_name", "place_id"];
        for (i = 0; i < url_parameters_with_underscore.length; i++) {
            param = url_parameters_with_underscore[i].toUpperCase();
            var replacement_was = param.split("_").join("/");
            method = method.split(replacement_was).join(param);
        }

        // replace AA by URL parameters
        var method_template = method;
        var match = method.match(/[A-Z_]{2,}/);
        if (match) {
            for (i = 0; i < match.length; i++) {
                param = match[i];
                var param_l = param.toLowerCase();
                method_template = method_template.split(param).join(":" + param_l);
                if (typeof apiparams[param_l] === "undefined") {
                    for (j = 0; j < 26; j++) {
                        method_template = method_template.split(String.fromCharCode(65 + j)).join("_" + String.fromCharCode(97 + j));
                    }
                    console.warn("To call the templated method \"" + method_template + "\", specify the parameter value for \"" + param_l + "\".");
                }
                method = method.split(param).join(apiparams[param_l]);
                delete apiparams[param_l];
            }
        }

        // replace A-Z by _a-z
        for (i = 0; i < 26; i++) {
            method = method.split(String.fromCharCode(65 + i)).join("_" + String.fromCharCode(97 + i));
            method_template = method_template.split(String.fromCharCode(65 + i)).join("_" + String.fromCharCode(97 + i));
        }

        var httpmethod = _detectMethod(method_template, apiparams);
        var multipart = _detectMultipart(method_template);
        var internal = _detectInternal(method_template);

        return _callApi(
            httpmethod,
            method,
            apiparams,
            multipart,
            app_only_auth,
            internal,
            callback
        );
    };

    /**
     * Gets the OAuth authenticate URL for the current request token
     *
     * @return string The OAuth authenticate URL
     */
    var oauth_authenticate = function (params, callback) {
        if (typeof params.force_login === "undefined") {
            params.force_login = null;
        }
        if (typeof params.screen_name === "undefined") {
            params.screen_name = null;
        }
        if (_oauth_token === null) {
            console.warn("To get the authenticate URL, the OAuth token must be set.");
        }
        var url = _endpoint_oauth + "oauth/authenticate?oauth_token=" + _url(_oauth_token);
        if (params.force_login === true) {
            url += "&force_login=1";
            if (params.screen_name !== null) {
                url += "&screen_name=" + params.screen_name;
            }
        }
        callback(url);
        return true;
    };

    /**
     * Gets the OAuth authorize URL for the current request token
     *
     * @return string The OAuth authorize URL
     */
    var oauth_authorize = function (params, callback) {
        if (typeof params.force_login === "undefined") {
            params.force_login = null;
        }
        if (typeof params.screen_name === "undefined") {
            params.screen_name = null;
        }
        if (_oauth_token === null) {
            console.warn("To get the authorize URL, the OAuth token must be set.");
        }
        var url = _endpoint_oauth + "oauth/authorize?oauth_token=" + _url(_oauth_token);
        if (params.force_login === true) {
            url += "&force_login=1";
            if (params.screen_name !== null) {
                url += "&screen_name=" + params.screen_name;
            }
        }
        callback(url);
        return true;
    };

    /**
     * Gets the OAuth bearer token
     *
     * @return string The OAuth bearer token
     */

    var oauth2_token = function (callback) {
        if (_oauth_consumer_key === null) {
            console.warn("To obtain a bearer token, the consumer key must be set.");
        }

        if (typeof callback === "undefined") {
            callback = function () {};
        }

        var post_fields = "grant_type=client_credentials";
        var url = _endpoint_oauth + "oauth2/token";

        if (_use_proxy) {
            url = url.replace(
                _endpoint_base,
                _endpoint_proxy
            );
        }

        var xml = _getXmlRequestObject();
        if (xml === null) {
            return;
        }
        xml.open("POST", url, true);
        xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xml.setRequestHeader(
            (_use_proxy ? "X-" : "") + "Authorization",
            "Basic " + _base64_encode(_oauth_consumer_key + ":" + _oauth_consumer_secret)
        );

        xml.onreadystatechange = function () {
            if (xml.readyState >= 4) {
                var httpstatus = 12027;
                try {
                    httpstatus = xml.status;
                } catch (e) {}
                var response = "";
                try {
                    response = xml.responseText;
                } catch (e) {}
                var reply = _parseApiReply(response);
                reply.httpstatus = httpstatus;
                if (httpstatus === 200) {
                    setBearerToken(reply.access_token);
                }
                callback(reply);
            }
        };
        xml.send(post_fields);

    };

    /**
     * Signing helpers
     */

    /**
     * URL-encodes the given data
     *
     * @param mixed data
     *
     * @return mixed The encoded data
     */
    var _url = function (data) {
        if ((/boolean|number|string/).test(typeof data)) {
            return encodeURIComponent(data).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
        } else {
            return "";
        }
    };

    /**
     * Gets the base64-encoded SHA1 hash for the given data
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS PUB 180-1
     * Based on version 2.1 Copyright Paul Johnston 2000 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for details.
     *
     * @param string data The data to calculate the hash from
     *
     * @return string The hash
     */
    var _sha1 = function () {
        function n(e, b) {
            e[b >> 5] |= 128 << 24 - b % 32;
            e[(b + 64 >> 9 << 4) + 15] = b;
            for (var c = new Array(80), a = 1732584193, d = -271733879, h = -1732584194,
                    k = 271733878, g = -1009589776, p = 0; p < e.length; p += 16) {
                for (var o = a, q = d, r = h, s = k, t = g, f = 0; 80 > f; f++) {
                    var m;

                    if (f < 16) {
                        m = e[p + f];
                    } else {
                        m = c[f - 3] ^ c[f - 8] ^ c[f - 14] ^ c[f - 16];
                        m = m << 1 | m >>> 31;
                    }

                    c[f] = m;
                    m = l(l(a << 5 | a >>> 27, 20 > f ? d & h | ~d & k : 40 > f ? d ^
                        h ^ k : 60 > f ? d & h | d & k | h & k : d ^ h ^ k), l(
                        l(g, c[f]), 20 > f ? 1518500249 : 40 > f ? 1859775393 :
                        60 > f ? -1894007588 : -899497514));
                    g = k;
                    k = h;
                    h = d << 30 | d >>> 2;
                    d = a;
                    a = m;
                }
                a = l(a, o);
                d = l(d, q);
                h = l(h, r);
                k = l(k, s);
                g = l(g, t);
            }
            return [a, d, h, k, g];
        }

        function l(e, b) {
            var c = (e & 65535) + (b & 65535);
            return (e >> 16) + (b >> 16) + (c >> 16) << 16 | c & 65535;
        }

        function q(e) {
            for (var b = [], c = (1 << g) - 1, a = 0; a < e.length * g; a += g) {
                b[a >> 5] |= (e.charCodeAt(a / g) & c) << 24 - a % 32;
            }
            return b;
        }
        var g = 8;
        return function (e) {
            var b = _oauth_consumer_secret + "&" + (null !== _oauth_token_secret ?
                _oauth_token_secret : "");
            if (_oauth_consumer_secret === null) {
                console.warn("To generate a hash, the consumer secret must be set.");
            }
            var c = q(b);
            if (c.length > 16) {
                c = n(c, b.length * g);
            }
            b = new Array(16);
            for (var a = new Array(16), d = 0; d < 16; d++) {
                a[d] = c[d] ^ 909522486;
                b[d] = c[d] ^ 1549556828;
            }
            c = n(a.concat(q(e)), 512 + e.length * g);
            b = n(b.concat(c), 672);
            c = "";
            for (a = 0; a < 4 * b.length; a += 3) {
                for (d = (b[a >> 2] >> 8 * (3 - a % 4) & 255) << 16 | (b[a + 1 >> 2] >>
                    8 * (3 - (a + 1) % 4) & 255) << 8 | b[a + 2 >> 2] >> 8 * (3 -
                    (a + 2) % 4) & 255, e = 0; 4 > e; e++) {
                    c = 8 * a + 6 * e > 32 * b.length ? c + "=" : c +
                        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
                        .charAt(d >> 6 * (3 - e) & 63);
                }
            }
            return c;
        };
    }();

    /*
     * Gets the base64 representation for the given data
     *
     * http://phpjs.org
     * +   original by: Tyler Akins (http://rumkin.com)
     * +   improved by: Bayron Guevara
     * +   improved by: Thunder.m
     * +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +   bugfixed by: Pellentesque Malesuada
     * +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +   improved by: Rafał Kukawski (http://kukawski.pl)
     *
     * @param string data The data to calculate the base64 representation from
     *
     * @return string The base64 representation
     */
    var _base64_encode = function (a) {
        var d, e, f, b, g = 0,
            h = 0,
            i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            c = [];
        if (!a) {
            return a;
        }
        do {
            d = a.charCodeAt(g++);
            e = a.charCodeAt(g++);
            f = a.charCodeAt(g++);
            b = d << 16 | e << 8 | f;
            d = b >> 18 & 63;
            e = b >> 12 & 63;
            f = b >> 6 & 63;
            b &= 63;
            c[h++] = i.charAt(d) + i.charAt(e) + i.charAt(f) + i.charAt(b);
        } while (g < a.length);
        c = c.join("");
        a = a.length % 3;
        return (a ? c.slice(0, a - 3) : c) + "===".slice(a || 3);
    };

    /*
     * Builds a HTTP query string from the given data
     *
     * http://phpjs.org
     * +     original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +     improved by: Legaev Andrey
     * +     improved by: Michael White (http://getsprink.com)
     * +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * +     improved by: Brett Zamir (http://brett-zamir.me)
     * +        revised by: stag019
     * +     input by: Dreamer
     * +     bugfixed by: Brett Zamir (http://brett-zamir.me)
     * +     bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
     *
     * @param string data The data to concatenate
     *
     * @return string The HTTP query
     */
    var _http_build_query = function (e, f, b) {
        function g(c, a, d) {
            var b, e = [];
            if (a === true) {
                a = "1";
            } else if (a === false) {
                a = "0";
            }
            if (null !== a) {
                if (typeof a === "object") {
                    for (b in a) {
                        if (a[b] !== null) {
                            e.push(g(c + "[" + b + "]", a[b], d));
                        }
                    }
                    return e.join(d);
                }
                if (typeof a !== "function") {
                    return _url(c) + "=" + _url(a);
                }
                console.warn("There was an error processing for http_build_query().");
            } else {
                return "";
            }
        }
        var d, c, h = [];
        if (! b) {
            b = "&";
        }
        for (c in e) {
            d = e[c];
            if (f && ! isNaN(c)) {
                c = String(f) + c;
            }
            d = g(c, d, b);
            if (d !== "") {
                h.push(d);
            }
        }
        return h.join(b);
    };

    /**
     * Generates a (hopefully) unique random string
     *
     * @param int optional length The length of the string to generate
     *
     * @return string The random string
     */
    var _nonce = function (length) {
        if (typeof length === "undefined") {
            length = 8;
        }
        if (length < 1) {
            console.warn("Invalid nonce length.");
        }
        var nonce = "";
        for (var i = 0; i < length; i++) {
            var character = Math.floor(Math.random() * 61);
            nonce += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".substring(character, character + 1);
        }
        return nonce;
    };

    /**
     * Sort array elements by key
     *
     * @param array input_arr The array to sort
     *
     * @return array The sorted keys
     */
    var _ksort = function (input_arr) {
        var keys = [], sorter, k;

        sorter = function (a, b) {
            var a_float = parseFloat(a),
            b_float = parseFloat(b),
            a_numeric = a_float + "" === a,
            b_numeric = b_float + "" === b;
            if (a_numeric && b_numeric) {
                return a_float > b_float ? 1 : a_float < b_float ? -1 : 0;
            } else if (a_numeric && !b_numeric) {
                return 1;
            } else if (!a_numeric && b_numeric) {
                return -1;
            }
            return a > b ? 1 : a < b ? -1 : 0;
        };

        // Make a list of key names
        for (k in input_arr) {
            if (input_arr.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        keys.sort(sorter);
        return keys;
    };

    /**
     * Clone objects
     *
     * @param object obj    The object to clone
     *
     * @return object clone The cloned object
     */
    var _clone = function (obj) {
        var clone = {};
        for (var i in obj) {
            if (typeof(obj[i]) === "object") {
                clone[i] = _clone(obj[i]);
            } else {
                clone[i] = obj[i];
            }
        }
        return clone;
    };

    /**
     * Generates an OAuth signature
     *
     * @param string          httpmethod    Usually either 'GET' or 'POST' or 'DELETE'
     * @param string          method        The API method to call
     * @param array  optional params        The API call parameters, associative
     * @param bool   optional append_to_get Whether to append the OAuth params to GET
     *
     * @return string Authorization HTTP header
     */
    var _sign = function (httpmethod, method, params, append_to_get) {
        if (typeof params === "undefined") {
            params = {};
        }
        if (typeof append_to_get === "undefined") {
            append_to_get = false;
        }
        if (_oauth_consumer_key === null) {
            console.warn("To generate a signature, the consumer key must be set.");
        }
        var sign_params = {
            consumer_key:     _oauth_consumer_key,
            version:          "1.0",
            timestamp:        Math.round(new Date().getTime() / 1000),
            nonce:            _nonce(),
            signature_method: "HMAC-SHA1"
        };
        var sign_base_params = {};
        var value;
        for (var key in sign_params) {
            value = sign_params[key];
            sign_base_params["oauth_" + key] = _url(value);
        }
        if (_oauth_token !== null) {
            sign_base_params.oauth_token = _url(_oauth_token);
        }
        var oauth_params = _clone(sign_base_params);
        for (key in params) {
            value = params[key];
            sign_base_params[key] = value;
        }
        var keys = _ksort(sign_base_params);
        var sign_base_string = "";
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            value = sign_base_params[key];
            sign_base_string += key + "=" + _url(value) + "&";
        }
        sign_base_string = sign_base_string.substring(0, sign_base_string.length - 1);
        var signature    = _sha1(httpmethod + "&" + _url(method) + "&" + _url(sign_base_string));

        params = append_to_get ? sign_base_params : oauth_params;
        params.oauth_signature = signature;
        keys = _ksort(params);
        var authorization = "";
        if (append_to_get) {
            for(i = 0; i < keys.length; i++) {
                key = keys[i];
                value = params[key];
                authorization += key + "=" + _url(value) + "&";
            }
            return authorization.substring(0, authorization.length - 1);
        }
        authorization = "OAuth ";
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            value = params[key];
            authorization += key + "=\"" + _url(value) + "\", ";
        }
        return authorization.substring(0, authorization.length - 2);
    };

    /**
     * Detects HTTP method to use for API call
     *
     * @param string method The API method to call
     * @param array  params The parameters to send along
     *
     * @return string The HTTP method that should be used
     */
    var _detectMethod = function (method, params) {
        // multi-HTTP method endpoints
        switch (method) {
        case "account/settings":
        case "account/login_verification_enrollment":
        case "account/login_verification_request":
            method = params.length ? method + "__post" : method;
            break;
        }

        var apimethods = getApiMethods();
        for (var httpmethod in apimethods) {
            if (apimethods[httpmethod].indexOf(method) > -1) {
                return httpmethod;
            }
        }
        console.warn("Can't find HTTP method to use for \"" + method + "\".");
    };

    /**
     * Detects if API call should use multipart/form-data
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method should be sent as multipart
     */
    var _detectMultipart = function (method) {
        var multiparts = [
            // Tweets
            "statuses/update_with_media",

            // Users
            "account/update_profile_background_image",
            "account/update_profile_image",
            "account/update_profile_banner"
        ];
        return multiparts.indexOf(method) > -1;
    };

    /**
     * Build multipart request from upload params
     *
     * @param string method  The API method to call
     * @param array  params  The parameters to send along
     *
     * @return null|string The built multipart request body
     */
    var _buildMultipart = function (method, params) {
        // well, files will only work in multipart methods
        if (! _detectMultipart(method)) {
            return;
        }

        // only check specific parameters
        var possible_methods = [
            // Tweets
            "statuses/update_with_media",
            // Accounts
            "account/update_profile_background_image",
            "account/update_profile_image",
            "account/update_profile_banner"
        ];
        var possible_files = {
            // Tweets
            "statuses/update_with_media": "media[]",
            // Accounts
            "account/update_profile_background_image": "image",
            "account/update_profile_image": "image",
            "account/update_profile_banner": "banner"
        };
        // method might have files?
        if (possible_methods.indexOf(method) === -1) {
            return;
        }

        // check for filenames
        possible_files = possible_files[method].split(" ");

        var multipart_border = "--------------------" + _nonce();
        var multipart_request = "";
        for (var key in params) {
            multipart_request +=
                "--" + multipart_border + "\r\n"
                + "Content-Disposition: form-data; name=\"" + key + "\"";
            if (possible_files.indexOf(key) > -1) {
                multipart_request +=
                    "\r\nContent-Transfer-Encoding: base64";
            }
            multipart_request +=
                "\r\n\r\n" + params[key] + "\r\n";
        }
        multipart_request += "--" + multipart_border + "--";
        return multipart_request;
    };

    /**
     * Detects if API call is internal
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method is defined in internal API
     */
    var _detectInternal = function (method) {
        var internals = [
            "users/recommendations"
        ];
        return internals.join(" ").indexOf(method) > -1;
    };

    /**
     * Detects if API call should use media endpoint
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method is defined in media API
     */
    var _detectMedia = function (method) {
        var medias = [
            "media/upload"
        ];
        return medias.join(" ").indexOf(method) > -1;
    };

    /**
     * Detects if API call should use old endpoint
     *
     * @param string method The API method to call
     *
     * @return bool Whether the method is defined in old API
     */
    var _detectOld = function (method) {
        var olds = [
            "account/push_destinations/device"
        ];
        return olds.join(" ").indexOf(method) > -1;
    };

    /**
     * Builds the complete API endpoint url
     *
     * @param string method The API method to call
     *
     * @return string The URL to send the request to
     */
    var _getEndpoint = function (method) {
        var url;
        if (method.substring(0, 5) === "oauth") {
            url = _endpoint_oauth + method;
        } else if (_detectMedia(method)) {
            url = _endpoint_media + method + ".json";
        } else if (_detectOld(method)) {
            url = _endpoint_old + method + ".json";
        } else {
            url = _endpoint + method + ".json";
        }
        return url;
    };

    /**
     * Gets the XML HTTP Request object, trying to load it in various ways
     *
     * @return object The XMLHttpRequest object instance
     */
    var _getXmlRequestObject = function () {
        var xml = null;
        // first, try the W3-standard object
        if (typeof window === "object"
            && window
            && typeof window.XMLHttpRequest !== "undefined"
        ) {
            xml = new window.XMLHttpRequest();
        // then, try Titanium framework object
        } else if (typeof Ti === "object"
            && Ti
            && typeof Ti.Network.createHTTPClient !== "undefined"
        ) {
            xml = Ti.Network.createHTTPClient();
        // are we in an old Internet Explorer?
        } else if (typeof ActiveXObject !== "undefined"
        ) {
            try {
                xml = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                console.error("ActiveXObject object not defined.");
            }
        // now, consider RequireJS and/or Node.js objects
        } else if (typeof require === "function"
            && require
        ) {
            // look for xmlhttprequest module
            try {
                var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
                xml = new XMLHttpRequest();
            } catch (e1) {
                // or maybe the user is using xhr2
                try {
                    var XMLHttpRequest = require("xhr2");
                    xml = new XMLHttpRequest();
                } catch (e2) {
                    console.error("xhr2 object not defined, cancelling.");
                }
            }
        }
        return xml;
    };

    /**
     * Calls the API using cURL
     *
     * @param string          httpmethod    The HTTP method to use for making the request
     * @param string          method        The API method to call
     * @param array  optional params        The parameters to send along
     * @param bool   optional multipart     Whether to use multipart/form-data
     * @param bool   optional app_only_auth Whether to use app-only bearer authentication
     * @param bool   optional internal      Whether to use internal call
     * @param function        callback      The function to call with the API call result
     *
     * @return mixed The API reply, encoded in the set return_format
     */

    var _callApi = function (httpmethod, method, params, multipart, app_only_auth, internal, callback) {
        if (typeof params === "undefined") {
            params = {};
        }
        if (typeof multipart === "undefined") {
            multipart = false;
        }
        if (typeof app_only_auth === "undefined") {
            app_only_auth = false;
        }
        if (typeof callback !== "function") {
            callback = function () {};
        }
        if (internal) {
            params.adc            = "phone";
            params.application_id = 333903271;
        }

        var url           = _getEndpoint(method);
        var authorization = null;

        var xml = _getXmlRequestObject();
        if (xml === null) {
            return;
        }
        var post_fields;

        if (httpmethod === "GET") {
            var url_with_params = url;
            if (JSON.stringify(params) !== "{}") {
                url_with_params += "?" + _http_build_query(params);
            }
            if (! app_only_auth) {
                authorization = _sign(httpmethod, url, params);
            }

            // append auth params to GET url for IE7-9, to send via JSONP
            if (_use_jsonp) {
                if (JSON.stringify(params) !== "{}") {
                    url_with_params += "&";
                } else {
                    url_with_params += "?";
                }
                var callback_name = _nonce();
                window[callback_name] = function (reply) {
                    reply.httpstatus = 200;

                    var rate = null;
                    if (typeof xml.getResponseHeader !== "undefined"
                        && xml.getResponseHeader("x-rate-limit-limit") !== ""
                    ) {
                        rate = {
                            limit: xml.getResponseHeader("x-rate-limit-limit"),
                            remaining: xml.getResponseHeader("x-rate-limit-remaining"),
                            reset: xml.getResponseHeader("x-rate-limit-reset")
                        };
                    }
                    callback(reply, rate);
                };
                params.callback = callback_name;
                url_with_params = url + "?" + _sign(httpmethod, url, params, true);
                var tag = document.createElement("script");
                tag.type = "text/javascript";
                tag.src = url_with_params;
                var body = document.getElementsByTagName("body")[0];
                body.appendChild(tag);
                return;

            } else if (_use_proxy) {
                url_with_params = url_with_params.replace(
                    _endpoint_base,
                    _endpoint_proxy
                ).replace(
                    _endpoint_base_media,
                    _endpoint_proxy
                );
            }
            xml.open(httpmethod, url_with_params, true);
        } else {
            if (_use_jsonp) {
                console.warn("Sending POST requests is not supported for IE7-9.");
                return;
            }
            if (multipart) {
                if (! app_only_auth) {
                    authorization = _sign(httpmethod, url, {});
                }
                params = _buildMultipart(method, params);
            } else {
                if (! app_only_auth) {
                    authorization = _sign(httpmethod, url, params);
                }
                params = _http_build_query(params);
            }
            post_fields = params;
            if (_use_proxy || multipart) { // force proxy for multipart base64
                url = url.replace(
                    _endpoint_base,
                    _endpoint_proxy
                ).replace(
                    _endpoint_base_media,
                    _endpoint_proxy
                );
            }
            xml.open(httpmethod, url, true);
            if (multipart) {
                xml.setRequestHeader("Content-Type", "multipart/form-data; boundary="
                    + post_fields.split("\r\n")[0].substring(2));
            } else {
                xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }
        }
        if (app_only_auth) {
            if (_oauth_consumer_key === null
                && _oauth_bearer_token === null
            ) {
                console.warn("To make an app-only auth API request, consumer key or bearer token must be set.");
            }
            // automatically fetch bearer token, if necessary
            if (_oauth_bearer_token === null) {
                return oauth2_token(function () {
                    _callApi(httpmethod, method, params, multipart, app_only_auth, false, callback);
                });
            }
            authorization = "Bearer " + _oauth_bearer_token;
        }
        if (authorization !== null) {
            xml.setRequestHeader((_use_proxy ? "X-" : "") + "Authorization", authorization);
        }
        xml.onreadystatechange = function () {
            if (xml.readyState >= 4) {
                var httpstatus = 12027;
                try {
                    httpstatus = xml.status;
                } catch (e) {}
                var response = "";
                try {
                    response = xml.responseText;
                } catch (e) {}
                var reply = _parseApiReply(response);
                reply.httpstatus = httpstatus;
                var rate = null;
                if (typeof xml.getResponseHeader !== "undefined"
                    && xml.getResponseHeader("x-rate-limit-limit") !== ""
                ) {
                    rate = {
                        limit: xml.getResponseHeader("x-rate-limit-limit"),
                        remaining: xml.getResponseHeader("x-rate-limit-remaining"),
                        reset: xml.getResponseHeader("x-rate-limit-reset")
                    };
                }
                callback(reply, rate);
            }
        };
        xml.send(httpmethod === "GET" ? null : post_fields);
        return true;
    };

    /**
     * Parses the API reply to encode it in the set return_format
     *
     * @param string reply  The actual reply, JSON-encoded or URL-encoded
     *
     * @return array|object The parsed reply
     */
    var _parseApiReply = function (reply) {
        if (typeof reply !== "string" || reply === "") {
            return {};
        }
        if (reply === "[]") {
            return [];
        }
        var parsed;
        try {
            parsed = JSON.parse(reply);
        } catch (e) {
            parsed = {};
            if (reply.indexOf("<" + "?xml version=\"1.0\" encoding=\"UTF-8\"?" + ">") === 0) {
                // we received XML...
                // since this only happens for errors,
                // don't perform a full decoding
                parsed.request = reply.match(/<request>(.*)<\/request>/)[1];
                parsed.error   = reply.match(/<error>(.*)<\/error>/)[1];
            } else {
                // assume query format
                var elements = reply.split("&");
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i].split("=", 2);
                    if (element.length > 1) {
                        parsed[element[0]] = decodeURIComponent(element[1]);
                    } else {
                        parsed[element[0]] = null;
                    }
                }
            }
        }
        return parsed;
    };

    return {
        setConsumerKey: setConsumerKey,
        getVersion: getVersion,
        setToken: setToken,
        setBearerToken: setBearerToken,
        setUseProxy: setUseProxy,
        setProxy: setProxy,
        getApiMethods: getApiMethods,
        __call: __call,
        oauth_authenticate: oauth_authenticate,
        oauth_authorize: oauth_authorize,
        oauth2_token: oauth2_token
    };
};

if (typeof module === "object"
    && module
    && typeof module.exports === "object"
) {
    // Expose codebird as module.exports in loaders that implement the Node
    // module pattern (including browserify). Do not create the global, since
    // the user will be storing it themselves locally, and globals are frowned
    // upon in the Node module world.
    module.exports = Codebird;
} else {
    // Otherwise expose codebird to the global object as usual
    if (typeof window === "object"
        && window) {
        window.Codebird = Codebird;
    }

    // Register as a named AMD module, since codebird can be concatenated with other
    // files that may use define, but not via a proper concatenation script that
    // understands anonymous AMD modules. A named AMD is safest and most robust
    // way to register. Lowercase codebird is used because AMD module names are
    // derived from file names, and codebird is normally delivered in a lowercase
    // file name. Do this after creating the global so that if an AMD module wants
    // to call noConflict to hide this version of codebird, it will work.
    if (typeof define === "function" && define.amd) {
        define("codebird", [], function () { return Codebird; });
    }
}

})();

var map = {};
var infowindow = {};

var beachData = [
    { name: 'Itararé', latitude: '-23.9728131', longitude: '-46.3761992' },
    { name: 'Pitangueiras', latitude: '-23.9990193', longitude: '-46.2627678' },
    { name: 'Camburi', latitude: '-23.7777902', longitude: '-45.6546707' },
    { name: 'Embaré', latitude: '-23.9645224', longitude: '-46.3415395' },
    { name: 'Ponta da Praia', latitude: '-23.9841793', longitude: '-46.3102317' },
];

var Beach = function (name, lat, lng) {
    var self = this;
    this.name = name;
    this.lat = lat;
    this.lng = lng;

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.markerSelected = function () {
        if (document.querySelector('.mdl-layout__drawer.is-visible')) {
            var layout = document.querySelector('.mdl-layout');
            layout.MaterialLayout.toggleDrawer();
        }

        map.panTo(self.marker.getPosition());

        infowindow.setContent(self.markerContent);
        infowindow.open(map, self.marker);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 700);
    };

    this.marker.addListener('click', this.markerSelected);

    this.isVisible = ko.observable(true);

    this.isVisible.subscribe(function (currentState) {
        self.marker.setVisible(currentState);
    });

    this.markerContent = '<h4>' + this.name + '</h4>' + '<p>Carregando</p>';

    /* TODO
     * - handle when data is missing from openweathermap
     */
    (function () {
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + self.lat + '&lon=' + self.lng + '&appid=d132d4090f6202ea29bc28da5c07bf63&units=metric';
        $.getJSON(url)
            .done(function (data) {
                var desc = data.weather[0].description ? data.weather[0].description : 'no description available';
                var temp = data.main.temp ? data.main.temp : 'no temp available';
                var windSpeed = data.wind.speed ? data.wind.speed : 'no wind speed available';
                var windDeg = data.wind.deg ? data.wind.deg : 'no wind degree available';

                self.markerContent = '<div>' +
                                        '<h4>' + self.name + '</h4>' +
                                            '<dl>' +
                                                '<dt>Conditions</dt>' +
                                                '<dd>' + desc + '</dd>' +
                                                '<dt>Temp</dt>' +
                                                '<dd>' + temp + '°</dd>' +
                                                '<dt>Wind</dt>' +
                                                '<dd>' + windSpeed + ' km/h<br>' + windDeg + '°</dd>' +
                                            '<dl>' +
                                        '</div>';
            }).fail(function (error) {
                console.log('Error: ', error);
                self.markerContent = '<h4>' + self.name + '</h4>' +
                                     "<strong>Error:</strong> Informação indisponível";
            });
    })();
};

ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        var mapOptions = {
            zoom: 10,
            center: new google.maps.LatLng(value.centerLat, value.centerLon),
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            mapTypeControl: false
        };

        map = new google.maps.Map(element, mapOptions);
        infowindow = new google.maps.InfoWindow();

        google.maps.event.addDomListener(window, 'resize', function () {
            var center = map.getCenter();
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
        });

        for (var i = 0; i < beachData.length; i++) {
            var beach = beachData[i];
            value.beaches.push(new Beach(beach.name, beach.latitude, beach.longitude));
        }
    }
};

var beachesModel = {
    beaches: ko.observableArray([]),
    query: ko.observable('')
};

beachesModel.filteredBeaches = ko.computed(function () {
    var query = this.query().toLowerCase();
    return ko.utils.arrayFilter(this.beaches(), function (beach) {
        var isMatch = beach.name.toLowerCase().indexOf(query) !== -1 || !query;
        beach.isVisible(isMatch);
        return isMatch;
    });
}, beachesModel);

function initMap () {
    ko.applyBindings(beachesModel);
}

function mapError () {
    var dialog = document.querySelector('dialog');
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.showModal();
}

// map doesn't render correctly on init. Call resize after window load event to fix.
$(window).on('load', function () {
    google.maps.event.trigger(map, 'resize');
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvZGViaXJkLmpzIiwibWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeitDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIFR3aXR0ZXIgbGlicmFyeSBpbiBKYXZhU2NyaXB0XG4gKlxuICogQHBhY2thZ2UgICBjb2RlYmlyZFxuICogQHZlcnNpb24gICAyLjYuMFxuICogQGF1dGhvciAgICBKdWJsbyBTb2x1dGlvbnMgPHN1cHBvcnRAanVibG8ubmV0PlxuICogQGNvcHlyaWdodCAyMDEwLTIwMTUgSnVibG8gU29sdXRpb25zIDxzdXBwb3J0QGp1YmxvLm5ldD5cbiAqIEBsaWNlbnNlICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0dQTC0zLjAgR05VIFB1YmxpYyBMaWNlbnNlIDMuMFxuICogQGxpbmsgICAgICBodHRwczovL2dpdGh1Yi5jb20vanVibG9uZXQvY29kZWJpcmQtcGhwXG4gKi9cblxuLyoganNoaW50IGN1cmx5OiB0cnVlLFxuICAgICAgICAgIGVxZXFlcTogdHJ1ZSxcbiAgICAgICAgICBsYXRlZGVmOiB0cnVlLFxuICAgICAgICAgIHF1b3RtYXJrOiBkb3VibGUsXG4gICAgICAgICAgdW5kZWY6IHRydWUsXG4gICAgICAgICAgdW51c2VkOiB0cnVlLFxuICAgICAgICAgIHRyYWlsaW5nOiB0cnVlLFxuICAgICAgICAgIGxheGJyZWFrOiB0cnVlICovXG4vKiBnbG9iYWwgd2luZG93LFxuICAgICAgICAgIGRvY3VtZW50LFxuICAgICAgICAgIG5hdmlnYXRvcixcbiAgICAgICAgICBjb25zb2xlLFxuICAgICAgICAgIFRpLFxuICAgICAgICAgIEFjdGl2ZVhPYmplY3QsXG4gICAgICAgICAgbW9kdWxlLFxuICAgICAgICAgIGRlZmluZSxcbiAgICAgICAgICByZXF1aXJlICovXG4oZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQXJyYXkuaW5kZXhPZiBwb2x5ZmlsbFxuICovXG5pZiAoISBBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKG9iaiwgc3RhcnQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IChzdGFydCB8fCAwKTsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSBvYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBBIFR3aXR0ZXIgbGlicmFyeSBpbiBKYXZhU2NyaXB0XG4gKlxuICogQHBhY2thZ2UgY29kZWJpcmRcbiAqIEBzdWJwYWNrYWdlIGNvZGViaXJkLWpzXG4gKi9cbi8qIGpzaGludCAtVzA5OCAqL1xudmFyIENvZGViaXJkID0gZnVuY3Rpb24gKCkge1xuLyoganNoaW50ICtXMDk4ICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgT0F1dGggY29uc3VtZXIga2V5IG9mIHlvdXIgcmVnaXN0ZXJlZCBhcHBcbiAgICAgKi9cbiAgICB2YXIgX29hdXRoX2NvbnN1bWVyX2tleSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29ycmVzcG9uZGluZyBjb25zdW1lciBzZWNyZXRcbiAgICAgKi9cbiAgICB2YXIgX29hdXRoX2NvbnN1bWVyX3NlY3JldCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXBwLW9ubHkgYmVhcmVyIHRva2VuLiBVc2VkIHRvIGF1dGhvcml6ZSBhcHAtb25seSByZXF1ZXN0c1xuICAgICAqL1xuICAgIHZhciBfb2F1dGhfYmVhcmVyX3Rva2VuID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBBUEkgZW5kcG9pbnQgYmFzZSB0byB1c2VcbiAgICAgKi9cbiAgICB2YXIgX2VuZHBvaW50X2Jhc2UgPSBcImh0dHBzOi8vYXBpLnR3aXR0ZXIuY29tL1wiO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1lZGlhIEFQSSBlbmRwb2ludCBiYXNlIHRvIHVzZVxuICAgICAqL1xuICAgIHZhciBfZW5kcG9pbnRfYmFzZV9tZWRpYSA9IFwiaHR0cHM6Ly91cGxvYWQudHdpdHRlci5jb20vXCI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgQVBJIGVuZHBvaW50IHRvIHVzZVxuICAgICAqL1xuICAgIHZhciBfZW5kcG9pbnQgPSBfZW5kcG9pbnRfYmFzZSArIFwiMS4xL1wiO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1lZGlhIEFQSSBlbmRwb2ludCB0byB1c2VcbiAgICAgKi9cbiAgICB2YXIgX2VuZHBvaW50X21lZGlhID0gX2VuZHBvaW50X2Jhc2VfbWVkaWEgKyBcIjEuMS9cIjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBBUEkgZW5kcG9pbnQgYmFzZSB0byB1c2VcbiAgICAgKi9cbiAgICB2YXIgX2VuZHBvaW50X29hdXRoID0gX2VuZHBvaW50X2Jhc2U7XG5cbiAgICAvKipcbiAgICAgKiBBUEkgcHJveHkgZW5kcG9pbnRcbiAgICAgKi9cbiAgICB2YXIgX2VuZHBvaW50X3Byb3h5ID0gXCJodHRwczovL2FwaS5qdWJsby5uZXQvY29kZWJpcmQvXCI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgQVBJIGVuZHBvaW50IHRvIHVzZSBmb3Igb2xkIHJlcXVlc3RzXG4gICAgICovXG4gICAgdmFyIF9lbmRwb2ludF9vbGQgPSBfZW5kcG9pbnRfYmFzZSArIFwiMS9cIjtcblxuICAgIC8qKlxuICAgICAqIFVzZSBKU09OUCBmb3IgR0VUIHJlcXVlc3RzIGluIElFNy05XG4gICAgICovXG4gICAgdmFyIF91c2VfanNvbnAgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICAmJiB0eXBlb2YgbmF2aWdhdG9yLnVzZXJBZ2VudCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICAmJiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiVHJpZGVudC80XCIpID4gLTFcbiAgICAgICAgICAgIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIlRyaWRlbnQvNVwiKSA+IC0xXG4gICAgICAgICAgICB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJNU0lFIDcuMFwiKSA+IC0xXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byBhY2Nlc3MgdGhlIEFQSSB2aWEgYSBwcm94eSB0aGF0IGlzIGFsbG93ZWQgYnkgQ09SU1xuICAgICAqIEFzc3VtZSB0aGF0IENPUlMgaXMgb25seSBuZWNlc3NhcnkgaW4gYnJvd3NlcnNcbiAgICAgKi9cbiAgICB2YXIgX3VzZV9wcm94eSA9ICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICYmIHR5cGVvZiBuYXZpZ2F0b3IudXNlckFnZW50ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBSZXF1ZXN0IG9yIGFjY2VzcyB0b2tlbi4gVXNlZCB0byBzaWduIHJlcXVlc3RzXG4gICAgICovXG4gICAgdmFyIF9vYXV0aF90b2tlbiA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29ycmVzcG9uZGluZyByZXF1ZXN0IG9yIGFjY2VzcyB0b2tlbiBzZWNyZXRcbiAgICAgKi9cbiAgICB2YXIgX29hdXRoX3Rva2VuX3NlY3JldCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCBDb2RlYmlyZCB2ZXJzaW9uXG4gICAgICovXG4gICAgdmFyIF92ZXJzaW9uID0gXCIyLjYuMFwiO1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgT0F1dGggY29uc3VtZXIga2V5IGFuZCBzZWNyZXQgKEFwcCBrZXkpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nIGtleSAgICBPQXV0aCBjb25zdW1lciBrZXlcbiAgICAgKiBAcGFyYW0gc3RyaW5nIHNlY3JldCBPQXV0aCBjb25zdW1lciBzZWNyZXRcbiAgICAgKlxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHZhciBzZXRDb25zdW1lcktleSA9IGZ1bmN0aW9uIChrZXksIHNlY3JldCkge1xuICAgICAgICBfb2F1dGhfY29uc3VtZXJfa2V5ID0ga2V5O1xuICAgICAgICBfb2F1dGhfY29uc3VtZXJfc2VjcmV0ID0gc2VjcmV0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBPQXV0aDIgYXBwLW9ubHkgYXV0aCBiZWFyZXIgdG9rZW5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgdG9rZW4gT0F1dGgyIGJlYXJlciB0b2tlblxuICAgICAqXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgdmFyIHNldEJlYXJlclRva2VuID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIF9vYXV0aF9iZWFyZXJfdG9rZW4gPSB0b2tlbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgY3VycmVudCBDb2RlYmlyZCB2ZXJzaW9uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgdmVyc2lvbiBudW1iZXJcbiAgICAgKi9cbiAgICB2YXIgZ2V0VmVyc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF92ZXJzaW9uO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBPQXV0aCByZXF1ZXN0IG9yIGFjY2VzcyB0b2tlbiBhbmQgc2VjcmV0IChVc2VyIGtleSlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgdG9rZW4gIE9BdXRoIHJlcXVlc3Qgb3IgYWNjZXNzIHRva2VuXG4gICAgICogQHBhcmFtIHN0cmluZyBzZWNyZXQgT0F1dGggcmVxdWVzdCBvciBhY2Nlc3MgdG9rZW4gc2VjcmV0XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICB2YXIgc2V0VG9rZW4gPSBmdW5jdGlvbiAodG9rZW4sIHNlY3JldCkge1xuICAgICAgICBfb2F1dGhfdG9rZW4gPSB0b2tlbjtcbiAgICAgICAgX29hdXRoX3Rva2VuX3NlY3JldCA9IHNlY3JldDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBvciBkaXNhYmxlcyBDT1JTIHByb3h5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gYm9vbCB1c2VfcHJveHkgV2hldGhlciB0byB1c2UgQ09SUyBwcm94eSBvciBub3RcbiAgICAgKlxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHZhciBzZXRVc2VQcm94eSA9IGZ1bmN0aW9uICh1c2VfcHJveHkpIHtcbiAgICAgICAgX3VzZV9wcm94eSA9ICEhIHVzZV9wcm94eTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyBjdXN0b20gQ09SUyBwcm94eSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgcHJveHkgQWRkcmVzcyBvZiBwcm94eSBzZXJ2ZXIgdG8gdXNlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICB2YXIgc2V0UHJveHkgPSBmdW5jdGlvbiAocHJveHkpIHtcbiAgICAgICAgLy8gYWRkIHRyYWlsaW5nIHNsYXNoIGlmIG1pc3NpbmdcbiAgICAgICAgaWYgKCEgcHJveHkubWF0Y2goL1xcLyQvKSkge1xuICAgICAgICAgICAgcHJveHkgKz0gXCIvXCI7XG4gICAgICAgIH1cbiAgICAgICAgX2VuZHBvaW50X3Byb3h5ID0gcHJveHk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlIFVSTC1zdHlsZSBwYXJhbWV0ZXJzIGludG8gb2JqZWN0XG4gICAgICpcbiAgICAgKiB2ZXJzaW9uOiAxMTA5LjIwMTVcbiAgICAgKiBkaXNjdXNzIGF0OiBodHRwOi8vcGhwanMub3JnL2Z1bmN0aW9ucy9wYXJzZV9zdHJcbiAgICAgKiArICAgb3JpZ2luYWwgYnk6IENhZ3JpIEVraW5cbiAgICAgKiArICAgaW1wcm92ZWQgYnk6IE1pY2hhZWwgV2hpdGUgKGh0dHA6Ly9nZXRzcHJpbmsuY29tKVxuICAgICAqICsgICAgdHdlYWtlZCBieTogSmFja1xuICAgICAqICsgICBidWdmaXhlZCBieTogT25ubyBNYXJzbWFuXG4gICAgICogKyAgIHJlaW1wbGVtZW50ZWQgYnk6IHN0YWcwMTlcbiAgICAgKiArICAgYnVnZml4ZWQgYnk6IEJyZXR0IFphbWlyIChodHRwOi8vYnJldHQtemFtaXIubWUpXG4gICAgICogKyAgIGJ1Z2ZpeGVkIGJ5OiBzdGFnMDE5XG4gICAgICogLSAgICBkZXBlbmRzIG9uOiB1cmxkZWNvZGVcbiAgICAgKiArICAgaW5wdXQgYnk6IERyZWFtZXJcbiAgICAgKiArICAgYnVnZml4ZWQgYnk6IEJyZXR0IFphbWlyIChodHRwOi8vYnJldHQtemFtaXIubWUpXG4gICAgICogJSAgICAgICAgbm90ZSAxOiBXaGVuIG5vIGFyZ3VtZW50IGlzIHNwZWNpZmllZCwgd2lsbCBwdXQgdmFyaWFibGVzIGluIGdsb2JhbCBzY29wZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgc3RyIFN0cmluZyB0byBwYXJzZVxuICAgICAqIEBwYXJhbSBhcnJheSBhcnJheSB0byBsb2FkIGRhdGEgaW50b1xuICAgICAqXG4gICAgICogQHJldHVybiBvYmplY3RcbiAgICAgKi9cbiAgICB2YXIgX3BhcnNlX3N0ciA9IGZ1bmN0aW9uIChzdHIsIGFycmF5KSB7XG4gICAgICAgIHZhciBnbHVlMSA9IFwiPVwiLFxuICAgICAgICAgICAgZ2x1ZTIgPSBcIiZcIixcbiAgICAgICAgICAgIGFycmF5MiA9IFN0cmluZyhzdHIpLnJlcGxhY2UoL14mPyhbXFxzXFxTXSo/KSY/JC8sIFwiJDFcIikuc3BsaXQoZ2x1ZTIpLFxuICAgICAgICAgICAgaSwgaiwgY2hyLCB0bXAsIGtleSwgdmFsdWUsIGJyYWNrZXQsIGtleXMsIGV2YWxTdHIsXG4gICAgICAgICAgICBmaXhTdHIgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoLyhbXFxcXFwiJ10pL2csIFwiXFxcXCQxXCIpLnJlcGxhY2UoL1xcbi9nLCBcIlxcXFxuXCIpLnJlcGxhY2UoL1xcci9nLCBcIlxcXFxyXCIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgaWYgKCEgYXJyYXkpIHtcbiAgICAgICAgICAgIGFycmF5ID0gdGhpcy53aW5kb3c7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYXJyYXkyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0bXAgPSBhcnJheTJbaV0uc3BsaXQoZ2x1ZTEpO1xuICAgICAgICAgICAgaWYgKHRtcC5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gW3RtcCwgXCJcIl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXkgPSBmaXhTdHIodG1wWzBdKTtcbiAgICAgICAgICAgIHZhbHVlID0gZml4U3RyKHRtcFsxXSk7XG4gICAgICAgICAgICB3aGlsZSAoa2V5LmNoYXJBdCgwKSA9PT0gXCIgXCIpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBrZXkuc3Vic3RyKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKFwiXFwwXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleSA9IGtleS5zdWJzdHIoMCwga2V5LmluZGV4T2YoXCJcXDBcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleSAmJiBrZXkuY2hhckF0KDApICE9PSBcIltcIikge1xuICAgICAgICAgICAgICAgIGtleXMgPSBbXTtcbiAgICAgICAgICAgICAgICBicmFja2V0ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwga2V5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuY2hhckF0KGopID09PSBcIltcIiAmJiAhYnJhY2tldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJhY2tldCA9IGogKyAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleS5jaGFyQXQoaikgPT09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnJhY2tldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleS5zdWJzdHIoMCwgYnJhY2tldCAtIDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleS5zdWJzdHIoYnJhY2tldCwgaiAtIGJyYWNrZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFja2V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LmNoYXJBdChqICsgMSkgIT09IFwiW1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleXMgPSBba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGtleXNbMF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY2hyID0ga2V5c1swXS5jaGFyQXQoaik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaHIgPT09IFwiIFwiIHx8IGNociA9PT0gXCIuXCIgfHwgY2hyID09PSBcIltcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5c1swXSA9IGtleXNbMF0uc3Vic3RyKDAsIGopICsgXCJfXCIgKyBrZXlzWzBdLnN1YnN0cihqICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNociA9PT0gXCJbXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGpzaGludCAtVzA2MSAqL1xuICAgICAgICAgICAgICAgIGV2YWxTdHIgPSBcImFycmF5XCI7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChrZXkgIT09IFwiXCIgJiYga2V5ICE9PSBcIiBcIikgfHwgaiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0gXCInXCIgKyBrZXkgKyBcIidcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IGV2YWwoZXZhbFN0ciArIFwiLnB1c2goW10pO1wiKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZXZhbFN0ciArPSBcIltcIiArIGtleSArIFwiXVwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaiAhPT0ga2V5cy5sZW5ndGggLSAxICYmIGV2YWwoXCJ0eXBlb2YgXCIgKyBldmFsU3RyKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZhbChldmFsU3RyICsgXCIgPSBbXTtcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZhbFN0ciArPSBcIiA9ICdcIiArIHZhbHVlICsgXCInO1xcblwiO1xuICAgICAgICAgICAgICAgIGV2YWwoZXZhbFN0cik7XG4gICAgICAgICAgICAgICAgLyoganNoaW50ICtXMDYxICovXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbG93ZWQgQVBJIG1ldGhvZHMsIHNvcnRlZCBieSBHRVQgb3IgUE9TVFxuICAgICAqIFdhdGNoIG91dCBmb3IgbXVsdGlwbGUtbWV0aG9kIFwiYWNjb3VudC9zZXR0aW5nc1wiIVxuICAgICAqXG4gICAgICogQHJldHVybiBhcnJheSAkYXBpbWV0aG9kc1xuICAgICAqL1xuICAgIHZhciBnZXRBcGlNZXRob2RzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaHR0cG1ldGhvZHMgPSB7XG4gICAgICAgICAgICBHRVQ6IFtcbiAgICAgICAgICAgICAgICBcImFjY291bnQvc2V0dGluZ3NcIixcbiAgICAgICAgICAgICAgICBcImFjY291bnQvdmVyaWZ5X2NyZWRlbnRpYWxzXCIsXG4gICAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9yYXRlX2xpbWl0X3N0YXR1c1wiLFxuICAgICAgICAgICAgICAgIFwiYmxvY2tzL2lkc1wiLFxuICAgICAgICAgICAgICAgIFwiYmxvY2tzL2xpc3RcIixcbiAgICAgICAgICAgICAgICBcImRpcmVjdF9tZXNzYWdlc1wiLFxuICAgICAgICAgICAgICAgIFwiZGlyZWN0X21lc3NhZ2VzL3NlbnRcIixcbiAgICAgICAgICAgICAgICBcImRpcmVjdF9tZXNzYWdlcy9zaG93XCIsXG4gICAgICAgICAgICAgICAgXCJmYXZvcml0ZXMvbGlzdFwiLFxuICAgICAgICAgICAgICAgIFwiZm9sbG93ZXJzL2lkc1wiLFxuICAgICAgICAgICAgICAgIFwiZm9sbG93ZXJzL2xpc3RcIixcbiAgICAgICAgICAgICAgICBcImZyaWVuZHMvaWRzXCIsXG4gICAgICAgICAgICAgICAgXCJmcmllbmRzL2xpc3RcIixcbiAgICAgICAgICAgICAgICBcImZyaWVuZHNoaXBzL2luY29taW5nXCIsXG4gICAgICAgICAgICAgICAgXCJmcmllbmRzaGlwcy9sb29rdXBcIixcbiAgICAgICAgICAgICAgICBcImZyaWVuZHNoaXBzL2xvb2t1cFwiLFxuICAgICAgICAgICAgICAgIFwiZnJpZW5kc2hpcHMvbm9fcmV0d2VldHMvaWRzXCIsXG4gICAgICAgICAgICAgICAgXCJmcmllbmRzaGlwcy9vdXRnb2luZ1wiLFxuICAgICAgICAgICAgICAgIFwiZnJpZW5kc2hpcHMvc2hvd1wiLFxuICAgICAgICAgICAgICAgIFwiZ2VvL2lkLzpwbGFjZV9pZFwiLFxuICAgICAgICAgICAgICAgIFwiZ2VvL3JldmVyc2VfZ2VvY29kZVwiLFxuICAgICAgICAgICAgICAgIFwiZ2VvL3NlYXJjaFwiLFxuICAgICAgICAgICAgICAgIFwiZ2VvL3NpbWlsYXJfcGxhY2VzXCIsXG4gICAgICAgICAgICAgICAgXCJoZWxwL2NvbmZpZ3VyYXRpb25cIixcbiAgICAgICAgICAgICAgICBcImhlbHAvbGFuZ3VhZ2VzXCIsXG4gICAgICAgICAgICAgICAgXCJoZWxwL3ByaXZhY3lcIixcbiAgICAgICAgICAgICAgICBcImhlbHAvdG9zXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9saXN0XCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9tZW1iZXJzXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9tZW1iZXJzL3Nob3dcIixcbiAgICAgICAgICAgICAgICBcImxpc3RzL21lbWJlcnNoaXBzXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9vd25lcnNoaXBzXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9zaG93XCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9zdGF0dXNlc1wiLFxuICAgICAgICAgICAgICAgIFwibGlzdHMvc3Vic2NyaWJlcnNcIixcbiAgICAgICAgICAgICAgICBcImxpc3RzL3N1YnNjcmliZXJzL3Nob3dcIixcbiAgICAgICAgICAgICAgICBcImxpc3RzL3N1YnNjcmlwdGlvbnNcIixcbiAgICAgICAgICAgICAgICBcIm11dGVzL3VzZXJzL2lkc1wiLFxuICAgICAgICAgICAgICAgIFwibXV0ZXMvdXNlcnMvbGlzdFwiLFxuICAgICAgICAgICAgICAgIFwib2F1dGgvYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJvYXV0aC9hdXRob3JpemVcIixcbiAgICAgICAgICAgICAgICBcInNhdmVkX3NlYXJjaGVzL2xpc3RcIixcbiAgICAgICAgICAgICAgICBcInNhdmVkX3NlYXJjaGVzL3Nob3cvOmlkXCIsXG4gICAgICAgICAgICAgICAgXCJzZWFyY2gvdHdlZXRzXCIsXG4gICAgICAgICAgICAgICAgXCJzdGF0dXNlcy9ob21lX3RpbWVsaW5lXCIsXG4gICAgICAgICAgICAgICAgXCJzdGF0dXNlcy9tZW50aW9uc190aW1lbGluZVwiLFxuICAgICAgICAgICAgICAgIFwic3RhdHVzZXMvb2VtYmVkXCIsXG4gICAgICAgICAgICAgICAgXCJzdGF0dXNlcy9yZXR3ZWV0ZXJzL2lkc1wiLFxuICAgICAgICAgICAgICAgIFwic3RhdHVzZXMvcmV0d2VldHMvOmlkXCIsXG4gICAgICAgICAgICAgICAgXCJzdGF0dXNlcy9yZXR3ZWV0c19vZl9tZVwiLFxuICAgICAgICAgICAgICAgIFwic3RhdHVzZXMvc2hvdy86aWRcIixcbiAgICAgICAgICAgICAgICBcInN0YXR1c2VzL3VzZXJfdGltZWxpbmVcIixcbiAgICAgICAgICAgICAgICBcInRyZW5kcy9hdmFpbGFibGVcIixcbiAgICAgICAgICAgICAgICBcInRyZW5kcy9jbG9zZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJ0cmVuZHMvcGxhY2VcIixcbiAgICAgICAgICAgICAgICBcInVzZXJzL2NvbnRyaWJ1dGVlc1wiLFxuICAgICAgICAgICAgICAgIFwidXNlcnMvY29udHJpYnV0b3JzXCIsXG4gICAgICAgICAgICAgICAgXCJ1c2Vycy9wcm9maWxlX2Jhbm5lclwiLFxuICAgICAgICAgICAgICAgIFwidXNlcnMvc2VhcmNoXCIsXG4gICAgICAgICAgICAgICAgXCJ1c2Vycy9zaG93XCIsXG4gICAgICAgICAgICAgICAgXCJ1c2Vycy9zdWdnZXN0aW9uc1wiLFxuICAgICAgICAgICAgICAgIFwidXNlcnMvc3VnZ2VzdGlvbnMvOnNsdWdcIixcbiAgICAgICAgICAgICAgICBcInVzZXJzL3N1Z2dlc3Rpb25zLzpzbHVnL21lbWJlcnNcIixcblxuICAgICAgICAgICAgICAgIC8vIEludGVybmFsXG4gICAgICAgICAgICAgICAgXCJ1c2Vycy9yZWNvbW1lbmRhdGlvbnNcIixcbiAgICAgICAgICAgICAgICBcImFjY291bnQvcHVzaF9kZXN0aW5hdGlvbnMvZGV2aWNlXCIsXG4gICAgICAgICAgICAgICAgXCJhY3Rpdml0eS9hYm91dF9tZVwiLFxuICAgICAgICAgICAgICAgIFwiYWN0aXZpdHkvYnlfZnJpZW5kc1wiLFxuICAgICAgICAgICAgICAgIFwic3RhdHVzZXMvbWVkaWFfdGltZWxpbmVcIixcbiAgICAgICAgICAgICAgICBcInRpbWVsaW5lL2hvbWVcIixcbiAgICAgICAgICAgICAgICBcImhlbHAvZXhwZXJpbWVudHNcIixcbiAgICAgICAgICAgICAgICBcInNlYXJjaC90eXBlYWhlYWRcIixcbiAgICAgICAgICAgICAgICBcInNlYXJjaC91bml2ZXJzYWxcIixcbiAgICAgICAgICAgICAgICBcImRpc2NvdmVyL3VuaXZlcnNhbFwiLFxuICAgICAgICAgICAgICAgIFwiY29udmVyc2F0aW9uL3Nob3dcIixcbiAgICAgICAgICAgICAgICBcInN0YXR1c2VzLzppZC9hY3Rpdml0eS9zdW1tYXJ5XCIsXG4gICAgICAgICAgICAgICAgXCJhY2NvdW50L2xvZ2luX3ZlcmlmaWNhdGlvbl9lbnJvbGxtZW50XCIsXG4gICAgICAgICAgICAgICAgXCJhY2NvdW50L2xvZ2luX3ZlcmlmaWNhdGlvbl9yZXF1ZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJwcm9tcHRzL3N1Z2dlc3RcIixcblxuICAgICAgICAgICAgICAgIFwiYmV0YS90aW1lbGluZXMvY3VzdG9tL2xpc3RcIixcbiAgICAgICAgICAgICAgICBcImJldGEvdGltZWxpbmVzL3RpbWVsaW5lXCIsXG4gICAgICAgICAgICAgICAgXCJiZXRhL3RpbWVsaW5lcy9jdXN0b20vc2hvd1wiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgUE9TVDogW1xuICAgICAgICAgICAgICAgIFwiYWNjb3VudC9yZW1vdmVfcHJvZmlsZV9iYW5uZXJcIixcbiAgICAgICAgICAgICAgICBcImFjY291bnQvc2V0dGluZ3NfX3Bvc3RcIixcbiAgICAgICAgICAgICAgICBcImFjY291bnQvdXBkYXRlX2RlbGl2ZXJ5X2RldmljZVwiLFxuICAgICAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZVwiLFxuICAgICAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9iYWNrZ3JvdW5kX2ltYWdlXCIsXG4gICAgICAgICAgICAgICAgXCJhY2NvdW50L3VwZGF0ZV9wcm9maWxlX2Jhbm5lclwiLFxuICAgICAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9jb2xvcnNcIixcbiAgICAgICAgICAgICAgICBcImFjY291bnQvdXBkYXRlX3Byb2ZpbGVfaW1hZ2VcIixcbiAgICAgICAgICAgICAgICBcImJsb2Nrcy9jcmVhdGVcIixcbiAgICAgICAgICAgICAgICBcImJsb2Nrcy9kZXN0cm95XCIsXG4gICAgICAgICAgICAgICAgXCJkaXJlY3RfbWVzc2FnZXMvZGVzdHJveVwiLFxuICAgICAgICAgICAgICAgIFwiZGlyZWN0X21lc3NhZ2VzL25ld1wiLFxuICAgICAgICAgICAgICAgIFwiZmF2b3JpdGVzL2NyZWF0ZVwiLFxuICAgICAgICAgICAgICAgIFwiZmF2b3JpdGVzL2Rlc3Ryb3lcIixcbiAgICAgICAgICAgICAgICBcImZyaWVuZHNoaXBzL2NyZWF0ZVwiLFxuICAgICAgICAgICAgICAgIFwiZnJpZW5kc2hpcHMvZGVzdHJveVwiLFxuICAgICAgICAgICAgICAgIFwiZnJpZW5kc2hpcHMvdXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9jcmVhdGVcIixcbiAgICAgICAgICAgICAgICBcImxpc3RzL2Rlc3Ryb3lcIixcbiAgICAgICAgICAgICAgICBcImxpc3RzL21lbWJlcnMvY3JlYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9tZW1iZXJzL2NyZWF0ZV9hbGxcIixcbiAgICAgICAgICAgICAgICBcImxpc3RzL21lbWJlcnMvZGVzdHJveVwiLFxuICAgICAgICAgICAgICAgIFwibGlzdHMvbWVtYmVycy9kZXN0cm95X2FsbFwiLFxuICAgICAgICAgICAgICAgIFwibGlzdHMvc3Vic2NyaWJlcnMvY3JlYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy9zdWJzY3JpYmVycy9kZXN0cm95XCIsXG4gICAgICAgICAgICAgICAgXCJsaXN0cy91cGRhdGVcIixcbiAgICAgICAgICAgICAgICBcIm1lZGlhL3VwbG9hZFwiLFxuICAgICAgICAgICAgICAgIFwibXV0ZXMvdXNlcnMvY3JlYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJtdXRlcy91c2Vycy9kZXN0cm95XCIsXG4gICAgICAgICAgICAgICAgXCJvYXV0aC9hY2Nlc3NfdG9rZW5cIixcbiAgICAgICAgICAgICAgICBcIm9hdXRoL3JlcXVlc3RfdG9rZW5cIixcbiAgICAgICAgICAgICAgICBcIm9hdXRoMi9pbnZhbGlkYXRlX3Rva2VuXCIsXG4gICAgICAgICAgICAgICAgXCJvYXV0aDIvdG9rZW5cIixcbiAgICAgICAgICAgICAgICBcInNhdmVkX3NlYXJjaGVzL2NyZWF0ZVwiLFxuICAgICAgICAgICAgICAgIFwic2F2ZWRfc2VhcmNoZXMvZGVzdHJveS86aWRcIixcbiAgICAgICAgICAgICAgICBcInN0YXR1c2VzL2Rlc3Ryb3kvOmlkXCIsXG4gICAgICAgICAgICAgICAgXCJzdGF0dXNlcy9sb29rdXBcIixcbiAgICAgICAgICAgICAgICBcInN0YXR1c2VzL3JldHdlZXQvOmlkXCIsXG4gICAgICAgICAgICAgICAgXCJzdGF0dXNlcy91cGRhdGVcIixcbiAgICAgICAgICAgICAgICBcInN0YXR1c2VzL3VwZGF0ZV93aXRoX21lZGlhXCIsIC8vIGRlcHJlY2F0ZWQsIHVzZSBtZWRpYS91cGxvYWRcbiAgICAgICAgICAgICAgICBcInVzZXJzL2xvb2t1cFwiLFxuICAgICAgICAgICAgICAgIFwidXNlcnMvcmVwb3J0X3NwYW1cIixcblxuICAgICAgICAgICAgICAgIC8vIEludGVybmFsXG4gICAgICAgICAgICAgICAgXCJkaXJlY3RfbWVzc2FnZXMvcmVhZFwiLFxuICAgICAgICAgICAgICAgIFwiYWNjb3VudC9sb2dpbl92ZXJpZmljYXRpb25fZW5yb2xsbWVudF9fcG9zdFwiLFxuICAgICAgICAgICAgICAgIFwicHVzaF9kZXN0aW5hdGlvbnMvZW5hYmxlX2xvZ2luX3ZlcmlmaWNhdGlvblwiLFxuICAgICAgICAgICAgICAgIFwiYWNjb3VudC9sb2dpbl92ZXJpZmljYXRpb25fcmVxdWVzdF9fcG9zdFwiLFxuXG4gICAgICAgICAgICAgICAgXCJiZXRhL3RpbWVsaW5lcy9jdXN0b20vY3JlYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJiZXRhL3RpbWVsaW5lcy9jdXN0b20vdXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJiZXRhL3RpbWVsaW5lcy9jdXN0b20vZGVzdHJveVwiLFxuICAgICAgICAgICAgICAgIFwiYmV0YS90aW1lbGluZXMvY3VzdG9tL2FkZFwiLFxuICAgICAgICAgICAgICAgIFwiYmV0YS90aW1lbGluZXMvY3VzdG9tL3JlbW92ZVwiXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBodHRwbWV0aG9kcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFpbiBBUEkgaGFuZGxlciB3b3JraW5nIG9uIGFueSByZXF1ZXN0cyB5b3UgaXNzdWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgICBmbiAgICAgICAgICAgIFRoZSBtZW1iZXIgZnVuY3Rpb24geW91IGNhbGxlZFxuICAgICAqIEBwYXJhbSBhcnJheSAgICBwYXJhbXMgICAgICAgIFRoZSBwYXJhbWV0ZXJzIHlvdSBzZW50IGFsb25nXG4gICAgICogQHBhcmFtIGZ1bmN0aW9uIGNhbGxiYWNrICAgICAgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2l0aCB0aGUgcmVwbHlcbiAgICAgKiBAcGFyYW0gYm9vbCAgICAgYXBwX29ubHlfYXV0aCBXaGV0aGVyIHRvIHVzZSBhcHAtb25seSBhdXRoXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIG1peGVkIFRoZSBBUEkgcmVwbHkgZW5jb2RlZCBpbiB0aGUgc2V0IHJldHVybl9mb3JtYXRcbiAgICAgKi9cblxuICAgIHZhciBfX2NhbGwgPSBmdW5jdGlvbiAoZm4sIHBhcmFtcywgY2FsbGJhY2ssIGFwcF9vbmx5X2F1dGgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHBhcmFtcyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYXBwX29ubHlfYXV0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgYXBwX29ubHlfYXV0aCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gcGFyYW1zO1xuICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIGFwcF9vbmx5X2F1dGggPSBjYWxsYmFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChmbikge1xuICAgICAgICBjYXNlIFwib2F1dGhfYXV0aGVudGljYXRlXCI6XG4gICAgICAgIGNhc2UgXCJvYXV0aF9hdXRob3JpemVcIjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzW2ZuXShwYXJhbXMsIGNhbGxiYWNrKTtcblxuICAgICAgICBjYXNlIFwib2F1dGgyX3Rva2VuXCI6XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tmbl0oY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlc2V0IHRva2VuIHdoZW4gcmVxdWVzdGluZyBhIG5ldyB0b2tlbiAoY2F1c2VzIDQwMSBmb3Igc2lnbmF0dXJlIGVycm9yIG9uIDJuZCsgcmVxdWVzdHMpXG4gICAgICAgIGlmIChmbiA9PT0gXCJvYXV0aF9yZXF1ZXN0VG9rZW5cIikge1xuICAgICAgICAgICAgc2V0VG9rZW4obnVsbCwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcGFyc2UgcGFyYW1ldGVyc1xuICAgICAgICB2YXIgYXBpcGFyYW1zID0ge307XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBhcGlwYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcGFyc2Vfc3RyKHBhcmFtcywgYXBpcGFyYW1zKTsgLy9UT0RPXG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYXAgZnVuY3Rpb24gbmFtZSB0byBBUEkgbWV0aG9kXG4gICAgICAgIHZhciBtZXRob2QgPSBcIlwiO1xuICAgICAgICB2YXIgcGFyYW0sIGksIGo7XG5cbiAgICAgICAgLy8gcmVwbGFjZSBfIGJ5IC9cbiAgICAgICAgdmFyIHBhdGggPSBmbi5zcGxpdChcIl9cIik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICBtZXRob2QgKz0gXCIvXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXRob2QgKz0gcGF0aFtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVuZG8gcmVwbGFjZW1lbnQgZm9yIFVSTCBwYXJhbWV0ZXJzXG4gICAgICAgIHZhciB1cmxfcGFyYW1ldGVyc193aXRoX3VuZGVyc2NvcmUgPSBbXCJzY3JlZW5fbmFtZVwiLCBcInBsYWNlX2lkXCJdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdXJsX3BhcmFtZXRlcnNfd2l0aF91bmRlcnNjb3JlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJhbSA9IHVybF9wYXJhbWV0ZXJzX3dpdGhfdW5kZXJzY29yZVtpXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIHJlcGxhY2VtZW50X3dhcyA9IHBhcmFtLnNwbGl0KFwiX1wiKS5qb2luKFwiL1wiKTtcbiAgICAgICAgICAgIG1ldGhvZCA9IG1ldGhvZC5zcGxpdChyZXBsYWNlbWVudF93YXMpLmpvaW4ocGFyYW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVwbGFjZSBBQSBieSBVUkwgcGFyYW1ldGVyc1xuICAgICAgICB2YXIgbWV0aG9kX3RlbXBsYXRlID0gbWV0aG9kO1xuICAgICAgICB2YXIgbWF0Y2ggPSBtZXRob2QubWF0Y2goL1tBLVpfXXsyLH0vKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWF0Y2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwYXJhbSA9IG1hdGNoW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbV9sID0gcGFyYW0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBtZXRob2RfdGVtcGxhdGUgPSBtZXRob2RfdGVtcGxhdGUuc3BsaXQocGFyYW0pLmpvaW4oXCI6XCIgKyBwYXJhbV9sKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFwaXBhcmFtc1twYXJhbV9sXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgMjY7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kX3RlbXBsYXRlID0gbWV0aG9kX3RlbXBsYXRlLnNwbGl0KFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBqKSkuam9pbihcIl9cIiArIFN0cmluZy5mcm9tQ2hhckNvZGUoOTcgKyBqKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVG8gY2FsbCB0aGUgdGVtcGxhdGVkIG1ldGhvZCBcXFwiXCIgKyBtZXRob2RfdGVtcGxhdGUgKyBcIlxcXCIsIHNwZWNpZnkgdGhlIHBhcmFtZXRlciB2YWx1ZSBmb3IgXFxcIlwiICsgcGFyYW1fbCArIFwiXFxcIi5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1ldGhvZCA9IG1ldGhvZC5zcGxpdChwYXJhbSkuam9pbihhcGlwYXJhbXNbcGFyYW1fbF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhcGlwYXJhbXNbcGFyYW1fbF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXBsYWNlIEEtWiBieSBfYS16XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAyNjsgaSsrKSB7XG4gICAgICAgICAgICBtZXRob2QgPSBtZXRob2Quc3BsaXQoU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIGkpKS5qb2luKFwiX1wiICsgU3RyaW5nLmZyb21DaGFyQ29kZSg5NyArIGkpKTtcbiAgICAgICAgICAgIG1ldGhvZF90ZW1wbGF0ZSA9IG1ldGhvZF90ZW1wbGF0ZS5zcGxpdChTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgaSkpLmpvaW4oXCJfXCIgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKDk3ICsgaSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGh0dHBtZXRob2QgPSBfZGV0ZWN0TWV0aG9kKG1ldGhvZF90ZW1wbGF0ZSwgYXBpcGFyYW1zKTtcbiAgICAgICAgdmFyIG11bHRpcGFydCA9IF9kZXRlY3RNdWx0aXBhcnQobWV0aG9kX3RlbXBsYXRlKTtcbiAgICAgICAgdmFyIGludGVybmFsID0gX2RldGVjdEludGVybmFsKG1ldGhvZF90ZW1wbGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuIF9jYWxsQXBpKFxuICAgICAgICAgICAgaHR0cG1ldGhvZCxcbiAgICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICAgIGFwaXBhcmFtcyxcbiAgICAgICAgICAgIG11bHRpcGFydCxcbiAgICAgICAgICAgIGFwcF9vbmx5X2F1dGgsXG4gICAgICAgICAgICBpbnRlcm5hbCxcbiAgICAgICAgICAgIGNhbGxiYWNrXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIE9BdXRoIGF1dGhlbnRpY2F0ZSBVUkwgZm9yIHRoZSBjdXJyZW50IHJlcXVlc3QgdG9rZW5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gc3RyaW5nIFRoZSBPQXV0aCBhdXRoZW50aWNhdGUgVVJMXG4gICAgICovXG4gICAgdmFyIG9hdXRoX2F1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uIChwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLmZvcmNlX2xvZ2luID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBwYXJhbXMuZm9yY2VfbG9naW4gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1zLnNjcmVlbl9uYW1lID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBwYXJhbXMuc2NyZWVuX25hbWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfb2F1dGhfdG9rZW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRvIGdldCB0aGUgYXV0aGVudGljYXRlIFVSTCwgdGhlIE9BdXRoIHRva2VuIG11c3QgYmUgc2V0LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdXJsID0gX2VuZHBvaW50X29hdXRoICsgXCJvYXV0aC9hdXRoZW50aWNhdGU/b2F1dGhfdG9rZW49XCIgKyBfdXJsKF9vYXV0aF90b2tlbik7XG4gICAgICAgIGlmIChwYXJhbXMuZm9yY2VfbG9naW4gPT09IHRydWUpIHtcbiAgICAgICAgICAgIHVybCArPSBcIiZmb3JjZV9sb2dpbj0xXCI7XG4gICAgICAgICAgICBpZiAocGFyYW1zLnNjcmVlbl9uYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdXJsICs9IFwiJnNjcmVlbl9uYW1lPVwiICsgcGFyYW1zLnNjcmVlbl9uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKHVybCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBPQXV0aCBhdXRob3JpemUgVVJMIGZvciB0aGUgY3VycmVudCByZXF1ZXN0IHRva2VuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgT0F1dGggYXV0aG9yaXplIFVSTFxuICAgICAqL1xuICAgIHZhciBvYXV0aF9hdXRob3JpemUgPSBmdW5jdGlvbiAocGFyYW1zLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5mb3JjZV9sb2dpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcGFyYW1zLmZvcmNlX2xvZ2luID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHBhcmFtcy5zY3JlZW5fbmFtZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcGFyYW1zLnNjcmVlbl9uYW1lID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX29hdXRoX3Rva2VuID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUbyBnZXQgdGhlIGF1dGhvcml6ZSBVUkwsIHRoZSBPQXV0aCB0b2tlbiBtdXN0IGJlIHNldC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHVybCA9IF9lbmRwb2ludF9vYXV0aCArIFwib2F1dGgvYXV0aG9yaXplP29hdXRoX3Rva2VuPVwiICsgX3VybChfb2F1dGhfdG9rZW4pO1xuICAgICAgICBpZiAocGFyYW1zLmZvcmNlX2xvZ2luID09PSB0cnVlKSB7XG4gICAgICAgICAgICB1cmwgKz0gXCImZm9yY2VfbG9naW49MVwiO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5zY3JlZW5fbmFtZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHVybCArPSBcIiZzY3JlZW5fbmFtZT1cIiArIHBhcmFtcy5zY3JlZW5fbmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayh1cmwpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgT0F1dGggYmVhcmVyIHRva2VuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgT0F1dGggYmVhcmVyIHRva2VuXG4gICAgICovXG5cbiAgICB2YXIgb2F1dGgyX3Rva2VuID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChfb2F1dGhfY29uc3VtZXJfa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUbyBvYnRhaW4gYSBiZWFyZXIgdG9rZW4sIHRoZSBjb25zdW1lciBrZXkgbXVzdCBiZSBzZXQuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwb3N0X2ZpZWxkcyA9IFwiZ3JhbnRfdHlwZT1jbGllbnRfY3JlZGVudGlhbHNcIjtcbiAgICAgICAgdmFyIHVybCA9IF9lbmRwb2ludF9vYXV0aCArIFwib2F1dGgyL3Rva2VuXCI7XG5cbiAgICAgICAgaWYgKF91c2VfcHJveHkpIHtcbiAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIF9lbmRwb2ludF9iYXNlLFxuICAgICAgICAgICAgICAgIF9lbmRwb2ludF9wcm94eVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB4bWwgPSBfZ2V0WG1sUmVxdWVzdE9iamVjdCgpO1xuICAgICAgICBpZiAoeG1sID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgeG1sLm9wZW4oXCJQT1NUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgIHhtbC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIpO1xuICAgICAgICB4bWwuc2V0UmVxdWVzdEhlYWRlcihcbiAgICAgICAgICAgIChfdXNlX3Byb3h5ID8gXCJYLVwiIDogXCJcIikgKyBcIkF1dGhvcml6YXRpb25cIixcbiAgICAgICAgICAgIFwiQmFzaWMgXCIgKyBfYmFzZTY0X2VuY29kZShfb2F1dGhfY29uc3VtZXJfa2V5ICsgXCI6XCIgKyBfb2F1dGhfY29uc3VtZXJfc2VjcmV0KVxuICAgICAgICApO1xuXG4gICAgICAgIHhtbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoeG1sLnJlYWR5U3RhdGUgPj0gNCkge1xuICAgICAgICAgICAgICAgIHZhciBodHRwc3RhdHVzID0gMTIwMjc7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaHR0cHN0YXR1cyA9IHhtbC5zdGF0dXM7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geG1sLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgICAgIHZhciByZXBseSA9IF9wYXJzZUFwaVJlcGx5KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXBseS5odHRwc3RhdHVzID0gaHR0cHN0YXR1cztcbiAgICAgICAgICAgICAgICBpZiAoaHR0cHN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldEJlYXJlclRva2VuKHJlcGx5LmFjY2Vzc190b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlcGx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgeG1sLnNlbmQocG9zdF9maWVsZHMpO1xuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNpZ25pbmcgaGVscGVyc1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVVJMLWVuY29kZXMgdGhlIGdpdmVuIGRhdGFcbiAgICAgKlxuICAgICAqIEBwYXJhbSBtaXhlZCBkYXRhXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIG1peGVkIFRoZSBlbmNvZGVkIGRhdGFcbiAgICAgKi9cbiAgICB2YXIgX3VybCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGlmICgoL2Jvb2xlYW58bnVtYmVyfHN0cmluZy8pLnRlc3QodHlwZW9mIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGRhdGEpLnJlcGxhY2UoLyEvZywgXCIlMjFcIikucmVwbGFjZSgvJy9nLCBcIiUyN1wiKS5yZXBsYWNlKC9cXCgvZywgXCIlMjhcIikucmVwbGFjZSgvXFwpL2csIFwiJTI5XCIpLnJlcGxhY2UoL1xcKi9nLCBcIiUyQVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGJhc2U2NC1lbmNvZGVkIFNIQTEgaGFzaCBmb3IgdGhlIGdpdmVuIGRhdGFcbiAgICAgKlxuICAgICAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2VjdXJlIEhhc2ggQWxnb3JpdGhtLCBTSEEtMSwgYXMgZGVmaW5lZFxuICAgICAqIGluIEZJUFMgUFVCIDE4MC0xXG4gICAgICogQmFzZWQgb24gdmVyc2lvbiAyLjEgQ29weXJpZ2h0IFBhdWwgSm9obnN0b24gMjAwMCAtIDIwMDIuXG4gICAgICogT3RoZXIgY29udHJpYnV0b3JzOiBHcmVnIEhvbHQsIEFuZHJldyBLZXBlcnQsIFlkbmFyLCBMb3N0aW5ldFxuICAgICAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxuICAgICAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHN0cmluZyBkYXRhIFRoZSBkYXRhIHRvIGNhbGN1bGF0ZSB0aGUgaGFzaCBmcm9tXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgaGFzaFxuICAgICAqL1xuICAgIHZhciBfc2hhMSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gbihlLCBiKSB7XG4gICAgICAgICAgICBlW2IgPj4gNV0gfD0gMTI4IDw8IDI0IC0gYiAlIDMyO1xuICAgICAgICAgICAgZVsoYiArIDY0ID4+IDkgPDwgNCkgKyAxNV0gPSBiO1xuICAgICAgICAgICAgZm9yICh2YXIgYyA9IG5ldyBBcnJheSg4MCksIGEgPSAxNzMyNTg0MTkzLCBkID0gLTI3MTczMzg3OSwgaCA9IC0xNzMyNTg0MTk0LFxuICAgICAgICAgICAgICAgICAgICBrID0gMjcxNzMzODc4LCBnID0gLTEwMDk1ODk3NzYsIHAgPSAwOyBwIDwgZS5sZW5ndGg7IHAgKz0gMTYpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBvID0gYSwgcSA9IGQsIHIgPSBoLCBzID0gaywgdCA9IGcsIGYgPSAwOyA4MCA+IGY7IGYrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZiA8IDE2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtID0gZVtwICsgZl07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtID0gY1tmIC0gM10gXiBjW2YgLSA4XSBeIGNbZiAtIDE0XSBeIGNbZiAtIDE2XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0gPSBtIDw8IDEgfCBtID4+PiAzMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNbZl0gPSBtO1xuICAgICAgICAgICAgICAgICAgICBtID0gbChsKGEgPDwgNSB8IGEgPj4+IDI3LCAyMCA+IGYgPyBkICYgaCB8IH5kICYgayA6IDQwID4gZiA/IGQgXlxuICAgICAgICAgICAgICAgICAgICAgICAgaCBeIGsgOiA2MCA+IGYgPyBkICYgaCB8IGQgJiBrIHwgaCAmIGsgOiBkIF4gaCBeIGspLCBsKFxuICAgICAgICAgICAgICAgICAgICAgICAgbChnLCBjW2ZdKSwgMjAgPiBmID8gMTUxODUwMDI0OSA6IDQwID4gZiA/IDE4NTk3NzUzOTMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgNjAgPiBmID8gLTE4OTQwMDc1ODggOiAtODk5NDk3NTE0KSk7XG4gICAgICAgICAgICAgICAgICAgIGcgPSBrO1xuICAgICAgICAgICAgICAgICAgICBrID0gaDtcbiAgICAgICAgICAgICAgICAgICAgaCA9IGQgPDwgMzAgfCBkID4+PiAyO1xuICAgICAgICAgICAgICAgICAgICBkID0gYTtcbiAgICAgICAgICAgICAgICAgICAgYSA9IG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGEgPSBsKGEsIG8pO1xuICAgICAgICAgICAgICAgIGQgPSBsKGQsIHEpO1xuICAgICAgICAgICAgICAgIGggPSBsKGgsIHIpO1xuICAgICAgICAgICAgICAgIGsgPSBsKGssIHMpO1xuICAgICAgICAgICAgICAgIGcgPSBsKGcsIHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFthLCBkLCBoLCBrLCBnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGwoZSwgYikge1xuICAgICAgICAgICAgdmFyIGMgPSAoZSAmIDY1NTM1KSArIChiICYgNjU1MzUpO1xuICAgICAgICAgICAgcmV0dXJuIChlID4+IDE2KSArIChiID4+IDE2KSArIChjID4+IDE2KSA8PCAxNiB8IGMgJiA2NTUzNTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHEoZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgYiA9IFtdLCBjID0gKDEgPDwgZykgLSAxLCBhID0gMDsgYSA8IGUubGVuZ3RoICogZzsgYSArPSBnKSB7XG4gICAgICAgICAgICAgICAgYlthID4+IDVdIHw9IChlLmNoYXJDb2RlQXQoYSAvIGcpICYgYykgPDwgMjQgLSBhICUgMzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZyA9IDg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGIgPSBfb2F1dGhfY29uc3VtZXJfc2VjcmV0ICsgXCImXCIgKyAobnVsbCAhPT0gX29hdXRoX3Rva2VuX3NlY3JldCA/XG4gICAgICAgICAgICAgICAgX29hdXRoX3Rva2VuX3NlY3JldCA6IFwiXCIpO1xuICAgICAgICAgICAgaWYgKF9vYXV0aF9jb25zdW1lcl9zZWNyZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUbyBnZW5lcmF0ZSBhIGhhc2gsIHRoZSBjb25zdW1lciBzZWNyZXQgbXVzdCBiZSBzZXQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGMgPSBxKGIpO1xuICAgICAgICAgICAgaWYgKGMubGVuZ3RoID4gMTYpIHtcbiAgICAgICAgICAgICAgICBjID0gbihjLCBiLmxlbmd0aCAqIGcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYiA9IG5ldyBBcnJheSgxNik7XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gbmV3IEFycmF5KDE2KSwgZCA9IDA7IGQgPCAxNjsgZCsrKSB7XG4gICAgICAgICAgICAgICAgYVtkXSA9IGNbZF0gXiA5MDk1MjI0ODY7XG4gICAgICAgICAgICAgICAgYltkXSA9IGNbZF0gXiAxNTQ5NTU2ODI4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyA9IG4oYS5jb25jYXQocShlKSksIDUxMiArIGUubGVuZ3RoICogZyk7XG4gICAgICAgICAgICBiID0gbihiLmNvbmNhdChjKSwgNjcyKTtcbiAgICAgICAgICAgIGMgPSBcIlwiO1xuICAgICAgICAgICAgZm9yIChhID0gMDsgYSA8IDQgKiBiLmxlbmd0aDsgYSArPSAzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChkID0gKGJbYSA+PiAyXSA+PiA4ICogKDMgLSBhICUgNCkgJiAyNTUpIDw8IDE2IHwgKGJbYSArIDEgPj4gMl0gPj5cbiAgICAgICAgICAgICAgICAgICAgOCAqICgzIC0gKGEgKyAxKSAlIDQpICYgMjU1KSA8PCA4IHwgYlthICsgMiA+PiAyXSA+PiA4ICogKDMgLVxuICAgICAgICAgICAgICAgICAgICAoYSArIDIpICUgNCkgJiAyNTUsIGUgPSAwOyA0ID4gZTsgZSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGMgPSA4ICogYSArIDYgKiBlID4gMzIgKiBiLmxlbmd0aCA/IGMgKyBcIj1cIiA6IGMgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jaGFyQXQoZCA+PiA2ICogKDMgLSBlKSAmIDYzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfTtcbiAgICB9KCk7XG5cbiAgICAvKlxuICAgICAqIEdldHMgdGhlIGJhc2U2NCByZXByZXNlbnRhdGlvbiBmb3IgdGhlIGdpdmVuIGRhdGFcbiAgICAgKlxuICAgICAqIGh0dHA6Ly9waHBqcy5vcmdcbiAgICAgKiArICAgb3JpZ2luYWwgYnk6IFR5bGVyIEFraW5zIChodHRwOi8vcnVta2luLmNvbSlcbiAgICAgKiArICAgaW1wcm92ZWQgYnk6IEJheXJvbiBHdWV2YXJhXG4gICAgICogKyAgIGltcHJvdmVkIGJ5OiBUaHVuZGVyLm1cbiAgICAgKiArICAgaW1wcm92ZWQgYnk6IEtldmluIHZhbiBab25uZXZlbGQgKGh0dHA6Ly9rZXZpbi52YW56b25uZXZlbGQubmV0KVxuICAgICAqICsgICBidWdmaXhlZCBieTogUGVsbGVudGVzcXVlIE1hbGVzdWFkYVxuICAgICAqICsgICBpbXByb3ZlZCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cDovL2tldmluLnZhbnpvbm5ldmVsZC5uZXQpXG4gICAgICogKyAgIGltcHJvdmVkIGJ5OiBSYWZhxYIgS3VrYXdza2kgKGh0dHA6Ly9rdWthd3NraS5wbClcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgZGF0YSBUaGUgZGF0YSB0byBjYWxjdWxhdGUgdGhlIGJhc2U2NCByZXByZXNlbnRhdGlvbiBmcm9tXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgYmFzZTY0IHJlcHJlc2VudGF0aW9uXG4gICAgICovXG4gICAgdmFyIF9iYXNlNjRfZW5jb2RlID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgdmFyIGQsIGUsIGYsIGIsIGcgPSAwLFxuICAgICAgICAgICAgaCA9IDAsXG4gICAgICAgICAgICBpID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiLFxuICAgICAgICAgICAgYyA9IFtdO1xuICAgICAgICBpZiAoIWEpIHtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGQgPSBhLmNoYXJDb2RlQXQoZysrKTtcbiAgICAgICAgICAgIGUgPSBhLmNoYXJDb2RlQXQoZysrKTtcbiAgICAgICAgICAgIGYgPSBhLmNoYXJDb2RlQXQoZysrKTtcbiAgICAgICAgICAgIGIgPSBkIDw8IDE2IHwgZSA8PCA4IHwgZjtcbiAgICAgICAgICAgIGQgPSBiID4+IDE4ICYgNjM7XG4gICAgICAgICAgICBlID0gYiA+PiAxMiAmIDYzO1xuICAgICAgICAgICAgZiA9IGIgPj4gNiAmIDYzO1xuICAgICAgICAgICAgYiAmPSA2MztcbiAgICAgICAgICAgIGNbaCsrXSA9IGkuY2hhckF0KGQpICsgaS5jaGFyQXQoZSkgKyBpLmNoYXJBdChmKSArIGkuY2hhckF0KGIpO1xuICAgICAgICB9IHdoaWxlIChnIDwgYS5sZW5ndGgpO1xuICAgICAgICBjID0gYy5qb2luKFwiXCIpO1xuICAgICAgICBhID0gYS5sZW5ndGggJSAzO1xuICAgICAgICByZXR1cm4gKGEgPyBjLnNsaWNlKDAsIGEgLSAzKSA6IGMpICsgXCI9PT1cIi5zbGljZShhIHx8IDMpO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIEJ1aWxkcyBhIEhUVFAgcXVlcnkgc3RyaW5nIGZyb20gdGhlIGdpdmVuIGRhdGFcbiAgICAgKlxuICAgICAqIGh0dHA6Ly9waHBqcy5vcmdcbiAgICAgKiArICAgICBvcmlnaW5hbCBieTogS2V2aW4gdmFuIFpvbm5ldmVsZCAoaHR0cDovL2tldmluLnZhbnpvbm5ldmVsZC5uZXQpXG4gICAgICogKyAgICAgaW1wcm92ZWQgYnk6IExlZ2FldiBBbmRyZXlcbiAgICAgKiArICAgICBpbXByb3ZlZCBieTogTWljaGFlbCBXaGl0ZSAoaHR0cDovL2dldHNwcmluay5jb20pXG4gICAgICogKyAgICAgaW1wcm92ZWQgYnk6IEtldmluIHZhbiBab25uZXZlbGQgKGh0dHA6Ly9rZXZpbi52YW56b25uZXZlbGQubmV0KVxuICAgICAqICsgICAgIGltcHJvdmVkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cDovL2JyZXR0LXphbWlyLm1lKVxuICAgICAqICsgICAgICAgIHJldmlzZWQgYnk6IHN0YWcwMTlcbiAgICAgKiArICAgICBpbnB1dCBieTogRHJlYW1lclxuICAgICAqICsgICAgIGJ1Z2ZpeGVkIGJ5OiBCcmV0dCBaYW1pciAoaHR0cDovL2JyZXR0LXphbWlyLm1lKVxuICAgICAqICsgICAgIGJ1Z2ZpeGVkIGJ5OiBNSU9fS09EVUtJIChodHRwOi8vbWlvLWtvZHVraS5ibG9nc3BvdC5jb20vKVxuICAgICAqXG4gICAgICogQHBhcmFtIHN0cmluZyBkYXRhIFRoZSBkYXRhIHRvIGNvbmNhdGVuYXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgSFRUUCBxdWVyeVxuICAgICAqL1xuICAgIHZhciBfaHR0cF9idWlsZF9xdWVyeSA9IGZ1bmN0aW9uIChlLCBmLCBiKSB7XG4gICAgICAgIGZ1bmN0aW9uIGcoYywgYSwgZCkge1xuICAgICAgICAgICAgdmFyIGIsIGUgPSBbXTtcbiAgICAgICAgICAgIGlmIChhID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYSA9IFwiMVwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGEgPSBcIjBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9PSBhKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoYiBpbiBhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYVtiXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHVzaChnKGMgKyBcIltcIiArIGIgKyBcIl1cIiwgYVtiXSwgZCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmpvaW4oZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdXJsKGMpICsgXCI9XCIgKyBfdXJsKGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUaGVyZSB3YXMgYW4gZXJyb3IgcHJvY2Vzc2luZyBmb3IgaHR0cF9idWlsZF9xdWVyeSgpLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGQsIGMsIGggPSBbXTtcbiAgICAgICAgaWYgKCEgYikge1xuICAgICAgICAgICAgYiA9IFwiJlwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoYyBpbiBlKSB7XG4gICAgICAgICAgICBkID0gZVtjXTtcbiAgICAgICAgICAgIGlmIChmICYmICEgaXNOYU4oYykpIHtcbiAgICAgICAgICAgICAgICBjID0gU3RyaW5nKGYpICsgYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGQgPSBnKGMsIGQsIGIpO1xuICAgICAgICAgICAgaWYgKGQgIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBoLnB1c2goZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGguam9pbihiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgKGhvcGVmdWxseSkgdW5pcXVlIHJhbmRvbSBzdHJpbmdcbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbnQgb3B0aW9uYWwgbGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIHN0cmluZyB0byBnZW5lcmF0ZVxuICAgICAqXG4gICAgICogQHJldHVybiBzdHJpbmcgVGhlIHJhbmRvbSBzdHJpbmdcbiAgICAgKi9cbiAgICB2YXIgX25vbmNlID0gZnVuY3Rpb24gKGxlbmd0aCkge1xuICAgICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgbGVuZ3RoID0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiSW52YWxpZCBub25jZSBsZW5ndGguXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub25jZSA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGFyYWN0ZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2MSk7XG4gICAgICAgICAgICBub25jZSArPSBcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hUWmFiY2RlZmdoaWtsbW5vcHFyc3R1dnd4eXpcIi5zdWJzdHJpbmcoY2hhcmFjdGVyLCBjaGFyYWN0ZXIgKyAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9uY2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNvcnQgYXJyYXkgZWxlbWVudHMgYnkga2V5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJyYXkgaW5wdXRfYXJyIFRoZSBhcnJheSB0byBzb3J0XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGFycmF5IFRoZSBzb3J0ZWQga2V5c1xuICAgICAqL1xuICAgIHZhciBfa3NvcnQgPSBmdW5jdGlvbiAoaW5wdXRfYXJyKSB7XG4gICAgICAgIHZhciBrZXlzID0gW10sIHNvcnRlciwgaztcblxuICAgICAgICBzb3J0ZXIgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgdmFyIGFfZmxvYXQgPSBwYXJzZUZsb2F0KGEpLFxuICAgICAgICAgICAgYl9mbG9hdCA9IHBhcnNlRmxvYXQoYiksXG4gICAgICAgICAgICBhX251bWVyaWMgPSBhX2Zsb2F0ICsgXCJcIiA9PT0gYSxcbiAgICAgICAgICAgIGJfbnVtZXJpYyA9IGJfZmxvYXQgKyBcIlwiID09PSBiO1xuICAgICAgICAgICAgaWYgKGFfbnVtZXJpYyAmJiBiX251bWVyaWMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYV9mbG9hdCA+IGJfZmxvYXQgPyAxIDogYV9mbG9hdCA8IGJfZmxvYXQgPyAtMSA6IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFfbnVtZXJpYyAmJiAhYl9udW1lcmljKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFhX251bWVyaWMgJiYgYl9udW1lcmljKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGEgPiBiID8gMSA6IGEgPCBiID8gLTEgOiAwO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE1ha2UgYSBsaXN0IG9mIGtleSBuYW1lc1xuICAgICAgICBmb3IgKGsgaW4gaW5wdXRfYXJyKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXRfYXJyLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGtleXMuc29ydChzb3J0ZXIpO1xuICAgICAgICByZXR1cm4ga2V5cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xvbmUgb2JqZWN0c1xuICAgICAqXG4gICAgICogQHBhcmFtIG9iamVjdCBvYmogICAgVGhlIG9iamVjdCB0byBjbG9uZVxuICAgICAqXG4gICAgICogQHJldHVybiBvYmplY3QgY2xvbmUgVGhlIGNsb25lZCBvYmplY3RcbiAgICAgKi9cbiAgICB2YXIgX2Nsb25lID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY2xvbmUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yob2JqW2ldKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGNsb25lW2ldID0gX2Nsb25lKG9ialtpXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsb25lW2ldID0gb2JqW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGFuIE9BdXRoIHNpZ25hdHVyZVxuICAgICAqXG4gICAgICogQHBhcmFtIHN0cmluZyAgICAgICAgICBodHRwbWV0aG9kICAgIFVzdWFsbHkgZWl0aGVyICdHRVQnIG9yICdQT1NUJyBvciAnREVMRVRFJ1xuICAgICAqIEBwYXJhbSBzdHJpbmcgICAgICAgICAgbWV0aG9kICAgICAgICBUaGUgQVBJIG1ldGhvZCB0byBjYWxsXG4gICAgICogQHBhcmFtIGFycmF5ICBvcHRpb25hbCBwYXJhbXMgICAgICAgIFRoZSBBUEkgY2FsbCBwYXJhbWV0ZXJzLCBhc3NvY2lhdGl2ZVxuICAgICAqIEBwYXJhbSBib29sICAgb3B0aW9uYWwgYXBwZW5kX3RvX2dldCBXaGV0aGVyIHRvIGFwcGVuZCB0aGUgT0F1dGggcGFyYW1zIHRvIEdFVFxuICAgICAqXG4gICAgICogQHJldHVybiBzdHJpbmcgQXV0aG9yaXphdGlvbiBIVFRQIGhlYWRlclxuICAgICAqL1xuICAgIHZhciBfc2lnbiA9IGZ1bmN0aW9uIChodHRwbWV0aG9kLCBtZXRob2QsIHBhcmFtcywgYXBwZW5kX3RvX2dldCkge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBhcHBlbmRfdG9fZ2V0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBhcHBlbmRfdG9fZ2V0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9vYXV0aF9jb25zdW1lcl9rZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRvIGdlbmVyYXRlIGEgc2lnbmF0dXJlLCB0aGUgY29uc3VtZXIga2V5IG11c3QgYmUgc2V0LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2lnbl9wYXJhbXMgPSB7XG4gICAgICAgICAgICBjb25zdW1lcl9rZXk6ICAgICBfb2F1dGhfY29uc3VtZXJfa2V5LFxuICAgICAgICAgICAgdmVyc2lvbjogICAgICAgICAgXCIxLjBcIixcbiAgICAgICAgICAgIHRpbWVzdGFtcDogICAgICAgIE1hdGgucm91bmQobmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwKSxcbiAgICAgICAgICAgIG5vbmNlOiAgICAgICAgICAgIF9ub25jZSgpLFxuICAgICAgICAgICAgc2lnbmF0dXJlX21ldGhvZDogXCJITUFDLVNIQTFcIlxuICAgICAgICB9O1xuICAgICAgICB2YXIgc2lnbl9iYXNlX3BhcmFtcyA9IHt9O1xuICAgICAgICB2YXIgdmFsdWU7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzaWduX3BhcmFtcykge1xuICAgICAgICAgICAgdmFsdWUgPSBzaWduX3BhcmFtc1trZXldO1xuICAgICAgICAgICAgc2lnbl9iYXNlX3BhcmFtc1tcIm9hdXRoX1wiICsga2V5XSA9IF91cmwodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfb2F1dGhfdG9rZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNpZ25fYmFzZV9wYXJhbXMub2F1dGhfdG9rZW4gPSBfdXJsKF9vYXV0aF90b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9hdXRoX3BhcmFtcyA9IF9jbG9uZShzaWduX2Jhc2VfcGFyYW1zKTtcbiAgICAgICAgZm9yIChrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBhcmFtc1trZXldO1xuICAgICAgICAgICAgc2lnbl9iYXNlX3BhcmFtc1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGtleXMgPSBfa3NvcnQoc2lnbl9iYXNlX3BhcmFtcyk7XG4gICAgICAgIHZhciBzaWduX2Jhc2Vfc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgdmFsdWUgPSBzaWduX2Jhc2VfcGFyYW1zW2tleV07XG4gICAgICAgICAgICBzaWduX2Jhc2Vfc3RyaW5nICs9IGtleSArIFwiPVwiICsgX3VybCh2YWx1ZSkgKyBcIiZcIjtcbiAgICAgICAgfVxuICAgICAgICBzaWduX2Jhc2Vfc3RyaW5nID0gc2lnbl9iYXNlX3N0cmluZy5zdWJzdHJpbmcoMCwgc2lnbl9iYXNlX3N0cmluZy5sZW5ndGggLSAxKTtcbiAgICAgICAgdmFyIHNpZ25hdHVyZSAgICA9IF9zaGExKGh0dHBtZXRob2QgKyBcIiZcIiArIF91cmwobWV0aG9kKSArIFwiJlwiICsgX3VybChzaWduX2Jhc2Vfc3RyaW5nKSk7XG5cbiAgICAgICAgcGFyYW1zID0gYXBwZW5kX3RvX2dldCA/IHNpZ25fYmFzZV9wYXJhbXMgOiBvYXV0aF9wYXJhbXM7XG4gICAgICAgIHBhcmFtcy5vYXV0aF9zaWduYXR1cmUgPSBzaWduYXR1cmU7XG4gICAgICAgIGtleXMgPSBfa3NvcnQocGFyYW1zKTtcbiAgICAgICAgdmFyIGF1dGhvcml6YXRpb24gPSBcIlwiO1xuICAgICAgICBpZiAoYXBwZW5kX3RvX2dldCkge1xuICAgICAgICAgICAgZm9yKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uICs9IGtleSArIFwiPVwiICsgX3VybCh2YWx1ZSkgKyBcIiZcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhdXRob3JpemF0aW9uLnN1YnN0cmluZygwLCBhdXRob3JpemF0aW9uLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGF1dGhvcml6YXRpb24gPSBcIk9BdXRoIFwiO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIHZhbHVlID0gcGFyYW1zW2tleV07XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uICs9IGtleSArIFwiPVxcXCJcIiArIF91cmwodmFsdWUpICsgXCJcXFwiLCBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXV0aG9yaXphdGlvbi5zdWJzdHJpbmcoMCwgYXV0aG9yaXphdGlvbi5sZW5ndGggLSAyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0cyBIVFRQIG1ldGhvZCB0byB1c2UgZm9yIEFQSSBjYWxsXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nIG1ldGhvZCBUaGUgQVBJIG1ldGhvZCB0byBjYWxsXG4gICAgICogQHBhcmFtIGFycmF5ICBwYXJhbXMgVGhlIHBhcmFtZXRlcnMgdG8gc2VuZCBhbG9uZ1xuICAgICAqXG4gICAgICogQHJldHVybiBzdHJpbmcgVGhlIEhUVFAgbWV0aG9kIHRoYXQgc2hvdWxkIGJlIHVzZWRcbiAgICAgKi9cbiAgICB2YXIgX2RldGVjdE1ldGhvZCA9IGZ1bmN0aW9uIChtZXRob2QsIHBhcmFtcykge1xuICAgICAgICAvLyBtdWx0aS1IVFRQIG1ldGhvZCBlbmRwb2ludHNcbiAgICAgICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgICAgY2FzZSBcImFjY291bnQvc2V0dGluZ3NcIjpcbiAgICAgICAgY2FzZSBcImFjY291bnQvbG9naW5fdmVyaWZpY2F0aW9uX2Vucm9sbG1lbnRcIjpcbiAgICAgICAgY2FzZSBcImFjY291bnQvbG9naW5fdmVyaWZpY2F0aW9uX3JlcXVlc3RcIjpcbiAgICAgICAgICAgIG1ldGhvZCA9IHBhcmFtcy5sZW5ndGggPyBtZXRob2QgKyBcIl9fcG9zdFwiIDogbWV0aG9kO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXBpbWV0aG9kcyA9IGdldEFwaU1ldGhvZHMoKTtcbiAgICAgICAgZm9yICh2YXIgaHR0cG1ldGhvZCBpbiBhcGltZXRob2RzKSB7XG4gICAgICAgICAgICBpZiAoYXBpbWV0aG9kc1todHRwbWV0aG9kXS5pbmRleE9mKG1ldGhvZCkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBodHRwbWV0aG9kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcIkNhbid0IGZpbmQgSFRUUCBtZXRob2QgdG8gdXNlIGZvciBcXFwiXCIgKyBtZXRob2QgKyBcIlxcXCIuXCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIGlmIEFQSSBjYWxsIHNob3VsZCB1c2UgbXVsdGlwYXJ0L2Zvcm0tZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIHN0cmluZyBtZXRob2QgVGhlIEFQSSBtZXRob2QgdG8gY2FsbFxuICAgICAqXG4gICAgICogQHJldHVybiBib29sIFdoZXRoZXIgdGhlIG1ldGhvZCBzaG91bGQgYmUgc2VudCBhcyBtdWx0aXBhcnRcbiAgICAgKi9cbiAgICB2YXIgX2RldGVjdE11bHRpcGFydCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgdmFyIG11bHRpcGFydHMgPSBbXG4gICAgICAgICAgICAvLyBUd2VldHNcbiAgICAgICAgICAgIFwic3RhdHVzZXMvdXBkYXRlX3dpdGhfbWVkaWFcIixcblxuICAgICAgICAgICAgLy8gVXNlcnNcbiAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9iYWNrZ3JvdW5kX2ltYWdlXCIsXG4gICAgICAgICAgICBcImFjY291bnQvdXBkYXRlX3Byb2ZpbGVfaW1hZ2VcIixcbiAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9iYW5uZXJcIlxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gbXVsdGlwYXJ0cy5pbmRleE9mKG1ldGhvZCkgPiAtMTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQnVpbGQgbXVsdGlwYXJ0IHJlcXVlc3QgZnJvbSB1cGxvYWQgcGFyYW1zXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nIG1ldGhvZCAgVGhlIEFQSSBtZXRob2QgdG8gY2FsbFxuICAgICAqIEBwYXJhbSBhcnJheSAgcGFyYW1zICBUaGUgcGFyYW1ldGVycyB0byBzZW5kIGFsb25nXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIG51bGx8c3RyaW5nIFRoZSBidWlsdCBtdWx0aXBhcnQgcmVxdWVzdCBib2R5XG4gICAgICovXG4gICAgdmFyIF9idWlsZE11bHRpcGFydCA9IGZ1bmN0aW9uIChtZXRob2QsIHBhcmFtcykge1xuICAgICAgICAvLyB3ZWxsLCBmaWxlcyB3aWxsIG9ubHkgd29yayBpbiBtdWx0aXBhcnQgbWV0aG9kc1xuICAgICAgICBpZiAoISBfZGV0ZWN0TXVsdGlwYXJ0KG1ldGhvZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgY2hlY2sgc3BlY2lmaWMgcGFyYW1ldGVyc1xuICAgICAgICB2YXIgcG9zc2libGVfbWV0aG9kcyA9IFtcbiAgICAgICAgICAgIC8vIFR3ZWV0c1xuICAgICAgICAgICAgXCJzdGF0dXNlcy91cGRhdGVfd2l0aF9tZWRpYVwiLFxuICAgICAgICAgICAgLy8gQWNjb3VudHNcbiAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9iYWNrZ3JvdW5kX2ltYWdlXCIsXG4gICAgICAgICAgICBcImFjY291bnQvdXBkYXRlX3Byb2ZpbGVfaW1hZ2VcIixcbiAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9iYW5uZXJcIlxuICAgICAgICBdO1xuICAgICAgICB2YXIgcG9zc2libGVfZmlsZXMgPSB7XG4gICAgICAgICAgICAvLyBUd2VldHNcbiAgICAgICAgICAgIFwic3RhdHVzZXMvdXBkYXRlX3dpdGhfbWVkaWFcIjogXCJtZWRpYVtdXCIsXG4gICAgICAgICAgICAvLyBBY2NvdW50c1xuICAgICAgICAgICAgXCJhY2NvdW50L3VwZGF0ZV9wcm9maWxlX2JhY2tncm91bmRfaW1hZ2VcIjogXCJpbWFnZVwiLFxuICAgICAgICAgICAgXCJhY2NvdW50L3VwZGF0ZV9wcm9maWxlX2ltYWdlXCI6IFwiaW1hZ2VcIixcbiAgICAgICAgICAgIFwiYWNjb3VudC91cGRhdGVfcHJvZmlsZV9iYW5uZXJcIjogXCJiYW5uZXJcIlxuICAgICAgICB9O1xuICAgICAgICAvLyBtZXRob2QgbWlnaHQgaGF2ZSBmaWxlcz9cbiAgICAgICAgaWYgKHBvc3NpYmxlX21ldGhvZHMuaW5kZXhPZihtZXRob2QpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIGZpbGVuYW1lc1xuICAgICAgICBwb3NzaWJsZV9maWxlcyA9IHBvc3NpYmxlX2ZpbGVzW21ldGhvZF0uc3BsaXQoXCIgXCIpO1xuXG4gICAgICAgIHZhciBtdWx0aXBhcnRfYm9yZGVyID0gXCItLS0tLS0tLS0tLS0tLS0tLS0tLVwiICsgX25vbmNlKCk7XG4gICAgICAgIHZhciBtdWx0aXBhcnRfcmVxdWVzdCA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIG11bHRpcGFydF9yZXF1ZXN0ICs9XG4gICAgICAgICAgICAgICAgXCItLVwiICsgbXVsdGlwYXJ0X2JvcmRlciArIFwiXFxyXFxuXCJcbiAgICAgICAgICAgICAgICArIFwiQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPVxcXCJcIiArIGtleSArIFwiXFxcIlwiO1xuICAgICAgICAgICAgaWYgKHBvc3NpYmxlX2ZpbGVzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgbXVsdGlwYXJ0X3JlcXVlc3QgKz1cbiAgICAgICAgICAgICAgICAgICAgXCJcXHJcXG5Db250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiBiYXNlNjRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG11bHRpcGFydF9yZXF1ZXN0ICs9XG4gICAgICAgICAgICAgICAgXCJcXHJcXG5cXHJcXG5cIiArIHBhcmFtc1trZXldICsgXCJcXHJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBtdWx0aXBhcnRfcmVxdWVzdCArPSBcIi0tXCIgKyBtdWx0aXBhcnRfYm9yZGVyICsgXCItLVwiO1xuICAgICAgICByZXR1cm4gbXVsdGlwYXJ0X3JlcXVlc3Q7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdHMgaWYgQVBJIGNhbGwgaXMgaW50ZXJuYWxcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgbWV0aG9kIFRoZSBBUEkgbWV0aG9kIHRvIGNhbGxcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYm9vbCBXaGV0aGVyIHRoZSBtZXRob2QgaXMgZGVmaW5lZCBpbiBpbnRlcm5hbCBBUElcbiAgICAgKi9cbiAgICB2YXIgX2RldGVjdEludGVybmFsID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICB2YXIgaW50ZXJuYWxzID0gW1xuICAgICAgICAgICAgXCJ1c2Vycy9yZWNvbW1lbmRhdGlvbnNcIlxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gaW50ZXJuYWxzLmpvaW4oXCIgXCIpLmluZGV4T2YobWV0aG9kKSA+IC0xO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIGlmIEFQSSBjYWxsIHNob3VsZCB1c2UgbWVkaWEgZW5kcG9pbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgbWV0aG9kIFRoZSBBUEkgbWV0aG9kIHRvIGNhbGxcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYm9vbCBXaGV0aGVyIHRoZSBtZXRob2QgaXMgZGVmaW5lZCBpbiBtZWRpYSBBUElcbiAgICAgKi9cbiAgICB2YXIgX2RldGVjdE1lZGlhID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICB2YXIgbWVkaWFzID0gW1xuICAgICAgICAgICAgXCJtZWRpYS91cGxvYWRcIlxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gbWVkaWFzLmpvaW4oXCIgXCIpLmluZGV4T2YobWV0aG9kKSA+IC0xO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIGlmIEFQSSBjYWxsIHNob3VsZCB1c2Ugb2xkIGVuZHBvaW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nIG1ldGhvZCBUaGUgQVBJIG1ldGhvZCB0byBjYWxsXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGJvb2wgV2hldGhlciB0aGUgbWV0aG9kIGlzIGRlZmluZWQgaW4gb2xkIEFQSVxuICAgICAqL1xuICAgIHZhciBfZGV0ZWN0T2xkID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICB2YXIgb2xkcyA9IFtcbiAgICAgICAgICAgIFwiYWNjb3VudC9wdXNoX2Rlc3RpbmF0aW9ucy9kZXZpY2VcIlxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gb2xkcy5qb2luKFwiIFwiKS5pbmRleE9mKG1ldGhvZCkgPiAtMTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIHRoZSBjb21wbGV0ZSBBUEkgZW5kcG9pbnQgdXJsXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nIG1ldGhvZCBUaGUgQVBJIG1ldGhvZCB0byBjYWxsXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgVVJMIHRvIHNlbmQgdGhlIHJlcXVlc3QgdG9cbiAgICAgKi9cbiAgICB2YXIgX2dldEVuZHBvaW50ID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICB2YXIgdXJsO1xuICAgICAgICBpZiAobWV0aG9kLnN1YnN0cmluZygwLCA1KSA9PT0gXCJvYXV0aFwiKSB7XG4gICAgICAgICAgICB1cmwgPSBfZW5kcG9pbnRfb2F1dGggKyBtZXRob2Q7XG4gICAgICAgIH0gZWxzZSBpZiAoX2RldGVjdE1lZGlhKG1ldGhvZCkpIHtcbiAgICAgICAgICAgIHVybCA9IF9lbmRwb2ludF9tZWRpYSArIG1ldGhvZCArIFwiLmpzb25cIjtcbiAgICAgICAgfSBlbHNlIGlmIChfZGV0ZWN0T2xkKG1ldGhvZCkpIHtcbiAgICAgICAgICAgIHVybCA9IF9lbmRwb2ludF9vbGQgKyBtZXRob2QgKyBcIi5qc29uXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgPSBfZW5kcG9pbnQgKyBtZXRob2QgKyBcIi5qc29uXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgWE1MIEhUVFAgUmVxdWVzdCBvYmplY3QsIHRyeWluZyB0byBsb2FkIGl0IGluIHZhcmlvdXMgd2F5c1xuICAgICAqXG4gICAgICogQHJldHVybiBvYmplY3QgVGhlIFhNTEh0dHBSZXF1ZXN0IG9iamVjdCBpbnN0YW5jZVxuICAgICAqL1xuICAgIHZhciBfZ2V0WG1sUmVxdWVzdE9iamVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHhtbCA9IG51bGw7XG4gICAgICAgIC8vIGZpcnN0LCB0cnkgdGhlIFczLXN0YW5kYXJkIG9iamVjdFxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgJiYgd2luZG93XG4gICAgICAgICAgICAmJiB0eXBlb2Ygd2luZG93LlhNTEh0dHBSZXF1ZXN0ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgeG1sID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAvLyB0aGVuLCB0cnkgVGl0YW5pdW0gZnJhbWV3b3JrIG9iamVjdFxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBUaSA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgJiYgVGlcbiAgICAgICAgICAgICYmIHR5cGVvZiBUaS5OZXR3b3JrLmNyZWF0ZUhUVFBDbGllbnQgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB4bWwgPSBUaS5OZXR3b3JrLmNyZWF0ZUhUVFBDbGllbnQoKTtcbiAgICAgICAgLy8gYXJlIHdlIGluIGFuIG9sZCBJbnRlcm5ldCBFeHBsb3Jlcj9cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgQWN0aXZlWE9iamVjdCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgeG1sID0gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQWN0aXZlWE9iamVjdCBvYmplY3Qgbm90IGRlZmluZWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyBub3csIGNvbnNpZGVyIFJlcXVpcmVKUyBhbmQvb3IgTm9kZS5qcyBvYmplY3RzXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgJiYgcmVxdWlyZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIGxvb2sgZm9yIHhtbGh0dHByZXF1ZXN0IG1vZHVsZVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgWE1MSHR0cFJlcXVlc3QgPSByZXF1aXJlKFwieG1saHR0cHJlcXVlc3RcIikuWE1MSHR0cFJlcXVlc3Q7XG4gICAgICAgICAgICAgICAgeG1sID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlMSkge1xuICAgICAgICAgICAgICAgIC8vIG9yIG1heWJlIHRoZSB1c2VyIGlzIHVzaW5nIHhocjJcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgWE1MSHR0cFJlcXVlc3QgPSByZXF1aXJlKFwieGhyMlwiKTtcbiAgICAgICAgICAgICAgICAgICAgeG1sID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInhocjIgb2JqZWN0IG5vdCBkZWZpbmVkLCBjYW5jZWxsaW5nLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHhtbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbHMgdGhlIEFQSSB1c2luZyBjVVJMXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RyaW5nICAgICAgICAgIGh0dHBtZXRob2QgICAgVGhlIEhUVFAgbWV0aG9kIHRvIHVzZSBmb3IgbWFraW5nIHRoZSByZXF1ZXN0XG4gICAgICogQHBhcmFtIHN0cmluZyAgICAgICAgICBtZXRob2QgICAgICAgIFRoZSBBUEkgbWV0aG9kIHRvIGNhbGxcbiAgICAgKiBAcGFyYW0gYXJyYXkgIG9wdGlvbmFsIHBhcmFtcyAgICAgICAgVGhlIHBhcmFtZXRlcnMgdG8gc2VuZCBhbG9uZ1xuICAgICAqIEBwYXJhbSBib29sICAgb3B0aW9uYWwgbXVsdGlwYXJ0ICAgICBXaGV0aGVyIHRvIHVzZSBtdWx0aXBhcnQvZm9ybS1kYXRhXG4gICAgICogQHBhcmFtIGJvb2wgICBvcHRpb25hbCBhcHBfb25seV9hdXRoIFdoZXRoZXIgdG8gdXNlIGFwcC1vbmx5IGJlYXJlciBhdXRoZW50aWNhdGlvblxuICAgICAqIEBwYXJhbSBib29sICAgb3B0aW9uYWwgaW50ZXJuYWwgICAgICBXaGV0aGVyIHRvIHVzZSBpbnRlcm5hbCBjYWxsXG4gICAgICogQHBhcmFtIGZ1bmN0aW9uICAgICAgICBjYWxsYmFjayAgICAgIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdpdGggdGhlIEFQSSBjYWxsIHJlc3VsdFxuICAgICAqXG4gICAgICogQHJldHVybiBtaXhlZCBUaGUgQVBJIHJlcGx5LCBlbmNvZGVkIGluIHRoZSBzZXQgcmV0dXJuX2Zvcm1hdFxuICAgICAqL1xuXG4gICAgdmFyIF9jYWxsQXBpID0gZnVuY3Rpb24gKGh0dHBtZXRob2QsIG1ldGhvZCwgcGFyYW1zLCBtdWx0aXBhcnQsIGFwcF9vbmx5X2F1dGgsIGludGVybmFsLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtdWx0aXBhcnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIG11bHRpcGFydCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYXBwX29ubHlfYXV0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgYXBwX29ubHlfYXV0aCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW50ZXJuYWwpIHtcbiAgICAgICAgICAgIHBhcmFtcy5hZGMgICAgICAgICAgICA9IFwicGhvbmVcIjtcbiAgICAgICAgICAgIHBhcmFtcy5hcHBsaWNhdGlvbl9pZCA9IDMzMzkwMzI3MTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cmwgICAgICAgICAgID0gX2dldEVuZHBvaW50KG1ldGhvZCk7XG4gICAgICAgIHZhciBhdXRob3JpemF0aW9uID0gbnVsbDtcblxuICAgICAgICB2YXIgeG1sID0gX2dldFhtbFJlcXVlc3RPYmplY3QoKTtcbiAgICAgICAgaWYgKHhtbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb3N0X2ZpZWxkcztcblxuICAgICAgICBpZiAoaHR0cG1ldGhvZCA9PT0gXCJHRVRcIikge1xuICAgICAgICAgICAgdmFyIHVybF93aXRoX3BhcmFtcyA9IHVybDtcbiAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShwYXJhbXMpICE9PSBcInt9XCIpIHtcbiAgICAgICAgICAgICAgICB1cmxfd2l0aF9wYXJhbXMgKz0gXCI/XCIgKyBfaHR0cF9idWlsZF9xdWVyeShwYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEgYXBwX29ubHlfYXV0aCkge1xuICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb24gPSBfc2lnbihodHRwbWV0aG9kLCB1cmwsIHBhcmFtcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFwcGVuZCBhdXRoIHBhcmFtcyB0byBHRVQgdXJsIGZvciBJRTctOSwgdG8gc2VuZCB2aWEgSlNPTlBcbiAgICAgICAgICAgIGlmIChfdXNlX2pzb25wKSB7XG4gICAgICAgICAgICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KHBhcmFtcykgIT09IFwie31cIikge1xuICAgICAgICAgICAgICAgICAgICB1cmxfd2l0aF9wYXJhbXMgKz0gXCImXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsX3dpdGhfcGFyYW1zICs9IFwiP1wiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2tfbmFtZSA9IF9ub25jZSgpO1xuICAgICAgICAgICAgICAgIHdpbmRvd1tjYWxsYmFja19uYW1lXSA9IGZ1bmN0aW9uIChyZXBseSkge1xuICAgICAgICAgICAgICAgICAgICByZXBseS5odHRwc3RhdHVzID0gMjAwO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByYXRlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB4bWwuZ2V0UmVzcG9uc2VIZWFkZXIgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHhtbC5nZXRSZXNwb25zZUhlYWRlcihcIngtcmF0ZS1saW1pdC1saW1pdFwiKSAhPT0gXCJcIlxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IHhtbC5nZXRSZXNwb25zZUhlYWRlcihcIngtcmF0ZS1saW1pdC1saW1pdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmc6IHhtbC5nZXRSZXNwb25zZUhlYWRlcihcIngtcmF0ZS1saW1pdC1yZW1haW5pbmdcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHhtbC5nZXRSZXNwb25zZUhlYWRlcihcIngtcmF0ZS1saW1pdC1yZXNldFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyZXBseSwgcmF0ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYXJhbXMuY2FsbGJhY2sgPSBjYWxsYmFja19uYW1lO1xuICAgICAgICAgICAgICAgIHVybF93aXRoX3BhcmFtcyA9IHVybCArIFwiP1wiICsgX3NpZ24oaHR0cG1ldGhvZCwgdXJsLCBwYXJhbXMsIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgICAgIHRhZy50eXBlID0gXCJ0ZXh0L2phdmFzY3JpcHRcIjtcbiAgICAgICAgICAgICAgICB0YWcuc3JjID0gdXJsX3dpdGhfcGFyYW1zO1xuICAgICAgICAgICAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xuICAgICAgICAgICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQodGFnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3VzZV9wcm94eSkge1xuICAgICAgICAgICAgICAgIHVybF93aXRoX3BhcmFtcyA9IHVybF93aXRoX3BhcmFtcy5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBfZW5kcG9pbnRfYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgX2VuZHBvaW50X3Byb3h5XG4gICAgICAgICAgICAgICAgKS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBfZW5kcG9pbnRfYmFzZV9tZWRpYSxcbiAgICAgICAgICAgICAgICAgICAgX2VuZHBvaW50X3Byb3h5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhtbC5vcGVuKGh0dHBtZXRob2QsIHVybF93aXRoX3BhcmFtcywgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoX3VzZV9qc29ucCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlNlbmRpbmcgUE9TVCByZXF1ZXN0cyBpcyBub3Qgc3VwcG9ydGVkIGZvciBJRTctOS5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG11bHRpcGFydCkge1xuICAgICAgICAgICAgICAgIGlmICghIGFwcF9vbmx5X2F1dGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbiA9IF9zaWduKGh0dHBtZXRob2QsIHVybCwge30pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBfYnVpbGRNdWx0aXBhcnQobWV0aG9kLCBwYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoISBhcHBfb25seV9hdXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb24gPSBfc2lnbihodHRwbWV0aG9kLCB1cmwsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IF9odHRwX2J1aWxkX3F1ZXJ5KHBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3N0X2ZpZWxkcyA9IHBhcmFtcztcbiAgICAgICAgICAgIGlmIChfdXNlX3Byb3h5IHx8IG11bHRpcGFydCkgeyAvLyBmb3JjZSBwcm94eSBmb3IgbXVsdGlwYXJ0IGJhc2U2NFxuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBfZW5kcG9pbnRfYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgX2VuZHBvaW50X3Byb3h5XG4gICAgICAgICAgICAgICAgKS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBfZW5kcG9pbnRfYmFzZV9tZWRpYSxcbiAgICAgICAgICAgICAgICAgICAgX2VuZHBvaW50X3Byb3h5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhtbC5vcGVuKGh0dHBtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAobXVsdGlwYXJ0KSB7XG4gICAgICAgICAgICAgICAgeG1sLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJtdWx0aXBhcnQvZm9ybS1kYXRhOyBib3VuZGFyeT1cIlxuICAgICAgICAgICAgICAgICAgICArIHBvc3RfZmllbGRzLnNwbGl0KFwiXFxyXFxuXCIpWzBdLnN1YnN0cmluZygyKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHhtbC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcHBfb25seV9hdXRoKSB7XG4gICAgICAgICAgICBpZiAoX29hdXRoX2NvbnN1bWVyX2tleSA9PT0gbnVsbFxuICAgICAgICAgICAgICAgICYmIF9vYXV0aF9iZWFyZXJfdG9rZW4gPT09IG51bGxcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRvIG1ha2UgYW4gYXBwLW9ubHkgYXV0aCBBUEkgcmVxdWVzdCwgY29uc3VtZXIga2V5IG9yIGJlYXJlciB0b2tlbiBtdXN0IGJlIHNldC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhdXRvbWF0aWNhbGx5IGZldGNoIGJlYXJlciB0b2tlbiwgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICBpZiAoX29hdXRoX2JlYXJlcl90b2tlbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYXV0aDJfdG9rZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfY2FsbEFwaShodHRwbWV0aG9kLCBtZXRob2QsIHBhcmFtcywgbXVsdGlwYXJ0LCBhcHBfb25seV9hdXRoLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXV0aG9yaXphdGlvbiA9IFwiQmVhcmVyIFwiICsgX29hdXRoX2JlYXJlcl90b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXV0aG9yaXphdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgeG1sLnNldFJlcXVlc3RIZWFkZXIoKF91c2VfcHJveHkgPyBcIlgtXCIgOiBcIlwiKSArIFwiQXV0aG9yaXphdGlvblwiLCBhdXRob3JpemF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB4bWwub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHhtbC5yZWFkeVN0YXRlID49IDQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaHR0cHN0YXR1cyA9IDEyMDI3O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGh0dHBzdGF0dXMgPSB4bWwuc3RhdHVzO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gXCJcIjtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhtbC5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgICB2YXIgcmVwbHkgPSBfcGFyc2VBcGlSZXBseShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmVwbHkuaHR0cHN0YXR1cyA9IGh0dHBzdGF0dXM7XG4gICAgICAgICAgICAgICAgdmFyIHJhdGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgeG1sLmdldFJlc3BvbnNlSGVhZGVyICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgICAgICAgICAgICYmIHhtbC5nZXRSZXNwb25zZUhlYWRlcihcIngtcmF0ZS1saW1pdC1saW1pdFwiKSAhPT0gXCJcIlxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByYXRlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IHhtbC5nZXRSZXNwb25zZUhlYWRlcihcIngtcmF0ZS1saW1pdC1saW1pdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZzogeG1sLmdldFJlc3BvbnNlSGVhZGVyKFwieC1yYXRlLWxpbWl0LXJlbWFpbmluZ1wiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiB4bWwuZ2V0UmVzcG9uc2VIZWFkZXIoXCJ4LXJhdGUtbGltaXQtcmVzZXRcIilcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socmVwbHksIHJhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB4bWwuc2VuZChodHRwbWV0aG9kID09PSBcIkdFVFwiID8gbnVsbCA6IHBvc3RfZmllbGRzKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgQVBJIHJlcGx5IHRvIGVuY29kZSBpdCBpbiB0aGUgc2V0IHJldHVybl9mb3JtYXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcgcmVwbHkgIFRoZSBhY3R1YWwgcmVwbHksIEpTT04tZW5jb2RlZCBvciBVUkwtZW5jb2RlZFxuICAgICAqXG4gICAgICogQHJldHVybiBhcnJheXxvYmplY3QgVGhlIHBhcnNlZCByZXBseVxuICAgICAqL1xuICAgIHZhciBfcGFyc2VBcGlSZXBseSA9IGZ1bmN0aW9uIChyZXBseSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcGx5ICE9PSBcInN0cmluZ1wiIHx8IHJlcGx5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcGx5ID09PSBcIltdXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyc2VkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShyZXBseSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHBhcnNlZCA9IHt9O1xuICAgICAgICAgICAgaWYgKHJlcGx5LmluZGV4T2YoXCI8XCIgKyBcIj94bWwgdmVyc2lvbj1cXFwiMS4wXFxcIiBlbmNvZGluZz1cXFwiVVRGLThcXFwiP1wiICsgXCI+XCIpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgcmVjZWl2ZWQgWE1MLi4uXG4gICAgICAgICAgICAgICAgLy8gc2luY2UgdGhpcyBvbmx5IGhhcHBlbnMgZm9yIGVycm9ycyxcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBwZXJmb3JtIGEgZnVsbCBkZWNvZGluZ1xuICAgICAgICAgICAgICAgIHBhcnNlZC5yZXF1ZXN0ID0gcmVwbHkubWF0Y2goLzxyZXF1ZXN0PiguKik8XFwvcmVxdWVzdD4vKVsxXTtcbiAgICAgICAgICAgICAgICBwYXJzZWQuZXJyb3IgICA9IHJlcGx5Lm1hdGNoKC88ZXJyb3I+KC4qKTxcXC9lcnJvcj4vKVsxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzdW1lIHF1ZXJ5IGZvcm1hdFxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IHJlcGx5LnNwbGl0KFwiJlwiKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV0uc3BsaXQoXCI9XCIsIDIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWRbZWxlbWVudFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQoZWxlbWVudFsxXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWRbZWxlbWVudFswXV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHNldENvbnN1bWVyS2V5OiBzZXRDb25zdW1lcktleSxcbiAgICAgICAgZ2V0VmVyc2lvbjogZ2V0VmVyc2lvbixcbiAgICAgICAgc2V0VG9rZW46IHNldFRva2VuLFxuICAgICAgICBzZXRCZWFyZXJUb2tlbjogc2V0QmVhcmVyVG9rZW4sXG4gICAgICAgIHNldFVzZVByb3h5OiBzZXRVc2VQcm94eSxcbiAgICAgICAgc2V0UHJveHk6IHNldFByb3h5LFxuICAgICAgICBnZXRBcGlNZXRob2RzOiBnZXRBcGlNZXRob2RzLFxuICAgICAgICBfX2NhbGw6IF9fY2FsbCxcbiAgICAgICAgb2F1dGhfYXV0aGVudGljYXRlOiBvYXV0aF9hdXRoZW50aWNhdGUsXG4gICAgICAgIG9hdXRoX2F1dGhvcml6ZTogb2F1dGhfYXV0aG9yaXplLFxuICAgICAgICBvYXV0aDJfdG9rZW46IG9hdXRoMl90b2tlblxuICAgIH07XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIlxuICAgICYmIG1vZHVsZVxuICAgICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIlxuKSB7XG4gICAgLy8gRXhwb3NlIGNvZGViaXJkIGFzIG1vZHVsZS5leHBvcnRzIGluIGxvYWRlcnMgdGhhdCBpbXBsZW1lbnQgdGhlIE5vZGVcbiAgICAvLyBtb2R1bGUgcGF0dGVybiAoaW5jbHVkaW5nIGJyb3dzZXJpZnkpLiBEbyBub3QgY3JlYXRlIHRoZSBnbG9iYWwsIHNpbmNlXG4gICAgLy8gdGhlIHVzZXIgd2lsbCBiZSBzdG9yaW5nIGl0IHRoZW1zZWx2ZXMgbG9jYWxseSwgYW5kIGdsb2JhbHMgYXJlIGZyb3duZWRcbiAgICAvLyB1cG9uIGluIHRoZSBOb2RlIG1vZHVsZSB3b3JsZC5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IENvZGViaXJkO1xufSBlbHNlIHtcbiAgICAvLyBPdGhlcndpc2UgZXhwb3NlIGNvZGViaXJkIHRvIHRoZSBnbG9iYWwgb2JqZWN0IGFzIHVzdWFsXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCJcbiAgICAgICAgJiYgd2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5Db2RlYmlyZCA9IENvZGViaXJkO1xuICAgIH1cblxuICAgIC8vIFJlZ2lzdGVyIGFzIGEgbmFtZWQgQU1EIG1vZHVsZSwgc2luY2UgY29kZWJpcmQgY2FuIGJlIGNvbmNhdGVuYXRlZCB3aXRoIG90aGVyXG4gICAgLy8gZmlsZXMgdGhhdCBtYXkgdXNlIGRlZmluZSwgYnV0IG5vdCB2aWEgYSBwcm9wZXIgY29uY2F0ZW5hdGlvbiBzY3JpcHQgdGhhdFxuICAgIC8vIHVuZGVyc3RhbmRzIGFub255bW91cyBBTUQgbW9kdWxlcy4gQSBuYW1lZCBBTUQgaXMgc2FmZXN0IGFuZCBtb3N0IHJvYnVzdFxuICAgIC8vIHdheSB0byByZWdpc3Rlci4gTG93ZXJjYXNlIGNvZGViaXJkIGlzIHVzZWQgYmVjYXVzZSBBTUQgbW9kdWxlIG5hbWVzIGFyZVxuICAgIC8vIGRlcml2ZWQgZnJvbSBmaWxlIG5hbWVzLCBhbmQgY29kZWJpcmQgaXMgbm9ybWFsbHkgZGVsaXZlcmVkIGluIGEgbG93ZXJjYXNlXG4gICAgLy8gZmlsZSBuYW1lLiBEbyB0aGlzIGFmdGVyIGNyZWF0aW5nIHRoZSBnbG9iYWwgc28gdGhhdCBpZiBhbiBBTUQgbW9kdWxlIHdhbnRzXG4gICAgLy8gdG8gY2FsbCBub0NvbmZsaWN0IHRvIGhpZGUgdGhpcyB2ZXJzaW9uIG9mIGNvZGViaXJkLCBpdCB3aWxsIHdvcmsuXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShcImNvZGViaXJkXCIsIFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiBDb2RlYmlyZDsgfSk7XG4gICAgfVxufVxuXG59KSgpO1xuIiwidmFyIG1hcCA9IHt9O1xudmFyIGluZm93aW5kb3cgPSB7fTtcblxudmFyIGJlYWNoRGF0YSA9IFtcbiAgICB7IG5hbWU6ICdTdXJmZXJzIFBvaW50JywgbGF0aXR1ZGU6ICctMzMuOTc2NzExMycsIGxvbmdpdHVkZTogJzExNC45ODM3ODU1JyB9LFxuICAgIHsgbmFtZTogJ0tpbGNhcm51cCcsIGxhdGl0dWRlOiAnLTMzLjk0NjgyMTknLCBsb25naXR1ZGU6ICcxMTQuOTkwNDQ4OScgfSxcbiAgICB7IG5hbWU6ICdSZWRnYXRlJywgbGF0aXR1ZGU6ICctMzQuMDQxODE0JywgbG9uZ2l0dWRlOiAnMTE0Ljk5ODQ2NycgfSxcbiAgICB7IG5hbWU6ICdCb3JhbnVwJywgbGF0aXR1ZGU6ICctMzQuMTcyMDI5NycsIGxvbmdpdHVkZTogJzExNS4wMTM3MicgfSxcbiAgICB7IG5hbWU6ICdZYWxsaW5ndXAnLCBsYXRpdHVkZTogJy0zMy42Mzk5NTY0JywgbG9uZ2l0dWRlOiAnMTE1LjAyMjA2MjInIH0sXG4gICAgeyBuYW1lOiAnSGFtZWxpbiBCYXknLCBsYXRpdHVkZTogJy0zNC4yMjA2MTY0JywgbG9uZ2l0dWRlOiAnMTE1LjAyNjE3NjknIH0sXG4gICAgeyBuYW1lOiAnTW9zZXMgUm9jaycsIGxhdGl0dWRlOiAnLTMzLjc1ODk1NTQnLCBsb25naXR1ZGU6ICcxMTQuOTg4OTg4MScgfSxcbiAgICB7IG5hbWU6ICdJbmppZHVwJywgbGF0aXR1ZGU6ICctMzMuNjk5MzU5MicsIGxvbmdpdHVkZTogJzExNC45ODcyMzMzJyB9XG5dO1xuXG52YXIgQmVhY2ggPSBmdW5jdGlvbiAobmFtZSwgbGF0LCBsbmcpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmxhdCA9IGxhdDtcbiAgICB0aGlzLmxuZyA9IGxuZztcblxuICAgIHRoaXMubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG5nKSxcbiAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcbiAgICB9KTtcblxuICAgIHRoaXMubWFya2VyU2VsZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWRsLWxheW91dF9fZHJhd2VyLmlzLXZpc2libGUnKSkge1xuICAgICAgICAgICAgdmFyIGxheW91dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZGwtbGF5b3V0Jyk7XG4gICAgICAgICAgICBsYXlvdXQuTWF0ZXJpYWxMYXlvdXQudG9nZ2xlRHJhd2VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXAucGFuVG8oc2VsZi5tYXJrZXIuZ2V0UG9zaXRpb24oKSk7XG5cbiAgICAgICAgaW5mb3dpbmRvdy5zZXRDb250ZW50KHNlbGYubWFya2VyQ29udGVudCk7XG4gICAgICAgIGluZm93aW5kb3cub3BlbihtYXAsIHNlbGYubWFya2VyKTtcblxuICAgICAgICBzZWxmLm1hcmtlci5zZXRBbmltYXRpb24oZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkJPVU5DRSk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5tYXJrZXIuc2V0QW5pbWF0aW9uKG51bGwpO1xuICAgICAgICB9LCA3MDApO1xuICAgIH07XG5cbiAgICB0aGlzLm1hcmtlci5hZGRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm1hcmtlclNlbGVjdGVkKTtcblxuICAgIHRoaXMuaXNWaXNpYmxlID0ga28ub2JzZXJ2YWJsZSh0cnVlKTtcblxuICAgIHRoaXMuaXNWaXNpYmxlLnN1YnNjcmliZShmdW5jdGlvbiAoY3VycmVudFN0YXRlKSB7XG4gICAgICAgIHNlbGYubWFya2VyLnNldFZpc2libGUoY3VycmVudFN0YXRlKTtcbiAgICB9KTtcblxuICAgIHRoaXMubWFya2VyQ29udGVudCA9ICc8aDQ+JyArIHRoaXMubmFtZSArICc8L2g0PicgKyAnPHA+TG9hZGluZyBwbGVhc2Ugd2FpdC4uLjwvcD4nO1xuXG4gICAgLyogVE9ET1xuICAgICAqIC0gaGFuZGxlIHdoZW4gZGF0YSBpcyBtaXNzaW5nIGZyb20gb3BlbndlYXRoZXJtYXBcbiAgICAgKi9cbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdXJsID0gJ2h0dHA6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PScgKyBzZWxmLmxhdCArICcmbG9uPScgKyBzZWxmLmxuZyArICcmYXBwaWQ9NmViNWZjYWEzYzhkY2I0NDYzZmRmMzdlZmU1NWM2ZmImdW5pdHM9bWV0cmljJztcbiAgICAgICAgJC5nZXRKU09OKHVybClcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlc2MgPSBkYXRhLndlYXRoZXJbMF0uZGVzY3JpcHRpb24gPyBkYXRhLndlYXRoZXJbMF0uZGVzY3JpcHRpb24gOiAnbm8gZGVzY3JpcHRpb24gYXZhaWxhYmxlJztcbiAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IGRhdGEubWFpbi50ZW1wID8gZGF0YS5tYWluLnRlbXAgOiAnbm8gdGVtcCBhdmFpbGFibGUnO1xuICAgICAgICAgICAgICAgIHZhciB3aW5kU3BlZWQgPSBkYXRhLndpbmQuc3BlZWQgPyBkYXRhLndpbmQuc3BlZWQgOiAnbm8gd2luZCBzcGVlZCBhdmFpbGFibGUnO1xuICAgICAgICAgICAgICAgIHZhciB3aW5kRGVnID0gZGF0YS53aW5kLmRlZyA/IGRhdGEud2luZC5kZWcgOiAnbm8gd2luZCBkZWdyZWUgYXZhaWxhYmxlJztcblxuICAgICAgICAgICAgICAgIHNlbGYubWFya2VyQ29udGVudCA9ICc8ZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8aDQ+JyArIHNlbGYubmFtZSArICc8L2g0PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRsPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkdD5Db25kaXRpb25zPC9kdD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGQ+JyArIGRlc2MgKyAnPC9kZD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZHQ+VGVtcDwvZHQ+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRkPicgKyB0ZW1wICsgJ8KwPC9kZD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZHQ+V2luZDwvZHQ+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRkPicgKyB3aW5kU3BlZWQgKyAnIGttL2g8YnI+JyArIHdpbmREZWcgKyAnwrA8L2RkPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRsPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6ICcsIGVycm9yKTtcbiAgICAgICAgICAgICAgICBzZWxmLm1hcmtlckNvbnRlbnQgPSAnPGg0PicgKyBzZWxmLm5hbWUgKyAnPC9oND4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxzdHJvbmc+RXJyb3I6PC9zdHJvbmc+IENvdWxkbid0IGZldGNoIGN1cnJlbnQgY29uZGl0aW9uLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyXCI7XG4gICAgICAgICAgICB9KTtcbiAgICB9KSgpO1xufTtcblxua28uYmluZGluZ0hhbmRsZXJzLmdvb2dsZW1hcCA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xuICAgICAgICAgICAgem9vbTogMTAsXG4gICAgICAgICAgICBjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcodmFsdWUuY2VudGVyTGF0LCB2YWx1ZS5jZW50ZXJMb24pLFxuICAgICAgICAgICAgbWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuU0FURUxMSVRFLFxuICAgICAgICAgICAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChlbGVtZW50LCBtYXBPcHRpb25zKTtcbiAgICAgICAgaW5mb3dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XG5cbiAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNlbnRlciA9IG1hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIobWFwLCAncmVzaXplJyk7XG4gICAgICAgICAgICBtYXAuc2V0Q2VudGVyKGNlbnRlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmVhY2hEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYmVhY2ggPSBiZWFjaERhdGFbaV07XG4gICAgICAgICAgICB2YWx1ZS5iZWFjaGVzLnB1c2gobmV3IEJlYWNoKGJlYWNoLm5hbWUsIGJlYWNoLmxhdGl0dWRlLCBiZWFjaC5sb25naXR1ZGUpKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnZhciBiZWFjaGVzTW9kZWwgPSB7XG4gICAgYmVhY2hlczoga28ub2JzZXJ2YWJsZUFycmF5KFtdKSxcbiAgICBxdWVyeToga28ub2JzZXJ2YWJsZSgnJylcbn07XG5cbmJlYWNoZXNNb2RlbC5maWx0ZXJlZEJlYWNoZXMgPSBrby5jb21wdXRlZChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyeSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5RmlsdGVyKHRoaXMuYmVhY2hlcygpLCBmdW5jdGlvbiAoYmVhY2gpIHtcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBiZWFjaC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeSkgIT09IC0xIHx8ICFxdWVyeTtcbiAgICAgICAgYmVhY2guaXNWaXNpYmxlKGlzTWF0Y2gpO1xuICAgICAgICByZXR1cm4gaXNNYXRjaDtcbiAgICB9KTtcbn0sIGJlYWNoZXNNb2RlbCk7XG5cbmZ1bmN0aW9uIGluaXRNYXAgKCkge1xuICAgIGtvLmFwcGx5QmluZGluZ3MoYmVhY2hlc01vZGVsKTtcbn1cblxuZnVuY3Rpb24gbWFwRXJyb3IgKCkge1xuICAgIHZhciBkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaWFsb2cnKTtcbiAgICBpZiAoIWRpYWxvZy5zaG93TW9kYWwpIHtcbiAgICAgICAgZGlhbG9nUG9seWZpbGwucmVnaXN0ZXJEaWFsb2coZGlhbG9nKTtcbiAgICB9XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xufVxuXG4vLyBtYXAgZG9lc24ndCByZW5kZXIgY29ycmVjdGx5IG9uIGluaXQuIENhbGwgcmVzaXplIGFmdGVyIHdpbmRvdyBsb2FkIGV2ZW50IHRvIGZpeC5cbiQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBnb29nbGUubWFwcy5ldmVudC50cmlnZ2VyKG1hcCwgJ3Jlc2l6ZScpO1xufSk7XG4iXX0=
