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

CUI.rte.AdapterUtils = function() {

    return {

        isArray: function(obj) {
            return CQ.Ext.isArray(obj);
        },

        isString: function(obj) {
            return CQ.Ext.isString(obj);
        },

        apply: function(obj, config, defaults) {
            return CQ.Ext.apply(obj, config, defaults);
        },

        getPagePosition: function(dom) {
            return CQ.Ext.get(dom).getXY();
        },

        getWidth: function(dom) {
            return CQ.Ext.get(dom).getSize().width;
        },

        getHeight: function(dom) {
            return CQ.Ext.get(dom).getSize().height;
        },

        jsonDecode: function(str) {
            return CQ.Ext.util.JSON.decode(str);
        },

        getBlankImageUrl: function() {
            return CQ.Ext.BLANK_IMAGE_URL;
        }

    };

}();