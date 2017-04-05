'use strict';

let pageMod = require('sdk/page-mod');

let { flowManager } = require('../flow-manager.js');
let { storageManager } = require('../storage-manager.js');

exports.aboutNewTab = {
    aboutNewtab: undefined,
    /**
     * Stops this pageMod from making more modifications on about:newtab in future
     */
    destroy: function() {
        if (this.aboutNewtab) {
            this.aboutNewtab.destroy();
        }
    },
    /**
     * Modifies the about:newtab page to show a onboarding notification
     */
    modifyAboutNewtab: function() {
        this.aboutNewtab = pageMod.PageMod({
            include: /about:newtab/,
            contentScriptFile: './js/about-newtab.js',
            contentStyleFile: './css/about-newtab.css',
            attachTo: 'top',
            onAttach: function(worker) {
                let intervalTimerStartTime = storageManager.get('intervalTimerStartTime');
                // only call flow manager if we are not in an active interval
                if (typeof intervalTimerStartTime === 'undefined') {
                    flowManager.manageFlow(worker);
                }
            }
        });
    }
};
