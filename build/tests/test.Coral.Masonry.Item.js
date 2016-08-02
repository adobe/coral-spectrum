describe('Coral.Masonry.Item', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Masonry).to.have.property('Item');
    });
  });

  function testInstance(item) {
    expect(item.$).to.have.class('coral-Masonry-item');
    expect(item.$).to.have.attr('tabindex', '-1');
  }

  describe('instantiation', function() {

    it('should be possible using new', function() {
      var item = new Coral.Masonry.Item();
      testInstance(item);
    });

    it('should be possible using createElement', function() {
      var item = document.createElement('coral-masonry-item');
      testInstance(item);
    });

    it('should be possible using markup', function(done) {
      helpers.build(window.__html__['Coral.Masonry.Item.text-article.html'], function(item) {
        testInstance(item);
        done();
      });
    });

  });

  describe('API', function() {

    var item;
    beforeEach(function() {
      item = new Coral.Masonry.Item();
    });

    describe('#selected', function() {

      it('should be false by default', function() {
        expect(item).to.have.property('selected', false);
        expect(item.$).to.not.have.attr('selected');
        expect(item.$).to.not.have.class('is-selected');
      });

      it('should toggle attribute and class', function(done) {
        item.selected = true;

        helpers.next(function() { // sync
          expect(item.$).to.have.attr('selected');
          expect(item.$).to.have.class('is-selected');
          done();
        });
      });

    });

  });

  describe('DOM mutation', function() {

    var m;

    beforeEach(function() {
      m = new Coral.Masonry();
      helpers.target.appendChild(m);
    });

    describe('append', function() {

      it('should add the is-managed class', function(done) {
        var item = new Coral.Masonry.Item();
        m.appendChild(item);

        helpers.masonryLayouted(m, function() {
          expect(item.$).to.have.class('is-managed');
          done();
        });
      });

      it('should transition from is-beforeInserting to is-inserting', function(done) {
        helpers.build(window.__html__['Coral.Masonry.Item.style-insert.html'], function() {
          var item = new Coral.Masonry.Item();
          item.textContent = 'some text';
          m.appendChild(item);

          window.setTimeout(function() { // wait until the transition has started
            // TODO find out why commenting out the line below fails the test in FF
            // expect(item.$).to.not.have.class('is-beforeInserting');
            expect(item.$).to.have.class('is-inserting');

            var fontSize = parseInt(window.getComputedStyle(item).fontSize, 10);

            // Check if transition has started
            expect(fontSize).to.be.above(0);
            expect(fontSize).to.be.below(100);
            done();
          }, 100);
        });
      });

      it('should remove the is-inserting class after the insert transition has been finished', function(done) {
        var item = new Coral.Masonry.Item();
        m.appendChild(item);

        helpers.next(function() { // TODO find out why this is necessary
          helpers.transitionEnd(item, function() {
            expect(item.$).to.not.have.class('is-inserting');
            done();
          });
        });
      });

    });

    describe('remove', function() {

      var item;

      beforeEach(function(done) {
        item = new Coral.Masonry.Item();
        m.appendChild(item);

        helpers.transitionEnd(item, function() {
          done();
        });
      });

      it('should temporarily add the item again with the is-removing class', function(done) {
        m.removeChild(item);

        helpers.next(function() { // polyfill detachedCallback
          expect(item.parentNode).to.equal(m);
          helpers.next(function() { // sync changes inside detachedCallback
            expect(item.$).to.have.class('is-removing');
            done();
          });
        });
      });

      it('should remove the item after the transition', function(done) {
        m.removeChild(item);

        helpers.next(function() { // TODO find out why this is necessary
          helpers.transitionEnd(item, function() {
            helpers.next(function() { // polyfill detachedCallback
              helpers.next(function() { // sync changes in detachedCallback
                expect(item.parentNode).to.equal(null);
                expect(item.$).to.not.have.class('is-managed');
                expect(item.$).to.not.have.class('is-beforeInserting');
                expect(item.$).to.not.have.class('is-inserting');
                expect(item.$).to.not.have.class('is-inserting');
                expect(item.$).to.not.have.class('is-removing');
                done();
              });
            });
          });
        });
      });

    });

  });

  describe('internal API', function() {

    var item;
    beforeEach(function() {
      item = new Coral.Masonry.Item();
    });

    describe('#_updateDragAction', function() {

      var handle;

      beforeEach(function() {
        handle = $('<div coral-masonry-draghandle>')[0];
        item.appendChild(handle);
      });

      it('should allow to initialize drag action', function() {
        item._updateDragAction(true);
        expectEnabled(item, handle);
      });

      it('should allow to use the item itself as the handle', function() {
        item.$.attr('coral-masonry-draghandle', '').empty();
        item._updateDragAction(true);
        expectEnabled(item, item);
      });

      it('should allow to destroy drag action', function() {
        item._updateDragAction(true);
        item._updateDragAction(false);
        expectDisabled(item, handle);
      });

      it('should disable drag action if handle cannot be found', function() {
        $(handle).remove();
        item._updateDragAction(true);
        expectDisabled(item, handle);
      });

      function expectEnabled(item, handle) {
        expect(item._dragAction).to.not.be.null;
        expect($(handle)).to.have.class('u-coral-openHand');
      }

      function expectDisabled(item, handle) {
        expect(item._dragAction).to.be.null;
        expect($(handle)).to.not.have.class('u-coral-openHand');
      }

    });

  });

});
