describe('Coral.SelectList.Group', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.SelectList).to.have.property('Group');
    });
  });
  
  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-SelectList-group')).to.be.true;
      expect(el.getAttribute('role')).to.equal('group');
    }
    
    it('should be possible using new', function() {
      var el = helpers.build(new Coral.SelectList.Group());
      testDefaultInstance(el);
    });
    
    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-selectlist-group'));
      testDefaultInstance(el);
    });
    
    it('should be possible using markup', function() {
      testDefaultInstance(helpers.build('<coral-selectlist-group></coral-selectlist-group>'));
    });
  });
  
  describe('API', function() {
    
    describe('#label', function() {
      it('should default to empty string', function() {
        var el = new Coral.SelectList.Group();
        expect(el.label).to.equal('');
      });
      
      it('should reflect an explicitly set string value', function() {
        var el = new Coral.SelectList.Group();
        el.label = 'Test 123';
    
        expect(el.label).to.equal('Test 123');
        expect(el.getAttribute('label')).to.equal('Test 123');
      });
    });
    
    describe('#items', function() {
      var group;
  
      beforeEach(function() {
        group = helpers.build(window.__html__['Coral.SelectList.groups.html']).groups.getAll()[0];
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
    
        item = group.getElementsByTagName('coral-selectlist-item')[3];
        expect(item.value).to.equal('ti');
      });
  
      it('adds an item using a config object', function() {
        group.items.add({
          value: 'ti',
          content: {
            innerHTML: 'Test Item'
          }
        });
    
        var item = group.getElementsByTagName('coral-selectlist-item')[3];
        expect(item.value).to.equal('ti');
      });
  
      it('removes an item', function() {
        var item = group.items.getAll()[0];
        group.items.remove(item);
    
        var items = group.getElementsByTagName('coral-selectlist-item');
        expect(items.length).to.equal(2);
        expect(item.parentNode).to.be.null;
      });
  
      it('clears all items', function() {
        group.items.clear();
    
        var items = group.getElementsByTagName('coral-selectlist-item');
        expect(items.length).to.equal(0);
      });
    });
  });
});
