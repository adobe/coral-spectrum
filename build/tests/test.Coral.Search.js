describe('Coral.Search', function() {
  'use strict';

  function testInstance(instance, done) {
    expect(instance.$).to.have.class('coral-DecoratedTextfield');

    expect(instance._elements.input).to.exist;

    expect(instance.$).to.have.attr('icon', 'search');

    helpers.next(function() {
      expect(instance.$).not.to.have.attr('disabled');
      expect(instance.$).not.to.have.attr('invalid');
      expect(instance.$).not.to.have.attr('name');
      expect(instance.$).not.to.have.attr('required');
      expect(instance.$).not.to.have.attr('placeholder');
      expect(instance.$).not.to.have.attr('value');
      expect(helpers.classCount(instance)).to.equal(2);
      done();
    });
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Search');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function(done) {
      var ni = new Coral.Search();
      testInstance(ni, done);
    });

    it('should be possible using createElement', function(done) {
      var ni = document.createElement('coral-search');
      testInstance(ni, done);
    });

    it('should be possible using markup', function(done) {
      var defaultMarkup = '<coral-search></coral-search>';

      helpers.build(defaultMarkup, function(ni) {
        testInstance(ni, done);
      });
    });
  });

  describe('API', function() {
    var el;
    beforeEach(function() {
      el = new Coral.Search();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#icon', function() {
      it('should default to "search"', function() {
        expect(el.icon).to.equal('search');
      });

      it('should set icon', function() {
        el.icon = 'launch';
        expect(el._elements.icon.icon).to.equal('launch');
      });

      it('should hide icon when not set', function() {
        el.icon = '';
        expect(el._elements.icon.hidden).to.equal(true);
      });
    });
  });

  describe('clearInput', function() {
    it('should clear text value', function(done) {
      var instance = new Coral.Search();
      instance._elements.input.value = 'dummy text';
      instance._clearInput();
      expect(instance._elements.input.value).to.equal('');
      done();
    });
  });


  it('should submit the one single value', function(done) {
    var el = new Coral.Search();
    // we wrap first the select
    el.$.wrap('<form>');

    // we need to wait a frame because wrap detaches the elements
    helpers.next(function() {
      el.name = 'search';
      el._elements.input.value = 'dummy text';

      expect(el.$.parent().serializeArray()).to.deep.equal([{
        name: 'search',
        value: 'dummy text'
      }]);

      done();
    });
  });

});
