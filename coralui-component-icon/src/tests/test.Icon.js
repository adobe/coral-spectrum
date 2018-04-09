import {helpers} from '../../../coralui-util/src/tests/helpers';
import {Icon} from '../../../coralui-component-icon';

describe('Icon', function() {
  const hasSVGIcon = (el, icon, ignoreCapitalize) => {
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
    
    if (el._elements.svg && el.contains(el._elements.svg)) {
      const iconName = ignoreCapitalize ? icon : capitalize(icon);
      return el._elements.svg.querySelector('use').href.baseVal.endsWith(iconName);
    }
    
    return false;
  };
  
  describe('Namespace', function() {
    it('should define the sizes in an enum', function() {
      expect(Icon.size).to.exist;
      expect(Icon.size.EXTRA_EXTRA_SMALL).to.equal('XXS');
      expect(Icon.size.EXTRA_SMALL).to.equal('XS');
      expect(Icon.size.SMALL).to.equal('S');
      expect(Icon.size.MEDIUM).to.equal('M');
      expect(Icon.size.LARGE).to.equal('L');
      expect(Icon.size.EXTRA_LARGE).to.equal('XL');
      expect(Icon.size.EXTRA_EXTRA_LARGE).to.equal('XXL');
      expect(Object.keys(Icon.size).length).to.equal(7);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var icon = helpers.build(new Icon());
      expect(icon.classList.contains('_coral-Icon')).to.be.true;
      expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
    });

    it('should be possible using createElement', function() {
      var icon = helpers.build(document.createElement('coral-icon'));
      expect(icon.classList.contains('_coral-Icon')).to.be.true;
      expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
    });

    it('should be possible using markup', function() {
      var icon = helpers.build('<coral-icon></coral-icon>');
      expect(icon.classList.contains('_coral-Icon')).to.be.true;
      expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
    });

    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-icon icon="add" size="L"></coral-icon>');
    });
  
    it('should be possible to clone an image icon using markup', function() {
      helpers.cloneComponent('<coral-icon icon="http://via.placeholder.com/150x150" size="L"></coral-icon>');
    });

    it('should be possible to clone using js', function() {
      var icon = new Icon();
      icon.icon = 'add';
      icon.size = 'L';
      helpers.cloneComponent(icon);
    });
  });

  describe('Markup', function() {

    describe('#icon', function() {

      it('should be empty string initially', function() {
        var icon = helpers.build('<coral-icon></coral-icon>');
        expect(icon.classList.contains('_coral-Icon')).to.be.true;
        expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
        expect(icon.icon).to.equal('');
      });

      it('should set the new icon', function() {
        var icon = helpers.build('<coral-icon icon="add"></coral-icon>');
        expect(icon.icon).to.equal('add');
        expect(icon.getAttribute('icon')).to.equal('add');
        expect(icon.size).to.equal(Icon.size.SMALL);
        expect(hasSVGIcon(icon, 'add')).to.be.true;
      });

      it('should support arbitrary relative URLs', function() {
        var icon = helpers.build('<coral-icon icon="image.png"></coral-icon>');
        expect(icon.icon).to.equal('image.png');
        expect(icon._elements.image).to.not.equal(undefined);
        expect(icon._elements.image.getAttribute('src')).to.equal('image.png');
      });

      it('should support arbitrary relative URLs with paths', function() {
        var icon = helpers.build('<coral-icon icon="../image.png"></coral-icon>');
        expect(icon.icon).to.equal('../image.png');
        expect(icon._elements.image).to.not.equal(undefined);
        expect(icon._elements.image.getAttribute('src')).to.equal('../image.png');
      });

      it('should support root relative URLs', function() {
        var icon = helpers.build('<coral-icon icon="/image.png"></coral-icon>');
        expect(icon.icon).to.equal('/image.png');
        expect(icon._elements.image).to.not.equal(undefined);
        expect(icon._elements.image.getAttribute('src')).to.equal('/image.png');
      });

      it('should support arbitrary absolute URLs', function() {
        var icon = helpers.build('<coral-icon icon="http://localhost/image.png"></coral-icon>');
        expect(icon.icon).to.equal('http://localhost/image.png');
        expect(icon._elements.image).to.not.equal(undefined);
        expect(icon._elements.image.getAttribute('src')).to.equal('http://localhost/image.png');
      });
    });

    describe('#size', function() {
      it('should be initially Icon.size.SMALL', function() {
        var icon = helpers.build('<coral-icon></coral-icon>');
        expect(icon.size).to.equal(Icon.size.SMALL);
        expect(icon.hasAttribute('size')).to.be.true;
      });

      it('should set the new size', function() {
        var icon = helpers.build('<coral-icon size="M"></coral-icon>');
        expect(icon.size).to.equal('M');
        expect(icon.size).to.equal(Icon.size.MEDIUM);
        expect(icon.getAttribute('size')).to.equal('M');
        expect(icon.classList.contains('_coral-Icon--sizeM')).to.be.true;
      });

      it('should default empty to default', function() {
        var icon = helpers.build('<coral-icon size=""></coral-icon>');
        expect(icon.size).to.equal(Icon.size.SMALL);
        expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
      });

      it('should default invalid values to default', function() {
        var icon = helpers.build('<coral-icon size="megalarge"></coral-icon>');
        expect(icon.size).to.equal(Icon.size.SMALL);
        expect(icon.getAttribute('size')).to.equal(Icon.size.SMALL);
        expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
      });

      it('should accept lowercase values', function() {
        var icon = helpers.build('<coral-icon size="l"></coral-icon>');
        expect(icon.size).to.equal(Icon.size.LARGE);
        expect(icon.getAttribute('size')).to.equal(Icon.size.LARGE);
        expect(icon.classList.contains('_coral-Icon--sizeL')).to.be.true;
      });
    });
  });

  describe('API', function() {

    let icon;
    beforeEach(() => {
      icon = helpers.build(new Icon());
    });
  
    afterEach(() => {
      icon = null;
    });
    
    describe('#icon', function() {
      it('should default to null', function() {
        expect(icon.icon).to.equal('');
        expect(icon.classList.contains('_coral-Icon')).to.be.true;
        expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
        expect(icon.innerHTML.trim()).to.equal('');
      });

      it('should set the new icon', function() {
        icon.icon = 'add';

        expect(icon.hasAttribute('icon')).to.be.true;
        expect(hasSVGIcon(icon, 'add')).to.be.true;
      });

      it('should trim the value', function() {
        icon.icon = ' add ';

        expect(icon.hasAttribute('icon')).to.be.true;
        expect(hasSVGIcon(icon, 'add')).to.be.true;
      });

      it('should convert everything to a string', function() {
        icon.icon = 5;
        expect(icon.icon).to.equal('5');
        icon.icon = false;
        expect(icon.icon).to.equal('false');
        icon.icon = true;
        expect(icon.icon).to.equal('true');

        expect(icon.hasAttribute('icon')).to.be.true;
        expect(hasSVGIcon(icon, 'true')).to.be.true;
      });

      it('should set with an attribute', function() {
        icon.setAttribute('icon', 'add');

        expect(icon.getAttribute('icon')).to.equal('add');
        expect(hasSVGIcon(icon, 'add')).to.be.true;
      });

      it('should not set multiple SVG icons', function() {
        icon.icon = 'adobeSocial';
        icon.icon = 'add';
  
        expect(hasSVGIcon(icon, 'add')).to.be.true;
        expect(icon.querySelectorAll('svg').length).to.equal(1);
      });

      it('should remove the icon with null', function() {
        icon.icon = 'add';
  
        expect(hasSVGIcon(icon, 'add')).to.be.true;

        icon.icon = null;

        expect(icon.icon).to.equal('');
        expect(hasSVGIcon(icon, 'add')).to.be.false;
      });

      it('should remove the icon with undefined', function() {
        icon.icon = 'add';
  
        expect(hasSVGIcon(icon, 'add')).to.be.true;

        icon.icon = undefined;

        expect(icon.icon).to.equal('');
        expect(hasSVGIcon(icon, 'add')).to.be.false;
      });

      it('should remove the icon with empty string', function() {
        icon.icon = 'add';
  
        expect(hasSVGIcon(icon, 'add')).to.be.true;

        icon.icon = '';

        expect(icon.icon).to.equal('');
        expect(hasSVGIcon(icon, 'add')).to.be.false;
      });

      it('should remove the icon when the attribute is removed', function() {
        icon.setAttribute('icon', 'add');

        expect(icon.getAttribute('icon')).to.equal('add');
        expect(hasSVGIcon(icon, 'add')).to.be.true;

        icon.removeAttribute('icon');

        expect(icon.icon).to.equal('');
        expect(hasSVGIcon(icon, 'add')).to.be.false;
      });
      
      it('should support SVG icon Id', function() {
        icon.icon = 'spectrum-css-icon-SearchClear';
        expect(icon.icon).to.equal('spectrum-css-icon-SearchClear');
        expect(hasSVGIcon(icon, 'spectrum-css-icon-SearchClear')).to.be.false;
      });
    });

    describe('#size', function() {

      it('should default to Icon.size.SMALL', function() {
        expect(icon.size).to.equal(Icon.size.SMALL);
      });

      it('should set the new size', function() {
        icon.size = Icon.size.LARGE;
        expect(icon.size).to.equal(Icon.size.LARGE);

        expect(icon.classList.contains('_coral-Icon--sizeL')).to.be.true;
      });

      it('should accept lowercase values', function() {
        icon.size = Icon.size.LARGE.toLowerCase();
        expect(icon.size).to.equal(Icon.size.LARGE);

        expect(icon.classList.contains('_coral-Icon--sizeL')).to.be.true;
      });
      
      it('should be set with an attribute', function() {
        icon.setAttribute('size', Icon.size.LARGE);
        expect(icon.size).to.equal(Icon.size.LARGE);

        expect(icon.getAttribute('size')).to.equal('L');
        expect(icon.classList.contains('_coral-Icon--sizeL')).to.be.true;
      });

      it('should discard values not part of the enum', function() {
        // this value will be accepted
        icon.size = 'XS';
        // all these will be discarded
        icon.size = 'megalarge';
        icon.size = null;
        icon.size = -1;
        // Fallbacks to default enum which is SMALL
        expect(icon.size).to.equal(Icon.size.SMALL);
        expect(icon.classList.contains('_coral-Icon--sizeS')).to.be.true;
      });

      it('should discard unknown attribute', function() {
        icon.setAttribute('size', 'megalarge');
        // Fallbacks to default enum which is SMALL
        expect(icon.getAttribute('size')).to.equal(Icon.size.SMALL);
      });

      it('should not remove unknown size classes', function() {
        icon.classList.add('_coral-Icon--sizeME');

        icon.size = 'XS';
        expect(icon.size).to.equal(Icon.size.EXTRA_SMALL);

        expect(icon.classList.contains('_coral-Icon--sizeXS')).to.be.true;
        expect(icon.classList.contains('_coral-Icon--sizeME')).to.be.true;
      });
      
      it('should update the icon if the size changed', function() {
        icon.icon = 'add';
        expect(icon._elements.svg.querySelector('use').href.baseVal.indexOf('18') !== -1).to.be.true;
  
        icon.size = 'XXL';
  
        expect(icon._elements.svg.querySelector('use').href.baseVal.indexOf('24') !== -1).to.be.true;
      });
    });
  });
  
  describe('Implementation details', function() {
    describe('alt', function() {
      it('should add an aria-label equal to the value of the alt property', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'add';
        icon.alt = 'Add Item';
    
        expect(icon.alt).to.equal('Add Item');
        expect(icon.getAttribute('aria-label')).to.equal('Add Item');
      });
  
      it('should add an aria-label equal to the value of the icon property when not set and when no title attribute is present', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'add';
    
        expect(icon.getAttribute('aria-label')).to.equal('add');
      });
  
      it('should add an aria-label equal to the value of the title attribute property when not set and when a title attribute is present', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'add';
        icon.title = 'Add Item';
    
        expect(icon.getAttribute('aria-label')).to.equal('Add Item');
      });
  
      it('should have no aria-label attribute when explicitly set to an empty string', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'add';
        icon.title = 'Add Item';
        icon.alt = '';
    
        expect(icon.hasAttribute('aria-label')).to.be.false;
      });
  
      it('should have role="img" when icon property is not a URL', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'add';
        icon.alt = 'Add Item';
    
        expect(icon.getAttribute('role')).to.equal('img');
      });
  
      it('should have role="presentation" when icon property is a URL', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'image.png';
    
        expect(icon.getAttribute('role')).to.equal('presentation');
        expect(icon._elements.image.getAttribute('alt')).to.equal('');
      });
  
      it('should update alt text on child image when icon property is a URL', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'image.png';
        icon.alt = 'Add Item';
    
        expect(icon.getAttribute('role')).to.equal('presentation');
        expect(icon._elements.image.getAttribute('alt')).to.equal('Add Item');
      });
  
      it('should set alt text on child image to value of title attribute empty string when icon property is a URL and alt is null', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'image.png';
        icon.title = 'Add Item';
    
        expect(icon.getAttribute('role')).to.equal('presentation');
        expect(icon._elements.image.getAttribute('alt')).to.equal(icon.title);
      });
  
      it('should set alt text on child image to an empty string when icon property is a URL and alt is an empty string', function() {
        var icon = helpers.build(new Icon());
    
        icon.icon = 'image.png';
        icon.title = 'Add Item';
    
        expect(icon.getAttribute('role')).to.equal('presentation');
        expect(icon._elements.image.getAttribute('alt')).to.equal(icon.title);
    
        // By setting alt = '' explicitly, we override the default behavior and instead use an empty string for alt text.
        icon.alt = '';
        expect(icon._elements.image.getAttribute('alt')).to.equal('');
      });
    });
    
    describe('SVG', function() {
      it('should render the SVG markup', function() {
        helpers.target.innerHTML = Icon._renderSVG('testId', ['testClass']);
        
        const svg = helpers.target.querySelector('svg');
        expect(svg.classList.contains('testClass')).to.be.true;
        expect(svg.querySelector('use').href.baseVal.indexOf('testId') !== -1).to.be.true;
      });
    });
    
    describe('Compat', function() {
      let warn;
      let called = 0;
      
      beforeEach(() => {
        warn = console.warn;
        
        console.warn = function() {
          called++;
        };
      });
      
      afterEach(() => {
        console.warn = warn;
        called = 0;
      });
      
      it('should capitalize the icon name to match to the new icon name', function() {
        const el = helpers.build(new Icon());
        el.icon = 'add';
        expect(hasSVGIcon(el, 'Add', true)).to.be.true;
        expect(called).to.equal(0);
      });
      
      it('should map the old icon name to the new icon name', function() {
        const el = helpers.build(new Icon());
        el.icon = 'adobe';
        expect(hasSVGIcon(el, 'AdobeLogo', true)).to.be.true;
        expect(called).to.equal(1);
      });
  
      it('should map to the new icon name based on the light theme', function() {
        const container = document.createElement('div');
        const el = new Icon();
        container.appendChild(el);
        
        container.classList.add('coral--light');
        
        el.icon = 'userCircleColor';
  
        helpers.target.appendChild(container);
  
        expect(hasSVGIcon(el, 'User-CircleColorLight', true)).to.be.true;
        expect(called).to.equal(1);
      });
  
      it('should map to the new icon name based on the dark theme', function() {
        const container = document.createElement('div');
        const el = new Icon();
        container.appendChild(el);
    
        container.classList.add('coral--dark');
    
        el.icon = 'userCircleColor';
  
        helpers.target.appendChild(container);
    
        expect(hasSVGIcon(el, 'User-CircleColorDark', true)).to.be.true;
        expect(called).to.equal(1);
      });
  
      it('should map to the new light icon by default if no theme specified', function() {
        const container = document.createElement('div');
        const el = new Icon();
        container.appendChild(el);
    
        el.icon = 'userCircleColor';
        
        helpers.target.appendChild(container);
    
        expect(hasSVGIcon(el, 'User-CircleColorLight', true)).to.be.true;
        expect(called).to.equal(1);
      });
    });
  });
});
