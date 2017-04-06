'use strict';

let { emit, on } = require('sdk/event/core');

let { newtabUtils } = require('./newtab-utils.js');
let { storageManager } = require('./storage-manager.js');

exports.flowManager = {
    /**
     * Calculates and returns the remaining duration between now, and when the timer
     * was initially started.
     * @returns remainingDuration - The remaining duration in milliseconds
     */
    getDurationRemainder: function() {
        let durationTimerStartTime =  storageManager.get('durationTimerStartTime');
        let remainingDuration = 0;

        if (typeof durationTimerStartTime !== 'undefined') {
            remainingDuration = Date.now() - durationTimerStartTime;
        }

        return remainingDuration;
    },
    /**
     * Manages the flow of the tour.
     * @param {object} worker - The worker that receives messages
     */
    manageFlow: function(worker) {
        let mainTourComplete = storageManager.get('mainTourComplete');
        let missedSnippets = storageManager.get('missedSnippets');
        let step = storageManager.get('step');

        // have we shown the first step?
        if (typeof step === 'undefined') {
            storageManager.set('step', 0);
            // modify the newtab
            newtabUtils.modify(worker);
            // start a new durationTimer
            emit(exports, 'action', 'durationTimer');
        // If we have shown the first step but, not reached the final
        } else if (!mainTourComplete) {
            // modify the newtab
            newtabUtils.modify(worker);
            // start a new durationTimer
            emit(exports, 'action', 'durationTimer');
        // If the main tour is complete, the missedSnippets array exists, and there is at least 1 item
        } else if (mainTourComplete && typeof missedSnippets !== 'undefined' && missedSnippets.length) {
            // modify the newtab
            newtabUtils.modify(worker, missedSnippets[0]);
            // we will not show this snippet to the user
            // again so, remove it from the array
            missedSnippets.shift();
            // store the new array in storage
            storageManager.set('missedSnippets', missedSnippets);
            // start a new durationTimer
            emit(exports, 'action', 'durationTimer');
        }
    },
    /**
     * Handles the progression of the tour, as well as storing missed snippets
     */
    progressTour: function() {
        let mainCTAComplete = storageManager.get('mainCTAComplete');
        let mainTourComplete = storageManager.get('mainTourComplete');
        let snippetDismissed = storageManager.get('snippetDismissed');
        let step = storageManager.get('step');

        if (!mainCTAComplete && (typeof snippetDismissed === 'undefined' || !snippetDismissed)) {
            // add snipped to missedSnippets array
            newtabUtils.updateMissedSnippets(step);
        }

        if (step !== 5 && !mainTourComplete) {
            // move tour forward
            storageManager.set('step', step + 1);
        } else if (step === 5 && !mainTourComplete) {
            // store and indicator marking the main tour as complete
            storageManager.set('mainTourComplete', true);
        }
    }
};

exports.onFlowManagerEvent = on.bind(null, exports);
