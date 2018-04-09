import {helpers} from '../../../coralui-util/src/tests/helpers';
import {Shell} from '../../../coralui-component-shell';

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

    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-shell-user>');
    });

    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Shell.User());
    });
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
