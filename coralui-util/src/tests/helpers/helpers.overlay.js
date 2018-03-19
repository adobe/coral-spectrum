import {target, build} from './helpers.build';

const overlay = {};

overlay.createFloatingTarget = function() {
  var overlayTarget = document.createElement('div');
  overlayTarget.textContent = 'Floating overlay target';
  overlayTarget.style.position = 'fixed';
  overlayTarget.style.left = '50%';
  overlayTarget.style.top = '50%';

  // Add to target so it it cleared after each test
  target.appendChild(overlayTarget);

  return overlayTarget;
};

overlay.createStaticTarget = function() {
  var overlayTarget = document.createElement('div');
  overlayTarget.textContent = 'Static overlay target';

  // Add to target so it it cleared after each test
  target.appendChild(overlayTarget);

  return overlayTarget;
};

/**
 Helper used to check that the component complies with the smart overlay behavior.
 
 @param {String} tagName
 */
const testSmartOverlay = function(tagName) {
  describe('testSmartOverlay', () => {
    it('should add/remove the overlay if the component is added/removed from the document', () => {
      const wrapper = build(`
        <div style="overflow: hidden">
          <${tagName}></${tagName}>
        </div>
      `);
      
      const el = wrapper.querySelector(tagName);
      el._elements.overlay.open = true;
    
      expect(el.contains(el._elements.overlay)).to.be.false;
      expect(document.body.contains(el._elements.overlay)).to.be.true;
    
      el.remove();
    
      expect(document.body.contains(el._elements.overlay)).to.be.false;
    
      wrapper.appendChild(el);
    
      expect(el._elements.overlay.hasAttribute('open')).to.be.false;
      expect(document.body.contains(el._elements.overlay)).to.be.true;
    });
  });
};

export {overlay, testSmartOverlay};
