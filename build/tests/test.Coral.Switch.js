describe('Coral.Switch', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Switch');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function(done) {
      helpers.build('<coral-switch></coral-switch>', function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a switch with checked attribute using markup', function(done) {
      helpers.build('<coral-switch checked></coral-switch>', function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a switch using js', function(done) {
      var el = new Coral.Switch();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('Markup', function() {
    describe('#checked', function() {
      it('should not be checked by default', function(done) {
        helpers.build('<coral-switch></coral-switch>', function(el) {
          expect(el.checked).to.be.false;
          expect(el.$).to.not.have.attr('checked');
          done();
        });
      });

      it('should become checked', function(done) {
        helpers.build('<coral-switch checked></coral-switch>', function(el) {
          expect(el.checked).to.be.true;
          expect(el.$).to.have.attr('checked');
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should not be disabled by default', function() {
        helpers.build('<coral-switch></coral-switch>', function(el) {
          expect(el.disabled).to.be.false;
          expect(el.$).to.not.have.class('is-disabled');
        });
      });

      it('should become disabled', function(done) {
        helpers.build('<coral-switch disabled></coral-switch>', function(el) {
          expect(el.disabled).to.be.true;
          expect(el.$).to.have.class('is-disabled');
          done();
        });
      });
    });

    describe('#labelledby', function() {
      it('should set aria-labelledby', function(done) {
        helpers.build('<coral-switch labelledby="someId"></coral-switch>', function(el) {
          expect(el.labelledBy).to.equal('someId');
          expect(el._elements.input.getAttribute('aria-labelledby')).to.equal('someId');
          done();
        });
      });

      it('should not add aria-labelledby if null', function(done) {
        helpers.build('<coral-switch ></coral-switch>', function(el) {
          expect(el.labelledBy).to.be.null;
          expect(el._elements.input.getAttribute('aria-labelledby')).to.be.null;
          done();
        });
      });
    });
  });

  describe('API', function() {
    it('should have proper defaults', function() {
      var el = new Coral.Switch();

      expect(el.checked).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.equal('');
      expect(el.labelledBy).to.be.null;
      expect(el.value).to.equal('on');
    });

    it('should reflect value changes', function(done) {
      var el = new Coral.Switch();
      el.value = 'yes';

      helpers.next(function() {
        expect(el._elements.input.value).to.equal('yes');
        done();
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function(done) {
        var el = new Coral.Switch();
        el.checked = 123; // truthy

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.true;
          done();
        });
      });

      it('should reflect unchecked value', function(done) {
        var el = new Coral.Switch();
        el.checked = ''; // falsy

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.false;
          done();
        });
      });

      it('should reflect unchecked value', function(done) {
        var el = new Coral.Switch();
        el.checked = ''; // falsy

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.false;
          expect(el.checked).to.be.false;
          done();
        });
      });

      it('should handle manipulating checked attribute', function(done) {
        var el = new Coral.Switch();
        el.setAttribute('checked', '');

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.true;
          expect(el.checked).to.be.true;

          el.removeAttribute('checked');

          helpers.next(function() {
            expect(el._elements.input.checked).to.be.false;
            expect(el.checked).to.be.false;
            done();
          });
        });
      });
    });

    describe('#disabled', function() {

      it('should reflect disabled value', function(done) {
        var el = new Coral.Switch();
        el.disabled = 123; // truthy

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.true;
          done();
        });
      });

      it('should reflect enabled value', function(done) {
        var el = new Coral.Switch();
        el.disabled = ''; // falsy

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.false;
          done();
        });
      });

      it('should handle manipulating disabled attribute', function(done) {
        var el = new Coral.Switch();
        el.setAttribute('disabled', '');

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.true;
          expect(el.disabled).to.be.true;

          el.removeAttribute('disabled');

          helpers.next(function() {
            expect(el._elements.input.disabled).to.be.false;
            expect(el.disabled).to.be.false;
            done();
          });
        });
      });
    });
  });

  describe('Events', function() {
    // instantiated switch el
    var el;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      el = new Coral.Switch();
      helpers.target.appendChild(el);

      // changeSpy and preventSpy for event bubble
      $(document).on('change', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-SWITCH');

        changeSpy();

        if (event.isDefaultPrevented()) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      $(document).off('change');
    });

    it('should change trigger on click', function(done) {
      el._elements.input.click();
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should not trigger change event, when checked property programatically', function(done) {
      el.checked = true;
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('should trigger change event, when clicked', function(done) {
      expect(el.checked).to.be.false;
      el._elements.input.click();
      helpers.next(function() {
        expect(el.checked).to.be.true;
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should not trigger change event if value changed', function(done) {
      el.value = 'value';
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('User Interaction', function() {
    var el;
    beforeEach(function() {
      el = new Coral.Switch();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    it('should check on click', function(done) {
      expect(el.checked).to.be.false;
      expect(el.$).to.not.have.attr('checked');

      el._elements.input.click();
      helpers.next(function() {
        expect(el.checked).to.be.true;
        expect(el.$).to.have.attr('checked');
        expect(el._elements.input.checked).to.be.true;

        el._elements.input.click();
        helpers.next(function() {
          expect(el.checked).to.be.false;
          expect(el.$).to.not.have.attr('checked');
          done();
        });
      });
    });
  });

  // section used for compliance since the current one does not follow test conventions
  describe('Implementation Details (compliance)', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Switch.base.html'], {
        value: 'on',
        default: 'on'
      });
    });
  });
});
