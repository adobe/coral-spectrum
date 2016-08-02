describe('Coral.ColumnView.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ColumnView).to.have.property('Item');
      expect(Coral.ColumnView.Item).to.have.property('Content');
      expect(Coral.ColumnView.Item).to.have.property('Thumbnail');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.ColumnView.Item.variant).to.exist;
      expect(Coral.ColumnView.Item.variant.DEFAULT).to.equal('default');
      expect(Coral.ColumnView.Item.variant.DRILLDOWN).to.equal('drilldown');
      expect(Object.keys(Coral.ColumnView.Item.variant).length).to.equal(2);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.ColumnView.Item();
      helpers.target.appendChild(el);
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

      it('should be settable', function(done) {
        el.icon = 'file';
        expect(el.icon).to.equal('file');

        helpers.next(function() {
          expect(el._elements.icon).to.exist;
          expect(el._elements.icon.icon).to.equal('file');
          expect(el._elements.icon.size).to.equal(Coral.Icon.size.SMALL);

          // it should be inside the thumbnail content zone
          expect(el.thumbnail.contains(el._elements.icon)).to.be.true;

          done();
        });
      });

      it('should remove the contents of the thumbnail if set', function(done) {
        var img = document.createElement('img');
        el.thumbnail.appendChild(img);
        expect(el.thumbnail.children.length).to.equal(1);

        el.icon = 'folder';
        expect(el.icon).to.equal('folder');

        helpers.next(function() {
          expect(el.thumbnail.children.length).to.equal(1);
          expect(el.contains(img)).to.be.false;

          done();
        });
      });
    });

    describe('#selected', function() {
      it('should default to false', function() {
        expect(el.selected).to.be.false;
      });

      it('should be settable', function(done) {
        el.selected = true;
        expect(el.selected).to.be.true;

        helpers.next(function() {
          expect(el.$.hasClass('is-selected')).to.be.true;

          el.selected = false;
          expect(el.selected).to.be.false;

          helpers.next(function() {
            expect(el.$.hasClass('is-selected')).to.be.false;
            done();
          });
        });
      });
    });
  });

  describe('Markup', function() {});
  describe('Events', function() {});
  describe('User Interaction', function() {});
  describe('Implementation Details', function() {});
});
