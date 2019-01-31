import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {commons, validate, transform} from '../../../coralui-utils';
import register from '../../libs/register';
import property from '../../libs/property';

describe('register', function() {
  
  // Used to register components
  window.CustomNamespace = {};
  
  describe('#defineProperties', function() {
    var Parent;
    var Child;
    
    before(function() {
      Parent = register({
        tagName: 'coral-property-remove-parent',
        name: 'PropertyRemoveParent',
        namespace: window.CustomNamespace,
        properties: {
          'prop1': {
            default: 1
          },
          'prop2': {
            default: 2
          }
        }
      });
      Child = register({
        tagName: 'coral-property-remove-child',
        name: 'PropertyRemoveChild',
        namespace: window.CustomNamespace,
        properties: {
          'prop1': {
            default: 1
          },
          'prop2': null
        }
      });
    });
    
    it('should remove properties that are set to null', function() {
      expect(Parent.prototype._properties.prop1).to.not.equal(undefined);
      expect(Parent.prototype._properties.prop2).to.not.equal(undefined);
      expect(Child.prototype._properties.prop1).to.not.equal(undefined);
      expect(Child.prototype._properties.prop2).to.equal(undefined);
    });
  });
  
  describe('#augmentProperties', function() {
    // Use a fresh noop for each function property so we can test strict equality
    var baseDestDesc = {
      'prop': {
        default: 'DestDefault',
        reflectAttribute: false,
        set: function() {},
        get: function() {},
        sync: function() {},
        transform: function() {},
        attributeTransform: function() {},
        validate: function() {},
        trigger: 'DestEvent',
        triggerBefore: 'DestBeforeEvent'
      }
    };
    
    var baseSourceDesc = {
      'prop': {
        default: 'SourceDefault',
        reflectAttribute: true,
        set: function() {},
        get: function() {},
        sync: function() {},
        transform: function() {},
        attributeTransform: function() {},
        validate: function() {},
        trigger: 'SourceEvent',
        triggerBefore: 'SourceBeforeEvent'
      }
    };
    
    function getDestDesc() {
      return {
        'prop': commons.extend({}, baseDestDesc.prop)
      };
    }
    
    function getSourceDesc() {
      return {
        'prop': commons.extend({}, baseSourceDesc.prop)
      };
    }
    
    it('should call both sync and set methods if provided', function() {
      var destDescSetSpy = sinon.spy();
      var destDescSyncSpy = sinon.spy();
      var destDesc = getDestDesc();
      destDesc.prop.set = destDescSetSpy;
      destDesc.prop.sync = destDescSyncSpy;
      
      var sourceDescSetSpy = sinon.spy();
      var sourceDescSyncSpy = sinon.spy();
      var sourceDesc = getSourceDesc();
      sourceDesc.prop.set = sourceDescSetSpy;
      sourceDesc.prop.sync = sourceDescSyncSpy;
      
      register.augmentProperties(destDesc, sourceDesc);
      
      // These properties should not be the same
      expect(destDesc.prop.set).to.not.equal(destDescSetSpy);
      expect(destDesc.prop.sync).to.not.equal(destDescSyncSpy);
      expect(destDesc.prop.set).to.not.equal(sourceDescSetSpy);
      expect(destDesc.prop.sync).to.not.equal(sourceDescSyncSpy);
      
      destDesc.prop.set();
      expect(sourceDescSetSpy.callCount).to.equal(1);
      expect(destDescSetSpy.callCount).to.equal(1);
      
      destDesc.prop.sync();
      expect(sourceDescSyncSpy.callCount).to.equal(1);
      expect(destDescSyncSpy.callCount).to.equal(1);
    });
    
    it('should use the destination value in all other cases', function() {
      var destDesc = getDestDesc();
      var sourceDesc = getSourceDesc();
      
      register.augmentProperties(destDesc, sourceDesc);
      
      // These properties should not be the same
      expect(destDesc.prop.set).to.not.equal(baseDestDesc.prop.set);
      expect(destDesc.prop.sync).to.not.equal(baseDestDesc.prop.sync);
      
      // These properties should be the same
      expect(destDesc.prop.get).to.equal(baseDestDesc.prop.get);
      expect(destDesc.prop.transform).to.equal(baseDestDesc.prop.transform);
      expect(destDesc.prop.attributeTransform).to.equal(baseDestDesc.prop.attributeTransform);
      expect(destDesc.prop.validate).to.equal(baseDestDesc.prop.validate);
      expect(destDesc.prop.reflectAttribute).to.equal(baseDestDesc.prop.reflectAttribute);
      expect(destDesc.prop.trigger).to.equal(baseDestDesc.prop.trigger);
      expect(destDesc.prop.triggerBefore).to.equal(baseDestDesc.prop.triggerBefore);
    });
    
    it('should use all source values if descriptor.override = true', function() {
      // This is the component's prototype
      var destDesc = getDestDesc();
      
      // The component doesn't want mixins to override it
      destDesc.prop.override = true;
      
      // This is the mixin's prototype
      var sourceDesc = getSourceDesc();
      
      register.augmentProperties(destDesc, sourceDesc);
      
      // These properties should not be the same
      expect(destDesc.prop.default).to.equal(destDesc.prop.default);
      expect(destDesc.prop.set).to.equal(destDesc.prop.set);
      expect(destDesc.prop.sync).to.equal(destDesc.prop.sync);
      expect(destDesc.prop.get).to.equal(destDesc.prop.get);
      expect(destDesc.prop.transform).to.equal(destDesc.prop.transform);
      expect(destDesc.prop.attributeTransform).to.equal(destDesc.prop.attributeTransform);
      expect(destDesc.prop.validate).to.equal(destDesc.prop.validate);
      expect(destDesc.prop.reflectAttribute).to.equal(destDesc.prop.reflectAttribute);
      expect(destDesc.prop.trigger).to.equal(destDesc.prop.trigger);
      expect(destDesc.prop.triggerBefore).to.equal(destDesc.prop.triggerBefore);
    });
    
    it('should support custom collision handler', function() {
      var destDesc = getDestDesc();
      var sourceDesc = getSourceDesc();
      
      register.augmentProperties(destDesc, sourceDesc, function(destValue, sourceValue) {
        return sourceValue;
      });
      
      // These properties should not be the same
      expect(destDesc.prop.default).to.equal(sourceDesc.prop.default);
      expect(destDesc.prop.set).to.equal(sourceDesc.prop.set);
      expect(destDesc.prop.sync).to.equal(sourceDesc.prop.sync);
      expect(destDesc.prop.get).to.equal(sourceDesc.prop.get);
      expect(destDesc.prop.transform).to.equal(sourceDesc.prop.transform);
      expect(destDesc.prop.attributeTransform).to.equal(sourceDesc.prop.attributeTransform);
      expect(destDesc.prop.validate).to.equal(sourceDesc.prop.validate);
      expect(destDesc.prop.reflectAttribute).to.equal(sourceDesc.prop.reflectAttribute);
      expect(destDesc.prop.trigger).to.equal(sourceDesc.prop.trigger);
      expect(destDesc.prop.triggerBefore).to.equal(sourceDesc.prop.triggerBefore);
    });
  });
  
  describe('mixins', function() {
    var CoralMixinObject;
    before(function() {
      CoralMixinObject = register({
        name: 'CoralMixinObject',
        namespace: window.CustomNamespace,
        tagName: 'coral-mixin-object',
        mixins: {
          mixed: true
        }
      });
    });
    it('should support object mixins', function() {
      expect(CoralMixinObject.prototype.mixed).to.equal(true);
    });
    
    var CoralMixinFunction;
    before(function() {
      var properties = { a: {}, b: {}, c: {}};
      CoralMixinFunction = register({
        name: 'CoralMixinFunction',
        namespace: window.CustomNamespace,
        tagName: 'coral-mixin-functional',
        properties: properties,
        mixins: function(object, options) {
          object.mixed = true;
          expect(options.properties).to.eql(properties);
        }
      });
    });
    it('should support functional mixins and pass options to them', function() {
      expect(CoralMixinFunction.prototype.mixed).to.equal(true);
    });
    
    var CoralMixinArray;
    before(function() {
      var properties = {};
      CoralMixinArray = register({
        name: 'CoralMixinArray',
        namespace: window.CustomNamespace,
        tagName: 'coral-mixin-array',
        properties: properties,
        mixins: [
          {
            mixedByObject: true,
          },
          function(object, options) {
            object.mixedByFunction = true;
            expect(options.properties).to.eql(properties);
          }
        ]
      });
    });
    it('should support a mixed array of object and functional mixins and should pass options', function() {
      expect(CoralMixinArray.prototype.mixedByObject).to.equal(true);
      expect(CoralMixinArray.prototype.mixedByFunction).to.equal(true);
    });
  });
  
  describe.skip('should perform linear inheritance', function() {
  });
  
  describe.skip('should implement passive setters', function() {
  });
  
  describe.skip('should publish attributes', function() {
  });
  
  describe.skip('should manage component lifecycle', function() {
  });
  
  describe.skip('should sync properties to the DOM', function() {
  });
  
  describe('extending native tags', function() {
    var CoralTestAnchor;
    var CoralTestLegacyAnchor;
    var CoralTestItem;
    var CoralTestAnchorItem;
    var CoralTestButton;
    var CoralTestAnchorButton;
    
    before(function() {
      CoralTestAnchor = register({
        name: 'CoralTestAnchor',
        namespace: window.CustomNamespace,
        tagName: 'coral-test-anchor',
        baseTagName: 'a'
      });
      
      CoralTestLegacyAnchor = register({
        name: 'CoralTestLegacyAnchor',
        namespace: window.CustomNamespace,
        tagName: 'coral-test-legacy-anchor',
        baseTagName: 'a',
        extend: HTMLAnchorElement
      });
      
      CoralTestItem = register({
        name: 'CoralTestItem',
        namespace: window.CustomNamespace,
        tagName: 'coral-test-item',
        properties: {
          'testName': {
            get: function() {
              return 'My name!';
            }
          }
        },
        testMethod: function() {
          return 'My method!';
        }
      });
      
      CoralTestAnchorItem = register({
        name: 'CoralTestAnchorItem',
        namespace: window.CustomNamespace,
        tagName: 'coral-test-anchor-item',
        baseTagName: 'a',
        extend: CoralTestItem
      });
      
      CoralTestButton = register({
        name: 'CoralTestButton',
        namespace: window.CustomNamespace,
        tagName: 'coral-test-button',
        baseTagName: 'button',
        properties: {
          'icon': {
            get: function() {
              return 'My icon!';
            }
          }
        },
        buttonMethod: function() {
          return 'My button method!';
        }
      });
      
      CoralTestAnchorButton = register({
        name: 'CoralTestAnchorButton',
        namespace: window.CustomNamespace,
        tagName: 'coral-test-anchorbutton',
        baseTagName: 'a',
        extend: CoralTestButton
      });
    });
    
    it('should allow extending a native tag', function() {
      var anchor = new CoralTestAnchor();
      expect(anchor.tagName).to.equal('A');
      expect(anchor.getAttribute('is')).to.equal('coral-test-anchor');
      expect(anchor instanceof CoralTestAnchor).to.equal(true);
      expect(anchor.on).to.be.a('function', 'on should be a function');
      expect(anchor.remove).to.be.a('function', 'remove should be a function');
    });
    
    
    it('should allow extending a native tag with legacy syntax', function() {
      var anchor = new CoralTestLegacyAnchor();
      expect(anchor.tagName).to.equal('A');
      expect(anchor.getAttribute('is')).to.equal('coral-test-legacy-anchor');
      expect(anchor instanceof CoralTestLegacyAnchor).to.equal(true);
      expect(anchor.on).to.be.a('function', 'on should be a function');
      expect(anchor.remove).to.be.a('function', 'remove should be a function');
    });
    
    it('should allow extending a native tag with extends', function() {
      var anchor = new CoralTestAnchorItem();
      expect(anchor.tagName).to.equal('A');
      expect(anchor.getAttribute('is')).to.equal('coral-test-anchor-item');
      expect(anchor instanceof CoralTestAnchorItem).to.equal(true);
      expect(anchor.on).to.be.a('function', 'on should be a function');
      expect(anchor.remove).to.be.a('function', 'remove should be a function');
      expect(anchor.testMethod).to.be.a('function', 'testMethod should be a function');
      expect(anchor.testName).to.equal('My name!');
    });
    
    it('should allow extending a component with a baseTag under a different tag name', function() {
      var anchor = new CoralTestAnchorButton();
      expect(anchor.tagName).to.equal('A');
      expect(anchor.getAttribute('is')).to.equal('coral-test-anchorbutton');
      expect(anchor instanceof CoralTestAnchorButton).to.equal(true);
      expect(anchor.on).to.be.a('function', 'on should be a function');
      expect(anchor.remove).to.be.a('function', 'remove should be a function');
      expect(anchor.buttonMethod).to.be.a('function', 'buttonMethod should be a function');
      expect(anchor.icon).to.equal('My icon!');
    });
  });
  
  var RegisterTestComponent;
  before(function() {
    RegisterTestComponent = register({
      name: 'RegisterTestComponent',
      namespace: window.CustomNamespace,
      tagName: 'coral-register-test-component',
      className: 'coral-RegisterTestComponent',
      properties: {
        'answer': {
          default: 42
        },
        'disabled': {
          default: false,
          set: function(value) {
            this._oldSetter();
            this._disabled = value;
          },
          get: function() {
            return this._disabled;
          },
          sync: function() {
            this._oldSyncer();
          }
        }
      },
      
      // Empty methods we can attach spys to in tests
      _oldSetter: function() {},
      _oldSyncer: function() {}
    });
  });
  
  it('should return the created component', function() {
    expect(RegisterTestComponent === window.CustomNamespace.RegisterTestComponent).to.be.true;
  });
  
  it('should set default property values', function() {
    var component = new RegisterTestComponent();
    expect(component.disabled).to.be.false;
  });
  
  var DefaultOverrider;
  before(function() {
    DefaultOverrider = register({
      name: 'DefaultOverrider',
      namespace: window.CustomNamespace,
      tagName: 'coral-default-overrider',
      className: 'coral-DefaultOverrider',
      extend: RegisterTestComponent,
      
      properties: {
        'disabled': {
          default: true
        }
      }
    });
  });
  
  it('should support overriding just the default value of a property', function() {
    var overrider = new DefaultOverrider();
    var oldSetterSpy = sinon.spy(overrider, '_oldSetter');
    
    // Test default value
    expect(overrider.disabled).to.be.true;
    
    // Make sure setter was not overridden
    overrider.disabled = false;
    
    expect(oldSetterSpy.callCount).to.equal(1, 'oldSetterSpy callcount after property set');
  });
  
  it('should have correct default value for non-overriden properties', function() {
    var overrider = new DefaultOverrider();
    
    expect(overrider.answer).to.equal(42);
  });
  
  var SetSyncOverrider;
  before(function() {
    SetSyncOverrider = register({
      name: 'SetSyncOverrider',
      namespace: window.CustomNamespace,
      tagName: 'coral-setsync-overrider',
      className: 'coral-SetSyncOverrider',
      extend: RegisterTestComponent,
      
      properties: {
        'answer': {
          default: 42
        },
        'disabled': {
          set: function(value) {
            this._newSetter();
          },
          sync: function() {
            this._newSyncer();
          }
        }
      },
      
      // Empty methods we can attach spys to in tests
      _newSetter: function() {},
      _newSyncer: function() {}
    });
  });
  it('should support overriding the set and sync methods of property descriptor', function(done) {
    var overrider = new SetSyncOverrider();
    var oldSetterSpy = sinon.spy(overrider, '_oldSetter');
    var newSetterSpy = sinon.spy(overrider, '_newSetter');
    var oldSyncerSpy = sinon.spy(overrider, '_oldSyncer');
    var newSyncerSpy = sinon.spy(overrider, '_newSyncer');
    
    // Default should be intact
    expect(overrider.disabled).to.equal(false, 'Initial value of disabled');
    
    // Setting should trigger both setters and sync methods
    overrider.disabled = true;
    
    expect(oldSetterSpy.callCount).to.equal(1, 'oldSetterSpy call count after property set');
    expect(newSetterSpy.callCount).to.equal(1, 'newSetterSpy call count after property set');
    helpers.next(function() {
      expect(oldSyncerSpy.callCount).to.equal(1, 'oldSyncerSpy call count after property set');
      expect(newSyncerSpy.callCount).to.equal(1, 'newSyncerSpy call count after property set');
      done();
    });
  });
  
  it('should support mixins that add/modify properties on components with no properties', function() {
    var MixedPropertiesOnly;
    expect(function() {
      MixedPropertiesOnly = register({
        name: 'NoProperties',
        namespace: window.CustomNamespace,
        tagName: 'coral-mixed-properties-ponly',
        className: 'coral-MixedPropertiesOnly',
        
        mixins: function(object, options) {
          // Add properties
          register.augmentProperties(options.properties, {
            'disabled': {
              default: true,
              set: function() {},
              sync: function() {}
            }
          });
        }
      });
    }).to.not.throw(Error);
    
    expect(MixedPropertiesOnly.prototype._properties).to.have.property('disabled');
  });
  
  var SetSyncOverriderMixer;
  var originalDescriptor = {
    'disabled': {
      set: function(value) {
        this._newSetter();
      },
      sync: function() {
        this._newSyncer();
      }
    }
  };
  before(function() {
    SetSyncOverriderMixer = register({
      name: 'SetSyncOverriderMixer',
      namespace: window.CustomNamespace,
      tagName: 'coral-setsync-overridermixer',
      className: 'coral-SetSyncOverriderMixer',
      extend: RegisterTestComponent,
      
      mixins: function(object, options) {
        // Add methods
        commons.extend(object, {
          _mixinSetter: function() {},
          _mixinSyncer: function() {},
        });
        
        // Add properties
        register.augmentProperties(options.properties, {
          'disabled': {
            default: true,
            set: function() {
              this._mixinSetter();
            },
            sync: function() {
              this._mixinSyncer();
            }
          }
        });
      },
      
      properties: originalDescriptor,
      
      // Empty methods we can attach spys to in tests
      _newSetter: function() {},
      _newSyncer: function() {}
    });
  });
  it('should support overriding the set and sync methods of property descriptor with mixins', function(done) {
    // The descriptor should not have been modified
    expect(Object.keys(originalDescriptor.disabled).length).to.equal(2);
    
    var overrider = new SetSyncOverriderMixer();
    var oldSetterSpy = sinon.spy(overrider, '_oldSetter');
    var newSetterSpy = sinon.spy(overrider, '_newSetter');
    var mixinSetterSpy = sinon.spy(overrider, '_mixinSetter');
    var oldSyncerSpy = sinon.spy(overrider, '_oldSyncer');
    var newSyncerSpy = sinon.spy(overrider, '_newSyncer');
    var mixinSyncerSpy = sinon.spy(overrider, '_mixinSyncer');
    
    // Default should be set by mixin
    expect(overrider.disabled).to.equal(true, 'Initial value of disabled');
    
    // Setting should trigger both setters and sync methods
    overrider.disabled = false;
    expect(oldSetterSpy.callCount).to.equal(1, 'oldSetterSpy call count after property set');
    expect(newSetterSpy.callCount).to.equal(1, 'newSetterSpy call count after property set');
    expect(mixinSetterSpy.callCount).to.equal(1, 'mixinSetterSpy call count after property set');
    helpers.next(function() {
      expect(oldSyncerSpy.callCount).to.equal(1, 'oldSyncerSpy call count after property set');
      expect(newSyncerSpy.callCount).to.equal(1, 'newSyncerSpy call count after property set');
      expect(mixinSyncerSpy.callCount).to.equal(1, 'mixinSyncerSpy call count after property set');
      done();
    });
  });
  
  it('should have correct default values for non-overriden properties when overriding mixin used', function() {
    var overrider = new SetSyncOverriderMixer();
    expect(overrider.answer).to.equal(42);
  });
  
  var SetSyncOverriderMixerForcer;
  before(function() {
    SetSyncOverriderMixerForcer = register({
      name: 'SetSyncOverriderMixerForcer',
      namespace: window.CustomNamespace,
      tagName: 'coral-setsync-overridermixerforcer',
      className: 'coral-SetSyncOverriderMixerForcer',
      extend: RegisterTestComponent,
      
      mixins: function(object, options) {
        // Add methods
        commons.extend(object, {
          _mixinSetter: function() {},
          _mixinSyncer: function() {},
        });
        
        // Add properties -- this does nothing for properties with override: true on the mixin target
        register.augmentProperties(options.properties, {
          'disabled': {
            default: false,
            set: function(value) {
              this._mixinSetter();
              this._disabled = value;
            },
            get: function() {
              return this._disabled;
            },
            sync: function() {
              this._mixinSyncer();
            }
          }
        });
      },
      
      properties: {
        'disabled': {
          override: true, // Tell the mixin not to override our property
          default: 1,
          set: function(value) {
            this._newSetter();
            // Must store value since we're overriding
            this._disabled = value;
          },
          sync: function() {
            this._newSyncer();
          }
        }
      },
      
      // Empty methods we can attach spys to in tests
      _newSetter: function() {},
      _newSyncer: function() {}
    });
  });
  it('should support overriding the set and sync methods of property descriptor with components that force override', function(done) {
    var overrider = new SetSyncOverriderMixerForcer();
    var oldSetterSpy = sinon.spy(overrider, '_oldSetter');
    var newSetterSpy = sinon.spy(overrider, '_newSetter');
    var mixinSetterSpy = sinon.spy(overrider, '_mixinSetter');
    var oldSyncerSpy = sinon.spy(overrider, '_oldSyncer');
    var newSyncerSpy = sinon.spy(overrider, '_newSyncer');
    var mixinSyncerSpy = sinon.spy(overrider, '_mixinSyncer');
    
    // Default should NOT be changed by mixin
    expect(overrider.disabled).to.equal(1, 'Initial value of disabled');
    
    // Setting should trigger NOT trigger old setters and sync methods
    overrider.disabled = 0;
    expect(oldSetterSpy.callCount).to.equal(0, 'oldSetterSpy call count after property set');
    expect(mixinSetterSpy.callCount).to.equal(0, 'mixinSetterSpy call count after property set');
    expect(newSetterSpy.callCount).to.equal(1, 'newSetterSpy call count after property set');
    helpers.next(function() {
      expect(oldSyncerSpy.callCount).to.equal(0, 'oldSyncerSpy call count after property set');
      expect(mixinSyncerSpy.callCount).to.equal(0, 'mixinSyncerSpy call count after property set');
      expect(newSyncerSpy.callCount).to.equal(1, 'newSyncerSpy call count after property set');
      done();
    });
  });
  
  it('should support synchronous proxied properties', function() {
    var PropSetter = register({
      tagName: 'coral-propsetter',
      name: 'PropSetter',
      namespace: window.CustomNamespace,
      properties: {
        proxyProp: property.proxy({
          path: 'prop', // Set this.prop
          needsDOMSync: false, // Do the set synchnorously
          transform: transform.number, // Be a number
          default: 1 // Start with a default
        })
      }
    });
    
    var propSetter = window.propSetter = new PropSetter();
    propSetter.proxyProp = '2';
    
    // No temporary variable should not be set
    expect(propSetter._proxyProp).to.be.undefined;
    expect(propSetter._prop).to.be.undefined;
    
    // Property should be transformed
    expect(propSetter.prop).to.equal(2);
    expect(propSetter.proxyProp).to.equal(2);
  });
  
  it('should support asynchronous proxied properties', function(done) {
    var HTMLSetter = register({
      tagName: 'coral-htmlsetter',
      name: 'HTMLSetter',
      namespace: window.CustomNamespace,
      properties: {
        content: property.proxy({
          path: '_elements.heading.innerHTML', // Set the innerHTML property of this._elements.heading
          needsDOMSync  : true // Do the set asynchnorously
        })
      },
      _render: function() {
        var heading = document.createElement('h1');
        this._elements.heading = heading;
        this.appendChild(heading);
      }
    });
    
    var content = 'Test!';
    
    var htmlSetter = window.htmlSetter = new HTMLSetter();
    htmlSetter.content = content;
    
    // Temporary variable should be set
    expect(htmlSetter._content).to.equal(content);
    
    helpers.next(function() {
      try {
        // Temporary variable should not be undefined
        expect(htmlSetter._content).to.be.undefined;
        
        // Heading should be set
        expect(htmlSetter._elements.heading.innerHTML).to.equal(content);
        
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });
  
  it('should support synchronous proxied string attributes', function(done) {
    var StringAttrSetter = register({
      tagName: 'coral-string-attr-setter',
      name: 'StringAttrSetter',
      namespace: window.CustomNamespace,
      properties: {
        'ariaLabelledby': property.proxyAttr({
          attribute: 'aria-labelledby',
          handle: 'input', // Set the aria-labelledby attribute of this._elements.input
        })
      },
      _render: function() {
        var input = document.createElement('input');
        this._elements.input = input;
        this.appendChild(input);
      }
    });
    
    var ariaSetter = window.ariaSetter = new StringAttrSetter();
  
    ariaSetter.setAttribute('aria-labelledby', 'someId');
    
    // FF needs one more frame
    helpers.next(function() {
      expect(ariaSetter._elements.input.getAttribute('aria-labelledby')).to.equal('someId');
  
      ariaSetter.removeAttribute('aria-labelledby');
      helpers.next(function() {
        expect(ariaSetter._elements.input.hasAttribute('aria-labelledby')).to.equal(false);
  
        ariaSetter.ariaLabelledby = 'null';
        helpers.next(function() {
          expect(ariaSetter._elements.input.getAttribute('aria-labelledby')).to.equal('null');
  
          ariaSetter.ariaLabelledby = 'false';
          helpers.next(function() {
            expect(ariaSetter._elements.input.getAttribute('aria-labelledby')).to.equal('false');
            
            ariaSetter.ariaLabelledby = null;
            helpers.next(function() {
              expect(ariaSetter._elements.input.hasAttribute('aria-labelledby')).to.equal(false);
    
              ariaSetter.ariaLabelledby = false;
              helpers.next(function() {
                expect(ariaSetter._elements.input.hasAttribute('aria-labelledby')).to.equal(false);
      
                done();
              });
            });
          });
        });
      });
    });
  });
  
  it('should support synchronous proxied boolean attributes', function(done) {
    var BooleanAttrSetter = register({
      tagName: 'coral-boolean-attr-setter',
      name: 'BooleanAttrSetter',
      namespace: window.CustomNamespace,
      properties: {
        'ariaHidden': property.proxyAttr({
          transform: transform.boolean,
          attributeTransform: transform.booleanAttr,
          attribute: 'aria-hidden',
          handle: 'input', // Set the aria-hidden attribute of this._elements.input
        })
      },
      _render: function() {
        var input = document.createElement('input');
        this._elements.input = input;
        this.appendChild(input);
      }
    });
    
    var ariaSetter = window.ariaSetter = new BooleanAttrSetter();
    
    ariaSetter.setAttribute('aria-hidden', true);
  
    // FF needs one more frame
    helpers.next(function() {
      expect(ariaSetter._elements.input.getAttribute('aria-hidden')).to.equal('true');
  
      ariaSetter.removeAttribute('aria-hidden');
      helpers.next(function() {
        expect(ariaSetter._elements.input.hasAttribute('aria-hidden')).to.equal(false);
  
        ariaSetter.ariaHidden = null;
        helpers.next(function() {
          expect(ariaSetter._elements.input.hasAttribute('aria-hidden')).to.equal(false);
  
          ariaSetter.ariaHidden = true;
          helpers.next(function() {
            expect(ariaSetter._elements.input.getAttribute('aria-hidden')).to.equal('true');
  
            ariaSetter.ariaHidden = false;
            helpers.next(function() {
              expect(ariaSetter._elements.input.hasAttribute('aria-hidden')).to.equal(false);
              
              done();
            });
          });
        });
      });
    });
  });
  
  it('should support all Coral~PropertyDescriptor options at once', function(done) {
    var transformSpy = sinon.spy();
    var eventSpy = sinon.spy();
    var syncSpy = sinon.spy();
    var alsoSpy = sinon.spy();
    var validateSpy = sinon.spy();
    
    var FT = register({
      tagName: 'coral-faketag',
      name: 'FT',
      namespace: window.CustomNamespace,
      properties: {
        'value': {
          default: 1,
          
          // Attribute should reflect property value
          reflectAttribute: true,
          
          // Attribute should be named data-value, property should be named value
          attribute: 'data-value',
          
          // All values will be passed to this function first
          transform: function(value) {
            transformSpy();
            return value === null ? value : parseFloat(value);
          },
          
          // Only allow values 1 - 10
          validate: function(value) {
            validateSpy();
            return value > 0 && value <= 10;
          },
          
          // Triggered when the value changes
          trigger: 'coralui-ft:change',
          
          // Called on the nextFrame the value has changed
          // Stored on prototype as _sync_value
          sync: function() {
            syncSpy();
          },
          
          alsoSync: ['also']
        },
        'also': {
          sync: function() {
            alsoSpy();
          }
        }
      }
    });
    
    var pd = window.pd = new FT();
    
    // FF needs one more frame
    helpers.next(function() {
      pd.on('coralui-ft:change', eventSpy);
  
      expect(pd.value).to.equal(1, 'Default value should be applied');
      expect(transformSpy.callCount).to.equal(2, 'Property transform should be called once during initialization and once in attributeChangedCallback');
      
      pd.value = '4';

      helpers.next(function() {
        expect(eventSpy.callCount).to.equal(1, 'Event should be triggered');
        expect(transformSpy.callCount).to.equal(4, 'Property transform should be called once after property set and once in attributeChangedCallback');
        expect(pd.value).to.equal(4, 'Value should be transformed to a number');
        expect(pd.getAttribute('data-value')).to.equal('4', 'Property should be reflected as an attribute');
  
        // Set out of range value
        pd.value = 12;
        expect(pd.value).to.equal(4, 'Value should not change if validate returns false');
        expect(eventSpy.callCount).to.equal(1, 'Event should not be triggered if validate returns false');

        done();
      });
    });
  });
  
  it('should support validate as an array', function() {
    var transformSpy = sinon.spy();
    var eventSpy = sinon.spy();
    
    var FT = register({
      tagName: 'coral-validation-tag',
      name: 'ValidationTag',
      namespace: window.CustomNamespace,
      properties: {
        'size': {
          default: 'S',
          
          // Allows support for lower case sizes
          transform: function(value) { transformSpy(); return value.toUpperCase(); },
          
          // Triggered when the value changes
          trigger: 'coral-validation-tag:change',
          
          // Value must change and it should be part of the enum
          validate: [ validate.valueMustChange, validate.enumeration(['XS', 'S', 'M', 'L'])]
        }
      }
    });
    
    var pd = window.pd = new FT();
    pd.on('coral-validation-tag:change', eventSpy);
    
    expect(pd.size).to.equal('S', 'Default value should be applied');
    expect(transformSpy.callCount).to.equal(1, 'Property transform should be called once during initialization');
    
    pd.size = 'm';
    
    expect(eventSpy.callCount).to.equal(1, 'Event should be triggered');
    expect(transformSpy.callCount).to.equal(2, 'Property transform should be called once after property set and once in attributeChangedCallback');
    expect(pd.size).to.equal('M', 'Value should be transformed to uppercase');
    
    // Set same value
    pd.size = 'm';
    expect(eventSpy.callCount).to.equal(1, 'Event should not be triggered when value to set to existing value');
    
    // Set out of range value
    pd.size = 'invalid value';
    expect(pd.size).to.equal('M', 'Value should not change if validate returns false');
    expect(eventSpy.callCount).to.equal(1, 'Event should not be triggered if validate returns false');
    
  });
  
  describe('event triggers', function() {
    it('should support trigger and triggerBefore as functions', function() {
      var changeSpy = sinon.spy();
      var beforechangeSpy = sinon.spy();
      
      var Trigger = register({
        tagName: 'coral-trigger-function',
        name: 'Trigger',
        namespace: window.CustomNamespace,
        properties: {
          'value': {
            default: 0,
            trigger: changeSpy,
            triggerBefore: beforechangeSpy
          }
        }
      });
      
      var t = new Trigger();
      
      t.value = 1;
      
      expect(changeSpy.callCount).to.equal(1, 'changeSpy call count after trigger');
      expect(beforechangeSpy.callCount).to.equal(1, 'beforechangeSpy call count after trigger');
    });
    
    it('should support trigger and triggerBefore as strings', function() {
      var changeSpy = sinon.spy();
      var beforechangeSpy = sinon.spy();
      
      var Trigger = register({
        tagName: 'coral-trigger-string',
        name: 'Trigger',
        namespace: window.CustomNamespace,
        properties: {
          'value': {
            default: 0,
            trigger: 'coral-trigger:changed',
            triggerBefore: 'coral-trigger:beforechanged'
          }
        }
      });
      
      var t = new Trigger();
      t.on('coral-trigger:changed', changeSpy);
      t.on('coral-trigger:beforechanged', beforechangeSpy);
      
      t.value = 1;
      
      expect(changeSpy.callCount).to.equal(1, 'changeSpy call count after trigger');
      expect(beforechangeSpy.callCount).to.equal(1, 'beforechangeSpy call count after trigger');
    });
    
    it('should support trigger as string and triggerBefore = true', function() {
      var changeSpy = sinon.spy();
      var beforechangeSpy = sinon.spy();
      
      var Trigger = register({
        tagName: 'coral-trigger-boolean',
        name: 'Trigger',
        namespace: window.CustomNamespace,
        properties: {
          'value': {
            default: 0,
            trigger: 'coral-trigger:changed',
            triggerBefore: true
          }
        }
      });
      
      var t = new Trigger();
      t.on('coral-trigger:changed', changeSpy);
      t.on('coral-trigger:beforechanged', beforechangeSpy);
      
      t.value = 1;
      
      expect(changeSpy.callCount).to.equal(1, 'changeSpy call count after trigger');
      expect(beforechangeSpy.callCount).to.equal(1, 'beforechangeSpy call count after trigger');
    });
    
    it('should support preventDefault when triggerBefore = true', function() {
      var Trigger = register({
        tagName: 'coral-triggerbefore-with-preventdefault',
        name: 'Trigger',
        namespace: window.CustomNamespace,
        properties: {
          'value': {
            default: 0,
            trigger: 'coral-trigger:changed',
            triggerBefore: true
          }
        }
      });
      
      var changeSpy = sinon.spy();
      var beforechangeSpy = sinon.spy();
      
      var t = new Trigger();
      
      t.on('coral-trigger:changed', function(event) {
        changeSpy();
      });
      t.on('coral-trigger:beforechanged', function(event) {
        beforechangeSpy();
        
        // Prevent the event
        event.preventDefault();
      });
      
      t.value = 1;
      
      expect(t.value).to.equal(0);
      expect(beforechangeSpy.callCount).to.equal(1, 'beforechangeSpy call count after trigger');
      expect(changeSpy.callCount).to.equal(0, 'changeSpy call count after beforechange preventDefault()');
    });
    
    it('should not allow triggerBefore = true without trigger', function() {
      expect(function() {
        register({
          tagName: 'coral-triggerbefore-with-undefined-trigger',
          name: 'Trigger',
          namespace: window.CustomNamespace,
          properties: {
            'value': {
              default: 0,
              triggerBefore: true
            }
          }
        });
      }).to.throw();
    });
    
    it('should not allow triggerBefore = true with trigger as function', function() {
      expect(function() {
        register({
          tagName: 'coral-triggerbefore-with-trigger-as-function',
          name: 'Trigger',
          namespace: window.CustomNamespace,
          properties: {
            'value': {
              default: 0,
              trigger: function() {},
              triggerBefore: true
            }
          }
        });
      }).to.throw();
    });
    
    it('should not allow triggerBefore = true with trigger as invalid string', function() {
      expect(function() {
        register({
          tagName: 'coral-triggerbefore-with-trigger-as-function',
          name: 'Trigger',
          namespace: window.CustomNamespace,
          properties: {
            'value': {
              default: 0,
              trigger: 'myevent',
              triggerBefore: true
            }
          }
        });
      }).to.throw();
    });
  });
  
  describe('className', function() {
    
    it('should be optional', function() {
      var Component = register({
        tagName: 'coral-no-class',
        name: 'NoClass',
        namespace: window.CustomNamespace
      });
      
      var el = new Component();
      expect(el).to.have.property('className', '');
    });
    
    var OneClassComponent = register({
      tagName: 'coral-one-class',
      name: 'OneClass',
      namespace: window.CustomNamespace,
      className: 'first-class'
    });
    
    it('should allow to set a single class', function() {
      var el = new OneClassComponent();
      expect(el).to.have.property('className', 'first-class');
    });
    
    it('should allow to set multiple classes', function() {
      var Component = register({
        tagName: 'coral-two-classes',
        name: 'TwoClasses',
        namespace: window.CustomNamespace,
        className: 'first-class second-class third-class'
      });
      
      var el = new Component();
      expect(el).to.have.property('className', 'first-class second-class third-class');
    });
    
    // @flaky in FF
    it.skip('should not overwrite pre upgrade classes', function() {
      var el = document.createElement('coral-delayed-upgrade');
      el.className = 'pre-upgrade-class';
      
      expect(el).to.have.property('className', 'pre-upgrade-class');
      
      register({
        tagName: 'coral-delayed-upgrade',
        name: 'DelayedUpgrade',
        namespace: window.CustomNamespace,
        className: 'post-upgrade-class'
      });
      
      expect(el).to.have.property('className', 'pre-upgrade-class post-upgrade-class');
    });
    
    it('should not duplicate the class when node is cloned', function() {
      var el = new OneClassComponent();
      var clonedEl = el.cloneNode();
      expect(clonedEl).to.have.property('className', 'first-class');
    });
  });
  
  describe('namespace', function() {
    it('should be possible to define a component in a custom namespace', function() {
      var Custom = {};
  
      var constructor = register({
        tagName: 'custom-component',
        name: 'Component',
        namespace: Custom
      });
      
      expect(Custom.Component).to.equal(constructor);
      expect(new Custom.Component().tagName).to.equal('CUSTOM-COMPONENT');
    });
  });
});
