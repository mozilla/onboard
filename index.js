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

    intervals.oneDay = 2000;
    intervals.waitInterval = 2000;
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
    let installTime = storageManager.get('installTime');
    let oneDay = intervals.oneDay;
    let timeElapsedSinceLastLaunch = Date.now() - installTime;
    let variation = prefService.get('distribution.variation');

    if (typeof variation === 'undefined') {
        setUpTestEnv();
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
        scheduler.startFirstSnippetTimer(1);
    }

    if (typeof installTime !== 'undefined') {
        // call the session counter
        utils.browserSessionCounter();

        // if on launch, the active tab is about:newtab and 24+ hours have elapsed since first launch
        if (activeTabURL === 'about:newtab' && timeElapsedSinceLastLaunch >= oneDay) {
            // inject our tour snippet
            aboutNewTab.showSnippet();
        // if on launch, the active tab is not about:newtab but 24+ hours have elapsed since first launch
        } else if (activeTabURL !== 'about:newtab' && timeElapsedSinceLastLaunch >= oneDay) {
            // start a new tab listener
            utils.tabListener();
        }
    }
};
