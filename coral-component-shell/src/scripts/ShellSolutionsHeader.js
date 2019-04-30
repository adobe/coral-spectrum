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
