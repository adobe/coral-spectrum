var wizard = null; // TODO for DEV purpose
(function($) {
  CUI.Wizard = new Class(/** @lends CUI.Wizard# */{
    toString: 'Wizard',

    extend: CUI.Widget,
    /**
     * @extends CUI.Widget
     * @classdesc A wizard widget to navigate throught a form.
     *    
     *  <div class="wizard" data-init="wizard">
     *      <nav>
     *          <button class="back">Back</button>
     *          <ol>
     *              <li>Frist step</li>
     *              <li>Second step</li>
     *              <li>Third step</li>
     *              <li>Last step</li>
     *          </ol>
     *          <button class="next" disabled>Next</button>
     *      </nav>
     *      <section data-next-disabled="false" data-back-label="Cancel">
     *          The first step is optional.
     *      </section>
     *      <section data-next-disabled="false">
     *          The second step is optional.
     *      </section>
     *      <section data-next-disabled="false">
     *          The third step is optional.
     *      </section>
     *      <section data-next-label="Create">
     *          Name is required.
     *      </section>
     *  </div>
     *     
     *  @example
     *  <caption>Instantiate by data API</caption>
     *  &lt;div class=&quot;wizard&quot; data-init=&quot;wizard&quot;&gt;
     *      &lt;input type=&quot;datetime&quot; value=&quot;2012-10-20 11:10&quot;&gt;
     *      &lt;button&gt;&lt;span class=&quot;icon-calendar small&quot;&gt;Datetime picker&lt;/span&gt;&lt;/button&gt;
     *  &lt;/div&gt;
     *     
     *  @example
     *  <caption>Instantiate with Class</caption>
     *  var wizard = new CUI.Wizard({
     *    element: '#myOrdinarySelectBox'
     *  });
     *     
     *  @example
     *  <caption>Instantiate by jQuery plugin</caption>
     *  $("div.wizard").wizard();
     *
     * @desc Creates a new wizard widget 
     * @constructs
     *
     * @param {Object} options Component options
     * @param {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param {Function} options.onChangePage Callback called each time the page change (with arguments: `button, page`).
     * @param {Function} options.onFinish Callback called after the last page change (without arguments).
     */
    construct: function(options) {
      wizard = this; // TODO for DEV purpose

      this.$nav = this.$element.find('nav').first();
      this.$back = this.$nav.find('button').first();
      this.$next = this.$nav.find('button').last();
      this.$pageOverview = this.$nav.find('ol').last();

      // Set toolbar classes
      this.$nav.addClass('toolbar');
      this.$back.addClass('left');
      this.$next.addClass('right');
      this.$pageOverview.addClass('center');

      this.$next.click(this._onNextClick.bind(this));
      this.$back.click(this._onBackClick.bind(this));

      this._updateDefault();

      // Start with first page
      this.changePage(1);
    },

    defaults: {
      nextDisabled: false,
      backDisabled: false,
      nextLabel: 'next',
      backLabel: 'back',
      onChangePage: null,
      onFinish: null
    },

    /**
     * Change the page.
     *
     * Page number start with 1 and not 0.
     * Page number should be between 1 and number of sections.
     *
     * @param {Integer} pageNumber The page number
     */
    changePage: function(pageNumber) {
      if (pageNumber < 1 || pageNumber > this.$nav.find('li').length) return ;

      this.pageNumber = pageNumber;
      var page = this.pageNumber - 1;

      this.$nav.find('li.active').removeClass('active');
      this.$nav.find('li:eq(' + page + ')').addClass('active');

      this.$element.find('>section.active').removeClass('active');
      this.$element.find('>section:eq(' + page + ')').addClass('active');

      this._updateButtons();
    },

    /**
     * Return the number of the current page
     *
     * Page number start with 1 and not 0.
     *
     * @return {Integer} The page number
     */
    getCurrentPageNumber: function() {
      return this.pageNumber;
    },

    /**
     * Return the current page
     *
     * Page number start with 1 and not 0.
     *
     * @return {Integer} The page number
     */
    getCurrentPage: function() {
      var page = parseFloat(wizard.pageNumber)-1;
      return this.$element.find('>section:eq('+ page +')');
    },

    /**
     * Set the label of the `next` button 
     *
     * @return {String} The label
     */
    setNextButtonLabel: function(label) {
      this.$next.text(label);
    },

    /**
     * Set the label of the `back` button
     *
     * @return {String} The label
     */
    setBackButtonLabel: function(label) {
      this.$back.text(label);
    },

    /**
     * Set or remove the disabled attribe of the next button
     *
     * @param {Boolean} If true the button will be disabled, if not it will be enabled
     */
    setNextButtonDisabled: function(disabled) {
      this.$next.attr('disabled', disabled);
    },

    /**
     * Set or remove the disabled attribe of the back button
     *
     * @param {Boolean} If true the button will be disabled, if not it will be enabled
     */
    setBackButtonDisabled: function(disabled) {
      this.$back.attr('disabled', disabled);
    },

    /** @ignore */
    _onNextClick: function(e) {
      if (this.getCurrentPageNumber() < this.$nav.find('li').length) {
        this._doButtonClick(e.target, this.getCurrentPageNumber() + 1);
      } else {
        if (typeof this.options.onFinish === 'function') {
          this.options.onFinish();
        }
      }
    },

    /** @ignore */
    _onBackClick: function(e) {
      this._doButtonClick(e.target, this.getCurrentPageNumber() - 1);
    },

    _doButtonClick: function(button, pageNumber) {
      var currentPage = this.getCurrentPageNumber();

      this.changePage(pageNumber);

      if (currentPage !== this.getCurrentPageNumber() &&
          typeof this.options.onChangePage === 'function') {
        this.options.onChangePage(button, $(this.getCurrentPage()));
      }
    },

    /** @ignore */
    _updateButtons: function() {
      var page = this.getCurrentPage();

      this.setNextButtonLabel((this._dataExists(page, 'nextLabel')) ? page.data('nextLabel') 
        : this.options.nextLabel);
      this.setBackButtonLabel((this._dataExists(page, 'backLabel')) ? page.data('backLabel') 
        : this.options.backLabel);
      this.setNextButtonDisabled((this._dataExists(page, 'nextDisabled')) ? page.data('nextDisabled') 
        : this.options.nextDisabled);
      this.setBackButtonDisabled((this._dataExists(page, 'backDisabled')) ? page.data('backDisabled') 
        : this.options.backDisabled);
    },

    /**
     * @ignore
     * jQuery doesn't have any method to check if a data exists
     */
    _dataExists: function($element, index) {
      return $element.data(index) !== undefined;
    },

    /** @ignore */
    _updateDefault: function() {
        this.options.nextDisabled = this.$next.is('[disabled]');
        this.options.backDisabled = this.$back.is('[disabled]');
        this.options.nextLabel = this.$next.text();
        this.options.backLabel = this.$back.text();
    }
  });

  CUI.util.plugClass(CUI.Wizard);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).ready(function() {
        $("[data-init=wizard]").wizard();
    });
  }  
}(window.jQuery));
