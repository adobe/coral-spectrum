import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

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

// Expose component on the Coral namespace
window.customElements.define('coral-card', Card);
window.customElements.define('coral-card-banner', CardBanner);
window.customElements.define('coral-card-banner-header', CardBannerHeader);
window.customElements.define('coral-card-banner-content', CardBannerContent);
window.customElements.define('coral-card-property', CardProperty);
window.customElements.define('coral-card-propertylist', CardPropertyList);
window.customElements.define('coral-card-title', CardTitle);
window.customElements.define('coral-card-subtitle', CardSubtitle);
window.customElements.define('coral-card-context', CardContext);
window.customElements.define('coral-card-description', CardDescription);

Card.Banner = CardBanner;
Card.Banner.Header = CardBannerHeader;
Card.Banner.Content = CardBannerContent;
Card.Property = CardProperty;
Card.Property.Content = CardPropertyContent;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Context = CardContext;
Card.Description = CardDescription;
Card.Asset = CardAsset;
Card.Overlay = CardOverlay;
Card.Info = CardInfo;
Card.Content = CardContent;
Card.PropertyList = CardPropertyList;

export {Card};
