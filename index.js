'use strict';

let tabs = require('sdk/tabs');

let { intervals } = require('lib/intervals.js');
let { scheduler } = require('lib/scheduler.js');
let { storageManager } = require('lib/storage-manager.js');
let { utils } = require('lib/utils.js');

/**
 * This is called when the add-on is unloaded. If the reason is either uninstall,
 *  disable or shutdown, we can do some cleanup.
 */
exports.onUnload = function(reason) {
    if (reason === 'uninstall' || reason === 'disable') {
        utils.destroy();
    } else if (reason === 'shutdown') {
        // shutdown cleanup code goes here
    }
};

/**
* Initializes the add-on
*/
exports.main = function() {
    let activeTabURL = tabs.activeTab.url;
    let installTime = storageManager.get('installTime');
    let mainTourComplete = storageManager.get('mainTourComplete');
    // 1 day in milliseconds
    let oneDay = intervals.oneDay;
    let timeElapsedSinceLastLaunch = Date.now() - installTime;

    // the first time the add-on is run, the mainTourComplete status
    // will not yet be set. Initialize it to false.
    if (typeof mainTourComplete === 'undefined') {
        storageManager.set('mainTourComplete', false);
    }

    // if installTime is undefined, this is the first time the
    // user is accessing the /firstrun page i.e. first time launching Firefox
    if (typeof installTime === 'undefined') {
        storageManager.set('installTime', Date.now());
        // start a new 24 hour timer
        scheduler.startSnippetTimer(1);
    // if on launch, the active tab is about:newtab and 24 hours or more has elapsed since first launch
    } else if (activeTabURL === 'about:newtab' && timeElapsedSinceLastLaunch >= oneDay) {
        // inject our tour snippet
        utils.showSnippet();
    // if on launch, the active tab is not about:newtab but 24 hours or more has elapsed since first launch
    } else if (activeTabURL !== 'about:newtab' && timeElapsedSinceLastLaunch >= oneDay) {
        // start a new tab listener
        utils.tabListener();
    }


};
