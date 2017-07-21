import 'coralui-externals';
import Card from './src/scripts/Card';
import CardProperty from './src/scripts/CardProperty';
import CardTitle from './src/scripts/CardTitle';
import CardContext from './src/scripts/CardContext';
import CardDescription from './src/scripts/CardDescription';

window.customElements.define('coral-card', Card);
window.customElements.define('coral-card-property', CardProperty);
window.customElements.define('coral-card-title', CardTitle);
window.customElements.define('coral-card-context', CardContext);
window.customElements.define('coral-card-description', CardDescription);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Card = Card;
window.Coral.Card.Property = CardProperty;
window.Coral.Card.Title = CardTitle;
window.Coral.Card.Context = CardContext;
window.Coral.Card.Description = CardDescription;
window.Coral.Card.Asset = function() {
  return document.createElement('coral-card-asset');
};
window.Coral.Card.Overlay = function() {
  return document.createElement('coral-card-overlay');
};
window.Coral.Card.Info = function() {
  return document.createElement('coral-card-info');
};
window.Coral.Card.Content = function() {
  return document.createElement('coral-card-content');
};
window.Coral.Card.PropertyList = function() {
  return document.createElement('coral-card-propertylist');
};
window.Coral.Card.Property.Content = function() {
  return document.createElement('coral-card-property-content');
};

export {Card, CardProperty, CardTitle, CardContext, CardDescription};
