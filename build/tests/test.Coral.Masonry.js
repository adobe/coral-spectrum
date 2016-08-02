describe('Coral.Masonry', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Masonry');
    });
  });

  function testInstance(masonry, expectedLayout, done) {
    expect(masonry.$).to.have.class('coral-Masonry');

    helpers.next(function() { // sync
      expect(masonry.$).to.have.attr('layout', expectedLayout);
      done();
    });
  }

  describe('instantiation', function() {

    it('should be possible using new', function(done) {
      var m = new Coral.Masonry();
      m.layout = 'variable';
      testInstance(m, 'variable', done);
    });

    it('should be possible using createElement', function(done) {
      var m = document.createElement('coral-masonry');
      m.layout = 'variable';
      testInstance(m, 'variable', done);
    });

    it('should be possible using markup', function(done) {
      helpers.build(window.__html__['Coral.Masonry.variable.empty.html'], function(m) {
        testInstance(m, 'variable', done);
      });
    });

  });

  describe('accessibility', function() {

    var m;
    beforeEach(function(done) {
      helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
        m = m2;
        done();
      });
    });

    it('should only be the first item tabbable by default', function() {
      expectOnlyToBeTabbable(0);
    });

    it('should make the last focused item tabbable', function() {
      helpers.focus(m.items.getAll()[3]);
      expectOnlyToBeTabbable(3);
    });

    function expectOnlyToBeTabbable(expectedFocusedIndex) {
      expect(m.$).to.not.have.attr('tabindex');

      var items = m.items.getAll();
      for (var i = 0; i < items.length; i++) {
        expect(items[i].$).to.have.attr('tabindex', (i === expectedFocusedIndex) ? '0' : '-1');
      }
    }

    it('should focus the next item if the currently focused item is removed', function(done) {
      var item1 = m.items.getAll()[1];
      var item2 = m.items.getAll()[2];

      helpers.focus(item1);
      helpers.expectActive(item1);

      item1.remove();
      expect(m.items.getAll()[1]).to.equal(item2);

      helpers.masonryLayouted(m, function() {
        helpers.expectActive(item2);
        done();
      });
    });

    it('should focus the previous item if the currently focused item which is the last is removed', function(done) {
      var item1 = m.items.getAll()[7];
      var item2 = m.items.getAll()[8];
      expect(item2).to.equal(m.items.getAll()[m.items.getAll().length - 1]);

      helpers.focus(item2);
      helpers.expectActive(item2);

      item2.remove();

      helpers.masonryLayouted(m, function() {
        helpers.expectActive(item1);
        done();
      });
    });

    it('should not try to get back lost focus', function(done) {
      var item = m.items.getAll()[0];
      helpers.focus(item);
      document.activeElement.blur();
      helpers.expectActive(document.body);

      m._scheduleLayout('test'); // this would get back the focus if the implementation was wrong

      helpers.masonryLayouted(m, function() {
        helpers.expectActive(document.body);
        done();
      });
    });

  });

  describe('API', function() {

    var m;

    beforeEach(function() {
      m = new Coral.Masonry();
      helpers.target.appendChild(m);
    });

    describe('#layout', function() {

      function createLayout() {
        return function() {
          this.layout = sinon.spy();
          this.destroy = sinon.spy();
        };
      }

      var defaultSpy;

      before(function() {
        Coral.Masonry.registerLayout('layout1', createLayout());
        Coral.Masonry.registerLayout('layout2', createLayout());
        defaultSpy = sinon.spy(Coral.Masonry._layouts, Object.keys(Coral.Masonry._layouts)[0]);
      });

      beforeEach(function() {
        defaultSpy.reset();
      });

      after(function() {
        delete Coral.Masonry._layouts.layout1;
        delete Coral.Masonry._layouts.layout2;
        defaultSpy.restore();
      });

      it('should use the first layout by default', function(done) {
        var firstLayoutName = Object.keys(Coral.Masonry._layouts)[0];
        expect(firstLayoutName).to.be.a('string');

        expect(m.layout).to.equal(firstLayoutName);
        done();
      });

      it('should not initialize the default layout if it is not used', function(done) {
        m.layout = 'layout1';

        helpers.masonryLayouted(m, function() {
          expect(defaultSpy).to.not.have.been.called;
          done();
        });
      });

      it('should be set and reflected', function(done) {
        m.layout = 'layout1';
        expect(m.layout).to.equal('layout1');

        helpers.next(function() { // sync
          expect(m.$).to.have.attr('layout', 'layout1');
          done();
        });
      });

      it('should be set and reflected', function(done) {
        m.layout = 'layout1';
        expect(m.layout).to.equal('layout1');

        helpers.next(function() { // sync
          expect(m.$).to.have.attr('layout', 'layout1');
          done();
        });
      });

      it('should not change the layout if it does not exist', function() {
        m.layout = 'layout1';
        m.layout = 'non-existing';
        expect(m.layout).to.equal('layout1');
      });

      it('should schedule a layout after the layout name has been changed', function(done) {
        m.layout = 'layout1';
        helpers.next(function() { // sync
          expect(m._layout.layout).to.be.called;
          done();
        });
      });

      it('should destory the previous layout when the layout is changed', function(done) {
        m.layout = 'layout1';
        helpers.next(function() { // sync
          var oldLayout = m._layout;
          m.layout = 'layout2';
          helpers.next(function() { // sync
            expect(oldLayout.destroy).to.be.called;
            done();
          });
        });
      });

      it('should even set the layout if the custom element upgrades before the layouts have been registered', function(done) {
        // Simulate immediate upgrade. In this case the layouts property isn't set yet.
        var layouts = Coral.Masonry._layouts;
        delete Coral.Masonry._layouts;
        m.layout = 'layout1';

        Coral.Masonry._layouts = layouts;
        window.setTimeout(function() {
          expect(m.layout).to.equal('layout1');
          done();
        }, 0);
      });

    });

    describe('#items', function() {

      var item1, item2;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item2 = new Coral.Masonry.Item();
      });

      it('should be read-only', function() {
        var items = m.items;
        m.items = [item1, item2];
        expect(m.items).to.deep.equal(items);
      });

      describe('#add', function() {

        it('should add item to list and children', function() {
          m.items.add(item1);
          expectItems([item1]);

          m.items.add(item2);
          expectItems([item1, item2]);
        });

        it('should move the item to the end of the list if it is already in the list', function() {
          m.items.add(item1);
          m.items.add(item2);
          m.items.add(item1);
          expectItems([item2, item1]);
        });

        it('should trigger coral-collection:add event', function(done) {
          var eventSpy = sinon.spy();
          m.on('coral-collection:add', eventSpy);

          m.items.add(item1);

          helpers.next(function() { // polyfill attachedCallback
            expect(eventSpy).to.be.calledOnce;
            expect(eventSpy.args[0][0].detail.item).to.equal(item1);
            done();
          });
        });

        it('should not trigger coral-collection:add/remove event if item is just moved', function(done) {
          m.items.add(item1);
          m.items.add(item2);

          helpers.next(function() { // polyfill attachedCallback
            var eventSpy = sinon.spy();
            m.on('coral-collection:add', eventSpy);
            m.on('coral-collection:remove', eventSpy);

            m.items.add(item1); // move item

            helpers.next(function() { // TODO find out why this is necessary
              helpers.transitionEnd(item1, function() {
                expect(eventSpy).to.be.not.called;
                done();
              });
            });
          });
        });

      });

      describe('#remove', function() {

        it('should remove the given item', function() {
          m.items.add(item1);
          m.items.add(item2);

          m.items.remove(item1);
          expectItems([item2]);

          m.items.remove(item2);
          expectItems([]);
        });

        it('should trigger coral-collection:remove event', function(done) {
          m.items.add(item1);

          helpers.next(function() { // polyfill attachedCallback
            var eventSpy = sinon.spy();
            m.on('coral-collection:remove', eventSpy);

            m.items.remove(item1);

            helpers.next(function() { // TODO find out why this is necessary
              helpers.transitionEnd(item1, function() {
                expect(eventSpy).to.be.calledOnce;
                expect(eventSpy.args[0][0].detail.item).to.equal(item1);
                done();
              });
            });
          });
        });

      });

      describe('#clear', function() {

        it('should remove all items', function() {
          m.items.add(item1);
          m.items.add(item2);
          m.items.clear();
          expectItems([]);
        });

        it('should not remove non-item elements', function() {
          var div = document.createElement('div');
          m.appendChild(div);
          m.items.add(item1);
          m.items.clear();
          expect(div.parentNode).to.equal(m);
        });

      });

      describe('#getAll', function() {

        it('should return all items', function() {
          m.appendChild(document.createTextNode('text'));
          m.appendChild(document.createElement('div'));
          m.appendChild(item1);
          m.appendChild(item2);

          expect(m.items.getAll()).to.deep.equal([item1, item2]);
        });

      });

      function expectItems(items) {
        expect(m.items.getAll()).to.deep.equal(items);
        expect(m.$.children('coral-masonry-item').filter(function(i, item) {
          return !item._removing;
        }).toArray()).to.deep.equal(items);
      }

    });

    describe('#selectedItem', function() {

      var item1, item2;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item2 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);
      });

      it('should be read-only', function() {
        var selectedItem = m.selectedItem;
        m.selectedItem = item1;
        expect(m.selectedItem).to.equal(selectedItem);
      });

      it('should return the selected item', function() {
        item2.selected = true;

        expect(m).to.have.property('selectedItem', item2);
      });

      it('should return the first selected item', function() {
        item1.selected = true;
        item2.selected = true;

        expect(m).to.have.property('selectedItem', item1);
      });

      it('should return null if there are no items selected', function() {
        expect(m).to.have.property('selectedItem', null);
      });

    });

    describe('#selectedItems', function() {

      var item1, item2, item3;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item2 = new Coral.Masonry.Item();
        item3 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);
        m.appendChild(item3);
      });

      it('should be read-only', function() {
        var selectedItems = m.selectedItems.slice();
        m.selectedItems = [item1];
        expect(m.selectedItems).to.deep.equal(selectedItems);
      });

      it('should return all selected items', function() {
        item1.selected = true;
        item2.selected = true;

        expect(m.selectedItems).to.deep.equal([item1, item2]);
      });

      it('should return an empty array if there are no items selected', function() {
        expect(m.selectedItems).to.deep.equal([]);
      });

    });

    describe('#selectAll', function() {

      it('should select all items', function() {
        var item1 = new Coral.Masonry.Item();
        var item2 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);

        m.selectAll();

        expect(item1).to.have.property('selected', true);
        expect(item2).to.have.property('selected', true);
      });

    });

    describe('#deselectAll', function() {

      it('should deselect all items', function() {
        var item1 = new Coral.Masonry.Item();
        var item2 = new Coral.Masonry.Item();
        m.appendChild(item1);
        m.appendChild(item2);
        item1.selected = true;
        item2.selected = true;

        m.deselectAll();

        expect(item1).to.have.property('selected', false);
        expect(item2).to.have.property('selected', false);
      });

    });

    describe('#orderable', function() {

      var item1, item2;

      beforeEach(function() {
        item1 = new Coral.Masonry.Item();
        item1.setAttribute('coral-masonry-draghandle', '');
        item2 = new Coral.Masonry.Item();
        item2.setAttribute('coral-masonry-draghandle', '');
        m.appendChild(item1);
        m.appendChild(item2);
      });

      it('should be disabled by default', function() {
        expect(m).to.have.property('orderable', false);
      });

      it('should allow to enable drag & drop for all items', function(done) {
        m.orderable = true;

        helpers.next(function() { // sync
          expectDraggable(item1.$, true);
          expectDraggable(item2.$, true);
          done();
        });
      });

      it('should allow to disable drag & drop for all items', function(done) {
        m.orderable = true;

        helpers.next(function() { // sync
          m.orderable = false;

          helpers.next(function() { // sync
            expectDraggable(item1.$, false);
            expectDraggable(item2.$, false);
            done();
          });
        });
      });

    });

    function expectDraggable($el, draggable) {
      if (draggable) {
        expect($el).to.have.class('u-coral-openHand');
      }
      else {
        expect($el).to.not.have.class('u-coral-openHand');
      }
    }

    describe('#spacing', function() {

      it('should allow to set spacing', function(done) {
        var spacing = 123;

        m.spacing = spacing;
        m.layout = 'variable';
        m.setAttribute('columnwidth', 100);
        m.$.width(500); // fails on the console without

        var item = new Coral.Masonry.Item();
        item.textContent = 'text';
        m.appendChild(item);

        helpers.masonryLayouted(m, function() {
          var masonryRect = m.getBoundingClientRect();
          var itemRect = item.getBoundingClientRect();

          expect(itemRect.left - masonryRect.left).to.equal(spacing);
          expect(masonryRect.right - itemRect.right).to.equal(spacing);
          expect(itemRect.top - masonryRect.top).to.equal(spacing);
          expect(masonryRect.bottom - Math.ceil(itemRect.bottom)).to.equal(spacing);

          done();
        });
      });

    });

  });

  describe.skip('user interaction', function() {

    describe('reorder with drag & drop', function() {

      var m;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
          m = m2;
          m.$.children().attr('coral-masonry-draghandle', '');
          m.orderable = true;
          helpers.next(function() { // sync
            done();
          });
        });
      });

      it('should allow to drag the last item to the first position', function(done) {
        var itemsBefore = m.items.getAll();
        var firstItem = itemsBefore[0];
        var lastItem = itemsBefore[itemsBefore.length - 1];
        var start = center(lastItem.getBoundingClientRect());
        var end = center(firstItem.getBoundingClientRect());
        var oldBeforeItem = itemsBefore[itemsBefore.length - 2];

        var eventSpy = sinon.spy();
        m.on('coral-masonry:order', eventSpy);

        helpers.mockMouse([
          {
            type: 'down',
            clientX: start.x,
            clientY: start.y
          },
          {
            type: 'move',
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            duration: 1000
          },
          {
            type: 'up',
            clientX: end.x,
            clientY: end.y
          }
        ], function() {
          var expectedItemsAfter = itemsBefore.slice(); // copy
          expectedItemsAfter.unshift(lastItem);
          expectedItemsAfter.pop();

          expect(eventSpy.callCount).to.equal(1);
          var eventDetail = eventSpy.args[0][0].detail;
          expect(eventDetail.item).to.equal(lastItem);
          expect(eventDetail.oldBefore).to.equal(oldBeforeItem);
          expect(eventDetail.before).to.equal(null);

          expect(m.items.getAll()).to.deep.equal(expectedItemsAfter);
          done();
        });
      });

      it('should allow to drag the first item to the last position', function(done) {
        var itemsBefore = m.items.getAll();
        var firstItem = itemsBefore[0];
        var lastItem = itemsBefore[itemsBefore.length - 1];
        var start = center(firstItem.getBoundingClientRect());
        var end = center(lastItem.getBoundingClientRect());

        var eventSpy = sinon.spy();
        m.on('coral-masonry:order', eventSpy);

        helpers.mockMouse([
          {
            type: 'down',
            clientX: start.x,
            clientY: start.y
          },
          {
            type: 'move',
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            duration: 1000
          },
          {
            type: 'up',
            clientX: end.x,
            clientY: end.y
          }
        ], function() {
          var expectedItemsAfter = itemsBefore.slice(); // copy
          expectedItemsAfter.push(firstItem);
          expectedItemsAfter.shift();

          expect(eventSpy.callCount).to.equal(1);
          var eventDetail = eventSpy.args[0][0].detail;
          expect(eventDetail.item).to.equal(firstItem);
          expect(eventDetail.oldBefore).to.equal(null);
          expect(eventDetail.before).to.equal(lastItem);

          expect(m.items.getAll()).to.deep.equal(expectedItemsAfter);
          done();
        });
      });

      function center(rect) {
        return {
          x: rect.left + Math.round(rect.width / 2),
          y: rect.top + Math.round(rect.height / 2)
        };
      }

      it('should transition item to the final position', function(done) {
        var itemsBefore = m.items.getAll();
        var firstItem = itemsBefore[0];
        var lastItem = itemsBefore[itemsBefore.length - 1];
        var start = center(firstItem.getBoundingClientRect());
        var end = center(lastItem.getBoundingClientRect());

        helpers.mockMouse([
          {
            type: 'down',
            clientX: start.x,
            clientY: start.y
          },
          {
            type: 'move',
            startX: start.x,
            startY: start.y,
            endX: end.x + 100,
            endY: end.y,
            duration: 500
          },
          {
            type: 'up',
            clientX: end.x,
            clientY: end.y
          }
        ], function() {
          var rects = [];
          var intervalId = window.setInterval(function() {
            rects.push(firstItem.getBoundingClientRect());
          }, 50);

          helpers.transitionEnd(firstItem, function() {
            window.clearInterval(intervalId);

            // Check if item was transitioned
            expect(rects).to.have.length.above(5);
            for (var i = 1; i < rects.length; i++) {
              expect(rects[i].left).to.be.below(rects[i - 1].left);
            }
            done();
          });
        });
      });

    });

  });

  describe('behaviour', function() {

    describe('class is-loaded', function() {

      var m;

      beforeEach(function() {
        m = new Coral.Masonry();
        m.layout = 'variable';
        m.setAttribute('columnwidth', 100);
        helpers.target.appendChild(m);
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should be added after two frames if there are no images', function(done) {
        expect(m._loaded).to.equal(false);
        expect(m.$).to.not.have.class('is-loaded', 'Masonry has class is-loaded');

        // Two helpers.next are required because updateLoaded is called in the next frame after the element has been attached
        helpers.next(function() {
          helpers.next(function() {
            expect(m._loaded).to.equal(true);
            expect(m.$).to.have.class('is-loaded', 'Masonry has not class is-loaded');

            done();
          });
        });
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should be added after all images have been loaded', function(done) {
        var item = $(window.__html__['Coral.Masonry.Item.image.html'])[0];
        m.appendChild(item);

        expect(m.$).to.not.have.class('is-loaded');

        var img = item.querySelector('img');
        img.src += '?ck=' + Date.now();
        img.onload = function() {
          helpers.masonryLayouted(m, function() {
            expect(m.$).to.have.class('is-loaded');
            done();
          });
        };
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should be added if the images cannot be loaded', function(done) {
        m.addEventListener('error', function() {
          // TODO improve in firefox
          helpers.masonryLayouted(m, function() {
            expect(m.$).to.have.class('is-loaded');
            done();
          });
        }, true);

        var item = $(window.__html__['Coral.Masonry.Item.broken-image.html'])[0];
        m.appendChild(item);
      });
    });

    describe('resizable container', function() {
      var $container;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.container.html'], function(container) {
          $container = $(container);
          done();
        });
      });

      it('should resize the masonry when the container changes its width', function(done) {
        var m = $container.find('coral-masonry')[0];
        var widthBefore = m.$.width();
        $container.width(500);

        helpers.masonryLayouted(m, function() {
          expect(m.$.width()).to.not.equal(widthBefore);
          done();
        });
      });
    });

    describe('hidden container', function() {
      var $container;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.hidden-container.html'], function(container) {
          $container = $(container);
          expect($container).to.have.css('display', 'none');
          done();
        });
      });

      it('should resize the masonry when the container becomes visible', function(done) {
        var m = $container.find('coral-masonry')[0];
        var heightBefore = m.$.height();
        $container.show();

        helpers.masonryLayouted(m, function() {
          expect(m.$.height()).to.be.above(heightBefore);
          done();
        });
      });
    });

    describe('changing items', function() {
      var m;
      var firstItem;
      var scheduleLayoutSpy;

      before(function() {
        scheduleLayoutSpy = sinon.spy(Coral.Masonry.prototype, '_scheduleLayout'); // before bind() happens
      });

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
          m = m2;
          firstItem = m.items.getAll()[0];
          done();
        });
      });

      after(function() {
        scheduleLayoutSpy.restore();
      });

      it('should relayout when the text of an item changes', function(done) {
        scheduleLayoutSpy.reset();
        firstItem.firstChild.data += ' ... some text which is definitely longer then the column width';
        helpers.next(function() { // observer callback
          expect(scheduleLayoutSpy).to.be.called;
          done();
        });
      });

      it('should relayout when the children of an item change', function(done) {
        scheduleLayoutSpy.reset();
        firstItem.$.append('<div style="height: 100px">');
        helpers.next(function() { // observer callback
          expect(scheduleLayoutSpy).to.be.called;
          done();
        });
      });

      it('should relayout when an item becomes hidden', function(done) {
        scheduleLayoutSpy.reset();
        firstItem.hide();
        helpers.next(function() { // observer callback
          expect(scheduleLayoutSpy).to.be.called;
          done();
        });
      });

      it('should relayout when an item becomes visible again', function(done) {
        firstItem.hide();
        Coral.commons.transitionEnd(m, function() {
          scheduleLayoutSpy.reset();
          firstItem.show();
          helpers.next(function() { // observer callback
            expect(scheduleLayoutSpy).to.be.called;
            done();
          });
        });
      });

      // Skipped until CUI-5682 is fixed
      it.skip('should not relayout when an item changes its position', function(done) {
        // After two frames the is-loaded class should be set and the DOM should be stable (see also is-loaded tests)
        helpers.next(function() {
          helpers.next(function() {
            expect(m.$).to.have.class('is-loaded');

            expect(m._layoutScheduled).to.equal(false);

            scheduleLayoutSpy.reset();
            firstItem.$.css({
              left: 100,
              top: 100,
              transform: 'translate(100px, 100px)'
            });
            m._observer.takeRecords(); // ignore the .css() call above

            helpers.next(function() { // wait until schedule would normally have been called
              expect(scheduleLayoutSpy).to.not.be.called;
              done();
            });
          });
        });
      });

    });

  });

});
