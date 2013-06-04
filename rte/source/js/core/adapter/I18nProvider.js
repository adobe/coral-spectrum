/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

/**
 * <p>This interface class must be implemented for specific contexts to provide
 * internationalization for the Rich Text Editor.</p>
 */
CUI.rte.I18nProvider = new Class({

    /**
     * Return the correctly internationalized text that is represented by the specified
     * ID.
     * @param {String} id The text ID
     * @param {Array} values (optional) Values to fill placeholders with
     * @returns {String} The internationalized text
     */
    getText: function(id, values) {
        // must be overridden by something meaningful for the respective context
        return id;
    }

});