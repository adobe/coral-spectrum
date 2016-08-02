describe('Coral.TabView', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('TabView');
    });
  });

  function testDefaultInstance(el) {
    expect(el.$).to.have.class('coral-TabView');
    expect(el.tabList).not.to.be.null;
    expect(el.panelStack).not.to.be.null;

    expect(el.$).not.to.have.attr('orientation');
  }

  describe('instantiation', function() {
    it('should be possible using new', function() {
      var el = new Coral.TabView();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-tabview');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-tabview></coral-tabview>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });
  });

  var body = document.querySelector('body');
  var el;
  var tab1, tab2, tab3;
  var panel1, panel2, panel3;

  beforeEach(function() {
    el = new Coral.TabView();
    body.appendChild(el);

    tab1 = new Coral.Tab();
    tab1.label.innerHTML = 'Item 1';

    tab2 = new Coral.Tab();
    tab2.label.innerHTML = 'Item 2';

    tab3 = new Coral.Tab();
    tab3.label.innerHTML = 'Item 3';

    panel1 = new Coral.Panel();
    panel1.content.innerHTML = 'Content 1';

    panel2 = new Coral.Panel();
    panel2.content.innerHTML = 'Content 1';

    panel3 = new Coral.Panel();
    panel3.content.innerHTML = 'Content 1';
  });

  afterEach(function() {
    body.removeChild(el);
    el = tab1 = tab2 = tab3 = panel1 = panel2 = panel3 = null;
  });

  describe('API', function() {

    describe('#orientation', function() {
      it('should default to Coral.TabView.orientation.HORIZONTAL', function() {
        expect(el.orientation).to.equal(Coral.TabView.orientation.HORIZONTAL);
      });

      it('should be settable', function(done) {
        el.orientation = Coral.TabView.orientation.VERTICAL;
        expect(el.orientation).to.equal(Coral.TabView.orientation.VERTICAL);

        Coral.commons.nextFrame(function() {
          expect(el.$).to.have.class('coral-TabView--vertical');
          done();
        });
      });
    });
  });

  describe('events', function() {

    it('should trigger a coral-tabview:change event when an item is selected', function() {
      var spy = sinon.spy();
      el.on('coral-tabview:change', spy);
      el.tabList.appendChild(tab1);
      el.tabList.appendChild(tab2);
      el.panelStack.appendChild(panel1);
      el.panelStack.appendChild(panel2);

      tab1.selected = true;
      expect(spy.callCount).to.equal(1);
      expect(spy.getCall(0).calledWithMatch({
        detail: {
          oldSelection: null,
          selection: tab1
        }
      })).to.be.true;

      tab2.selected = true;
      expect(spy.callCount).to.equal(2);
      expect(spy.getCall(1).calledWithMatch({
        detail: {
          oldSelection: tab1,
          selection: tab2
        }
      })).to.be.true;
    });
  });

  describe('user interaction', function() {
    var defaultMarkup = window.__html__['Coral.TabView.base.html'];

    it.skip('should select the tab by pressing meta+pageup inside panel ', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();
        var button = el.$.find('button')[0];

        var spy = sinon.spy(items[0], 'focus');

        helpers.keypress('pageup', button, ['meta']);

        expect(el.selectedItem).to.equal(items[0]);
        expect(spy.callCount).to.equal(1);

        helpers.keypress('pageup', button, ['shift']);

        expect(el.selectedItem).to.equal(items[0]);
        expect(spy.callCount).to.equal(1);

        helpers.keypress('pageup', button, ['ctrl']);

        expect(el.selectedItem).to.equal(items[0]);
        expect(spy.callCount).to.equal(2);
        done();
      });
    });

    it.skip('should select the next tab by pressing meta+pagedown inside panel', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();
        var button = el.$.find('button')[0];

        expect(el.selectedItem).to.equal(items[0]);

        helpers.keypress('pagedown', button, ['meta']);

        expect(el.selectedItem).to.equal(items[1]);

        // goes back to the first item since this is the only one that has a button
        items[0].selected = true;

        helpers.keypress('pagedown', button, ['shift']);

        expect(el.selectedItem).to.equal(items[0]);

        helpers.keypress('pagedown', button, ['ctrl']);

        expect(el.selectedItem).to.equal(items[1]);
        done();
      });
    });
  });
});
