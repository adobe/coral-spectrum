/*global helpers:true*/
/*jshint camelcase:false */
describe('Coral.SelectList', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('SelectList');
    });
  });

  describe('instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.$).to.have.class('coral3-SelectList');
      expect(el.selectedItem).to.be.null;
      expect(el.selectedItems).to.be.empty;
      expect(el.$).not.to.have.attr('selectedItem');
      expect(el.$).not.to.have.attr('selectedItems');
      expect(el.$).not.to.have.attr('multiple');
      expect(el.$).not.to.have.attr('items');
      expect(el.$).to.have.attr('role', 'listbox');
    }

    it('should be possible using new', function() {
      var el = new Coral.SelectList();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-selectlist');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-selectlist></coral-selectlist>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.SelectList.base.html'], function(sl) {
        helpers.testComponentClone(sl, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var sl = new Coral.SelectList();
      helpers.target.appendChild(sl);

      helpers.next(function() {
        helpers.testComponentClone(sl, done);
      });
    });
  });

  describe('Selection mixin tests', function() {
    helpers.testSelectionList(Coral.SelectList, Coral.SelectList.Item);
  });

  describe('API', function() {

    describe('#selectedItem', function() {
      it('should default to null', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          expect(el.selectedItem).to.be.null;
          expect(el.selectedItems.length).to.equal(0);
          done();
        });
      });

      it('should take the last selected if not multiple', function(done) {
        helpers.build(window.__html__['Coral.SelectList.doubleselected.html'], function(el) {
          var items = el.items.getAll();
          expect(el.multiple).to.be.false;
          expect(el.selectedItem).to.equal(items[2]);
          expect(el.selectedItems).to.deep.equal([items[2]]);
          expect(items[2].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[2].selected).to.be.true;
            expect(items[2].$).to.have.attr('selected');
            expect(items[0].$).not.to.have.attr('selected');
            expect(items[0].selected).to.be.false;
            // checks again the items
            expect(el.selectedItem).to.equal(items[2]);
            expect(el.selectedItems).to.deep.equal([items[2]]);
            done();
          });
        });
      });

      it('should take the first selected with multiple', function(done) {
        helpers.build(window.__html__['Coral.SelectList.multiple.html'], function(el) {
          var items = el.items.getAll();
          expect(el.multiple).to.be.true;
          expect(el.selectedItem).to.equal(items[0]);
          expect(el.selectedItems).to.deep.equal([items[0], items[2]]);
          expect(items[0].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[0].selected).to.be.true;
            expect(items[0].$).to.have.attr('selected');
            expect(items[2].$).to.have.attr('selected');
            expect(items[2].selected).to.be.true;
            // checks again the items
            expect(el.selectedItem).to.equal(items[0]);
            expect(el.selectedItems).to.deep.equal([items[0], items[2]]);
            done();
          });
        });
      });

      it('should read the selected from the markup', function(done) {
        helpers.build(window.__html__['Coral.SelectList.selected.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          done();
        });
      });
    });

    describe('#selectedItems', function() {});

    describe('#multiple', function() {});

    describe('#loading', function() {
      it('should show a loading indicator when set to true', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          el.loading = true;

          helpers.next(function() {
            var $indicator = $(el).children('.coral-SelectList-loading');
            expect($indicator.length).to.equal(1);
            done();
          });
        });
      });

      it('should hide a loading indicator when set to false', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          el.loading = true;

          helpers.next(function() {
            el.loading = false;

            helpers.next(function() {
              var $indicator = $(el).children('.coral-SelectList-loading');
              expect($indicator.length).to.equal(0);
              done();
            });
          });
        });
      });

      it('should always add the loading at the end', function(done) {
        helpers.build(window.__html__['Coral.SelectList.base.html'], function(el) {
          el.loading = true;

          helpers.next(function() {
            el.loading = false;

            helpers.next(function() {
              var $indicator = $(el).children('.coral-SelectList-loading');
              expect($indicator.length).to.equal(0);

              el.items.add({
                value: 'other',
                content: {
                  innerHTML: 'Other'
                }
              });

              el.loading = true;

              helpers.next(function() {

                var $indicator = $(el).children().last();

                expect($indicator).to.have.class('coral-SelectList-loading');
                done();
              });
            });
          });
        });
      });
    });

    describe('#items', function() {});

    describe('#groups', function() {
      var selectList;
      var $selectList;

      beforeEach(function(done) {
        helpers.build(window.__html__['Coral.SelectList.groups.html'], function(element) {
          selectList = element;
          $selectList = $(selectList);
          done();
        });
      });

      it('retrieves all groups', function() {
        var groups = selectList.groups.getAll();
        expect(groups.length).to.equal(2);
      });

      it('adds a group instance', function() {
        var group = new Coral.SelectList.Group();
        group.label = 'Test group';

        selectList.groups.add(group);

        var $groups = $selectList.children('coral-selectlist-group');
        expect($groups.length).to.equal(3);
        expect($groups.get(2).label).to.equal('Test group');
      });

      it('adds a group using a config object', function() {
        selectList.groups.add({
          label: 'Test group'
        });

        var $groups = $selectList.children('coral-selectlist-group');
        expect($groups.length).to.equal(3);
        expect($groups.get(2).label).to.equal('Test group');
      });

      it('removes a group', function() {
        var group = selectList.groups.getAll()[0];
        selectList.groups.remove(group);

        var $groups = $selectList.children('coral-selectlist-group');
        expect($groups.length).to.equal(1);
        expect(group.parentNode).to.be.null;
      });

      it('clears all groups', function() {
        selectList.groups.clear();

        var $groups = $selectList.children('coral-selectlist-group');
        expect($groups.length).to.equal(0);
      });
    });
  });

  describe('events', function() {

    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = new Coral.SelectList();
      helpers.target.appendChild(el);

      item1 = new Coral.SelectList.Item();
      item1.label = 'Item 1';

      item2 = new Coral.SelectList.Item();
      item2.label = 'Item 2';

      item3 = new Coral.SelectList.Item();
      item3.label = 'Item 3';
    });

    afterEach(function() {
      helpers.target.removeChild(el);
      el = item1 = item2 = item3 = null;
    });

    describe('coral-selectlist:change', function() {});

    describe('coral-selectlist:scrollbottom', function() {

      it('should trigger a scrollbottom event when user scrolls to the bottom of the list', function(done) {
        for (var i = 0; i < 50; i++) {
          el.items.add({
            value: 'value' + i,
            content: {
              innerHTML: 'content' + i
            }
          });
        }

        // Give the newly-added items time to render.
        helpers.next(function() {
          var spy = sinon.spy();
          var clock = sinon.useFakeTimers();

          el.on('coral-selectlist:scrollbottom', spy);

          el.scrollTop = 10000;
          el.trigger('scroll');
          clock.tick(1000); // Fast-forward past scroll debounce.

          expect(spy.callCount).to.equal(1);

          // If the user scrolls again but doesn't scroll outside of the bottom threshold
          // distance it should still trigger another scrollbottom event.
          el.scrollTop -= 10;
          el.trigger('scroll');
          clock.tick(1000); // Fast-forward past scroll debounce.

          expect(spy.callCount).to.equal(2);

          clock.restore();
          done();
        });
      });
    });
  });

  describe('user interaction', function() {
    // @todo: test focus of initial state
    // @todo: test focus of an empty list
    // @todo: test focus of a list with a selected item
    // @todo: focus on a hidden selected item
    // @todo: add a test for focus() and no children
  });
});

describe('Coral.SelectList.Item', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.SelectList).to.have.property('Item');
    });
  });

  describe('instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.$).to.have.class('coral3-SelectList-item');
      expect(el.$).not.to.have.attr('value');
      expect(el.$).to.have.attr('role', 'option');
    }

    it('should be possible using new', function() {
      var el = new Coral.SelectList.Item();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-selectlist-item');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-selectlist-item></coral-selectlist-item>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });
  });

  describe('value property', function() {
    it('should return textContent if not explictly set', function() {
      var el = new Coral.SelectList.Item();
      el.textContent = 'Test 123';

      expect(el.value).to.equal('Test 123');
      expect(el.$).not.to.have.attr('value');
    });

    it('should reflect an explicitly set string value', function() {
      var el = new Coral.SelectList.Item();
      el.value = 'Test 123';

      expect(el.value).to.equal('Test 123');
      expect(el.$).to.have.attr('value', 'Test 123');
    });
  });

  describe('content property', function() {
    it('should reference the item', function() {
      var el = new Coral.SelectList.Item();
      expect(el.content).to.equal(el);
    });
  });
});

describe('Coral.SelectList.Group', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral.SelectList).to.have.property('Group');
    });
  });

  describe('instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.$).to.have.class('coral-SelectList-group');
      expect(el.$).not.to.have.attr('label');
      expect(el.$).to.have.attr('role', 'group');
    }

    it('should be possible using new', function() {
      var el = new Coral.SelectList.Group();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-selectlist-group');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-selectlist-group></coral-selectlist-group>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });
  });

  describe('label property', function() {
    it('should reflect an explicitly set string value', function() {
      var el = new Coral.SelectList.Group();
      el.label = 'Test 123';

      expect(el.label).to.equal('Test 123');
      // Necessary for CSS to function since we're using a pseudoelement with content: attr(label)
      expect(el.$).to.have.attr('label', 'Test 123');
    });
  });

  describe('items', function() {
    var group;
    var $group;

    beforeEach(function(done) {
      helpers.build(window.__html__['Coral.SelectList.groups.html'], function(element) {
        group = element.groups.getAll()[0];
        $group = $(group);
        done();
      });
    });

    it('retrieves all items', function() {
      var items = group.items.getAll();
      expect(items.length).to.equal(3);
    });

    it('adds an item instance', function() {
      var item = new Coral.SelectList.Item();
      item.value = 'ti';
      item.content.innerHTML = 'Test Item';

      group.items.add(item);

      item = $group.children('coral-selectlist-item').get(3);
      expect(item.value).to.equal('ti');
    });

    it('adds an item using a config object', function() {
      group.items.add({
        value: 'ti',
        content: {
          innerHTML: 'Test Item'
        }
      });

      var item = $group.children('coral-selectlist-item').get(3);
      expect(item.value).to.equal('ti');
    });

    it('removes an item', function() {
      var item = group.items.getAll()[0];
      group.items.remove(item);

      var $items = $group.children('coral-selectlist-item');
      expect($items.length).to.equal(2);
      expect(item.parentNode).to.be.null;
    });

    it('clears all items', function() {
      group.items.clear();

      var $items = $group.children('coral-selectlist-item');
      expect($items.length).to.equal(0);
    });
  });
});
