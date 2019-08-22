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

import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Card from './src/scripts/Card';
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

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-card', Card);
window.customElements.define('coral-card-content', CardContent);
window.customElements.define('coral-card-property', CardProperty);
window.customElements.define('coral-card-propertylist', CardPropertyList);
window.customElements.define('coral-card-title', CardTitle);
window.customElements.define('coral-card-subtitle', CardSubtitle);
window.customElements.define('coral-card-context', CardContext);
window.customElements.define('coral-card-description', CardDescription);

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
