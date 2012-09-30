(function($) {
  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',

    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A tabbed panel with several variants. A tabs instance ($.tabs or new CUI.Tabs) is not needed for basic functionality, only if programmatic access is necessary.
      
      <h2 class="line">Examples</h2>

      <h3>Default</h3>
      <div class="tabs">
        <nav>
          <a href="#" data-toggle="tab" class="active">Tab 1</a>
          <a href="#" data-toggle="tab">Tab 2</a>
          <a href="/remote.html" data-target="#" data-toggle="tab">Tab 3</a>
          <a hrf="#" data-toggle="tab" class="disabled">Disabled Tab</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This will be replaced :)</section>
        <section>This section will never be shown :(</section>
      </div>

      <h3>White</h3>
      <div class="tabs white">
        <nav>
          <a href="#" data-toggle="tab" class="active">Tab 1</a>
          <a href="#" data-toggle="tab">Tab 2</a>
          <a hrf="#" data-toggle="tab" class="disabled">Disabled Tab</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This section will never be shown :(</section>
      </div>
  
      <h3>Stacked</h3>
      <div class="tabs stacked">
        <nav>
          <a href="#" data-toggle="tab" class="active">Stacked Tab 1</a>
          <a href="#" data-toggle="tab">Stacked Tab 2</a>
          <a hrf="#" data-toggle="tab" class="disabled">Stacked Disabled Tab</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This section will never be shown :(</section>
      </div>
      
      <h3>Nav</h3>
      <div class="tabs nav">
        <nav>
          <a href="#" data-toggle="tab" class="active">Menu Item One</a>
          <a href="#" data-toggle="tab">Menu Item Two</a>
          <a hrf="#" data-toggle="tab" class="disabled">Disabled Menu Item</a>
        </nav>
        <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
        <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>
        <section>This section will never be shown :(</section>
      </div>
            
      @example
<caption>Instantiate with Class</caption>
var tabs = new CUI.Tabs({
  element: '#myTabs',
  tabs: [
    {
      id: 'first-tab'
      label: 'First Tab',
      content: 'First tab content here!',
      active: true
    },
    {
      id: 'second-tab',
      remote: 'foobar.html',
      label: 'Remote tab'
    }
  ]
});

// Hide the tabs, set the active tab, and show it again
tabs.hide().set({active: 'second-tab'}).show();

// jQuery style works as well
$('#myTabs').tabs('show');

      @example
<caption>Instantiate with jQuery</caption>
$('#myTabs').tabs({
  type: 'stacked'
  tabs: [
    {
      id: 'first-tab'
      label: 'First Tab',
      content: 'First tab content here!',
      disabled: true
    },
    {
      label: 'Second tab'
      content: 'Without an ID, this tab can be addressed by its index (1).',
      active: true
    }
  ]
});

// A reference to the element's tabs instance is stored as data-tabs
var tabs = $('#myTabs').data('tabs');
tabs.hide();

      @example
<caption>Data API: Instantiate, set options, and show</caption>
<description>ou do not need to explicitly instantiate a tabs instance to use the tabs functionality. The data API will handle switching between tabs as long as you have created a <code class="prettify">&lt;div&gt;</code> with the <code class="prettify">tabs</code> class. When using markup to instantiate tabs, the overall container is <code class="prettify">div class=&quot;tabs&quot</code>. The tabs themselves are specified within the <code>nav</code> block as simple <code class="prettify">a</code> elements. The <code class="prettify">data-toggle=&quot;tab&quot;</code> attribute on <code>a</code> nav links is essential for the data API; do not omit. The <code>href</code> can either be an id of a following <code>section</code>, a simple anchor: <code>#</code>, or a remote link (see next example).</description>
&lt;div class=&quot;tabs&quot;&gt;
  &lt;nav&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Tab 1&lt;/a&gt;
    &lt;a href=&quot;#second_tab&quot; data-toggle=&quot;tab&quot;&gt;Tab 2&lt;/a&gt;
  &lt;/nav&gt;
  &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
  &lt;section id=&quot;second_tab&quot;&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. &lt;/section&gt;
&lt;/div&gt;

      @example
<caption>Data API: Instantiate, load content asynchronously, and show</caption>
<description>When loading content asynchronously, specify the jQuery selector for the element using <code>data-target</code> and the URL of the content to load with <code>href</code>.</description>
&lt;div class=&quot;tabs&quot;&gt;
  &lt;nav&gt;
    &lt;a href=&quot;remote.html&quot; data-target=&quot;#tab1&quot; data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Remote Tab 1&lt;/a&gt;
    &lt;a href=&quot;remote_dos.html&quot; data-target=&quot;#tab2&quot; data-toggle=&quot;tab&quot;&gt;Remote Tab 2&lt;/a&gt;
  &lt;/nav&gt;
  &lt;section id=&quot;tab1&quot; class=&quot;active&quot;&gt;&lt;/section&gt;
  &lt;section id=&quot;tab2&quot;&gt;&lt;/section&gt;
&lt;/div&gt;

      @example
<caption>Variants</caption>
<description>The possible variants, <code class="prettify">white</code>, <code class="prettify">stacked</code>, and <code class="prettify">nav</code>, are specified either via the <code>type</code> argument to the constructor, or via manually specifying the class alongside <code>tabs</code>.</description>
&lt;div class=&quot;tabs nav&quot;&gt;
  &lt;nav&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Menu Item One&lt;/a&gt;
    &lt;a href=&quot;#&quot; data-toggle=&quot;tab&quot;&gt;Menu Item Two&lt;/a&gt;
    &lt;a hrf=&quot;#&quot; data-toggle=&quot;tab&quot; class=&quot;disabled&quot;&gt;Disabled Menu Item&lt;/a&gt;
  &lt;/nav&gt;
  &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
  &lt;section&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. &lt;/section&gt;
  &lt;section&gt;This section will never be shown :(&lt;/section&gt;
&lt;/div&gt;


      @desc Creates a new tab panel    
      @constructs
      
      @param {Object} options                       Component options
      @param {Mixed} options.element                jQuery selector or DOM element to use for panel
      @param {String} [options.type=""]             Type of the tabs. Can be blank, or one of white, stacked, or nav
      @param {String or Integer} [options.active=0] ID or index of the active tab. This can also be specified in the tabs array.
      @param {Array} options.tabs                   Array of tab descriptors.
      @param {String} options.tabs.label            Label of the tab
      @param {String} options.tabs.content          Content of the tab
      @param {String} [options.tabs.id]             ID of the tab
      @param {Boolean} [options.tabs.disabled]      Whether the tab should be displayed grey and inactive
      @param {Boolean} [options.tabs.active]        Whether the tab should be the active tab. Only one tab can be active at a time
     */
    construct: function(options) {
      // Add tabs class to give styling
      this.$element.addClass('tabs');
      
      // Accessibility
      this.$element.attr('role', 'tabpanel');

      // sane defaults for the options
      this.options = $.extend({}, {tabs: []}, this.options);

      // ensure the type is set correctly
      this._setType();

      // ensure at least one tab is active to start
      // either from the tab.active being set,
      // or options.active being set to the index/ID of the element
      if (this.options.tabs.length > 0 && (this.options.active === undefined || this.options.active === null)) {
        this.options.tabs.forEach(function(t, idx) {
          if (t.active) {
            this.options.active = idx;
            return false;
          }
        });

        if (typeof this.options.active !== 'number') {
          this.options.active = 0;
          this.options.tabs[0].active = true;
        }
      }

      // render template if tabs are passed in
      if (this.options.tabs.length > 0) {
        this._render();
      }

      // we need to do one final setActive after the UI has rendered
      // this is in case the content is remote, or options.active was specified
      // but the tab itself was not specified as active
      setTimeout(this._setActive.bind(this), 0);

      // set up listeners for change events
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:tabs', this._render.bind(this));
      this.$element.on('change:active', this._setActive.bind(this));
    },
    _types: [
      'white',
      'nav',
      'stacked'
    ],
    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._types.indexOf(this.options.type) === -1) return;
      
      // Remove old type
      this.$element.removeClass(this._types.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);
    },
    /** @ignore */
    _render: function() {
      if (window.toString.call(this.options.tabs) !== '[object Array]') return;

      // render the tabs
      this.$element.html(CUI.Templates['tabs'](this.options));
    },
    /** @ignore */
    _setActive: function() {
      var $trigger;

      if (typeof this.options.active === 'number' && this.options.active < this.options.tabs.length && this.options.active >= 0) {
        $trigger = this.$element.find('nav > a[data-toggle="tab"]:eq('+this.options.active+')');
      } else if (typeof this.options.active === 'string' && this.options.active.length > 0) {
        $trigger = this.$element.find('nav > a[data-toggle="tab"]').find('[data-target="#'+this.options.active+'"], [href="#'+this.options.active+'"]');
      }

      _activateTab($trigger);
    }
  });
  
  // utility function used both in the event handler and the class proper
  // this is to avoid instantiating new classes for every tab instance
  var _activateTab = function($trigger) {
    var $target = CUI.util.getDataTarget($trigger);

    // allow for non-id'd section switching
    if ($target.selector === '#') {
      $target = $trigger.parents('.tabs').first().find('section:eq('+$trigger.index()+')');
    }

    // oops!
    if (!$trigger || !$target) return;

    // test for remote load
    var href = $trigger.attr('href'), remote = !/#/.test(href) && href;

    // load remote, if defined
    $target.loadWithSpinner(remote);

    // and set the css for the active/other tabs
    $trigger.siblings('a[data-toggle="tab"]').removeClass('active');
    $trigger.addClass('active');
    $target.siblings('section').removeClass('active').attr('aria-hidden', true);
    $target.addClass('active').attr('aria-hidden', false);
  };

  // jQuery plugin
  CUI.util.plugClass(CUI.Tabs);

  $(function() {
    // onload handle activating tabs, so remote content is loaded if set to active initially
    // this also handles tab setups that do not have the correct aria fields, &c.
    $('.tabs').each(function() {
      var $element = $(this), $trigger;
      
      // find the first active tab (to trigger a load),
      // or set the first tab to be active
      if (($trigger = $element.find('nav > a.active').first()).length === 0)
        $trigger = $element.find('nav > a').first();

      _activateTab($trigger);
    });

    // Data API
    $('body').on('click.tabs.data-api', '.tabs > nav > a[data-toggle="tab"]:not(".disabled")', function (e) {
      // Stop links from navigating
      e.preventDefault();

      // and show/hide the relevant tabs
      _activateTab($(this));
    });
  });
}(window.jQuery));
