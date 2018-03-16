import {helpers} from '/coralui-util/src/tests/helpers';
import {TagList, Tag} from '/coralui-component-taglist';

describe('TagList', function() {
  
  describe('Instantiation', function() {
    it('should be possible to clone a taglist with one tag using markup', function() {
      helpers.cloneComponent(window.__html__['TagList.base.html']);
    });
    
    it('should be possible to clone a taglist with multiple tags using markup', function() {
      helpers.cloneComponent(window.__html__['TagList.full.html']);
    });
    
    it('should be possible to clone using js', function() {
      var tagList = new TagList();
      tagList.items.add({
        label: {
          innerHTML: 'San José'
        },
        value: 'SJ'
      });
      tagList.items.add({
        label: {
          innerHTML: 'New York'
        },
        value: 'NY'
      });
      
      helpers.cloneComponent(tagList);
    });
  });
  
  describe('Markup', function() {
    
    describe('#items', function() {
      it('#items cannot be set', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        var items = tagList.items;
        try {
          tagList.items = null;
        }
        catch (e) {
          expect(tagList.items).to.equal(items);
        }
      });
      
      it('#add with before null should insert at the end', function() {
        var tag = new Tag();
        
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.items.add(tag, null);
        var all = tagList.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[1]).to.equal(tag);
      });
      
      it('#add is able to insert before', function() {
        var tag = new Tag();
        
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.items.add(tag, tagList.items.getAll()[0]);
        var all = tagList.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[0]).to.equal(tag);
      });
      
      it('#add should also support config', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.items.add({
          label: {
            innerHTML: 'french'
          },
          value: 'fr'
        });
        var all = tagList.items.getAll();
        var item = all[1];
        expect(all.length).to.equal(2);
        expect(item.label.innerHTML).to.equal('french');
        expect(item.value).to.equal('fr');
        expect(item.tagName).to.equal('CORAL-TAG');
      });
      
      it('should add a tag with the right role', function() {
        var eventSpy = sinon.spy();
        var tag = new Tag();
        
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add(tag);
        
        expect(eventSpy.callCount).to.equal(1, 'coral-collection:add should be called once');
        expect(eventSpy.args[0][0].detail.item.tagName).to.equal('CORAL-TAG');
        expect(eventSpy.args[0][0].detail.item.getAttribute('role')).to.equal('option');
        expect(tagList.items.length).to.equal(2);
        tagList.items.getAll().forEach(function(item) {
          expect(item.getAttribute('role')).to.equal('option');
        });
      });
      
      it('should remove a tag and remove its specific attributes tied to TagList', function() {
        var eventSpy = sinon.spy();
        
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.on('coral-collection:remove', eventSpy);
        tagList.items.remove(tagList.items.getAll()[0]);
        
        expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove should be called once');
        expect(eventSpy.args[0][0].detail.item.tagName).to.equal('CORAL-TAG');
        expect(eventSpy.args[0][0].detail.item.getAttribute('role')).not.to.equal('option');
        expect(eventSpy.args[0][0].detail.item.getAttribute('aria-selected')).not.to.equal('aria-selected');
        expect(tagList.items.length).to.equal(0);
      });
      
      it('#getAll should be empty initially', function() {
        expect((new TagList()).items.getAll().length).to.equal(0);
      });
      
      it('#getAll should retrieve 1 item', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        expect(tagList.items.getAll().length).to.equal(1);
      });
      
      it('#clear should remove all items', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.items.clear();
        expect(tagList.items.length).to.equal(0);
      });
    });
    
    describe('#values', function() {
      it('should get an array of values', function() {
        var eventSpy = sinon.spy();
        var tagList = helpers.build(new TagList());
        
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });
        
        
        var items = tagList.items.getAll();
        var values = tagList.values;
        expect(values.length).to.equal(items.length);
        expect(items[0].value).to.equal(values[0]);
        expect(items[1].value).to.equal(values[1]);
      });
      
      it('should clear all tags and set new tags provided by the array of values', function() {
        var eventSpy = sinon.spy();
        var tagList = helpers.build(new TagList());
        
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });
        tagList.values = ['Paris', 'London'];
        
        var items = tagList.items.getAll();
        expect(items[0].value).to.equal('Paris');
        expect(items[0].label.innerHTML).to.equal('Paris');
        expect(items[1].label.innerHTML).to.equal('London');
        expect(items[1].label.innerHTML).to.equal('London');
      });
    });
    
    describe('#value', function() {
      it('should create an input related to the tag item', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        
        tagList.items.getAll().forEach(function(item) {
          expect(item.querySelector('input[type="hidden"]')).not.to.be.null;
        });
      });
      
      it('should set the value to the input related to the tag', function() {
        var tagList = helpers.build(new TagList());
        
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        
        expect(tagList.items.getAll()[0]._input.value).to.equal('SJ');
        expect(tagList.items.getAll()[0].value).to.equal('SJ');
        expect(tagList.value).to.equal('SJ');
        expect(tagList.values[0]).to.equal('SJ');
      });
      
      it('should be set to the label when using the the collection API', function() {
        var tagList = helpers.build(new TagList());
        
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          }
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJO'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ1'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: ''
        });
        
        var items = tagList.items.getAll();
        expect(items[0].label.innerHTML).to.equal('San José');
        expect(items[0].value).to.equal('San José');
        expect(items[1].label.innerHTML).to.equal('San José');
        expect(items[1].value).to.equal('SJO');
        expect(items[2].label.innerHTML).to.equal('San José');
        expect(items[2].value).to.equal('SJ');
        expect(items[3].label.innerHTML).to.equal('San José');
        expect(items[3].value).to.equal('SJ1');
        expect(items[4].label.innerHTML).to.equal('San José');
        expect(items[4].value).to.equal('');
      });
      
      it('should not allow duplicate tag values', function() {
        var eventSpy = sinon.spy();
        var tagList = helpers.build(new TagList());
        
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        
        var items = tagList.items.getAll();
        expect(eventSpy.callCount).to.equal(1);
        expect(items.length).to.equal(1);
        expect(items[0].value).to.equal('SJ');
      });
      
      it('should get the first tag value', function() {
        var eventSpy = sinon.spy();
        var tagList = helpers.build(new TagList());
        
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });
        
        expect(tagList.value).to.equal('SJ');
        expect(tagList.value).to.equal(tagList.items.getAll()[0].value);
      });
      
      it('should clear all tags and set one tag with the provided value', function() {
        var eventSpy = sinon.spy();
        var tagList = helpers.build(new TagList());
        
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });
        tagList.value = 'Paris';
        
        var items = tagList.items.getAll();
        expect(items.length).to.equal(1);
        expect(items[0].value).to.equal('Paris');
        expect(items[0].label.innerHTML).to.equal('Paris');
      });
      
      it('should submit the form with taglist values', function() {
        var tagList = helpers.build(window.__html__['TagList.full.html']);
        var all = tagList.items.getAll();
        var form = document.createElement('form');
        form.appendChild(tagList);
        
        helpers.serializeArray(form).forEach(function(obj, i) {
          expect(obj.name).to.equal(tagList.name);
          expect(obj.value).to.equal(all[i].value);
        });
      });
    });
    
    describe('#disabled', function() {
      it('should disable and block every user interaction', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        expect(tagList.disabled).to.be.false;
        tagList.disabled = true;
        
        tagList.items.getAll().forEach(function(item) {
          expect(item.classList.contains('is-disabled')).to.be.true;
          expect(item._input.disabled).to.be.true;
        });
      });
    });
    
    describe('#name', function() {
      it('should set tag property name to taglist property name', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.name = 'myname';
        tagList.items.getAll().forEach(function(item) {
          expect(item._input.name).to.equal(tagList.name);
        });
      });
      
      it('should set added tag property name to taglist property name', function() {
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.name = 'myname';
        tagList.items.add(new Tag());
        tagList.items.getAll().forEach(function(item) {
          expect(item._input.name).to.equal(tagList.name);
        });
      });
    });
  });
  
  describe('API', function() {
    
    describe('#values', function() {
      it('should default to empty array', function() {
        var tagList = new TagList();
        expect(tagList.values).to.deep.equal([]);
      });
      
      it('should return an array of tag values', function() {
        var values = ['SF', 'SJ', 'NY'];
        var tagList = new TagList();
        
        tagList.values = values;
        expect(tagList.values).to.deep.equal(values);
      });
      
      it('should send the correct values when submitted in a form', function() {
        var values = ['SF', 'SJ', 'NY'];
        var form = document.createElement('form');
        var tagList = new TagList();
        tagList.name = 'componentName';
        form.appendChild(tagList);
        
        tagList.values = values;
        
        expect(helpers.serializeArray(form)).to.deep.equal(values.map(function(value) {
          return {
            name: 'componentName',
            value: value
          };
        }));
      });
    });
  });
  
  describe('User Interaction', function() {
    it('should have a role', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      expect(tagList.getAttribute('role')).to.equal('listbox');
    });
    
    it('should remove a focused tag on backspace', function() {
      var eventSpy = sinon.spy();
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.on('change', eventSpy);
      var all = tagList.items.getAll();
      expect(all.length).to.equal(1);
      helpers.keypress('backspace', all[0]);
      
      expect(tagList.items.getAll().length).to.equal(0);
      expect(eventSpy.callCount).to.equal(1);
    });
    
    it('set aria-selected attribute to true to focused item', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
      
      var all = tagList.items.getAll();
      expect(all[0].getAttribute('aria-selected')).to.equal('false');
      expect(all[1].getAttribute('aria-selected')).to.equal('false');
      expect(all[0].getAttribute('tabindex')).to.equal('0');
      expect(all[1].getAttribute('tabindex')).to.equal('-1');
      
      all[0].trigger('focus');
      
      expect(all[0].getAttribute('aria-selected')).to.equal('true');
      expect(all[1].getAttribute('aria-selected')).to.equal('false');
    });
    
    it('should not focus next item on tab', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
      var all = tagList.items.getAll();
      helpers.keypress('tab', all[0]);
      expect(document.activeElement).to.equal(all[0]);
    });
    
    it('should set focus to next item on right', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
      
      var all = tagList.items.getAll();
      helpers.keypress('right', all[0]);
      
      expect(document.activeElement).to.equal(all[1]);
    });
    
    it('should set focus to next item on pagedown', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
      
      var all = tagList.items.getAll();
      helpers.keypress('pagedown', all[0]);
      
      expect(document.activeElement).to.equal(all[1]);
    });
    
    it('should set focus to next item on down', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
      
      var all = tagList.items.getAll();
      helpers.keypress('down', all[0]);
      
      expect(document.activeElement).to.equal(all[1]);
    });
    
    it('should set focus to previous item on left', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
      
      var all = tagList.items.getAll();
      helpers.keypress('left', all[1]);
      
      expect(document.activeElement).to.equal(all[0]);
    });
  
    it('should set focus to previous item on pageup', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
    
      var all = tagList.items.getAll();
      helpers.keypress('pageup', all[1]);
    
      expect(document.activeElement).to.equal(all[0]);
    });
  
    it('should set focus to previous item on up', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
    
      var all = tagList.items.getAll();
      helpers.keypress('up', all[1]);
    
      expect(document.activeElement).to.equal(all[0]);
    });
  
    it('should set focus to first item on home', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
    
      var all = tagList.items.getAll();
      helpers.keypress('home', all[1]);
    
      expect(document.activeElement).to.equal(all[0]);
    });
  
    it('should set focus to last item on end', function() {
      var tagList = helpers.build(window.__html__['TagList.base.html']);
      tagList.items.add(new Tag());
    
      var all = tagList.items.getAll();
      helpers.keypress('end', all[0]);
    
      expect(document.activeElement).to.equal(all[1]);
    });
  });
  
  describe('Events', function() {
    
    describe('#change', function() {
      it('should trigger a change event if a tag is removed by the user', function() {
        var eventSpy = sinon.spy();
        var tagList = helpers.build(window.__html__['TagList.base.html']);
  
        tagList.on('change', eventSpy);
  
        expect(tagList.items.length).to.equal(1);
        
        tagList.items.first()._elements.button.click();
        
        expect(eventSpy.callCount).to.equal(1);
        expect(tagList.items.length).to.equal(0);
      });
    });
    
    describe('#coral-collection:add', function() {
      it('triggers coral-collection:add on appendChild', function() {
        var eventSpy = sinon.spy();
        var tag = new Tag();
  
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.on('coral-collection:add', eventSpy);
        tagList.appendChild(tag);
        
        var all = tagList.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[1]).to.equal(tag);
        expect(eventSpy.callCount).to.equal(1);
      });
    });
    
    describe('#coral-collection:remove', function() {
      it('triggers coral-collection:remove on removeChild', function() {
        var eventSpy = sinon.spy();
  
        var tagList = helpers.build(window.__html__['TagList.base.html']);
        tagList.on('coral-collection:remove', eventSpy);
        tagList.removeChild(tagList.items.getAll()[0]);
        
        expect(tagList.items.length).to.equal(0);
        expect(eventSpy.callCount).to.equal(1);
      });
    });
  });
  
  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['TagList.value.html'], {
        value: 'myvalue'
      });
    });
  });
});
