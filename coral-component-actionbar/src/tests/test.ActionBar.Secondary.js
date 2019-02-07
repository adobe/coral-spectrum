import {helpers} from '../../../coral-utils/src/tests/helpers';
import {ActionBar} from '../../../coral-component-actionbar';

describe('ActionBar.Secondary', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(ActionBar).to.have.property('Secondary');
    });
  });

  describe('API', function() {
    var el;
    var item1;

    beforeEach(function() {
      el = new ActionBar.Secondary();
      item1 = new ActionBar.Item();

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
          expect(children.indexOf(el._elements.moreButton)).to.be.below(children.indexOf(item1), 'item should be placed before the item');
        });
      });
    });
  });
});
