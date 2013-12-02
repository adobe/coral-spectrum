(function ($, window, undefined) {
  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A tabbed panel with several variants.

     * <p>Tabs markup must be initialized with CUI's data-init property.  However, keeping a reference to
     * a tabs instance ($.tabs or new CUI.Tabs) is not needed for basic functionality. This is only
     * needed if programmatic access is necessary.</p>
     *
     * <h2 class="line">Examples</h2>
     *
     * <section class="line">
     * <h3>Default</h3>
     * <div class="tabs" data-init="tabs">
     *     <nav>
     *         <a data-toggle="tab" class="active">Tab 1</a>
     *         <a data-toggle="tab">Tab 2</a>
     *         <a href="../examples/remote.html" data-toggle="tab">Tab 3</a>
     *         <a data-toggle="tab" class="disabled">Disabled Tab</a>
     *     </nav>
     *     <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *     <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *     <section>This will be replaced :)</section>
     *     <section>This section will never be shown :(</section>
     * </div>
     * </section>
     * <section>
     * <h3>White</h3>
     * <p>
     *   Note: the white tabs variant is deprecated, and will be removed in a future release
     *   See issues.adobe.com/browse/CUI-1156 and issues.adobe.com/browse/CUI-1154
     * </p>
     * <div class="tabs white" data-init="tabs">
     *     <nav>
     *         <a data-toggle="tab" class="active">Tab 1</a>
     *         <a data-toggle="tab">Tab 2</a>
     *         <a data-toggle="tab" class="disabled">Disabled Tab</a>
     *     </nav>
     *     <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *     <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *     <section>This section will never be shown :(</section>
     * </div>
     * </section>
     * <section>
     * <h3>Stacked</h3>
     * <div class="tabs stacked" data-init="tabs">
     *     <nav>
     *         <a data-toggle="tab" class="active">Tab 1</a>
     *         <a data-toggle="tab">Tab 2</a>
     *         <a data-toggle="tab" class="disabled">Disabled Tab</a>
     *     </nav>
     *     <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *     <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *     <section>This section will never be shown :(</section>
     * </div>
     * </section>
     * <section>
     * <h3>Nav</h3>
     * <div class="tabs nav" data-init="tabs">
     *     <nav>
     *         <a data-toggle="tab" class="active">Tab 1</a>
     *         <a data-toggle="tab">Tab 2</a>
     *         <a data-toggle="tab" class="disabled">Disabled Tab</a>
     *     </nav>
     *     <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *     <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *     <section>This section will never be shown :(</section>
     * </div>
     * </section>
     * @example
     * <caption>Instantiate with Class</caption>
     * var tabs = new CUI.Tabs({
         *     element: '#myTabs'
         * });
     *
     * // Hide the tabs, set the active tab, and show it again
     * tabs.hide().set({active: 3}).show();
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myTabs').tabs({
         *     type: 'stacked'
         * });
     *
     * // jQuery style works as well for show/hide
     * $('#myTabs').tabs('show');
     *
     * // A reference to the element's tabs instance is stored as data-tabs
     * var tabs = $('#myTabs').data('tabs');
     * tabs.hide();
     *
     * @example
     * <caption>Data API: Instantiate, set options, and show</caption>
     * <description>There is no need to programatically  instantiate a tabs instance to use the tabs
     *  functionality. The data API will handle switching between tabs as long as you have created a
     * <code class="prettify">&lt;div&gt;</code> with the <code class="prettify">tabs</code> class and added
     * the <code class="prettify">data-init='tabs'</code> attribute.
     * When using markup to instantiate tabs, the overall container is
     * <code class="prettify">div class=&quot;tabs&quot</code>. The tabs themselves are specified within the
     * <code>nav</code> block as simple <code class="prettify">a</code> elements. The
     * <code class="prettify">data-toggle=&quot;tab&quot;</code> attribute on <code>a</code> nav links is
     * essential for the data API; do not omit. The <code>href</code> can be a remote link 
     * (see next example). When the tab is activated, content from the remote link will
     * be loaded into the respective panel.</description>
     * &lt;div class=&quot;tabs&quot; data-init=&quot;tabs&quot;&gt;
     *     &lt;nav&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Tab 1&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot;&gt;Tab 2&lt;/a&gt;
     *         &lt;a href=&quot;../examples/remote.html&quot; data-toggle=&quot;tab&quot;&gt;Tab 3&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;disabled&quot;&gt;Disabled Tab&lt;/a&gt;
     *     &lt;/nav&gt;
     *     &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
     *     &lt;section&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra.&lt;/section&gt;
     *     &lt;section&gt;This will be replaced :)&lt;/section&gt;
     *     &lt;section&gt;This section will never be shown :(&lt;/section&gt;
     * &lt;/div&gt;
     *
     * @example
     * <caption>Variants</caption>
     * <p>
     *   Note: the white tabs variant is deprecated, and will be removed in a future release
     *   See issues.adobe.com/browse/CUI-1156 and issues.adobe.com/browse/CUI-1154
     * </p>
     * <description>The possible variants, <code class="prettify">white</code>, <code class="prettify">stacked</code>,
     * and <code class="prettify">nav</code>, are specified either via the <code>type</code> argument to the
     * constructor, or via manually specifying the class alongside <code>tabs</code>.</description>
     * &lt;div class=&quot;tabs nav&quot; data-init=&quot;tabs&quot;&gt;
     *     &lt;nav&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Tab 1&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot;&gt;Tab 2&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;disabled&quot;&gt;Disabled Tab&lt;/a&gt;
     *     &lt;/nav&gt;
     *     &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
     *     &lt;section&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra.&lt;/section&gt;
     *     &lt;section&gt;This section will never be shown :(&lt;/section&gt;
     * &lt;/div&gt;
     *
     * @description Creates a new tab panel
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param  {String} [options.type=""] Type of the tabs. Can be blank, or one of white, stacked, or nav
     * @param  {Number} [options.active=0] index of active tab
     */


    construct: function (options) {
      // find elements for tab widget
      this.tablist = this.$element.find('> nav');

      this._applyOptions();

      // set up listeners for change events
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:active', this._setActive.bind(this));
    },

    defaults: {},

    // Note: the white tabs variant is deprecated, and will be removed in a future release
    // See https://issues.adobe.com/browse/CUI-1156 and https://issues.adobe.com/browse/CUI-1154
    DEFAULT_VARIANT_KEY: 'default',
    WHITE_VARIANT_CLASS: 'white',
    STACKED_VARIANT_CLASS: 'stacked',
    NAV_VARIANT_CLASS: 'nav',

    VARIANT_TYPES: [
      'default',
      'white',
      'stacked',
      'nav'
    ],


    /**
     * Disables a tab
     * @param  {jQuery} tab
     * @return {jQuery} this, chainable
     */
    setDisabled: function (tab, switcher) {
      var hop = switcher || false;

      tab.toggleClass('disabled', hop)
        .prop('aria-disabled', hop);
      return this;
    },

    /**
     * Enables a tab
     * @param  {jQuery} tab
     * @return {jQuery} this, chainable
     */
    setEnabled: function (tab) {
      return this.setDisabled(tab, true);
    },

    /**
     * Adds a tab and associated panel.
     *
     * @param {Object} [options] Tab options.
     * @param {String} [options.tabContent] An HTML string used to
     * generate the tab's content.
     * @param {Object} [options.tabAttrs] Attributes to apply to the created
     * tab.
     * @param {String} [options.panelContent] An HTML string used to
     * generate the panel's content.
     * @param {Object} [options.panelAttrs] Attributes to apply to the
     * created panel.
     * @param {Number} [options.index] The index at which the tab should be
     * added. If no index is provided, the tab will be added as the last
     * tab.
     * @param {Boolean} [options.enabled=true] Whether the tab should be 
     * enabled (disabled tabs cannot be selected).
     * @param {Boolean} [options.active=true] Whether the tab should be
     * immediately activated/selected. In other words, its panel will be 
     * immediately visible and panels for other tabs will be hidden.
     */
    addItem: function(options) {
      var tabs = this._getTabs();
      
      options = $.extend({
        tabContent: '',
        tabAttrs: undefined,
        panelContent: '',
        panelAttrs: undefined,
        index: tabs.length,
        enabled: true,
        active: true
      }, options);
      
      var $panel = $('<section>' + options.panelContent + '</section>',
          options.panelAttrs);

      var $tab = $('<a>' + options.tabContent + '</a>');
      
      $tab.attr($.extend(options.tabAttrs, {
        'data-toggle': 'tab'
      }));
      
      // Confine the index to valid values.
      var index = Math.min(Math.max(options.index, 0), tabs.length);

      if (index === 0) {
        this.tablist.prepend($tab);
        this.tablist.after($panel);
      } else {
        tabs.eq(index - 1).after($tab);
        this._getPanels().eq(index - 1).after($panel);
      }
      
      if (!options.enabled) {
        $tab.addClass('disabled');
      }

      this._makeTabsAccessible($tab);
     
      if (options.active && options.enabled) {
        this._activateTab($tab, true);
      }
      
      return this;
    },

    /**
     * Removes a tab and associated panel. If the tab being removed is
     * the active tab, the nearest enabled tab will be activated.
     * @param {Number} index The index of the tab to remove.
     */
    removeItem: function(index) {
      var $tab = this._getTabs().eq(index),
        $panel = this._getPanels().eq(index);
    
      if (!$tab.length || !$panel.length) {
        return this;
      }

      if ($tab.hasClass('active')) {
        var ENABLED_TAB_SELECTOR = 'a[data-toggle="tab"]:not(.disabled)';
          
        var $tabToActivate = $tab.nextAll(ENABLED_TAB_SELECTOR).first();

        if ($tabToActivate.length === 0) {
          $tabToActivate = $tab.prevAll(ENABLED_TAB_SELECTOR).first();
        }

        if ($tabToActivate.length === 1) {
          this._activateTab($tabToActivate, true);
        }
      }

      $panel.remove();
      $tab.remove();
    
      return this;
    },

    // sets all options
    /** @ignore */
    _applyOptions: function () {
      var activeTab = this._getTabs().filter('.active');

      // ensure the type is set correctly
      if (this.options.type) {
        this._setType(this.options.type);
      }

      // init tab switch
      this._initTabswitch();

      // accessibility
      this._makeAccessible();

      // set an active tab if there is non flagged as active
      if (activeTab.length === 0) {
        this._setActive(this.options.active || 0);
      } else {
        // call the activation logic
        // in case the initial tab has remote content
        this._activateTab(activeTab, true);
      }
    },

    /**
     * @return {jQuery} All tabs.
     * @private
     * @ignore
     */
    _getTabs: function() {
      return this.tablist.find('> a[data-toggle="tab"]');
    },

    /**
     * @return {jQuery} All panels.
     * @private
     * @ignore
     */
    _getPanels: function() {
      return this.$element.find('> section');
    },

    // Set a certain tab (by index) as active
    // * @param  {Number} index of the tab to make active
    /** @ignore */
    _setActive: function (idx) {
      idx = $.isNumeric(idx) ? idx : this.options.active;
      var activeTab = this._getTabs().eq(idx);
      // Activate the tab, but don't focus
      this._activateTab(activeTab, true);
    },

    // sets the type of the tabs
    // @param  {String} type of the tabs: 'default', 'white', 'nav', 'stacked'
    // Note: the white tabs variant is deprecated, and will be removed in a future release
    // See https://issues.adobe.com/browse/CUI-1156 and https://issues.adobe.com/browse/CUI-1154
    /** @ignore */
    _setType: function (type) {
      var classValue = $.type(type) === 'string' ? type : this.options.type;

      if (this.VARIANT_TYPES.indexOf(classValue) > -1 || classValue === this.DEFAULT_VARIANT_KEY) {
        // Remove old type
        this.$element.removeClass(this.VARIANT_TYPES.join(' '));

        // Add new type
        if (classValue !== this.DEFAULT_VARIANT_KEY) {
          this.$element.addClass(classValue);
        }
      }
    },

    // activates the given tab
    /** @ignore */
    _activateTab: function (tab, noFocus) {
      var href = tab.attr('href'),
        activeClass = 'active',
        tabs = this._getTabs(),
        panels = this._getPanels(),
        panel;

      // do not allow to enable disabled tabs
      if (tab.hasClass('disabled')) {
        tab.blur(); // ensure disabled tabs do not receive focus
        return false;
      }

      // get panel based on aria control attribute
      panel = panels.filter('#' + tab.attr('aria-controls'));

      // supposed to be remote url
      if (href && href.charAt(0) !== '#') {
        panel.loadWithSpinner(href);
      }

      tabs.removeClass(activeClass).attr({
        'aria-selected': false,
        'tabindex': -1 // just the active one is able to tabbed
      });
      panels.removeClass(activeClass).attr({
        'aria-hidden': true
      });

      tab.addClass(activeClass).attr({
        'aria-selected': true,
        'tabindex': 0 // just the active one is able to tabbed
      });
      panel.addClass(activeClass).attr({
        'aria-hidden': false
      });

      if (!noFocus) {
        tab.trigger('focus');
      }
    }, // _activateTab

    // add the switching functionality
    /** @ignore */
    _initTabswitch: function () {
      var self = this,
        sel = '> nav > a[data-toggle="tab"]';

      this.$element.fipo('tap', 'click', sel,function (event) {
        var tab = $(event.currentTarget);

        // prevent the default anchor
        event.preventDefault();

        self._activateTab(tab);
      }).finger('click', sel, false);
    }, // _initTabswitch

    // adds some accessibility attributes and features
    // http://www.w3.org/WAI/PF/aria-practices/#tabpanel
    /** @ignore */
    _makeAccessible: function () {
      this._makeTabsAccessible();
      this._makeTablistAccessible();
    }, // _makeAccessible
      
    /**
     * Adds accessibility attributes and features for the tabs.
     * @private
     * @ignore
     */
    _makeTabsAccessible: function($tabs) {
      var $panels = this._getPanels();
      $tabs = $tabs || this._getTabs();

      // set tab props
      $tabs.each(function (i, e) {
        var $tab = $(e),
          $panel = $panels.eq($tab.index()),
          id = $panel.attr('id') || CUI.util.getNextId();
          
        var tabAttrs = {
          'role': 'tab',
          'tabindex': -1,
          'aria-selected': false,
          'aria-controls': id,
          'aria-disabled': $tab.hasClass('disabled')
        };
          
        if (!$tab.attr('href')) {
          // Mainly so the cursor turns the mouse into a hand
          // on hover.
          tabAttrs.href = '#';
        }
          
        $tab.attr(tabAttrs);

        $panel.attr({
          'id': id,
          'role': 'tabpanel',
          'aria-hidden': true
        });
      });
    },

    /**
     * Adds accessibility attributes and features for the tab list.
     * @private
     * @ignore
     */
    _makeTablistAccessible: function() {
      // init the key handling for tabs
      var self = this,
          tabSelector = '> [role="tab"]';

      // the nav around the tabs has a tablist role
      this.tablist.attr('role', 'tablist');

      // keyboard handling
      this.tablist.on('keydown', tabSelector, function (event) {
        // enables keyboard support

        var elem = $(event.currentTarget),
          tabs = $(event.delegateTarget)
            .find(tabSelector)
            .not('[aria-disabled="true"]'), // ignore disabled tabs
          focusElem = elem,
          keymatch = true,
          idx = tabs.index(elem);

        switch (event.which) {
          case 33: //page up
          case 37: //left arrow
          case 38: //up arrow
            focusElem = idx - 1 > -1 ? tabs[idx - 1] : tabs[tabs.length - 1];
            break;
          case 34: //page down
          case 39: //right arrow
          case 40: //down arrow
            focusElem = idx + 1 < tabs.length ? tabs[idx + 1] : tabs[0];
            break;
          case 36: //home
            focusElem = tabs[0];
            break;
          case 35: //end
            focusElem = tabs[tabs.length - 1];
            break;
          default:
            keymatch = false;
            break;
        }

        if (keymatch) { // if a key matched then we set the currently focused element
          event.preventDefault();
          self._activateTab($(focusElem));
        }
      });
    }
  });

  CUI.Widget.registry.register("tabs", CUI.Tabs);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.Tabs.init($('[data-init~=tabs]', event.target));
    });
  }

}(jQuery, this));