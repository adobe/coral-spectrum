(function($) {

    var configs = { };

    CUI.RichText = new Class(/** @lends CUI.RichText# */ {

        toString:'RichText',

        extend:CUI.Widget,

        editorKernel: null,

        savedSpellcheckAttrib: null,

        savedOutlineStyle: null,

        isActive: false,

        /**
         * Flag to ignore the next "out of area" click event
         * @private
         * @type Boolean
         */
        ignoreNextClick: false,


        construct: function(options) {
            this.options = options || { };
            if (this.options.hasOwnProperty("$ui")) {
                this.$element.data("rte-ui", this.options.$ui);
            }
        },

        // Helpers -------------------------------------------------------------------------

        _hidePopover: function() {
            if (this.editorKernel.toolbar) {
                var tb = this.editorKernel.toolbar;
                if (tb.popover) {
                    return tb.popover.hide();
                }
            }
            return false;
        },

        _finishRequested: function() {
            this.finish(false);
        },

        _handleToolbarOnSelectionChange: function() {
            var com = CUI.rte.Common;
            var editContext = this.editorKernel.getEditContext();
            var $doc = $(editContext.doc);
            var self = this;
            if (com.ua.isTouch) {
                // On touch devices (Safari Mobile), no touch events are dispatched while
                // the user defines a selection. As a workaround, we listen to
                // selectionchange events instead (which at least indicate changes in the
                // selection, but not when the selection process starts or ends). To
                // determine the end of the selection process, a timed "best guess" approach
                // is used - currently, the selection is declared "final" if it does not
                // change for a second. This works well even if the user changes the
                // selection after the 1sec interval - simply another cycle of
                // hiding/showing the toolbar gets started in that case.
                var _lastSel;
                $doc.on("selectionchange.rte-toolbarhide", function(e) {
                    if (self.editorKernel.isLocked() || !self.isActive) {
                        _lastSel = undefined;
                        return;
                    }
                    var context = self.editorKernel.getEditContext();
                    // using native selection instead of selection abstraction here, as
                    // it is faster and we are in a controlled environment (Webkit mobile)
                    // here
                    var slct = context.win.getSelection();
                    // check if selection is valid - if not, reuse last known selection or
                    // set caret to the start of the text
                    if (!com.isAncestor(context, context.root, slct.focusNode) ||
                            !com.isAncestor(context, context.root, slct.anchorNode)) {
                        slct.removeAllRanges();
                        var range = context.doc.createRange();
                        if (_lastSel) {
                            range.setStart(_lastSel.ande, _lastSel.aoffs);
                            range.setEnd(_lastSel.fnde, _lastSel.foffs);
                        } else {
                            range.selectNodeContents(context.root);
                            range.collapse(true);
                        }
                        slct.addRange(range);
                    }
                    if (!slct.isCollapsed) {
                        var locks = context.getState("CUI.SelectionLock");
                        if (locks === undefined) {
                            var isSameSelection = false;
                            if (_lastSel) {
                                isSameSelection =
                                        (_lastSel.ande === slct.anchorNode) &&
                                        (_lastSel.aoffs === slct.anchorOffset) &&
                                        (_lastSel.fnde === slct.focusNode) &&
                                        (_lastSel.foffs === slct.focusOffset);
                            }
                            if (!isSameSelection) {
                                self.editorKernel.toolbar.hideTemporarily();
                            }
                        } else {
                            locks--;
                            if (locks > 0) {
                                context.setState("CUI.SelectionLock", locks);
                            } else {
                                context.setState("CUI.SelectionLock");
                            }
                        }
                    }
                    _lastSel = {
                        ande: slct.anchorNode,
                        aoffs: slct.anchorOffset,
                        fnde: slct.focusNode,
                        foffs: slct.focusOffset
                    };
                });
            } else {
                var _isClick = false;
                var _isToolbarHidden = false;
                this.$textContainer.pointer("mousedown.rte-toolbarhide", function(e) {
                    _isClick = true;
                });
                this.$textContainer.pointer("mousemove.rte-toolbarhide", function(e) {
                    if (_isClick && !_isToolbarHidden && !self.editorKernel.isLocked()) {
                        self.editorKernel.toolbar.hide();
                        _isToolbarHidden = true;
                    }
                });
                this.$textContainer.pointer("mouseup.rte-toolbarhide", function(e) {
                    if (_isToolbarHidden) {
                        self.editorKernel.toolbar.show();
                        _isToolbarHidden = false;
                    }
                    _isClick = false;
                });
            }
        },

        getTextDiv: function(parentEl) {
            return parentEl;
        },

        isEmptyText: function() {
            return false;
            /*
            var spanDom = CQ.Ext.DomQuery.selectNode("span:first", this.textContainer);
            if (!spanDom) {
                return false;
            }
            var spanEl = CQ.Ext.get(spanDom);
            return spanEl.hasClass(CQ.themes.TextEditor.EMPTY_COMPONENT_CLASS);
            */
        },

        prepareForNewText: function() {
            /*
            CQ.form.rte.Common.removeAllChildren(this.textContainer);
            */
        },

        handleKeyUp: function(e) {
            if (!this.editorKernel.isLocked()) {
                this._hidePopover();
            }
            if (e.getCharCode() === 27) {
                this.finish(true);
            }
        },

        initializeEditorKernel: function(initialContent) {
            var com = CUI.rte.Common;
            this.editorKernel.addUIListener("updatestate", this.updateState, this);
            var doc = this.textContainer.ownerDocument;
            var win = com.getWindowForDocument(doc);
            this.editorKernel.initializeEditContext(win, doc, this.textContainer);
            this.editorKernel.initializeEventHandling();
            this.editorKernel.setUnprocessedHtml(initialContent || "");
            this.editorKernel.initializeCaret(true);
            this.editorKernel.execCmd("initializeundo");
            this.editorKernel.addUIListener("requestClose", this._finishRequested, this);
            if (CUI.rte.Common.ua.isTouch) {
                // show the toolbar with a slight delay on touch devices; this looks a lot
                // smoother, as the device is most likely to scroll in the first
                // bunch of milliseconds anyway
                this.editorKernel.toolbar.hideTemporarily();
            }
        },

        initializeEventHandling: function() {
            var com = CUI.rte.Common;
            var sel = CUI.rte.Selection;
            var self = this;
            var editContext = this.editorKernel.getEditContext();
            var body = editContext.doc.body;
            var $body = $(body);
            var $uiBody = $(document.body);
            // temporary focus handling - we need to retransfer focus immediately
            // to the text container (at least in iOS 6) to prevent the keyboard from
            // disappearing and losing the focus altogether
            $body.on("focus.rte", ".rte-toolbar-item", function(e) {
                self.$textContainer.focus();
                e.stopPropagation();
                e.preventDefault();
            });
            this.$textContainer.finger("blur.rte", function(e) {
                if (!self.editorKernel.isLocked()) {
                    // get back in a few milliseconds and see if it was a temporary focus
                    // change (if a toolbar button was invoked) and finish otherwise -
                    // this is the case on mobile devices if the on-screen keyboard gets
                    // hidden
                    CUI.rte.Utils.defer(function() {
                        if (!self.isTemporaryFocusChange && self.isActive
                                && !self.editorKernel.isLocked()) {
                            self.finish(false);
                        }
                        self.isTemporaryFocusChange = false;
                    }, 10);
                } else {
                    self.isTemporaryFocusChange = false;
                }
            });
            // Prevent changing the selection on touch devices when the editor is locked
            // (and the user is editing a dialog) - the "mask" implementation used on
            // desktop does not work as expected; SafariMobile does interesting things with
            // the mask switched on (for example, masks the dialog and allows editing
            // - despite the mask has a much higher z-index - instead of vice versa).
            this.$textContainer.finger("touchstart.rte", function(e) {
                if (self.editorKernel.isLocked()) {
                    CUI.rte.UIUtils.killEvent(e);
                }
            });
            // additional keyboard handling
            CUI.rte.Eventing.on(editContext, body, "keyup", this.handleKeyUp, this);
            // handle clicks/taps (clicks on the editable div vs. common/"out of area"
            // clicks vs. clicks on toolbar items)
            this.$textContainer.fipo("tap.rte", "click.rte", function(e) {
                if (!self.editorKernel.isLocked()) {
                    self._hidePopover();
                }
                e.stopPropagation();
            });
            var bookmark;
            $body.fipo("touchstart.rte-ooa", "mousedown.rte-ooa", function(e) {
                // we need to save the bookmark as soon as possible, as it gets lost
                // somewhere in the event handling between the initial touchstart/mousedown
                // event and the tap/click event where we actually might need it
                var context = self.editorKernel.getEditContext();
                bookmark = sel.createRangeBookmark(context);
            });
            $body.fipo("tap.rte-ooa", "click.rte-ooa", function(e) {
                // there are cases where "out of area clicks" must be ignored - for example,
                // on touch devices, the initial tap is followed by a click event that
                // would stop editing immediately; so the ignoreNextClick flag may be
                // used to handle those cases
                if (self.ignoreNextClick) {
                    self.ignoreNextClick = false;
                    return;
                }
                // also ignore if editing is currently locked
                if (self.editorKernel.isLocked()) {
                    return;
                }
                // TODO find a cleaner solution ...
                if (self._hidePopover()) {
                    var context = self.editorKernel.getEditContext();
                    self.editorKernel.focus(context);
                    // restore the bookmark that was saved on the initial
                    // touchstart/mousedown event
                    if (bookmark) {
                        sel.selectRangeBookmark(context, bookmark);
                        bookmark = undefined;
                    }
                    self.isTemporaryFocusChange = true;
                    CUI.rte.UIUtils.killEvent(e);
                } else if (self.isActive) {
                    self.finish(false);
                    self.$textContainer.blur();
                }
            });
            $body.finger("tap.rte-ooa", CUI.rte.UIUtils.killEvent);
            // prevent losing focus for toolbar items
            $uiBody.fipo("tap.rte-item", "click.rte-item", ".rte-toolbar .item",
                    function(e) {
                        self.isTemporaryFocusChange = true;
                        CUI.rte.UIUtils.killEvent(e);
                    });
            // prevent losing focus for popovers
            $uiBody.fipo("tap.rte-item", "click.rte-item", ".rte-popover .item",
                    function(e) {
                        self.isTemporaryFocusChange = true;
                        CUI.rte.UIUtils.killEvent(e);
                    });
            // hide toolbar/popover while a selection is created
            this._handleToolbarOnSelectionChange();
        },

        deactivateEditorKernel: function() {
            if (this.editorKernel != null) {
                this.editorKernel.removeUIListener("requestClose");
                this.editorKernel.removeUIListener("updatestate");
                this.editorKernel.suspendEventHandling();
                this.editorKernel.destroyToolbar();
            }
        },

        finalizeEventHandling: function() {
            if (this.editorKernel != null) {
                var context = this.editorKernel.getEditContext();
                var body = context.doc.body;
                var $body = $(body);
                var $uiBody = $(document.body);
                var $doc = $(context.doc);
                CUI.rte.Eventing.un(body, "keyup", this.handleKeyUp, this);
                // Widget
                this.$textContainer.off("blur.rte touchstart.rte tap.rte click.rte");
                $body.off("focus.rte tap.rte-ooa click.rte-ooa");
                $body.off("touchstart.rte-ooa mousedown.rte-ooa");
                // Toolbar
                $uiBody.off("tap.rte-item click.rte-item");
                this.$textContainer.off("mousemove.rte-toolbarhide");
                this.$textContainer.off(
                        "mouseup.rte-toolbarhide mousedown.rte-toolbarhide");
                $doc.off("selectionchange.rte-toolbarhide");
            }
        },

        updateState: function() {
            this.editorKernel.updateToolbar();
        },


        // Interface -----------------------------------------------------------------------

        start: function(config) {
            if (this.editorKernel === null) {
                this.editorKernel = new CUI.rte.DivKernel(config,
                        function(plugin, feature) {
                            if (plugin === "control") {
                                return (feature === "close");
                            }
                            return undefined;
                        });
            }
            var ua = CUI.rte.Common.ua;
            this.ignoreNextClick = ua.isTouch;
            this.$textContainer = this.getTextDiv(this.$element);
            this.$textContainer.addClass("edited");
            this.textContainer = this.$textContainer[0];
            this.editorKernel.createToolbar({
                "$editable": this.$element,
                "uiSettings": (config ? config.uiSettings : undefined)
            });
            /*
            this.currentSize = this.textContainer.getSize();
            var pos = el.getXY();
            this.currentPosition = {
                "x": pos[0],
                "y": pos[1]
            };
            */
            // if the component includes the "empty text placeholder", the placeholder
            // has to be removed and prepared for richtext editing
            this.isEmptyContent = this.isEmptyText();
            if (this.isEmptyContent) {
                this.prepareForNewText();
            }
            var initialContent = this.options.initialContent;
            if (initialContent === undefined) {
                initialContent = this.$textContainer.html();
            }
            this.$textContainer[0].contentEditable = "true";
            if (ua.isGecko || ua.isWebKit) {
                this.savedOutlineStyle = this.textContainer.style.outlineStyle;
                this.textContainer.style.outlineStyle = "none";
            }
            this.initializeEditorKernel(initialContent);
            var context = this.editorKernel.getEditContext();
            var body = context.doc.body;
            this.savedSpellcheckAttrib = body.spellcheck;
            body.spellcheck = false;
            this.initializeEventHandling();
            this.isActive = true;
            this.$element.trigger("editing-start");
        },

        finish: function(isCancelled) {
            var context = this.editorKernel.getEditContext();
            var body = context.doc.body;
            var editedContent = this.editorKernel.getProcessedHtml();
            this.finalizeEventHandling();
            this.deactivateEditorKernel();
            this.$textContainer.removeClass("edited");
            this.textContainer.blur();
            this.textContainer.contentEditable = "inherit";
            body.spellcheck = this.savedSpellcheckAttrib;
            var ua = CUI.rte.Common.ua;
            if ((ua.isGecko || ua.isWebKit) && this.savedOutlineStyle) {
                this.textContainer.style.outlineStyle = this.savedOutlineStyle;
            }
            this.isActive = false;
            this.$element.trigger(isCancelled ? "editing-cancelled" : "editing-finished",
                    [ editedContent ]);
            return editedContent;
        }

    });

    // Register ...
    CUI.util.plugClass(CUI.RichText, "richEdit", function(rte) {
        CUI.rte.ConfigUtils.loadConfigAndStartEditing(rte, $(this));
    });

    // Data API
    if (CUI.options.dataAPI) {
        $(function () {
            $('body').fipo('tap.rte.data-api', 'click.rte.data-api', '.editable',
                    function (e) {
                        var $this = $(this);
                        if (!$this.hasClass("edited")) {
                            $this.richEdit();
                            e.preventDefault();
                        }
                    });
        });
    }

}(window.jQuery));
