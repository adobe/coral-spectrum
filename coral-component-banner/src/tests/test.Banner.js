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
import {Banner} from '../../../coral-component-banner';

describe('Banner', function () {
  describe('Namespace', function () {
    it('should define the variants in an enum', function () {
      expect(Banner.variant).to.exist;
      expect(Banner.variant.ERROR).to.equal('error');
      expect(Banner.variant.WARNING).to.equal('warning');
      expect(Banner.variant.INFO).to.equal('info');
    });
  });

  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Banner.base.html']
    );

    helpers.cloneComponent(
      'should be possible to clone a complex banner using markup',
      window.__html__['Banner.variant.html']
    );

    helpers.cloneComponent(
      'should be possible to clone using js',
      new Banner()
    );

    helpers.cloneComponent(
      'should be possible to clone a complexe banner using js',
      new Banner().set({variant: 'warning'})
    );
  });

  describe('API', function () {

    var el;
    beforeEach(function () {
      el = new Banner();
    });

    afterEach(function () {
      el = null;
    });

    describe('#content', function () {
      it('should set provided content', function () {
        var content = 'I am content!';
        el.content.innerHTML = content;
        expect(el._elements.content.innerHTML).to.equal(content, 'content after set');
      });
    });

    describe('#header', function () {
      it('should set provided header', function () {
        var header = 'I am header!';
        el.header.innerHTML = header;
        expect(el._elements.header.innerHTML).to.equal(header, 'content after set');
      });
    });

    describe('#variant', function () {
      it('should default to info', function () {
        expect(el.variant).to.equal(Banner.variant.INFO);
      });

      it('should set correct className when variant is error', function () {
        el.variant = Banner.variant.ERROR;
        expect(el.classList.contains('_coral-Banner--error')).to.be.true;
      });

      it('should set correct className when variant is warning', function () {
        el.variant = Banner.variant.WARNING;
        expect(el.classList.contains('_coral-Banner--warning')).to.be.true;
      });

      it('should set correct className when variant is info', function () {
        el.variant = Banner.variant.INFO;
        expect(el.classList.contains('_coral-Banner--info')).to.be.true;
      });
    });
  });

  describe('#Markup', function () {
    var banner;
    beforeEach(function () {
      banner = helpers.build(window.__html__['Banner.variant.html']);
    });

    afterEach(function () {
      banner = null;
    });

    function testContentZoneIndicies(alert) {
      var headerIndex = -1;
      var contentIndex = -2;
      var child;
      for (var i = 0 ; i < alert.children.length ; i++) {
        child = alert.children[i];
        if (child.tagName === 'CORAL-BANNER-HEADER') {
          headerIndex = i;
        } else if (child.tagName === 'CORAL-BANNER-CONTENT') {
          contentIndex = i;
        }
      }

      expect(headerIndex).to.be.below(contentIndex, 'Header should come before the content');
    }

    describe('#header', function () {
      it('should have the correct order when header set', function () {
        var header = banner.header = document.createElement('coral-banner-header');
        expect(banner.header).to.equal(header);
        expect(banner.querySelector('coral-banner-header')).to.equal(header);
        testContentZoneIndicies(banner);
      });
    });

    describe('#content', function () {
      it('should have the correct order on render', function () {
        testContentZoneIndicies(banner);
      });

      it('should have the correct order when content set', function () {
        var content = banner.content = document.createElement('coral-banner-content');
        expect(banner.content).to.equal(content);
        expect(banner.querySelector('coral-banner-content')).to.equal(content);
        testContentZoneIndicies(banner);
      });
    });

    describe('#variant', function () {
      it('should set the variant', function () {
        expect(banner.variant).to.equal(Banner.variant.ERROR);
        expect(banner.getAttribute('variant')).to.equal(Banner.variant.ERROR);
        expect(banner.classList.contains('_coral-Banner--error')).to.be.true;

        banner.setAttribute('variant', 'info');
        expect(banner.getAttribute('variant')).to.equal(Banner.variant.INFO);
        expect(banner.classList.contains('_coral-Banner--info')).to.be.true;
      });
    });
  });
});
