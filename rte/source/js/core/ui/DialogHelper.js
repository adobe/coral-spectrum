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
 * @class CUI.rte.ui.DialogHelper
 * @private
 * <p>The DialogHelper provides helper functionality for creating extensible dialogs from
 * inside the richtext editor. It should be used by plugins to create and display
 * dependent dialogs.</p>
 * <p>The following features are available:</p>
 * <ul>
 *   <li>The default, "out-of-the-box" dialog can be extended with additional fields.</li>
 *   <li>Fields that are contained in the default dialog may be disabled as required.</li>
 *   <li>The default dialog may be replaced completely by a custom dialog.</li>
 * </ul>
 * @constructor
 * Creates a new DialogHelper with the specified configuration.
 * @param {Object} dialogConfig The dialog's configuration
 * @param {CUI.rte.EditorKernel} editorKernel The editor kernel the dialog is used from
 * @since 5.3
 */
CUI.rte.ui.DialogHelper = new Class({

    toString: "DialogHelper",

    /**
     * @cfg {Number} configVersion
     * Defines the version of the dialog configuration provided. Must currently be set to
     * 1 to use the extensible configuration. If no value is specified, the config is used
     * "as is" for CQ 5.2 compatibility.
     */
    configVersion: null,

    /**
     * @cfg {Object} defaultDialog
     * Defines the default dialog. This config property should only be set by the respective
     * plugin and not be used for customization. The object must contain an array named
     * items that contains Ext field definitions (as known from other component definitions)
     * or an Object named dialogClass which defines the xtype and optionally a
     * jcr:primaryType property. Additionally, an Object named dialogProperties can be
     * provided, which contains further dialog properties (such as width, height, title,
     * etc.). Note that each of the fields in the items array must contain a "name"
     * property which is used for referencing the field from other places.
     */
    defaultDialog: null,

    /**
     * @cfg {Object[]} additionalFields
     * <p>Array containing additional fields that have to be added to the default fields of
     * the dialog. Each element must have the following properties:</p>
     * <ul>
     *   <li><code>item</code> : String<br>
     *     The definition of the field (using a standard Ext item definition). Must contain
     *     a name property for further referencing.</li>
     *   <li><code>previousItem</code> : String<br>
     *     Name of the field that is located before the field to add. This is used to
     *     provide a certain sort order of the fields.</li>
     *   <li><code>fromModel</code> : Function<br>
     *     A function that is responsible for transferring the data from the model (usually
     *     the DOM object that is edited by the dialog, but actually depends on the
     *     context the DialogHelper is used in) to the additional field.</li>
     *   <li><code>toModel</code> : Function<br>
     *     A function that is responsible for transferring the user input from the
     *     additional field to the model (usually the DOM object that is edited by the
     *     dialog, but actually depends on the context the DialogHelper is used in)</li>
     * </ul>
     */
    additionalFields: null,

    /**
     * @cfg {String[]} disabledDefaultFields
     * An array of strings that contain the names of the default fields that should get
     * disabled. The actual names depend on the fields specified by {@link #defaultFields}.
     */
    disabledDefaultFields: null,

    /**
     * @cfg {Object} dialogProperties
     * Additional, overridden or customized dialog properties, such as width, height or
     * title.
     */
    dialogProperties: null,

    /**
     * Currently edited dialog (set in {@link #create})
     * @private
     * @type Object
     */
    dialogProcessed: null,

    /**
     * @cfg {Object} customDialog
     * <p>Config object that is used for replacing the default dialog by a completely
     * customized dialog.</p>
     * <p>The config object is a typical Ext component definition. If a jcr:primaryType
     * property is included, the customized dialog will be instantiated using the
     * respective toolkit's default method for instantiating dialogs indirectly. Otherwise
     * it is instantiated directly using the toolkit's standard component builder.</p>
     * <p>Note that all other config options are ignored if a custom dialog is used.</p>
     */
    customDialog: null,

    /**
     * The editor kernel the dialog is used from
     * @publicProp
     * @type CUI.rte.EditorKernel
     */
    editorKernel: null,


    construct: function(dialogConfig, editorKernel) {
        if (arguments.length === 1) {
            // required for backwards compatibility
            editorKernel = dialogConfig;
            dialogConfig = undefined;
        }
        this.editorKernel = editorKernel;
        if (dialogConfig) {
            this.configure(dialogConfig);
        }
    },

    configure: function(dialogConfig) {
        if (!dialogConfig.configVersion) {
            dialogConfig = {
                "configVersion": 1,
                "customDialog": dialogConfig
            };
        }
        CUI.rte.Utils.apply(this, dialogConfig);
    },

    /**
     * @protected
     */
    instantiateDialog: function(dialogConfig) {
        throw new Error(
                "DialogHelper#instantiateDialog must be implemented in a toolkit-specific "
                + "way");
    },

    /**
     * @private
     */
    createCustomDialog: function() {
        return this.instantiateDialog(this.customDialog);
    },

    /**
     * <p>Adds the additional fields to the specified dialog item configuration.</p>
     * <p>This method is used by {@link CUI.rte.ui.Window.BaseWindow} to apply custom
     * configuration. It should not be called directly.</p>
     * @private
     */
    addAdditionalItems: function(dialogItems) {
        var additionalFields = [ ];
        if (this.additionalFields) {
            var fieldCnt = this.additionalFields.length;
            for (var f = 0; f < fieldCnt; f++) {
                var fieldToAdd = this.additionalFields[f];
                if (fieldToAdd.item && fieldToAdd.item.name) {
                    var isInserted = false;
                    if (fieldToAdd.insertBefore) {
                        var itemCnt = dialogItems.length;
                        for (var i = 0; i < itemCnt; i++) {
                            var itemToCheck = dialogItems[i];
                            if (itemToCheck.name == fieldToAdd.insertBefore) {
                                dialogItems.splice(i, 0, fieldToAdd.item);
                                isInserted = true;
                                break;
                            }
                        }
                    }
                    if (!isInserted) {
                        dialogItems.push(fieldToAdd.item);
                    }
                    if (fieldToAdd.validator) {
                        fieldToAdd.item.validator = fieldToAdd.validator;
                        fieldToAdd.item.evaluateValidatorsFirst = true;
                    }
                    additionalFields.push({
                        "name": fieldToAdd.item.name,
                        "fromModel": fieldToAdd.fromModel,
                        "toModel": fieldToAdd.toModel
                    });
                }
            }
        }
        return additionalFields;
    },

    /**
     * <p>Removes the disabled fields from the specified dialog item configuration.</p>
     * <p>This method is used by {@link CUI.rte.ui.Window.BaseWindow} to apply custom
     * configuration. It should not be called directly.</p>
     * @private
     */
    removeDisabledItems: function(dialogItems) {
        var com = CUI.rte.Common;
        if (this.disabledDefaultFields) {
            var itemCnt = dialogItems.length;
            for (var i = itemCnt - 1; i >= 0; i--) {
                var item = dialogItems[i];
                if (com.arrayContains(this.disabledDefaultFields, item.name)) {
                    dialogItems.splice(i, 1);
                }
            }
        }
    },

    /**
     * <p>Merges two objects recursively.</p>
     * <p>Note that this method does not work with top-level Arrays.</p>
     * @param {Object} obj The base object
     * @param {Object} objToAppend The object that is merged into obj
     * @private
     */
    mergeObjects: function(obj, objToAppend) {
        for (var key in objToAppend) {
            if (objToAppend.hasOwnProperty(key)) {
                var value = objToAppend[key];
                if (typeof(value) == "object") {
                    var copyObj = CUI.rte.Utils.copyObject(value);
                    if (obj[key]) {
                        CUI.rte.Utils.applyDefaults(obj[key], copyObj);
                    } else {
                        obj[key] = copyObj;
                    }
                } else {
                    obj[key] = value;
                }
            }
        }
    },

    /**
     * @private
     */
    createExtensibleDialog: function() {
        if (!this.defaultDialog) {
            throw new Error("Invalid dialogConfig; missing property defaultDialog");
        }
        if (this.defaultDialog.dialogClass) {
            var dialogConfig = CUI.rte.Utils.copyObject(this.defaultDialog.dialogClass);
            if (this.defaultDialog.dialogProperties) {
                this.mergeObjects(dialogConfig, this.defaultDialog.dialogProperties);
            }
            if (this.dialogProperties) {
                this.mergeObjects(dialogConfig, this.dialogProperties);
            }
            if (this.parameters) {
                dialogConfig.parameters = this.parameters;
            }
            return this.instantiateDialog(dialogConfig);
        } else if (this.defaultDialog.items) {
            // todo implement
            return null;
        } else {
            throw new Error("Invalid dialogConfig; missing property defaultDialog.items "
                    + "or defaultDialog.dialogClass.");
        }
    },

    /**
     * Creates the dialog as specified by the configuration that was passed to the
     * constructor.
     * @return {Object} The toolkit specific object representing the dialog
     */
    create: function() {
        if (this.customDialog) {
            this.dialogProcessed = this.createCustomDialog();
        } else {
            this.dialogProcessed = this.createExtensibleDialog();
        }
        return this.dialogProcessed;
    },

    /**
     * Calculates a suitable dialog position for the specified editor kernel.
     * @param {String} hint A positioning hint; allowed values are: "default"
     */
    calculateInitialPosition: function(hint) {
        if (this.dialogProcessed) {
            this.dialogProcessed.setPosition(this.editorKernel.calculateWindowPosition(
                    hint));
        }
    },

    /**
     * Creates a new item of the specified type with the specified config.
     * @param {String} type The Item's type
     */
    createItem: function(type, name, label) {
        throw new Error(
                "DialogHelper#createItem must be implemented in a toolkit-specific way");
    },

    /**
     * Returns the type of the specified, toolkit-specific item
     * @param {Object} item The item to retrieve the type from
     */
    getItemType: function(item) {
        throw new Error(
                "DialogHelper#getItemType must be implemented in a toolkit-specific way");
    },

    /**
     * Returns the name of the specified, toolkit-specific item
     * @param {Object} item The item
     * @return {String} The item's name
     */
    getItemName: function(item) {
        throw new Error(
                "DialogHelper#getItemName must be implemented in a toolkit-specific way");
    },

    /**
     * Returns the current value of the specified, toolkit-specific item
     * @param {Object} item The item
     * @return {String} The current item value
     */
    getItemValue: function(item) {
        throw new Error(
                "DialogHelper#getItemValue must be implemented in a toolkit-specific way");
    },

    /**
     * Sets the specified, toolkit-specific item's value.
     * @param {Object} item The item
     * @param {String} value The value to set
     */
    setItemValue: function(item, value) {
        throw new Error(
                "DialogHelper#setItemValue must be implemented in a toolkit-specific way");
    }


});

/**
 * The dialog's type for indirect instantiation
 * @type {String}
 */
CUI.rte.ui.DialogHelper.TYPE_DIALOG = "rtelinkdialog";

/**
 * Item type: Text field
 * @type {String}
 */
CUI.rte.ui.DialogHelper.TYPE_TEXTFIELD = "textfield";

/**
 * Item type: Hidden field
 * @type {String}
 */
CUI.rte.ui.DialogHelper.TYPE_HIDDEN = "hidden";