/* global Event:true */
describe('Coral.Component', function() {
  'use strict';

  // When a component MUST be registered inside of a test, use this to get a unique tag name
  var curTagUID = 0;
  function getUniqueTagName(tagName) {
    return tagName + '-' + (curTagUID++);
  }

  var ComponentTestComponent;

  // Test if an instance is a ComponentTestComponent
  function quacksLikeATestComponent(component) {
    expect(component.tagName).to.equal('CORAL-COMPONENT-TEST-COMPONENT');
    expect(component.disabled).to.equal(false);
    expect(component.size).to.equal('S');
    expect(component.method).to.equal(ComponentTestComponent.prototype.method);
  }

  var ComponentChildComponent;
  before(function() {
    ComponentTestComponent = Coral.register({
      tagName: 'coral-component-test-component',
      name: 'ComponentTestComponent',

      properties: {
        'noattr': {
          attribute: null
        },
        'disabled': {
          reflectAttribute: true,
          default: false,
          transform: Coral.transform.boolean,
          attributeTransform: Coral.transform.booleanAttr
        },
        'size': {
          default: 'S',
          reflectAttribute: true,
          transform: function(value) {
            return typeof value === 'string' ? value.toUpperCase() : value;
          },
          validate: [
            Coral.validate.valueMustChange,
            Coral.validate.enumeration(['XS', 'S', 'M', 'L'])
          ]
        },
        'test': {
          default: false,
          transform: Coral.transform.boolean,
          attributeTransform: Coral.transform.booleanAttr,
          trigger: function() {
            return this.trigger('coral-component-test-component:test');
          }
        },
      },

      // A noop to test for equality when ducktyping
      method: function() {}
    });

    ComponentChildComponent = Coral.register({
      extend: ComponentTestComponent,
      tagName: 'coral-component-child-component',
      name: 'ComponentChildComponent',
      properties: {
        'test': {
          sync: function() {
            // ...
          }
        }
      }
    });
  });

  it('should return the right value for toString()', function() {
    var component = new ComponentChildComponent();
    expect(component.toString()).to.equal('Coral.ComponentChildComponent');
  });

  it('should inherit the properties of its parent component', function() {
    var component = new ComponentChildComponent();
    expect(component.disabled).to.equal(false);
    expect(component.size).to.equal('S');
  });

  it('should silently set the properties on initialization', function(done) {
    var testSpy = sinon.spy();

    // checks if the events bubble
    helpers.target.addEventListener('coral-component-test-component:test', testSpy);

    helpers.build('<coral-component-test-component></coral-component-test-component>', function(el) {
      // makes sure no events are triggered on creation
      expect(testSpy.called).to.be.false;

      done();
    });
  });

  it('should silently set the properties on initialization even if properties are inherited', function(done) {
    var testSpy = sinon.spy();

    // checks if the events bubble
    helpers.target.addEventListener('coral-component-test-component:test', testSpy);

    helpers.build('<coral-component-child-component></coral-component-child-component>', function(el) {
      // makes sure no events are triggered on creation
      expect(testSpy.called).to.be.false;

      done();
    });
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
    helpers.build('<coral-component-test-component></coral-component-test-component>', function(component) {
      quacksLikeATestComponent(component);
      done();
    });
  });

  it('should support instantiation with new Component()', function() {
    var component = new Coral.ComponentTestComponent();
    quacksLikeATestComponent(component);
  });

  it('should support instantiation with createElement()', function() {
    var component = document.createElement('coral-component-test-component');
    quacksLikeATestComponent(component);
  });


  describe('attributes & properties', function() {
    it('should set property values for boolean attributes', function(done) {
      helpers.build('<coral-component-test-component disabled></coral-component-test-component>', function(component) {
        expect(component.disabled).to.be.true;
        expect(component.$).to.have.attr('disabled');
        done();
      });
    });

    it('should have default value from property descriptor', function(done) {
      helpers.build('<coral-component-test-component></coral-component-test-component>', function(component) {
        expect(component.disabled).to.be.false;
        expect(component.size).to.equal('S');
        done();
      });
    });

    it('should have default value from property descriptor for invalid input', function(done) {
      helpers.build('<coral-component-test-component size="B"></coral-component-test-component>', function(component) {
        expect(component.size).to.equal('S');
        expect(component.$.attr('size')).to.equal('S');
        done();
      });
    });

    it('should transform attribute values', function(done) {
      helpers.build('<coral-component-test-component size="l"></coral-component-test-component>', function(component) {
        expect(component.size).to.equal('L');
        expect(component.$.attr('size')).to.equal('L');
        done();
      });
    });

    it('should be reflected from attribute to property', function(done) {
      helpers.build('<coral-component-test-component></coral-component-test-component>', function(component) {
        expect(component.disabled).to.be.false;

        component.setAttribute('disabled', '');
        expect(component.disabled).to.be.true;

        component.removeAttribute('disabled');
        expect(component.disabled).to.be.false;
        done();
      });
    });

    it('should not set property from attributes when descriptor.attribute=null', function(done) {
      helpers.build('<coral-component-test-component></coral-component-test-component>', function(component) {
        component.setAttribute('noattr', 'fromAttr');
        expect(component.noattr).to.equal(undefined);

        component.noattr = 'fromProp';
        expect(component.noattr).to.equal('fromProp');

        component.removeAttribute('noattr');
        expect(component.noattr).to.equal('fromProp');

        done();
      });
    });

    it('should be reflected from property to attribute', function(done) {
      helpers.build('<coral-component-test-component></coral-component-test-component>', function(component) {
        expect(component.$).not.to.have.attr('disabled');

        component.disabled = true;
        expect(component.$).to.have.attr('disabled');

        component.disabled = false;
        expect(component.$).not.to.have.attr('disabled');
        done();
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

      var component = Object.create(Coral.Component.prototype, {
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

      component = Object.create(Coral.Component.prototype, {
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

      component = Object.create(Coral.Component.prototype, {
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
      var ComponentDefaultValueTestComponent = Coral.register({
        tagName: getUniqueTagName('coral-component-default-value-test-component'),
        name: 'ComponentDefaultValueTestComponent',

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

      Coral.register({
        tagName: tagName,
        name: 'ComponentDefaultValueTestComponent',

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

      helpers.build('<' + tagName + ' size="X"></' + tagName + '>', function(component) {
        expect(component).not.to.be.null;
      });
    });

    var CoralComponentDefaultValueOverwriteTestComponent;
    before(function() {
      CoralComponentDefaultValueOverwriteTestComponent = Coral.register({
        tagName: getUniqueTagName('coral-component-default-value-overwrite-test-component'),
        name: 'CoralComponentDefaultValueOverwriteTestComponent',

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

        var Cmp = Coral.register({
          tagName: 'coral-cmp2',
          name: 'Cmp',
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
        var CmpCapture = Coral.register({
          tagName: 'coral-test-capture',
          name: 'CmpCapture',
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
        var CmpCapture = Coral.register({
          tagName: 'coral-test-global-capture',
          name: 'CmpCapture',
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

        var WindowListener = Coral.register({
          tagName: 'coral-window-listener',
          name: 'WindowListener',
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

              el.$.remove();
              done();
            });
          });
        });
      });

      it('should support trigger(), on(), off()', function() {
        var eventSpy = sinon.stub().returns(true);

        var Cmp = Coral.register({
          tagName: 'coral-cmp3',
          name: 'Cmp'
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

        var Cmp = Coral.register({
          tagName: 'coral-cmp4',
          name: 'Cmp'
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
      var bubbleAttachedSpy, bubbleDetachedSpy;

      before(function() {
        bubbleAttachedSpy = sinon.spy();
        bubbleDetachedSpy = sinon.spy();
        $(document).on('coral-component:attached', bubbleAttachedSpy);
        $(document).on('coral-component:detached', bubbleDetachedSpy);
      });

      after(function() {
        $(document).off('coral-component:attached', bubbleAttachedSpy);
        $(document).off('coral-component:detached', bubbleDetachedSpy);
      });

      describe('#coral-component:attached', function() {
        it('should be triggered when the component is added to the DOM', function(done) {
          var attachedSpy = sinon.spy();
          var component = new Coral.ComponentTestComponent();

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
          var component = new Coral.ComponentTestComponent();

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

        it('should be triggered when the component is removed from the DOM using jQuery remove', function(done) {
          var detachedSpy = sinon.spy();
          var component = new Coral.ComponentTestComponent();
          helpers.target.appendChild(component);

          component.on('coral-component:detached', detachedSpy);

          helpers.next(function() {
            expect(detachedSpy.callCount).to.equal(0);

            // Remove the component using jQuery remove:
            component.$.remove();

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
        var component = new Coral.ComponentTestComponent();

        expect(component.hidden).to.be.false;
        expect(component.hasAttribute('hidden')).to.be.false;
      });

      it('should reflect from property to attribute', function() {
        var component = new Coral.ComponentTestComponent();

        expect(component.hasAttribute('hidden')).to.be.false;

        component.hidden = true;
        expect(component.hasAttribute('hidden')).to.be.true;

        component.hidden = false;
        expect(component.hasAttribute('hidden')).to.be.false;
      });

      it('should reflect from attribute to property', function() {
        var component = new Coral.ComponentTestComponent();

        component.setAttribute('hidden', '');
        expect(component.hidden).to.be.true;

        component.removeAttribute('hidden');
        expect(component.hidden).to.be.false;
      });
    });

    describe('#show()', function() {
      it('should change hidden state', function() {
        var component = new Coral.ComponentTestComponent();
        component.hidden = true;

        component.show();
        expect(component.hidden).to.be.false;
        expect(component.hasAttribute('hidden')).to.be.false;
      });
    });

    describe('#hide()', function() {
      it('should change hidden state', function() {
        var component = new Coral.ComponentTestComponent();
        component.hidden = false;

        component.hide();
        expect(component.hidden).to.be.true;
        expect(component.hasAttribute('hidden')).to.be.true;
      });
    });

  });

  describe('clone', function() {
    describe('coral-component', function() {
      it('should test an identical twin', function(done) {
        var component = new Coral.ComponentTestComponent();
        var subComponent = new Coral.ComponentTestComponent();

        component.appendChild(subComponent);
        helpers.target.appendChild(component);

        helpers.next(function() {
          helpers.testComponentClone(component, done);
        });
      });
    });
  });

  describe('set', function() {
    describe('content zones', function() {
      before(function() {
        Coral.register({
          name: 'ComponentTestContentZoneLabel',
          tagName: 'coral-component-test-contentzone-label'
        });

        Coral.register({
          name: 'ComponentTestContentZoneContent',
          tagName: 'coral-component-test-contentzone-content'
        });

        Coral.register({
          tagName: 'coral-component-test-contentzone',
          name: 'ComponentTestContentZone',

          properties: {
            'label': Coral.property.contentZone({
              handle: 'label',
              defaultContentZone: true,
              tagName: 'coral-component-test-contentzone-label',
              insert: function(content) {
                this.appendChild(content);
              }
            }),
            'content': Coral.property.contentZone({
              handle: 'content',
              tagName: 'coral-component-test-contentzone-content',
              insert: function(content) {
                this.appendChild(content);
              }
            })
          },

          _render: function() {
            this.content = this.querySelector('coral-component-test-contentzone-content') || document.createElement('coral-component-test-contentzone-content');
          }
        });
      });

      it('should expose content zones with descriptor.defaultContentZone as instance.defaultContentZone', function() {
        var component = new Coral.ComponentTestContentZone();

        expect(component.defaultContentZone).to.equal(component.label);
      });

      it('should set the corresponding content zone when instance.defaultContentZone is reassigned', function() {
        var component = new Coral.ComponentTestContentZone();

        var newZone = document.createElement('coral-component-test-contentzone-label');
        component.defaultContentZone = newZone;
        expect(component.label).to.equal(newZone);
      });

      it('should set content zone properties with set({ content: {} })', function() {
        var component = new Coral.ComponentTestContentZone();

        expect(component.content.innerHTML).to.equal('');

        component.set({
          content: {
            innerHTML: 'Content!'
          }
        });

        expect(component.content.innerHTML).to.equal('Content!');
      });

      it('should set content zone elements with set({ content: HTMLElement })', function() {
        var component = new Coral.ComponentTestContentZone();
        var content = document.createElement('coral-component-test-contentzone-content');
        content.innerHTML = 'Content!';

        component.set({
          content: content
        });

        expect(component.content.innerHTML).to.equal('Content!');
      });

      it('should set content zone elements with content = HTMLElement', function() {
        var component = new Coral.ComponentTestContentZone();
        var content = document.createElement('coral-component-test-contentzone-content');
        content.innerHTML = 'Content!';

        component.content = content;

        expect(component.content.innerHTML).to.equal('Content!');
      });
    });
  });

});
