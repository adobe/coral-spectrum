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

import {BaseComponent} from '../../../coral-base-component';
import user from '../templates/user';

const CLASSNAME = '_coral-Shell-user';

/**
 Enumeration for {@link ShellUser} avatar options. Avatar assets should use one of those provided, when no asset is set

 @typedef {Object} ShellUserAvatarEnum

 @property {String} DEFAULT
 Default avatar, show user icon from icon font.
 */
const avatar = {
  DEFAULT: 'UserCircleColor_Light'
};

/**
 @class Coral.Shell.User
 @classdesc A Shell User component
 @htmltag coral-shell-user
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellUser extends BaseComponent(HTMLElement) {
  /** @ignore */
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
  }

  connectedCallback() {
    super.connectedCallback();

    user.call(this._elements, {icon: avatar.DEFAULT});
  }

  /**
   Specifies the asset used inside the avatar view.
   See {@link Icon} for valid usage and icon names.

   @type {String}
   @default ShellUserAvatarEnum.DEFAULT
   @htmlattribute avatar
   */
  get avatar() {
    return this._elements.avatar.icon;
  }
  set avatar(value) {
    this._elements.avatar.icon = value;
  }

  /**
   The name content zone of the user-menu.

   @type {ShellUserName}
   @contentzone
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

   @type {ShellUserHeading}
   @contentzone
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

   @type {ShellUserSubheading}
   @contentzone
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

   @type {ShellUserContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-shell-user-content',
      insert: function(content) {
        // Empty content to hide it
        if (content.innerHTML.trim() === '') {
          content.innerHTML = '';
        }

        this.appendChild(content);
      }
    });
  }

  /**
   The footer content zone of the user-menu.

   @type {ShellUserFooter}
   @contentzone
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
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

  get _contentZones() {
    return {
      'coral-shell-user-name': 'name',
      'coral-shell-user-heading': 'heading',
      'coral-shell-user-subheading': 'subheading',
      'coral-shell-user-content': 'content',
      'coral-shell-user-footer': 'footer'
    };
  }

  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['avatar']); }

  /**
   Returns {@link ShellUser} avatar options.

   @return {ShellUserAvatarEnum}
   */
  static get avatar() { return avatar; }

  /** @ignore */
  render() {
    super.render();

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
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'container') {
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

      /** @ignore */
      this[contentZoneName] = element;
    }
  }
}

export default ShellUser;
