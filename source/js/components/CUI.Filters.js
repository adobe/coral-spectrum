(function($) {
  CUI.Filters = new Class(/** @lends CUI.Filters# */{
    toString: 'Filters',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc An autocompletable filters&tags widget
      
      <div class="alert error">
        <button class="close" data-dismiss="alert">&times;</button>
        <strong>ERROR</strong><div>Uh oh, something went wrong with the whozit!</div>
      </div>
      
      @example
<caption>Instantiate with Class</caption>
var alert = new CUI.Alert({
  element: '#myAlert',
  heading: 'ERROR',
  content: 'An error has occurred.',
  closable: true
});

// Hide the alert, change the content, then show it again
alert.hide().set({ content: 'Another error has occurred.'}).show();

// jQuery style works as well
$('#myAlert').alert('hide');

      @example
<caption>Instantiate with jQuery</caption>
$('#myAlert').alert({
  heading: 'ERROR',
  content: 'An error has occurred.',
  closable: true
});

// Hide the alert, change the content, then show it again
$('#myAlert').alert('hide').alert({ heading: 'Another error has occurred.'}).alert('show');

// A reference to the element's alert instance is stored as data-alert
var alert = $('#myAlert').data('alert');
alert.hide();

      @example
<caption>Data API: Hide alert</caption>
<description>When an element within the alert has <code><span class="atn">data-dismiss</span>=<span class="atv">"alert"</span></code>, it will hide the alert.</description>
&lt;a data-dismiss=&quot;alert&quot;&gt;Dismiss&lt;/a&gt;

      @example
<caption>Markup</caption>
&lt;div class=&quot;alert error&quot;&gt;
  &lt;button class=&quot;close&quot; data-dismiss=&quot;alert&quot;&gt;&amp;times;&lt;/button&gt;
  &lt;strong&gt;ERROR&lt;/strong&gt;&lt;div&gt;Uh oh, something went wrong with the whozit!&lt;/div&gt;
&lt;/div&gt;

      @desc Creates a filters field
      @constructs
      
      @param {Object} options                               Component options
      @param {Function} [options.autocompleteCallback=use options]      Callback for autocompletion
      @param {Array} [options.options=example array]                     Array of available options if no autocomplete callback is used
      @param {boolean} [options.multiple=false]                     Can the user select more than one option?
      @param {int} [options.delay=200]                     Delay before starting autocomplete when typing
      @param {boolean} [options.highlight=true]                     Highlight search string in results
    */
    construct: function(options) {
        this.$element.addClass("filters");
        
        // Set callback to default if there is none
        if (!this.options.autocompleteCallback) this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);
        
        this.$element.on("input", "", function() {
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = setTimeout(this._inputChanged.bind(this), this.options.delay);
        }.bind(this));
        
        this.$element.on("blur", "", function() {
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = null;
            setTimeout(this._hideResults.bind(this), 200); // Use timeout to have a chance to select from list
        }.bind(this));
        
        this.$element.on("keydown", "", this._keyPressed.bind(this));
       
    },
    
    defaults: {
        autocompleteCallback: null,
        options: ["Apples", "Pears", "Bananas", "Strawberries"],
        multiple: false,
        delay: 200,
        highlight: true
    },
    
    listElement: null,
    typeTimeout: null,
    
    _keyPressed: function(event) {        
        var key = event.keyCode;
        if (!this.listElement) return;

        var current = this.listElement.find("li.selected").index();
        
        if (key === 38) {
            event.preventDefault();
            if (current > 0) current--;
        }
        
        if (key === 40) {
            event.preventDefault();
            if (current < (this.listElement.children().length - 1)) current++;
        }
        
        if (key === 13) {
           event.preventDefault();
           if (current >= 0) {
                this.$element.attr("value",  $(this.listElement.children().get(current)).text());
                this._hideResults();
                this.$element.focus();
           }
        }
        
        this.listElement.children().removeClass("selected");
        if (current >= 0) $(this.listElement.children().get(current)).addClass("selected");
        
        return;
    },
    _inputChanged: function() {
        var searchFor = this.$element.attr("value");
        var results = this.options.autocompleteCallback(searchFor);
        this._renderResults(results, searchFor);

    },
    
    _renderResults: function(results, searchFor) {
        var that = this;
        var list = $("<ul class=\"autocomplete-results\">");
        list.width(this.$element.outerWidth());
        $.each(results, function(key, value) {
            if (this.options.highlight) {
                var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
                if (i >= 0) {
                    value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
                }
            }
            list.append("<li>" + value + "</li>");
        }.bind(this));
        list.find("li").click(function() {
           that.$element.attr("value", $(this).text());
           that._hideResults();
           that.$element.focus();
        });
        this._hideResults();
        this.listElement = list;
        this.$element.after(list);
    },
    
    _hideResults: function() {
        if (this.listElement) {
            this.listElement.detach();
            this.listElement = null;
        }    
    },
    
    _defaultAutocompleteCallback: function(searchFor) {
        var result = [];
        
        $.each(this.options.options, function(key, value) {
            if (value.toLowerCase().indexOf(searchFor.toLowerCase(), 0) >= 0 ) result.push(value);
        });
        
        return result;
    }
    
  });

  CUI.util.plugClass(CUI.Filters);
  
  // Data API
  //$(function() {
  //  $('body').on('click.alert.data-api', '[data-dismiss="alert"]', function(evt) {
  //    $(evt.target).parent().hide();
  //  });
  //});
}(window.jQuery));
