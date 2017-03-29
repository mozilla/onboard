'use strict';

(function() {
    /**
     * Handles click events on the main CTA and emits the intent
     */
    function emitCTAIntent() {
        let cta = document.getElementById('onboarding_cta');
        cta.addEventListener('click', function(event) {
            event.preventDefault();
            self.port.emit('intent', cta.dataset.intent);
        });
    }

    /**
     * listen for the modify event emitted from the add-on, and only then,
     * start executiion of the code.
     * @param {object} data - An object containing the template and page titles.
     */
    self.port.on('modify', function(data) {
        let documentRoot = document.documentElement;
        let onBoardingTour = document.getElementById('fx_onboarding_tour');

        // if the onboarding tour element exists, first remove it from the DOM
        if (onBoardingTour) {
            documentRoot.removeChild(onBoardingTour);
        }

        // insert the new snippet
        documentRoot.insertAdjacentHTML('beforeend', data);
        // listen for a click event on the main CTA
        emitCTAIntent();
    });
})();
