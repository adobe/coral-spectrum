(function($) {
  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    toString: 'Modal',
    
    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A dialog that prevents interaction with page elements while displayed. Modal will use existing markup if it is present, or create markup if <code>options.element</code> has no children.
      
      <h2 class="line">Example</h2>
      <a href="#myModal" class="button" data-toggle="modal">Show Modal</a>
      <div id="myModal" class="modal">
        <div class="modal-header">
          <h2>A Sample Modal</h2>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Some sample content.</p>
        </div>
        <div class="modal-footer">
          <button data-dismiss="modal">Ok</button>
        </div>
      </div>
      
      @example
<caption>Instantiate with Class</caption>
var modal = new CUI.Modal({
  element: '#myModal',
  heading: 'My Modal',
  content: '&lt;p&gt;Content here.&lt;/p&gt;',
  buttons: [
    {
      label: 'Save',
      className: 'primary',
      click: function(evt) {
        console.log('Modal: This would usually trigger a save...');
        this.hide(); // could also use evt.dialog.hide();
      }
    }
  ]
});

// Hide the modal, change the heading, then show it again
modal.hide().set({ heading: 'My Modal Again'}).show();

// jQuery style works as well
$('#myModal').modal('hide');

      @example
<caption>Instantiate with jQuery</caption>
$('#myModal').modal({
  heading: 'My Modal',
  content: '&lt;p&gt;Content here.&lt;/p&gt;',
  buttons: [
    {
      label: 'Close',
      click: 'hide', // Specifying 'hide' causes the dialog to close when clicked
    }
  ]
});

// Hide the modal, change the heading, then show it again
$('#myModal').modal('hide').modal({ heading: 'My Modal Again'}).modal('show');

// A reference to the element's modal instance is stored as data-modal
var modal = $('#myModal').data('modal');
modal.hide();


      @example 
<caption>Data API: Instantiate and show modal</caption>
<description>When using a <code class="prettify">&lt;button&gt;</code>, specify the jQuery selector for the element using <code>data-target</code>. Markup should exist already if no options are specified.</description>
&lt;button data-target=&quot;#myModal&quot; data-toggle=&quot;modal&quot;&gt;Show Modal&lt;/button&gt;

      @example
<caption>Data API: Instantiate, set options, and show</caption>
<description>When using an <code class="prettify">&lt;a&gt;</code>, specify the jQuery selector for the element using <code>href</code>. Markup is optional since options are specified as data attributes.</description>
&lt;a 
  href=&quot;#modal&quot;
  data-toggle=&quot;modal&quot;
  data-heading=&quot;Test Modal&quot;
  data-content=&quot;&amp;lt;p&amp;gt;Test content&amp;lt;/p&amp;gt;&quot;
  data-buttons=&#x27;[{ &quot;label&quot;: &quot;Close&quot;, &quot;click&quot;: &quot;close&quot; }]&#x27;
&gt;Show Modal&lt;/a&gt;

      @example
<caption>Data API: Instantiate, load content asynchronously, and show</caption>
<description>When loading content asynchronously, regardless of what tag is used, specify the jQuery selector for the element using <code>data-target</code> and the URL of the content to load with <code>href</code>.</description>
&lt;button
  data-target="#myModal"
  data-toggle=&quot;modal&quot;
  href=&quot;content.html&quot;
&gt;Show Modal&lt;/button&gt;

      @example
<caption>Markup</caption>
&lt;div id=&quot;myModal&quot; class=&quot;modal&quot;&gt;
  &lt;div class=&quot;modal-header&quot;&gt;
    &lt;h2&gt;Heading&lt;/h2&gt;
    &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
  &lt;/div&gt;
  &lt;div class=&quot;modal-body&quot;&gt;
    Content
  &lt;/div&gt;
  &lt;div class=&quot;modal-footer&quot;&gt;
    &lt;button data-dismiss=&quot;modal&quot;&gt;Close&lt;/button&gt;
  &lt;/div&gt;
&lt;/div&gt;
      
      @example
<caption>Markup with &lt;form&gt; tag</caption>
<description>Modals can be created from the <code class="prettify">&lt;form&gt;</code> tag as well. Make sure to set <code class="prettify">type="button"</code> on buttons that should not perform a submit.</description>
&lt;form id=&quot;myModal&quot; class=&quot;modal&quot; action="/users" method="post"&gt;
  &lt;div class=&quot;modal-header&quot;&gt;
    &lt;h2&gt;Create User&lt;/h2&gt;
    &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
  &lt;/div&gt;
  &lt;div class=&quot;modal-body&quot;&gt;
    &lt;label for=&quot;name&quot;&gt;Name&lt;/label&gt;&lt;input id=&quot;name&quot; name=&quot;name&quot; type=&quot;text&quot;&gt;
  &lt;/div&gt;
  &lt;div class=&quot;modal-footer&quot;&gt;
    &lt;button type="button" data-dismiss=&quot;modal&quot;&gt;Cancel&lt;/button&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
  &lt;/div&gt;
&lt;/form&gt;


      @desc Creates a new modal dialog     
      @constructs
      
      @param {Object} options             Component options
      @param {Mixed} options.element     jQuery selector or DOM element to use for dialog
      @param {String} options.heading     Title of the modal dialog (HTML)
      @param {String} options.content     Content of the dialog (HTML)
      @param {String} options.type        Type of dialog to display. One of default, error, notice, success, help, or info
      @param {Array} [options.buttons]      Array of button descriptors
      @param {String} [options.remote]      URL to asynchronously load content from the first time the modal is shown
      @param {Boolean} [options.keyboard=true]  True to hide modal when escape key is pressed
      @param {Mixed} [options.backdrop=static]     False to not display transparent underlay, True to display and close when clicked, 'static' to display and not close when clicked
      @param {Mixed} [options.visible=true]     True to display immediately, False to defer display until show() called
     */
    construct: function(options) {
      // Catch clicks to dismiss modal
      this.$element.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', this.hide);
      
      // Fetch content asynchronously
      if (this.options.remote) {
        // Todo: show spinner
        this.$element.find('.modal-body').load(this.options.remote);
      }
      
      // Add modal class to give styling
      this.$element.addClass('modal');
      
      // Make focusable
      this.$element.attr('tabIndex', -1);
      
      // Accessibility
      this.$element.attr('role', 'dialog'); // needed?
      this.$element.attr('aria-hidden', true);
      
      // Listen to changes to configuration
      this.$element.on('change:buttons', this._setButtons.bind(this));
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      
      // Render template, if necessary
      if (this.$element.children().length === 0) {
        this.$element.html(CUI.Templates['modal']($.extend({}, this.options, { buttons: '' })));
        // Only set buttons, heading/content are applied when template is rendered
        this.applyOptions(true);
      }
      else {
        this.applyOptions();
      }
    },
    
    // Todo: fetch content method?
    
    defaults: {
      backdrop: 'static',
      keyboard: true,
      visible: true,
      type: 'default'
    },
    
    _validTypes: [
      'default',
      'error',
      'notice',
      'success',
      'help',
      'info'
    ],
    
    applyOptions: function(partial) {
      // Set all options
      if (!partial) {
        this._setContent();
        this._setHeading();
      }
      this._setButtons();
      this._setType();
    },
    
    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._validTypes.indexOf(this.options.type) === -1) return;
      
      // Remove old type
      this.$element.removeClass(this._validTypes.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);
      
      // Re-center when heading, adds some left padding
      this.center();
    },
    
    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;
      
      this.$element.find('.modal-body').html(this.options.content);
      
      // Re-center when content changes
      this.center();
    },
    
    /** @ignore */
    _setHeading: function() {
      if (typeof this.options.heading !== 'string') return;

      this.$element.find('.modal-header h2').html(this.options.heading);
      
      // Re-center when content changes
      this.center();
    },
    
    /** @ignore */
    _show: function() {
      $('body').addClass('modal-open');
      
      this._toggleBackdrop(true);
      this._setEscapeHandler(true);
      
      // Add to body if this element isn't in the DOM already
      if (!this.$element.parent().length) {
        this.$element.appendTo(document.body);
      }

      // Get width/height right
      this.$element.css('visibility', 'hidden').css('left', '0').show();
      this.center();
      this.$element.css('visibility', 'visible').css('left', '50%').hide();
      
      this.$element.addClass('in').attr('aria-hidden', false).fadeIn().focus();
    },
      
    /** @ignore */
    _hide: function() {
      $('body').removeClass('modal-open');

      this.$element.removeClass('in').attr('aria-hidden', true);
      
      this.$element.fadeOut().trigger('hidden');

      this._toggleBackdrop(false);
      this._setEscapeHandler(false);
        
      return this;
    },
    
      
    /** @ignore */
    _setEscapeHandler: function(show) {
      if (show && this.options.keyboard) {
        $('body').on('keyup', function (e) {
          if (e.which === 27)
            this.hide();
        }.bind(this));
      }
      else if (!show) {
        this.$element.off('keyup');
      }
    },
    
    /** @ignore */
    _removeBackdrop: function() {
        if (this.$backdrop && !this.get('visible')) {
          // Remove from the DOM
          this.$backdrop.remove();
          this.$backdrop = null;
        }
    },
    
    /** @ignore */
    _toggleBackdrop: function(show) {
      if (show && this.options.backdrop) {
        if (this.$backdrop)
          this.$backdrop.fadeIn();
        else {
          this.$backdrop = $('<div class="modal-backdrop" style="display: none;" />').appendTo(document.body).fadeIn();
          
          // Note: If this option is changed before the fade completes, it won't apply
          if (this.options.backdrop !== 'static') {
            this.$backdrop.click(this.hide);
          }
        }
      }
      else if (!show && this.$backdrop) {
        this.$backdrop.fadeOut(function() {
          this._removeBackdrop();
        }.bind(this));
      }
    },
      
    /**
      Center the modal in the screen
      
      @returns {CUI.Modal} this, chainable
     */
    center: function() {
      var width = this.$element.outerWidth();
      var height = this.$element.outerHeight();
      
      this.$element.css('marginLeft', -width/2);
      this.$element.css('marginTop', -height/2);
      
      return this;
    },
      
    /** @ignore */
    _setButtons: function() {
      if (!$.isArray(this.options.buttons))  return;
      
      var $footer = this.$element.find('.modal-footer');
      
      // Remove existing children
      $footer.children().remove();
      
      $.each(this.options.buttons, function(index, button) {
        // Create an anchor if href is provided
        var el = $(button.href ? '<a class="button" />' : '<button type="button" />');

        // Add label
        el.html(button.label);
        
        if (button.click) {
          if (button.click === 'hide')
            el.attr('data-dismiss', 'modal');
          else if (typeof button.click === 'function')
            el.on('click', button.click.bind(this, { dialog: this }));
        }
        
        if (button.href)
          el.attr('href', button.href);
        
        if (button.className)
          el.addClass(button.className);
        
        $footer.append(el);
      }.bind(this));
    }
  });

  CUI.util.plugClass(CUI.Modal);

  // Data API
  $(function() {
    $('body').on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
      var $trigger = $(this);
      
      // Get the target from data attributes
      var $target = CUI.util.getDataTarget($trigger);

      // Pass configuration based on data attributes in the triggering link
      var href = $trigger.attr('href');
      var options = $.extend({ remote: !/#/.test(href) && href }, $target.data(), $trigger.data());

      // Parse buttons
      if (typeof options.buttons === 'string') {
        options.buttons = JSON.parse(options.buttons);
      }
      
      // If a modal already exists, show it
      var instance = $target.data('modal');
      var show = true;
      if (instance && instance.get('visible'))
        show = false;
      
      // Apply the options from the data attributes of the trigger
      // When the dialog is closed, focus on the button that triggered its display
      $target.modal(options).one('hide', function() {
          $trigger.focus();
      });
      
      // Perform visibility toggle if we're not creating a new instance
      if (instance)
        $target.data('modal').set({ visible: show });
        
      // Stop links from navigating
      e.preventDefault();
    });
  });
}(window.jQuery));
