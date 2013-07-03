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
    
    describe("with differente date formats", function() {
        var html = 
            '<div data-stored-format="DD..MM..YYYY" data-displayed-format="DD MM YYYY"><input type="date" name="date_name" value="01..02..2012"></div>'; 
        var el = $(html).datepicker();
        $("body").append(el);

        it('should respect the stored and display format', function() {    
            expect(el.find("input[type=text]").val()).to.equal("01 02 2012");
            expect(el.find("input[type=hidden]").val()).to.equal("01..02..2012");
        });

        it('should send the stored format with the form', function() {
            // Name attribute has to move to the hidden field
            expect(el.find("input[type=hidden]").attr("name")).to.equal("date_name");
            expect(el.find("input[type=texte]").attr("name")).to.equal(undefined);            
        });
        
        it('should work correct for wrong formatted strings', function() {
            var html = 
                '<div data-stored-format="DD..MM..YYYY" data-displayed-format="YYYY-MM-DD"><input type="date" name="date_name" value="2012-02-01"></div>'; 
            var el = $(html).datepicker();
            $("body").append(el);

            // Name attribute has to move to the hidden field
            expect(el.find("input[type=text]").val()).to.equal("2012-02-01");
            expect(el.find("input[type=hidden]").val()).to.equal("01..02..2012");           
        });             
    });
    
    describe("with different week configurations", function() {
          var html = '<div data-init="datepicker" data-displayed-format="DD. MM. YYYY" data-start-day="2"><input type="date" value="29 November 2012" name="date1"></div>';
          var el = $(html).datepicker();
          $("body").append(el);
          
          it('should open a picker with configured day as first day of week', function() {
                el.find("button").click();
                expect(el.find(".calendar-body table tr th:eq(0)").text()).to.equal("Tu");
          });          
          
    });

    describe("as a time field", function() {
          var html = '<div data-init="datepicker"><input type="time" value="20:15"></div>';
          var el = $(html).datepicker();
          $("body").append(el);
          
          it('should not have a calendar popup', function() {
                el.find("button").click();
                expect(el.find(".calendar-body").length).to.equal(0);
          });
    });  
      
});
