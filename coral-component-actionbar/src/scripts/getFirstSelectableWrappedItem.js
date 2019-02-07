import {commons} from '../../../coral-utils';

/** @ignore */
export default function getFirstSelectableWrappedItem(wrapperItem) {
  // util method to get first selectable item inside a wrapper item
  if (!wrapperItem) {
    return null;
  }
  
  if (wrapperItem.hasAttribute('coral-actionbar-more')) {
    // more buttons are no 'real' actionbar items => not wrapped
    return wrapperItem;
  }
  
  let child = null;
  for (let i = 0; i < wrapperItem.children.length; i++) {
    child = wrapperItem.children[i];
    
    // maybe filter even more elements? (opacity, display='none', position='absolute' ...)
    if (child.offsetParent && child.matches(commons.FOCUSABLE_ELEMENT_SELECTOR)) {
      return child;
    }
  }
  
  return null;
}
