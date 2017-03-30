'use strict';

let { messageListener } = require('./message-listener.js');
let { newtabUtils } = require('./newtab-utils.js');
let { storageManager } = require('./storage-manager.js');

exports.flowManager = {
    /**
     * Manages the flow of the tour.
     * @param {object} worker - The worker that receives messages
     */
    manageFlow: function(worker) {
        let step = storageManager.get('step');
        // if this is the first call to modifyAboutNewtab or,
        // the user has reached step 4
        if (typeof step === 'undefined' || step <= 4) {
            // emit modify event and pass snippet HTML as a string
            worker.port.emit('modify', newtabUtils.getSnippet());
            // listen for messages from about:newtab
            messageListener.listen(worker);
        // this is the final step of the main tour
        } else if (step === 5) {
            // emit modify event and pass snippet HTML as a string
            worker.port.emit('modify', newtabUtils.getSnippet());
            // listen for messages from about:newtab
            messageListener.listen(worker);
            // store an indicator that the main tour is complete
            storageManager.set('mainTourComplete', true);
        }
    }
};
