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
            this.displayDate = new Date(this.$element.find("input").val()); 
            this._showPicker();
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
        currentDate: new Date(),
        startDay: 1
    },
    
    displayDate: null,
    
    _showPicker: function() {
        this._renderCalendar();
        this.$element.find(".datepicker-calendar").show();
        
    },
    
    _hidePicker: function() {
        this.$element.find(".datepicker-calendar").hide();
    
    },
    
    _addMissingElements: function() {
        if (this.$element.find(".datepicker-calendar").length === 0) {
            this.$element.append('<div class="popover arrow-top datepicker-calendar" style="display:none"><div class="popover-inner"></div></div>');
        }
    },
    
    _renderCalendar: function() {
        if (this.displayDate === null) this.displayDate = this.options.currentDate;
        
        var displayYear = this.displayDate.getFullYear();
        var displayMonth = this.displayDate.getMonth() + 1;
        
        var monthName = this.options.monthNames[displayMonth - 1];
        var title = $('<div class="popover-heading">' + monthName + " " + displayYear + '</div>');
        
        // Month selection
        var nextMonthElement = $("<span>&gt;</span>").on("click", function() {
            this.displayDate = new Date(displayYear, displayMonth - 1 + 1, 1);
            this._renderCalendar();
        }.bind(this));
        var prevMonthElement = $("<span>&lt;</span>").on("click", function() {
            this.displayDate = new Date(displayYear, displayMonth - 1 - 1, 1);
            this._renderCalendar();
        }.bind(this));
        
        title.append(prevMonthElement).append(nextMonthElement);
        
        var $calendar = this.$element.find(".datepicker-calendar");
        $calendar.empty().append(title);
        
        var day = null;
        
        var table = $("<table>");
        var html = "<tr>";
        for(var i = 0; i < 7; i++) {
            day = (i + this.options.startDay) % 7;
            var dayName = this.options.dayNames[day];
            html += "<td>" + dayName.substr(0, 3) + "</td>";
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
                var cssClass = (displayDate.getMonth() + 1 !== displayMonth) ? "class=\"dimmed\"" : "";
                html += "<td " + cssClass + "><a href=\"#\" data-date=\"" + this._formatDate(displayDate) + "\">" + displayDate.getDate() + "</a></td>";
            }
            html +="</tr>";
        }
        table.append("<tbody>" + html + "</tbody>");
        table.on("click", "a", function(event) {
            this._gotoDate($(event.target).data("date"));
        }.bind(this));
        $calendar.append(table);
        
    },
    
    _gotoDate: function(dateString) {
        this.$element.find("input").val(dateString);
    },
    
    _formatDate: function(date) {
        var d = new Date();
        return (date.getFullYear() + "-" + this._pad(date.getMonth() + 1) + "-" + this._pad(date.getDate()));
    },
    _pad: function(s) {
        if (s < 10) return "0" + s;
        return s;
    }
    
  });
  
  CUI.Datepicker.monthNames = ["January", "February", "March", "April", "May", "Juni", "July", "August", "September", "October", "November", "December"];
  CUI.Datepicker.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  CUI.Datepicker.format = "Y-m-d";

  CUI.util.plugClass(CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).ready(function() {
        $("[data-init=datepicker]").datepicker();
    });
  }  

}(window.jQuery));
