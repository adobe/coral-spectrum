/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import Component from 'coralui-mixin-component';
import user from '../templates/user';

const CLASSNAME = 'coral3-Shell-user';

/**
 Avatar assets should use one of those provided, when no asset is set
 
 @enum {String}
 @memberof Coral.Shell.User#
 */
const avatar = {
  /** Default avatar, show user icon from icon font. */
  DEFAULT: 'user'
};

/**
 @class Coral.Shell.User
 @classdesc A Shell User component
 @htmltag coral-shell-user
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class ShellUser extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      name: this.querySelector('coral-shell-user-name') || document.createElement('coral-shell-user-name'),
      heading: this.querySelector('coral-shell-user-heading') || document.createElement('coral-shell-user-heading'),
      subheading: this.querySelector('coral-shell-user-subheading') || document.createElement('coral-shell-user-subheading'),
      content: this.querySelector('coral-shell-user-content') || document.createElement('coral-shell-user-content'),
      footer: this.querySelector('coral-shell-user-footer') || document.createElement('coral-shell-user-footer')
    };
    
    user.call(this._elements);
  }
  
  /**
   Specifies the asset used inside the avatar view.
   See {@link Coral.Icon} for valid usage and icon names.
   
   @type {String}
   @default user (Shows a placeholder user icon from the icon font)
   @memberof Coral.Shell.User#
   @htmlattribute avatar
   
   @see {@link Coral.Icon}
   */
  get avatar() {
    return this._elements.avatar.icon;
  }
  set avatar(value) {
    this._elements.avatar.icon = value;
  }
  
  /**
   The name content zone of the user-menu.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.User#
   */
  get name() {
    return this._getContentZone(this._elements.name);
  }
  set name(value) {
    this._setContentZone('content', value, {
      handle: 'name',
      tagName: 'coral-shell-user-name',
      insert: function(content) {
        this._elements.container.appendChild(content);
      }
    });
  }
  
  /**
   The heading content zone of the user-menu.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.User#
   */
  get heading() {
    return this._getContentZone(this._elements.heading);
  }
  set heading(value) {
    this._setContentZone('heading', value, {
      handle: 'heading',
      tagName: 'coral-shell-user-heading',
      insert: function(content) {
        this._elements.container.appendChild(content);
      }
    });
  }
  
  /**
   The subheading content zone of the user-menu.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.User#
   */
  get subheading() {
    return this._getContentZone(this._elements.subheading);
  }
  set subheading(value) {
    this._setContentZone('subheading', value, {
      handle: 'subheading',
      tagName: 'coral-shell-user-subheading',
      insert: function(content) {
        this._elements.container.appendChild(content);
      }
    });
  }
  
  /**
   The main content zone of the user-menu.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.User#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-shell-user-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   The footer content zone of the user-menu.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.User#
   */
  get footer() {
    return this._getContentZone(this._elements.content);
  }
  set footer(value) {
    this._setContentZone('footer', value, {
      handle: 'footer',
      tagName: 'coral-shell-user-footer',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {
    return {
      'coral-shell-user-name': 'name',
      'coral-shell-user-heading': 'heading',
      'coral-shell-user-subheading': 'subheading',
      'coral-shell-user-content': 'content',
      'coral-shell-user-footer': 'footer'
    };
  }
  
  static get observedAttributes() {return ['avatar'];}
  
  // Expose enums
  static get avatar() {return avatar;}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const frag = document.createDocumentFragment();
  
    // Render template
    frag.appendChild(this._elements.container);
  
    for (const contentZone in this._contentZones) {
      const element = this._elements[this._contentZones[contentZone]];
      // Remove it so we can process children
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        (child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'container')) {
        // Add non-template elements to the content
        this._elements.content.appendChild(child);
      }
      else {
        // Remove anything else element
        this.removeChild(child);
      }
    }
    
    this.appendChild(frag);
  
    // Assign the content zones so the insert functions will be called
    for (const contentZone in this._contentZones) {
      const contentZoneName = this._contentZones[contentZone];
      const element = this._elements[this._contentZones[contentZone]];
    
      this[contentZoneName] = element;
    }
  }
}

export default ShellUser;
