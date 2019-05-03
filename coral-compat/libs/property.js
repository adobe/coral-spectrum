/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {commons} from '../../coral-utils';

/**
 Property descriptor factory factories
 @namespace
 */
const property = {};

/**
 A factory that creates descriptor factories that proxy a local property/attribute to a sub-property.
 This factory should be used when you need the property of an sub-object to be set or queued for sync when a local
 property changes.
 This is especially useful for setting the innerHTML or other properties of sub-elements.
 
 @param {Coral~PropertyDescriptor} descriptor
 The property descriptor
 @param {String} path
 The path under <code>this</code> to proxy to. For instance, <code>_elements.header.innerHTML</code> would proxy
 to the <code>innerHTML</code> of the element with the handle <code>header</code>
 @param {Boolean} [needsDOMSync=false]
 Whether the property set should happen asynchronously on the next animation frame.
 
 @returns {Function} The descriptor factory.
 */
property.proxy = function(descriptor) {
  // Store the path
  var path = descriptor.path;
  
  function setProxy(value, silent) {
    /* jshint validthis: true */
    commons.setSubProperty(this, path, value);
  }
  
  function getProxy() {
    /* jshint validthis: true */
    return commons.getSubProperty(this, path);
  }
  
  var functionalDescriptor = function(proto, propName) {
    var tempPropName = '_' + propName;
    
    if (descriptor.needsDOMSync) {
      // If a sync needs to happen, define a method
      descriptor.sync = function() {
        commons.setSubProperty(this, path, this[tempPropName]);
        
        // Use undefined here, not null
        this[tempPropName] = undefined;
      };
      
      descriptor.set = function(value, silent) {
        this[tempPropName] = value;
      };
      
      descriptor.get = function() {
        // Return the temporary variable if it's set, otherwise get the property we're proxying
        return typeof this[tempPropName] === 'undefined' ?
          commons.getSubProperty(this, path) : this[tempPropName];
      };
    }
    else {
      // If we don't need to sync, simply delegate to the property
      // @todo test if it's faster to compose a function with new Function()
      descriptor.set = setProxy;
      descriptor.get = getProxy;
      descriptor.sync = null;
    }
    
    return descriptor;
  };
  
  // Override by default
  // Store this on the function so Coral.register can check it
  functionalDescriptor.override = typeof descriptor.override !== 'undefined' ? descriptor.override : true;
  
  // Return a function that sets up the property
  return functionalDescriptor;
};

/**
 A factory that creates descriptor factories that proxy a local property/attribute to a sub-element's attribute.
 
 This is useful when you want to proxy a property/attrubute to a sub-element as an attribute set/removal.
 For instance, you may want to proxy the <code>aria-labelledby</code> property of a field component to the actual
 input inside of the component for accessibility purposes.
 
 When using this property factory, be sure to specify a property name not implemented by the browser already.
 
 @param {Coral~PropertyDescriptor} descriptor
 The property descriptor.
 @param {String} descriptor.attribute
 The attribute to proxy.
 @param {String} descriptor.handle
 The handle of the element to proxy the attribute to.
 */
property.proxyAttr = function(descriptor) {
  var attribute = descriptor.attribute;
  var handle = descriptor.handle;
  
  var functionalDescriptor = function(proto, propName) {
    return commons.extend({
      attribute: attribute,
      set: function(value) {
        // Both false and null should remove the attribute
        // This supports the behavior of Coral.transform.boolean as well as non-transformed attributes
        // Any other value, including empty string, should set it
        this._elements[handle][value === false || value === null ? 'removeAttribute' : 'setAttribute'](attribute, value);
      },
      get: function() {
        return this._elements[handle].getAttribute(attribute);
      }
    }, descriptor);
  };
  
  // Override by default
  // Store this on the function so Coral.register can check it
  functionalDescriptor.override = typeof descriptor.override !== 'undefined' ? descriptor.override : true;
  
  return functionalDescriptor;
};

/**
 A factory that creates descriptor factories for content zones.
 
 @param {Coral~PropertyDescriptor} descriptor
 The property descriptor.
 @param {String} descriptor.handle
 The handle of the element to proxy the attribute to.
 @param {String} [descriptor.tagName]
 The tag name to expect. If not provided, any tag will be accepted.
 @param {Function} [descriptor.set]
 Executed after the property is set.
 @param {Function} [descriptor.get]
 An alternate getter. If not provided, the element specified by the handle will be returned.
 @param {Function} [descriptor.insert]
 The method that inserts the content zone into the element.
 @param {Boolean} defaultContentZone
 Set to true if this is the default content zone that {@link Coral.Component#render} moves orphaned elements into.
 */
property.contentZone = function(descriptor) {
  var handle = descriptor.handle;
  var expectedTagName = descriptor.tagName;
  var additionalSetter = descriptor.set;
  var alternateGetter = descriptor.get;
  var insert = descriptor.insert;
  
  var functionalDescriptor = function(proto, propName) {
    if (descriptor.defaultContentZone) {
      // Alias the setter/getter to the content zone's property
      Object.defineProperty(proto, 'defaultContentZone', {
        set: function(value) {
          this[propName] = value;
        },
        get: function() {
          return this[propName];
        }
      });
    }
    
    // Combine the provided descriptor with the factory's properties
    // Give precidence to the factory's properties
    return commons.extend({}, descriptor, {
      contentZone: true,
      set: function(value) {
        var oldNode;
        
        if (!!value) {
          if (!(value instanceof HTMLElement)) {
            throw new Error('DOMException: Failed to set the "' + propName + '" property on "' + this.toString() +
              '": The provided value is not of type "HTMLElement".');
          }
          
          if (expectedTagName && value.tagName.toLowerCase() !== expectedTagName) {
            throw new Error('DOMException: Failed to set the "' + propName + '" property on "' + this.toString() +
              '": The new ' + propName + ' element is of type "' + value.tagName + '". It must be a "' +
              expectedTagName.toUpperCase() + '" element.');
          }
          
          oldNode = this._elements[handle];
          
          // Replace the existing element
          if (insert) {
            // Remove old node
            if (oldNode && oldNode.parentNode) {
              oldNode.parentNode.removeChild(oldNode);
            }
            // Insert new node
            insert.call(this, value);
          }
          else {
            if (oldNode && oldNode.parentNode) {
              commons._log('warn', this._componentName + ' does not define an insert method for content zone ' + handle + ', falling back to replace.');
              // Old way -- assume we have an old node
              this._elements[handle].parentNode.replaceChild(value, this._elements[handle]);
            }
            else {
              commons._log('error', this._componentName + ' does not define an insert method for content zone ' + handle + ', falling back to append.');
              // Just append, which may introduce bugs, but at least doesn't crazy
              this.appendChild(value);
            }
          }
        }
        else {
          // we need to remove the content zone if it exists
          oldNode = this._elements[handle];
          if (oldNode && oldNode.parentNode) {
            oldNode.parentNode.removeChild(oldNode);
          }
        }
        
        // Re-assign the handle to the new element
        this._elements[handle] = value;
        
        // Invoke the setter
        if (typeof additionalSetter === 'function') {
          additionalSetter.call(this, value);
        }
      },
      get: alternateGetter || function() {
        return this._elements[handle];
      }
    });
  };
  
  return functionalDescriptor;
};

export default property;
