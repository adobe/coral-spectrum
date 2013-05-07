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
 * @class CUI.rte.EditorKernel
 * @private
 * This class implements the core functionality each rich text-based editor requires.
 * It abstracts that core functionality from the component implementation - hence rich text
 * functionality may be used in different contexts, for example as a widget vs. inplace
 * editing.
 */
CUI.rte.EditorKernel = new Class({

    toString: "EditorKernel",

    /**
     * @cfg {Boolean} removeSingleParagraphContainer
     * True if the paragraph element of texts that consist only of a single paragraph
     * should be removed on serialization (defaults to false).
     * For example, if a text is &lt;p&gt;Single paragraph text&lt;/p&gt;, the surrounding
     * "p" tag would get removed if this option was set to true. This option is mainly for
     * backward compatibility with CQ 5.1, where container tags had not yet been available.
     * Hence texts that were created by a CQ 5.1 instance will be surrounded by a single "p"
     * element before they are edited in a CQ 5.2 instance. By setting this option to true,
     * this automatically added "p" tag will get removed before the text is saved, at least
     * if no other paragraphs or containers were added.
     * @deprecated Use {@link CUI.rte.HtmlRules.BlockHandling#removeSingleParagraphContainer} instead
     */
    removeSingleParagraphContainer: false,

    /**
     * @cfg {String} singleParagraphContainerReplacement
     * Specifies the name of the tag that has to be used if a paragraph container cannot
     * be simply removed because it carries additional info (for example, alignment and/or
     * CSS classes; defaults to "div"). Note that this setting only takes effect if
     * {@link #removeSingleParagraphContainer} is set to true.
     * @deprecated Use {@link CUI.rte.HtmlRules.BlockHandling#singleParagraphContainerReplacement} instead
     */
    singleParagraphContainerReplacement: null,

    /**
     * @cfg {Object[]} linkInternalize
     * <p>Defines a list of attributes for which link internalizing has to be applied.</p>
     * <p>Link internalizing is necessary as the browser usually stores entire URLs in the
     * DOM, not relative links. Hence internal links must be rewritten to be "internal"
     * before submitting the text.</p>
     * <p>For example, the "href" attribute of a link might be created as something like
     * "http://localhost:4502/cq5/content/geometrixx/en.html", which has
     * to be stored as "/content/geometrixx/en.html".</p>
     * <p>Each element of the Array must have the following properties:</p>
     * <ul>
     *   <li><code>tag</code> : String<br>
     *     The name of the tag for which the internalizing should be done</li>
     *   <li><code>attribute</code> : String<br>
     *     The name of the attribute that contains the link to be internalized</li>
     * </ul>
     * <p>Defaults to:</p>
<pre>
[
     {
        "tag": "a",
        "attribute": "href"
    }, {
        "tag": "img",
        "attribute": "src"
    }
]
</pre>
     */
    linkInternalize: null,

    /**
     * @cfg {Object} rtePlugins
     * <p>This is the root of all plugin-specific configuration.</p>
     * <p>You must provide a config element for each plugin you are about to configure.
     * Use the plugin's ID (see class documentation) as the property name for the
     * corresponding config element. Each config element has config options that are
     * used by all plugins, and plugin-specific options. Commonly used options are:</p>
     * <ul>
     *   <li><code>features</code> : String[]/String<br>
     *   A String[] that contains all features of a plugin that should be
     *   enabled; alternatively a String "*" may be provided to enable all features of the
     *   corresponding plugin</li>
     *   <li><code>tooltips</code> : Object<br>
     *   An object that defines the tooltips for the plugin's icons. Property name specifies
     *   the name of the icon (usually the ID of the feature that is represented by the
     *   icon; the value has a tooltip description object as required by Ext.</li>
     * </ul>
     * <p>Plugin-specific options are documented at the respective plugin. Note that this
     * object is null after constructing the RichText object has finished, as the
     * configuration is transferred to the respective plugin.</p>
     */

    /**
     * @cfg {CUI.rte.HtmlRules} htmlRules
     * This object defines how to create/process HTML. Defaults to null (uses default
     * HTML rules).
     * @since 5.3
     */
    htmlRules: null,

    /**
     * Processing module used for pre-processing HTML before editing
     * @private
     * @type CUI.rte.DomCleanup
     */
    preProcessor: null,

    /**
     * Processing module used for post-processing HTML before submitting or editing as
     * source code
     * @private
     * @type CUI.rte.DomCleanup
     */
    postProcessor: null,

    /**
     * Associative array of registered commands; values of type
     * {@link CUI.rte.commands.Command}
     * @private
     * @type Object
     */
    registeredCommands: null,

    /**
     * Associative array of registered plugins; values of type
     * {@link CUI.rte.plugins.Plugin}
     * @private
     * @type Object
     */
    registeredPlugins: null,

    /**
     * Current edit context. This should never be accessed directly, but only through
     * {@link #getEditContext}.
     * @private
     * @type CUI.rte.EditContext
     */
    editContext: null,

    /**
     * <p>Internal event listeners. Each element of the Array must have the following
     * properties:</p>
     * <ul>
     *   <li><code>fn</code> : String<br>
     *     A (suitably scoped) Function object that contains the listener code</li>
     *   <li><code>plugin</code> : String<br>
     *     The plugin that registers the listener</li>
     *   <li><code>deferred</code> : Boolean<br>
     *     True if the listener should be executed deferred (which is sometimes necessary to
     *     avoid some timing pitfalls, but not supported for all event types)</li>
     * </ul>
     * @private
     * @type Object[]
     */
    internalListeners: null,

    /**
     * <p>UI listeners. Each element of the Array must have the followeing properties:</p>
     * <ul>
     *   <li><code>fn</code> : String<br>
     *     A (suitably scoped) Function object that contains the listener code.</li>
     * </ul>
     * @private
     * @type Object[]
     */
    uiListeners: null,

    /**
     * The toolbar (toolkit-independent)
     * @private
     * @type CUI.rte.ui.Toolbar
     */
    toolbar: null,

    /**
     * Context menu builder
     * @private
     * @type CUI.rte.ui.ContextMenuBuilder
     */
    contextMenuBuilder: null,

    /**
     * Currently displayed context menu (if any)
     * @private
     * @type Object
     */
    contextMenu: null,

    /**
     * The selection before the context menu gets invoked; required to be restored before
     * any command invoked through the context menu gets actually relayed
     * @private
     */
    contextMenuSavedRange: null,

    /**
     * Table of internally regsitered event handlers
     * @private
     * @type Object
     */
    registeredHandlers: null,

    /**
     * Flag that determines if internal event handling is currently disabled.
     * @private
     * @type Boolean
     */
    isEventingDisabled: false,

    /**
     * Flag that determines if the current focus blur is only a temporary blur. This is
     * used to distinguish focus changes to the toolbar (= temporary blur) from focus
     * changes to somewhere else (those blurs lead to a disabled toolbar). Therefore,
     * toolbar elements that do not immediately return focus to the editor kernel, must
     * explicitly set this flag to true on receiving the focus themselves. For example,
     * a (style of format) selector sets isTemporaryBlur to true in their focus event.
     * On the other hand, buttons usually don't require to set it, as they are returning
     * focus immediately.
     * @private
     * @type Boolean
     */
    isTemporaryBlur: false,

    /**
     * Flag that determines if focus handling is active for this editor kernel. If disabled,
     * the toolbar doesn't get enabled/disabled on focus changes. This may for example
     * be used in situations where the client wants to take control over the toolbar (for
     * example in source edit mode)
     * @private
     * @type Boolean
     */
    isFocusHandlingDisabled: false,

    /**
     * Flag that determines if the kernel currently holds the keyboard focus.
     * @publicProp
     * @type Boolean
     */
    hasFocus: false,

    /**
     * Flag that determines if the kernel is currently enabled
     * @private
     * @type Boolean
     */
    isEnabled: false,

    /**
     * Object that defines which actions have to be executed on next focus gain.
     * @private
     * @type Object
     */
    focusGainActions: null,

    /**
     * Registered key shortcuts; key: the letter (Ctrl+&lt;letter&gt;); value: the command
     * @private
     * @type Object
     */
    keyboardShortcuts: null,

    /**
     * The UI toolkit to be used; default value: ext
     * @private
     */
    uiToolkit: null,

    /**
     * The dialog manager to be used
     * @private
     */
    dialogManager: null,

    /**
     * The ID of the selection change tracking interval
     * @private
     */
    selectionChangeTracker: null,

    /**
     * Number of times the editor has been locked
     */
    lockCount: 0,


    construct: function(config, defaultPluginConfigFn) {
        config = config || { };
        CUI.rte.Utils.applyDefaults(config, {
            "linkInternalize": [ {
                "tag": "a",
                "attribute": "href"
            }, {
                "tag": "img",
                "attribute": "src"
            } ]
        });
        this.keyboardShortcuts = { };
        // commands
        this.registeredCommands =
            CUI.rte.commands.CommandRegistry.createRegisteredCommands();
        // plugins
        this.registeredPlugins =
            CUI.rte.plugins.PluginRegistry.createRegisteredPlugins(this);
        CUI.rte.Compatibility.moveDeprecatedPluginConfig(config);
        CUI.rte.Compatibility.moveDeprecatedHtmlRules(config);
        CUI.rte.Compatibility.configurePlugins(config, this, defaultPluginConfigFn);
        delete config.rtePlugins;
        // Initialize HTML rules
        if (config.htmlRules) {
            this.htmlRules = new CUI.rte.HtmlRules(config.htmlRules);
            delete config.htmlRules;
        } else {
            this.htmlRules = new CUI.rte.HtmlRules();
        }
        // Toolkit ...
        if (config.uiToolkit) {
            this.uiToolkit = config.uiToolkit;
            delete config.uiToolkit;
        } else {
            this.uiToolkit = CUI.rte._toolkit
                    || CUI.rte.EditorKernel.DEFAULT_TOOLKIT;
        }
        // other config
        this.linkInternalize = config.linkInternalize;
        delete config.linkInternalize;
        // pre/post processing
        var tagRules = { };
        if (this.tagReplace) {
            // Compatibility layer for CQ 5.2
            for (var tag in this.tagReplace) {
                if (this.tagReplace.hasOwnProperty(tag)) {
                    var replaceTag = this.tagReplace[tag];
                    tagRules[tag] = {
                        "rename": replaceTag
                    };
                }
            }
        }
        // Processing HTML code/DOM
        this.preProcessor = new CUI.rte.DomCleanup({
            "tagsToRemove": [ "font" ]
        });
        this.postProcessor = new CUI.rte.DomCleanup({
            "tagsToRemove": [ "font" ]
        });
        // other stuff
        var tk = CUI.rte.ui.ToolkitRegistry.get(this.uiToolkit);
        this.contextMenuBuilder = tk.createContextMenuBuilder(this);
        this.dialogManager = tk.createDialogManager(this);
        this.registeredHandlers = [ ];
        this.isEnabled = true;
        this.focusGainActions = { };
    },


    // Interface ---------------------------------------------------------------------------

    /**
     * Returns a suitable edit context for this EditorKernel's instance.
     * @return {CUI.rte.EditContext} The edit context for this instance
     */
    getEditContext: function() {
        // may be overridden by implementing EditorKernels
        if (this.editContext == null) {
            this.editContext = new CUI.rte.EditContext();
        }
        return this.editContext;
    },

    /**
     * Gets the HTML rules valid for this EditorKernel.
     * @return {CUI.rte.HtmlRules} The HTML rules
     */
    getHtmlRules: function() {
        return this.htmlRules;
    },

    /**
     * Returns the path of the currently edited content (if available).
     * @return {String} The content path; null if no content path is available
     */
    getContentPath: function() {
        // must be overridden by implementing classes
        return null;
    },

    /**
     * Get the DOM element that is responsible for focus handling.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     * @return {HTMLElement} The DOM element that is responsible for focus handling
     */
    getFocusDom: function(context) {
        // must be overridden by implementing EditorKernels
        return null;
    },

    /**
     * Focusses the DOM element responsible for rich text editing.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     */
    focus: function(context) {
        // must be overridden by implementing EditorKernels
    },

    /**
     * Blurs the focus.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     */
    blurFocus: function(context) {
        // must be overridden by implementing EditorKernels
    },

    /**
     * Calculates a suitable position for a subordinate window.
     * @param {String} hint A positioning hint; allowed values are: "default"; defaults to
     *        "default"
     * @return {Number[]} The XY position for the subordinate window (e.g., [100, 200])
     */
    calculateWindowPosition: function(hint) {
        // must be overridden by implementing editor kernels
        return [ 0, 0 ];
    },

    /**
     * Calculates a suitable position for the context menu.
     * @param {CUI.rte.EditorEvent} event The event that invoked the context menu
     * @return {Number[]} The XY position for the context menu (e.g., [100, 200])
     */
    calculateContextMenuPosition: function(event) {
        // must be overridden by implementing editor kernels
        return [ 0, 0 ];
    },

    /**
     * Determines if the editor kernel can edit the html source.
     * @return {Boolean} True if the kernel is capable of editing the html source
     * @since 5.5
     */
    canEditSource: function() {
        // may be overridden accordingly
        return false;
    },

    /**
     * Gets the dialog manager for this editor kernel.
     * @return {CUI.rte.ui.DialogManager} The dialog manager
     * @since 5.6
     */
    getDialogManager: function() {
        return this.dialogManager;
    },


    // Helpers -----------------------------------------------------------------------------

    /**
     * Deferred focusing of the DOM element responsible for rich text editing.
     * @param {Function} addFn (optional) additional function to be executed after focus request
     */
    deferFocus: function(addFn) {
        // may be overridden if necessary
        CUI.rte.Utils.defer(function() {
            this.focus();
            if (addFn && (typeof(addFn) == "function")) {
                addFn();
            }
        }, 10, this);
    },

    /**
     * Disables the kernel's event handling temporarily. It may be re-enabled by using
     * {@link #reenableEventHandling}.
     */
    disableEventHandling: function() {
        this.isEventingDisabled = true;
    },

    /**
     * Reeanbles the kernel's event handling after it was disabled temporarily (using
     * {@link #disableEventHandling}).
     */
    reenableEventHandling: function() {
        this.isEventingDisabled = false;
    },

    /**
     * Enables focus handling.
     */
    enableFocusHandling: function() {
        this.isFocusHandlingDisabled = false;
    },

    /**
     * Disables focus handling.
     */
    disableFocusHandling: function() {
        this.isFocusHandlingDisabled = true;
    },

    /**
     * Locks the editor, for example while a dialog for editing is shown.
     */
    lock: function() {
        this.lockCount++;
        if (this.isLocked() && !this.isEventingDisabled) {
            this.disableEventHandling();
        }
    },

    /**
     * Unlocks the editor, for example when a dialog (that has locked the editor) is hidden
     * again.
     */
    unlock: function() {
        this.lockCount--;
        if (!this.isLocked() && this.isEventingDisabled) {
            this.reenableEventHandling();
        }
    },

    /**
     * Checks if the editor is currently locked.
     * @returns {Boolean} True if the editor is currently locked
     */
    isLocked: function() {
        return (this.lockCount > 0);
    },


    /**
     * Executes some Gecko-related initialization. For example, disables the "enahanced"
     * table editing handles provided by Gecko browsers.
     */
    initializeGeckoSpecific: function() {
        var com = CUI.rte.Common;

        if (com.ua.isGecko && this.isEnabled) {
            var context = this.getEditContext();
            if (context.isInitialized()) {
                try {
                    context.doc.execCmd("useCSS", true);
                } catch (e) {
                    // ignore if unsupported
                }
                try {
                    context.doc.execCommand("styleWithCSS", false, false);
                } catch (e) {
                    // ignore if unsupported
                }
                try {
                    context.doc.execCommand("enableInlineTableEditing", false, false);
                } catch (e) {
                    // ignore if unsupported
                }
            }
        }
    },

    /**
     * <p>Ensures that the caret gets initialized.</p>
     * <p>Will be executed immediately, if the editor kernel currently has the focus, or
     * optionally on next focus gain.</p>
     */
    initializeCaret: function(enforceInit) {
        // may be overridden by the respective kernel implementation
    },

    /**
     * <p>Restores the last known IE selection.</p>
     * <p>This must be used to restore a selection after focus losses. For example, dragging
     * (and dropping) an image has to call this method to restore the insert point.</p>
     * <p>This method can be safely called for non-IE browsers - such calls are simply
     * ignored.</p>
     */
    restoreSelectionToLastKnownBookmark: function() {
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var context = this.getEditContext();
        if (com.ua.isOldIE && this.lastKnownBookmark) {
            if (!this.hasFocus) {
                this.focus();
            }
            sel.selectBookmark(context, this.lastKnownBookmark);
        }
    },


    // DOM-Event handling ------------------------------------------------------------------

    /**
     * Registers a DOM event handler.
     * @param {HTMLElement/window/document} obj The DOM object to register the handler for
     * @param {String} eventName The name of the event
     * @param {Function} handler The handler to be registered
     * @param {Object} scope Scope the handler will be executed in
     * @param {Object} options (optional) Options
     */
    registerHandler: function(obj, eventName, handler, scope, options) {
        var com = CUI.rte.Common;
        if (com.ua.isTouchInIframe && com.strStartsWith(eventName, "touch")) {
            // emergency brake: must not use touch events if editor is in iframe
            return;
        }
        CUI.rte.Eventing.on(this.editContext, obj, eventName, handler, scope, options);
        this.registeredHandlers.push({
            "obj": obj,
            "eventName": eventName,
            "handler": handler,
            "scope": scope
        });
    },

    /**
     * Registers several DOM event handlers at once.
     * @param {HTMLElement/window/document} obj The DOM object to register the handler for
     * @param {Object} events The events to be registered. The key specifies the event name,
     *        the value contains the handler Function
     * @param {Object} scope Scope the handler will be executed in
     * @param {Object} options (optional) Options
     */
    registerHandlers: function(obj, events, scope, options) {
        for (var eventName in events) {
            if (events.hasOwnProperty(eventName)) {
                var handler = events[eventName];
                this.registerHandler(obj, eventName, handler, scope, options);
            }
        }
    },

    /**
     * Unregisters all elements that were registered through {@link #registerHandler} and
     * {@link #registerHandlers}.
     */
    unregisterHandlers: function() {
        var handlerCnt = this.registeredHandlers.length;
        for (var h = 0; h < handlerCnt; h++) {
            var def = this.registeredHandlers[h];
            CUI.rte.Eventing.un(def.obj, def.eventName, def.handler, def.scope);
        }
        this.registeredHandlers.length = 0;
    },

    /**
     * <p>Initializes event handling for this editor kernel.</p>
     * <p>Use {@link #suspendEventHandling}</p> to clean up after using the editor kernel.
     * </p>
     */
    initializeEventHandling: function() {
        var com = CUI.rte.Common;
        var context = this.getEditContext();
        if (context.isInitialized() && this.isEnabled) {
            var doc = context.doc;
            // deferred execution handlers - no workarounds here; performance-intense
            // operations are explicitly welcome for deferred execution!
            if (com.ua.isIE) {
                // IE must use selectionchange event to react on selection/caret changes,
                // otherwise we get invalid selections when clicking inside an existing
                // selection - see bug #21013
                this.registerHandlers(doc, {
                        "selectionchange": function(e) {
                            this.onEditorEvent(e);
                        },
                        "keyup": function(e) {
                            this.onEditorEvent(e);
                            if (this.isEventingDisabled) {
                                return;
                            }
                            this.firePluginEvent("deferredkeyup", e, true);
                        },
                        "mousedown": function(e) {
                            if (this.isEventingDisabled) {
                                return;
                            }
                            this.firePluginEvent("deferredmousedown", e, true);
                        },
                        "mouseup": function(e) {
                            if (this.isEventingDisabled) {
                                return;
                            }
                            this.firePluginEvent("deferredmouseup", e, true);
                        }
                    }, this, {
                        "buffer": 100
                    });
            } else {
                // other browsers should listen to keyup/mousedown events
                this.registerHandlers(doc, {
                        "keyup": function(e) {
                            this.onEditorEvent(e);
                            if (this.isEventingDisabled) {
                                return;
                            }
                            this.firePluginEvent("deferredkeyup", e, true);
                        }
                    }, this, {
                        "buffer": 100
                    });
                if (!com.ua.isTouch) {
                    this.registerHandlers(doc, {
                            "mousedown": function(e) {
                                if (this.isEventingDisabled) {
                                    return;
                                }
                                this.firePluginEvent("deferredmousedown", e, true);
                            },
                            "mouseup": function(e) {
                                this.onEditorEvent(e);
                                if (this.isEventingDisabled) {
                                     return;
                                }
                                this.firePluginEvent("deferredmouseup", e, true);
                            }
                        }, this, {
                            "buffer": 100
                        });
                } else {
                    // touchstart/touchend are mapped to corresponding mousedown/mouseup
                    // events
                    this.registerHandlers(doc, {
                            "touchstart": function(e) {
                                if (this.isEventingDisabled) {
                                    return;
                                }
                                this.firePluginEvent("deferredmousedown", e, true);
                            },
                            "touchend": function(e) {
                                this.onEditorEvent(e);
                                if (this.isEventingDisabled) {
                                     return;
                                }
                                this.firePluginEvent("deferredmouseup", e, true);
                            }
                        }, this, {
                            "buffer": 100
                        });
                    // "Thread" that checks periodically for selection changes on mobile
                    // devices - there are a lot of cases where Safari does alter the
                    // selection without notifying the app properly using an appropriate
                    // DOM event
                    var ek = this;
                    this.selectionChangeTracker = window.setInterval(function() {
                        var sel = CUI.rte.Selection;
                        var bookmark = sel.createSelectionBookmark(context);
                        if (this.lastKnownSelection) {
                            var lks = this.lastKnownSelection;
                            // TODO evaluate bookmark/lks.cells
                            if ((bookmark.startPos != lks.startPos)
                                    || (bookmark.charCnt != lks.charCnt)
                                    || (bookmark.object != lks.object)) {
                                ek.onEditorEvent(new CUI.rte.EditorEvent({
                                    type: "selectionchange"
                                }));
                            }
                        }
                        this.lastKnownSelection = bookmark;
                    }, 500);
                }
            }
            // keydown is the same across all browsers and all device categories
            this.registerHandlers(doc, {
                    "keydown": function(e) {
                        if (this.isEventingDisabled) {
                            return;
                        }
                        this.firePluginEvent("deferredkeydown", e, true);
                    }
                }, this, {
                    "buffer": 100
                });

            // directly executed handlers - put workarounds that rely on immediately being
            // able on the DOM here. keep in mind that these events may get fired quite
            // often, so "expensive" operations should be executed here only if absolutely
            // necessary!
            this.registerHandlers(doc, {
                    "keydown": function(e) {
                        // workaround for MobileSafari temporary focus shift when in
                        // iframe and touchXxx handlers present
                        if (com.ua.isTouch) {
                            if (com.isTag(context.win.frameElement, "iframe")) {
                                // console.log("using focus transfer workaround.")
                                context.win.focus();
                            }
                        }
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        if (e.isCtrl()) {
                            if (com.ua.isIE) {
                                // handling of Ctrl-keys must be done here for IE
                                var c = String.fromCharCode(e.getCharCode()).toLowerCase();
                                var cmd = this.keyboardShortcuts[c];
                                if (cmd) {
                                    this.applyCommand(e);
                                    return;
                                } else {
                                    // prevent formatting shortcuts from being automatically
                                    // executed
                                    if ((c == 'b') || (c == 'i') || (c == 'u')
                                            || (c == 'm')) {
                                        e.stopEvent();
                                        return;
                                    }
                                }
                            }
                        }
                        this.firePluginEvent("beforekeydown", e, false);
                        if (!e.cancelKey) {
                            this.firePluginEvent("keydown", e, false);
                        }
                        if (e.cancelKey) {
                            e.stopEvent();
                            this.deferFocus();
                        }
                    },
                    "keyup": function(e) {
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        this.firePluginEvent("beforekeyup", e, false);
                        if (!e.cancelKey) {
                            this.firePluginEvent("keyup", e, false);
                        }
                        if (e.cancelKey) {
                            e.stopEvent();
                            this.deferFocus();
                        }
                    },
                    "keypress": function(e) {
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        if (com.ua.isGecko) {
                            // shortcut handling on Gecko
                            this.applyCommand(e);
                        }
                        if (!e.cancelKey) {
                            this.firePluginEvent("beforekeypress", e, false);
                        }
                        if (!e.cancelKey) {
                            this.firePluginEvent("keypress", e, false);
                        }
                        if (e.cancelKey) {
                            e.stopEvent();
                            this.deferFocus();
                        }
                    }
                }, this);

            // Mouse/Touch Events; fired directly
            if (com.ua.isTouch) {
                this.registerHandlers(doc, {
                    "touchstart": function(e) {
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        this.firePluginEvent("mousedown", e, false);
                    },
                    "touchend": function(e) {
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        this.firePluginEvent("mouseup", e, false);
                    }
                }, this);
            } else {
                this.registerHandlers(doc, {
                    "mousedown": function(e) {
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        this.firePluginEvent("mousedown", e, false);
                    },
                    "mouseup": function(e) {
                        this.cleanupOnEvent(e);
                        if (this.isEventingDisabled) {
                            return;
                        }
                        this.firePluginEvent("mouseup", e, false);
                    }
                }, this);
            }

            // Focus-Events, fired immediately
            this.registerHandlers(this.getFocusDom(context), {
                    "focus": function(e) {
                        this.cleanupOnEvent(e);
                        this.onFocus(e);
                    },
                    "blur": function(e) {
                        this.cleanupOnEvent(e);
                        this.onBlur(e);
                    }
                }, this);

            // Other Events, fired immediately
            this.registerHandlers(doc.body, {
                "paste": function(e) {
                    this.cleanupOnEvent(e);
                    this.onPaste(e);
                }
            }, this);
            if (com.ua.isIE) {
                this.registerHandlers(doc, {
                    "selectionchange": function(e) {
                        this.cleanupOnEvent(e);
                    }
                }, this, {
                    // deferred execution required here; interacts strangely otherwise with
                    // certain keystrokes (inserts two paragraphs when Enter is hit (once)
                    // on IE >= 9)
                    buffer: 10
                });
            }

            this.initializeGeckoSpecific();

            this.registerHandler(context.root, "contextmenu", function(event) {
                    if (this.isEventingDisabled) {
                        return false;
                    }
                    // disable internal event handling for the time the context menu
                    // is shown to prevent side-effects
                    this.isEventingDisabled = true;
                    event.preventDefault();
                    if (!this.handleContextMenu(event)) {
                        // no context menu shown: enable event handling again
                        this.isEventingDisabled = false;
                    }
                    return false;
                }, this);
        }
    },

    /**
     * <p>Suspends event handling for this editor kernel.</p>
     * <p>Use {@link #initializeEventHandling} to re-establish event handling.</p>
     */
    suspendEventHandling: function() {
        this.unregisterHandlers();
        if (this.selectionChangeTracker !== null) {
            window.clearInterval(this.selectionChangeTracker);
            this.selectionChangeTracker = null;
        }
    },

    /**
     * <p>Adds CSS "feature classes" to the specified DOM element.</p>
     * <p>Supported feature classes are:</p>
     * <ul>
     *   <li>ie - Internet Explorer</li>
     *   <li>ie6 - Internet Explorer 6</li>
     *   <li>ie7 - Internet Explorer 7</li>
     *   <li>ie8 - Internet Explorer 8</li>
     *   <li>ie9 - Internet Explorer 9</li>
     *   <li>ie10 - Internet Explorer 10</li>
     *   <li>gecko - Gecko engine</li>
     *   <li>webkit - Webkit engine</li>
     *   <li>safari - Safari</li>
     *   <li>chrome - Chrome</li>
     * </ul>
     * @param {HTMLElement} dom The DOM element
     */
    addFeatureClasses: function(dom) {
        var com = CUI.rte.Common;
        function addConditionally(cond, cssClass) {
            if (cond) {
                com.addClass(dom, cssClass);
            }
        }
        addConditionally(com.ua.isIE, "ie");
        addConditionally(com.ua.isIE6, "ie6");
        addConditionally(com.ua.isIE7, "ie7");
        addConditionally(com.ua.isIE8, "ie8");
        addConditionally(com.ua.isIE9, "ie9");
        addConditionally(com.ua.isIE10, "ie10");
        addConditionally(com.ua.isGecko, "gecko");
        addConditionally(com.ua.isWebKit, "webkit");
        addConditionally(com.ua.isSafari, "safari");
        addConditionally(com.ua.isChrome, "chrome");
    },

    /**
     * Internal handler for focus events.
     * @private
     */
    onFocus: function(e) {
        var com = CUI.rte.Common;

        if (!this.hasFocus) {
            if (com.ua.isOldIE) {
                // IE sends a onFocus event if the main window, but not the editor window
                // gets the focus, so we'll ignore the focus event if the range doesn't
                // point to the editor's window object
                var context = this.getEditContext();
                var editorWin = context.win;
                var range = CUI.rte.Selection.getLeadRange(context);
                var rangeWin;
                if (range.item) {
                    rangeWin = range.item(0).ownerDocument.parentWindow;
                } else {
                    rangeWin = range.parentElement().ownerDocument.parentWindow;
                }
                var hasRange = (rangeWin == editorWin);
                if (!hasRange) {
                    return;
                }
            }
            this.isEventingDisabled = false;
            this.hasFocus = true;
            if (!this.isFocusHandlingDisabled) {
                this.enableToolbar();
                this.updateToolbar();
            }
            this.onEditorEvent(e);
            // execute deferred stuff that has been scheduled for being executed on focus
            // gain
            if (this.focusGainActions.initializeCaret) {
                this.initializeCaret(false);
                this.focusGainActions.initializeCaret = false;
            }
        }
    },

    /**
     * Internal handler for blur events.
     * @private
     */
    onBlur: function(e) {
        if (this.hasFocus) {
            this.isEventingDisabled = true;
            this.isTemporaryBlur = false;
            this.hasFocus = false;
            if (!this.isFocusHandlingDisabled) {
                CUI.rte.Utils.defer(function() {
                    if (this.isEventingDisabled && !this.isTemporaryBlur &&
                            !this.isFocusHandlingDisabled) {
                        this.disableToolbar();
                    }
                }, 100, this);
            }
        }
    },

    /**
     * Internal handler for paste events (currently supported browsers only).
     * @private
     */
    onPaste: function(e) {
        if (this.isEventingDisabled) {
            return;
        }
        this.firePluginEvent("paste", e, false);
    },

    /**
     * <p>Notifies an (indirect) blur.</p>
     * <p>This method may be used to tell the editor kernel about implicit blurs. For
     * example, Gecko doen't send explicit blur events if the internal iframe gets hidden.
     * </p>
     */
    notifyBlur: function() {
        if (this.hasFocus) {
            this.onBlur();
        }
    },

    /**
     * Cleans up temporary stuff, as required by the specified event.
     * @param {CUI.rte.EditorEvent} e The event
     * @private
     */
    cleanupOnEvent: function(e) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        switch (e.getType()) {
            case "mousedown":
                dpr.removeTempSpans(e.editContext, true);
                break;
            case "keydown":
                if (!com.ua.isWebKit) {
                    dpr.removeTempSpans(e.editContext, true);
                }
                break;
            case "keyup":
                if (com.ua.isWebKit) {
                    dpr.removeTempSpans(e.editContext, true);
                }
                break;
        }
    },

    /**
     * <p>Centralized handler for deferred editor events (which should not be executed on
     * directly, but after a short while if no other event occurs).</p>
     * <p>There is several cleanup code in place; but mainly, the toolbar gets updated
     * (as it is a quite expensive operation).</p>
     * @param {Object} e The editor event (wrapping the original Ext event)
     * @private
     */
    onEditorEvent: function(e) {
        var com = CUI.rte.Common;
        var ignoreEventForContextMenu = false;
        if (com.ua.isIE) {
            if (e.getType() == "selectionchange") {
                ignoreEventForContextMenu = true;
                // store current bookmark to have it available later
                var context = this.getEditContext();
                if (context.isInitialized() && this.hasFocus) {
                    this.lastKnownBookmark = CUI.rte.Selection.createSelectionBookmark(
                            context);
                }
            }
        } else {
            ignoreEventForContextMenu = (e.getType() == "mouseup") && (e.getButton() == 2);
        }
        if (!ignoreEventForContextMenu) {
            if (this.contextMenu && this.contextMenuBuilder.isVisible()) {
                this.contextMenuBuilder.hideAll();
                this.isEventingDisabled = false;
            }
        }
        if (this.isEventingDisabled) {
            return;
        }
        this.fireUIEvent("updatestate", {
            "origin": "event",
            "event": e
        });
    },


    // Markup-based processing -------------------------------------------------------------

    /**
     * @private
     */
    getEmptyLinePlaceholderMarkup: function() {
        // will be adjusted in a browser-specific way by DomCleanup
        return "<p>&nbsp;</p>";
    },


    // Pre- and postprocessing -------------------------------------------------------------

    setUnprocessedHtml: function(html) {
        if (html.length < 1) {
            var interceptedHtml = this.execContentInterception("emptyContent", null);
            if (interceptedHtml != null) {
                html = interceptedHtml;
            } else {
                html = this.getEmptyLinePlaceholderMarkup();
            }
        }
        var context = this.getEditContext();
        this.htmlRules.serializer.deserialize(context, html, context.root,
                this.htmlRules.docType);
        CUI.rte.WhitespaceProcessor.process(context, context.root);
        this.preProcessor.preprocess(this, context.root);
        this.execContentInterception("postprocessDom", {
            "editContext": context
        });
    },

    getProcessedHtml: function() {
        var context = this.getEditContext();
        var root = context.root.cloneNode(true);
        this.execContentInterception("cleanDom", {
            "editContext": this.getEditContext(),
            "root": root
        });
        this.postProcessor.postprocess(this, root);
        return this.htmlRules.serializer.serialize(context, root, this.htmlRules.docType);
    },


    // Executing commands ------------------------------------------------------------------

    /**
     * @private
     */
    getCustomCommand: function(command) {
        var customCommand = this.registeredCommands[command];
        if (customCommand) {
            return customCommand;
        }
        for (var cmd in this.registeredCommands) {
            var cmdToCheck = this.registeredCommands[cmd];
            if (cmdToCheck.isCommand(command)) {
                return cmdToCheck;
            }
        }
        return null;
    },

    /**
     * Executes an editor command on the editor document and performs necessary focus and
     * toolbar updates. Commands that are not supported by a specific browser are emulated
     * accordingly. <b>This should only be called after the editor is initialized.</b>
     * @param {String} cmd The Midas command
     * @param {Object} value (optional) The value to pass to the command (defaults to null)
     */
    relayCmd: function(cmd, value) {
        if (!this.isEnabled) {
            return;
        }
        CUI.rte.Utils.defer(function() {
            var context = this.getEditContext();
            var sel = CUI.rte.Selection;
            var com = CUI.rte.Common;

            if (context.isInitialized()) {
                this.focus(context);
            }
            try {
                var preferredScrollOffset;
                if (context.isInitialized()) {
                    preferredScrollOffset = (com.ua.isIE ? null :
                        sel.getPreferredScrollOffset(context));
                }
                var execRet = this.execCmd(cmd, value, context);
                if (com.ua.isGecko && execRet && context.isInitialized()) {
                    if (execRet.geckoEnsureCaretVisibility) {
                        sel.ensureCaretVisibility(context, preferredScrollOffset);
                    }
                    if (execRet.bookmark) {
                        sel.selectBookmark(context, execRet.bookmark);
                    }
                }
            } catch (e) {
                if (e.message == "Cannot paste.") {
                    this.editorKernel.getDialogManager().alert(
                            CUI.rte.Utils.i18n("Paste"),
                            CUI.rte.Utils.i18n("Could not paste due to security restrictions of the browser.<br>Please use Ctrl+V to paste directly."),
                            CUI.rte.Utils.scope(this.deferFocus, this));
                } else if (e.message == "Cannot copy.") {
                    this.editorKernel.getDialogManager().alert(
                            CUI.rte.Utils.i18n("Copy"),
                            CUI.rte.Utils.i18n("Could not copy due to security restrictions of the browser.<br>Please use Ctrl+C to copy directly."),
                            CUI.rte.Utils.scope(this.deferFocus, this));
                } else if (e.message == "Cannot cut.") {
                    this.editorKernel.getDialogManager().alert(
                            CUI.rte.Utils.i18n("Cut"),
                            CUI.rte.Utils.i18n("Could not cut due to security restrictions of the browser.<br>Please use Ctrl+X to cut directly."),
                            CUI.rte.Utils.scope(this.deferFocus, this));
                } else if (e.message == "Could not insert html due to IE limitations.") {
                    this.editorKernel.getDialogManager().alert(
                            CUI.rte.Utils.i18n("Error"),
                            CUI.rte.Utils.i18n("Could not insert text due to internal Internet Explorer limitations. Please try to select a smaller text fragment and try again."),
                            CUI.rte.Utils.scope(this.deferFocus, this));
                } else {
                    throw e;
                }
            }
            this.fireUIEvent("updatestate", {
                "origin": "command",
                "cmd": cmd,
                "value": value,
                "ret": execRet
            });
        }, 10, this);
    },

    /**
     * Executes an editor command directly on the editor document. For visual commands, you
     * should use {@link #relayCmd} instead. Commands that are not supported by a specific
     * browser are emulated accordingly. <b>This method should only be called after the
     * editor is initialized. Otherwise, it will return immediately if the command is not
     * explicitly flagged for use in unitialized state.</b>
     * @param {String} command The Midas command
     * @param {Object} value (optional) The value to pass to the command (defaults to null)
     * @param {CUI.rte.EditContext} context (optional) The edit context
     */
    execCmd: function(command, value, context){
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        var cmd = CUI.rte.commands.Command;
        var com = CUI.rte.Common;
        // init
        if (!this.isEnabled) {
            return null;
        }
        if (!context) {
            context = this.getEditContext();
        }
        // check if a custom command has to be used instead of browser's implementation
        var customCommand = this.getCustomCommand(command);
        if (!context.isInitialized() && !customCommand) {
            return null;
        }
        if (!context.isInitialized()) {
            if (customCommand.requiresInitializedComponent(command)) {
                return null;
            }
        }
        if (this.initialized) {
            this.firePluginEvent("beforecommandexecuted", {
                "cmd": command,
                "cmdValue": value,
                "customCommand": customCommand
            }, false);
        }
        var calleeRet = null;
        if (customCommand) {
            var options = customCommand.getProcessingOptions();
            var execOptions = {
                "editContext": context,
                "command": command,
                "value": value,
                "component": this
            };
            if (context.isInitialized()) {
                if ((options & cmd.PO_SELECTION) > 0) {
                    execOptions.selection = this.createQualifiedSelection(context);
                    // Use normalized selection if we have a selection to ensure
                    // start node does not point "behind" a node, but points to the
                    // first actually included node. If the selection represents a caret,
                    // we'll have to use the un-normalized selection, because the position
                    // behind a node may have different impact than the position before
                    // the succeeding node (for example, t|<b>ex</b>t will insert a
                    // character in plaintext, whereas t<b>|ex</b>t will insert a bold
                    // character.
                    if (execOptions.selection
                            && sel.shouldNormalizePSel(context, execOptions.selection)) {
                        sel.normalizeProcessingSelection(context, execOptions.selection);
                    }
                }
                if ((options & cmd.PO_BOOKMARK) > 0) {
                    if (execOptions.selection) {
                        execOptions.bookmark = sel.bookmarkFromProcessingSelection(context,
                                execOptions.selection);
                    } else {
                        execOptions.bookmark = sel.createSelectionBookmark(context);
                    }
                }
                if ((options & cmd.PO_NODELIST) > 0) {
                    if (!execOptions.selection) {
                        execOptions.selection = this.createQualifiedSelection(context);
                    }
                    execOptions.nodeList = dpr.createNodeList(context,
                            execOptions.selection);
                }
            }
            var execRet = customCommand.execute(execOptions);
            if (context.isInitialized()) {
                var bookmark = execOptions.bookmark;
                if (bookmark && execRet && execRet.preventBookmarkRestore) {
                    bookmark = null;
                }
                if (bookmark && execRet && execRet.selOffset) {
                    if (execRet.selOffset.start) {
                        bookmark.startPos += execRet.selOffset.start;
                    }
                    if (execRet.selOffset.collapse) {
                        bookmark.charCnt = 0;
                    } else if (execRet.selOffset.cnt) {
                        bookmark.charCnt += execRet.selOffset.cnt;
                    }
                }
                if (bookmark) {
                    sel.selectBookmark(context, bookmark);
                }
            }
            if (execRet && execRet.calleeRet) {
                calleeRet = execRet.calleeRet;
            }
        } else {
            context.doc.execCommand(command, false, value === undefined ? null : value);
            if (com.ua.isGecko && com.strStartsWith(command, "insert")
                    && com.strEndsWith(command, "list")) {
                // clean up, as Gecko creates lines, not paragraphs
                dpr.ensureBlockContent(context, "p", null, true, false);
            }
        }
        if (context.isInitialized()) {
            this.firePluginEvent("commandexecuted", {
                "cmd": command,
                "cmdValue": value,
                "customCommand": customCommand
            }, false);
        }
        return calleeRet;
    },

    /**
     * <p>Queries the state for the specified command.</p>
     * <p>The result is dependent on the specified command. Some commands may not return
     * any state. See command documentation for more information.</p>
     * @param {String} command The command to query state for
     * @param {Object} selectionDef (optional) Analyzed selection
     * @since 5.3
     */
    queryState: function(command, selectionDef) {
        if (!this.isEnabled) {
            return false;
        }
        var context = this.getEditContext();
        if (!context.isInitialized) {
            return false;
        }
        var customCommand = this.getCustomCommand(command);
        if (!customCommand) {
            return context.doc.queryCommandState(command);
        }
        if (!selectionDef) {
            selectionDef = this.analyzeSelection();
        }
        if (!selectionDef) {
            return false;
        }
        return customCommand.queryState(selectionDef, command);
    },


    // Keyboard shortcuts ------------------------------------------------------------------

    /**
     * Registers a keyboard shortcut for the specified command.
     * @param {String} letter The letter to register; "b" will register the command for
     *        Ctrl+B
     * @param {String} command The command to be executed for the shortcut
     * @since 5.5
     */
    registerKeyboardShortcut: function(letter, command) {
        this.keyboardShortcuts[letter.toLowerCase()] = command;
    },

    /**
     * Applies several key commands on Gecko
     * @private
     */
    applyCommand: function(e) {
        if (e.isCtrl()) {
            var c = String.fromCharCode(e.getCharCode()).toLowerCase();
            var cmd = this.keyboardShortcuts[c];
            if (cmd) {
                e.cancelKey = true;
                e.stopEvent();
                this.focus();
                this.execCmd(cmd);
                this.deferFocus();
            }
        }
    },

    /**
     * Requests source edit mode (if available).
     * @param {Boolean} enable True if source edit mode should be activated
     */
    requestSourceEdit: function(enable) {
        this.isTemporaryBlur = true;
        this.fireUIEvent((enable ? "enable" : "disable") + "sourceedit");
    },


    // State -------------------------------------------------------------------------------

    /**
     * Enables the editor kernel for editing.
     */
    enable: function() {
        this.isEnabled = true;
        this.initializeEventHandling();
        if (this.hasFocus) {
            this.updateToolbar();
        }
    },

    /**
     * Disables the editor kernel for editing.
     */
    disable: function() {
        this.suspendEventHandling();
        this.disableToolbar([ "sourceedit" ]);
        this.isEnabled = false;
    },


    // Selection handling ------------------------------------------------------------------

    /**
     * <p>Creates a "qualified" processing selection.</p>
     * <p>"Qualified" means the original browser selection plus manipulations executed
     * by one or more plugins.</p>
     * @return {Object} qualified selection; null if no valid selection exists
     * @private
     */
    createQualifiedSelection: function(context) {
        var selection = CUI.rte.Selection.createProcessingSelection(context);
        if (!selection || (selection.startNode == null)) {
            return null;
        }
        for (var pluginId in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(pluginId)) {
                var plugin = this.registeredPlugins[pluginId];
                plugin.manipulateSelection(selection);
            }
        }
        return selection;
    },

    /**
     * <p>Creates a "qualified" range bookmark.</p>
     * <p>"Qualified" means the original ranges selection plus manipulations executed
     * by one or more plugins.</p>
     * @return {Object} qualified range bookmark
     * @private
     */
    createQualifiedRangeBookmark: function(context) {
        var bookmark = CUI.rte.Selection.createRangeBookmark(context);
        for (var pluginId in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(pluginId)) {
                var plugin = this.registeredPlugins[pluginId];
                plugin.saveRangeBookmark(bookmark);
            }
        }
        return bookmark;
    },

    /**
     * <p>Selects a "qualified" range bookmark.</p>
     * <p>"Qualified" means the original ranges selection plus manipulations executed
     * by one or more plugins.</p>
     * @param {Object} bookmark qualified range bookmark
     * @private
     */
    selectQualifiedRangeBookmark: function(context, bookmark) {
        CUI.rte.Selection.selectRangeBookmark(context, bookmark);
        for (var pluginId in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(pluginId)) {
                var plugin = this.registeredPlugins[pluginId];
                plugin.restoreRangeBookmark(bookmark);
            }
        }
    },

    /**
     * <p>Analyzes the current selection considering the following:</p>
     * <ul>
     *   <li>isSelection - if there is an actual selection or just a collapsed
     *     selection (caret)</li>
     *   <li>anchorCount - number of links intersected by the current selection</li>
     *   <li>anchors - definition (href, target) of all links intersected by the selection
     *     </li>
     *   <li>namedAnchorCount - number of anchors (a name="...") intersected by the current
     *     selection</li>
     *   <li>namedAnchors - definition of all anchors (a name="...") intersected by the
     *     current selection</li>
     *   <li>nodeList - List of nodes the selection consists of (see
     *     {@link CUI.rte.NodeList})</li>
     *   <li>styleCount - number of different CSS styles (classes) that are present in the
     *     current selection</li>
     *   <li>styles - CSS styles (classes) that are present in the current
     *     selection</li>
     *   <li>isContinuousStyle - true if there is only one style (CSS class) present in the
     *     current selection (not caret)</li>
     *   <li>containerList - list of all container tags that are intersected by the current
     *     selection</li>
     *   <li>consistentFormatting - list of all common ancestors DOM nodes (which define
     *     the formatting that is consistent through the entire selection)</li>
     *   <li>editContext - the edit context</li>
     *   <li>selection - the original processing selection</li>
     *   <li>selectedDom - the DOM node that is currently selected (if only the object
     *     itself is selected)</li>
     * </ul>
     * @return {Object} The result as described above
     * @private
     */
    analyzeSelection: function(context) {
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        if (!context) {
            context = this.getEditContext();
        }
        var anchors = [ ];
        var namedAnchors = [ ];
        var stylesDef = { };
        var consistentFormatting = [ ];
        var selection = this.createQualifiedSelection(context);
        if (!selection) {
            return null;
        }
        var isSelection = sel.isSelection(selection);
        // Use normalized selection if we have a selection to ensure
        // start node does not point "behind" a node, but points to the
        // first actually included node. If the selection represents a caret,
        // we'll have to use the un-normalized selection, because the position
        // behind a node may have different impact than the position before
        // the succeeding node (for example, t|<b>ex</b>t will insert a
        // character in plaintext, whereas t<b>|ex</b>t will insert a bold
        // character.
        if (sel.shouldNormalizePSel(context, selection)) {
            sel.normalizeProcessingSelection(context, selection);
        }
        var nodeList = dpr.createNodeList(context, selection);
        nodeList.getAnchors(context, anchors, true);
        nodeList.getNamedAnchors(context, namedAnchors, true);
        if (isSelection) {
            nodeList.getStyles(context, stylesDef, true);
        } else {
            var styleNode = selection.startNode;
            dpr.getStyles(context, stylesDef, styleNode);
        }
        var commonAncestor = nodeList.commonAncestor;
        while (commonAncestor) {
            consistentFormatting.push(commonAncestor);
            commonAncestor = CUI.rte.Common.getParentNode(context, commonAncestor);
        }
        var selectedDom = sel.getSelectedDom(selection);
        var styles = (stylesDef.styles ? stylesDef.styles : [ ]);
        return {
            "selection": selection,
            "selectedDom": selectedDom,
            "nodeList": nodeList,
            "isSelection": isSelection,
            "anchorCount": anchors.length,
            "anchors": anchors,
            "namedAnchorCount": namedAnchors.length,
            "namedAnchors": namedAnchors,
            "styleCount": styles.length,
            "styles": styles,
            "isContinuousStyle": stylesDef.isContinuousStyle,
            "consistentFormatting": consistentFormatting,
            "containerList": dpr.createContainerList(context, selection),
            "auxRoots": dpr.getAuxRoots(context, selection),
            "editContext": context
        };
    },


    // Plugin-related stuff ----------------------------------------------------------------

    /**
     * <p>Registers a editor-related event handler for a plugin.</P>
     * <p>Currently the following events are supported:</p>
     * <ul>
     *   <li>mousedown</li>
     *   <li>mouseup</li>
     *   <li>beforekeydown (vetoable)</li>
     *   <li>keydown</li>
     *   <li>beforekeyup (vetoable)</li>
     *   <li>keyup</li>
     *   <li>beforecommandexecuted (non-deferred usage only)</li>
     *   <li>commandexecuted (non-deferred usage only)</li>
     * </ul>
     * <p>Note that you can specify a priority for the listener to ensure the order in which
     * listeners are executed. Default priority is 1000.</p>
     * @param {String} eventName Event name (see doc for supported values)
     * @param {Function} fn Event handler function
     * @param {Object} scope Scope for fn
     * @param {CUI.rte.plugins.Plugin} plugin Plugin that registers the event handler
     * @param {Boolean} isDeferred True if the listener should be executed
     *        "deferred"
     * @param {Number} priority (optional) The listener's priority; defaults to 1000
     * @private
     */
    addPluginListener: function(eventName, fn, scope, plugin, isDeferred, priority) {
        if (priority == null) {
            priority = 1000;
        }
        if (!this.internalListeners) {
            this.internalListeners = { };
        }
        if (!this.internalListeners[eventName]) {
            this.internalListeners[eventName] = [ ];
        }
        var listeners = this.internalListeners[eventName];
        var listenerCnt = listeners.length;
        var listenerDef = {
            "fn": scope ? CUI.rte.Utils.scope(fn, scope) : fn,
            "plugin": plugin,
            "deferred": isDeferred,
            "priority": priority
        };
        for (var l = 0; l < listenerCnt; l++) {
            var listenerToCheck = listeners[l];
            if (listenerToCheck.priority > priority) {
                listeners.splice(l, 0, listenerDef);
                return;
            }
        }
        listeners.push(listenerDef);
    },

    /**
     * Unregisters all editor-related event handlers of a specific type for the specified
     * plugin.
     * @param {String} eventName Event name (see {@link #addPluginListener} for supported
     *        values)
     * @param {CUI.rte.plugins.Plugin} plugin Plugin that unregisters its event handlers
     * @private
     */
    removePluginListener: function(eventName, plugin) {
        if (!this.internalListeners || !this.internalListeners[eventName]) {
            return;
        }
        var listeners = this.internalListeners[eventName];
        var listenerCnt = listeners.length;
        for (var l = listenerCnt - 1; l >= 0; l--) {
            if (listeners[l].plugin == plugin) {
                listeners.splice(l, 1);
            }
        }
    },

    /**
     * <p>Fires an editor-related event.</p>
     * <p>Both {@link CUI.rte.EditorEvent}s and "higher level"/custom events can be
     * sent to the registered listeners using this method. To dispatch a custom event,
     * provide a suitable Object as parameter param. Note that the eventName parameter is
     * ignored if a {@link CUI.rte.EditorEvent} is provided as param.</p>
     * @param {String} eventName Event name (see {@link #addPluginListener} for supported
     *        values)
     * @param {Object|CUI.rte.EditorEvent} param Event specific parameter: either an
     *        Object for a custom event, or a CUI.rte.EditorEvent for forwarding
     *        editor events.
     * @param {Boolean} isDeferred True if the Event is fired from a deferred
     *        context (note that the event is always dispatched immediately, but it is
     *        dispatched to different event listeners)
     * @private
     */
    firePluginEvent: function(eventName, param, isDeferred) {
        if (!this.internalListeners || !this.internalListeners[eventName]) {
            return;
        }
        // pass/forward EditorEvents 1:1; create a PluginEvent otherwise - this allows
        // the listeners to manipulate EditorEvents (mainly: cancel the event) directly
        // and the callee to react on it appropriately
        var event;
        if (param instanceof CUI.rte.EditorEvent) {
            event = param;
        } else {
            event = new CUI.rte.plugins.PluginEvent(eventName, this.getEditContext(),
                    param);
        }
        var listenerCnt = this.internalListeners[eventName].length;
        for (var l = 0; l < listenerCnt; l++) {
            var listenerDef = this.internalListeners[eventName][l];
            if (listenerDef && listenerDef.fn) {
                if (listenerDef.deferred == isDeferred) {
                    listenerDef.fn(event);
                }
            }
        }
        return event;
    },

    /**
     * <p>Executes a content interception.</p>
     * <p>"Content interceptions" are used for providing plugin-specific content or
     * processing content in a plugin-specific way. For example, the table plugin may
     * intercept the "empty content" situation and provide a different empty content
     * markup than the default in table edit mode. Also, it may intercept the HTML
     * creation on submit and change the transmitted HTML (for example) to an empty string
     * if actually an empty table would be submitted in table edit mode.</p>
     * @param {String} contentType Content type to intercept
     * @param {Object} defs Definitions of the content interception; format depends on the
     *        content type
     */
    execContentInterception: function(contentType, defs) {
        for (var pluginId in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(pluginId)) {
                var plugin = this.registeredPlugins[pluginId];
                var interceptedContent = plugin.interceptContent(contentType, defs);
                if (interceptedContent != null) {
                    return interceptedContent;
                }
            }
        }
        return null;
    },


    // UI-related stuff --------------------------------------------------------------------

    /**
     * <p>Registers a UI-related event handler.</P>
     * <p>Currently the following events are supported:</p>
     * <ul>
     *   <li>updatestate - signals a selection state change</li>
     *   <li>preventdrop - signals that drag & drop on the text component should be
     *     temporarily disabled</li>
     *   <li>reactivatedrop - signals that drag & drop on the text component should be
     *     reactivated</li>
     *   <li>enablesourceedit - signals that source edit mode is requested</li>
     *   <li>disablesourceedit - signals that WYSIWYG edit mode is requested</li>
     *   <li>dialogshow - signals that a dependent dialog has been shown</li>
     *   <li>dialoghide - signals that a dependent dialog has been hidden</li>
     * </ul>
     * @param {String} eventName Event name (see doc for supported values)
     * @param {Function} fn Event handler function
     * @param {Object} scope Scope for fn
     * @private
     */
    addUIListener: function(eventName, fn, scope) {
        if (!this.uiListeners) {
            this.uiListeners = { };
        }
        if (!this.uiListeners[eventName]) {
            this.uiListeners[eventName] = [ ];
        }
        this.uiListeners[eventName].push({
            "fn": scope ? CUI.rte.Utils.scope(fn, scope) : fn,
            "idFn": fn,
            "idScope": scope
        });
    },

    /**
     * Unregisters all or a single UI-related event handler(s) of a specific type.
     * @param {String} eventName Event name (see {@link #addUIListener} for supported
     *        values)
     * @param {Function} fn (optional) The listener to remove; if unspecified, all handlers
     *        will be removed
     * @param {Object} scope (optional) The scope of the listener to be removed
     * @private
     */
    removeUIListener: function(eventName, fn, scope) {
        if (!this.uiListeners || !this.uiListeners[eventName]) {
            return;
        }
        if (fn) {
            var listeners = this.uiListeners[eventName];
            for (var l = listeners.length - 1; l >= 0; l--) {
                var toCheck = listeners[l];
                if ((toCheck.idFn === fn) && (toCheck.idScope === scope)) {
                    listeners.splice(l, 1);
                }
            }
        } else {
            delete this.uiListeners[eventName];
        }
    },

    /**
     * Fires a UI-related event.
     * @param {String} eventName Event name (see {@link #addUIListener} for supported
     *        values)
     * @param {Object} param (optional) Event specific parameter
     * @private
     */
    fireUIEvent: function(eventName, param) {
        if (!this.uiListeners || !this.uiListeners[eventName]) {
            return;
        }
        var event = new CUI.rte.ui.UIEvent(eventName, this.getEditContext(), param);
        var listenerCnt = this.uiListeners[eventName].length;
        for (var l = 0; l < listenerCnt; l++) {
            var listenerDef = this.uiListeners[eventName][l];
            if (listenerDef && listenerDef.fn) {
                listenerDef.fn(event);
            }
        }
        return event;
    },


    // Toolbar integration -----------------------------------------------------------------

    /**
     * @private
     */
    getToolbarHeight: function() {
        return this.toolbar.getHeight();
    },

    /**
     * Gets a toolbar item that is located in any of the editor's toolbars.
     * @param {Number} itemId item id of the toolbar item to determine
     * @private
     */
    getToolbarItem: function(itemId) {
        return this.toolbar.getItem(itemId);
    },

    /**
     * Creates the toolbar.
     * @param {Object} options (optional) kernel-specific options
     */
    createToolbar: function(options) {
        options = options || { };
        options.editorKernel = this;
        var tbBuilder = this.createToolbarBuilder();
        for (var pluginId in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(pluginId)) {
                var plugin = this.registeredPlugins[pluginId];
                plugin.initializeUI(tbBuilder);
            }
        }
        this.toolbar = tbBuilder.createToolbar(options);
    },

    /**
     * Create a kernel-specific instance of {@link CUI.rte.ui.ToolbarBuilder}.
     * @return {CUI.rte.ui.ToolbarBuilder} The kernel-specific toolbar builde instance
     *         to be used
     */
    createToolbarBuilder: function() {
        // must be overridden by implementing classes
        return null;
    },

    /**
     * Updates the toolbar to the current editor state.
     * @private
     * @hide
     */
    updateToolbar: function() {
        if (!this.isEnabled) {
            return;
        }
        var selectionDef = this.analyzeSelection();
        if (!selectionDef) {
            return;
        }
        for (var pluginId in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(pluginId)) {
                var plugin = this.registeredPlugins[pluginId];
                plugin.updateState(selectionDef);
            }
        }
        if (!this.contextMenu || !this.contextMenuBuilder.isVisible()) {
            this.contextMenuBuilder.hideAll();
        }
    },

    adjustToolbarToWidth: function(width) {
        this.toolbar.adjustToWidth(width);
    },

    enableToolbar: function() {
        this.toolbar.enable();
    },

    disableToolbar: function(excludeItems) {
        this.toolbar.disable(excludeItems);
    },

    destroyToolbar: function() {
        if (this.toolbar) {
            this.toolbar.finishEditing();
            this.toolbar.destroy();
        }
    },


    // Context menu implementation ---------------------------------------------------------

    /**
     * Handles a context menu event by building and showing the context menu.
     * @param {Event} event The HTML event that triggered the context menu
     * @return {Boolean} True if the context menu has been shown
     * @private
     */
    handleContextMenu: function(event) {
        var dpr = CUI.rte.DomProcessor;
        this.contextMenuBuilder.clear();
        var context = this.getEditContext();
        var selection = this.createQualifiedSelection(context);
        if (!selection) {
            return false;
        }
        var nodeList = dpr.createNodeList(context, selection);
        var selectionDef = {
            "selection": selection,
            "nodeList": nodeList
        };
        for (var id in this.registeredPlugins) {
            if (this.registeredPlugins.hasOwnProperty(id)) {
                this.registeredPlugins[id].handleContextMenu(this.contextMenuBuilder,
                        selectionDef, context);
            }
        }
        this.contextMenu = this.contextMenuBuilder.build(selectionDef, context);
        if (this.contextMenu) {
            this.contextMenuSavedRange = this.createQualifiedRangeBookmark(context);
            var cmPos = this.calculateContextMenuPosition(event);
            this.contextMenuBuilder.showAt(cmPos[0], cmPos[1]);
            return true;
        }
        return false;
    }


});

/**
 * The default UI toolkit to be used
 * @type String
 */
CUI.rte.EditorKernel.DEFAULT_TOOLKIT = "ext";