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

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Shell} from '../../../coral-component-shell';

describe('Shell.MenuBar.Item', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Shell.MenuBar).to.have.property('Item');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-menubar-item>');
      expect(el).to.be.an.instanceof(Shell.MenuBar.Item);
    });

    it('should have role="listitem"', function() {
      const el = helpers.build('<coral-shell-menubar-item>');
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-shell-menubar-item></coral-shell-menubar-item>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.MenuBar.Item()
    );
  });

  describe('API', function() {
    var el;
    var menu;

    beforeEach(function() {
      el = new Shell.MenuBar.Item();
      menu = new Shell.Menu();
      menu.id = 'menu_demo';

      helpers.target.appendChild(el);
      helpers.target.appendChild(menu);
    });

    afterEach(function() {
      el = menu = null;
    });

    describe('#icon', function() {
      it('should default be empty', function() {
        expect(el.icon).to.equal('');
      });
      
      it('should set the buttons icon', function() {
        el.icon = 'search';
        expect(el._elements.shellMenuButton.icon).to.equal('search');
      });
    });
    
    describe('#iconSize', function() {
      it('should default to small', function() {
        expect(el.iconSize).to.equal('S');
      });
      
      it('should set the buttons icon size', function() {
        el.iconSize = 'M';
        expect(el._elements.shellMenuButton.iconSize).to.equal('M');
      });
    });
    
    describe('#iconVariant', function() {
      it('should default be default value', function() {
        expect(el.iconVariant).to.equal('default');
      });
      
      it('should set the iconVariant', function() {
        el.iconVariant = Shell.MenuBar.Item.iconVariant.CIRCLE;
        expect(el.iconVariant).to.equal('circle');
      });
    });
    
    describe('#badge', function() {
      it('should set the badge attribute on the button', function() {
        el.badge = 1;
        expect(el._elements.shellMenuButton.getAttribute('badge')).to.equal('1');
      });

      it('should remove the badge attribute on the button for non-truthy values', function() {
        el.badge = 1;
        expect(el._elements.shellMenuButton.getAttribute('badge')).to.equal('1');
        el.badge = 0;
        expect(el._elements.shellMenuButton.hasAttribute('badge')).to.equal(false);
        el.badge = '0';
        expect(el._elements.shellMenuButton.hasAttribute('badge')).to.equal(false);
        el.badge = null;
        expect(el._elements.shellMenuButton.hasAttribute('badge')).to.equal(false);
      });

      it('should remove the badge attribute on the button when the attribute is removed from the item', function() {
        el.setAttribute('badge', 1);
        expect(el._elements.shellMenuButton.getAttribute('badge')).to.equal('1');
        el.removeAttribute('badge');
        expect(el._elements.shellMenuButton.hasAttribute('badge')).to.equal(false);
      });
    });

    describe('#open', function() {
      it('should default to false', function() {
        expect(el.open).to.be.false;
        expect(el._elements.shellMenuButton.getAttribute('aria-haspopup')).to.be.null;
        expect(el._elements.shellMenuButton.getAttribute('aria-expanded')).to.be.null;
      });

      it('should ignore true if no valid menu is provided', function() {
        el.open = true;

        expect(el.open).to.be.false;
        expect(el._elements.shellMenuButton.getAttribute('aria-haspopup')).to.be.null;
        expect(el._elements.shellMenuButton.getAttribute('aria-expanded')).to.be.null;
      });

      it('should open the menu when open = true', function(done) {
        // binds the menu and the item together
        el.menu = menu;
        
        menu.on('coral-overlay:open', function() {
          expect(menu.open).to.be.true;
          expect(el.open).to.be.true;
          expect(el._elements.shellMenuButton.getAttribute('aria-haspopup')).to.equal('dialog');
          expect(el._elements.shellMenuButton.getAttribute('aria-expanded')).to.equal('true');

          done();
        });

        el.open = true;
      });

      it('should update open when menu is open programmatically', function(done) {
        // binds the menu and the item together
        el.menu = menu;
        menu._overlayAnimationTime = 0;

        expect(el.open).to.be.false;

        menu.on('coral-overlay:open', function() {
          helpers.next(function() {
            expect(el.open).to.be.true;
            expect(el._elements.shellMenuButton.getAttribute('aria-haspopup')).to.equal('dialog');
            expect(el._elements.shellMenuButton.getAttribute('aria-expanded')).to.equal('true');

            done();
          });
        });

        helpers.next(function() {
          expect(el._elements.shellMenuButton.getAttribute('aria-haspopup')).to.equal('dialog');
          expect(el._elements.shellMenuButton.getAttribute('aria-expanded')).to.equal('false');

          // opening the menu separately, should update the item
          menu.open = true;
        });
      });
    });

    describe('#label', function() {});

    describe('#menu', function() {
      it('should default to null', function() {
        expect(el.menu).to.be.null;
      });

      it('should accept selectors', function() {
        el.menu = '#menu_demo';

        expect(el.menu).to.equal('#menu_demo');
        expect(el._getMenu()).to.equal(menu);
      });

      it('should accept HTMLElements', function() {
        el.menu = menu;

        expect(el.menu).to.equal(menu);
        expect(el._getMenu()).to.equal(menu);
      });
    });
  });

  describe('Markup', function() {
    describe('#icon', function() {});
    describe('#iconSize', function() {});

    describe('#iconVariant', function() {
      it('should set the iconVariant class', function() {
        const el = helpers.build(window.__html__['Shell.MenuBar.Item.circle.html']);
        expect(el.iconVariant).to.equal('circle');
        expect(el.classList.contains('_coral-Shell-menubar-item--circle')).to.be.true;
      });
    });

    describe('#badge', function() {});
    describe('#open', function() {});
    describe('#label', function() {});
    describe('#menu', function() {});
  });

  describe('Events', function() {
    var el;
    var menu;
    var openSpy;
    var closeSpy;

    beforeEach(function() {
      el = new Shell.MenuBar.Item();
      menu = new Shell.Menu();

      el.menu = menu;

      openSpy = sinon.spy();
      closeSpy = sinon.spy();

      el.on('coral-shell-menubar-item:open', openSpy);
      el.on('coral-shell-menubar-item:close', closeSpy);

      helpers.target.appendChild(el);
      helpers.target.appendChild(menu);
    });

    afterEach(function() {
      el = menu = openSpy = closeSpy = null;
    });

    describe('#coral-shell-menubar-item:open', function() {
      it('should not be triggered if menu is invalid', function() {
        // we set an invalid menu to test
        el.menu = '#menu_test';

        el.open = true;
      
        expect(el.open).to.be.false;

        expect(openSpy.callCount).to.equal(0);
        expect(closeSpy.callCount).to.equal(0);
      });

      it('should be triggered if menu is valid', function() {
        el.open = true;
        
        expect(el.open).to.be.true;

        expect(openSpy.callCount).to.equal(1);
        expect(closeSpy.callCount).to.equal(0);
      });
    });

    describe('#coral-shell-menubar-item:close', function() {
      it('should be triggered when the menu is closed', function() {
        el.open = true;
  
        expect(el.open).to.be.true;
  
        expect(openSpy.callCount).to.equal(1);
        expect(closeSpy.callCount).to.equal(0);
  
        el.open = false;
  
        expect(openSpy.callCount).to.equal(1);
        expect(closeSpy.callCount).to.equal(1);
      });
    });
  });

  describe('User Interaction', function() {
    it('should open the menu if the item is clicked', function() {
      const el = helpers.build(window.__html__['Shell.MenuBar.Item.menu.html']);
      // since the snippet has a div as the parent we need to search for the item
      var item = el.querySelector('coral-shell-menubar-item');
      var menu = el.querySelector('coral-shell-menu');

      expect(item.open).to.be.false;
      expect(menu.open).to.be.false;

      // we click it to start the user interaction
      item._elements.shellMenuButton.click();
      
      expect(item.open).to.be.true;
      expect(menu.open).to.be.true;
    });

    it('should close the menu if key:escape is pressed', function(done) {
      const el = helpers.build(window.__html__['Shell.MenuBar.base.html']);
      // since the snippet has a div as the parent we need to search for the item
      var menu = el.querySelector('coral-shell-menu');
      menu._overlayAnimationTime = 0;

      el.addEventListener('coral-overlay:open', function() {
        helpers.keypress('escape');
      });

      el.addEventListener('coral-overlay:close', function() {
        // expect(item.open).to.equal(false, 'The item has the correct state after the item is closed');
        expect(menu.open).to.equal(false, 'The menu is now closed');

        done();
      });

      // we open the item programmatically and then close it with escape
      menu.open = true;
    });

    it('should close the menu if clicked outside', function(done) {
      const el = helpers.build(window.__html__['Shell.MenuBar.base.html']);
      // since the snippet has a div as the parent we need to search for the item
      var menubar = el.querySelector('coral-shell-menubar');
      var menu = el.querySelector('coral-shell-menu');
      menu._overlayAnimationTime = 0;

      el.addEventListener('coral-overlay:open', function() {

        // clicks outside the menu which forces it to be closed
        menubar.click();
      });

      el.addEventListener('coral-overlay:close', function() {
        // expect(item.open).to.equal(false, 'The item has the correct state after the item is closed');
        expect(menu.open).to.equal(false, 'The menu is now closed');

        done();
      });

      // we open the item programmatically and then close it with escape
      menu.open = true;
    });
  });
  
  describe('Implementation Details', function() {
    describe('Accessibility', function() {
      describe('#aria-label', function() {
        it('should set the buttons aria-label', function() {
          const el = helpers.build(new Shell.MenuBar.Item());
          el.setAttribute('aria-label', 'Profile');
          expect(el._elements.shellMenuButton.getAttribute('aria-label')).to.equal('Profile');
        });
        
        it('should not set the buttons aria-label when an empty aria-label is passed in', function() {
          const el = helpers.build(new Shell.MenuBar.Item());
          el.setAttribute('aria-label', '');
          expect(el._elements.shellMenuButton.getAttribute('aria-label')).to.equal(null);
        });
        
        it('should not set the buttons aria-label when button label exists', function() {
          const el = helpers.build(new Shell.MenuBar.Item());
          el.label.textContent = 'This is the profile button';
          el.setAttribute('aria-label', 'Profile');
          expect(el._elements.shellMenuButton.getAttribute('aria-label')).to.equal(null);
        });
      });

      it('should have role="listitem"', function() {
        const el = helpers.build(new Shell.MenuBar.Item());
        expect(el.getAttribute('role')).to.equal('listitem');
      });

      describe('shellMenuButton', function() {
        it('should have type="button"', function() {
          const el = helpers.build(new Shell.MenuBar.Item());
          expect(el._elements.shellMenuButton.getAttribute('type')).to.equal('button');
        });
      });
    });
  });
});
