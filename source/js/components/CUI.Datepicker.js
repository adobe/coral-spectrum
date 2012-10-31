(function($) {
  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A date picker widget
      
    */
    construct: function(options) {
        this.options.monthNames = this.options.monthNames || CUI.Datepicker.monthNames;
        this.options.dayNames = this.options.dayNames || CUI.Datepicker.dayNames;
        this.options.format = this.options.format || CUI.Datepicker.format;

        this._addMissingElements();

        this.$element.on("click", function() {
            this.$element.find("input").focus();
        }.bind(this));
        
        var timeout = null;
        this.$element.on("focus", "input", function() {
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
            this.displayDate = this.options.selectedDate = new Date(this.$element.find("input").val());
            this._renderCalendar();
        }.bind(this));
        
        this.$element.on("blur", "input", function() {
            timeout = setTimeout(function() {
                timeout = null;
                this._hidePicker();
            }.bind(this), 200);
            
        }.bind(this));  
    },
    
    defaults: {
        monthNames: null,
        dayNames: null,
        format: null,
        selectedDate: new Date(),
        startDay: 0
    },
    
    displayDate: null,
    pickerShown: false,
    
    _keyPress: function() {
        if (!this.pickerShown) return;
        
        // TODO: Keyboard actions
    },
    
    _showPicker: function() {
        this._renderCalendar();
        this.$element.find(".datepicker-calendar").show();
        this.pickerShown = true;
    },
    
    _hidePicker: function() {
        this.$element.find(".datepicker-calendar").hide();
        this.pickerShown = false;
    },
    
    _addMissingElements: function() {
        if (this.$element.find(".datepicker-calendar").length === 0) {
            this.$element.append('<div class="popover arrow-top datepicker-calendar" style="display:none"><div class="popover-inner"></div></div>');
        }
    },
    
    _renderCalendar: function() {
        if (isNaN(this.displayDate.getFullYear())) {
            this.displayDate = new Date();
        }
        if (this.options.selectedDate && isNaN(this.options.selectedDate.getFullYear())) {
            this.options.selectedDate = null;
        }
        var displayYear = this.displayDate.getFullYear();
        var displayMonth = this.displayDate.getMonth() + 1;
        
        var monthName = this.options.monthNames[displayMonth - 1];
        var title = $('<div class="popover-heading">' + monthName + " " + displayYear + '</div>');
        
        // Month selection        
        var nextMonthElement = $("<button class=\"next-month\">›</button>").on("mousedown", function(event) {
            event.preventDefault();
            this.displayDate = new Date(displayYear, displayMonth - 1 + 1, 1);
            this._renderCalendar();
        }.bind(this));
        var prevMonthElement = $("<button class=\"prev-month\">‹</button>").on("mousedown", function(event) {
            event.preventDefault();
            this.displayDate = new Date(displayYear, displayMonth - 1 - 1, 1);
            this._renderCalendar();
        }.bind(this));
        
        title.append(nextMonthElement).append(prevMonthElement);
        
        var $calendar = this.$element.find(".datepicker-calendar");
        $calendar.empty().append(title);
        
        var day = null;
        
        var table = $("<table>");
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
        for(var w = 0; w < 6; w++) {
            var displayDate = new Date(displayYear, displayMonth - 1, w * 7);
            html +="<tr>";
            for(var d = 0; d < 7; d++) {
                day = (w * 7 + d) - monthStartsAt + 1;
                displayDate = new Date(displayYear, displayMonth - 1, day);
                var isCurrentMonth = (displayDate.getMonth() + 1) === displayMonth;
                var cssClass = "";
                if (this._compareDates(displayDate, this.options.selectedDate) === 0) cssClass += " day-selected";
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
        $calendar.append(table);
        
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
