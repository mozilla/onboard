'use strict';

let _ = require('sdk/l10n').get;
let { emit, once } = require('sdk/event/core');
let self = require('sdk/self');

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
    }
};

// From the MDN docs:
// https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_event_targets
// "delegate to the corresponding function from event/core, and use bind() to pass the
// exports object itself as the target argument to the underlying function."
exports.once = once.bind(null, exports);
