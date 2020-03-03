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
  // @compat Link
  {
    spectrum: /\.spectrum-Link/g,
    coral: '.coral-Link'
  },
  // @compat RadioGroup
  {
    spectrum: /\.spectrum-FieldGroup/g,
    coral: '.coral-RadioGroup'
  },
  // @compat .coral-RadioGroup--labelsBelow
  {
    spectrum: /\.spectrum-Radio--labelBelow/g,
    coral: '.coral-RadioGroup--labelsBelow  ._coral-Radio'
  },
  // @compat Headings
  {
    spectrum: /\.spectrum-Typography/g,
    coral: 'body'
  },
  {
    spectrum: /\.spectrum-Heading1--display\.spectrum-Heading1--strong/g,
    coral: '.coral-Heading--XXXL.coral-Heading--heavy'
  },
  {
    spectrum: /\.spectrum-Heading1--display\.spectrum-Heading1--quiet/g,
    coral: '.coral-Heading--XXXL.coral-Heading--quiet'
  },
  {
    spectrum: /\.spectrum-Heading1--display/g,
    coral: '.coral-Heading--XXXL'
  },
  {
    spectrum: /\.spectrum-Heading2--display\.spectrum-Heading2--strong/g,
    coral: '.coral-Heading--XXXL.coral-Heading--heavy'
  },
  {
    spectrum: /\.spectrum-Heading2--display\.spectrum-Heading2--quiet/g,
    coral: '.coral-Heading--XXL.coral-Heading--quiet'
  },
  {
    spectrum: /\.spectrum-Heading2--display/g,
    coral: '.coral-Heading--XXL'
  },
  {
    spectrum: /\.spectrum-Heading1--strong/g,
    coral: '.coral-Heading--XL.coral-Heading--heavy'
  },
  {
    spectrum: /\.spectrum-Heading1--quiet/g,
    coral: '.coral-Heading--XL.coral-Heading--quiet'
  },
  {
    spectrum: /\.spectrum-Heading1/g,
    coral: '.coral-Heading--XL'
  },
  {
    spectrum: /\.spectrum-Heading2--strong/g,
    coral: '.coral-Heading--L.coral-Heading--heavy'
  },
  {
    spectrum: /\.spectrum-Heading2--quiet/g,
    coral: '.coral-Heading--L.coral-Heading--quiet'
  },
  {
    spectrum: /\.spectrum-Heading2/g,
    coral: '.coral-Heading--L'
  },
  {
    spectrum: /\.spectrum-Heading3/g,
    coral: '.coral-Heading--M'
  },
  {
    spectrum: /\.spectrum-Heading4/g,
    coral: '.coral-Heading--S'
  },
  {
    spectrum: /\.spectrum-Heading5/g,
    coral: '.coral-Heading--XS'
  },
  {
    spectrum: /\.spectrum-Heading6/g,
    coral: '.coral-Heading--XXS'
  },
  {
    spectrum: /\.spectrum-Body1/g,
    coral: '.coral-Body--XL'
  },
  {
    spectrum: /\.spectrum-Body2/g,
    coral: '.coral-Body--L'
  },
  {
    spectrum: /\.spectrum-Body3/g,
    coral: '.coral-Body--M'
  },
  {
    spectrum: /\.spectrum-Body4/g,
    coral: '.coral-Body--S'
  },
  {
    spectrum: /\.spectrum-Body5/g,
    coral: '.coral-Body--XS'
  },
  {
    spectrum: /\.spectrum-Subheading/g,
    coral: '.coral-Detail--S'
  },
  {
    spectrum: /\.spectrum-Detail/g,
    coral: '.coral-Detail--S.coral-Detail--light'
  },
  {
    spectrum: /\.spectrum-Code1/g,
    coral: '.coral-Code--XL'
  },
  {
    spectrum: /\.spectrum-Code2/g,
    coral: '.coral-Code--L'
  },
  {
    spectrum: /\.spectrum-Code3/g,
    coral: '.coral-Code--M'
  },
  {
    spectrum: /\.spectrum-Code4/g,
    coral: '.coral-Code--S'
  },
  {
    spectrum: /\.spectrum-Code5/g,
    coral: '.coral-Code--XS'
  },
  {
    spectrum: /\.spectrum-Form/g,
    coral: '.coral-FormGroup'
  },
  {
    spectrum: /\.spectrum-FieldLabel/g,
    coral: '.coral-FieldLabel'
  },
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
  {
    spectrum: /\.spectrum-Rule--large/g,
    coral: '.coral-Divider--L'
  },
  {
    spectrum: /\.spectrum-Rule--medium/g,
    coral: '.coral-Divider--M'
  },
  {
    spectrum: /\.spectrum-Rule--small/g,
    coral: '.coral-Divider--S'
  },
  {
    spectrum: /\.spectrum-Rule--vertical/g,
    coral: '.coral-Divider--vertical'
  },
  {
    spectrum: /\.spectrum-Rule/g,
    coral: '.coral-Divider--S, .coral-Divider--M, .coral-Divider--L'
  },
  // @compat Table
  {
    spectrum: /\.spectrum-Table-headCell/g,
    coral: '.coral-Table-headerCell'
  },
  {
    spectrum: /\.spectrum-Table/g,
    coral: '.coral-Table'
  },
  // @compat Well
  {
    spectrum: /\.spectrum-Well/g,
    coral: '.coral-Well'
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
