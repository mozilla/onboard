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
        let dismissedSnippets = storageManager.get('dismissedSnippets');
        let mainTourComplete = storageManager.get('mainTourComplete');
        let step = storageManager.get('step');

        // if this is the first call to modifyAboutNewtab or,
        // the user has reached step 4
        if (typeof step === 'undefined' || step <= 4) {
            // emit modify event and pass snippet HTML as a string
            worker.port.emit('modify', newtabUtils.getSnippet());
            // listen for messages from about:newtab
            messageListener.listen(worker);
        // If this is the final step, and the main tour is not yet complete
        } else if (step === 5 && !mainTourComplete) {
            // emit modify event and pass snippet HTML as a string
            worker.port.emit('modify', newtabUtils.getSnippet());
            // listen for messages from about:newtab
            messageListener.listen(worker);
        // If the main tour is complete, the dismissedSnippets array exists, and there is at
        // least 1 item in the array
        } else if (mainTourComplete && typeof dismissedSnippets !== 'undefined' && dismissedSnippets.length) {
            // get and remove the first item from the array
            let dismissedStep = parseInt(dismissedSnippets.shift());
            // store the new array in storage
            storageManager.set('dismissedSnippets', dismissedSnippets);
            // emit modify event and pass dismissed snippet HTML as a string
            worker.port.emit('modify', newtabUtils.getSnippet(dismissedStep));
            // listen for messages from about:newtab
            messageListener.listen(worker);
        }
    }
};
