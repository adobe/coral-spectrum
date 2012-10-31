(function($) {
  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A date picker widget
        
      @param {Object}   options                               Component options
      @param {Array} [options.monthNames=english names]       Array of strings with the name for each month with January at index 0 and December at index 11
      @param {Array} [options.dayNames=english names]         Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
      @param {String} [options.format="Y-m-d"]                  A formatting string for dates like PHP date function, currently only Y, m, d, j, w, n, y, c are supported
      @param {integer} [options.startDay=0]                   Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
      @param {boolean} [options.disabled=false]                   Is this widget disabled?
      
    */
    construct: function(options) {
        this._readFromMarkup();

        this.options.monthNames = this.options.monthNames || CUI.Datepicker.monthNames;
        this.options.dayNames = this.options.dayNames || CUI.Datepicker.dayNames;
        this.options.format = this.options.format || CUI.Datepicker.format;
        
        this._addMissingElements();
        this._updateState();
        
        //if (this.options.selectedDate) this.gotoDate(this._formatDate(this.options.selectedDate));
        
        this.$element.on("click", function() {
            if (this.options.disabled) return;
            this.$element.find("input").focus();
        }.bind(this));
        
        var timeout = null;
        this.$element.on("focus", "input", function() {
            if (this.options.disabled) return;
            this.$element.addClass("focus");
            if (timeout) {
                // Picker is currently shown, just leave it!
                clearTimeout(timeout);
                timeout = null;
                return;
            }
            this.displayDate = this.options.selectedDate = new Date(this.$element.find("input").val()); 
            this._showPicker();
        }.bind(this));
        
        this.$element.on("change", "input", function() {
            if (this.options.disabled) return;
            this.displayDate = this.options.selectedDate = new Date(this.$element.find("input").val());
            this._renderCalendar();
        }.bind(this));
        
        this.$element.on("blur", "input", function() {
            if (this.options.disabled) return;
            this.$element.removeClass("focus");
            timeout = setTimeout(function() {
                timeout = null;
                this._hidePicker();
            }.bind(this), 200);
            
        }.bind(this));
        
        // Move around
        this.$element.find(".datepicker-calendar").on("swipe", function(event) {
            var d = event.direction;
            if (d === "left") {
                this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() + 1, 1);
                this._renderCalendar("left");                
            } else if (d === "right") {
                this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() - 1, 1);
                this._renderCalendar("right");                
            }         
        }.bind(this));
        this.$element.on("mousedown", ".next-month", function(event) {
            event.preventDefault();
            this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() + 1, 1);
            this._renderCalendar("left");
        }.bind(this));
        this.$element.on("mousedown", ".prev-month", function(event) {
            event.preventDefault();
            this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() - 1, 1);
            this._renderCalendar("right");
        }.bind(this));
        
    },
    
    defaults: {
        monthNames: null,
        dayNames: null,
        format: null,
        selectedDate: new Date(),
        startDay: 0,
        disabled: false
    },
    
    displayDate: null,
    pickerShown: false,
    
    _readFromMarkup: function() {
        if (this.$element.data("disabled")) this.options.disabled = true;
    },
    
    _updateState: function() {
        if (this.options.disabled) {
            this.$element.find("input,button").attr("disabled", "disabled");
            this._hidePicker();
        } else {
            this.$element.find("input,button").removeAttr("disabled");
        }
        if (!this.options.selectedDate || isNaN(this.options.selectedDate.getFullYear())) {
            this.$element.addClass("error");
        } else {
            this.$element.removeClass("error");            
        }
    },
    
    _keyPress: function() {
        if (!this.pickerShown) return;
        
        // TODO: Keyboard actions
    },
    
    _showPicker: function() {
        this._renderCalendar();
        var left = this.$element.find("button").position().left + this.$element.find("button").width() / 2 - (this.$element.find(".datepicker-calendar").width() / 2);
        var top = this.$element.find("button").position().top + this.$element.find("button").outerHeight() + 10;
        //if (left < 0) left = 0;
        this.$element.find(".datepicker-calendar").css(
                {"position": "absolute",
                 "left": left + "px",
                 "top": top + "px"}).show();
        
        this.pickerShown = true;
    },
    
    _hidePicker: function() {
        this.$element.find(".datepicker-calendar").hide();
        this.pickerShown = false;
    },
    
    _addMissingElements: function() {
        if (this.$element.find(".datepicker-calendar").length === 0) {
            this.$element.append('<div class="popover arrow-top datepicker-calendar" style="display:none"><div class="popover-header"></div><div class="popover-body"></div></div>');
        }
    },
    
    _renderCalendar: function(slide) {
        if (isNaN(this.displayDate.getFullYear())) {
            this.displayDate = new Date();
        }
        if (this.options.selectedDate && isNaN(this.options.selectedDate.getFullYear())) {
            this.options.selectedDate = null;
        }
        var displayYear = this.displayDate.getFullYear();
        var displayMonth = this.displayDate.getMonth() + 1;
        
        var monthName = this.options.monthNames[displayMonth - 1];
        var title = $('<div class="popover-header"><h2>' + monthName + " " + displayYear + '</h2></div>');
        
        // Month selection        
        var nextMonthElement = $("<button class=\"next-month\">›</button>");
        var prevMonthElement = $("<button class=\"prev-month\">‹</button>");
        
        title.append(nextMonthElement).append(prevMonthElement);
        
        var $calendar = this.$element.find(".datepicker-calendar");
        if ($calendar.find(".popover-header").length > 0) {
            $calendar.find(".popover-header").replaceWith(title);
        } else {
            $calendar.find(".datepicker-calendar").prepend(title);
        }
        
        var day = null;
        
        var table = $("<table>");
        table.data("date", displayYear + "-" + displayMonth);
        
        var html = "<tr>";
        for(var i = 0; i < 7; i++) {
            day = (i + this.options.startDay) % 7;
            var dayName = this.options.dayNames[day];
            html += "<td><span>" + dayName + "</span></td>";
        }
        html += "</tr>";
        table.append("<thead>" + html + "</thead>");
        
        var firstDate = new Date(displayYear, displayMonth - 1, 1);
        var monthStartsAt = (firstDate.getDay() - this.options.startDay) % 7;
        if (monthStartsAt < 0) monthStartsAt += 7;
        
        html = "";
        var today = new Date();
        for(var w = 0; w < 6; w++) {
            var displayDate = new Date(displayYear, displayMonth - 1, w * 7);
            html +="<tr>";
            for(var d = 0; d < 7; d++) {
                day = (w * 7 + d) - monthStartsAt + 1;
                displayDate = new Date(displayYear, displayMonth - 1, day);
                var isCurrentMonth = (displayDate.getMonth() + 1) === displayMonth;
                var cssClass = "";
                if (this._compareDates(displayDate, today) === 0) cssClass += " datepicker-today";
                if (this._compareDates(displayDate, this.options.selectedDate) === 0) cssClass += " datepicker-day-selected";
                if (cssClass) cssClass = "class=\"" + cssClass + "\"";
                if (isCurrentMonth) {
                    html += "<td " + cssClass + "><a href=\"#\" data-date=\"" + this._formatDate(displayDate) + "\">" + displayDate.getDate() + "</a></td>";            
                } else {
                    html += "<td " + cssClass + "><span>" + displayDate.getDate() + "</span></td>";
                }
            }
            html +="</tr>";
        }
        table.append("<tbody>" + html + "</tbody>");
        table.on("mousedown", "a", function(event) {
            event.preventDefault();
            this._gotoDate($(event.target).data("date"));
        }.bind(this));
        
        if ($calendar.find("table").length > 0 && slide) {
            this._slideCalendar($calendar.find("table"), table, (slide === "left"));
        } else {
            $calendar.find(".popover-body").find("table").remove();
            $calendar.find(".popover-body").find(".sliding-container").remove();
            $calendar.find(".popover-body").append(table);
        }

        this._updateState();
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
                   
        this.$element.find(".popover-body").append(container);
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
            this.$element.find(".popover-body").append(newtable);
            container.remove();
        }.bind(this));        
    },
    
    _compareDates: function(d1, d2) {
        if (!d1 || !d2) return false;
        if (d1.getFullYear() < d2.getFullYear()) return -1;
        if (d1.getFullYear() > d2.getFullYear()) return 1;
        if (d1.getMonth() < d2.getMonth()) return -1;
        if (d1.getMonth() > d2.getMonth()) return 1;
        if (d1.getDate() < d2.getDate()) return -1;
        if (d1.getDate() > d2.getDate()) return 1;
        return 0;
    },
    
    _gotoDate: function(dateString) {
        this.$element.find("input").val(dateString);
        this.options.selectedDate = this.displayDate = new Date(dateString);
        this._renderCalendar();
    },
    
    _formatDate: function(date) {        
        var rfn = {
            d: function(date) { return this._pad(date.getDate()); },
            j: function(date) { return date.getDate(); },
            w: function(date) { return date.getDay(); },
            m: function(date) { return this._pad(date.getMonth() + 1); },
            n: function(date) { return date.getMonth() + 1; },
            Y: function(date) { return date.getFullYear(); },
            y: function(date) { return ('' + date.getFullYear()).substr(2); },
            c: function(date) { return date.format("Y-m-d"); }
           
        };
        var fmt = this.options.format;
        var result = "";
        for(var i = 0; i < fmt.length; i++) {
            var t = fmt.charAt(i);
            if (rfn[t]) {
                result += (rfn[t].bind(this))(date);
            } else {
                result += t;
            }
        }
        
        return result;
    },
    
    
    _pad: function(s) {
        if (s < 10) return "0" + s;
        return s;
    }
    
  });
  
  CUI.Datepicker.monthNames = ["January", "February", "March", "April", "May", "Juni", "July", "August", "September", "October", "November", "December"];
  CUI.Datepicker.dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  CUI.Datepicker.format = "Y-m-d";

  CUI.util.plugClass(CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).ready(function() {
        $("[data-init=datepicker]").datepicker();
    });
  }  

}(window.jQuery));
