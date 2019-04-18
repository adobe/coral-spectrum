/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {commons} from '../../../coral-utils';

/**
 @class Coral.Shell.Solutions.Header
 @classdesc Shell's solution sub-cloud name
 @htmltag coral-shell-solutions-header
 @return {HTMLElement}
 
 @deprecated
 */
export default () => {
  commons._log('warn', 'Coral.Shell.Solutions.Header: coral-shell-solutions-header is deprecated.');
  return document.createElement('coral-shell-solutions-header');
};
