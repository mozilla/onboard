'use strict';

let pageMod = require('sdk/page-mod');

let { storageManager } = require('../storage-manager.js');

// http://regexr.com/3dbrq
let firstrunRegex = /.*firefox[\/\d*|\w*\.*]*\/firstrun\/.*/;

exports.firstrun = {
    firstRun: undefined,
    /**
     * Stops pagemod from making more modifications on firstrun in the future,
     * and disables its further use
     */
    destroy: function() {
        if (this.firstRun) {
            this.firstRun.destroy();
        }
    },
    /**
    * Stores a timestamp, as installTime, when /firstrun is accessed for the first time
    */
    setInstallTime: function() {
        this.firstRun = pageMod.PageMod({
            include: firstrunRegex,
            onAttach: function() {
                // this will only be invoked once when /firstrun is
                // accessed for the first time.
                storageManager.set('installTime', Date.now());
                // we have set the installTime, we can safely destroy the pageMod
                module.exports.firstrun.destroy();
            }
        });
    }
};
