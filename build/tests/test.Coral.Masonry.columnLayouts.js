describe('Coral.Masonry.columnLayouts', function() {
  'use strict';

  var layoutNames = ['fixed-centered', 'fixed-spread', 'variable', 'dashboard'];

  var m;

  beforeEach(function(done) {
    // Test layout without transitions
    helpers.build(window.__html__['Coral.Masonry.style-disable-transitions.html'], function() {
      done();
    });
  });

  afterEach(function() {
    m = null;
  });

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.Masonry).to.have.property('Layout');

      var layouts = Coral.Masonry._layouts;
      layoutNames.forEach(function(layoutName) {
        var layout = layouts[layoutName];
        expect(layout.prototype).to.have.property('name', layoutName);
        expect(layout.prototype).to.be.an.instanceof(Coral.Masonry.Layout);
      });
    });
  });

  describe('API #layout', function() {
    function testLayouts(testName, work, tests) {
      Object.keys(tests).forEach(function(key) {
        key.split(/,/).forEach(function(layoutName) {
          layoutName = layoutName.trim();
          it('for ' + layoutName + ' layout ' + testName, function(done) {
            m.layout = layoutName;
            helpers.next(function() { // sync layout
              var result = work();
              tests[key].apply(null, result);
              done();
            });
          });
        });
      });
    }

    describe('columns', function() {

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.no-layout.centered.html'], function(m2) {
          m = m2;
          done();
        });
      });

      testLayouts(
        'should be centered',
        function() {
          return [
            m.getBoundingClientRect(),
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[2].getBoundingClientRect()
          ];
        },
        {
          'fixed-centered, fixed-spread, variable, dashboard': function(masonryRect, leftRect, rightRect) {
            expect(leftRect.left - masonryRect.left).to.equal(masonryRect.right - rightRect.right);
          }
        }
      );

    });

    describe('column width', function() {

      var columnWidth = 100;
      var item;

      beforeEach(function() {
        m = new Coral.Masonry();
        helpers.target.appendChild(m);
        m.setAttribute('columnwidth', columnWidth);
        item = new Coral.Masonry.Item();
        m.appendChild(item);
      });

      testLayouts(
        'attribute must be obeyed',
        function() {
          return [
            item.getBoundingClientRect()
          ];
        },
        {
          'fixed-centered, fixed-spread': function(itemRect) {
            expect(itemRect.width).to.equal(columnWidth);
          }
        },
        {
          'variable, dashboard': function(itemRect) {
            expect(itemRect.width).to.be.least(columnWidth);
          }
        }
      );

      testLayouts(
        'attribute must be obeyed even with padding, border and margin set',
        function() {
          item.$.css({
            border: '11px solid red',
            padding: 12,
            margin: 13
          });
        },
        {
          'fixed-centered, fixed-spread': function() {
            var itemRect = item.getBoundingClientRect();
            expect(itemRect.width).to.equal(columnWidth);
          }
        },
        {
          'variable, dashboard': function() {
            var itemRect = item.getBoundingClientRect();
            expect(itemRect.width).to.be.least(columnWidth);
          }
        }
      );

    });

    describe('spacing with attribute', function() {

      var spacing = 20;

      beforeEach(function() {
        m = new Coral.Masonry();
        helpers.target.appendChild(m);

        m.$.width(300);
        m.setAttribute('spacing', spacing);
        m.setAttribute('columnwidth', 100);
        m.appendChild(new Coral.Masonry.Item());
        m.appendChild(new Coral.Masonry.Item());
      });

      testLayouts(
        'should be obeyed between items',
        function() {
          return [
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[1].getBoundingClientRect()
          ];
        },
        {
          'fixed-centered, variable, dashboard': function(ir1, ir2) {
            expect(ir2.left - ir1.right).to.equal(spacing);
          },
          'fixed-spread': function(ir1, ir2) {
            expect(ir2.left - ir1.right).to.be.least(spacing);
          }
        }
      );

      testLayouts(
        'should be obeyed between item and container',
        function() {
          return [
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[1].getBoundingClientRect(),
            m.getBoundingClientRect()
          ];
        },
        {
          'variable, dashboard': function(ir1, ir2, mr) {
            expect(ir1.left - mr.left).to.equal(spacing);
            expect(mr.right - ir2.right).to.equal(spacing);
          },
          'fixed-centered, fixed-spread': function(ir1, ir2, mr) {
            expect(ir1.left - mr.left).to.be.least(spacing);
            expect(mr.right - ir2.right).to.be.least(spacing);
          }
        }
      );

    });

    describe('advanced spacing with CSS', function() {

      beforeEach(function(done) {
        m = new Coral.Masonry();
        helpers.target.appendChild(m);

        m.$.width(500);
        m.setAttribute('columnwidth', 100);
        m.appendChild(new Coral.Masonry.Item());
        m.appendChild(new Coral.Masonry.Item());

        helpers.build(window.__html__['Coral.Masonry.style-spacing.html'], function() {
          done();
        });
      });

      // Pixel values from style-spacing.html

      testLayouts(
        'should be obeyed between items',
        function() {
          return [
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[1].getBoundingClientRect()
          ];
        },
        {
          'fixed-centered, variable, dashboard': function(ir1, ir2) {
            expect(ir2.left - ir1.right).to.equal(34 + 38);
          },
          'fixed-spread': function(ir1, ir2) {
            expect(ir2.left - ir1.right).to.be.least(34 + 38);
          }
        }
      );

      testLayouts(
        'should be obeyed between item and vertical container',
        function() {
          return [
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[1].getBoundingClientRect(),
            m.getBoundingClientRect()
          ];
        },
        {
          'fixed-centered, fixed-spread, variable, dashboard': function(ir1, ir2, mr) {
            expect(ir1.top - mr.top).to.equal(12 + 32);
            expect(mr.bottom - ir1.bottom).to.equal(26 + 36);
          }
        }
      );

      testLayouts(
        'should be obeyed between item and horizontal container',
        function() {
          return [
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[1].getBoundingClientRect(),
            m.getBoundingClientRect()
          ];
        },
        {
          'variable, dashboard': function(ir1, ir2, mr) {
            expect(ir1.left - mr.left).to.equal(28 + 38);
            expect(mr.right - ir2.right).to.equal(34 + 14);
          },
          'fixed-centered, fixed-spread': function(ir1, ir2, mr) {
            expect(ir1.left - mr.left).to.be.least(28 + 38);
            expect(mr.right - ir2.right).to.be.least(34 + 14);
          }
        }
      );

    });

    describe('multi column', function() {

      var multiColumnItem;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.multi-column.html'], function(m2) {
          m = m2;
          multiColumnItem = m.items.getAll()[2];
          done();
        });
      });

      it('should render the item on the next line if there is not enough space', function() {
        var itemsAbove = m.items.getAll().slice(0, 2);
        var multiColumnItemTop = multiColumnItem.getBoundingClientRect().top;
        for (var i = 0; i < itemsAbove.length; i++) {
          var itemAboveBottom = itemsAbove[i].getBoundingClientRect().bottom;
          expect(itemAboveBottom).to.be.below(multiColumnItemTop);
        }
      });

      it('should render all items below really below', function() {
        var multiColumnItemBottom = multiColumnItem.getBoundingClientRect().bottom;
        var itemsBelow = m.items.getAll().slice(3);
        for (var i = 0; i < itemsBelow.length; i++) {
          var itemBellowTop = itemsBelow[i].getBoundingClientRect().top;
          expect(itemBellowTop).to.be.above(multiColumnItemBottom);
        }
      });

      it('should shrink multi column items if they want to span more columns than there are', function(done) {
        m.$.width(100);
        expect(multiColumnItem._layoutData.colspan).to.be.above(1);

        helpers.masonryLayouted(m, function() {
          expect(multiColumnItem._layoutData.colspan).to.equal(1);
          expect(multiColumnItem.getBoundingClientRect().width).to.be.below(100);
          done();
        });
      });

      testLayouts(
        'should be multiple times as wide as normal items but have a normal height',
        function() {
          return [
            multiColumnItem.getBoundingClientRect(),
            m.items.getAll()[0].getBoundingClientRect(),
            m.items.getAll()[5].getBoundingClientRect()
          ];
        },
        {
          'fixed-centered, fixed-spread, variable, dashboard': function(multiColumn, topLeft, bottomRight) {
            // Width
            expect(multiColumn.left).to.equal(topLeft.left);
            expect(multiColumn.right).to.equal(bottomRight.right);

            // Height
            expect(multiColumn.top).to.be.above(topLeft.bottom);
            expect(multiColumn.bottom).to.be.below(bottomRight.top);
          }
        }
      );

    });

    describe('for dashboard layout', function() {

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.dashboard.different-heights.html'], function(m2) {
          m = m2;
          done();
        });
      });

      it('should expand the height of items to fill the remaining space', function() {
        var masonryHeight = m.getBoundingClientRect().height;
        var items = m.items.getAll();
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          expect(item.getBoundingClientRect().height).to.equal(masonryHeight);
        }
      });

      it('should be able to shrink the items again', function(done) {
        var masonryHeightBefore = m.getBoundingClientRect().height;
        m.items.getAll()[2].remove();

        helpers.masonryLayouted(m, function() {
          var masonryHeight = m.getBoundingClientRect().height;
          expect(masonryHeight).to.be.below(masonryHeightBefore);

          var items = m.items.getAll();
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            expect(item.getBoundingClientRect().height).to.equal(masonryHeight);
          }
          done();
        });
      });

    });

    describe('for fixed-spread layout', function() {

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.fixed-spread.left-aligned.html'], function(m2) {
          m = m2;
          done();
        });
      });

      it('should align the items on the left if the first row is not filled', function() {
        expect(m.items.getAll()[0].getBoundingClientRect().left).to.equal(0);
      });

      it('should spread the items if the first row is filled', function(done) {
        m.items.add(new Coral.Masonry.Item());

        helpers.masonryLayouted(m, function() {
          expect(m.items.getAll()[0].getBoundingClientRect().left).to.not.equal(0);
          done();
        });
      });

    });


    describe('for fixed-centered layout', function() {

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.Masonry.fixed-centered.2-items.html'], function(m2) {
          m = m2;
          done();
        });
      });

      it('should center the items even if the first row is not filled', function() {
        var items = m.items.getAll();
        var mr = m.getBoundingClientRect();
        var paddingLeft = items[0].getBoundingClientRect().left - mr.left;
        var paddingRight = mr.right - items[1].getBoundingClientRect().right;
        expect(paddingLeft).to.equal(paddingRight);
      });

    });

  });

  describe('API', function() {

    var layout;

    beforeEach(function(done) {
      helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
        m = m2;
        layout = m._layout;
        done();
      });
    });

    describe('#destroy', function() {
      it('should remove the item data', function() {
        expect(m.items.getAll()[0]._layoutData).to.be.an('object');
        layout.destroy();
        expect(m.items.getAll()[0]._layoutData).to.be.undefined;
      });

    });

    describe('#detach', function() {
      it('should allow to position an item differently', function(done) {
        var firstItem = m.items.getAll()[0];
        var left = firstItem.getBoundingClientRect().left;
        layout.detach(firstItem);
        firstItem.$.css('transform', 'translate(1000px,1000px)');

        layout.layout();

        helpers.masonryLayouted(m, function() {
          expect(firstItem.getBoundingClientRect().left).to.not.equal(left);
          expect(m.items.getAll()[1].getBoundingClientRect().left).to.equal(left);
          done();
        });
      });

    });

    describe('#reattach', function() {
      it('should position an item after detaching normally again', function(done) {
        var firstItem = m.items.getAll()[0];
        var left = firstItem.getBoundingClientRect().left;

        layout.detach(firstItem);
        firstItem.$.css({
          transform: 'translate(1000px,1000px)',
          left: 1000,
          top: 1000
        });

        layout.layout(); // force
        layout.reattach(firstItem);

        helpers.transitionEnd(firstItem, function() {
          expect(firstItem.getBoundingClientRect().left).to.equal(left);
          done();
        });
      });

    });

    describe('#getPosition', function() {

      beforeEach(function(done) {
        m.spacing = 0;
        m.$.css('margin', 100);
        helpers.masonryLayouted(m, function() {
          done();
        });
      });

      var zeroPosition = {
        left: 0,
        top: 0
      };

      it('should return null if the element is not an item', function() {
        expect(layout.getPosition(document.body)).to.be.null;
      });

      it('should return the position relatively to the masonry', function() {
        var item = m.items.getAll()[0];
        expect(layout.getPosition(item)).to.deep.equal(zeroPosition);
      });

      it('should return the future position if the item is being transitioned', function(done) {
        m.items.getAll()[0].remove();

        // Transition hasn't started yet
        var item = m.items.getAll()[0];
        expect(layout.getPosition(item)).to.not.deep.equal(zeroPosition);

        helpers.masonryLayouted(m, function() {
          expect(layout.getPosition(item)).to.deep.equal(zeroPosition);
          done();
        });
      });

    });

    describe('#itemAt', function() {

      it('should return null if the position is outside the masonry', function() {
        expect(layout.itemAt(-100, -100)).to.be.null;
        expect(layout.itemAt(1000, 1000)).to.be.null;
      });

      it('should return the item for a given relative position', function() {
        var width = m.$.width();
        var height = m.$.height();
        var center = width / 2;

        expect(layout.itemAt(5, 5)).to.equal(m.items.getAll()[0]);
        expect(layout.itemAt(center, 5)).to.equal(m.items.getAll()[1]);
        expect(layout.itemAt(width - 5, 5)).to.equal(m.items.getAll()[2]);

        expect(layout.itemAt(center, height / 2)).to.equal(m.items.getAll()[4]);
        expect(layout.itemAt(center, height - 5)).to.equal(m.items.getAll()[7]);
      });

      it('should return the item which is being transitioned to the given relative position', function(done) {
        m.items.getAll()[0].remove();

        // Transition hasn't started yet, but item is already missing
        expect(layout.itemAt(0, 0)).to.be.null;

        helpers.masonryLayouted(m, function() {
          expect(layout.itemAt(0, 0)).to.equal(m.items.getAll()[0]);
          done();
        });
      });

    });

  });

  describe('user interaction', function() {

    beforeEach(function(done) {
      helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
        m = m2;
        done();
      });
    });

    function testMoveFocus(startIndex, keyCode, expectedEndIndex) {
      var item = m.children[startIndex];
      helpers.keypress(keyCode, item);
      helpers.expectActive(m.children[expectedEndIndex]);
    }

    function kc(key) {
      return key.charCodeAt(0) - 'a'.charCodeAt(0) + 65;
    }

    // left
    it('arrow left should focus the left item', function() {
      testMoveFocus(4, 37, 3);
    });
    it('arrow h should focus the left item', function() {
      testMoveFocus(4, kc('h'), 3);
    });

    // right
    it('arrow right should focus the right item', function() {
      testMoveFocus(4, 39, 5);
    });
    it('key l should focus the right item', function() {
      testMoveFocus(4, kc('l'), 5);
    });

    // up
    it('arrow up should focus the upper item', function() {
      testMoveFocus(4, 38, 1);
    });
    it('key k should focus the upper item', function() {
      testMoveFocus(4, kc('k'), 1);
    });

    // down
    it('arrow down should focus the lower item', function() {
      testMoveFocus(4, 40, 7);
    });
    it('key j should focus the upper item', function() {
      testMoveFocus(4, kc('j'), 7);
    });

  });

  describe('behaviour', function() {

    beforeEach(function(done) {
      helpers.build(window.__html__['Coral.Masonry.variable.3-columns-9-items.html'], function(m2) {
        m = m2;
        done();
      });
    });

    it('hiding should be supported', function(done) {
      var firstItem = m.items.getAll()[0];
      var secondItem = m.items.getAll()[1];
      var left = firstItem.getBoundingClientRect().left;
      firstItem.hide(); // hide first item
      helpers.masonryLayouted(m, function() {
        expect(secondItem.getBoundingClientRect().left).to.equal(left);
        done();
      });
    });

    it('showing again should be supported', function(done) {
      var firstItem = m.items.getAll()[0];
      var secondItem = m.items.getAll()[1];
      var left = secondItem.getBoundingClientRect().left;
      firstItem.hide(); // hide first item
      helpers.masonryLayouted(m, function() {
        firstItem.show(); // show first item again
        helpers.masonryLayouted(m, function() {
          expect(secondItem.getBoundingClientRect().left).to.be.equal(left);
          done();
        });
      });
    });
  });
});
