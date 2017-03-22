'use strict';

let _ = require('sdk/l10n').get;
let { Cu } = require('chrome');
let { emit, once } = require('sdk/event/core');
let self = require('sdk/self');
let { UITour } = Cu.import('resource:///modules/UITour.jsm');
let windowUtils = require('sdk/window/utils');

exports.utils = {
/** This is called to explicitly 'uninstall' the addon, destroying functional
     *  pieces needed for user interaction, effectively removing the addon
     */
    destroy: function () {
        emit(exports, 'intent', 'destroy');
    },
    /**
     * @param {string} imgBaseUrl - The base url for the img to load
     * @returns The image' resource:// url
     */
    getImgURL: function(imgBaseUrl) {
        return self.data.url(imgBaseUrl);
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
                let imgResourceURL = module.exports.utils.getImgURL(_(topic + '_' + match.substr(1)));
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

// From the MDN docs:
// https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_event_targets
// "delegate to the corresponding function from event/core, and use bind() to pass the
// exports object itself as the target argument to the underlying function."
exports.once = once.bind(null, exports);
