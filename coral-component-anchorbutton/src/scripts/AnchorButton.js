import {ComponentMixin} from '../../../coral-mixin-component';
import {ButtonMixin} from '../../../coral-mixin-button';
import {transform, commons} from '../../../coral-utils';

// Key code
const SPACE = 32;

/**
 @class Coral.AnchorButton
 @classdesc A Link component rendering as a button allowing us to style an anchor element that both looks and behaves
 like a button rather than a link. It can receive keyboard focus regardless of whether or not it has an <code>href</code>
 attribute, can be activated using either the <code>SPACE</code> key or the <code>ENTER</code> key, and is identified to
 assistive technology as a button element.
 @htmltag coral-anchorbutton
 @htmlbasetag a
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 @extends {ButtonMixin}
 */
class AnchorButton extends ButtonMixin(ComponentMixin(HTMLAnchorElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(commons.extend(this._events, {
      keydown: '_onKeyDown',
      keyup: '_onKeyUp'
    }));
    
    // cannot use the events hash because events on disabled items are not reported
    this.addEventListener('click', this._onDisabledClick.bind(this));
  }
  
  /**
   Disables the button from user interaction.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this._disabled);
    this.setAttribute('tabindex', this._disabled ? '-1' : '0');
    this.setAttribute('aria-disabled', this._disabled);
  }
  
  /**
   Keyboard handling per the WAI-ARIA button widget design pattern:
   https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role
 
   @ignore
   */
  _onKeyDown(event) {
    if (event.keyCode === SPACE) {
      event.preventDefault();
      this.click();
      this.classList.add('is-selected');
    }
  }
  
  /** @ignore */
  _onKeyUp(event) {
    if (event.keyCode === SPACE) {
      event.preventDefault();
      this.classList.remove('is-selected');
    }
  }
  
  /** @ignore */
  _onDisabledClick(event) {
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  // Override content zone name
  get _contentZones() { return {'coral-anchorbutton-label': 'label'}; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['disabled']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    // a11y
    this.setAttribute('role', 'button');
    if (!this.disabled) {
      // Force tabindex and aria-disabled attribute reflection
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    }
  }
}

export default AnchorButton;
