'use strict';

let _ = require('sdk/l10n').get;
let pageMod = require('sdk/page-mod');
let self = require('sdk/self');
let tabs = require('sdk/tabs');

let { once, utils } = require('../utils.js');

exports.aboutNewTab = {
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
                let tmpl = self.data.load('./tmpl/snippet.html');

                // emit modify event and passes snippet HTML as a string
                worker.port.emit('modify', utils.processTmpl(tmpl, 'sync'));

                worker.port.on('intent', function(intent) {
                    switch(intent) {
                        case 'sync':
                            tabs.open(_('sync_content_cta_url'));
                            break;
                        default:
                            break;
                    }
                });

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
