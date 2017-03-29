'use strict';

/**
 * Read only module for defined intervals
 */
let Intervals = {
    // 3 weeks in milliseconds
    nonuseDestroyTime: 1814400000,
    // 1 day in milliseconds
    oneDay: 86400000,
    // 1 minute in milliseconds
    oneMinute: 60000,
    timeElapsedFormula: 3600000,
    // 24 hours in milliseconds
    waitInterval: 86400000
};

exports.intervals = Intervals;
