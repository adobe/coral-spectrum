describe('Coral.ActionBar.Primary', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ActionBar).to.have.property('Primary');
    });
  });

  describe('API', function() {
    var el;
    var item1;

    beforeEach(function() {
      el = new Coral.ActionBar.Primary();
      item1 = new Coral.ActionBar.Item();

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = item1 = null;
    });

    describe('#items', function() {
      describe('#add', function() {
        it('should insert items before the more button', function() {
          expect(el.items.length).to.equal(0, 'collection should start empty');

          el.items.add(item1);

          var children = Array.prototype.slice.call(el.children);
          expect(children.indexOf(el._elements.moreButton)).to.be.above(children.indexOf(item1), 'more button should be placed after the item');
        });
      });
    });
  });
});
