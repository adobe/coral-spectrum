import {helpers} from '../../../coral-utils/src/tests/helpers';
import {transform, validate} from '../../../coral-utils';
import Component from '../../libs/Component';
import register from '../../libs/register';
import property from '../../libs/property';

describe('Coral.Component', function() {
  
  // Used to register components
  window.CustomNamespace = {};
  
  // When a component MUST be registered inside of a test, use this to get a unique tag name
  var curTagUID = 0;
  function getUniqueTagName(tagName) {
    return tagName + '-' + (curTagUID++);
  }
  
  var ComponentTestComponent = register({
    tagName: 'coral-component-test-component',
    name: 'ComponentTestComponent',
    namespace: window.CustomNamespace,
    properties: {
      'noattr': {
        attribute: null
      },
      'disabled': {
        reflectAttribute: true,
        default: false,
        transform: transform.boolean,
        attributeTransform: transform.booleanAttr
      },
      'size': {
        default: 'S',
        reflectAttribute: true,
        transform: function(value) {
          return typeof value === 'string' ? value.toUpperCase() : value;
        },
        validate: [
          validate.valueMustChange,
          validate.enumeration(['XS', 'S', 'M', 'L'])
        ]
      },
      'test': {
        default: false,
        transform: transform.boolean,
        attributeTransform: transform.booleanAttr,
        trigger: function() {
          return this.trigger('coral-component-test-component:test');
        }
      },
    },
    
    // A noop to test for equality when ducktyping
    method: function() {}
  });
  
  var ComponentChildComponent = register({
    extend: ComponentTestComponent,
    tagName: 'coral-component-child-component',
    name: 'ComponentChildComponent',
    namespace: window.CustomNamespace,
    properties: {
      'test': {
        sync: function() {
          // ...
        }
      }
    }
  });
  
  // Test if an instance is a ComponentTestComponent
  function quacksLikeATestComponent(component) {
    expect(component.tagName).to.equal('CORAL-COMPONENT-TEST-COMPONENT');
    expect(component.disabled).to.equal(false);
    expect(component.size).to.equal('S');
    expect(component.method).to.equal(ComponentTestComponent.prototype.method);
  }
  
  it('should return the right value for toString()', function() {
    var component = new ComponentChildComponent();
    expect(component.toString()).to.equal('ComponentChildComponent');
  });
  
  it('should inherit the properties of its parent component', function() {
    var component = new ComponentChildComponent();
    expect(component.disabled).to.equal(false);
    expect(component.size).to.equal('S');
  });
  
  it('should silently set the properties on initialization', function() {
    var testSpy = sinon.spy();
    
    // checks if the events bubble
    helpers.target.addEventListener('coral-component-test-component:test', testSpy);
    
    const el = helpers.build('<coral-component-test-component></coral-component-test-component>');
    // makes sure no events are triggered on creation
    expect(testSpy.called).to.be.false;
  });
  
  it('should silently set the properties on initialization even if properties are inherited', function() {
    var testSpy = sinon.spy();
    
    // checks if the events bubble
    helpers.target.addEventListener('coral-component-test-component:test', testSpy);
    
    const el = helpers.build('<coral-component-child-component></coral-component-child-component>');
    // makes sure no events are triggered on creation
    expect(testSpy.called).to.be.false;
  });
  
  it('should support instantiation with markup', function(done) {
    /**
     Note: The CustomElements polyfill uses MutationObserver, which queues "microtasks" that fire asynchronously.
     As such, a custom element will not be upgraded until before the next animation frame when created with markup.
     You'll see tests in this section that use Coral.commons.nextFrame() for their assertions.
     
     See:
     http://dom.spec.whatwg.org/#mutation-observers
     http://lists.w3.org/Archives/Public/public-webapps/2011JulSep/1622.html
     */
    const component = helpers.build('<coral-component-test-component></coral-component-test-component>');
    
    // FF needs one more frame
    helpers.next(function() {
      quacksLikeATestComponent(component);
      done();
    });
  });
  
  it('should support instantiation with new Component()', function() {
    var component = new window.CustomNamespace.ComponentTestComponent();
    quacksLikeATestComponent(component);
  });
  
  it('should support instantiation with createElement()', function() {
    var component = document.createElement('coral-component-test-component');
    quacksLikeATestComponent(component);
  });
  
  
  describe('attributes & properties', function() {
    it('should set property values for boolean attributes', function(done) {
      const component = helpers.build('<coral-component-test-component disabled></coral-component-test-component>');
  
      // FF needs one more frame
      helpers.next(function() {
        expect(component.disabled).to.be.true;
        expect(component.hasAttribute('disabled')).to.be.true;
        
        done();
      });
    });
    
    it('should have default value from property descriptor', function(done) {
      const component = helpers.build('<coral-component-test-component></coral-component-test-component>');
  
      // FF needs one more frame
      helpers.next(function() {
        expect(component.disabled).to.be.false;
        expect(component.size).to.equal('S');
    
        done();
      });
    });
    
    it('should have default value from property descriptor for invalid input', function(done) {
      const component = helpers.build('<coral-component-test-component size="B"></coral-component-test-component>');
      
      // FF needs one more frame
      helpers.next(function() {
        expect(component.size).to.equal('S');
        expect(component.getAttribute('size')).to.equal('S');
        
        done();
      });
    });
    
    it('should transform attribute values', function(done) {
      const component = helpers.build('<coral-component-test-component size="l"></coral-component-test-component>');
      
      // FF needs one more frame
      helpers.next(function() {
        expect(component.size).to.equal('L');
        expect(component.getAttribute('size')).to.equal('L');
        done();
      });
    });
    
    it('should be reflected from attribute to property', function(done) {
      const component = helpers.build('<coral-component-test-component></coral-component-test-component>');
  
      // FF needs one more frame
      helpers.next(function() {
        expect(component.disabled).to.be.false;
  
        component.setAttribute('disabled', '');
        helpers.next(function() {
          expect(component.disabled).to.be.true;
  
          component.removeAttribute('disabled');
          helpers.next(function() {
            expect(component.disabled).to.be.false;
            
            done();
          });
        });
      });
    });
    
    it('should not set property from attributes when descriptor.attribute=null', function() {
      const component = helpers.build('<coral-component-test-component></coral-component-test-component>');
      component.setAttribute('noattr', 'fromAttr');
      expect(component.noattr).to.equal(undefined);
      
      component.noattr = 'fromProp';
      expect(component.noattr).to.equal('fromProp');
      
      component.removeAttribute('noattr');
      expect(component.noattr).to.equal('fromProp');
    });
    
    it('should be reflected from property to attribute', function(done) {
      const component = helpers.build('<coral-component-test-component></coral-component-test-component>');
  
      // FF needs one more frame
      helpers.next(function() {
        expect(component.hasAttribute('disabled')).to.be.false;
  
        component.disabled = true;
        helpers.next(function() {
          expect(component.hasAttribute('disabled')).to.be.true;
  
          component.disabled = false;
          helpers.next(function() {
            expect(component.hasAttribute('disabled')).to.be.false;
            
            done();
          });
        });
      });
    });
    
    it('should call "attributeTransform" and "transform" before setting the property', function() {
      var attributeTransformSpy = sinon.stub().returns(true);
      var transformSpy = sinon.stub().returns(123);
      var setterSpy = sinon.spy();
      
      var attrName = 'disabled';
      
      var properties = {};
      properties[attrName] = {
        _methods: {
          attributeTransform: attributeTransformSpy,
          transform: transformSpy
        }
      };
      
      var component = Object.create(Component.prototype, {
        _attributes: {
          value: {}
        },
        _properties: {
          value: properties
        },
        disabled: {
          get: sinon.stub().returns(false),
          set: setterSpy
        }
      });
      
      component.attributeChangedCallback(attrName, null, '');
      
      expect(attributeTransformSpy.calledWith('')).to.be.true;
      expect(transformSpy.calledWith(true)).to.be.true;
      expect(setterSpy.calledWith(123)).to.be.true;
    });
    
    it('should invoke "transform" in component scope', function(done) {
      var component;
      
      var transform = function() {
        expect(this._properties.disabled._methods.transform).to.equal(transform);
        done();
      };
      
      var attrName = 'disabled';
      var properties = {};
      properties[attrName] = {
        _methods: {
          transform: transform
        }
      };
      
      component = Object.create(Component.prototype, {
        _attributes: {
          value: {}
        },
        _properties: {
          value: properties
        },
        disabled: {
          get: function() {},
          set: function() {}
        }
      });
      
      component.attributeChangedCallback(attrName, null, '');
    });
    
    it('should invoke "attributeTransform" in component scope', function(done) {
      var component;
      
      var attributeTransform = function() {
        expect(this._properties.disabled._methods.attributeTransform).to.equal(attributeTransform);
        done();
      };
      
      var attrName = 'disabled';
      var properties = {};
      properties[attrName] = {
        _methods: {
          attributeTransform: attributeTransform
        }
      };
      
      component = Object.create(Component.prototype, {
        _attributes: {
          value: {}
        },
        _properties: {
          value: properties
        },
        disabled: {
          get: function() {},
          set: function() {}
        }
      });
      
      component.attributeChangedCallback(attrName, null, '');
    });
    
    it('should pass the default value to transform functions, in component scope', function() {
      var ComponentDefaultValueTestComponent = register({
        tagName: getUniqueTagName('coral-component-default-value-test-component'),
        name: 'ComponentDefaultValueTestComponent',
        namespace: window.CustomNamespace,
        properties: {
          'size': {
            default: 'S',
            transform: function transform(value, defaultValue) {
              expect(this._properties.size.transform).to.eql(transform);
              expect(defaultValue).to.equal('S', 'Default value as passed to transform()');
              return value;
            }
          }
        }
      });
      
      var testComponent = new ComponentDefaultValueTestComponent();
      
      testComponent.set('size', 'X');
      testComponent.size = 'X';
    });
    
    it('should pass the default value to transform functions on initialization when created from markup, in component scope', function(done) {
      // Two async assertions are required
      var doneCount = 0;
      function isDone() {
        doneCount++;
        if (doneCount === 2) {
          done();
        }
      }
      
      var tagName = getUniqueTagName('coral-component-default-value-test-component-attrs');
      
      register({
        tagName: tagName,
        name: 'ComponentDefaultValueTestComponent',
        namespace: window.CustomNamespace,
        properties: {
          'size': {
            default: 'S',
            attributeTransform: function(value, defaultValue) {
              expect(defaultValue).to.equal('S', 'Default value as passed to transform()');
              isDone();
              return value;
            },
            transform: function transform(value, defaultValue) {
              expect(this._properties.size.transform).to.eql(transform);
              expect(defaultValue).to.equal('S', 'Default value as passed to transform()');
              isDone();
              return value;
            }
          }
        }
      });
      
      const component = helpers.build('<' + tagName + ' size="X"></' + tagName + '>');
      expect(component).not.to.be.null;
    });
    
    var CoralComponentDefaultValueOverwriteTestComponent;
    before(function() {
      CoralComponentDefaultValueOverwriteTestComponent = register({
        tagName: getUniqueTagName('coral-component-default-value-overwrite-test-component'),
        name: 'CoralComponentDefaultValueOverwriteTestComponent',
        namespace: window.CustomNamespace,
        properties: {
          'propA': {
            default: 'a',
            set: function(value) {
              this._propA = value;
              this.propB = 'a';
            }
          },
          'propB': {
            default: 'b'
          }
        }
      });
    });
    
    it('should not apply a default value if a property has already been set by another setter', function() {
      var component = new CoralComponentDefaultValueOverwriteTestComponent();
      
      // Make sure the default value was not applied
      expect(component.propB).to.equal('a');
    });
  });
  
  describe('eventing', function() {
    describe('event handling', function() {
      it('should work even when detached', function() {
        var eventSpy = sinon.stub().returns(true);
        
        var Cmp = register({
          tagName: 'coral-cmp2',
          name: 'Cmp',
          namespace: window.CustomNamespace,
          events: {
            'event1': eventSpy
          }
        });
        
        var el = new Cmp();
        el.trigger('event1');
        
        expect(eventSpy.called).to.be.true;
      });
      
      it('should support listening to events in the capture phase', function() {
        var eventSpy = sinon.stub().returns(true);
        
        var eventPhase;
        var currentTarget;
        var CmpCapture = register({
          tagName: 'coral-test-capture',
          name: 'CmpCapture',
          namespace: window.CustomNamespace,
          events: {
            'capture:click div': function(event) {
              eventSpy();
              currentTarget = event.currentTarget;
              eventPhase = event.eventPhase;
            }
          }
        });
        
        var el = new CmpCapture();
        helpers.target.appendChild(el);
        
        // Create a child element and click it
        var div = document.createElement('div');
        el.appendChild(div);
        div.click();
        
        expect(eventSpy.callCount).to.equal(1, 'spy call count after trigger');
        expect(currentTarget).to.equal(el);
        expect(eventPhase).to.equal(Event.CAPTURING_PHASE);
      });
      
      it('should support listening to global events in the capture phase', function(done) {
        var eventSpy = sinon.stub().returns(true);
        
        var eventPhase;
        var currentTarget;
        var CmpCapture = register({
          tagName: 'coral-test-global-capture',
          name: 'CmpCapture',
          namespace: window.CustomNamespace,
          events: {
            'global:capture:click #testDiv': function(event) {
              eventSpy();
              currentTarget = event.currentTarget;
              eventPhase = event.eventPhase;
            }
          }
        });
        
        var el = new CmpCapture();
        helpers.target.appendChild(el);
        
        // Wait for a frame as global listeners are added after attached
        helpers.next(function() {
          // Create a sibling element and click it
          var div = document.createElement('div');
          div.id = 'testDiv';
          helpers.target.appendChild(div);
          div.click();
          
          expect(eventSpy.callCount).to.equal(1, 'spy call count after trigger');
          expect(currentTarget).to.equal(window);
          expect(eventPhase).to.equal(Event.CAPTURING_PHASE);
          done();
        });
      });
      
      it('should support listening to window events only when attached', function(done) {
        var eventSpy = sinon.stub().returns(true);
        
        function trigger(eventName) {
          var event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(event);
        }
        
        var WindowListener = register({
          tagName: 'coral-window-listener',
          name: 'WindowListener',
          namespace: window.CustomNamespace,
          events: {
            'global:anEvent': eventSpy
          }
        });
        
        var el = new WindowListener();
        
        trigger('anEvent');
        expect(eventSpy.callCount).to.equal(0, 'Call count after event when not yet added to DOM');
        
        helpers.target.appendChild(el);
        helpers.next(function() {
          trigger('anEvent');
          expect(eventSpy.callCount).to.equal(1, 'Call count after event when added to DOM');
          
          helpers.target.removeChild(el);
          helpers.next(function() {
            trigger('anEvent');
            expect(eventSpy.callCount).to.equal(1, 'Call count after event when removed from DOM');
            
            helpers.target.appendChild(el);
            helpers.next(function() {
              trigger('anEvent');
              expect(eventSpy.callCount).to.equal(2, 'Call count after event when added back to DOM');
              
              el.parentNode.removeChild(el);
              done();
            });
          });
        });
      });
      
      it('should support trigger(), on(), off()', function() {
        var eventSpy = sinon.stub().returns(true);
        
        var Cmp = register({
          tagName: 'coral-cmp3',
          name: 'Cmp',
          namespace: window.CustomNamespace
        });
        
        var el = new Cmp();
        
        var handler = function(event) {
          expect(event.detail).not.to.be.undefined;
          expect(event.detail.message).to.equal('test');
          eventSpy();
        };
        
        el.on('event1', handler);
        el.trigger('event1', {
          message: 'test'
        });
        expect(eventSpy.callCount).to.equal(1);
        
        el.off('event1', handler);
        el.trigger('event1', {
          message: 'test'
        });
        expect(eventSpy.callCount).to.equal(1);
      });
      
      it('should support addEventListener(), removeEventListener()', function() {
        var eventSpy = sinon.stub().returns(true);
        
        var Cmp = register({
          tagName: 'coral-cmp4',
          name: 'Cmp',
          namespace: window.CustomNamespace
        });
        
        var el = new Cmp();
        
        el.addEventListener('event1', eventSpy);
        el.trigger('event1');
        expect(eventSpy.callCount).to.equal(1);
        
        el.removeEventListener('event1', eventSpy);
        el.trigger('event1');
        expect(eventSpy.callCount).to.equal(1);
      });
    });
    
    describe('attached/detached', function() {
      var bubbleAttachedSpy;
      var bubbleDetachedSpy;
      
      before(function() {
        bubbleAttachedSpy = sinon.spy();
        bubbleDetachedSpy = sinon.spy();
        document.addEventListener('coral-component:attached', bubbleAttachedSpy);
        document.addEventListener('coral-component:detached', bubbleDetachedSpy);
      });
      
      after(function() {
        document.removeEventListener('coral-component:attached', bubbleAttachedSpy);
        document.removeEventListener('coral-component:detached', bubbleDetachedSpy);
      });
      
      describe('#coral-component:attached', function() {
        it('should be triggered when the component is added to the DOM', function(done) {
          var attachedSpy = sinon.spy();
          var component = new window.CustomNamespace.ComponentTestComponent();
          
          component.on('coral-component:attached', attachedSpy);
          
          helpers.target.appendChild(component);
          
          helpers.next(function() {
            expect(attachedSpy.callCount).to.equal(1);
            expect(bubbleAttachedSpy.callCount).to.equal(1);
            done();
          });
        });
      });
      
      describe('#coral-component:detached', function() {
        it('should be triggered when the component is removed from the DOM', function(done) {
          var detachedSpy = sinon.spy();
          var component = new window.CustomNamespace.ComponentTestComponent();
          
          helpers.target.appendChild(component);
          
          component.on('coral-component:detached', detachedSpy);
          
          helpers.next(function() {
            expect(detachedSpy.callCount).to.equal(0);
            
            helpers.target.removeChild(component);
            
            helpers.next(function() {
              expect(detachedSpy.callCount).to.equal(1);
              
              // Detached events cannot bubble as the element is no longer in the DOM
              expect(bubbleDetachedSpy.callCount).to.equal(0);
              
              done();
            });
          });
        });
        
        it('should be triggered when the component is removed from the DOM', function(done) {
          var detachedSpy = sinon.spy();
          var component = new window.CustomNamespace.ComponentTestComponent();
          helpers.target.appendChild(component);
          
          component.on('coral-component:detached', detachedSpy);
          
          helpers.next(function() {
            expect(detachedSpy.callCount).to.equal(0);
            
            // Remove the component
            component.parentNode.removeChild(component);
            
            helpers.next(function() {
              expect(detachedSpy.callCount).to.equal(1);
              
              // Detached events cannot bubble as the element is no longer in the DOM
              expect(bubbleDetachedSpy.callCount).to.equal(0);
              
              done();
            });
          });
        });
      });
    });
  });
  
  describe('visbility', function() {
    describe('.hidden', function() {
      it('should be false by default', function() {
        var component = new window.CustomNamespace.ComponentTestComponent();
        
        expect(component.hidden).to.be.false;
        expect(component.hasAttribute('hidden')).to.be.false;
      });
      
      it('should reflect from property to attribute', function() {
        var component = new window.CustomNamespace.ComponentTestComponent();
        
        expect(component.hasAttribute('hidden')).to.be.false;
        
        component.hidden = true;
        expect(component.hasAttribute('hidden')).to.be.true;
        
        component.hidden = false;
        expect(component.hasAttribute('hidden')).to.be.false;
      });
      
      it('should reflect from attribute to property', function() {
        var component = new window.CustomNamespace.ComponentTestComponent();
        
        component.setAttribute('hidden', '');
        expect(component.hidden).to.be.true;
        
        component.removeAttribute('hidden');
        expect(component.hidden).to.be.false;
      });
    });
    
    describe('#show()', function() {
      it('should change hidden state', function() {
        var component = new window.CustomNamespace.ComponentTestComponent();
        component.hidden = true;
        
        component.show();
        expect(component.hidden).to.be.false;
        expect(component.hasAttribute('hidden')).to.be.false;
      });
    });
    
    describe('#hide()', function() {
      it('should change hidden state', function() {
        var component = new window.CustomNamespace.ComponentTestComponent();
        component.hidden = false;
        
        component.hide();
        expect(component.hidden).to.be.true;
        expect(component.hasAttribute('hidden')).to.be.true;
      });
    });
  });
  
  describe('clone', function() {
    helpers.cloneComponent(
      'a markup component',
      `
      <coral-component-test-component>
        <coral-component-child-component></coral-component-child-component>
      </coral-component-test-component>
      `
    );
    
    var component = helpers.build(new window.CustomNamespace.ComponentTestComponent());
    var subComponent = new window.CustomNamespace.ComponentTestComponent();

    component.appendChild(subComponent);

    helpers.cloneComponent(
      'should test an identical twin',
      component
    );
  });
  
  describe('set', function() {
    describe('content zones', function() {
      before(function() {
        register({
          name: 'ComponentTestContentZoneLabel',
          namespace: window.CustomNamespace,
          tagName: 'coral-component-test-contentzone-label'
        });
        
        register({
          name: 'ComponentTestContentZoneContent',
          namespace: window.CustomNamespace,
          tagName: 'coral-component-test-contentzone-content'
        });
        
        // we use the header as a lightweight tag
        window.CustomNamespace.ComponentTestContentZoneHeader = function() {
          return document.createElement('coral-component-test-contentzone-header');
        };
        
        register({
          tagName: 'coral-component-test-contentzone',
          name: 'ComponentTestContentZone',
          namespace: window.CustomNamespace,
          properties: {
            'label': property.contentZone({
              handle: 'label',
              defaultContentZone: true,
              tagName: 'coral-component-test-contentzone-label',
              insert: function(content) {
                this.appendChild(content);
              }
            }),
            
            'content': property.contentZone({
              // we use a different name than the property to make sure the handle content zone works
              handle: 'contentElement',
              tagName: 'coral-component-test-contentzone-content',
              insert: function(content) {
                this.appendChild(content);
              }
            }),
            
            'header': property.contentZone({
              handle: 'header',
              // this tag does not have an underlying Coral.Component
              tagName: 'coral-component-test-contentzone-header',
              insert: function(content) {
                this.appendChild(content);
              }
            })
          },
          
          _render: function() {
            this.label = this.querySelector('coral-component-test-contentzone-label') || document.createElement('coral-component-test-contentzone-label');
            this.content = this.querySelector('coral-component-test-contentzone-content') || document.createElement('coral-component-test-contentzone-content');
          }
        });
      });
      
      it('should expose content zones with descriptor.defaultContentZone as instance.defaultContentZone', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        expect(component.defaultContentZone).to.equal(component.label);
        expect(component.defaultContentZone).not.to.be.null;
      });
      
      it('should define the elements based on the handles', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        expect(component._elements.label).to.equal(component.label, 'A label element should be created automatically');
        expect(component._elements.contentElement).to.equal(component.content, 'A content element should be created automatically');
        expect(component._elements.header).to.equal(undefined, 'Header should not be initialized');
      });
      
      it('should set the corresponding content zone when instance.defaultContentZone is reassigned', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        var newZone = document.createElement('coral-component-test-contentzone-label');
        component.defaultContentZone = newZone;
        expect(component.label).to.equal(newZone);
      });
      
      it('should allow setting values on lightweight content zones', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        // we need to first set the an element because by default it is undefined
        component.header = document.createElement('coral-component-test-contentzone-header');
        // then we can set values on it
        component.set({
          header: {
            innerHTML: 'Header text'
          }
        });
        
        expect(component.header.tagName).to.equal('CORAL-COMPONENT-TEST-CONTENTZONE-HEADER');
        expect(component.header.innerHTML).to.equal('Header text');
      });
      
      it('should set content zone properties with set({ content: {} })', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        expect(component.content.innerHTML).to.equal('');
        component.set({
          content: {
            innerHTML: 'Content!'
          }
        });
        expect(component.content.innerHTML).to.equal('Content!');
      });
      
      it('should set content zone elements with set({ content: HTMLElement })', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        var content = document.createElement('coral-component-test-contentzone-content');
        content.innerHTML = 'Content!';
        
        component.set({
          content: content
        });
        
        expect(component.content.innerHTML).to.equal('Content!');
      });
      
      it('should set lightweight content zone elements with set({ content: HTMLElement })', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        var header = document.createElement('coral-component-test-contentzone-header');
        header.innerHTML = 'Header!';
        
        component.set({
          header: header
        });
        
        expect(component.header.innerHTML).to.equal('Header!');
      });
      
      it('should set content zone elements with content = HTMLElement', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        var content = document.createElement('coral-component-test-contentzone-content');
        content.innerHTML = 'Content!';
        
        component.content = content;
        
        expect(component.content.innerHTML).to.equal('Content!');
      });
      
      it('should swap the content zones when it is added into the DOM', function(done) {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        var oldLabel = component.label;
        expect(oldLabel).not.to.equal(null, 'Label content zone must be set');
        expect(oldLabel.parentNode).to.equal(component, 'Label element must be in the DOM');
        
        var label = document.createElement('coral-component-test-contentzone-label');
        // inserting a content zone element into the DOM should swapt it with the old one
        component.appendChild(label);
        
        // we wait for the content zone MO
        helpers.next(function() {
          expect(component.label).to.equal(label, 'The content zone should match the new element');
          expect(oldLabel.parentNode).not.to.equal(component, 'Old label should not be inside the component');
          
          done();
        });
      });
      
      it('should be able to swap content zones no matter the handle name', function(done) {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        helpers.target.appendChild(component);
        
        var oldContent = component.content;
        expect(oldContent).not.to.equal(null, 'Content content zone must be set');
        expect(oldContent.parentNode).to.equal(component, 'Content element must be in the DOM');
        
        var content = document.createElement('coral-component-test-contentzone-content');
        component.appendChild(content);
        
        // we wait for the content zone MO
        helpers.next(function() {
          expect(component.content).to.equal(content, 'The content zone should match the new element');
          expect(oldContent.parentNode).not.to.equal(component, 'Old content should not be inside the component');
          
          done();
        });
      });
      
      it('should assign content zones that have no initial value', function(done) {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        
        expect(component.header).to.equal(undefined, 'Header does not have an initial value');
        
        var header = document.createElement('coral-component-test-contentzone-header');
        component.appendChild(header);
        
        // we wait for the content zone MO
        helpers.next(function() {
          expect(component.header).to.equal(header, 'The header zone should match the new element');
          
          done();
        });
      });
      
      it('should the content zones as undefined if they are removed', function(done) {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        helpers.target.appendChild(component);
        
        var oldContent = component.content;
        expect(oldContent).not.to.equal(null, 'Content content zone must be set');
        expect(oldContent.parentNode).to.equal(component, 'Content element must be in the DOM');
        
        expect(component.content).not.to.equal(null, 'Content content zone must be set');
        // we remove the content zone to force the value to be cleared
        component.removeChild(component.content);
        
        // we wait for the content zone MO
        helpers.next(function() {
          // expect(component.content).to.equal(content, 'The content zone should match the new element');
          expect(oldContent.parentNode).not.to.equal(component, 'Old content should not be inside the component');
          expect(component.content).to.equal(undefined, 'It should be undefined');
          
          done();
        });
      });
      
      it('should allow setting the conten zone to null', function() {
        var component = new window.CustomNamespace.ComponentTestContentZone();
        helpers.target.appendChild(component);
        
        component.content = null;
        
        expect(component.content).to.equal(null, 'Should allow to assign null');
        expect(component.querySelector('coral-component-test-contentzone-content')).to.equal(null);
      });
    });
  });
});
