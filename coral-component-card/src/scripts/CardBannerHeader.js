const CLASSNAME = '_coral-Banner-header';

/**
 @class Coral.Card.Banner.Header
 @classdesc A Card Banner Header component
 @htmltag coral-card-banner-header
 @extends {HTMLElement}
 */
class CardBannerHeader extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default CardBannerHeader;
