'use strict'

/**
 *Converts a string to Title case.
 * Below are the examples:
 *
 * Tim Baker --> Tim Baker
 * TIM BAKER --> Tim Baker
 * tIM bAKER --> Tim Baker
 * tim baker --> Tim Baker
 * tim-baker --> Tim-Baker
 * tim-Baker --> Tim-Baker
 * tim-baker john --> Tim-Baker John
 * tim baker-john --> Tim Baker-John
 * tim --> Tim
 * Joánne Roánne --> Joánne Roánne
 * ánna --> Ánna
 * áni áimee --> Áni Áimee
 * Áne Áoe --> Áne Áoe

 * @param sourceStr - String to be converted into title case
 *
 * returns the title case converted String
 */
var upperCasify = function(sourceStr){
    sourceStr = sourceStr.toUpperCase()
    return sourceStr;
}

var titleCasify = function(sourceStr){
    sourceStr = sourceStr.toLowerCase()
    sourceStr = sourceStr.replace(/[^-'\s]+/g, function(word) {
        return word.replace(/^./, function(first) {
            return first.toUpperCase();
        });
    });
    return sourceStr;
}

module.exports = {
    titleCasify,upperCasify
}
