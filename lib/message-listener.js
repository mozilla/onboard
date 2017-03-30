'use strict';

let { newtabUtils } = require('./newtab-utils.js');

exports.messageListener = {
    /**
     * Listens for messages passed to the worker, and calls the appropriate function
     * based on message
     * @param {object} worker - The worker that receives messages
     */
    listen: function(worker) {
        // intent event is fired when the user clicks the main CTA for the current snippet
        worker.port.on('intent', function(intent) {
            newtabUtils.handleIntent(intent);
        });

        // the current snippet has been dismissed by the user
        worker.port.on('dismiss', function() {
            newtabUtils.dismissSnippet();
        });
    }
};
