(function($) {
  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A datepicker widget
         
        <p>
            <div class="datepicker" data-init="datepicker">
                <input type="datetime" value="1987-04-06T20:35Z">
                <button><span class="icon-calendar small">Datetime picker</span></button>
            </div>
        </p>

        @example
        <caption>Instantiate by data API</caption>
        &lt;div class=&quot;datepicker&quot; data-init=&quot;datepicker&quot;&gt;
            &lt;input type=&quot;datetime&quot; value=&quot;1987-04-06T20:35Z&quot;&gt;
            &lt;button&gt;&lt;span class=&quot;icon-calendar small&quot;&gt;Datetime picker&lt;/span&gt;&lt;/button&gt;
        &lt;/div&gt;
        
Currently there are the following data options:
  data-init="datepicker"         Inits the datepicker widget after page load
  data-disabled                  Sets field to "disabled" if given (with any non-empty value)
  data-required                  Sets field to "required" if given (with any non-empty value)
  data-stored-format             Sets the format of the date for transferring it to the server
  data-displayed-format          Sets the format of the date for displaying it to the user
  data-force-html-mode           Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
  data-day-names                 JSON-array-data with the short names of all week days, starting with Sunday
  data-month-names               JSON-array-data with the names of all months, starting with January

Additionally the type (date, time, datetime) is read from the &lt;input&gt; field.

        @example
        <caption>Instantiate with Class</caption>
        var datepicker = new CUI.Datepicker({
          element: '#myOrdinarySelectBox'
        });

        @example
        <caption>Instantiate by jQuery plugin</caption>
        $("div.datepicker").datepicker();
           
       
      @desc Creates a datepicker from a div element
      @constructs

      @param {Object}   options                               Component options
      @param {Array} [options.monthNames=english names]       Array of strings with the name for each month with January at index 0 and December at index 11
      @param {Array} [options.dayNames=english names]         Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
      @param {String} [options.type="date"]                   Type of picker, supports date, datetime, datetime-local and time
      @param {integer} [options.startDay=0]                   Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
      @param {boolean} [options.disabled=false]               Is this widget disabled?
      @param {String} [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]           Displayed date (userfriendly), default is 2012-10-20 20:35
      @param {String} [options.storedFormat="YYYY-MM-DD[T]HH:mmZ"]    Storage Date format, is never shown to the user, but transferred to the server 
      @param {String} [options.required=false]                 Is a value required?
    */
    
    defaults: {
        monthNames: null,
        dayNames: null,
        format: null,
        type: "date",
        selectedDateTime: null,
        startDay: 0,
        disabled: false,
        displayedFormat: null,
        storedFormat: null,
        forceHTMLMode: false,
        required: false
    },
    
    displayDateTime: null,
    pickerShown: false,
    useNativeControls: false,
    internFormat: 'YYYY-MM-DD[T]HH:mmZ',
    officialDateFormat: 'YYYY-MM-DD',
    officialTimeFormat: 'HH:mm',
    officialDatetimeFormat: 'YYYY-MM-DD[T]HH:mmZ',

    construct: function(options) {

        var $button = this.$element.find('>button');
        if ($button.attr('type') === undefined) {
            $button[0].setAttribute('type', 'button');
        }

        this.options.monthNames = this.options.monthNames || CUI.Datepicker.monthNames;
        this.options.dayNames = this.options.dayNames || CUI.Datepicker.dayNames;


        this._readDataFromMarkup();
        
        // Set standard formats
        this.options.storedFormat = this.options.storedFormat || (this.options.type === "time" ? 'HH:mm' : 'YYYY-MM-DD[T]HH:mmZ');
        this.options.displayedFormat = this.options.displayedFormat || (this.options.type === "time" ? 'HH:mm' : 'YYYY-MM-DD HH:mm');
        
        if(this._isSupportedMobileDevice() && this._supportsInputType(this.options.type)) {
            this.useNativeControls = true;
        }

        this._adjustMarkup();
        this._updateState();

        this.$openButton = this.$element.find('button');

        this.$input = this.$element.find('input').not("[type=hidden]");
        this.$hiddenInput = this.$element.find('input[type=hidden]');

        
        // Enable time buttons in popover
        if(this._isTimeEnabled()) {
            this._renderTime();
        }

        // If HTML5 input is used, then force to use the official format.
        if (this.useNativeControls) {
            if (this.options.type === 'date') {
                this.options.displayedFormat = this.officialDateFormat;
            } else if (this.options.type === 'time') {
                this.options.displayedFormat = this.officialTimeFormat;
            } else {
                this.options.displayedFormat = this.officialDatetimeFormat;
            }
        }
        
        if(!this.useNativeControls) {
            this._switchInputTypeToText(this.$input);
        }

        var timeout = null;
        var $input = this.$input;
        var $btn = this.$openButton;
        var $popover = this.$element.find('.popover').first();

        if (!this.options.disabled) {
            $('body').on('click', function(){
                if (this.keepShown === false) {
                    this._hidePicker();
                }
            }.bind(this));

            this.$element.click(function(event){
                this._openPicker();

                // let the event time to propagate.
                this.keepShown = true;
                setTimeout(function() {
                    this.keepShown = false;
                }.bind(this), 200);

            }.bind(this));
        }

        // Listen on change and additional on blur, as iPad does not fire change events for date fields.
        $input.on("change blur", function() {
            if (this.options.disabled) return;
            var newDate = moment(this.$input.val(), this.options.displayedFormat);
            this._setDateTime(newDate);
        }.bind(this));

        // Move around
        this.$element.find(".calendar").on("swipe", function(event) {
            var d = event.direction;
            if (d === "left") {
                this.displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]);
                this._renderCalendar("left");                
            } else if (d === "right") {
                this.displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]);
                this._renderCalendar("right");                
            }         
        }.bind(this));

        this.$element.on("mousedown", ".next-month", function(event) {
            event.preventDefault();
            if (!this.displayDateTime) return;
            this.displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]);
            this._renderCalendar("left");
        }.bind(this));

        this.$element.on("mousedown", ".prev-month", function(event) {
            event.preventDefault();
            if (!this.displayDateTime) return;
            this.displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]);
            this._renderCalendar("right");
        }.bind(this));

        if(this._isTimeEnabled()) {
            var dropdownChanged = function () {
                var h = this._getHoursFromDropdown();
                var m = this._getMinutesFromDropdown();
                if (!this.options.selectedDateTime) this.options.selectedDateTime = moment();
                var date = this.options.selectedDateTime.hours(h).minutes(m);

               this._setDateTime(date);
            };

            // for Desktop
            this.$element.on("dropdown-list:select", ".hour,.minute", dropdownChanged.bind(this));
            // for Mobile
            this.$element.on("change", ".hour,.minute", dropdownChanged.bind(this));
        }


        if (this.useNativeControls) {
            this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
        }
        
        // Reading input value for the first time -> there may be a storage format
        if (!this.options.selectedDateTime) this._readInputVal([this.options.storedFormat, this.options.displayedFormat]);
        this._setDateTime(this.options.selectedDateTime);
    },
    
    _readDataFromMarkup: function() {
        if (this.$element.data("disabled")) {
            this.options.disabled = true;
        }
        
        if (this.$element.data('required')) {
            this.options.required = true;
        }

        var $input = $(this.$element.find("input").filter("[type^=date],[type=time]"));
        if ($input.length !== 0) {
            this.options.type = $input.attr("type");
        }

        var el = this.$element;
        if (el.data('displayed-format') !== undefined) {
            this.options.displayedFormat = el.data('displayed-format');
        }

        if (el.data('stored-format') !== undefined) {
            this.options.storedFormat = el.data('stored-format');
        }

        if (el.data('force-html-mode') !== undefined) {
            this.options.forceHTMLMode = el.data('force-html-mode');
        }
        
        if (el.data('day-names') !== undefined) {
            this.options.dayNames = el.data('day-names') || this.options.dayNames;
        }
        
        if (el.data('month-names') !== undefined) {
            this.options.monthNames = el.data('month-names') || this.options.monthNames;
        }                
    },

    _readInputVal: function(format) {
        if (!format) format = this.options.displayedFormat;
        var value = this.$input.eq(0).val();
        var date = moment(value, format);
        if (!date || !date.isValid()) date = moment(value); // Fallback: Try automatic guess if none of our formats match
        this.displayDateTime = this.options.selectedDateTime = date;
    },
    
    _updateState: function() {
        if (this.options.disabled) {
            this.$element.find("input,button").attr("disabled", "disabled");
            this._hidePicker();
        } else {
            this.$element.find("input,button").removeAttr("disabled");
        }

        if ((!this.options.selectedDateTime && this.options.required) || (this.options.selectedDateTime && !this.options.selectedDateTime.isValid())) {
            this.$element.addClass("error");
        } else {
            this.$element.removeClass("error");
        }
    },

    _switchInputTypeToText: function($input) {
        var convertedInput = $input.detach().attr('type', 'text');
        // readonly to hide the keyboard
        // convertedInput.attr('readonly', 'true'); // Removed, we want to edit dates manually!
        this.$element.prepend(convertedInput);
    },

    _openNativeInput: function() {
        this.$input.trigger("tap");
    },
    
    _keyPress: function() {
        if (!this.pickerShown) return;
        
        // TODO: Keyboard actions
    },

    _openPicker: function() {
        this.$element.addClass("focus");

        if(!this.useNativeControls) {
            this._readInputVal();
            this._showPicker();
        } else {
            this._openNativeInput();
        }
    },
    
    _showPicker: function() {
        if(this._isDateEnabled()) this._renderCalendar();
        
        var left = this.$openButton.position().left + this.$openButton.width() / 2 - (this.$element.find(".popover").width() / 2);
        var top = this.$openButton.position().top + this.$openButton.outerHeight() + 16;
        //if (left < 0) left = 0;
        this.$element.find(".popover").css(
                {"position": "absolute",
                 "left": left + "px",
                 "top": top + "px"}).show();
        
        this.pickerShown = true;
    },
    
    _hidePicker: function() {
        this.$element.removeClass("focus");
        this.$element.find(".popover").hide();
        this.pickerShown = false;
    },
    
    _adjustMarkup: function() {
        if (!this.useNativeControls) {
            if (this.$element.find(".popover").length === 0) {
                this.$element.append('<div class="popover arrow-top" style="display:none"><div class="inner"></div></div>');
                if(this._isDateEnabled()) this.$element.find(".inner").append('<div class="calendar"><div class="calendar-header"></div><div class="calendar-body"></div></div>');
            }
            if (this.$element.find("input").not("[type=hidden]").length === 0) {
                this.$element.append("<input type=\"text\">");
            }

        } else {
            // Show native control
        }

        // Always include hidden field
        if (this.$element.find("input[type=hidden]").length === 0) {
            this.$element.append("<input type=\"hidden\">");
        }
        
        if (!this.$element.find("input[type=hidden]").attr("name")) {
            var name = this.$element.find("input").not("[type=hidden]").attr("name");
            this.$element.find("input[type=hidden]").attr("name",name);
            this.$element.find("input").not("[type=hidden]").removeAttr("name");
        }
                    
    },
    
    _renderCalendar: function(slide) {
        if (!this.displayDateTime || !this.displayDateTime.isValid()) this.displayDateTime = moment();
        var displayDateTime = this.displayDateTime;

    
        var displayYear = displayDateTime.format('YYYY');
        var displayMonth = displayDateTime.format('M') ;

        var table = this._renderOneCalendar(displayMonth, displayYear);
        
        var $calendar = this.$element.find(".calendar");

        table.on("mousedown", "a", function(event) {
            event.preventDefault();

            var date = moment($(event.target).data("date"), this.internFormat);

            if(this._isTimeEnabled()) {
                var h = this._getHoursFromDropdown();
                var m = this._getMinutesFromDropdown();
                date.hours(h).minutes(m);
            }

            this._setDateTime(date);
            this._hidePicker();
        }.bind(this));

        if ($calendar.find("table").length > 0 && slide) {
            this._slideCalendar(table, (slide === "left"));
        } else {
            $calendar.find("table").remove();
            $calendar.find(".sliding-container").remove();
            $calendar.find(".calendar-body").append(table);
        }

        this._updateState();
    },

    _getHoursFromDropdown: function() {
        return parseInt(this.$element.find('.time .hour select').val(), 10);
    },

    _getMinutesFromDropdown: function() {
        return parseInt(this.$element.find('.time .minute select').val(), 10);
    },

    _renderOneCalendar: function(month, year) {

        var monthName = this.options.monthNames[month - 1];

        var title = $('<div class="calendar-header"><h2>' + monthName + " " + year + '</h2></div>');

        // Month selection
        var nextMonthElement = $("<button class=\"next-month\">›</button>");
        var prevMonthElement = $("<button class=\"prev-month\">‹</button>");

        title.append(nextMonthElement).append(prevMonthElement);

        var $calendar = this.$element.find(".calendar");
        if ($calendar.find(".calendar-header").length > 0) {
            $calendar.find(".calendar-header").replaceWith(title);
        } else {
            $calendar.prepend(title);
        }

        var day = null;

        var table = $("<table>");
        table.data("date", year + "/" + month);

        var html = "<tr>";
        for(var i = 0; i < 7; i++) {
            day = (i + this.options.startDay) % 7;
            var dayName = this.options.dayNames[day];
            html += "<th><span>" + dayName + "</span></th>";
        }
        html += "</tr>";
        table.append("<thead>" + html + "</thead>");

        var firstDate = moment([year, month - 1, 1]);
        var monthStartsAt = (firstDate.day() - this.options.startDay) % 7;
        if (monthStartsAt < 0) monthStartsAt += 7;

        html = "";
        var today = moment();
        
        function isSameDay(d1, d2) {
            if (!d1) return;
            if (!d2) return;
            return d1.year() === d2.year() && d1.month() === d2.month() && d1.date() === d2.date(); 
        }
        
        for(var w = 0; w < 6; w++) {
            html +="<tr>";
            for(var d = 0; d < 7; d++) {
                day = (w * 7 + d) - monthStartsAt + 1;
                var displayDateTime = moment([year, month - 1, day]);
                var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
                var cssClass = "";

                if (isSameDay(displayDateTime, today)) cssClass += " today";
                if (isSameDay(displayDateTime, this.options.selectedDateTime)) cssClass += " selected";

                if (isCurrentMonth) {
                    html += "<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.format(this.internFormat) + "\">" + displayDateTime.date() + "</a></td>";
                } else {
                    html += "<td class=\"" + cssClass + "\"><span>" + displayDateTime.date() + "</span></td>";
                }
            }
            html +="</tr>";
        }
        table.append("<tbody>" + html + "</tbody>");

        return table;
    },
      
    _slideCalendar: function(newtable, isLeft) {

        this.$element.find(".sliding-container table").stop(true, true);
        this.$element.find(".sliding-container").remove();

        var oldtable = this.$element.find("table");
        var width = oldtable.width();
        var height = oldtable.height();
        
        var container = $("<div class=\"sliding-container\">");

        container.css({"display" : "block",
                       "position": "relative",
                       "width": width + "px",
                       "height": height + "px",
                       "overflow": "hidden"});
                   
        this.$element.find(".calendar-body").append(container);
        container.append(oldtable).append(newtable);
        oldtable.css({"position": "absolute", "left": 0, "top": 0});
        oldtable.after(newtable);
        newtable.css({"position": "absolute", "left": (isLeft) ? width : -width, "top": 0});

        var speed = 400;
        
        oldtable.animate({"left": (isLeft) ? -width : width}, speed, function() {
            oldtable.remove();
        });

        newtable.animate({"left": 0}, speed, function() {
            if (container.parents().length === 0) return; // We already were detached!
            newtable.css({"position": "relative", "left": 0, "top": 0});
            newtable.detach();
            this.$element.find(".calendar-body").append(newtable);
            container.remove();
        }.bind(this));        
    },
    
    /**
    * Sets a new datetime object for this picker
    */
    _setDateTime: function(date) {
        this.options.selectedDateTime = this.displayDateTime = date;
        
        if (!date) {
            this.$input.val(""); // Clear for null values
        } else if (date.isValid()) {
            this.$input.val(date.format(this.options.displayedFormat)); // Set only valid dates
        }
        
        var storage = (date && date.isValid()) ? date.format(this.options.storedFormat) : "";     
        this.$hiddenInput.val(storage);
            
        this._updateState();
        
        if(this.options.type !== "time") {
            this._renderCalendar();
        }
        
        if(this._isTimeEnabled()) this._renderTime();
    },

    _getTimeFromInput: function() {
        if(this._isTimeEnabled()) {
            var h = parseInt(this.$element.find('.time .hour button').text(), 10);
            var m = parseInt(this.$element.find('.time .minute button').text(), 10);
            var time = [h,m];
            return time;
        }
    },

    _getTimeString: function(hour, minute) {
        return this._pad(hour) + ":" + this._pad(minute) + ":" + this._pad(this.options.selectedDateTime.seconds());
    },

    _combineDateTimeStrings: function(dateString, timeString) {
        return dateString + " " + timeString;
    },

    _renderTime: function() {
        var html = $("<div class='time'><i class='icon-clock small'></i></div>");

        // Hours
        var hourSelect = $('<select></select>');
        for(var h = 0; h < 24; h++) {
            var hourOption = $('<option>' + this._pad(h) + '</option>');
            if(this.options.selectedDateTime && h === this.options.selectedDateTime.hours()) { hourOption.attr('selected','selected'); }
            hourSelect.append(hourOption);
        }
        var hourDropdown = $('<div class="dropdown hour"><button></button></input>').append(hourSelect);

        // Minutes
        var minuteSelect = $('<select></select>');
        for(var m = 0; m < 60; m++) {
            var minuteOption = $('<option>' + this._pad(m) + '</option>');
            if(this.options.selectedDateTime && m === this.options.selectedDateTime.minutes()) { minuteOption.attr('selected', 'selected'); }
            minuteSelect.append(minuteOption);
        }
        var minuteDropdown = $('<div class="dropdown minute"><button>Single Select</button></div>').append(minuteSelect);

        // Style for mobile, select can't be hidden
        $(hourDropdown).css({
            'position': 'relative'
        });

        $(minuteDropdown).css({
            'position': 'relative'
        });

        $(hourDropdown).find('select').css({
            'position': 'absolute',
            'left': '1.5rem',
            'top': '1rem'
        });

        $(minuteDropdown).find('select').css({
            'position': 'absolute',
            'left': '1.5rem',
            'top': '1rem'
        });

        html.append(hourDropdown, $("<span>:</span>"), minuteDropdown);

        if (this.$element.find(".time").length === 0) {
            this.$element.find(".inner").append(html);
        } else {
            this.$element.find(".time").empty().append(html.children());
        }
        
        // Set up dropdowns
        $(hourDropdown).dropdown();
        $(minuteDropdown).dropdown();
    },

    _isSupportedMobileDevice: function() {
      if( (navigator.userAgent.match(/Android/i) ||
          navigator.userAgent.match(/iPhone|iPad|iPod/i)) &&
          !this.options.forceHTMLMode) {
          return true;
      }
      return false;
    },

    _supportsInputType: function(type) {
      var i = document.createElement("input");
      i.setAttribute("type", type);
      return i.type !== "text";
    },

    _isDateEnabled: function() {
      return (this.options.type === "date") || (this.options.type === "datetime") || (this.options.type === "datetime-local");
    },

    _isTimeEnabled: function() {
      return (this.options.type === "time") || (this.options.type === "datetime") || (this.options.type === "datetime-local");
    },
    
    _pad: function(s) {
        if (s < 10) return "0" + s;
        return s;
    }
    
  });
  
  CUI.Datepicker.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  CUI.Datepicker.dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  CUI.util.plugClass(CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $("[data-init=datepicker]", e.target).datepicker();
    });
  }

}(window.jQuery));
