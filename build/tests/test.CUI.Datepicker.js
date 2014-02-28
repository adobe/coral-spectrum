describe('CUI.Datepicker', function() {


    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Datepicker');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('datepicker');
    });

    describe("from markup", function() {
        it('should be a datepicker', function() {
            var html =
                '<div><input type="date" value="2012-01-01"></div>';
            var el = $(html).datepicker();

            expect(el).to.have.class("datepicker");
        });
    });

    describe("with different date formats", function() {
        var html =
            '<div data-stored-format="DD..MM..YYYY" data-displayed-format="DD MM YYYY"><input type="date" name="date_name" value="01..02..2012"></div>';
        var el = $(html).datepicker();
        $("body").append(el);

        it('should respect the stored and display format', function() {
            expect(el.find("input:not([type=hidden])").val()).to.equal("01 02 2012");
            expect(el.find("input[type=hidden]").val()).to.equal("01..02..2012");
        });

        it('should send the stored format with the form', function() {
            // Name attribute has to move to the hidden field
            expect(el.find("input[type=hidden]").attr("name")).to.equal("date_name");
            expect(el.find("input:not([type=hidden])").attr("name")).to.equal(undefined);
        });

        it('should work correct for wrong formatted strings', function() {
            var html =
                '<div data-stored-format="DD..MM..YYYY" data-displayed-format="YYYY-MM-DD"><input type="date" name="date_name" value="2012-02-01"></div>';
            var el = $(html).datepicker();
            $("body").append(el);

            // Name attribute has to move to the hidden field
            expect(el.find("input:not([type=hidden])").val()).to.equal("2012-02-01");
            expect(el.find("input[type=hidden]").val()).to.equal("01..02..2012");
        });
    });

    describe("with different week configurations", function() {
          var html = '<div data-init="datepicker" data-displayed-format="DD. MM. YYYY" data-start-day="2"><input type="date" value="29 November 2012" name="date1"></div>';
          var el = $(html).datepicker();
          $("body").append(el);

          it('should open a picker with configured day as first day of week', function(done) {
            el.find("button").click();
            // Run a-sync, for the click handler has a work-around in place that delays the
            // spawning of the actual pop-up:
            setTimeout(function() {
                expect($("body").find("#popguid2.coral-Popover").find(".coral-DatePicker-calendarBody table tr th:eq(0)").text()).to.equal("Tu");
                done();
              }, 200);
          });
    });

    describe("as a time field", function() {
          var html = '<div data-init="datepicker"><input type="time" value="20:15"/></div>';
          var el = $(html).datepicker();
          $("body").append(el);


          it('should not have a calendar popup', function(done) {
            el.find("button").click();
            // Run a-sync, for the click handler has a work-around in place that delays the
            // spawning of the actual pop-up:
            setTimeout(function() {
                expect($("body").find("#popguid3.coral-Popover").find(".coral-DatePicker-calendarBody").length).to.equal(0);
                done();
              }, 200);
          });
    });

    describe("with empty value", function () {
          var html = '<div data-stored-format="DD..MM..YYYY" data-displayed-format="DD MM YYYY"></div>';
          var el = $(html).datepicker();

          it('should have no errors when no value is set', function () {
            expect(el.find("input:not([type=hidden])").val()).to.equal("");
            expect(el.hasClass("is-invalid")).to.false;

            expect(el.find("input[type=hidden]").val()).to.equal("");

            // set a valid date
            el.data("datepicker").$input.val("01 02 2012").change();

            expect(el.find("input:not([type=hidden])").val()).to.equal("01 02 2012");
            expect(el.find("input[type=hidden]").val()).to.equal("01..02..2012");
            expect(el.hasClass("is-invalid")).to.false;

            // set a invalid date
            el.data("datepicker").$input.val("xx xx xxxx").change();

            expect(el.find("input:not([type=hidden])").val()).to.equal("xx xx xxxx");
            expect(el.find("input[type=hidden]").val()).to.equal("");
            expect(el.hasClass("is-invalid")).to.true;

            // clear value which should remove error class
            el.data("datepicker").$input.val("").change();

            expect(el.find("input:not([type=hidden])").val()).to.equal("");
            expect(el.find("input[type=hidden]").val()).to.equal("");
            expect(el.hasClass("is-invalid")).to.false;
          });
    });

});
