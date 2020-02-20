'use strict';

var _ = require('lodash');

/**
 * Generating and Validating a Global Unique Identifier that includes a check digit calculated using Luhn Algorithm
 *
 * @See https://en.wikipedia.org/wiki/Luhn_algorithm
 *
 * The Luhn algorithm or Luhn formula, also known as the "modulus 10" or "mod 10" algorithm, is a simple checksum
 * formula used to validate a variety of identification numbers, such as credit card numbers, IMEI numbers,
 * National Provider Identifier numbers in the US, and Canadian Social Insurance Numbers.
 */

/**
 * Calculates digit checksum using Luhn algorithm (mod 10)
 *
 * @param number the number to calculate the checksum for
 * @returns the calculated checksum
 */
var calculateChecksum = function (number) {
    var sum = 0;
    var delta = [0, 1, 2, 3, 4, -4, -3, -2, -1, 0];

    for (var i = 0; i < number.length; i++) {
        sum += parseInt(number.substring(i, i + 1));
    }

    for (var j = number.length - 1; j >= 0; j -= 2) {
        sum += delta[parseInt(number.substring(j, j + 1))];
    }

    var inverseModulus = 10 - (sum % 10);
    if (inverseModulus === 10) {
        return 0;
    }
    return inverseModulus;
};

var toNumber = function (string) {
    return _.reduce(string, function (total, n) {
        return total + n.charCodeAt(0)
    }, 0);
};

var checkFormat = function (guid) {
    if (guid.length !== 11) {
        throw Error("A Global Unique Identifier must be exactly 11 character long: ", guid);
    }
};

var getPrefix = function (guid) {
    checkFormat(guid);
    return guid.substring(0, 3);
};

var getIdentifier = function (guid) {
    checkFormat(guid);
    return guid.substring(3, 10);
};

var getChecksum = function (guid) {
    checkFormat(guid);
    return parseInt(guid.substring(10, 11));
};

var randomString = function (length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

/**
 * Generate a Global Unique Identifier.
 * The GUID is prefixed with the post and suffixed with a digit checksum
 *
 * @param postPrefix the post prefix
 * @return the generated GUID
 */
var generate = function (postPrefix) {
    if (postPrefix.length !== 3) {
        throw Error("Post prefix must be exactly 3 character long: ", postPrefix)
    }
    var identifier = randomString(7, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var postPrefixSum = toNumber(postPrefix);
    var identifierSum = toNumber(identifier);
    var suffix = calculateChecksum((postPrefixSum + identifierSum).toString());
    var reference = postPrefix + identifier + suffix;
    return (reference);
};

/**
 * Check that the Global Unique Identifier is valid
 *
 * @param guid the GUID to validate
 * @return true if the GUID is valid, false otherwise
 */
var isValid = function (guid) {
    checkFormat(guid);
    var prefix = getPrefix(guid);
    var prefixSum = toNumber(prefix);
    var identifier = getIdentifier(guid);
    var identifierSum = toNumber(identifier);
    var checksum = getChecksum(guid);
    var calculatedChecksum = calculateChecksum((prefixSum + identifierSum).toString());
    return (checksum === calculatedChecksum);
};

module.exports = {
    generate:generate,
    isValid:isValid,
    getPrefix:getPrefix,
    getIdentifier:getIdentifier,
    getChecksum:getChecksum
};