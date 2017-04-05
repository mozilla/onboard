'use strict';

let timers = require('sdk/timers');

let { intervals } = require('./intervals.js');
let { onNewtabUtilsEvent } = require('./newtab-utils.js');
let { flowManager, onFlowManagerEvent } = require('./flow-manager.js');
let { storageManager } = require('./storage-manager.js');
let { utils } = require('./utils.js');

let timer;

/**
 * Listens for a custom event fired from newtabUtils
 */
onNewtabUtilsEvent('scheduleNextSnippet', function(intent) {
    module.exports.scheduler.scheduleNextSnippet(intent);
});

/**
 * Listens for a custom event fired from flowManager
 */
onFlowManagerEvent('action', function(action) {
    if (action === 'intervalTimer') {
        module.exports.scheduler.startSnippetIntervalTimer();
    } else if (action === 'durationTimer') {
        module.exports.scheduler.startSnippetDurationTimer();
    }
});

exports.scheduler = {
    /**
     * If a snippet timer is currently scheduled, clear it.
     */
    clearSnippetTimer: function() {
        if (timer) {
            // reset timers
            storageManager.set('durationTimerStartTime', undefined);
            storageManager.set('intervalTimerStartTime', undefined);
            timers.clearTimeout(timer);
        }
    },
    /**
    * Updates either snippetDismissed or mainCTAComplete, moves the tour
    * on by one step, and starts a new interval timer.
    * @param {string} intent - Optional, and only valid if the value is dismiss
    */
    scheduleNextSnippet: function(intent) {
        let mainTourComplete = storageManager.get('mainTourComplete');

        // when this function is called there may be a durationTimer
        // currently running so, we clear any existing timer
        module.exports.scheduler.clearSnippetTimer();

        if (intent === 'dismiss') {
            // store an indicator that the snippet has been dismissed
            storageManager.set('snippetDismissed', true);
        } else {
            // store that the mainCTA has been completed
            storageManager.set('mainCTAComplete', true);
        }

        // only call progressTour if the main tour is not complete
        if (!mainTourComplete) {
            flowManager.progressTour();
        }

        module.exports.scheduler.startSnippetIntervalTimer();
    },
    /**
    * Starts a timer that will call the utils.tabListener() function after the elapsed wait time,
    * should the user not close the browser earlier.
    */
    startFirstSnippetTimer: function() {
        // to avoid starting multiple timers,
        // proactively clear any existing timer
        module.exports.scheduler.clearSnippetTimer();

        timer = timers.setTimeout(function() {
            utils.tabListener();
        }, intervals.waitInterval);
    },
    /**
     * A timer started to manage the duration for which the
     * current snippet should be shown.
     * @param {int} duration - The duration, in miliseconds, to be deducted from the default waitInterval
     */
    startSnippetDurationTimer: function(duration) {
        let mainTourComplete = storageManager.get('mainTourComplete');
        let waitInterval = duration ? duration : intervals.waitInterval;

        module.exports.scheduler.clearSnippetTimer();

        // store the time that this timer was started
        storageManager.set('durationTimerStartTime', Date.now());

        timer = timers.setTimeout(function() {
            // only call progressTour if the main tour is not complete
            if (!mainTourComplete) {
                flowManager.progressTour();
            }
            module.exports.scheduler.startSnippetIntervalTimer();
        }, waitInterval);
    },
    /**
     * A timer started to manage the interval between the
     * end of the last snippet and the start of the next
     * @param {int} duration - The duration, in miliseconds, to be deducted from the default waitInterval
     */
    startSnippetIntervalTimer: function(duration) {
        let waitInterval = duration ? duration : intervals.waitInterval;

        module.exports.scheduler.clearSnippetTimer();

        // store the time that this timer was started
        storageManager.set('intervalTimerStartTime', Date.now());

        timer = timers.setTimeout(function() {
            utils.resetState();
            utils.tabListener();
        }, waitInterval);
    }
};
