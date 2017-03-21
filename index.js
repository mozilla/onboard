'use strict';

let tabs = require('sdk/tabs');

let { storageManager } = require('lib/storage-manager.js');
let { utils } = require('lib/utils.js');

let { aboutNewTab } = require('lib/content-scripts/about-newtab.js');
let { firstrun } = require('lib/content-scripts/firstrun.js');

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
* Initializes the add-on, and checks the time elapsed
* since a sidebar was last shown.
*/
exports.main = function() {
    let installTime = storageManager.get('installTime');

    // if installTime is undefined, this is the first time the
    // user is accessing the /firstrun page.
    if (typeof installTime === 'undefined') {
        firstrun.setInstallTime();
    }

    tabs.on('open', function(tab) {
        if (tab.url === 'about:newtab' || tab.url === 'about:blank') {
            tab.reload();
            aboutNewTab.modifyAboutNewtab();
        }
    });
};
