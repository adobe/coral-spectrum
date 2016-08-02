describe('Coral.Tab', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Tab');
      expect(Coral.Tab).to.have.property('Label');
    });
  });

  describe('Instantiation', function() {
    it('should be possible via clone using markup', function(done) {
      helpers.build('<coral-tab>Tab One</coral-tab>', function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using markup with textContent', function(done) {
      helpers.build('<coral-tab><coral-tab-label>Tab One</coral-tab-label></coral-tab>', function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using js', function(done) {
      var el = new Coral.Tab();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;
    var item;
    var item2;

    beforeEach(function() {
      el = new Coral.TabList();
      item = new Coral.Tab();
      el.appendChild(item);
      item2 = new Coral.Tab();
      el.appendChild(item2);
    });

    afterEach(function() {
      el = item = item2 = null;
    });

    it('should have correct defaults', function() {
      expect(item.selected).to.be.false;
      expect(item.hasAttribute('selected')).to.be.false;

      expect(item.disabled).to.be.false;
      expect(item.hasAttribute('disabled')).to.be.false;

      expect(item.invalid).to.be.false;
      expect(item.hasAttribute('invalid')).to.be.false;
    });

    it('#label should be settable', function() {
      item.label.textContent = 'Item 1';
      expect(item.label.textContent).to.equal('Item 1');
    });

    it('#selected should be settable to truthy', function(done) {
      item.selected = 123;

      Coral.commons.nextFrame(function() {
        expect(item.selected).to.be.true;
        expect(item.hasAttribute('selected')).to.be.true;
        expect(item.$).to.have.class('is-selected');
        expect(item.$).to.have.attr('tabindex', '0');
        done();
      });
    });

    it('selecting a disabled item should make it unselected', function() {
      item.disabled = 123;
      item.selected = 123;

      expect(item.disabled).to.be.true;
      expect(item.hasAttribute('disabled')).to.be.true;
      expect(item.selected).to.be.false;
      expect(item.hasAttribute('selected')).to.be.false;
    });

    it('#disabled should be settable to truthy/falsy', function() {
      item.disabled = 123;
      expect(item.disabled).to.be.true;
      expect(item.hasAttribute('disabled')).to.be.true;

      item.disabled = '';
      expect(item.disabled).to.be.false;
      expect(item.hasAttribute('disabled')).to.be.false;
    });

    it('disabled items cannot be selected', function() {

      item.disabled = true;
      expect(item.disabled).to.be.true;
      expect(item.hasAttribute('disabled')).to.be.true;

      expect(item.selected).to.be.false;

      item.selected = true;

      expect(item.selected).to.be.false;
    });

    it('disabling should make it unselected', function() {
      item.selected = 123;
      item.disabled = 123;

      expect(item.disabled).to.be.true;
      expect(item.hasAttribute('disabled')).to.be.true;
      expect(item.selected).to.be.false;
      expect(item.hasAttribute('selected')).to.be.false;
    });

    it('#invalid should be settable to truthy/falsy', function() {
      item.invalid = 123;
      expect(item.invalid).to.be.true;
      expect(item.hasAttribute('invalid')).to.be.true;

      item.invalid = '';
      expect(item.invalid).to.be.false;
      expect(item.hasAttribute('invalid')).to.be.false;
    });
  });

  describe('Implementation Details', function() {
    var el;
    var item;
    var item2;

    beforeEach(function() {
      el = new Coral.TabList();
      item = new Coral.Tab();
      el.appendChild(item);
      item2 = new Coral.Tab();
      el.appendChild(item2);
    });

    afterEach(function() {
      el = item = item2 = null;
    });

    it('#label', function(done) {
      item.label.textContent = 'Header 1';

      Coral.commons.nextFrame(function() {
        expect(item.label.textContent).to.equal('Header 1');
        done();
      });
    });

    it('#selected', function(done) {
      item.selected = 123;

      Coral.commons.nextFrame(function() {
        expect(item.$).to.have.class('is-selected');
        expect(item.$).to.have.attr('tabindex', '0');
        done();
      });
    });

    it('#disabled', function(done) {
      item.disabled = 123;

      Coral.commons.nextFrame(function() {
        expect(item.$).to.have.class('is-disabled');
        expect(item.$).to.have.attr('aria-disabled', 'true');
        done();
      });
    });

    it('#invalid', function(done) {
      item.invalid = 123;

      Coral.commons.nextFrame(function() {
        expect(item.$).to.have.class('is-invalid');
        done();
      });
    });
  });
});
