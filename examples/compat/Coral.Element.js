(function() {
  'use strict';
  
  /**
   Element directions.
   @enum {String}
   @memberof Coral.Element
   */
  var direction = {
    /** A element with a toggle button on the bottom. */
    DOWN: 'down',
    /** A element with a toggle button on top. */
    UP: 'up'
  };
  
  // The element's base classname
  var CLASSNAME = '_coral-Drawer';
  
  // A string of all possible direction classnames
  var ALL_DIRECTION_CLASSES = [];
  for (var directionValue in direction) {
    ALL_DIRECTION_CLASSES.push(CLASSNAME + '--' + direction[directionValue]);
  }
  
  Coral.register( /** @lends Coral.Element# */ {
    
    /**
     @class Coral.Element
     @classdesc A Element component
     @extends Coral.Component
     @htmltag coral-element
     */
    name: 'Element',
    tagName: 'coral-element',
    className: CLASSNAME,
    
    events: {
      'click ._coral-Drawer-toggleButton:not(:disabled)': '_onClick'
    },
    
    properties: {
      /**
       Whether this item is disabled or not. This will stop every user interaction with the item.
       @type {Boolean}
       @default false
       @htmlattribute disabled
       @htmlattributereflected
       @memberof Coral.Element#
       */
      'disabled': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          this.setAttribute('aria-disabled', this.disabled);
          this.classList.toggle('is-disabled', this.disabled);
          this._elements.toggle.disabled = this.disabled;
        }
      },
      
      /**
       The element's content element.
       @type {HTMLElement}
       @htmlttribute content
       @contentzone
       @memberof Coral.Element#
       */
      'content': Coral.property.contentZone({
        handle: 'content',
        tagName: 'coral-element-content',
        defaultContentZone: true,
        insert: function(content) {
          this._elements.contentWrapper.appendChild(content);
        }
      }),
      
      /**
       The element's direction.
       
       @type {Coral.Element.direction}
       @default Coral.Element.direction.DOWN
       @htmlattribute direction
       @memberof Coral.Element#
       */
      'direction': {
        default: direction.DOWN,
        validate: [
          Coral.validate.valueMustChange,
          Coral.validate.enumeration(direction)
        ],
        sync: function() {
          this.classList.remove.apply(this.classList, ALL_DIRECTION_CLASSES);
          this.classList.add(this._className + '--' + this.direction);
          
          this._updateIcon();
        }
      },
      
      /**
       Whether the Element is expanded or not.
       @type {Boolean}
       @default false
       @htmlattribute open
       @htmlattributereflected
       @memberof Coral.Element#
       */
      'open': {
        default: false,
        reflectAttribute: true,
        transform: Coral.transform.boolean,
        attributeTransform: Coral.transform.booleanAttr,
        sync: function() {
          var self = this;
          self.setAttribute('aria-expanded', self.open);
          self._updateIcon();
          
          var slider = self._elements.slider;
          // Don't animate on initialization
          if (self._animate) {
            Coral.commons.transitionEnd(slider, function() {
              // Remove height as we want the element to naturally grow if content is added later
              if (self.open) {
                slider.style.height = '';
              }
              
              // Trigger once transition is finished
              self.trigger('coral-element:' + (self.open ? 'open' : 'close'));
            });
            
            if (!self.open) {
              // Force height to enable transition
              slider.style.height = slider.scrollHeight + 'px';
            }
            
            // Do transition in next frame as browser might batch up the height property change before painting
            Coral.commons.nextFrame(function() {
              slider.style.height = self.open ? slider.scrollHeight + 'px' : 0;
            });
          }
          else {
            // Make sure it's animated next time
            self._animate = true;
            
            // Hide it on initialization if closed
            if (!self.open) {
              slider.style.height = 0;
            }
          }
        }
      }
    },
    
    /** @private */
    _onClick: function() {
      this.open = !this.open;
    },
    
    /** @private */
    _updateIcon: function() {
      if (this.direction === direction.UP) {
        this._elements.toggle.icon = this.open ? 'chevronDown' : 'chevronUp';
      }
      else if (this.direction === direction.DOWN) {
        this._elements.toggle.icon = this.open ? 'chevronUp' : 'chevronDown';
      }
    },
    
    /** @ignore */
    _render: function() {
      // Create a temporary fragment
      var fragment = document.createDocumentFragment();
      
      // Render the template
      fragment.appendChild(Coral.templates.Element.base.call(this._elements));
      
      // Fetch or create the content content zone element
      var content = this.querySelector('coral-element-content') || document.createElement('coral-element-content');
      
      // Add the content zone to the frag
      this.content = content;
      
      // Move any remaining elements into the content sub-component
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
      
      // Add the frag to the component
      this.appendChild(fragment);
    }
    
    /**
     Triggered when the element is opened
     @event Coral.Element#coral-element:open
     @param {Object} event
     Event object
     */
    
    /**
     Triggered when the element is closed
     @event Coral.Element#coral-element:close
     @param {Object} event
     Event object
     */
  });
  
  Coral.register( /** @lends Coral.Element.Content */ {
    /**
     @class Coral.Element.Content
     @classdesc A Element Content component
     @extends Coral.Component
     @htmltag coral-element-content
     */
    name: 'Element.Content',
    tagName: 'coral-element-content'
  });
  
  // exports the direction enumeration
  Coral.Element.direction = direction;
}());
