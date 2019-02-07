import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {List, ButtonList, AnchorList} from '../../../coral-component-list';

describe('List', function() {
  
  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-list>') instanceof List).to.equal(true);
    });
  
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-buttonlist>') instanceof ButtonList).to.equal(true);
    });
  
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-anchorlist>') instanceof AnchorList).to.equal(true);
    });
  
    it('should support co-existing anchor/button/list items', function() {
      const el = helpers.build(window.__html__['List.mixed.html']);
      expect(el.items.length).to.equal(3);
    });
    
    helpers.cloneComponent(
      'should be possible via cloneNode using markup',
      window.__html__['List.mixed.html']
    );
  });
  
  describe('API', function() {
    describe('#interaction', function() {});
    
    describe('#focus', function() {
      it('should focus on the first selectable element, thus ignoring the hidden elements', function() {
        const el = helpers.build(window.__html__['List.hidden.html']);
        const expectedFocusedElement = document.getElementById('firstSelectableElement');
      
        el.focus();
      
        expect(expectedFocusedElement).to.equal(document.activeElement);
      });
    
      it('should move focus on the last selectable element, thus ignoring the hidden elements', function() {
        const el = helpers.build(window.__html__['List.hidden.html']);
        const expectedFocusedElement = document.getElementById('lastSelectableElement');
      
        el.focus();
      
        helpers.keypress('up', document.activeElement);
      
        expect(expectedFocusedElement).to.equal(document.activeElement);
      });
    });
  });
  
  describe('Tracking', function () {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    describe('AnchorList', function() {
      it('should call the tracker callback with the expected trackData parameters when an item is clicked', function () {
        const el = helpers.build(window.__html__['AnchorList.tracking.html']);
        var items = el.items.getAll();
        items[0].click();
        
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');
        
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'coral-anchorlist-item');
        expect(trackData).to.have.property('targetElement', 'Community');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootType', 'coral-anchorlist');
      });
      
      it('should call the tracker callback with the expected trackData parameters when an annotated item is clicked', function () {
        const el = helpers.build(window.__html__['AnchorList.tracking.html']);
        var items = el.items.getAll();
        items[1].click();
        
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        
        expect(trackData).to.have.property('targetType', 'coral-anchorlist-item');
        expect(trackData).to.have.property('targetElement', 'New stuff');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootType', 'coral-anchorlist');
      });
    });
    
    describe('ButtonList', function() {
      it('should call the tracker callback with the expected trackData parameters when an item is clicked', function () {
        const el = helpers.build(window.__html__['ButtonList.tracking.html']);
        var items = el.items.getAll();
        items[0].click();
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');
        
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'coral-buttonlist-item');
        expect(trackData).to.have.property('targetElement', 'Community');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootType', 'coral-buttonlist');
      });
      
      it('should call the tracker callback with the expected trackData parameters when an annotated item is clicked', function () {
        const el = helpers.build(window.__html__['ButtonList.tracking.html']);
        var items = el.items.getAll();
        items[1].click();
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should have been called only once.');
        
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'coral-buttonlist-item');
        expect(trackData).to.have.property('targetElement', 'New stuff');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootType', 'coral-buttonlist');
      });
    });
  });
});
