import '/coralui-externals';
import Card from './src/scripts/Card';
import CardBanner from './src/scripts/CardBanner';
import CardBannerHeader from './src/scripts/CardBannerHeader';
import CardBannerContent from './src/scripts/CardBannerContent';
import CardProperty from './src/scripts/CardProperty';
import CardTitle from './src/scripts/CardTitle';
import CardSubtitle from './src/scripts/CardSubtitle';
import CardContext from './src/scripts/CardContext';
import CardDescription from './src/scripts/CardDescription';
import CardAsset from './src/scripts/CardAsset';
import CardOverlay from './src/scripts/CardOverlay';
import CardInfo from './src/scripts/CardInfo';
import CardContent from './src/scripts/CardContent';
import CardPropertyList from './src/scripts/CardPropertyList';
import CardPropertyContent from './src/scripts/CardPropertyContent';

window.customElements.define('coral-card', Card);
window.customElements.define('coral-card-banner', CardBanner);
window.customElements.define('coral-card-banner-header', CardBannerHeader);
window.customElements.define('coral-card-banner-content', CardBannerContent);
window.customElements.define('coral-card-property', CardProperty);
window.customElements.define('coral-card-title', CardTitle);
window.customElements.define('coral-card-subtitle', CardSubtitle);
window.customElements.define('coral-card-context', CardContext);
window.customElements.define('coral-card-description', CardDescription);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Card = Card;
window.Coral.Card.Banner = CardBanner;
window.Coral.Card.Banner.Header = CardBannerHeader;
window.Coral.Card.Banner.Content = CardBannerContent;
window.Coral.Card.Property = CardProperty;
window.Coral.Card.Title = CardTitle;
window.Coral.Card.Subtitle = CardSubtitle;
window.Coral.Card.Context = CardContext;
window.Coral.Card.Description = CardDescription;
window.Coral.Card.Asset = CardAsset;
window.Coral.Card.Overlay = CardOverlay;
window.Coral.Card.Info = CardInfo;
window.Coral.Card.Content = CardContent;
window.Coral.Card.PropertyList = CardPropertyList;
window.Coral.Card.Property.Content = CardPropertyContent;

export {
  Card,
  CardBanner,
  CardBannerHeader,
  CardBannerContent,
  CardProperty,
  CardTitle,
  CardSubtitle,
  CardContext,
  CardDescription,
  CardAsset,
  CardContent,
  CardOverlay,
  CardPropertyContent,
  CardPropertyList,
};
