describe('Coral.Autocomplete', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Autocomplete');
    });

    it('should define a special event for coralinternalinput', function() {
      expect($.event.special.coralinternalinput).not.to.be.undefined;
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Autocomplete.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var el = new Coral.Autocomplete();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });

    it('should not die when setting markup from attributes', function(done) {
      expect(function() {
        helpers.build(window.__html__['Coral.Autocomplete.value.html'], function(el) {
          done();
        });
      }).to.not.throw(Error);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function(done) {
      el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);
      Coral.commons.ready(el, function(){
        helpers.next(function() {
          done();
        });
      });
    });

    afterEach(function() {
      el = null;
    });

    describe('#name', function() {
      it('should default to empty string', function() {
        expect(el.name).to.equal('');
      });

      it('should set field name when name set', function() {
        el.name = 'abc';
        expect(el.name).to.equal('abc');
        expect(el.getAttribute('name')).to.equal('abc');
      });
    });

    describe('#multiple', function() {
      it('should default to false', function() {
        expect(el.multiple).to.be.false;
      });
    });

    describe('#forceSelection', function() {
      it('should default to false', function() {
        expect(el.forceSelection).to.be.false;
      });
    });

    describe('#delay', function() {
      it('should default to 200', function() {
        // we create a new instance since the global one sets delay to 0
        el = new Coral.Autocomplete();

        expect(el.delay).to.equal(200);
      });
    });

    describe('#value', function() {
      it('should default to empty string', function() {
        expect(el.value).to.equal('');
      });

      it('should set field value and select items when value set', function() {
        el.value = 'abc';

        expect(el.value).to.equal('abc');

        expect(el.values.length).to.equal(1);
        expect(el.values[0]).to.equal('abc');
      });
    });

    describe('#values', function() {
      it('should default to empty array', function() {
        expect(el.values).to.deep.equal([]);
      });

      it('should add tags and select items when values set', function() {
        el.multiple = true;
        expect(el.values.length).to.equal(0);

        el.values = ['abc', 'def'];

        expect(el.value).to.equal('abc');
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('abc');
        expect(el.values[1]).to.equal('def');
      });

      it('should remove values when a tag is removed', function(done) {
        el.multiple = true;
        expect(el.values.length).to.equal(0);

        el.values = ['abc', 'def'];

        expect(el.value).to.equal('abc');
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('abc');
        expect(el.values[1]).to.equal('def');

        helpers.next(function() {
          // Find the first tag
          var tag = el.querySelector('coral-tag');
          tag.querySelector('.coral-Tag-removeButton').click();

          helpers.next(function() {

            // The first tag should be removed
            expect(el.values.length).to.equal(1);
            expect(el.values[0]).to.equal('def');

            done();
          });
        });
      });
    });

    describe('#placeholder', function() {
      it('should default to empty string', function() {
        expect(el.placeholder).to.equal('');
      });

      it('should set field placeholder', function(done) {
        el.placeholder = 'abc';
        helpers.next(function() {
          expect(el.placeholder).to.equal('abc');
          // get attribute as the placeholder property is not available in IE9
          expect(el._elements.input.getAttribute('placeholder')).to.equal('abc');
          done();
        });
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(el.icon).to.equal('');
      });

      it('should set icon', function() {
        el.icon = 'search';
        expect(el._elements.icon.icon).to.equal('search');
      });

      it('should hide icon when not set', function() {
        el.icon = '';
        expect(el._elements.icon.hidden).to.equal(true);
      });
    });

    it('#clear() should clear the value', function() {
      el.value = 'Hello!';

      el.clear();

      expect(el.value).to.equal('');
      expect(el.values).to.be.instanceof(Array);
      expect(el.values.length).to.equal(1);
      expect(el.values[0]).to.equal('');
    });
  });

  describe('Events', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#coral-autocomplete:showsuggestions', function() {
      it('should support "remote" suggestions with coral-autocomplete:showsuggestions', function() {
        var spy = sinon.spy();

        el.on('coral-autocomplete:showsuggestions', function(event) {
          spy();

          // Don't show suggestions from existing items
          // This shows a loading icon until we call addSuggestions
          event.preventDefault();

          // Add suggestions
          el.addSuggestions([
            {
              value: 'sa',
              content: 'Safari'
            }
          ]);
        });

        // Trigger input event
        el._elements.$input.val('sa').trigger('input');

        expect(spy.callCount).to.equal(1, 'spy should be called');
        expect(el._elements.selectList.items.length).to.equal(1, 'should have a single SelectList item');
        expect(el._elements.selectList.items.getAll()[0].value).to.equal('sa', 'SelectList item should represent remote suggestion');
      });

      it('should add items to the collection when selection from suggestions added with addSuggestions()', function() {
        el.on('coral-autocomplete:showsuggestions', function(event) {
          // Don't show suggestions from existing items
          // This shows a loading icon until we call addSuggestions
          event.preventDefault();

          // Add suggestions
          el.addSuggestions([
            {
              value: 'sa',
              content: 'Safari'
            }
          ]);
        });

        // Trigger input event
        el._elements.$input.val('sa').trigger('input');

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].click();

        // Value should be correct
        expect(el.value).to.equal('sa', 'value should be set from SelectList item click');
        expect(el._elements.input.value).to.equal('Safari', 'displayed value for input should be correct from item click');

        // Item should be present in collection
        expect(el.items.length).to.equal(1, 'should have a single Autocomplete item');
        expect(el.items.getAll()[0].value).to.equal('sa', 'Autocomplete item should represent the clicked SelectList item');
      });

    });

    describe('#change', function() {
      it('should trigger change events when an item is selected inside of the SelectList', function(done) {
        var spy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        var firefox = el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        var handleChange = function(event) {
          expect(el.value).to.equal(firefox.value);
          spy.call(spy, this.arguments);
        };

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Trigger input event
          el._elements.$input.val('fi').trigger('input');

          // Click the suggestion
          el._elements.selectList.items.getAll()[0].click();

          expect(spy.callCount).to.equal(1, 'call count after selecting item');

          // Remove event listener to prevent blur event problems
          el.off('change', handleChange);

          done();
        });
      });

      it('should trigger change events when an item is selected by exact match keyboard entry', function(done) {
        var spy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        var firefox = el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        var handleChange = function(event) {
          expect(el.value).to.equal(firefox.value);
          spy.apply(spy, arguments);
        };

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'firefox';

          // Hit enter
          helpers.keypress('enter', el._elements.input);

          helpers.next(function() {
            expect(spy.callCount).to.equal(1, 'call count after hitting enter on exact match');

            // Remove event listener to prevent blur event problems
            el.off('change', handleChange);

            done();
          });
        });
      });

      it('should trigger a change event when the input is cleared', function(done) {
        el.multiple = false;

        var changeSpy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          },
          selected: true
        });

        el.on('change', changeSpy);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('fi', 'value should be firefox');

          // Clear the input text and trigger events
          el._elements.$input.val('').trigger('input');
          el._handleInput({preventDefault:function(){}}); // Fake call..
          el._onInputChange({stopPropagation:function(){}}); // Fake call..;

          // Wait for mutation observers to pick up items
          helpers.next(function() {
            expect(el.value).to.equal('', 'value should be empty');
            expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
            expect(el._elements.input.value).to.equal('', 'el._elements.input.value should now contain ""');

            // Remove event listener to prevent blur event problems
            el.off('change', changeSpy);

            done();
          });
        });
      });

      it('should trigger change events when an item is selected by non-matching keyboard entry', function(done) {
        var spy = sinon.spy();
        var handleChange = function(event) {
          expect(el.value).to.equal('stuff');
          spy.apply(spy, arguments);
        };

        el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'stuff';

          // Hit enter
          helpers.keypress('enter', el._elements.input);

          helpers.next(function() {
            expect(spy.callCount).to.equal(1, 'call count after hitting enter on non-matching entry');

            // Remove event listener to prevent blur event problems
            el.off('change', handleChange);

            done();
          });
        });
      });

      it('should not trigger two change events when an item is selected and then component lost focus', function(done) {
        var spy = sinon.spy();

        el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        var firefox = el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        var handleChange = function(event) {
          expect(el.value).to.equal(firefox.value);
          spy.apply(spy, arguments);
        };

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'firefox';

          // Hit enter
          helpers.keypress('enter', el._elements.input);
          // Lose focus
          el.trigger('blur');

          helpers.next(function() {
            expect(spy.callCount).to.equal(1, 'call count after losing focus on component');

            // Remove event listener to prevent blur event problems
            el.off('change', handleChange);

            done();
          });
        });
      });

      it('should not trigger two change events when an item is selected by non-matching keyboard entry and then component lost focus', function(done) {
        var spy = sinon.spy();
        var handleChange = function(event) {
          expect(el.value).to.equal('stuff');
          spy.apply(spy, arguments);
        };

        el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        el.on('change', handleChange);

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          // Add some text
          el._elements.input.value = 'stuff';

          // Hit enter
          helpers.keypress('enter', el._elements.input);

          // Lost focus
          el.trigger('blur');

          helpers.next(function() {
            expect(spy.callCount).to.equal(1, 'call count after hitting enter on non-matching entry');

            // Remove event listener to prevent blur event problems
            el.off('change', handleChange);

            done();
          });
        });
      });

      it('should trigger change events when a tag is removed after a user interaction', function(done) {
        helpers.next(function() {
          el.multiple = true;
          expect(el.values.length).to.equal(0);

          var tagList = el.querySelector('coral-taglist');

          el.values = ['abc'];

          expect(el.value).to.equal('abc');
          expect(el.values.length).to.equal(1);
          expect(el.values[0]).to.equal('abc');
          expect(tagList.items.length).to.equal(1, 'TagList should have 1 item after values set');

          var spy = sinon.spy();
          el.on('change', spy);

          helpers.next(function() {
            expect(tagList.items.length).to.equal(1, 'TagList should have 1 item after a frame');

            // Find the first tag
            var tag = el.querySelector('coral-tag');
            var button = tag.querySelector('.coral-Tag-removeButton');

            button.click();

            helpers.next(function() {
              expect(tagList.items.length).to.equal(0, 'TagList should have 0 item after a frame');
              expect(spy.callCount).to.equal(1, 'Change spy should have been called once');
              done();
            });
          });
        });
      });
    });

    describe('#coralui-autocomplete-item:_valuechanged', function() {
      it('should not be propagated on value change', function(done) {
        var spy = sinon.spy();

        var chrome = el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        // listen to event on chrome. This should not be executed
        el.on('coralui-autocomplete-item:_valuechanged', spy);

        // wait for items to be picked up
        helpers.next(function() {
          // change value of an item
          chrome.value = 'chr';

          // wait for mutation observer events to propagate
          helpers.next(function() {
            var option = el._options[0];
            expect(chrome.value).to.equal(option.value);

            expect(spy.callCount).to.equal(0, 'call count after value change is triggered');

            done();
          });
        });
      });
    });

    describe('#coralui-autocomplete-item:_contentchanged', function() {
      it('should not be propagated', function(done) {
        var spy = sinon.spy();

        var chrome = el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        // listen event on chrome. This should not be executed
        el.on('coralui-autocomplete-item:_contentchanged', spy);

        // wait for items to be picked up
        helpers.next(function() {
          // change content of an item
          chrome.innerHTML = 'Chromium';

          // wait for mutation observer events to propagate
          helpers.next(function() {
            var option = el._options[0];
            expect(chrome.innerHTML).to.equal(option.content);

            expect(spy.callCount).to.equal(0, 'call count after value change is triggered');

            done();
          });
        });
      });
    });

    describe('#coralui-autocomplete-item:_selectedchanged', function() {
      it('should not be propagated', function(done) {
        var spy = sinon.spy();

        var chrome = el.items.add({
          value: 'ch',
          content: {
            innerHTML: 'Chrome'
          }
        });

        el.items.add({
          value: 'fi',
          content: {
            innerHTML: 'Firefox'
          }
        });

        // listen event on chrome. This should not be executed
        el.on('coralui-autocomplete-item:_selectedchanged', spy);

        // wait for items to be picked up
        helpers.next(function() {
          expect(el.values.length).to.equal(0, 'Nothing is selected');
          expect(el.value).to.be.empty;

          // select chrome
          chrome.selected = true;

          // Wait for event propogation
          helpers.next(function() {
            expect(el.values.length).to.equal(1, 'Chrome is selected');
            expect(el.value).to.equal(chrome.value);

            expect(spy.callCount).to.equal(0, 'call count after value change is triggered');

            done();
          });
        });
      });
    });
  });

  describe('User Interaction', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });


    it('should clear the input field after valid selection in multiselect mode', function(done) {
      el.multiple = true;

      var spy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      var firefox = el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      var handleChange = function(event) {
        expect(el.value).to.equal(firefox.value);
        spy.call(spy, this.arguments);
      };

      el.on('change', handleChange);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.$input.val('Fi').trigger('input');

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].click();

        expect(spy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('', 'el._elements.input.value should be reset to an empty string');

        // Remove event listener to prevent blur event problems
        el.off('change', handleChange);

        done();
      });
    });

    it('should be possible to deselect an item by setting an incomplete text in the input in single select mode (if forceSelection === true)', function(done) {
      el.multiple = false;
      el.forceSelection = true;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.$input.val('Fi').trigger('input');

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].click();

        expect(el.value).to.equal('fi', 'value should now be firefox');
        expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('Firefox', 'el._elements.input.value should now contain "Firefox"');

        // Set an incomplete text and fire input event
        // As on input change is somehow not called by triggering the 'input' event we fake the call..
        el._elements.$input.val('Firef').trigger('input');
        el._handleInput({preventDefault:function(){}}); // Fake call..
        el._onInputChange({stopPropagation:function(){}}); // Fake call..

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('', 'value should now be empty again');
          // CUI-5533 Another change event should be trigger when cleared
          expect(changeSpy.callCount).to.equal(2, 'call count after selecting item');
          expect(el._elements.input.value).to.equal('Firef', 'el._elements.input.value should now contain "Firef"');

          // Remove event listener to prevent blur event problems
          el.off('change', changeSpy);

          done();
        });

      });
    });

    it('should not be possible to deselect an item by setting an incomplete text in the input in single select mode (if forceSelection === false)', function(done) {
      el.multiple = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.$input.val('Fi').trigger('input');

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].click();

        expect(el.value).to.equal('fi', 'value should now be firefox');
        expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('Firefox', 'el._elements.input.value should now contain "Firefox"');

        // Set an incomplete text and fire input event
        // As on input change is somehow not called by triggering the 'input' event we fake the call..
        el._elements.$input.val('Firef').trigger('input');
        el._handleInput({preventDefault:function(){}}); // Fake call..
        el._onInputChange({stopPropagation:function(){}}); // Fake call..

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('Firef', 'value should be "Firef"');
          expect(changeSpy.callCount).to.equal(2, 'call count after selecting item');
          expect(el._elements.input.value).to.equal('Firef', 'el._elements.input.value should now contain "Firef"');

          // Remove event listener to prevent blur event problems
          el.off('change', changeSpy);

          done();
        });

      });
    });

    it('should be possible to deselect an item by setting an empty text in the input in single select mode (if forceSelection === false)', function(done) {
      el.multiple = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Trigger input event
        el._elements.$input.val('Fi').trigger('input');

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].click();

        expect(el.value).to.equal('fi', 'value should now be firefox');
        expect(changeSpy.callCount).to.equal(1, 'call count after selecting item');
        expect(el._elements.input.value).to.equal('Firefox', 'el._elements.input.value should now contain "Firefox"');

        // Set an incomplete text and fire input event
        // As on input change is somehow not called by triggering the 'input' event we fake the call..
        el._elements.$input.val('').trigger('input');
        el._handleInput({preventDefault:function(){}}); // Fake call..
        el._onInputChange({stopPropagation:function(){}}); // Fake call..

        // Wait for mutation observers to pick up items
        helpers.next(function() {
          expect(el.value).to.equal('', 'value should be "Firef"');
          // CUI-5533 Another change event should be trigger when cleared
          expect(changeSpy.callCount).to.equal(2, 'call count after selecting item');
          expect(el._elements.input.value).to.equal('', 'el._elements.input.value should now contain ""');

          // Remove event listener to prevent blur event problems
          el.off('change', changeSpy);

          done();
        });

      });
    });

    it('should be possible to change the value by setting an any text in the input in multi select mode (if forceSelection === false)', function(done) {
      el.multiple = true;
      el.forceSelection = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Add some text
        el._elements.input.value = 'anything';

        // Hit enter
        helpers.keypress('enter', el._elements.input);

        expect(el.value).to.equal('anything', 'value should be "anything"');

        done();
      });
    });

    it('should be possible to change the value by setting any text and empty text in the input in single select mode (if forceSelection === false)', function(done) {
      el.multiple = false;
      el.forceSelection = false;

      var changeSpy = sinon.spy();

      el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });

      el.on('change', changeSpy);

      // Wait for mutation observers to pick up items
      helpers.next(function() {
        // Add some text
        el._elements.input.value = 'anything';

        // Hit enter
        helpers.keypress('enter', el._elements.input);

        expect(el.value).to.equal('anything', 'value should be "anything"');

        helpers.next(function() {
          // Set empty text
          el._elements.input.value = '';

          // Hit enter
          helpers.keypress('enter', el._elements.input);

          expect(el.value).to.equal('', 'value should be ""');

          done();
        });
      });
    });

  });

  describe('Implementation Details', function() {

    it('should allow items to be added and selected before appending to the DOM', function(done) {
      var autocomplete = new Coral.Autocomplete().set({
        placeholder: 'Enter a word',
        match: 'startswith'
      });
      var chrome = autocomplete.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });
      var firefox = autocomplete.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        }
      });
      var ie = autocomplete.items.add({
        value: 'ie',
        content: {
          innerHTML: 'Internet Explorer'
        }
      });
      var safari = autocomplete.items.add({
        value: 'sa',
        content: {
          innerHTML: 'Safari'
        }
      });
      autocomplete.multiple = true;
      autocomplete.values = ['sa', 'fi'];
      helpers.target.appendChild(autocomplete);

      helpers.next(function() {
        // Ensure autocomplete API is updated
        expect(autocomplete.values).to.include('fi');
        expect(autocomplete.values).to.include('sa');

        // Ensure item API is updated
        expect(firefox.hasAttribute('selected')).to.equal(true, 'firefox should be selected');
        expect(safari.hasAttribute('selected')).to.equal(true, 'safari should be selected');
        expect(ie.hasAttribute('selected')).to.equal(false, 'ie should not be selected');
        expect(chrome.hasAttribute('selected')).to.equal(false, 'chrome should not be selected');

        done();
      });
    });

    it('should deselect other items when an item is selected', function(done) {
      var el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var chrome = el.items.add({
        value: 'ch',
        content: {
          innerHTML: 'Chrome'
        }
      });

      var firefox = el.items.add({
        value: 'fi',
        content: {
          innerHTML: 'Firefox'
        },
        selected: true
      });

      helpers.next(function() {
        expect(firefox.selected).to.equal(true);
        expect(chrome.selected).to.equal(false);

        // Select Chrome
        chrome.selected = true;

        helpers.next(function() {
          expect(firefox.selected).to.equal(false);
          expect(chrome.selected).to.equal(true);

          done();
        });
      });
    });


    it('should not escape special characters when an item is selected', function(done) {
      var el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var ampitem = el.items.add({
        value: '&&',
        content: {
          innerHTML: '&&'
        }
      });

      el.items.add({
        value: '<>',
        content: {
          innerHTML: '<>'
        }
      });

      ampitem.selected = true;

      helpers.next(function() {
        expect(el._elements.input.value).to.equal(ampitem.content.textContent, 'el._elements.input.value should now contain "&&"');
        expect(el.value).to.equal(ampitem.content.textContent, 'value should now be &&');
        helpers.next(function() {
          done();
        });
      });
    });

    it('should not escape special characters when an item is selected from the selectlist via mouse click', function(done) {
      var el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var ampitem = el.items.add({
        value: '&&',
        content: {
          innerHTML: '&&'
        }
      });

      el.items.add({
        value: '<>',
        content: {
          innerHTML: '<>'
        }
      });

      helpers.next(function() {
        // Trigger input event
        el._elements.$input.val('&').trigger('input');

        // Click the suggestion
        el._elements.selectList.items.getAll()[0].click();

        // Special characters should not be escaped
        expect(el._elements.input.value).to.equal(ampitem.content.textContent, 'el._elements.input.value should now contain "&&"');
        expect(el.value).to.equal(ampitem.content.textContent, 'value should now be &&');
        done();
      });
    });

    it('should not escape special characters when an item is selected from the selectlist via keyboard enter', function(done) {
      var el = new Coral.Autocomplete();

      // No delay by default
      el.delay = 0;

      helpers.target.appendChild(el);

      var ampitem = el.items.add({
        value: '&&',
        content: {
          innerHTML: '&&'
        }
      });

      el.items.add({
        value: '<>',
        content: {
          innerHTML: '<>'
        }
      });

      helpers.next(function() {
        // Trigger input event
        el._elements.$input.val('&').trigger('input');

        // Hit enter
        helpers.keypress('enter', el._elements.selectList.items.getAll()[0]);

        // Special characters should not be escaped
        expect(el._elements.input.value).to.equal(ampitem.content.textContent, 'el._elements.input.value should now contain "&&"');
        expect(el.value).to.equal(ampitem.content.textContent, 'value should now be &&');
        done();
      });
    });


  });

  describe('Implementation Details (compliance)', function() {
    describe('#formField (single select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Coral.Autocomplete.base.html'], {
        value: 'op',
        default: ''
      });
    });

    describe('#formField (multi select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Coral.Autocomplete.multiple.value.html'], {
        value: 'op',
        default: ''
      });
    });

  });
});
