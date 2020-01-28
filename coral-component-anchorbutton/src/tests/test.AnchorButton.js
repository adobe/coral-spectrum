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
import {AnchorButton} from '../../../coral-component-anchorbutton';
import {events} from '../../../coral-utils';

describe('AnchorButton', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(AnchorButton).to.have.property('Label');
    });
  });
  
  describe('Implementation Details', function() {
    helpers.testButton(AnchorButton, 'coral-anchorbutton', 'a');
  });

  describe('Accessibility', function() {
    it('should have aria-disabled, role and tabindex set by default', function() {
      const button = helpers.build('<a is="coral-anchorbutton"></a>');
      expect(button.hasAttribute('role')).to.be.true;
      expect(button.hasAttribute('tabindex')).to.be.true;
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.getAttribute('tabindex')).to.equal('0');
      expect(button.hasAttribute('aria-disabled')).to.be.false;
    });

    it('should have tabindex set to -1 while disabled', function() {
      const button = helpers.build('<a is="coral-anchorbutton" disabled></a>');
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.getAttribute('tabindex')).to.equal('-1');
      expect(button.getAttribute('aria-disabled')).to.equal('true');
    });

    it('should set is-select on keyDown', function() {
      var button = helpers.build(new AnchorButton());
      
      expect(button.classList.contains('_coral-Button')).to.be.true;
      expect(button.classList.contains('is-selected')).to.be.false;

      helpers.keydown('space', button);
      expect(button.classList.contains('is-selected')).to.be.true;
    });

    it('should not set is-select on keyDown', function() {
      var button = helpers.build(new AnchorButton());

      helpers.keyup('space', button);
      expect(button.classList.contains('is-selected')).to.be.false;
    });
  });

  describe('Event', function() {
    // instantiated anchorbutton element
    var anchorbutton;
    var keyDownSpy;
    var keyUpSpy;
    var clickSpy;
    var preventSpy;

    beforeEach(function() {
      keyDownSpy = sinon.spy();
      keyUpSpy = sinon.spy();
      clickSpy = sinon.spy();
      preventSpy = sinon.spy();
      
      anchorbutton = helpers.target.appendChild(new AnchorButton());

      // adds the required listeners
      anchorbutton.on('keyup', keyUpSpy);
      anchorbutton.on('keydown', keyDownSpy);

      // clickSpy and preventSpy for event bubble
      events.on('click.TestAnchorButton', function(event) {
        if (event.target instanceof AnchorButton) {
          clickSpy();
          if (event.defaultPrevented) {
            preventSpy();
          }
        }
      });

      expect(keyDownSpy.callCount).to.equal(0);
      expect(keyUpSpy.callCount).to.equal(0);
      expect(clickSpy.callCount).to.equal(0);
      expect(preventSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      events.off('click.TestAnchorButton');
      helpers.target.removeChild(anchorbutton);
      anchorbutton = null;
    });

    it('should trigger on keydown', function() {
      helpers.keydown('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(1);
      expect(keyUpSpy.callCount).to.equal(0);
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);

      expect(anchorbutton.classList.contains('is-selected')).to.be.true;
    });

    it('should trigger on keyup', function() {
      helpers.keyup('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(0);
      expect(keyUpSpy.callCount).to.equal(1);
      expect(clickSpy.callCount).to.equal(0);
      expect(preventSpy.callCount).to.equal(0);
    });

    it('should trigger on keypressed', function() {
      helpers.keypress('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(1);
      expect(keyUpSpy.callCount).to.equal(1);
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);
    });

    it('should prevent event from bubbling while disabled', function() {
      expect(anchorbutton.disabled).to.be.false;
      anchorbutton.click();
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);
      anchorbutton.disabled = true;
      anchorbutton.click();
      expect(clickSpy.callCount).to.equal(2);
      expect(preventSpy.callCount).to.equal(1);
    });
  });
});
