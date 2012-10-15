/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2012 Adobe Systems Incorporated
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
 * @class CUI.rte.Serializer
 * <p>The Serializer class works as an "interface" for providing fully customized HTML
 * serializers.</p>
 * <p>Serializers are used to convert the DOM of the edited document (resp. its "body" part)
 * into a suitable HTML representation that is used for storing the document in the
 * repository or editing using HTML source view.</p>
 * <p>You should only consider implementing this interface directly if you have very special
 * requirements. Usually, it should make more sense to extend one of the default
 * serializers, {@link CUI.rte.HtmlSerializer} or {@link CUI.rte.XhtmlSerializer}.
 * </p>
 * <p>Serializers should usually do the following cleanup/adjustments:</p>
 * <ul>
 *   <li>Provide correct tag/attribute case (i.e., in XHTML output, tag and attribute names
 *     should be lowercase)</li>
 * </ul>
 */
CUI.rte.Serializer = new Class({

    toString: "Serializer",

    /**
     * <p>Serializes the specified DOM (sub-) tree.</p>
     * <p>Note that the specified DOM element itself must not get serialized.</p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} dom The DOM (sub-) tree to serialize
     * @return {String} The serialized representation of the DOM (sub-) tree
     */
    serialize: function(context, dom) {
        // must be overridden by the implementing class
        return "";
    }

});