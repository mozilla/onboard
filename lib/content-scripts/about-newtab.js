'use strict';

let pageMod = require('sdk/page-mod');

let { once } = require('../utils.js');

exports.aboutNewtab = {
    aboutNewtab: undefined,
    /**
     * Stops pagemod from making more modifications on abouthome in the future,
     * and disables its further use
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
                let snippetContent;

                // emit modify event and passes snippet HTML as a string
                worker.port.emit('modify', snippetContent);

                // listens for the destroy event emitted by utils
                once('intent', function(intent) {
                    if (intent === 'destroy') {
                        module.exports.aboutHome.destroy();
                    }
                });


            }
        });
    }
};
