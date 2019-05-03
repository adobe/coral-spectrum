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

describe('Shell.OrgSwitcher', function() {
  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('OrgSwitcher');
      expect(Shell.OrgSwitcher).to.have.property('Footer');
      expect(Shell).to.have.property('Organization');
      expect(Shell).to.have.property('Suborganization');
    });
  });
  
  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-orgswitcher>');
      expect(el instanceof Shell.OrgSwitcher).to.equal(true);
    });
  
    it('should support creation from JavaScript', function() {
      var orgSwitcher = helpers.build(new Shell.OrgSwitcher());
    
      var organization1 = new Shell.Organization().set({
        'name': 'adobe'
      });
      organization1.content.innerHTML = 'Adobe';
    
      var orgElm = orgSwitcher.items.add(organization1);
    
      var subOrganization1 = new Shell.Suborganization().set({
        'name': 'adobejapan'
      });
      subOrganization1.content.innerHTML = 'Adobe Japan';
    
      var subOrgElm = orgElm.items.add(subOrganization1);
    
      var subOrganization2 = new Shell.Suborganization().set({
        'name': 'adobechina'
      });
      subOrganization2.content.innerHTML = 'Adobe China';
    
      orgElm.items.add(subOrganization2);
    
      var organization2 = new Shell.Organization().set({
        'name': 'adobeuse'
      });
      organization2.content.innerHTML = 'Adobe USA';
      
      orgSwitcher.items.add(organization2);
    
      expect(orgSwitcher.items.getAll().length).to.equal(4);
      expect(orgElm instanceof Shell.Organization).to.equal(true);
      expect(subOrgElm instanceof Shell.Suborganization).to.equal(true);
      expect(orgSwitcher.items.getAll().indexOf(organization1)).to.equal(0);
      expect(orgSwitcher.items.getAll().indexOf(subOrganization1)).to.equal(1);
      expect(orgSwitcher.items.getAll().indexOf(subOrganization2)).to.equal(2);
      expect(orgSwitcher.items.getAll().indexOf(organization2)).to.equal(3);
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Shell.OrgSwitcher.subItems.html']
    );
    
    const el = new Shell.OrgSwitcher();
    const item = el.items.add();
    item.items.add();
    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });
  
  describe('API', function() {});
  
  describe('Markup', function() {});
  
  describe('Events', function() {
    it('should trigger a change event when an item is selected', function() {
      const switcher = helpers.build(window.__html__['Shell.OrgSwitcher.items.html']);
      var spy = sinon.spy();
      switcher.on('coral-shell-orgswitcher:change', spy);

      var oldSelection = switcher.querySelector('[name="newsgator"]');
      var selection = switcher.querySelector('[name="flickr"]');

      // Select the new item
      selection.selected = true;

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(selection);
      expect(spy.args[0][0].detail.oldSelection).to.equal(oldSelection);
    });

    it('should trigger a change event when a sub-item is selected', function() {
      const switcher = helpers.build(window.__html__['Shell.OrgSwitcher.subItems.html']);
      var spy = sinon.spy();
      switcher.on('coral-shell-orgswitcher:change', spy);

      var oldSelection = switcher.querySelector('[name="microsoftjapan"]');
      var selection = switcher.querySelector('[name="microsoftusa"]');

      // Select the new item
      selection.selected = true;

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(selection);
      expect(spy.args[0][0].detail.oldSelection).to.equal(oldSelection);
    });
  });
  
  describe('Implementation Details', function() {
    var switcher;

    beforeEach(function() {
      switcher = helpers.build(new Shell.OrgSwitcher());
      createOrgItems(['Adobe', 'behance', 'Typekit']);
    });
    
    afterEach(function() {
      switcher = null;
    });

    it('should show exact matches', function() {
      searchAndCompareResults('behance', ['behance']);
    });

    it('should show partial matches', function() {
      searchAndCompareResults('ki', ['Typekit']);
    });

    it('should show all if multiple items match', function() {
      searchAndCompareResults('b', ['Adobe', 'behance']);
    });

    it('should be case insensitive', function() {
      searchAndCompareResults('AdObE', ['Adobe']);
    });

    function createOrgItems(orgNames) {
      orgNames.forEach(function(orgName) {
        switcher.items.add({
          content: {
            innerHTML: orgName
          }
        });
      });
    }

    function searchAndCompareResults(query, expectedResults) {
      switcher._elements.search.value = query;
      switcher.trigger('coral-search:input');
  
      var results = switcher.items.getAll()
        .filter(function(item) {
          return !item.hidden;
        })
        .map(function(item) {
          return item.content.textContent;
        });
  
      expect(results).to.deep.equal(expectedResults);
    }
  });
});
