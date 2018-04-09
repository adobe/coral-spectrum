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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {Collection} from '../../../coralui-collection';
import '../../../coralui-component-search';
import {AnchorList} from '../../../coralui-component-list';
import '../../../coralui-component-wait';
import {commons, i18n} from '../../../coralui-util';
import help from '../templates/help';
import helpResult from '../templates/helpResult';
import helpSearchError from '../templates/helpSearchError';
import noHelpResults from '../templates/noHelpResults';

const CLASSNAMES = ['_coral-BasicList', '_coral-AnchorList', '_coral-Shell-help'];

/**
 @class Coral.Shell.Help
 @classdesc A Shell Help component
 @htmltag coral-shell-help
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ShellHelp extends ComponentMixin(HTMLElement) {
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
    Array.prototype.forEach.call(this.querySelectorAll(`#${this.id} > a[is="coral-shell-help-item"]`), (item) => {
      this._elements.items.appendChild(item);
    }, this);
  }
  
  /** @private */
  _performSearch(event) {
    event.stopPropagation();
    
    // Show loading
    this._elements.items.hidden = true;
    this._elements.loading.hidden = false;
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
    this._elements.loading.hidden = true;
    
    // Hide no-results
    this._elements.resultMessage.hidden = true;
    
    // Show items
    this._elements.items.hidden = false;
  }
  
  /**
   Indicate to the user that an error has occurred
   */
  showError() {
    // Hide loading
    this._elements.loading.hidden = true;
    
    this._elements.resultMessage.innerHTML = '';
    
    this._elements.resultMessage.appendChild(helpSearchError.call(this._elements, {i18n: i18n}));
    
    this._elements.resultMessage.hidden = false;
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
    this._elements.loading.hidden = true;
    
    if (!results || total === 0) {
      // Clear existing result message
      this._elements.resultMessage.innerHTML = '';
      // Indicate to the user that no results were found
      this._elements.resultMessage.appendChild(noHelpResults.call(this._elements, {i18n: i18n}));
      // Show result message
      this._elements.resultMessage.hidden = false;
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
      }, this);
      
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
  static get observedAttributes() { return ['placeholder']; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(...CLASSNAMES);
  
    // Move the items into the right place
    this._moveItems();
    
    const contentWrapper = this.querySelector('[handle="contentWrapper"]');
  
    // Support cloneNode
    if (contentWrapper) {
      this._elements.contentWrapper = contentWrapper;
  
      ['search', 'result', 'items', 'results', 'resultMessage', 'loading'].forEach((handle) => {
        this._elements[handle] = this.querySelector(`[handle="${handle}"]`);
      }, this);
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
