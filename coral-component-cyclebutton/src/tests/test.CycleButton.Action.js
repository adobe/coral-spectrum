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
import {CycleButton} from '../../../coral-component-cyclebutton';

describe('CycleButton.Action', function() {
  var el;

  beforeEach(function() {
    el = helpers.build(new CycleButton.Action());
  });

  afterEach(function() {
    el = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(CycleButton).to.have.property('Action');
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      '<coral-cyclebutton-action id="btn1" icon="viewCard">Card</coral-cyclebutton-action>'
    );
  
    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new CycleButton.Action()
    );
  });

  describe('API', function() {
    describe('#content', function() {
      it('should default to empty string', function() {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });

      it('should not be settable', function() {
        try {
          el.content = null;
        }
        catch (e) {
          expect(el.content).not.to.be.null;
        }
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(el.icon).to.equal('');
      });

      it('should be reflected to the DOM', function() {
        el.icon = 'add';
        expect(el.attributes.getNamedItem('icon').value).to.equal('add');
      });

      it('should convert any value to string', function() {
        el.icon = 45;
        expect(el.icon).to.equal('45');
        expect(el.attributes.getNamedItem('icon').value).to.equal('45');
      });
    });
  
    describe('#trackingElement', function() {
      it('should default to empty string', function() {
        expect(el.trackingElement).to.equal('');
        expect(el.content.textContent).to.equal('');
        expect(el.icon).to.equal('');
      });
    
      it('should default to the contents when available', function() {
        el.content.textContent = 'Contents';
        expect(el.trackingElement).to.equal('Contents');
        el.content.textContent = ' Contents with  spaces ';
        expect(el.trackingElement).to.equal('Contents with spaces');
        el.trackingElement = 'user';
        expect(el.trackingElement).to.equal('user', 'Respects the user set value when available');
      });
    
      it('should strip the html out of the content', function() {
        el.content.innerHTML = 'My <b>C</b>ontent';
        expect(el.trackingElement).to.equal('My Content');
      });
    
      it('should default to the icon when there is no content', function() {
        el.icon = 'add';
        expect(el.trackingElement).to.equal('add');
      });
    });
  });
});
