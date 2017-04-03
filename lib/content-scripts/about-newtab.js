'use strict';

let pageMod = require('sdk/page-mod');

let { flowManager } = require('../flow-manager.js');

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
            contentScriptWhen: 'ready',
            contentStyleFile: './css/about-newtab.css',
            attachTo: ['top'],
            onAttach: function(worker) {
                // call the flowManager
                flowManager.manageFlow(worker);
            },
            onDetach: function() {
                this.destroy();
            }
        });
    }
};
