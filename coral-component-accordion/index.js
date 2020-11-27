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

import Accordion from './src/scripts/Accordion';
import AccordionItem from './src/scripts/AccordionItem';
import AccordionItemLabel from './src/scripts/AccordionItemLabel';
import AccordionItemContent from './src/scripts/AccordionItemContent';

import './src/styles/index.css';

import {commons} from '../coral-utils';

// Expose component on the Coral namespace
commons._define('coral-accordion-item', AccordionItem);
commons._define('coral-accordion', Accordion);

Accordion.Item = AccordionItem;
Accordion.Item.Label = AccordionItemLabel;
Accordion.Item.Content = AccordionItemContent;

export {Accordion};
