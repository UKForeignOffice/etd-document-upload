'use strict'
var _ = require('lodash')

function transform(object, operation) {
    return _.transform(object, function (result, value, key) {
        var v = value

        if (typeof(value) == "string") {
            v = operation(value)
        }
        if (typeof(value) == "object") {
            v = transform(value, operation)
        }

        return result[key] = v
    })
}

/**
 * Escape JSON object properties by converting the characters "&", "<", ">", '"', "'", and "`", in string to their
 * corresponding HTML entities.
 *
 * @param object the JSON object which properties need escaping
 * return copy of the JSON object which properties have been escaped
 */
function escape(object) {
    return transform(object, _.escape)
}

/**
 * Unescape object properties by converting the HTML entities &amp;, &lt;, &gt;, &quot;, &#39;, and &#96; in string
 * to their corresponding characters
 *
 * @param object the object which properties need unescaping
 * return copy of the object which properties have been unescaped
 */
function unescape(object) {
    return transform(object, _.unescape)
}


module.exports = {
    escape, unescape
}
