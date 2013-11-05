(function ($) {

  // Instance id counter:
  var datepicker_guid = 0;

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
     data-head-format               Defines headline format, default is "MMMM YYYY".
     data-start-day                 Defines the start day of the week, 0 = Sunday, 1 = Monday, etc.

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

     @param {Object}  options                                                     Component options
     @param {Array}   [options.monthNames=english names]                          Array of strings with the name for each month with January at index 0 and December at index 11
     @param {Array}   [options.dayNames=english names]                            Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
     @param {String}  [options.type="date"]                                       Type of picker, supports date, datetime, datetime-local and time
     @param {integer} [options.startDay=0]                                        Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
     @param {boolean} [options.disabled=false]                                    Is this widget disabled?
     @param {String}  [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]           Displayed date (userfriendly), default is 2012-10-20 20:35
     @param {String}  [options.storedFormat="YYYY-MM-DD[T]HH:mmZ"]                Storage Date format, is never shown to the user, but transferred to the server
     @param {String}  [options.required=false]                                    Is a value required?
     @param {String}  [options.hasError=false]                                    True to display widget as erroneous, regardless if the value is required or not.
     @param {String}  [options.minDate]                                           Defines the start date of selection range. Dates earlier than minDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.maxDate]                                           Defines the end date of selection range. Dates later than maxDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.headFormat="MMMM YYYY"]                            Defines calendar headline format, default is "MMMM YYYY"
     @param {boolean} [options.forceHTMLMode=false]                               Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     @param {String}  [options.selectedDateTime]                                  Defines what date/time will be selected when the calendar is rendered. If nothing is specified it will be
     considerend today or current time.
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
      headFormat: "MMMM YYYY",
      forceHTMLMode: false,
      required: false,
      hasError: false,
      minDate: null,
      maxDate: null
    },

    displayDateTime: null,
    pickerShown: false,

    construct: function () {
      this.guid = (datepicker_guid += 1);
      this._readOptionsFromMarkup();
      this._parseOptions();
      this._setupMomentJS();
      this._adjustMarkup();
      this._findElements();
      this._constructPopover();
      this._initialize();
    },

    _readOptionsFromMarkup: function () {
      var options = this.options;
      var element = this.$element;
      if (element.hasClass("error")) {
        options.hasError = true;
      }
      var $input = $(element.find("input").filter("[type^=date],[type=time]"));
      if ($input.length !== 0) {
        options.type = $input.attr("type");
      }

      [
        [ "disabled", "disabled", asBoolean ],
        [ "required", "required", asBoolean ],
        [ "displayed-format", "displayedFormat", ifDefined],
        [ "stored-format", "storedFormat", ifDefined],
        [ "force-html-mode", "forceHTMLMode", ifDefined],
        [ "day-names", "dayNames", ifTruthy],
        [ "month-names", "monthNames", ifTruthy ],
        [ "head-format", "headFormat", ifTruthy],
        [ "start-day", "startDay", asNumber],
        [ "min-date", "minDate", ifDefined],
        [ "max-date", "maxDate", ifDefined]
      ].map(function (attr) {
          var name = attr[0], field = attr[1], processor = attr[2];
          processor(element.data(name), field, options);
        });
    },

    _parseOptions: function () {
      var options = this.options;
      options.monthNames = options.monthNames || CUI.Datepicker.monthNames;
      options.dayNames = options.dayNames || CUI.Datepicker.dayNames;

      options.isDateEnabled =
        (options.type === "date") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      options.isTimeEnabled =
        (options.type === "time") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      var i = document.createElement("input");
      i.setAttribute("type", options.type);
      options.supportsInputType = i.type !== "text";

      if (options.minDate !== null) {
        if (options.minDate === "today") {
          options.minDate = moment().startOf("day");
        } else {
          if (moment(options.minDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.minDate = moment(options.minDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.minDate = null;
          }
        }
      }

      if (options.maxDate !== null) {
        if (options.maxDate === "today") {
          options.maxDate = moment().startOf("day");
        } else {
          if (moment(options.maxDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.maxDate = moment(options.maxDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.maxDate = null;
          }
        }
      }

      options.storedFormat = options.storedFormat || (options.type === "time" ? 'HH:mm' : 'YYYY-MM-DD[T]HH:mmZ');
      options.displayedFormat = options.displayedFormat || (options.type === "time" ? 'HH:mm' : 'YYYY-MM-DD HH:mm');
      options.useNativeControls = options.forceHTMLMode;

      if ((!options.forceHTMLMode) &&
        IS_MOBILE_DEVICE &&
        options.supportsInputType) {
        options.useNativeControls = true;
      }

      // If HTML5 input is used, then force to use the official format.
      if (options.useNativeControls) {
        if (options.type === 'date') {
          options.displayedFormat = OFFICIAL_DATE_FORMAT;
        } else if (options.type === 'time') {
          options.displayedFormat = OFFICIAL_TIME_FORMAT;
        } else {
          options.displayedFormat = OFFICIAL_DATETIME_FORMAT;
        }
      }
    },

    _setupMomentJS: function () {
      // Generate a language name for this picker to not overwrite any existing
      // moment.js language definition
      this.options.language = LANGUAGE_NAME_PREFIX + new Date().getTime();

      moment.lang(this.options.language, {
        months: this.options.monthNames,
        weekdaysMin: this.options.dayNames
      });
    },

    _adjustMarkup: function () {
      var element = this.$element;
      element.addClass("datepicker");

      if (!this.options.useNativeControls) {
        if (element.find("input").not("[type=hidden]").length === 0) {
          element.append("<input type=\"text\">");
        }
        if (element.find("button").length === 0) {
          element.append("<button class=\"icon-calendar small\"><span>Datepicker</span></button>");
        }
        if ($('body').find("#popguid" + this.guid + ".popover").length === 0) {
          $('body').append('<div class="datepicker popover arrow-top" style="display:none" id ="popguid' + this.guid + '"><div class="inner"></div></div>');
          var $popover = $('body').find("#popguid" + this.guid + ".popover");
          if (this.options.isDateEnabled) {
            $popover.find(".inner").append('<div class="calendar"><div class="calendar-header"></div><div class="calendar-body"></div></div>');
          }
        }
      } else {
        // Show native control
      }

      // Always include hidden field
      if (element.find("input[type=hidden]").length === 0) {
        element.append("<input type=\"hidden\">");
      }

      if (!element.find("input[type=hidden]").attr("name")) {
        var name = element.find("input").not("[type=hidden]").attr("name");
        element.find("input[type=hidden]").attr("name", name);
        element.find("input").not("[type=hidden]").removeAttr("name");
      }

      // Force button to be a button, not a submit thing
      var $button = element.find('>button');
      if ($button.attr('type') === undefined) {
        $button[0].setAttribute('type', 'button');
      }
    },

    _findElements: function () {
      this.$input = this.$element.find('input').not("[type=hidden]");
      this.$hiddenInput = this.$element.find('input[type=hidden]');
      this.$openButton = this.$element.find('button');
      this.$popover = $('body').find("#popguid" + this.guid + ".popover");
    },

    _constructPopover: function () {
      this.popover = new Popover({
        $element: this.$popover,
        options: this.options,
        setDateTimeCallback: this._popoverSetDateTimeCallback.bind(this)
      });
    },

    _initialize: function () {
      if (this.options.useNativeControls) {
        this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
      } else {
        this._switchInputTypeToText(this.$input);
      }

      if (!this.options.disabled) {
        this.$element.on('click', this._clickHandler.bind(this));
        this.$input.on("change" + (IS_MOBILE_DEVICE ? " blur" : ""), this._inputChangedHandler.bind(this));
      }

      // Reading input value for the first time. There may be a storage format:
      if (!this.options.selectedDateTime) {
        this._readInputVal([this.options.storedFormat, this.options.displayedFormat]);
      }

      // Set the selected date and time:
      this._setDateTime(this.options.selectedDateTime, true);
    },

    _readInputVal: function (format) {
      var value = this.$input.eq(0).val();
      var date = moment(value, format || this.options.displayedFormat);
      if (!date || !date.isValid()) {
        // Fallback: Try automatic guess if none of our formats match
        date = moment(value);
      }
      this.displayDateTime = this.options.selectedDateTime = date;
    },

    _updateState: function () {
      if (this.options.disabled) {
        this.$element.find("input,button").attr("disabled", "disabled");
        this._hidePicker();
      } else {
        this.$element.find("input,button").removeAttr("disabled");
      }

      if (this.options.hasError ||
        (!this.options.selectedDateTime && this.options.required) ||
        (this.options.selectedDateTime && !this.options.selectedDateTime.isValid())
        ) {
        this.$element.addClass("error");
      } else {
        this.$element.removeClass("error");
      }
    },

    _popoverSetDateTimeCallback: function () {
      this._setDateTime.apply(this, arguments);
      if (this.options.isTimeEnabled === false) {
        this._hidePicker();
      }
    },

    _switchInputTypeToText: function ($input) {
      var convertedInput = $input.detach().attr('type', 'text');
      this.$element.prepend(convertedInput);
    },

    _openNativeInput: function () {
      this.$input.trigger("tap");
    },

    _clickHandler: function (event) {
      if (isCalendarButton($(event.target))) {
        if (this.pickerShown) {
          this._hidePicker();
        } else {
          this._openPicker();
        }
      }
    },

    _bodyClickHandler: function (event) {
      if (!isCalendarButton($(event.target))) {
        this._hidePicker();
      }
    },

    _inputChangedHandler: function () {
      if (this.options.disabled) {
        return;
      }

      var newDate = moment(this.$input.val(), this.options.displayedFormat);
      if (newDate !== null && !isDateInRange(newDate, this.options.minDate, this.options.maxDate)) {
        this.options.hasError = true;
      } else {
        this.options.hasError = false;
      }
      this._setDateTime(newDate, true); // Set the date, but don't trigger a change event
    },

    _keyPress: function () {
      if (this.pickerShown) {
        // TODO: Keyboard actions
      }
    },

    _openPicker: function () {
      this.$element.addClass("focus");
      this.$input.parents().on('scroll', this._scrollParents.bind(this));

      if (!this.options.useNativeControls) {
        this._readInputVal();
        this._showPicker();
      } else {
        this._openNativeInput();
      }
    },

    _scrollParents: function (event) {
      this._hidePicker();
    },

    _showPicker: function () {
      if (!this.pickerShown) {
        this.boundBodyClickHandler = this._bodyClickHandler.bind(this);
        $('body').on('click', this.boundBodyClickHandler);

        if (this.options.isDateEnabled) {
          this.popover.renderCalendar();
        }

        var left = this.$openButton.offset().left + this.$openButton.outerWidth() / 2 - (this.$popover.outerWidth() / 2);
        var top = this.$openButton.offset().top + this.$openButton.outerHeight() + 16;

        this.$popover.css({
            "position": "absolute",
            "left": left + "px",
            "top": top + "px"}
        ).show();

        this.pickerShown = true;
      }
    },

    _hidePicker: function () {
      if (this.pickerShown) {
        $('body').off('click', this.boundBodyClickHandler);
        this.boundBodyClickHandler = null;

        this.$element.removeClass("focus");
        this.$input.parents().off('scroll', this._scrollParents);
        if (this.$popover) {
          this.$popover.hide();
        }
        this.pickerShown = false;
      }
    },

    /**
     * Sets a new datetime object for this picker
     */
    _setDateTime: function (date, silent) {
      this.options.selectedDateTime = this.displayDateTime = date;

      if (!date) {
        this.$input.val(""); // Clear for null values
      } else if (date.isValid()) {
        this.$input.val(date.lang(this.options.language).format(this.options.displayedFormat)); // Set only valid dates
      }

      var storage = (date && date.isValid()) ? date.lang('en').format(this.options.storedFormat) : ""; // Force to english for storage format!
      this.$hiddenInput.val(storage);

      this._updateState();

      if (this.options.isDateEnabled) {
        this.popover.renderCalendar();
      }

      if (this.options.isTimeEnabled) {
        this.popover.renderTime();
      }

      // Trigger a change even on the input
      if (!silent) {
        this.$input.trigger('change');
      }

      // Always trigger a change event on the hidden input, since we're not listening to it internally
      this.$hiddenInput.trigger('change');
    }
  });

  CUI.Datepicker.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];

  CUI.Datepicker.dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  CUI.util.plugClass(CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      $("[data-init~=datepicker]", e.target).datepicker();
    });
  }

  /**
   * @private
   *
   * Governs the generation and the interaction of the calendar and
   * time selects.
   */
  var Popover = new Class({
    toString: 'Popover',
    extend: Object,

    construct: function (options) {
      this.$element = options.$element;
      this.options = options.options;
      this.setDateTimeCallback = options.setDateTimeCallback;

      this._setupListeners();
    },

    /**
     * @private
     *
     * Public to CUI.Datepicker. Allows the main component to request the calendar
     * to re-render.
     */
    renderCalendar: function () {
      this._renderCalendar();
    },

    /**
     * @private
     *
     * Public to CUI.Datepicker. Allows the main component to request the time display
     * to re-render.
     */
    renderTime: function () {
      this._renderTime();
    },

    /**
     * @private
     *
     * Register event handlers.
     */
    _setupListeners: function () {

      // Move around
      this.$element.find(".calendar").on("swipe", this._swipeHandler.bind(this));
      this.$element.on("mousedown", ".next-month", this._mouseDownNextHandler.bind(this));
      this.$element.on("mousedown", ".prev-month", this._mouseDownPrevHandler.bind(this));
      this.$element.on("click", this._popOverClickHandler.bind(this));

      if (this.options.isTimeEnabled) {
        // for Desktop
        this.$element.on("selected", ".hour,.minute", this._dropdownChangedHandler.bind(this));
        // for Mobile
        this.$element.on("change", ".hour,.minute", this._dropdownChangedHandler.bind(this));
      }
    },

    _swipeHandler: function (event) {
      var d = event.direction,
        year = this.displayDateTime.year(),
        month = this.this.displayDateTime.month();

      if (d === "left") {
        this.displayDateTime = normalizeDate(moment([year, month + 1, 1]));
        this._renderCalendar("left");
      } else if (d === "right") {
        this.displayDateTime = normalizeDate(moment([year, month - 1, 1]));
        this._renderCalendar("right");
      }
    },

    _mouseDownNextHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]));
        this._renderCalendar("left");
      }
    },

    _mouseDownPrevHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]));
        this._renderCalendar("right");
      }
    },

    _popOverClickHandler: function (event) {
      // Make sure that clicks stay contained to the pop-up (for when a click
      // reaches the body tag, the pop-up may get closed.
      event.stopImmediatePropagation();
    },

    _dropdownChangedHandler: function () {
      var hours = this._getHoursFromDropdown();
      var minutes = this._getMinutesFromDropdown();
      if (!this.options.selectedDateTime) {
        this.options.selectedDateTime = moment();
      }
      var date = this.options.selectedDateTime.hours(hours).minutes(minutes);
      this.setDateTimeCallback(date);
    },

    _tableMouseDownHandler: function (event) {
      event.preventDefault();
      var date = moment($(event.target).data("date"), INTERN_FORMAT);
      if (this.options.isTimeEnabled) {
        var h = this._getHoursFromDropdown();
        var m = this._getMinutesFromDropdown();
        date.hours(h).minutes(m);
      }
      this.setDateTimeCallback(date);
    },

    _renderCalendar: function (slide) {
      var displayDateTime = this.displayDateTime;
      if (!displayDateTime || !displayDateTime.isValid()) {
        this.displayDateTime = displayDateTime = moment();
      }

      var displayYear = displayDateTime.year();
      var displayMonth = displayDateTime.month() + 1;

      var table = this._renderOneCalendar(displayMonth, displayYear);

      var $calendar = this.$element.find(".calendar");

      table.on("mousedown", "a", this._tableMouseDownHandler.bind(this));

      if ($calendar.find("table").length > 0 && slide) {
        this._slideCalendar(table, (slide === "left"));
      } else {
        $calendar.find("table").remove();
        $calendar.find(".sliding-container").remove();
        $calendar.find(".calendar-body").append(table);
      }
    },

    _renderOneCalendar: function (month, year) {
      var heading = moment([year, month - 1, 1]).lang(this.options.language).format(this.options.headFormat);
      var title = $('<div class="calendar-header"><h2>' + heading + '</h2></div>').
        append($("<button class=\"next-month\">›</button>")).
        append($("<button class=\"prev-month\">‹</button>"));
      var $calendar = this.$element.find(".calendar");
      var header = $calendar.find(".calendar-header");
      if (header.length > 0) {
        header.replaceWith(title);
      } else {
        $calendar.prepend(title);
      }

      var table = $("<table>");
      table.data("date", year + "/" + month);

      var html = "<tr>";
      var day = null;
      for (var i = 0; i < 7; i++) {
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

      for (var w = 0; w < 6; w++) {
        html += "<tr>";
        for (var d = 0; d < 7; d++) {
          day = (w * 7 + d) - monthStartsAt + 1;
          var displayDateTime = moment([year, month - 1, day]);
          var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
          var cssClass = "";

          if (isSameDay(displayDateTime, today)) {
            cssClass += " today";
          }

          if (isSameDay(displayDateTime, this.options.selectedDateTime)) {
            cssClass += " selected";
          }

          if (isCurrentMonth && isDateInRange(displayDateTime, this.options.minDate, this.options.maxDate)) {
            html += "<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.lang(this.options.language).format(INTERN_FORMAT) + "\">" + displayDateTime.date() + "</a></td>";
          } else {
            html += "<td class=\"" + cssClass + "\"><span>" + displayDateTime.date() + "</span></td>";
          }
        }
        html += "</tr>";
      }
      table.append("<tbody>" + html + "</tbody>");

      return table;
    },

    _slideCalendar: function (newtable, isLeft) {

      this.$element.find(".sliding-container table").stop(true, true);
      this.$element.find(".sliding-container").remove();

      var oldtable = this.$element.find("table");
      var width = oldtable.width();
      var height = oldtable.height();

      var container = $("<div class=\"sliding-container\">");

      container.css({"display": "block",
        "position": "relative",
        "width": width + "px",
        "height": height + "px",
        "overflow": "hidden"});

      this.$element.find(".calendar-body").append(container);
      container.append(oldtable).append(newtable);
      oldtable.css({"position": "absolute", "left": 0, "top": 0});
      oldtable.after(newtable);
      newtable.css({"position": "absolute", "left": (isLeft) ? width : -width, "top": 0});

      oldtable.animate({"left": (isLeft) ? -width : width}, TABLE_ANIMATION_SPEED, function () {
        oldtable.remove();
      });

      newtable.animate({"left": 0}, TABLE_ANIMATION_SPEED, function () {
        if (container.parents().length === 0) {
          // We already were detached!
          return;
        }
        newtable.css({"position": "relative", "left": 0, "top": 0});
        newtable.detach();
        this.$element.find(".calendar-body").append(newtable);
        container.remove();
      }.bind(this));
    },

    _renderTime: function () {

      var selectedTime = this.options.selectedDateTime;
      var html = $("<div class='time'><i class='icon-clock small'></i></div>");

      // Hours
      var hourSelect = $('<select></select>');
      for (var h = 0; h < 24; h++) {
        var hourOption = $('<option>' + padSingleDigit(h) + '</option>');
        if (selectedTime && h === selectedTime.hours()) {
          hourOption.attr('selected', 'selected');
        }
        hourSelect.append(hourOption);
      }
      var hourDropdown = $('<div class="select hour"><button></button></div>').append(hourSelect);

      // Minutes
      var minuteSelect = $('<select></select>');
      for (var m = 0; m < 60; m++) {
        var minuteOption = $('<option>' + padSingleDigit(m) + '</option>');
        if (selectedTime && m === selectedTime.minutes()) {
          minuteOption.attr('selected', 'selected');
        }
        minuteSelect.append(minuteOption);
      }
      var minuteDropdown = $('<div class="select minute"><button>Single Select</button></div>').append(minuteSelect);

      $(hourDropdown).css(STYLE_POSITION_RELATIVE);
      $(hourDropdown).find('select').css(STYLE_DROPDOWN_SELECT);
      $(minuteDropdown).css(STYLE_POSITION_RELATIVE);
      $(minuteDropdown).find('select').css(STYLE_DROPDOWN_SELECT);

      html.append(hourDropdown, $("<span>:</span>"), minuteDropdown);

      if (this.$element.find(".time").length === 0) {
        this.$element.find(".inner").append(html);
      } else {
        this.$element.find(".time").empty().append(html.children());
      }

      // Set up dropdowns
      $(hourDropdown).select();
      $(minuteDropdown).select();
    },

    _getHoursFromDropdown: function () {
      return parseInt(this.$element.find('.time .hour select').val(), 10);
    },

    _getMinutesFromDropdown: function () {
      return parseInt(this.$element.find('.time .minute select').val(), 10);
    }

  });

  /**
   * Static
   */

  function padSingleDigit(s) {
    if (s < 10) return "0" + s;
    return s;
  }

  function ifDefined(value, field, options) {
    if (value !== undefined) {
      options[field] = value;
    }
  }

  function asBoolean(value, field, options) {
    options[field] = value ? true : false;
  }

  function ifTruthy(value, field, options) {
    options[field] = value || options[field];
  }

  function asNumber(value, field, options) {
    if (value !== undefined) {
      options[field] = value * 1;
    }
  }

  function normalizeDate(date) {
    if (!date) return null;
    return moment([date.year(), date.month(), date.date()]);
  }

  function isDateInRange(date, startDate, endDate) {
    if (startDate === null && endDate === null) {
      return true;
    }
    if (startDate === null) {
      return date <= endDate;
    } else if (endDate === null) {
      return date >= startDate;
    } else {
      return (startDate <= date && date <= endDate);
    }
  }

  function isSameDay(d1, d2) {
    if (d1 && d2) {
      return d1.year() === d2.year() && d1.month() === d2.month() && d1.date() === d2.date();
    }
  }

  function isCalendarButton($target) {
    return $target.is(".icon-calendar, .icon-clock") || $target.children().is(".icon-calendar, .icon-clock");
  }

  var
    IS_MOBILE_DEVICE = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i),
    OFFICIAL_DATE_FORMAT = 'YYYY-MM-DD',
    INTERN_FORMAT = 'YYYY-MM-DD[T]HH:mmZ',
    OFFICIAL_TIME_FORMAT = 'HH:mm',
    OFFICIAL_DATETIME_FORMAT = INTERN_FORMAT,
    LANGUAGE_NAME_PREFIX = 'coralui_',

    STYLE_POSITION_RELATIVE = {
      'position': 'relative'
    },
    STYLE_DROPDOWN_SELECT = {
      'position': 'absolute',
      'left': '1.5rem',
      'top': '1rem'
    },

    TABLE_ANIMATION_SPEED = 400;

}(window.jQuery));
