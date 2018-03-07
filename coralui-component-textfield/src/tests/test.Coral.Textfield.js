describe('Coral.Textfield', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Textfield');
    });
  });

  describe('Instantiation', function() {
    it('should be possible via clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Textfield.base.html']);
    });

    it('should be possible via clone using markup with textContent', function() {
      helpers.cloneComponent(window.__html__['Coral.Textfield.value.html']);
    });

    it('should be possible via clone using js', function() {
      helpers.cloneComponent(new Coral.Textfield());
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Textfield();
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

    describe('#placeholder', function() {
      it('should return empty string by default', function() {
        expect(el.placeholder).to.equal('');
      });
    });

    describe('#variant', function() {
      it('should be set to "default" by default', function() {
        expect(el.variant).to.equal(Coral.Textfield.variant.DEFAULT, '"default" should be set');
      });

      it('should be possible to set the variant', function() {
        expect(el.classList.contains('_coral-Textfield--quiet')).to.be.false;

        el.variant = Coral.Textfield.variant.QUIET;
        expect(el.variant).to.equal(Coral.Textfield.variant.QUIET, '"quiet" should be set');
        expect(el.classList.contains('_coral-Textfield--quiet')).to.be.true;
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
