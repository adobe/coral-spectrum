/**
 HTTP Utility functions used by CoralUI widgets

 @namespace
 */
CUI.util.HTTP = {
    /**
     * Checks whether the specified status code is OK.
     * @static
     * @param {Number} status The status code
     * @return {Boolean} True if the status is OK, else false
     */
    isOkStatus: function(status) {
        try {
            return (String(status).indexOf("2") === 0);
        } catch (e) {
            return false;
        }
    }
};
