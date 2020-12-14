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
import {QuickActions} from '../../../coral-component-quickactions';

describe('QuickActions.Item', function () {
  var item;

  beforeEach(function () {
    item = helpers.build(new QuickActions.Item());
  });

  afterEach(function () {
    item = null;
  });

  describe('Namespace', function () {
    it('should be defined', function () {
      expect(QuickActions).to.have.property('Item');
    });

    it('should expose the type in an enum', function () {
      expect(QuickActions.Item).to.have.property('type');
      expect(QuickActions.Item.type.BUTTON).to.equal('button');
      expect(QuickActions.Item.type.ANCHOR).to.equal('anchor');
      expect(Object.keys(QuickActions.Item.type).length).to.equal(2);
    });
  });

  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-quickactions-item></coral-quickactions-item>'
    );

    helpers.cloneComponent(
      'should be possible to clone using js',
      new QuickActions.Item()
    );
  });

  describe('API', function () {
    describe('#content', function () {
      it('should default to empty string', function () {
        expect(item.content.textContent).to.equal('');
      });

      it('should support HTML content', function () {
        var htmlContent = '<strong>Highlighted</strong> text';
        item.content.innerHTML = htmlContent;

        expect(item.content.innerHTML).to.equal(htmlContent);
        expect(item.innerHTML).to.equal(htmlContent);
      });
    });

    describe('#href', function () {
      it('should default to empty string', function () {
        expect(item.href).to.equal('');
      });
    });

    describe('#icon', function () {
      it('should default to empty string', function () {
        expect(item.icon).to.equal('');
      });

      it('should be reflected to the DOM', function () {
        item.icon = 'add';
        expect(item.getAttribute('icon')).to.equal('add');
      });

      it('should convert any value to string', function () {
        item.icon = 45;
        expect(item.icon).to.equal('45');
        expect(item.getAttribute('icon')).to.equal('45');
      });
    });

    describe('#type', function () {
      it('should default to empty button', function () {
        expect(item.type).to.equal('button');
      });

      it('should be settable', function () {
        item.type = QuickActions.Item.type.ANCHOR;
        expect(item.type).to.equal(QuickActions.Item.type.ANCHOR);
      });

      it('should ignore invalid values', function () {
        item.type = 'invalid_type';
        expect(item.type).to.equal(QuickActions.Item.type.BUTTON);
      });

      it('should be reflected to the DOM', function () {
        item.type = QuickActions.Item.type.ANCHOR;
        expect(item.getAttribute('type')).to.equal(QuickActions.Item.type.ANCHOR, 'type should be reflected');
      });
    });
  });

  describe('Events', function () {
    describe('#coral-quickactions-item:_contentchanged', function () {
      it('should be triggered when content is changed', function (done) {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_contentchanged', spy);

        // Do the update
        item.content.textContent = 'New Content';

        // we need to wait for the mutation observer to kick in
        helpers.next(function () {
          expect(spy.callCount).to.equal(1, 'spy called once after changing the content');

          done();
        });
      });
    });

    describe('#coral-quickactions-item:_hrefchanged', function () {
      it('should be triggered when icon is changed', function () {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_hrefchanged', spy);

        // Do the update
        item.href = 'http://localhost';

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });

    describe('#coral-quickactions-item:_iconchanged', function () {
      it('should be triggered when icon is changed', function () {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_iconchanged', spy);

        // Do the update
        item.icon = 'copy';

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });

    describe('#coral-quickactions-item:_typechanged', function () {
      it('should be triggered when type is changed', function () {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_typechanged', spy);

        // Do the update
        item.type = QuickActions.Item.type.ANCHOR;

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });
  });
});
