describe('Coral.Textarea', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Textarea');
    });
  });

  describe('Instantiation', function() {
    it('should be possible via clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Textarea.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using markup with textContent', function(done) {
      helpers.build(window.__html__['Coral.Textarea.value.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using js', function(done) {
      var el = new Coral.Textarea();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Textarea();
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

    describe('#variant', function() {
      it('should be set to "default" by default', function() {
        expect(el.variant).to.equal(Coral.Textarea.variant.DEFAULT, '"default" should be set');
      });

      it('should be possible to set the variant', function(done) {

        expect(el.$).to.not.have.class('coral-Textfield--quiet');

        el.variant = Coral.Textarea.variant.QUIET;
        expect(el.variant).to.equal(Coral.Textarea.variant.QUIET, '"quiet" should be set');

        helpers.next(function() {
          expect(el.$).to.have.class('coral-Textfield--quiet');
          done();
        });
      });

      it('should increase the height automatically if variant=quiet', function() {
        el.variant = Coral.Textarea.variant.QUIET;
        var initialHeight = el.getBoundingClientRect().height;

        el.value = '\n\n\n';
        el.trigger('input');

        var newHeight = parseInt(el.style.height, 10);
        expect(newHeight > initialHeight).to.be.true;
      });

      it('should decrease the height automatically if variant=quiet', function() {
        el.variant = Coral.Textarea.variant.QUIET;
        el.value = '\n\n\n';
        el.trigger('input');

        var initialHeight = el.getBoundingClientRect().height;
        el.value = '';
        el.trigger('input');
        var newHeight = parseInt(el.style.height, 10);
        expect(newHeight < initialHeight).to.be.true;
      });

      it('should restore the default height if variant was quiet', function(done) {
        var initialHeight = '10px';
        el.style.height = initialHeight;

        el.variant = Coral.Textarea.variant.QUIET;

        helpers.next(function() {
          el.value = '\n\n\n';
          el.trigger('input');

          el.variant = Coral.Textarea.variant.DEFAULT;

          helpers.next(function() {
            expect(el.style.height).to.be.equal(initialHeight);
            done();
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Textarea.value.html'], {
        value: 'abc'
      });
    });
  });
});
