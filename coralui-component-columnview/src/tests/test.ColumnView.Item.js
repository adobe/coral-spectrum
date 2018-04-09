import {helpers} from '../../../coralui-util/src/tests/helpers';
import {ColumnView} from '../../../coralui-component-columnview';
import {Icon} from '../../../coralui-component-icon';

describe('ColumnView.Item', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(ColumnView).to.have.property('Item');
      expect(ColumnView.Item).to.have.property('Content');
      expect(ColumnView.Item).to.have.property('Thumbnail');
    });

    it('should define the variants in an enum', function() {
      expect(ColumnView.Item.variant).to.exist;
      expect(ColumnView.Item.variant.DEFAULT).to.equal('default');
      expect(ColumnView.Item.variant.DRILLDOWN).to.equal('drilldown');
      expect(Object.keys(ColumnView.Item.variant).length).to.equal(2);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new ColumnView.Item());
    });

    afterEach(function() {
      el = null;
    });

    describe('#content', function() {});
    describe('#thumbnail', function() {});
    describe('#variant', function() {});

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(el.icon).to.equal('');
      });

      it('should be settable', function() {
        el.icon = 'document';
        expect(el.icon).to.equal('document');
      
        expect(el._elements.icon).to.exist;
        expect(el._elements.icon.icon).to.equal('document');
        expect(el._elements.icon.size).to.equal(Icon.size.SMALL);

        // it should be inside the thumbnail content zone
        expect(el.thumbnail.contains(el._elements.icon)).to.be.true;
      });

      it('should remove the contents of the thumbnail if set', function() {
        var img = document.createElement('img');
        el.thumbnail.appendChild(img);
        expect(el.thumbnail.children.length).to.equal(1);

        el.icon = 'folder';
        expect(el.icon).to.equal('folder');
        
        expect(el.thumbnail.children.length).to.equal(1);
        expect(el.contains(img)).to.be.false;
      });
    });

    describe('#selected', function() {
      it('should default to false', function() {
        expect(el.selected).to.be.false;
      });

      it('should be settable', function() {
        el.selected = true;
        expect(el.selected).to.be.true;
        expect(el.classList.contains('is-selected')).to.be.true;

        el.selected = false;
        expect(el.selected).to.be.false;
        expect(el.classList.contains('is-selected')).to.be.false;
      });
    });
  });

  describe('Markup', function() {});
  describe('Events', function() {});
  describe('User Interaction', function() {});
  describe('Implementation Details', function() {});
});
