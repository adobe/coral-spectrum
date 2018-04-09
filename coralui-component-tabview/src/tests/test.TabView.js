import {helpers} from '../../../coralui-util/src/tests/helpers';
import {TabView} from '../../../coralui-component-tabview';
import {Tab} from '../../../coralui-component-tablist';
import {Panel} from '../../../coralui-component-panelstack';

describe('TabView', function() {
  
  function testDefaultInstance(el) {
    expect(el.classList.contains('_coral-TabView')).to.be.true;
    expect(el.tabList).not.to.be.null;
    expect(el.panelStack).not.to.be.null;

    expect(el.hasAttribute('orientation')).to.be.true;
  }

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var el = helpers.build(new TabView());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-tabview'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function() {
      const el = helpers.build('<coral-tabview></coral-tabview>');
      testDefaultInstance(el);
    });

    it('should position the tablist before the panelstack', function() {
      const el = helpers.build(window.__html__['TabView.order.html']);
      expect(el.tabList).to.equal(el.firstElementChild);
      expect(el.panelStack).to.equal(el.lastElementChild);
    });
  
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['TabView.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new TabView());
    });
  
    it('should be possible to clone an an instance with selected item', function() {
      helpers.cloneComponent(window.__html__['TabView.selectedItem.html']);
    });
  });

  describe('API', function() {
  
    var el;
    var tab1, tab2, tab3;
    var panel1, panel2, panel3;
  
    beforeEach(function() {
      el = new TabView();
    
      tab1 = new Tab();
      tab1.label.innerHTML = 'Item 1';
    
      tab2 = new Tab();
      tab2.label.innerHTML = 'Item 2';
    
      tab3 = new Tab();
      tab3.label.innerHTML = 'Item 3';
    
      panel1 = new Panel();
      panel1.content.innerHTML = 'Content 1';
    
      panel2 = new Panel();
      panel2.content.innerHTML = 'Content 1';
    
      panel3 = new Panel();
      panel3.content.innerHTML = 'Content 1';
    });
  
    afterEach(function() {
      el = tab1 = tab2 = tab3 = panel1 = panel2 = panel3 = null;
    });

    describe('#orientation', function() {
      it('should default to TabView.orientation.HORIZONTAL', function() {
        expect(el.orientation).to.equal(TabView.orientation.HORIZONTAL);
      });

      it('should be settable', function() {
        el.orientation = TabView.orientation.VERTICAL;
        expect(el.orientation).to.equal(TabView.orientation.VERTICAL);
        expect(el.classList.contains('_coral-TabView--vertical')).to.be.true;
      });
  
      it('should set orientation to tablist', function() {
        const el = helpers.build(window.__html__['TabView.orientation.html']);
        expect(el.orientation).to.equal(TabView.orientation.VERTICAL);
        expect(el.classList.contains('_coral-TabView--vertical')).to.be.true;
        expect(el.tabList.getAttribute('orientation')).to.equal(TabView.orientation.VERTICAL);
      });
    });
  });

  describe('Events', function() {
    describe('#coral-tabview:change', function() {
      it('should trigger when an item is selected', function() {
        const el = helpers.build(window.__html__['TabView.base.html']);
        const tab1 = el.tabList.items.first();
        const tab3 = el.tabList.items.last();
        
        var changeSpy = sinon.spy();
        el.on('coral-tabview:change', changeSpy);
    
        tab3.selected = true;
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(tab3);
        expect(changeSpy.args[0][0].detail.oldSelection).to.equal(tab1);
      });
    });
  });
});
