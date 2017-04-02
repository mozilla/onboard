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
     * Closes the current snippet and moves it into the dismissedSnippets array
     */
    dismissSnippet: function() {
        let mainCTAComplete = storageManager.get('mainCTAComplete');
        let step = storageManager.get('step');
        // moves the tour forward 1 step but, only if the current snippet's
        // mainCTA was not complete or, we are currently on the first snippet
        if (step === 0 || !mainCTAComplete) {
            storageManager.set('step', parseInt(storageManager.get('step')) + 1);
        }
    },
    /**
     * Loads and returns the requested snippet
     */
    getSnippet: function() {
        let mainCTAComplete = storageManager.get('mainCTAComplete');
        let step = storageManager.get('step');
        let snippet = '';
        let tmpl = self.data.load('./tmpl/snippet.html');
        let variation = variations[storageManager.get('variation')];

        // if step is undefined, this is the first snippet
        if (typeof step === 'undefined') {
            storageManager.set('step', 0);
            snippet = module.exports.newtabUtils.processTmpl({
                'tmpl': tmpl,
                'topic': variation[0],
                'count': 1
            });
        } else {
            // if the mainCTA has been completed, move the tour forward by 1 step
            if (mainCTAComplete) {
                step = parseInt(step) + 1;
                // store the new step
                storageManager.set('step', step);
                // set mainCTAComplete to false
                storageManager.set('mainCTAComplete', false);
            }
            snippet = module.exports.newtabUtils.processTmpl({
                'tmpl': tmpl,
                'topic': variation[step],
                'count': step + 1
            });
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
                module.exports.newtabUtils.highLight('addons');
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
     * @param {object} tmplData - The data for the template. Contains three items:
     * 1. tmpl - The template HTML as a string
     * 2. topic - The current snippet i.e. sync, addons etc.
     * 3. count - The current step count
     */
    processTmpl: function(tmplData) {
        let regex = /%[\w]+/;
        let resultsArray = [];

        while ((resultsArray = regex.exec(tmplData.tmpl)) !== null) {
            let imgResourceURL = '';
            let match = resultsArray[0];

            switch(match) {
                case '%count':
                    tmplData.tmpl = tmplData.tmpl.replace(match, tmplData.count);
                    break;
                case '%main_title':
                    tmplData.tmpl = tmplData.tmpl.replace(match, _('main_title'));
                    break;
                case '%icon':
                    // if the match is for the string %icon, this is a media item
                    // so we need to get the full resource:// url to inject into the tmpl
                    imgResourceURL = module.exports.newtabUtils.getImgURL(
                        _(tmplData.topic + '_' + match.substr(1)));
                    tmplData.tmpl = tmplData.tmpl.replace(match, imgResourceURL);
                    break;
                default:
                    // replaces the matched template string with the localised string
                    tmplData.tmpl = tmplData.tmpl.replace(match, _(tmplData.topic + '_' + match.substr(1)));
                    break;
            }
        }

        return tmplData.tmpl;
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
