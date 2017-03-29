'use strict';

let timers = require('sdk/timers');

let { intervals } = require('./intervals.js');
let { utils } = require('./utils.js');

let timer;

exports.scheduler = {
    /**
     * If a snippet timer is currently scheduled, clear it.
     */
    clearSnippetTimer: function() {
        if (timer) {
            timers.clearTimeout(timer);
        }
    },
    /**
    * Starts a timer that will call the aboutNewTab.modifyAboutNewtab() function after the elapsed wait time,
    * should the user not close the browser earlier.
    * @param {int} divideBy - number to divide the default wait interval by
    */
    startSnippetTimer: function(divideBy) {
        // to avoid starting multiple timers,
        // proactively clear any existing timer
        module.exports.scheduler.clearSnippetTimer();

        timer = timers.setTimeout(function() {
            utils.tabListener();
        }, intervals.waitInterval / divideBy);
    }
};
