'use strict';

var { utils } = require('lib/utils.js');

/**
 * This is called when the add-on is unloaded. If the reason is either uninstall,
 *  disable or shutdown, we can do some cleanup.
 */
exports.onUnload = function(reason) {
    if (reason === 'uninstall' || reason === 'disable') {
        utils.destroy();
    } else if (reason === 'shutdown') {
        // shutdown cleanup code goes here
    }
};

/**
* Initializes the add-on, and checks the time elapsed
* since a sidebar was last shown.
*/
exports.main = function() {

};
