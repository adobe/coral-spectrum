

describe('CUI.NumberInput', function() {
                
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('NumberInput');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div>');
        expect(div).to.have.property('numberInput');
    });

    describe("API", function() {

      var html = '<div class="numberinput"><input type="text"></div>';

      it('#getStep should default to 1', function() {
        var element = new CUI.NumberInput({element: $(html)});
        expect(element).to.have.property('getStep');
        expect(element.getStep()).to.equal(1);
      });

      it('#getMax should default to NaN', function() {
        var element = new CUI.NumberInput({element: $(html)});
        expect(element).to.have.property('getMax');
        expect(element.getMax()).to.be.NaN;
      });

      it('#getMin should default to NaN', function() {
        var element = new CUI.NumberInput({element: $(html)});
        expect(element).to.have.property('getMin');
        expect(element.getMin()).to.be.NaN;
      });

      it('#getValue should default to 0', function() {
        var element = new CUI.NumberInput({element: $(html)});
        expect(element).to.have.property('getValue');
        expect(element.getValue()).to.equal(0);
      });

      it('#increment should increment value by step amount', function() {
        var element = new CUI.NumberInput({element: $(html)});
        expect(element).to.have.property('increment');
        element.increment();
        expect(element.getValue()).to.equal(1);
      });

      it('#decrement should decrement value by step amount', function() {
        var element = new CUI.NumberInput({element: $(html)});
        expect(element).to.have.property('decrement');
        element.decrement();
        expect(element.getValue()).to.equal(-1);
      });

      it('#setStep should change step amount', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setStep(5);
        element.increment();
        expect(element.getValue()).to.equal(5);
      });

      it('#setMin should set min value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        expect(element).to.have.property('setMin');
        element.setMin(3);
        expect(element.getMin()).to.equal(3);
      });

      it('#setMax should set max value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        expect(element).to.have.property('setMax');
        element.setMax(9);
        expect(element.getMax()).to.equal(9);
      });   

      it('#setValue should set widget value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        expect(element).to.have.property('setValue');
        element.setValue(9);
        expect(element.getValue()).to.equal(9);
      });      

      it('#increment should respect max value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setMax(1);
        element.increment();
        element.increment();
        expect(element.getValue()).to.equal(1);
      });     

      it('#decrement should respect min value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setMin(-1);
        element.decrement();
        element.decrement();
        expect(element.getValue()).to.equal(-1);
      });   

      it('#setValue should respect max value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setMax(3);
        element.setValue(100);
        expect(element.getValue()).to.equal(3);
      });     

      it('#setValue should respect min value', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setMin(-12);
        element.setValue(-99);
        expect(element.getValue()).to.equal(-12);
      });    

      it('#setValue should set NaN if input cannot be parsed to number', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setValue(99);
        expect(element.getValue()).to.equal(99);
        element.setValue("cats");
        expect(element.getValue()).to.be.NaN;
      });   

      it('#setStep is ignored if input cannot be parsed to number', function() {
        var element = new CUI.NumberInput({element: $(html)}); 
        element.setStep(99);
        expect(element.getStep()).to.equal(99);
        element.setStep("cats");
        expect(element.getStep()).to.equal(99);
      }); 


      it('#set hasError to true should toggle error state', function() {
          var element = new CUI.NumberInput({element: $(html)});
          expect(element.$element).to.not.have.class('error');
          element.set('hasError', true);
          expect(element.$element).to.have.class('error');
      });

      it('#set disabled to true should toggle disabled state', function() {
          var element = new CUI.NumberInput({element: $(html)});
          expect(element.$input).to.not.have.attr('disabled');
          expect(element.$incrementElement).to.not.have.attr('disabled');
          expect(element.$decrementElement).to.not.have.attr('disabled');
          expect(element.$input).to.not.have.attr('disabled');
          element.set('disabled', true);
          expect(element.$input).to.have.attr('disabled');
          expect(element.$incrementElement).to.have.attr('disabled');
          expect(element.$decrementElement).to.have.attr('disabled');
      });

    }); // describe API

    describe("from markup", function() {

        var buildElement = function() {
          return $('<div><button type="button">decrement</button><input type="text"><button type="button">increment</button></div>').numberInput();
        }

        var clickDecrement = function(element, count) {
          var buttons = element.find('button');
          var decrement = buttons[0];
          clickButtonRepeatedly(decrement, count);
        }

        var clickIncrement = function(element, count) {
          var buttons = element.find('button');
          var increment = buttons[1];
          clickButtonRepeatedly(increment, count);
        }

        var clickButtonRepeatedly = function(button, count) {
          count = count || 1;
          while (count > 0) {
            $(button).trigger('click');
            count--;
          }
        }

        it('container should be a numberinput', function() {
            var element = buildElement();
            expect(element).to.have.class("numberinput");
        });

        it('should change input type to text', function() {
            var element = $('<div><input type="number"></div>').numberInput();;
            expect(element.find('input').attr('type')).to.equal('text');
        });

        it('should set input type to text if missing', function() {
            var element = $('<div><input></div>').numberInput();
            expect(element.find('input').attr('type')).to.equal('text');
        });

        it('should create buttons if they are missing', function() {
            var element = $('<div><input></div>').numberInput();
            var buttons = element.find('button');
            expect(buttons.length).to.be(2);
            expect($(buttons[0])).to.have.class('decrement');
            expect($(buttons[1])).to.have.class('increment');
        });

        it('should make buttons type button', function() {
            var element = $('<div><button>up</button><input><button>down</button></div>').numberInput();
            var buttons = element.find('button');
            expect($(buttons[0]).attr('type')).to.be('button');
            expect($(buttons[0]).attr('type')).to.be('button');
        });

        it('should have default value of 0', function() {
            var element = buildElement();
            expect(element.find('input').val()).to.equal('0');
        });

        it('should add decrement and increment buttons', function() {
            var element = buildElement();
            var buttons = element.find('button');
            expect(buttons).to.exist;
            expect(buttons.length).to.be(2);
            var decrement = buttons[0];
            expect($(decrement).attr('class')).to.equal('decrement');
            var increment = buttons[1];
            expect($(increment).attr('class')).to.equal('increment');
        });

        it('should have default step value of 1', function() {
            var element = buildElement();
            var buttons = element.find('button');
            var increment = buttons[1];
            $(increment).click();
            expect(element.find('input').val()).to.equal('1');
        });

        it('should set step value with attribute', function() {
            var html = 
                '<div><button type="button">increment</button><input type="text" step="3"><button type="button">decrement</button></div>'; 
            var element = $(html).numberInput();
            clickIncrement(element)
            expect(element.find('input').val()).to.equal('3');
        });

        it('should ignore step attribute if it cannot be parsed to number', function() {
            var html = 
                '<div><input type="numberinput" step="cats"></div>'; 
            var element = $(html).numberInput();
            clickIncrement(element)
            expect(element.find('input').val()).to.equal('1');
        });

        it('should set value with attribute', function() {
            var html = 
                '<div><button type="button">decrement</button><input type="text" value="3"><button type="button">increment</button></div>'; 
            var element = $(html).numberInput();
            expect(element.find('input').val()).to.equal('3');
        });

        it('should set min value with attribute', function() {
            var html = 
                '<div><input type="text" min="-3"></div>'; 
            var element = $(html).numberInput();
            clickDecrement(element, 5);
            expect(element.find('input').val()).to.equal('-3');
        });

        it('should set max value with attribute', function() {
            var html = 
                '<div><input type="text" max="3"></div>'; 
            var element = $(html).numberInput();
            clickIncrement(element, 5);
            expect(element.find('input').val()).to.equal('3');
        });

        it('should set NaN for value if input cannot be parsed to number', function() {
            var element = buildElement();
            var input = element.find('input');
            input.val('cheezburger');
            expect(input.val()).to.be.NaN;
        });


    });

});