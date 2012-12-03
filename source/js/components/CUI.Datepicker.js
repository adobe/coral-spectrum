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
      @param {String} [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]         Displayed date (userfriendly), default is 2012-10-20T20:35Z
      @param {String} [options.required=false]                 Is a value required?
    */
    
    defaults: {
        monthNames: null,
        dayNames: null,
        format: null,
        type: "date",
        selectedDateTime: moment(),
        startDay: 0,
        disabled: false,
        displayedFormat: 'YYYY-MM-DD[T]HH:mm[Z]',
        storedFormat: 'YYYY-MM-DD[T]HH:mm[Z]',
        forceHTMLMode: false,
        required: false
    },
    
    displayDateTime: null,
    pickerShown: false,
    isMobileAndSupportsInputType: false,
    internFormat: 'YYYY-MM-DD[T]HH:mm[Z]',
    officialDateFormat: 'YYYY-MM-DD',
    officialTimeFormat: 'YYYY-MM-DD[T]HH:mm[Z]',
    officialDatetimeFormat: 'HH:mm',

    construct: function(options) {

        var $button = this.$element.find('>button');
        if ($button.attr('type') === undefined) {
            $button[0].setAttribute('type', 'button');
        }
        if ($button.attr('required')) {
            this.options.required = true;
        }

        this.options.monthNames = this.options.monthNames || CUI.Datepicker.monthNames;
        this.options.dayNames = this.options.dayNames || CUI.Datepicker.dayNames;
        this.options.displayedFormat = this.options.displayedFormat || CUI.Datepicker.displayedFormat;
        this.options.storedFormat = this.options.storedFormat || CUI.Datepicker.storedFormat;

        this._readDataFromMarkup();

        if(this._isSupportedMobileDevice() && this._supportsInputType(this.options.type)) {
            this.isMobileAndSupportsInputType = true;
        }

        this._addMissingElements();
        this._updateState();

        this.$openButton = this.$element.find('button');

        this.$input = this.$element.find('input');

        this._readInputVal();

        if(this._isTimeEnabled()) {
            this._renderTime();
            this.$timeDropdowns = this.$element.find(".dropdown");
            this.$timeButtons = this.$timeDropdowns.find("button");
        }

        // If HTML5 input is used, then force to use the official format.
        if (this.isMobileAndSupportsInputType) {
            if (this.options.type === 'date') {
                this.options.displayedFormat = this.officialDateFormat;
                this.options.storedFormat = this.officialDateFormat;
            } else if (this.options.type === 'time') {
                this.options.displayedFormat = this.officialTimeFormat;
                this.options.storedFormat = this.officialTimeFormat;
            } else {
                this.options.displayedFormat = this.officialDatetimeFormat;
                this.options.storedFormat = this.officialDatetimeFormat;
            }

            this._setDateTime(this.displayDateTime);
        }
        
        if(!this.isMobileAndSupportsInputType) {
            this._switchInputTypeToText(this.$input);
        }

        var timeout = null;
        var $input = this.$element.find('input').first();
        var $btn = this.$element.find('button').first();
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

        $input.on("change", function() {
            if (this.options.disabled) return;
            this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
            this._renderCalendar();
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
            this.displayDateTime = moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]);
            this._renderCalendar("left");
        }.bind(this));

        this.$element.on("mousedown", ".prev-month", function(event) {
            event.preventDefault();
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
            this.$timeButtons.on("dropdown-list:select", dropdownChanged.bind(this));
            // for Mobile
            this.$timeDropdowns.on('change', dropdownChanged.bind(this));
        }


        if (this.isMobileAndSupportsInputType) {
            this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
        }
    },
    
    _readDataFromMarkup: function() {
        if (this.$element.data("disabled")) {
            this.options.disabled = true;
        }

        var $input = $(this.$element.find("input").filter("[type^=date],[type=time]"));
        if ($input.length !== 0) {
            this.options.type = $input.attr("type");
        }

        if ($input.data('displayedFormat') !== undefined) {
            this.options.displayedFormat = $input.data('displayedFormat');
        }

        if ($input.data('storedFormat') !== undefined) {
            this.options.storedFormat = $input.data('storedFormat');
        }

        if (this.$element.data('forceHtmlMode') !== undefined) {
            this.options.forceHTMLMode = this.$element.data('forceHtmlMode');
        }
    },

    _readInputVal: function() {
        this.displayDateTime = this.options.selectedDateTime = moment($(this.$input)[0].getAttribute('value'), this.options.displayedFormat);
    },
    
    _updateState: function() {
        if (this.options.disabled) {
            this.$element.find("input,button").attr("disabled", "disabled");
            this._hidePicker();
        } else {
            this.$element.find("input,button").removeAttr("disabled");
        }

        if ((!this.options.selectedDateTime && this.options.required) || (this.options.selectedDateTime && isNaN(this.options.selectedDateTime.year()))) {
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

        if(!this.isMobileAndSupportsInputType) {
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
    
    _addMissingElements: function() {
        if (!this.isMobileAndSupportsInputType) {
            if (this.$element.find(".popover").length === 0) {
                this.$element.append('<div class="popover arrow-top" style="display:none"><div class="inner"></div></div>');
                if(this._isDateEnabled()) this.$element.find(".inner").append('<div class="calendar"><div class="calendar-header"></div><div class="calendar-body"></div></div>');
            }
        } else {
            // Show native control
        }
    },
    
    _renderCalendar: function(slide) {
        var displayDateTime = this.displayDateTime;
        if (!displayDateTime) displayDateTime = moment();
    
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
            this._slideCalendar($calendar.find("table"), table, (slide === "left"));
        } else {
            $calendar.find("table").remove();
            $calendar.find(".sliding-container").remove();
            $calendar.find(".calendar-body").append(table);
        }

        this._updateState();
    },

    _getHoursFromDropdown: function() {
        return parseInt(this.$timeDropdowns.filter('.hour').find("button").text(), 10);
    },

    _getMinutesFromDropdown: function() {
        return parseInt(this.$timeDropdowns.filter('.minute').find("button").text(), 10);
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
        for(var w = 0; w < 6; w++) {
            html +="<tr>";
            for(var d = 0; d < 7; d++) {
                day = (w * 7 + d) - monthStartsAt + 1;
                var displayDateTime = moment([year, month - 1, day]);
                var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
                var cssClass = "";

                if (displayDateTime.diff(today, 'days') === 0) cssClass += " today";
                if (this.options.selectedDateTime && displayDateTime.diff(this.options.selectedDateTime, 'days') === 0) cssClass += " selected";

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
        
    _slideCalendar: function(oldtable, newtable, isLeft) {
        var width = oldtable.width();
        var height = oldtable.height();

        this.$element.find(".sliding-container,table").remove();

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
        this.slideInProgress = true;

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
    
    _setDateTime: function(date) {
        this.$input.val(date.format(this.options.displayedFormat));

        this.options.selectedDateTime = this.displayDateTime = date;

        if(this.options.type !== "time") {
            this._renderCalendar();
        }
    },

    _getTimeFromInput: function() {
        if(this._isTimeEnabled()) {
            var h = parseInt(this.$timeDropdowns.filter('.hour').find("button").text(), 10);
            var m = parseInt(this.$timeDropdowns.filter('.minute').find("button").text(), 10);
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
        var hourSelect = $('<select name="dropdown"></select>');
        for(var h = 0; h < 24; h++) {
            var hourOption = $('<option>' + this._pad(h) + '</option>');
            if(this.options.selectedDateTime && h === this.options.selectedDateTime.hours()) { hourOption.attr('selected','selected'); }
            hourSelect.append(hourOption);
        }
        var hourDropdown = $('<div class="dropdown hour"><button></button></input>').append(hourSelect);

        // Minutes
        var minuteSelect = $('<select name="dropdown"></select>');
        for(var m = 0; m < 60; m++) {
            var minuteOption = $('<option>' + this._pad(m) + '</option>');
            if(this.options.selectedDateTime && m === this.options.selectedDateTime.minutes()) { minuteOption.attr('selected', 'selected'); }
            minuteSelect.append(minuteOption);
        }
        var minuteDropdown = $('<div class="dropdown minute"><button>Single Select</button></div>').append(minuteSelect);

        // Set up dropdowns
        $(hourDropdown).dropdown();
        $(minuteDropdown).dropdown();

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
        }
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
  CUI.Datepicker.format = "Y-m-d";

  CUI.util.plugClass(CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $("[data-init=datepicker]", e.target).datepicker();
    });
  }

}(window.jQuery));
