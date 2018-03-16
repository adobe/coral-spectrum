var helpers = helpers || {};

helpers.overlay = {};

helpers.overlay.createFloatingTarget = function() {
  var target = document.createElement('div');
  target.textContent = 'Floating overlay target';
  target.style.position = 'fixed';
  target.style.left = '50%';
  target.style.top = '50%';

  // Add to helpers.target so it it cleared after each test
  helpers.target.appendChild(target);

  return target;
};

helpers.overlay.createStaticTarget = function() {
  var target = document.createElement('div');
  target.textContent = 'Static overlay target';

  // Add to helpers.target so it it cleared after each test
  helpers.target.appendChild(target);

  return target;
};

/**
 Helper used to check that the component complies with the smart overlay behavior.
 
 @param {String} tagName
 */
helpers.testSmartOverlay = function(tagName) {
  describe('testSmartOverlay', () => {
    it('should add/remove the overlay if the component is added/removed from the document', () => {
      const wrapper = helpers.build(`
        <div style="overflow: hidden">
          <${tagName}></${tagName}>
        </div>
      `);
      
      const el = wrapper.querySelector(tagName);
      el._elements.overlay.open = true;
    
      expect(el.contains(el._elements.overlay)).to.be.false;
      expect(document.contains(el._elements.overlay)).to.be.true;
    
      el.remove();
    
      expect(document.contains(el._elements.overlay)).to.be.false;
    
      wrapper.appendChild(el);
    
      expect(el._elements.overlay.hasAttribute('open')).to.be.false;
      expect(document.contains(el._elements.overlay)).to.be.true;
    });
  });
};
