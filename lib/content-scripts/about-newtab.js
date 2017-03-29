'use strict';

let pageMod = require('sdk/page-mod');

let { newtabUtils } = require('../newtab-utils.js');

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
                // emit modify event and passes snippet HTML as a string
                worker.port.emit('modify', newtabUtils.getSnippet());
                // intent event is fired when the user clicks the main CTA for the current snippet
                worker.port.on('intent', function(intent) {
                    newtabUtils.handleIntent(intent);
                });
            }
        });
    }
};
