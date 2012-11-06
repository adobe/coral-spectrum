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

CUI.rte.Query = function() {

    return {

        selectNode: function(q, dom) {
            return CQ.Ext.DomQuery.selectNode(q, dom);
        },

        select: function(q, dom) {
            return CQ.Ext.DomQuery.select(q, dom);
        }

    };

}();