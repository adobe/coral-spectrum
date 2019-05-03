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

describe('Shell.User', function() {
  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('User');
      expect(Shell.User).to.have.property('Content');
      expect(Shell.User).to.have.property('Footer');
      expect(Shell.User).to.have.property('Heading');
      expect(Shell.User).to.have.property('Name');
      expect(Shell.User).to.have.property('Subheading');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var user = helpers.build(new Shell.User());
      expect(user.classList.contains('_coral-Shell-user')).to.be.true;
    });

    it('should be possible using createElement', function() {
      var user = helpers.build(document.createElement('coral-shell-user'));
      expect(user.classList.contains('_coral-Shell-user')).to.be.true;
    });

    it('should be possible using markup', function() {
      const el = helpers.build('<coral-shell-user>');
      expect(el instanceof Shell.User).to.equal(true);
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-shell-user></coral-shell-user>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.User()
    );
  });
  
  describe('API', function() {
    
    describe('#avatar', function() {
      it('should default to avatar.DEFAULT', function() {
        var user = helpers.build(new Shell.User());
        expect(user.avatar).to.equal(Shell.User.avatar.DEFAULT);
        expect(user._elements.avatar.classList.contains('_coral-Shell-user-avatar')).to.be.true;
      });
      
      it('should set the new avatar', function() {
        var user = helpers.build(new Shell.User());
        user.avatar = 'image.png';
        expect(user._elements.avatar.icon).to.equal('image.png');
      });
      
      it('should set the avatar back to default', function() {
        var user = helpers.build(new Shell.User());
        user.avatar = 'image.png';
        
        user.avatar = Shell.User.avatar.DEFAULT;
  
        expect(user.avatar).to.equal(Shell.User.avatar.DEFAULT);
      });
      
      it('should set the avatar to empty string when the attribute is removed', function() {
        var user = helpers.build(new Shell.User());
        user.setAttribute('avatar', 'image.png');
        
        expect(user._elements.avatar.icon).to.equal('image.png');
        user.removeAttribute('avatar');
        
        expect(user.avatar).to.equal('');
      });
    });
  });

  describe('Markup', function() {

    describe('#avatar', function() {

      it('should be default value initially', function() {
        var user = helpers.build('<coral-shell-user></coral-shell-user>');
        expect(user.avatar).to.equal(Shell.User.avatar.DEFAULT);
        expect(user._elements.avatar.classList.contains('_coral-Shell-user-avatar')).to.be.true;
      });

      it('should set the new avatar', function() {
        var user = helpers.build('<coral-shell-user avatar="http://wwwimages.adobe.com/content/dam/Adobe/en/leaders/images/138x138/adobe-leaders-shantanu-narayen-138x138.jpg"></coral-shell-user>');
        expect(user.avatar).to.equal('http://wwwimages.adobe.com/content/dam/Adobe/en/leaders/images/138x138/adobe-leaders-shantanu-narayen-138x138.jpg');
        expect(user._elements.avatar.classList.contains('_coral-Shell-user-avatar')).to.be.true;
      });

      it('should allow empty avatar', function() {
        var user = helpers.build('<coral-shell-user avatar=""></coral-shell-user>');
        expect(user.avatar).to.equal('');
        expect(user.hasAttribute('avatar')).to.be.true;
        expect(user._elements.avatar.classList.contains('_coral-Shell-user-avatar')).to.be.true;
      });

      it('should support arbitrary relative URLs', function() {
        var user = helpers.build('<coral-shell-user avatar="image.png"></coral-shell-user>');
        expect(user.avatar).to.equal('image.png');
        expect(user._elements.avatar.icon).to.equal('image.png');
      });

      it('should support arbitrary relative URLs with paths', function() {
        var user = helpers.build('<coral-shell-user avatar="../image.png"></coral-shell-user>');
        expect(user.avatar).to.equal('../image.png');
        expect(user._elements.avatar.icon).to.equal('../image.png');
      });

      it('should support root relative URLs', function() {
        var user = helpers.build('<coral-shell-user avatar="/image.png"></coral-shell-user>');
        expect(user.avatar).to.equal('/image.png');
        expect(user._elements.avatar.icon).to.equal('/image.png');
      });

      it('should support arbitrary absolute URLs', function() {
        var user = helpers.build('<coral-shell-user avatar="http://localhost/image.png"></coral-shell-user>');
        expect(user.avatar).to.equal('http://localhost/image.png');
        expect(user._elements.avatar.icon).to.equal('http://localhost/image.png');
      });
    });
  });
});
