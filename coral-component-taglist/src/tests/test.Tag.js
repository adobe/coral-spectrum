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
import {Tag} from '../../../coral-component-taglist';

describe('Tag', function() {

  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone a tag using markup',
      window.__html__['Tag.base.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone a tag with full markup',
      window.__html__['Tag.full.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone a tag with comments cusing markup',
      window.__html__['Tag.full.html']
    );
    
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Tag().set({
        label: {
          innerHTML: 'San José'
        },
        value: 'SJ'
      })
    );
  });

  describe('Markup', function() {

    describe('#label', function() {
      it('should have label set to innerHTML if property not provided', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        expect(tag.label.innerHTML).to.equal('Paris');
        expect(tag.value).to.equal('paris');
      });
    });

    describe('#closable', function() {
      it('should block user interaction', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        var removeButton = tag._elements.button;
        expect(tag.closable).to.be.false;
        expect(removeButton.hidden).to.be.true;
        removeButton.click();
        expect(tag.parentNode).to.not.be.null;
      });

      it('should remove tag if its button is triggered', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        tag.closable = true;
        tag._elements.button.trigger('click');
        expect(tag.parentNode).to.be.null;
      });
    });

    describe('#value', function() {
      it('should set the value without setting it to an input element', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        tag.value = 'SJ';

        expect(tag.value).to.equal('SJ');
        expect(tag._input).to.be.undefined;
      });
    });

    describe('#multiline', function() {
      it('should set multiline class if property is true', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        tag.multiline = true;
        expect(tag.classList.contains('_coral-Tags-item--multiline')).to.be.true;
      });
    });

    describe('#quiet', function() {
      it('should set quiet class if property is true', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        tag.quiet = true;

        expect(tag.classList.contains('_coral-Tags-item--quiet')).to.be.true;
      });
    });

    describe('#color', function() {
      it('should set another tag color', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        tag.color = 'grey';
        expect(tag.classList.contains('_coral-Label--grey')).to.be.true;
      });
    });

    describe('#size', function() {
      it('should set another tag size', function() {
        var tag = helpers.build(window.__html__['Tag.base.html']);
        tag.color = 'blue';
        tag.size = 'L';
        expect(tag.classList.contains('_coral-Label--large')).to.be.true;
        tag.size = 'S';
        expect(tag.classList.contains('_coral-Label--small')).to.be.true;
      });
    });
  });

  describe('API', function() {

    let el = null;

    beforeEach(function() {
      el = new Tag();
    });

    afterEach(function() {
      el = null;
    });

    describe('#label', function() {
      it('should have a label', function() {
        expect(el.label).to.not.be.null;
      });
    });

    describe('#closable', function() {
      it('should default to false', function() {
        expect(el.closable).to.be.false;
      });

      it('should insert the button in the DOM only if required', function() {
        expect(el.contains(el._elements.button)).to.be.false;
        el.closable = true;
        expect(el.contains(el._elements.button)).to.be.true;
      });
    });

    describe('#value', function() {
      it('value should default to empty string', function() {
        expect(el.value).to.equal('');
      });
    });

    describe('#multiline', function() {
      it('should default to false', function() {
        expect(el.multiline).to.be.false;
      });
    });

    describe('#quiet', function() {
      it('should default to false', function() {
        expect(el.quiet).to.be.false;
      });
    });

    describe('#size', function() {
      it('should default to M', function() {
        expect(el.size).to.equal(Tag.size.MEDIUM);
      });
    });

    describe('#color', function() {
      it('should default to empty string', function() {
        expect(el.color).to.equal(Tag.color.DEFAULT);
      });
    });
  });
});
