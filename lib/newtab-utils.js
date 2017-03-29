'use strict';

let _ = require('sdk/l10n').get;
let { Cu } = require('chrome');
let self = require('sdk/self');
let tabs = require('sdk/tabs');
let { UITour } = Cu.import('resource:///modules/UITour.jsm');
let windowUtils = require('sdk/window/utils');

let { storageManager } = require('./storage-manager.js');
let { variations } = require('./variations.js');

exports.newtabUtils = {
    /**
     * Loads and returns the requested snippet
     */
    getSnippet: function() {
        let mainCTAComplete = storageManager.get('mainCTAComplete');
        let step = storageManager.get('step');
        let snippet = '';
        let tmpl = self.data.load('./tmpl/snippet.html');
        let variation = variations.contentVariationA;

        // if step is undefined, this is the first snippet
        if (typeof step === 'undefined') {
            storageManager.set('step', 0);
            snippet = module.exports.newtabUtils.processTmpl(tmpl, variation[0]);
        } else {
            // if the mainCTA has been completed, move the tour forward by 1 step
            if (mainCTAComplete) {
                step = parseInt(step) + 1;
                // store the new step
                storageManager.set('step', step);
                // set mainCTAComplete to false
                storageManager.set('mainCTAComplete', false);
            }
            snippet = module.exports.newtabUtils.processTmpl(tmpl, variation[step]);
        }
        return snippet;
    },
    /**
     * @param {string} imgBaseUrl - The base url for the img to load
     * @returns The image' resource:// url
     */
    getImgURL: function(imgBaseUrl) {
        return self.data.url(imgBaseUrl);
    },
    /**
     * Trigger snippet action based on intent
     * @param {string} intent - The intent of the snippet CTA
     */
    handleIntent: function(intent) {
        // store that the mainCTA has been completed
        storageManager.set('mainCTAComplete', true);

        switch(intent) {
            case 'addons':
                tabs.open(_('addons_content_cta_url'));
                break;
            case 'customize':
                module.exports.newtabUtils.highLight('customize');
                break;
            case 'default_browser':
                module.exports.newtabUtils.setAsDefault();
                break;
            case 'private_browsing':
                module.exports.newtabUtils.highLight('privateWindow');
                break;
            case 'search':
                module.exports.newtabUtils.showSearch();
                break;
            case 'sync':
                tabs.open(_('sync_content_cta_url'));
                break;
            default:
                break;
        }
    },
    /**
     * Highlight a given item in the browser chrome
     * @param {string} item - Item you wish to highlight's name as a string
     */
    highLight: function(item) {
        // the browser window object from which we can grab an individual node (like the awesome bar)
        let activeWindow = windowUtils.getMostRecentBrowserWindow();

        UITour.getTarget(activeWindow, item, false).then(function(chosenItem) {
            try {
                UITour.showHighlight(activeWindow, chosenItem, 'wobble');
            } catch(e) {
                console.error('Could not highlight element. Check if UITour.jsm supports highlighting of element passed.', e);
            }
        });
    },
    /**
     * Processes a HTML tmpl for localisation and returns the result
     * @param {string} tmpl - The HTML as a string
     * @param {string} topic - The current content's topic i.e. sync, private browsing etc.
     */
    processTmpl: function(tmpl, topic) {
        let regex = /%[\w]+/;
        let resultsArray = [];

        while ((resultsArray = regex.exec(tmpl)) !== null) {
            let match = resultsArray[0];

            // if the match is for the string %icon, this is a media item
            // so we need to get the full resource:// url to inject into the tmpl
            if (match === '%icon') {
                let imgResourceURL = module.exports.newtabUtils.getImgURL(_(topic + '_' + match.substr(1)));
                tmpl = tmpl.replace(match, imgResourceURL);
            } else {
                // replaces the matched template string with the localised string
                tmpl = tmpl.replace(match, _(topic + '_' + match.substr(1)));
            }
        }

        return tmpl;
    },
    /**
     * Remove highlighting from current UITour element(s)
     */
    removeHighlight: function() {
        // the browser window object from which we can grab an individual node (like the awesome bar)
        let activeWindow = windowUtils.getMostRecentBrowserWindow();
        UITour.hideHighlight(activeWindow);
    },
    /**
     * Prompts the user to set Firefox as their default brower.
     */
    setAsDefault: function() {
        let activeWindow = windowUtils.getMostRecentBrowserWindow();
        UITour.setConfiguration(activeWindow, 'defaultBrowser');
    },
    /*
     * Opens the search bar
     */
    showSearch: function() {
        // the browser window object from which we can grab an individual node (like the awesome bar)
        let activeWindow = windowUtils.getMostRecentBrowserWindow();
        let barPromise = UITour.getTarget(activeWindow, 'search');
        let iconPromise = UITour.getTarget(activeWindow, 'searchIcon');

        iconPromise.then(function(iconObj) {
            let searchIcon = iconObj.node;
            searchIcon.click();

            barPromise.then(function(barObj) {
                let searchbar = barObj.node;
                searchbar.updateGoButtonVisibility();
            });
        });
    }
};
