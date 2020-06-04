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
import {Collection} from '../../../coral-collection';

describe('Shell.Help', function() {
  let htmlSnippet = '<coral-shell-help></coral-shell-help>';

  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('Help');
      expect(Shell.Help).to.have.property('Item');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build(htmlSnippet);
      expect(el instanceof Shell.Help).to.equal(true);
    });

    it('should support creation from js', function() {
      const help = new Shell.Help();
      expect(help instanceof Shell.Help).to.equal(true);
    });

    it('should create a help component with predefined items', function() {
      const el = helpers.build(window.__html__['Shell.Help.base.html']);
      expect(el.items.length).to.equal(6);
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Shell.Help.base.html']
    );
  
    const el = new Shell.Help();
    el.items.add({textContent: 'Link'});
    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });

  describe('API', function() {
    describe('#items', function() {
      it('should return the Help Menu items', function() {
        const el = helpers.build(htmlSnippet);
        expect(el.items instanceof Collection).to.equal(true);
      });

      it('Setting Help Menu items should have no effect', function() {
        const el = helpers.build(htmlSnippet);
        const items = el.items;
        
        try {
          el.items = new Collection();
        }
        catch(e) {
          expect(el.items).to.equal(items);
        }
      });
    });

    describe('#placeholder', function() {
      it('should have a placeholder attribute', function() {
        const el = helpers.build(htmlSnippet);
        expect(el.placeholder).to.equal('Search for Help');
      });

      it('should have a placeholder attribute initialized with the correct value', function() {
        const el = helpers.build('<coral-shell-help placeholder="placeholder"></coral-shell-help>');
        expect(el.placeholder).to.equal('placeholder');
      });
    });
  });

  describe('Markup', function() {
    describe('#showError()', function() {
      it('should display an Error Message on "showError" function call', function(done) {
        const el = helpers.build(htmlSnippet);
        const resultMessage = el._elements.resultMessage;
        const expectedResultMessage = 'Error fetching results';

        el.showError();
        window.setTimeout(() => {
          expect(el._elements.resultMessage.hidden).to.equal(false);
          expect(resultMessage.querySelector('._coral-Shell-help-resultMessage-heading').textContent).to.equal(expectedResultMessage);
          done();
        }, 300);
      });
    });

    describe('#showResults()', function() {
      it('should show search results on "showResults" function call', function() {
        const resultItems = [
          {
            'tags': [
              'Marketing Cloud',
              'Analytics',
              'Target'
            ],
            'title': 'Customer Attributes',
            'href': 'https://marketing.adobe.com/resources/help/en_US/mcloud/attributes.html'
          },
          {
            'tags': [
              'Marketing Cloud'
            ],
            'title': 'About data file and data sources for customer attributes',
            'href': 'https://marketing.adobe.com/resources/help/en_US/mcloud/crs_data_file.html'
          }
        ];

        const total = 1111;
        const allResultsURL = 'https://adobe.com';

        const el = helpers.build(htmlSnippet);
        el.showResults(resultItems, total, allResultsURL);

        expect(el._elements.results.hidden).to.equal(false);
        expect(el._elements.results.lastChild.target).to.equal('_blank');
      });

      it('should display a "no results message" on "showResults" function call with an array and total = 0', function(done) {
        const el = helpers.build(htmlSnippet);
        el.showResults([], 0);
        const resultMessage = el._elements.resultMessage;
        const expectedResultMessage = 'No results found';

        window.setTimeout(() => {
          expect(el._elements.resultMessage.hidden).to.equal(false);
          expect(resultMessage.querySelector('._coral-Shell-help-resultMessage-heading').textContent).to.equal(expectedResultMessage);
          done();
        }, 300);
      });
    });
  });

  describe('User Interaction', function() {
    describe('search', function() {
      it('should perform a search', function() {
        const searchSpy = sinon.spy();

        const el = helpers.build(window.__html__['Shell.Help.base.html']);
        const search = el.querySelector('coral-search');
        el.on('coral-shell-help:search', searchSpy);
        search.value = 'customer';
        
        search.trigger('coral-search:submit');
  
        expect(searchSpy.called).to.equal(true);
        expect(searchSpy.args[0][0].detail.value).to.equal('customer');
        expect(el._elements.loading.hidden).to.equal(false);
      });
      

      it('it should clear loading spinner on clear button click', function() {
        const el = helpers.build(window.__html__['Shell.Help.base.html']);
        const search = el.querySelector('coral-search');

        search.value = 'customer';
        
        search.querySelector('[handle=clearButton]').click();
        
        expect(el._elements.loading.hidden).to.equal(true);
      });
    });
  });
});
