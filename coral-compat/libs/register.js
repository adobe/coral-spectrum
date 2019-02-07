/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {commons, validate} from '../../coral-utils';
import Component from './Component';

/**
 A property descriptor.
 
 @typedef {Object} Coral~PropertyDescriptor
 @property {Function} [transform=null]
 The value transformation function. Values passed to setters will be ran through this function first.
 @property {Function} [attributeTransform=transform]
 The value transformation function for attribute. The value given by <code>attributeChangedCallback</code> will be
 ran through this function first before passed to setters.
 @property {Coral.validate~validationFunction} [validate={@link Coral.validate.valueMustChange}]
 The value validation function. A validation function that takes two arguments, <code>newValue</code> and
 <code>oldValue</code>, returning true if the setter should run or false if not.
 @property {String|Function} [trigger=null]
 The name of the event to trigger after this property changes, or a {Function} to call that will trigger the event.
 The function is passed the <code>newValue</code> and <code>oldValue</code>.
 @property {String|Function} [triggerBefore=null]
 The name of the event to trigger before this property changes, a {Function} to call that will trigger the event,
 or <code>true</code> to set the name automatically. The function is passed the <code>newValue</code> and
 <code>oldValue</code> and must return the Event object for <code>preventDefault()</code> to work within handlers. If
 set to <code>true</code>, {@link Coral~PropertyDescriptor} must be a string with a colon in it, such as
 <code>coral-component:change</code>, which results in <code>coral-component:beforechange</code>. If set to
 <code>false</code>, no event will be triggered before the setter is ran.
 @property {String} [attribute=propName]
 The name of the attribute corresponding to this property. If not provided, the property name itself will be used.
 If <code>null</code> is provided, the property will not be set by a corresponding attribute.
 @property {Boolean} [reflectAttribute=false]
 Whether this property should be reflected as an attribute when changed. This is useful when you want to style CSS
 according to the property's existence or value.
 @property {Function} [sync=null]
 The method to be called when this property's value should be synced to the DOM.
 @property {String|Array.<String>} [alsoSync=null]
 A property or list of properties that should be synced after this property is synced.
 @property {Function} [set={@link Coral~defaultSet}]
 The setter for this property.
 @property {Function} [get={@link Coral~defaultGet}]
 The getter for this property.
 @property {Boolean} [override=false]
 Whether this property descriptor should completely override. If <code>false</code>, this descriptor will augment
 the existing descriptor. See {@link Coral.register.augmentProperties} for details.
 @property {Boolean} [contentZone=false]
 Whether this property represents a content zone. Content zones are treated differently when set() is invoked such
 that the provided value is passed to the content zone's set() method.
 */
  
  
  // These properties won't be treated as methods
var specialProperties = {
    extend: true,
    properties: true,
    events: true,
    _elements: true,
    name: true,
    namespace: true,
    tagName: true,
    baseTagName: true,
    className: true
  };

function noop() {
}
function passThrough(value) {
  return value;
}

/**
 Creates an array with validation functions for the given properties. If no validate is specified, then the default
 validator is used.
 @ignore
 */
function makeValidate(descriptor) {
  if (!descriptor.validate) {
    return [validate.valueMustChange];
  }
  
  if (Array.isArray(descriptor.validate)) {
    return descriptor.validate;
  }
  
  return [descriptor.validate];
}

/**
 Make a attribute reflect function for the given property. If the property is not reflected, return a noop.
 @ignore
 */
function makeReflect(propName, descriptor) {
  if (!descriptor.reflectAttribute) {
    return noop;
  }
  
  var attrName = descriptor.attribute || propName;
  
  return function doReflect(value, silent) {
    // Reflect the property
    if (value === false || value === null) {
      // Non-truthy attributes should be destroyed
      this.removeAttribute(attrName);
    }
    else {
      // Boolean true for a value just means the property should exist
      if (value === true) {
        value = '';
      }
      
      // Only perform the set if the attribute is of a different value
      // This avoids triggering mutation observers unnecessarily
      if (this.getAttribute(attrName) !== value) {
        this.setAttribute(attrName, value);
      }
    }
  };
}

/**
 Make an event trigger function for the given property. If no event should be triggered, return a noop.
 @ignore
 */
function makeTrigger(trigger) {
  if (!trigger) {
    return noop;
  }
  
  if (typeof trigger === 'function') {
    return trigger;
  }
  
  var eventName = trigger;
  
  return function doTrigger(newValue, oldValue) {
    // Trigger an event that has the new and old values under detail
    return this.trigger(eventName, {
      oldValue: oldValue,
      value: newValue
    });
  };
}

/**
 Make a queue sync function for the given property. If nothing needs to be synced, return a noop.
 @ignore
 */
function makeQueueSync(propName, descriptor) {
  var propList = descriptor.alsoSync;
  var sync = descriptor.sync;
  
  if (!sync && !propList) {
    return noop;
  }
  
  if (propList) {
    // Other properties in addition to ours
    if (Array.isArray(propList)) {
      propList.unshift(propName);
    }
    else {
      propList = [propName, propList];
    }
    return function doMultiSync(value) {
      // Sync the list of properties
      this._queueSync.apply(this, propList);
    };
  }
  
  return function doSync(value) {
    // Sync the property
    this._queueSync(propName);
  };
}

/**
 Create and store the methods back to the property descriptor, then store the descriptor on the prototype.
 This enables overriding descriptor parts.
 
 @ignore
 */
function storeDescriptor(proto, propName, descriptor) {
  // triggerBefore can be function, boolean, or string
  var triggerBeforeValue;
  if (typeof descriptor.triggerBefore === 'function' || typeof descriptor.triggerBefore === 'string') {
    // Directly use string or function, makeTrigger will do the rest
    triggerBeforeValue = descriptor.triggerBefore;
  }
  else if (descriptor.triggerBefore === true) {
    // Automatically set name based on descriptor.trigger
    if (typeof descriptor.trigger === 'string' && descriptor.trigger.indexOf(':') !== -1) {
      triggerBeforeValue = descriptor.trigger.replace(':', ':before');
    }
    else {
      throw new Error('Coral.register: Cannot automatically set "before" event name unless descriptor.trigger ' +
        'is a string that conatins a colon');
    }
  }
  
  // Use provided setter, or make a setter that sets a "private" underscore-prefixed variable
  descriptor.set = descriptor.set || makeBasicSetter(propName);
  
  // Use provided getter, or make a getter that returns a "private" underscore-prefixed variable
  descriptor.get = descriptor.get || makeBasicGetter(propName);
  
  // Store methods
  var inheritedMethods = descriptor._methods;
  descriptor._methods = {};
  
  // store references to inherited methods in descriptor._methods
  if (inheritedMethods) {
    for (var methodName in inheritedMethods) {
      descriptor._methods[methodName] = inheritedMethods[methodName];
    }
  }
  
  descriptor._methods.triggerBefore = makeTrigger(triggerBeforeValue);
  descriptor._methods.trigger = makeTrigger(descriptor.trigger);
  descriptor._methods.transform = descriptor.transform || passThrough;
  descriptor._methods.attributeTransform = descriptor.attributeTransform || passThrough;
  descriptor._methods.reflectAttribute = makeReflect(propName, descriptor);
  descriptor._methods.queueSync = makeQueueSync(propName, descriptor);
  
  // We need to store the list of validators back on the descriptor as we modify this inside of makeValidate
  descriptor._methods.validate = makeValidate(descriptor);
  
  // Store reverse mapping of attribute -> property
  if (descriptor.attribute) {
    proto._attributes[descriptor.attribute] = propName;
  }
  else {
    // Remove the mapping in case it was overridden
    proto._attributes[descriptor.attribute] = null;
  }
  
  // Store the descriptor
  proto._properties[propName] = descriptor;
}

/**
 Create a generic getter.
 
 @param {String} propName
 The property name whose getter should be invoked.
 
 @ignore
 */
function makeGetter(propName) {
  return function getter() {
    // Invoke the original getter
    return this._properties[propName].get.call(this);
  };
}

/**
 Create a genertic setter.
 
 @param {String} propName
 The name of the property.
 
 @alias register.makeSetter
 
 @returns {Function} The setter function.
 */
function makeSetter(propName) {
  return function setter(value, silent) {
    var descriptor = this._properties[propName];
    var methods = descriptor._methods;
    
    // Transform the value, passing the default
    // The default value cannot be cached in the outer closure as that would prevent monkey-patching
    var newValue = methods.transform.call(this, value, this._properties[propName].default);
    
    // Store the old value before the setter is invoked
    var oldValue = this[propName];
    
    // Performs all the validations until one of them fails
    var self = this;
    var failed = methods.validate.some(function(validator) {
      return !validator.call(self, newValue, oldValue);
    });
    
    // If a validation failed then we return
    if (failed) {
      return;
    }
    
    if (!silent) {
      var event = methods.triggerBefore.call(this, newValue, oldValue);
      if (event && event.defaultPrevented) {
        // Allow calls to preventDefault() to stop events
        return;
      }
    }
    
    // Invoke the original setter
    descriptor.set.call(this, newValue, silent);
    
    // Reflect the attribute
    methods.reflectAttribute.call(this, newValue);
    
    // Queue property sync. Do this before trigger, in case an event listener wants to unroll the sync queue
    methods.queueSync.call(this);
    
    // Trigger an event
    if (!silent) {
      methods.trigger.call(this, newValue, oldValue);
    }
    
    // Store that this prop has been set
    // This is used during initialization when deciding whether to apply default values
    this._setProps[propName] = true;
  };
}

function makeBasicGetter(propName) {
  var tempVarName = '_' + propName;
  
  /**
   Gets the corresponding underscore prefixed "private" property by the same name.
   
   @function Coral~defaultGet
   @returns The prefixed property
   */
  return function getter() {
    return this[tempVarName];
  };
}

function makeBasicSetter(propName) {
  var tempVarName = '_' + propName;
  
  /**
   Sets the corresponding underscore prefixed "private" property by the same name.
   
   @param {*} value  The value to set
   @function Coral~defaultSet
   */
  return function setter(value) {
    this[tempVarName] = value;
  };
}

/**
 Define a set of {@link Coral~PropertyDescriptors} on the passed object
 
 @param {Object} proto
 The object to define properties on, usually a prototype.
 @param {Object.<String, Coral~PropertyDescriptor>} properties
 A map of property names to their corresponding descriptors.
 
 @alias register.defineProperties
 */
function defineProperties(proto, properties) {
  // Loop over properties and define them on the prototype
  for (var propName in properties) {
    if (!properties[propName]) {
      // Skip properties that were removed to avoid redefinition
      continue;
    }
    defineProperty(proto, propName, properties[propName]);
  }
}

/**
 Define a single {@link Coral~PropertyDescriptors} on the passed object
 
 @param {Object} proto
 The object to define properties on, usually a prototype.
 @param {String} propName
 The name of the property.
 @param {Coral~PropertyDescriptor} descriptor
 A property descriptor
 
 @alias register.defineProperty
 */
function defineProperty(proto, propName, descriptor) {
  // Handle mixin case
  if (typeof descriptor === 'function') {
    // Let descriptor apply itself to the prototype
    // This allows it to add methods
    // Use its return value as the actual descriptor
    descriptor = descriptor(proto, propName);
    
    // If nothing is returned, we're done with this property
    if (!descriptor) {
      throw new Error('Coral.register.defineProperty: Property function did not return a descriptor for ' + propName);
    }
  }
  
  // Store the associated methods
  storeDescriptor(proto, propName, descriptor);
  
  // Create the generic setters and getters for this property
  // Store them back so we can access them for silent sets
  // These do not need to be overridden as they delegate to this._properties._methods
  var actualSetter = descriptor._methods.set = makeSetter(propName);
  var actualGetter = descriptor._methods.get = makeGetter(propName);
  
  // Define the property
  Object.defineProperty(proto, propName, {
    // All properties are enumerable
    enumerable: true,
    // No properties are configurable
    configurable: false,
    set: actualSetter,
    get: actualGetter
  });
}

var tagPrototypes = {};
/**
 Memoized getProtoTypeOf for HTML tags
 @ignore
 */
function getPrototypeOfTag(tagName) {
  tagPrototypes[tagName] = tagPrototypes[tagName] || Object.getPrototypeOf(document.createElement(tagName));
  return tagPrototypes[tagName];
}

/**
 Register a Coral component, setting up inheritance, mixins, properties, and the associated custom element.
 
 @memberof Coral
 @static
 
 @param {Object} options
 Component options.
 @param {Object} options.namespace
 Namespace where to store the constructor.
 @param {String} options.name
 Name of the constructor (i.e. 'Accordion.Item'). The constructor will be available under 'Coral' at the path
 specified by the name.
 @param {String} options.tagName
 Name of the new element (i.e 'coral-component').
 @param {String} [options.baseTagName = (none)]
 Name of the tag to extend (i.e. 'button'). This is only required when extending an existing HTML element such that
 the <code>&lt;button is="custom-element"&gt;</code> style will be used.
 @param {Object} [options.extend = Coral.Component]
 Base class of the component. When extending an existing HTML element, this should match the interface implemented
 by the tag -- that is, for <code>baseTagName: 'button'</code> you should pass
 <code>extend: HTMLButtonElement</code>.
 @param {Array.<Object|Coral~mixin>} [options.mixins]
 Mixin or {Array} of mixins to add. Mixins can be an {Object} or a {Coral~mixin}.
 @param {Object.<String, Coral~PropertyDescriptor>} [options.properties]
 A map of property names to their corresponding descriptors.
 @param {Object} [options.events]
 Map of the events and their handler.
 @param {Object} [options._elements]
 Map of elements and their locations used for caching.
 */
const register = function(options) {
  // Throw away options.extend if baseTagName provided and the prototype isn't part of Coral.Component
  if (options.extend && !options.extend.prototype._methods) {
    options.extend = Component;
  }
  
  // Extend Coral.Component if nothing is provided
  var extend = options.extend || Component;
  
  // We'll use the prototype of the argument passed constructor we're extending
  var baseComponentProto = extend.prototype;
  var actualPrototype = baseComponentProto;
  
  // Use passed or be an empty object so mixins can add properties to components that don't define any
  // Don't modify the passed properties object directly
  var properties = options.properties ? commons.extend({}, options.properties) : {};
  
  if (options.baseTagName) {
    // If we're extending a base tag, we need to use its prototype, not the Component's
    actualPrototype = getPrototypeOfTag(options.baseTagName);
  }
  
  // Setup the prototype chain
  var proto = Object.create(
    actualPrototype
  );
  
  // Store a reference to the next component's prototype in the chain
  // This allows us to crawl up the component prototype chain later
  proto._proto = baseComponentProto;
  
  if (options.baseTagName) {
    var protoChain = [];
    
    // Build the prototype chain
    var curBaseProto = baseComponentProto;
    while (curBaseProto && curBaseProto._methods) {
      protoChain.unshift(curBaseProto);
      curBaseProto = curBaseProto._proto;
    }
    
    // Iterate over the prototype chain and mix all the methods in
    while (curBaseProto = protoChain.shift()) {
      for (var methodName in curBaseProto._methods) {
        proto[methodName] = curBaseProto[methodName];
      }
    }
    
    // Note that we'll already get a flattened list of properties from _properties
    // So we don't have to do something similar there
  }
  
  // Create attribute -> property mappings and the property descriptor map
  // Do this before we mixin/override properties as storeDescriptor() will write back to _attributes and _properties
  proto._attributes = commons.extend({}, baseComponentProto._attributes);
  proto._properties = {};
  
  // Define and inherit events from parent class
  proto._events = commons.extend({}, baseComponentProto._events, options.events);
  
  // Define and inherit sub-elements from parent class
  proto._elements = commons.extend({}, baseComponentProto._elements, options._elements);
  
  // Store the name and namespace on the prototype
  // the toString method of Coral.Component uses this
  proto._componentName = options.name;
  proto._namespace = options.namespace || window.Coral;
  
  // CSS className
  proto._className = options.className;
  
  // Add methods to the prototype, and store them in an object for easy access
  // We'll use this object when extending base tagnames later
  var _methods = proto._methods = {};
  for (var method in options) {
    if (!specialProperties[method]) {
      proto[method] = _methods[method] = options[method];
    }
  }
  
  // Add mixins to the prototype
  // Do this before combining properties to allow seemless modification of properties overridden by mixins
  if (options.mixins) {
    commons.mixin(
      proto,
      // A single Object, Function, or Array thereof
      options.mixins,
      {
        // Pass properties so functional mixins can augment them
        properties: properties
      }
    );
  }
  
  // Store and override property descriptors
  commons.augment(proto._properties, baseComponentProto._properties, properties, function(existingDesc, newDesc, propName) {
    // Drop properties that are not defined
    if (!newDesc) {
      return null;
    }
    
    // The child component (newDesc) determines whether to ignore the base component's descriptor
    if (newDesc.override === true) {
      // The new component wants to ignore the base component's descriptor
      return newDesc;
    }
    
    // Combine and override as necessary
    // The order of arguments seems backwards because we use this method in Coral.register.augmentProperties
    // This makes it so the existing setter is called first
    // It also makes it so the new descriptor will override other properties
    var combinedDesc = commons.augment(
      // Don't modify the existing descriptor
      {},
      newDesc,
      existingDesc,
      handleAugmentPropertyCollision
    );
    
    // Store the new methods and descriptor
    storeDescriptor(proto, propName, combinedDesc);
    
    // The property is already defined, so tell defineProperties not to define it again
    properties[propName] = undefined;
    
    // storeDescriptor() already stored the descriptor, but we have to return it anyway
    return combinedDesc;
  });
  
  // Removed properties that have been removed by inheriting components
  for (var propName in proto._properties) {
    if (!proto._properties[propName]) {
      delete proto._properties[propName];
    }
  }
  
  // Define properties last
  // This allows mixins to merge and modify properties
  if (options.baseTagName) {
    // Define ALL properties as we don't pick up any from the prototype
    defineProperties(proto, proto._properties);
  }
  else {
    // Define just the new properties
    defineProperties(proto, properties);
  }
  
  // The options to be passed to registerElement
  var registrationOptions = {
    prototype: proto
  };
  
  if (options.baseTagName) {
    // When a base tag is provided, we need to tell registerElement
    registrationOptions.extends = options.baseTagName;
  }
  
  // Register the element
  // This returns a constructor
  var Constructor = document.registerElement(options.tagName, registrationOptions);
  
  // Assign the constructor at the correct location
  commons.setSubProperty(options.namespace || window.Coral || window, options.name, Constructor);
  
  return Constructor;
};

// Expose globally
register.defineProperties = defineProperties;
register.defineProperty = defineProperty;

/**
 Augment a set of property descriptors with another set.
 The <code>dest</code> property descriptors map is modified in place.
 The individual property descriptors (values of <code>dest</code>) are not modified.
 
 @param {Object<String,Coral~PropertyDescriptor>} dest
 The set of property descriptors to agument.
 @param {Object<String,Coral~PropertyDescriptor>} source
 The set of property descriptors to use.
 @param {Coral.commons~handleCollision} [handleCollision]
 Called if the descriptor property being copied is already present on the destination.
 The return value will be used as the property value.
 By default, if <code>sync</code> or <code>set</code> collides, both provided methods will be called.
 By default, if any other descriptor property collides, the destination's value will be used.
 */
register.augmentProperties = function(dest, source, handleCollision) {
  commons.augment(dest, source, function(existingDesc, newDesc, propName) {
    // The mixin target (dest) determines whether to ignore the mixin's properties
    if (existingDesc.override === true) {
      // The mixin target (dest) wants to ignore the mixin's descriptor
      return existingDesc;
    }
    
    // Deep-augment individual property descriptor properties
    var combinedDesc = commons.augment(
      // Don't modify the existing descriptor
      {},
      existingDesc,
      newDesc,
      handleCollision || handleAugmentPropertyCollision
    );
    
    return combinedDesc;
  });
};

/**
 Default collision handler when augmenting properties
 @ignore
 */
function handleAugmentPropertyCollision(destValue, sourceValue, descPropName) {
  switch (descPropName) {
    case 'sync':
    case 'set':
      // Use both methods
      return callBoth(sourceValue, destValue);
    default:
      // Use component's value
      return destValue;
  }
}

/**
 Return a function that calls both functions and ignores their return values
 @ignore
 */
function callBoth(first, second) {
  return function() {
    first.apply(this, arguments);
    second.apply(this, arguments);
  };
}

export default register;
