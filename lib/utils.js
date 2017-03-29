'use strict';

let tabs = require('sdk/tabs');

let { aboutNewTab } = require('./content-scripts/about-newtab.js');

exports.utils = {
    /** This is called to explicitly 'uninstall' the addon, destroying functional
     *  pieces needed for user interaction, effectively removing the addon
     */
    destroy: function () {
        aboutNewTab.destroy();
    },
    /**
     * Triggers the about:newtab pageMod to inject a snippet
     */
    showSnippet: function() {
        // inject our tour snippet
        aboutNewTab.modifyAboutNewtab();
    },
    /**
     * Listens for the tabs.open event and triggers the about:newtab pageMod to inject a snippet, if
     * the new tab has a URL of either about:newtab or about:blank
     */
    tabListener: function() {
        tabs.on('open', function(tab) {
            if (tab.url === 'about:newtab' || tab.url === 'about:blank') {
                tab.reload();
                aboutNewTab.modifyAboutNewtab();
            }
        });
    }
};
