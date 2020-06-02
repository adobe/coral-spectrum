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
import {Collection} from '../../../coral-collection';
import '../../../coral-component-search';
import {AnchorList} from '../../../coral-component-list';
import '../../../coral-component-wait';
import {commons, i18n} from '../../../coral-utils';
import help from '../templates/help';
import helpResult from '../templates/helpResult';
import helpSearchError from '../templates/helpSearchError';
import noHelpResults from '../templates/noHelpResults';

const CLASSNAMES = ['_coral-Menu', '_coral-AnchorList', '_coral-Shell-help'];

/**
 @class Coral.Shell.Help
 @classdesc A Shell Help component
 @htmltag coral-shell-help
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellHelp extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {};
    help.call(this._elements, {commons, i18n});
    
    // Events
    this._delegateEvents({
      'coral-search:clear': '_showItems',
      'coral-search:submit': '_performSearch'
    });
    
    // Item handling
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-shell-help-item',
        itemBaseTagName: 'a',
        container: this._elements.items
      });
    }
  
    return this._items;
  }
  
  /**
   The search field placeholder.
   
   @type {String}
   @default ""
   @htmlattribute placeholder
   */
  get placeholder() {
    return this._elements.search.placeholder;
  }
  set placeholder(value) {
    this._elements.search.placeholder = value;
  }
  
  /** @private */
  _moveItems() {
    this.setAttribute('id', this.id || commons.getUID());
    
    const selector = `#${this.id} > a[is="coral-shell-help-item"], coral-shell-help-separator`;
    Array.prototype.forEach.call(this.querySelectorAll(selector), (item) => {
      this._elements.items.appendChild(item);
    });
  }
  
  /** @private */
  _performSearch(event) {
    event.stopPropagation();
    
    // Show loading
    this._elements.items.hidden = true;
    this._showLoading();
    this._elements.resultMessage.hidden = true;
    this._elements.results.hidden = true;
    
    // Trigger event
    const searchTerm = this._elements.search.value;
    this.trigger('coral-shell-help:search', {
      value: searchTerm
    });
  }
  
  /** @private */
  _showItems(event) {
    event.stopPropagation();
    
    // Hide search results
    this._elements.results.hidden = true;
    
    // Hide loading
    this._hideLoading();
    
    // Hide no-results
    this._elements.resultMessage.hidden = true;
    
    // Show items
    this._elements.items.hidden = false;
  }

  /** @private */
  _clearTimeout(timeoutName) {
    if (this[timeoutName]) {
      window.clearTimeout(this[timeoutName]);
      this[timeoutName] = undefined;
    }
  }

  /** @private */
  _showMessage(elementName, message) {
    var el = this._elements[elementName];
    var timeoutName = '_' + elementName + 'Timeout';

    // Show message element
    el.hidden = false;

    // Add message text after 150ms delay to give screen readers enough
    // time to recognize the live region and respond to the text update 
    this._clearTimeout(timeoutName);
    this[timeoutName] = window.setTimeout(() => el.appendChild(message), 150);
  }

  /** @private */
  _showLoading() {
    if (!this._elements.loading.hidden) {
      return;
    }

    if (this._elements.loading.contains(this._elements.loadingMessage)) {
      this._elements.loadingMessage = this._elements.loading.removeChild(this._elements.loadingMessage);
    }

    this._showMessage('loading', this._elements.loadingMessage);
  }

  /** @private */
  _hideLoading() {
    if (this._elements.loading.hidden) {
      return;
    }

    this._elements.loading.hidden = true;

    // clear the timeout
    this._clearTimeout('_loadingTimeout');
    if (this._elements.loading.contains(this._elements.loadingMessage)) {
      this._elements.loadingMessage = this._elements.loading.removeChild(this._elements.loadingMessage);
    }
  }
  
  /**
   Indicate to the user that an error has occurred
   */
  showError() {
    // Hide loading
    this._hideLoading();
    
    this._elements.resultMessage.innerHTML = '';

    // Show the error message
    this._showMessage('resultMessage', helpSearchError.call(this._elements, {i18n}));
  }
  
  /**
   Show a set of search results.
   
   @param {Array.<ShellHelpResult>} results
   A set of search result objects.
   @param {Number} total
   The total number of results.
   @param {String} allResultsURL
   The URL at which all results will be displayed.
   */
  showResults(results, total, allResultsURL) {
    // Hide loading
    this._hideLoading();

    // clear setTimeout
    if (this._showResultsTimeout) {
      window.clearTimeout(this._showResultsTimeout);
      this._showResultsTimeout = undefined;
    }

    if (!results || total === 0) {
      // Clear existing result message
      this._elements.resultMessage.innerHTML = '';
      // Indicate to the user that no results were found
      this._showMessage('resultMessage', noHelpResults.call(this._elements, {i18n}));
    }
    else {
      // Clear existing results
      this._elements.results.innerHTML = '';
      // Populate results
      results.forEach((result) => {
        // Tweak: make the space between bullets larger with a non-breaking space
        const separator = ' & ';
        const description = result.tags.join(separator);
        
        const item = new AnchorList.Item().set({
          href: result.href,
          target: result.target
        });
        
        item.classList.add('_coral-Shell-help-result-item');
        
        item.content = helpResult.call(this._elements, {
          title: result.title,
          description: description
        }).firstElementChild;
        
        this._elements.results.appendChild(item);
      });
      
      // Show results
      this._elements.results.hidden = false;
      
      // Show total
      if (total > 1) {
        const seeAllItem = new AnchorList.Item().set({
          href: allResultsURL,
          content: {
            innerHTML: i18n.get('See all {0} results', total)
          },
          target: '_blank'
        });
  
        // Look like a link
        seeAllItem.content.classList.add('coral-Link');
        
        this._elements.results.appendChild(seeAllItem);
      }
    }
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['placeholder']); }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(...CLASSNAMES);
  
    // Move the items into the right place
    this._moveItems();
    
    const contentWrapper = this.querySelector('[handle="contentWrapper"]');
  
    // Support cloneNode
    if (contentWrapper) {
      this._elements.contentWrapper = contentWrapper;
  
      ['search', 'result', 'items', 'results', 'resultMessage', 'loading'].forEach((handle) => {
        this._elements[handle] = this.querySelector(`[handle="${handle}"]`);
      });
      this._items._container = this._elements.items;
    }
    else {
      this.appendChild(this._elements.contentWrapper);
    }
  }
  
  /**
   A search result object.
   
   @typedef {Object} ShellHelpResult
   
   @property {String} title
   The title of the search result.
   @property {String} href
   The URL of the search result.
   @property {String} target
   This property specifies where to display the search result. Use this property only if the href property is present.
   @property {Array.<String>} tags
   A set of tags associated with the search result.
   */
  
  /**
   Triggered when the user submits a search term
   
   @event Coral.Shell.Help#coral-shell-help:search
   
   @param {Object} event
   Event object.
   @param {HTMLElement} event.detail.value
   The user-provided input value aka the search-term
   */
}

export default ShellHelp;
