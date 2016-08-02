describe('Coral.Textfield', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Textfield');
    });
  });

  describe('Instantiation', function() {
    it('should be possible via clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Textfield.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using markup with textContent', function(done) {
      helpers.build(window.__html__['Coral.Textfield.value.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using js', function(done) {
      var el = new Coral.Textfield();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Textfield();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#value', function() {
      it('should return empty string by default', function() {
        expect(el.value).to.equal('');
      });
    });

    describe('#name', function() {
      it('should return empty string by default', function() {
        expect(el.name).to.equal('');
      });
    });

    describe.skip('#placeholder', function() {
      // IE9:remove this skip when IE goes away
      it('should return empty string by default', function() {
        expect(el.placeholder).to.equal('');
      });
    });

    describe('#variant', function() {
      it('should be set to "default" by default', function() {
        expect(el.variant).to.equal(Coral.Textfield.variant.DEFAULT, '"default" should be set');
      });

      it('should be possible to set the variant', function(done) {

        expect(el.$).to.not.have.class('coral-Textfield--quiet');

        el.variant = Coral.Textfield.variant.QUIET;
        expect(el.variant).to.equal(Coral.Textfield.variant.QUIET, '"quiet" should be set');

        helpers.next(function() {
          expect(el.$).to.have.class('coral-Textfield--quiet');
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Textfield.value.html'], {
        value: 'abc'
      });
    });
  });
});
