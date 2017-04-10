'use strict';

let Request = require('sdk/request').Request;

exports.gaRequests = {
    /**
     * Sends post events to Google Analytics about various
     * interactions with the add-on during it's lifecycle.
     * @param {object} eventData - The event data to record
     */
    post: function(eventData) {
        let gaRequest = Request({
            url: 'https://www.google-analytics.com',
            content: {
                v: 1,
                t: 'event',
                ec: 'Addon%20Interactions',
                ea: eventData.step,
                el: eventData.label,
                cid: '1234',
                cd3: eventData.varation,
                cd4: eventData.topic,
                cd5: eventData.impressionCount,
                tid: 'UA-36116321-22'
            },
            onComplete: function(response) {
                console.error('Response from GA', response.text);
            }
        });

        // post the request
        gaRequest.post();
    }
};
