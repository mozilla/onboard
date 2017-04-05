'use strict';

let tabs = require('sdk/tabs');

let { aboutNewTab } = require('./content-scripts/about-newtab.js');
let { storageManager } = require('./storage-manager.js');

exports.utils = {
    /**
     * Keeps track of the number of new Firefox sessions. Once the new browser session count
     * reaches 3, we need to reset the counter.
     */
    browserSessionCounter: function() {
        let sessionCounter = storageManager.get('sessionCounter');

        // if sessionCounter does not exist, this is the very first
        // session, initialize to 1
        if (typeof sessionCounter === 'undefined') {
            storageManager.set('sessionCounter', 1);
        // if the sessionCounter is at 3, reset the sessionCounter to 1
        } else if(parseInt(sessionCounter) === 3) {
            // reset the session counter
            storageManager.set('sessionCounter', 1);
        } else {
            // increment the sessionCounter by 1
            storageManager.set('sessionCounter', parseInt(sessionCounter) + 1);
        }
    },
    /**
     * If the tab is about:newtab call modifyAboutNewtab
     * @param {object} tab - The current tab's Tab object
     */
    handleNewTab: function(tab) {
        if (tab.url === 'about:newtab') {
            // remove the current listener
            tabs.off('ready', module.exports.utils.handleNewTab);
            // inject our tour pageMod
            aboutNewTab.modifyAboutNewtab();
        }
    },
    /**
     * Resets the add-on after a timer completes.
     * This means that both timer start times are set to undefined and,
     * mainCTAComplete and snippetDismissed is set to false
     */
    resetState: function() {
        // set intervalTimerStartTime, and durationTimerStartTime to undefined to indicate that
        // these timers are not currently running
        storageManager.set('intervalTimerStartTime', undefined);
        storageManager.set('durationTimerStartTime', undefined);
        // also set both mainCTAComplete and snippetDismissed to false
        storageManager.set('mainCTAComplete', false);
        storageManager.set('snippetDismissed', false);
    },
    /**
     * Listens for the tabs.open event and triggers the about:newtab pageMod to inject a snippet, if
     * the new tab has a URL of about:newtab
     */
    tabListener: function() {
        // listen for new open tab events
        tabs.on('ready', module.exports.utils.handleNewTab);
    },
};
