'use strict';

let { emit, once } = require('sdk/event/core');

exports.utils = {
/** This is called to explicitly 'uninstall' the addon, destroying functional
     *  pieces needed for user interaction, effectively removing the addon
     */
    destroy: function () {
        emit(exports, 'intent', 'destroy');
    }
};

// From the MDN docs:
// https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Creating_event_targets
// "delegate to the corresponding function from event/core, and use bind() to pass the
// exports object itself as the target argument to the underlying function."
exports.once = once.bind(null, exports);
