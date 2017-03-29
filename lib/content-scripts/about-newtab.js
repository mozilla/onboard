'use strict';

let pageMod = require('sdk/page-mod');

let { newtabUtils } = require('../newtab-utils.js');
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
            contentScriptWhen: 'ready',
            contentStyleFile: './css/about-newtab.css',
            onAttach: function(worker) {
                let step = storageManager.get('step');
                // if this is the first call to modifyAboutNewtab or the user has not seen
                // all of the tour snippets
                if (typeof step === 'undefined' || step !== 5) {
                    // emit modify event and pass snippet HTML as a string
                    worker.port.emit('modify', newtabUtils.getSnippet());
                    // intent event is fired when the user clicks the main CTA for the current snippet
                    worker.port.on('intent', function(intent) {
                        newtabUtils.handleIntent(intent);
                    });
                }
            }
        });
    }
};
