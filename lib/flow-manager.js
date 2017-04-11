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
        let isSnippetInProgress = typeof storageManager.get('snippetInProgress') !== 'undefined';
        let mainTourComplete = storageManager.get('mainTourComplete');
        let missedSnippets = storageManager.get('missedSnippets');
        let step = storageManager.get('step');

        // have we shown the first step?
        if (typeof step === 'undefined') {
            storageManager.set('step', 0);
            // modify the newtab
            newtabUtils.modify(worker);
            // only start a new durationTimer if there is no snippet
            // in progress i.e. this is first time this code is run.
            if (!isSnippetInProgress) {
                emit(exports, 'action', 'durationTimer');
            }
        // If we have shown the first step but, not reached the final
        } else if (!mainTourComplete) {
            // modify the newtab
            newtabUtils.modify(worker);
            // this is first time this code is run, start a durationTimer
            if (!isSnippetInProgress) {
                emit(exports, 'action', 'durationTimer');
            }
        // If the main tour is complete, the missedSnippets array exists, and there is at least 1 item
        } else if (mainTourComplete && typeof missedSnippets !== 'undefined' && missedSnippets.length) {
            // modify the newtab
            newtabUtils.modify(worker, missedSnippets[0]);
            // this is first time this code is run, start a durationTimer
            if (!isSnippetInProgress) {
                emit(exports, 'action', 'durationTimer');
            }
        }
    },
    /**
     * Moves the missed snippets part of the tour forward
     * @param {array} missedSnippets - The array of missed snippets
     */
    progressMissedSnippets: function(missedSnippets) {
        // we will no longer show this snippet to the user so,
        // remove it from the array
        missedSnippets.shift();
        // store the new array in storage
        storageManager.set('missedSnippets', missedSnippets);
    },
    /**
     * Handles the progression of the tour, as well as storing missed snippets
     */
    progressMainTour: function() {
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
    },
    /**
     * Calls the relevant progress function based on the current
     * state of the tour i.e. main tour or missed snippets
     */
    setOverallTourProgress: function() {
        let mainTourComplete = storageManager.get('mainTourComplete');
        let missedSnippets = storageManager.get('missedSnippets');

        if (!mainTourComplete) {
            module.exports.flowManager.progressMainTour();
        // if missedSnippets exist and there is at least 1 item in the array
        } else if(typeof missedSnippets !== 'undefined' && missedSnippets.length) {
            module.exports.flowManager.progressMissedSnippets(missedSnippets);
        }
    }
};

exports.onFlowManagerEvent = on.bind(null, exports);
