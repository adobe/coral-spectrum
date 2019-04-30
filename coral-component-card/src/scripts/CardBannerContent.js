const CLASSNAME = '_coral-Banner-content';

/**
 @class Coral.Card.Banner.Content
 @classdesc A Card Banner Content component
 @htmltag coral-card-banner-content
 @extends {HTMLElement}
 */
class CardBannerContent extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default CardBannerContent;
