import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {Shell} from '../../../coralui-component-shell';

describe('Shell.Menu', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Shell).to.have.property('Menu');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-menu>');
      expect(el).to.be.an.instanceof(Shell.Menu);
    });
    
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-shell-menu></coral-shell-menu>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.Menu()
    );
  });

  describe('API', function() {
    describe('#placement', function() {});
    describe('#from', function() {});
    describe('#full', function() {});
    describe('#top', function() {});
    describe('#focusOnShow', function() {});
    describe('#returnFocus', function() {});
    describe('#open', function() {});
  });

  describe('Markup', function() {
    describe('#placement', function() {});
    describe('#from', function() {});
    describe('#full', function() {});
    describe('#top', function() {});
    describe('#focusOnShow', function() {});
    describe('#returnFocus', function() {});
    describe('#open', function() {});
  });

  describe('Events', function() {
    describe('#coral-overlay:beforeopen', function() {});
    describe('#coral-overlay:beforeclose', function() {});
    describe('#coral-overlay:open', function() {});
    describe('#coral-overlay:close', function() {});
  });

  describe('User Interaction', function() {});

  describe('Implementation Details', function() {
    it('should not close for clicks on elements that are subsequently removed', function () {
      const el = helpers.build(window.__html__['Shell.MenuBar.base.html']);
      // since the snippet has a div as the parent we need to search for the item
      var menu = el.querySelector('coral-shell-menu');

      var clickTarget = document.createElement('div');

      clickTarget.addEventListener('click', function() {
        if (clickTarget.parentNode) {
          clickTarget.parentNode.removeChild(clickTarget);
        }
      });

      menu.appendChild(clickTarget);
      menu.open = true;

      expect(menu.childElementCount).to.equal(1, 'The menu should contain one element.');

      
      clickTarget.click();
      
      expect(menu.childElementCount).to.equal(0, 'Zero child elements should be in the menu overlay');
      expect(menu.open).to.equal(true, 'The menu should stay open');
    });
  });
});
