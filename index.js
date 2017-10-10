'use strict';

let { AddonManager } = Cu.import('resource://gre/modules/AddonManager.jsm');

/**
 * Attempts to unistall the provided addon
 */
function attemptUninstall(addon) {
    // If we do not have the permission to unistall, just return
    if (!(addon.permissions & AddonManager.PERM_CAN_UNINSTALL)) {
        console.error('we do not have permission', addon.permissions);
        console.error('we do not have permission', AddonManager.PERM_CAN_UNINSTALL);
        return;
    }
    addon.uninstall();
    return;
}

/**
 * Attempt to uninstall the add-on itself. There is two
 * different version strings that may exist in the wild so,
 * we test for both possible identifiers
 */
function uninstallAddOn() {
    AddonManager.getAddonByID('@onboard-v1', function(addon) {
        // if the add-on is not installed, just return
        if (!addon) {
            return;
        }

        attemptUninstall(addon);
    });

    AddonManager.getAddonByID('@onboard-v2', function(addon) {
        // if the add-on is not installed, just return
        if (!addon) {
            return;
        }

        attemptUninstall(addon);
    });
}

/**
* Initializes the add-on
*/
exports.main = function() {
    uninstallAddOn();
};
