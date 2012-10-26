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
 * @class CUI.rte.Deserializer
 * <p>The Serializer class works as an "interface" for providing fully customized HTML
 * deserializers.</p>
 * <p>Deserializers are used to convert persisted HTML into a suitable DOM tree before
 * they are being edited.</p>
 * <p>You should only consider implementing this interface directly if you have very special
 * requirements. Usually, it should make more sense to extend one of the default
 * serializers, {@link CUI.rte.HtmlDeserializer} or
 * {@link CUI.rte.XhtmlDeserializer}.</p>
 * <p>Deserializers should usually do the following cleanup/adjustments:</p>
 * <ul>
 *   <li>Correct the incoming (X)HTML to be browser-compatible. For example, IE chokes if
 *     XHTML is directly set to the DOM.</li>
 * </ul>
 */
CUI.rte.Deserializer = new Class({

    toString: "Deserializer",

    /**
     * <p>Deserializes the specified HTML to the sppecified DOM root element.</p>
     * <p>Note that the specified DOM element itself is kept as is.</p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {String} html The HTML to be deserialized
     * @param {HTMLElement} rootDom The DOM (sub-) tree to deserialize the HTML to
     */
    deserialize: function(context, html, rootDom) {
        // must be overridden by the implementing class
    }

});