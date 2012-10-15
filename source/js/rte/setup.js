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

window.CQ = window.CQ || { };
CQ.form = CQ.form || { };
CQ.form.rte = {};
CQ.form.rte.commands = {};
CQ.form.rte.plugins = {};
CQ.form.rte.adapter = {};
CQ.form.rte.ui = {};
CQ.form.rte.ui.ext = {};
CQ.form.rte.ui.cui = {};

(function() {

    // determine which implementation to use
    CQ.form.rte._adapter = (CQ.Ext ? "ext" : "jquery");
    // TODO remove after development
    CQ.form.rte._adapter = "jquery";
    CQ.form.rte._toolkit = (CQ.Ext ? "ext" : "cui");

})();
