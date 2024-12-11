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
import {Select} from '../../../coral-component-select';
import {Icon} from '../../../coral-component-icon';

describe('Select.Item', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(Select).to.have.property('Item');
    });
  });

  describe('API', function () {
    // the select list item used in every test
    var el;

    beforeEach(function () {
      el = helpers.build(new Select.Item());
    });

    afterEach(function () {
      el = null;
    });

    describe('#content', function () {
      it('should default to empty string', function () {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function () {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });
    });

    describe('#value', function () {
      it('should default empty string', function () {
        expect(el.value).to.equal('');

        expect(el.hasAttribute('value')).to.be.false;
      });

      it('should default to the content when value is null', function () {
        el.content.innerHTML = 'Switzerland';

        expect(el.content.innerHTML).to.equal('Switzerland');
        expect(el.value).to.equal('Switzerland');
        expect(el.hasAttribute('value')).to.be.false;
      });

      it('should default to the empty string when value is empty string', function () {
        el.setAttribute('value', '');
        el.content.innerHTML = 'Switzerland';

        expect(el.content.innerHTML).to.equal('Switzerland');
        expect(el.value).to.equal('');
        expect(el.hasAttribute('value')).to.be.true;
      });

      it('should keep maximum 1 space from the content', function () {
        el.content.innerHTML = 'Costa   Rica';

        expect(el.content.innerHTML).to.equal('Costa   Rica');
        expect(el.value).to.equal('Costa Rica');
      });

      it('should remove the html from the value', function () {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.value).to.equal('Highlighted text');
      });

      it('should convert the value to string', function () {
        el.value = 9.5;

        expect(el.value).to.equal('9.5');
        expect(el.getAttribute('value')).to.equal('9.5');
      });

      it('should reflect the value', function () {
        el.value = 'crc';

        expect(el.getAttribute('value')).to.equal('crc');
      });
    });

    describe('#selected', function () {
      it('should be not be selected by default', function () {
        expect(el.selected).to.be.false;

        expect(el.hasAttribute('selected')).to.be.false;
      });

      it('should be settable', function () {
        el.selected = true;

        expect(el.selected).to.be.true;
        expect(el.hasAttribute('selected')).to.be.true;
      });

      it('should accept truthy', function () {
        el.selected = true;

        expect(el.selected).to.be.true;
        expect(el.hasAttribute('selected')).to.be.true;
      });
    });

    describe('#disabled', function () {
      it('should be not be disabled by default', function () {
        expect(el.disabled).to.be.false;
        expect(el.hasAttribute('disabled')).to.be.false;
      });

      it('should be settable', function () {
        el.disabled = true;

        expect(el.disabled).to.be.true;
        expect(el.hasAttribute('disabled')).to.be.true;
      });

      it('should accept truthy', function () {
        el.disabled = 1;

        expect(el.disabled).to.be.true;
        expect(el.hasAttribute('disabled')).to.be.true;
      });
    });
  });

  describe('Markup', function () {

    describe('#content', function () {

      it('should have content set to innerHTML if property not provided', function () {
        const el = helpers.build(window.__html__['Select.Item.base.html']);
        expect(el.content.innerHTML).to.equal('Costa Rica');
        expect(el.value).to.equal('Costa Rica');
      });

      it('should support HTML content', function () {
        const el = helpers.build(window.__html__['Select.Item.full.html']);
        expect(el.content.innerHTML).to.equal('<em>Costa</em> Rica');
        expect(el.innerHTML).to.equal('<em>Costa</em> Rica');
        expect(el.value).to.equal('crc');
      });
    });

    describe('#value', function () {
      it('should set the value from markup', function () {
        const el = helpers.build(window.__html__['Select.Item.full.html']);
        expect(el.value).to.equal('crc');
      });

      it('should default to the content', function () {
        const el = helpers.build(window.__html__['Select.Item.base.html']);
        expect(el.value).to.equal('Costa Rica');
        expect(el.hasAttribute('value')).to.be.false;
      });

      // @todo: this is the behavior of the default select option since we use coral.transform.string we cannot detect
      // the difference
      it.skip('should fall back to content if attribute is removed', function () {
        const el = helpers.build(window.__html__['Select.Item.full.html']);
        expect(el.value).to.equal('crc');
        el.removeAttribute('value');
        expect(el.value).to.equal('Costa Rica');
      });
    });

    describe('#selected', function () {
      it('should not be selected by default', function () {
        const el = helpers.build(window.__html__['Select.Item.base.html']);
        expect(el.selected).to.be.false;
        expect(el.classList.contains('is-selected')).to.be.false;
        expect(el.hasAttribute('selected')).to.be.false;
      });
    });

    describe('#disabled', function () {
      it('should not be disabled by default', function () {
        const el = helpers.build(window.__html__['Select.Item.base.html']);
        expect(el.disabled).to.be.false;
        expect(el.classList.contains('is-disabled')).to.be.false;
        expect(el.hasAttribute('disabled')).to.be.false;
      });
    });
  });

  describe('Events', function () {
    // the select list item used in every test
    var el;

    beforeEach(function () {
      el = helpers.build(new Select.Item());
      el.value = 'item1';
    });

    afterEach(function () {
      el = null;
    });

    describe('#coral-select-item:_valuechanged', function () {
      it('should be triggered when the value changes', function () {
        const spy = sinon.spy(el._messenger, 'postMessage').withArgs('coral-select-item:_valuechanged');

        el.value = 'value';

        expect(spy.calledOnce).to.be.true;
        expect(spy.getCall(0).thisValue._element.value).to.equal('value');
      });
    });

    describe('#coral-select-item:_contentchanged', function () {
      it('should be triggered when the content changes', function (done) {
        const spy = sinon.spy(el._messenger, 'postMessage').withArgs('coral-select-item:_contentchanged');

        el.content.innerHTML = 'new content';

        // we need to wait for the mutation observer
        helpers.next(function () {
          expect(spy.calledOnce).to.be.true;
          expect(spy.getCall(0).thisValue._element.content.innerHTML).to.equal('new content');
          done();
        });
      });

      it('should be triggered when item is appended', function (done) {
        const icon = new Icon();
        const spy = sinon.spy(el._messenger, 'postMessage').withArgs('coral-select-item:_contentchanged');

        el.content.appendChild(icon);

        // we need to wait for the mutation observer
        helpers.next(function () {
          expect(spy.calledOnce).to.be.true;
          done();
        });
      });
    });

    describe('#coral-select-item:_disabledchanged', function () {
      it('should be triggered when the value changes', function () {
        const spy = sinon.spy(el._messenger, 'postMessage').withArgs('coral-select-item:_disabledchanged');

        el.disabled = true;

        expect(spy.calledOnce).to.be.true;
        expect(spy.getCall(0).thisValue._element.disabled).to.be.true;
      });
    });

    describe('#coral-select-item:_selectedchanged', function () {
      it('should be triggered when the value changes', function () {
        const spy = sinon.spy(el._messenger, 'postMessage').withArgs('coral-select-item:_selectedchanged');

        el.selected = true;

        expect(spy.calledOnce).to.be.true;
        expect(spy.getCall(0).thisValue._element.selected).to.be.true;
      });
    });
  });

  describe('Implementation Details', function () {
    it('should always be hidden', function () {
      var el = helpers.build(new Select.Item());
      helpers.target.appendChild(el);

      expect(el.offsetParent).to.equal(null);
    });
  });
});
