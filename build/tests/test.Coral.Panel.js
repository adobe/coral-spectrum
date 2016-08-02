describe('Coral.Panel', function() {
  'use strict';

  var el;
  var item;
  var item2;

  beforeEach(function() {
    el = new Coral.PanelStack();
    item = new Coral.Panel();
    el.appendChild(item);
    item2 = new Coral.Panel();
    el.appendChild(item2);

    // adds the panelstack to the DOM
    helpers.target.appendChild(el);
  });

  afterEach(function() {
    el = item = item2 = null;
  });

  describe('API', function() {
    it('should have correct defaults', function() {
      expect(item.selected).to.be.false;
      expect(item.hasAttribute('selected')).to.be.false;
    });

    it('#selected should be settable to truthy', function(done) {
      item.selected = 123;

      helpers.next(function() {
        expect(item.selected).to.be.true;
        expect(item.hasAttribute('selected')).to.be.true;
        expect($(item).hasClass('is-selected')).to.be.true;
        done();
      });
    });
  });

  describe('Implementation Details', function() {

    it('#selected', function(done) {
      item.selected = 123;

      helpers.next(function() {
        expect($(item).hasClass('is-selected')).to.be.true;
        done();
      });
    });
  });
});
