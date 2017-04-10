'use strict';

let prefService = require('sdk/preferences/service');
let tabs = require('sdk/tabs');

let { aboutNewTab } = require('lib/content-scripts/about-newtab.js');
let { intervals } = require('lib/intervals.js');
let { scheduler } = require('lib/scheduler.js');
let { storageManager } = require('lib/storage-manager.js');
let { utils } = require('lib/utils.js');

/**
 * A temporary function for testing purposes.
 */
function setUpTestEnv() {
    prefService.set('distribution.variation', 'contentVariationA');
    prefService.set('browser.newtab.preload', false);
    prefService.set('browser.newtab.url', 'about:newtab');

    intervals.oneDay = 30000;
    intervals.waitInterval = 30000;
}

/**
 * This is called when the add-on is unloaded. If the reason is either uninstall,
 *  disable or shutdown, we can do some cleanup.
 */
exports.onUnload = function(reason) {
    if (reason === 'uninstall' || reason === 'disable') {
        aboutNewTab.destroy();
    } else if (reason === 'shutdown') {
        // do cleanup, or save state
    }
};

/**
* Initializes the add-on
*/
exports.main = function() {
    let activeTabURL = tabs.activeTab.url;
    let durationTimerStartTime = storageManager.get('durationTimerStartTime');
    let intervalTimerStartTime = storageManager.get('intervalTimerStartTime');
    let installTime = storageManager.get('installTime');
    let timeElapsedSinceLastLaunch = Date.now() - installTime;
    let variation = prefService.get('distribution.variation');

    setUpTestEnv();

    if (typeof variation === 'undefined') {
        storageManager.set('variation', prefService.get('distribution.variation'));
    } else {
        storageManager.set('variation', variation);
    }

    // if installTime is undefined, this is the first launch of Firefox
    if (typeof installTime === 'undefined') {
        storageManager.set('installTime', Date.now());
        // the first time the add-on is run, the mainTourComplete status
        // will not be set. Initialize it to false.
        storageManager.set('mainTourComplete', false);
        // start a 24 hour timer for this session
        scheduler.startFirstSnippetTimer();
    }

    if (typeof installTime !== 'undefined') {
        // call the session counter
        utils.browserSessionCounter();

        // the user has the not seen any of the notifications
        if (typeof durationTimerStartTime === 'undefined' && typeof intervalTimerStartTime === 'undefined') {
            // if on launch, the active tab is about:newtab and 24+ hours have elapsed since first launch
            if (activeTabURL === 'about:newtab' && timeElapsedSinceLastLaunch >= intervals.oneDay) {
                // inject our tour snippet
                aboutNewTab.modifyAboutNewtab();
            // if on launch, the active tab is not about:newtab but, 24+ hours have elapsed since first launch
            } else if (!activeTabURL !== 'about:newtab' && timeElapsedSinceLastLaunch >= intervals.oneDay) {
                // start a new tab listener
                utils.tabListener();
            }
        // if the durationTimerStartTime is not undefined, we should start it with the time remaining
        } else if (typeof durationTimerStartTime !== 'undefined') {
            let durationRemaining = Date.now() - durationTimerStartTime;
            scheduler.startSnippetDurationTimer(durationRemaining);
        // if the intervalTimerStartTime is not undefined, we should start it with the time remaining
        } else if (typeof intervalTimerStartTime !== 'undefined') {
            let intervalRemaining = Date.now() - intervalTimerStartTime;
            scheduler.startSnippetIntervalTimer(intervalRemaining);
        }
    }
};
