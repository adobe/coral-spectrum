import {ComponentMixin} from '../../../coral-mixin-component';
import {DragAction} from '../../../coral-dragaction';
import '../../../coral-component-checkbox';
import quickactions from '../templates/quickactions';
import {transform, commons} from '../../../coral-utils';

const CLASSNAME = '_coral-Masonry-item';

/**
 @class Coral.Masonry.Item
 @classdesc A Masonry Item component
 @htmltag coral-masonry-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class MasonryItem extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
  
    // Represents ownership (necessary when the item is moved which triggers callbacks)
    this._masonry = null;
    
    // Default value
    this._dragAction = null;
    
    // Template
    this._elements = {};
    quickactions.call(this._elements);
  }
  
  /**
   Item content element.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }
  
  /**
   Whether the item is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.setAttribute('aria-selected', this._selected);
    this.classList.toggle('is-selected', this._selected);
    
    this._elements.check[this._selected ? 'setAttribute' : 'removeAttribute']('checked', '');
    
    this.trigger('coral-masonry-item:_selectedchanged');
  }
  
  /**
   Animates the insertion of the item.
   
   @private
   */
  _insert() {
    if (this.classList.contains('is-beforeInserting')) {
      this.classList.remove('is-beforeInserting');
      this.classList.add('is-inserting');
      
      commons.transitionEnd(this, () => {
        this.classList.remove('is-inserting');
      });
    }
  }
  
  /** @private */
  _setTabbable(tabbable) {
    this.setAttribute('tabindex', tabbable ? 0 : -1);
  }
  
  /** @private */
  _updateDragAction(enabled) {
    let handle;
    if (enabled) {
      // Find handle
      if (this.getAttribute('coral-masonry-draghandle') !== null) {
        handle = this;
      }
      else {
        handle = this.querySelector('[coral-masonry-draghandle]');
        if (!handle) {
          // Disable drag&drop if handle wasn't found
          enabled = false;
        }
      }
    }
    
    if (enabled) {
      if (!this._dragAction) {
        this._dragAction = new DragAction(this);
        this._dragAction.dropZone = this.parentNode;
      }
      this._dragAction.handle = handle;
    }
    else if (this._dragAction) {
      this._dragAction.destroy();
      this._dragAction = null;
    }
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['selected', '_removing', '_orderable']); }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_removing') {
      // Do it in the next frame so that the removing animation is visible
      window.requestAnimationFrame(() => {
        this.classList.toggle('is-removing', value !== null);
      });
    }
    else if (name === '_orderable') {
      this._updateDragAction(value !== null);
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // @a11y
    this.setAttribute('tabindex', '-1');
    
    // Support cloneNode
    const template = this.querySelector('._coral-Masonry-item-quickActions');
    if (template) {
      template.remove();
    }
    this.appendChild(this._elements.quickactions);
    // todo workaround to not give user possibility to tab into checkbox
    this._elements.check._labellableElement.tabIndex = -1;
    
    // Inform masonry immediately
    this.trigger('coral-masonry-item:_connected');
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
  
    // Handle it in masonry immediately
    const masonry = this._masonry;
    if (masonry) {
      masonry._onItemDisconnected(this);
    }
  }
}

export default MasonryItem;
