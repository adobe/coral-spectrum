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
import {CharacterCount} from '../../../coral-component-charactercount';

describe('CharacterCount', function() {
  var input, characterCount;

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var defaultCharacterCount = helpers.build(new CharacterCount());
      expect(defaultCharacterCount.classList.contains('_coral-CharacterCount')).to.be.true;
      expect(defaultCharacterCount).to.have.property('target');
      expect(defaultCharacterCount).to.have.property('maxLength');
      expect(defaultCharacterCount.target).to.equal(CharacterCount.target.PREVIOUS);
      expect(defaultCharacterCount.maxLength).to.be.null;
    });

    it('should be possible using createElement', function() {
      var defaultCharacterCount = helpers.build(document.createElement('coral-charactercount'));
      expect(defaultCharacterCount.classList.contains('_coral-CharacterCount')).to.be.true;
      expect(defaultCharacterCount).to.have.property('target');
      expect(defaultCharacterCount).to.have.property('maxLength');
      expect(defaultCharacterCount.target).to.equal(CharacterCount.target.PREVIOUS);
      expect(defaultCharacterCount.maxLength).to.be.null;
    });

    it('should be possible using markup', function() {
      var defaultCharacterCount = helpers.build('<coral-charactercount></coral-charactercount>');
      expect(defaultCharacterCount.classList.contains('_coral-CharacterCount')).to.be.true;
      expect(defaultCharacterCount).to.have.property('target');
      expect(defaultCharacterCount).to.have.property('maxLength');
      expect(defaultCharacterCount.target).to.equal(CharacterCount.target.PREVIOUS);
      expect(defaultCharacterCount.maxLength).to.be.null;
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-charactercount></coral-charactercount>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new CharacterCount()
    );
  });

  describe('Implementation Details', function() {

    var typeValue = function(value){
      input.value = value;

      helpers.event('input', input);
    };

    beforeEach(function(){
      input = document.createElement('input');
      input.type = 'textfield';
      input.id = 'example-input';
      helpers.target.appendChild(input);

      characterCount = new CharacterCount();
      helpers.target.appendChild(characterCount);
      characterCount.target = '#example-input';
    });

    afterEach(function(){
      input = null;
      characterCount = null;
    });

    it('should reduce counter for each character entered when maxLength not null', function() {
      characterCount.maxLength = 12;

      typeValue('12345');
      expect(characterCount.innerHTML).to.equal('7');
    });

    it('should reach 0 when characters entered == maxLength', function(){
      characterCount.maxLength = 4;

      typeValue('qwer');
      expect(characterCount.innerHTML).to.equal('0');
    });

    it('should show a negative value when characters entered > maxLength', function(){
      characterCount.maxLength = 2;

      typeValue('123');
      expect(characterCount.innerHTML).to.equal('-1');
    });

    it('it should add is-invalid when character entered > maxLength', function(){
      characterCount.maxLength = 3;

      expect(input.classList.contains('is-invalid')).to.be.false;
      expect(characterCount.classList.contains('is-invalid')).to.be.false;

      typeValue('1234');
      expect(input.classList.contains('is-invalid')).to.be.true;
      expect(characterCount.classList.contains('is-invalid')).to.be.true;
    });

    it('should start counter at 0 when maxLength is null', function() {
      expect(characterCount.innerHTML).to.equal('0');
    });

    it('should increment counter for each character entered when maxLength is null', function(){
      typeValue('98765432');
      expect(characterCount.innerHTML).to.equal('8');
    });
  });
});
