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

module.exports = [
  // Colorstops
  {
    spectrum: /\.spectrum--light/g,
    coral: '.coral--light'
  },
  {
    spectrum: /\.spectrum--lightest/g,
    coral: '.coral--lightest'
  },
  {
    spectrum: /\.spectrum--dark/g,
    coral: '.coral--dark'
  },
  {
    spectrum: /\.spectrum--darkest/g,
    coral: '.coral--darkest'
  },
  // Headings
  {
    spectrum: /\.spectrum-Heading--display/g,
    coral: '.coral-Heading--1'
  },
  {
    spectrum: /\.spectrum-Heading--pageTitle/g,
    coral: '.coral-Heading--2'
  },
  {
    spectrum: /\.spectrum-Heading--subtitle1/g,
    coral: '.coral-Heading--3'
  },
  {
    spectrum: /\.spectrum-Heading--subtitle2/g,
    coral: '.coral-Heading--4'
  },
  {
    spectrum: /\.spectrum-Heading--subtitle3/g,
    coral: '.coral-Heading--5'
  },
  // CSS only components
  {
    spectrum: /\.spectrum-Link/g,
    coral: '.coral-Link'
  },
  {
    spectrum: /\.spectrum-FieldGroup/g,
    coral: '.coral-RadioGroup'
  },
  // @compat .coral-RadioGroup--labelsBelow
  {
    spectrum: /\.spectrum-Radio--labelBelow/g,
    coral: '.coral-RadioGroup--labelsBelow  ._coral-Radio'
  },
  {
    spectrum: /\.spectrum-Table-headCell/g,
    coral: '.coral-Table-headerCell'
  },
  {
    spectrum: /\.spectrum-Table/g,
    coral: '.coral-Table'
  },
  {
    spectrum: /\.spectrum-Well/g,
    coral: '.coral-Well'
  },
  // New Spectrum CSS only components
  {
    spectrum: /\.spectrum-Body/g,
    coral: '.coral-Body'
  },
  {
    spectrum: /\.spectrum-Rule/g,
    coral: '.coral-Rule'
  },
  {
    spectrum: /\.spectrum-FieldLabel/g,
    coral: '.coral-FieldLabel'
  },
  // @compat .coral-DecoratedTextfield
  {
    spectrum: /\.spectrum-ClearButton/g,
    coral: '._coral-ClearButton, .coral-DecoratedTextfield > ._coral-Button'
  },
  // @compat typography
  {
    spectrum: /\.spectrum-Typography/g,
    coral: 'body'
  },
  // Coral Components
  {
    spectrum: /\.spectrum-/g,
    coral: '._coral-'
  },
  // Base
  {
    spectrum: /\.spectrum/g,
    coral: 'body'
  },
];
