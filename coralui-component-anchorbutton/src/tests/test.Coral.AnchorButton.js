describe('Coral.AnchorButton', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('AnchorButton');
      expect(Coral.AnchorButton).to.have.property('Label');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var button = helpers.build(new Coral.AnchorButton());
      expect(button.classList.contains('coral3-Button')).to.be.true;
      expect(button.hasAttribute('variant')).to.be.true;
      expect(button.hasAttribute('block')).to.be.false;
      expect(button.hasAttribute('label')).to.be.false;
      expect(button.hasAttribute('icon')).to.be.false;
      expect(button.classList.contains('coral3-Button')).to.be.true;
    });

    it('should be possible using createElement', function() {
      var button = helpers.build(document.createElement('a', 'coral-anchorbutton'));
      expect(button.classList.contains('coral3-Button')).to.be.true;
      expect(button.classList.contains('coral3-Button--secondary')).to.be.true;
      expect(button.hasAttribute('variant')).to.be.true;
      expect(button.hasAttribute('block')).to.be.false;
      expect(button.hasAttribute('label')).to.be.false;
      expect(button.hasAttribute('icon')).to.be.false;
    });

    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<a is="coral-anchorbutton">Add</button>');
    });

    it('should be possible to clone a button with size attribute using markup', function() {
      helpers.cloneComponent('<a is="coral-anchorbutton" size="L">Add</button>');
    });

    it('should be possible to clone a button with icon attribute using markup', function() {
      helpers.cloneComponent('<a is="coral-anchorbutton" icon="add">Add</button>');
    });

    it('should be possible to clone a button with icon and size attribute using markup', function() {
      helpers.cloneComponent('<a is="coral-anchorbutton" icon="add" size"L">Add</button>');
    });

    it('should be possible to clone a button using js', function() {
      var button = new Coral.AnchorButton();
      button.label.textContent = 'Add Button';
      helpers.cloneComponent(button);
    });

    it('should be possible to clone a button with a specific size using js', function() {
      var button = new Coral.AnchorButton();
      button.size = 'L';
      button.label.textContent = 'Add Button';
      helpers.cloneComponent(button);
    });

    it('should be possible to clone a button with an icon using js', function() {
      var button = new Coral.AnchorButton();
      button.icon = 'add';
      button.label.textContent = 'Add Button';
      helpers.cloneComponent(button);
    });
  });

  describe('Markup', function() {

    describe('#label', function() {

      it('should be initially empty', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" hidden></a>');
        expect(button.label.innerHTML).to.equal('');
        expect(button.hasAttribute('label')).to.be.false;
        expect(button.textContent).to.equal('');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should use the textContent as the initial value', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#">Button</button>');
        expect(button.label.innerHTML).to.equal('Button');

        expect(button.hasAttribute('label')).to.be.false;
        expect(button.textContent).to.equal('Button');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should resync the icon once the label is modified', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" icon="add">Add</button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon')).to.be.true;
        
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().parentNode).not.to.be.null;

        button.label.innerHTML = 'Hello';
        expect(button.label.innerHTML).to.equal('Hello');
        expect(button.textContent).to.equal('Hello');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      }); // end it
  
      it('should change to square if the label is removed', function() {
        const button = helpers.build('<a is="coral-anchorbutton" icon="add">Add</a>');
    
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().parentNode).not.to.be.null;
    
        button.label.textContent = '';
    
        expect(button.textContent).to.equal('');
        expect(button.classList.contains('coral3-Button')).to.be.true;
        expect(button.icon).to.equal('add');
      }); // end it
  
      it('should remove square if the label is added', function() {
        const button = helpers.build('<a is="coral-anchorbutton" icon="add"></a>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().parentNode).not.to.be.null;
    
        button.label.textContent = 'Add';
    
        expect(button.textContent).to.equal('Add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
        expect(button.icon).to.equal('add');
      }); // end it
    }); // end describe label

    describe('#icon', function() {

      it('should be initially empty', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#">Test</a>');
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set the new icon', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" icon="add"></a>');
        expect(button.icon).to.equal('add');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button.textContent).to.equal('');
        
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should not be square when there is a label', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" icon="add">Add</button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button.textContent).to.equal('Add');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should not create a new icon if the value is updated', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" icon="add">Add</button>');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button.icon).to.equal('add');

        // icon is updated
        button.icon = 'share';
        button.label.innerHTML = '';
        
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('share');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should hide the icon element once the icon is set to empty string', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" icon="add"></a>');
        expect(button.icon).to.equal('add');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button._getIconElement().parentNode).not.to.be.null;
        
        // icon is updated
        button.icon = '';
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });
    }); // end describe icon

    describe('#iconsize', function() {

      it('should be initially the default', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#"></a>');
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
        expect(button.hasAttribute('iconsize')).to.be.false;
      });

      it('should set the new iconsize', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" iconsize="L" icon="add"></a>');
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        expect(button.getAttribute('iconsize')).to.equal('L');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
      });

      it('should discard invalid iconsize', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" iconsize="megalarge" icon="add"></a>');
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
        expect(button.getAttribute('iconsize')).to.equal('megalarge');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.SMALL);
      });
    });

    describe('#size', function() {

      it('should default to medium', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#"></a>');
        expect(button.size).to.equal(Coral.AnchorButton.size.MEDIUM);
        expect(button.classList.contains('coral3-Button--large')).to.be.false;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set the size modifier', function() {
        const button = helpers.build('<a is="coral-anchorbutton" size="L" href="#"></a>');
        expect(button.size).to.equal(Coral.AnchorButton.size.LARGE);
        expect(button.classList.contains('coral3-Button--large')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });
    });

    describe('#block', function() {

      it('should be initially false', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#"></a>');
        expect(button.block).to.be.false;
        expect(button.hasAttribute('block')).to.be.false;
        expect(button.classList.contains('coral3-Button--block')).to.be.false;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set the size modifier', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" block></a>');
        expect(button.block).to.be.true;
        expect(button.hasAttribute('block')).to.be.true;
        expect(button.classList.contains('coral3-Button--block')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should behave like an attribute boolean', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" block="false"></a>');
        expect(button.block).to.be.true;
        expect(button.hasAttribute('block')).to.be.true;
        expect(button.classList.contains('coral3-Button--block')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });
    });

    describe('#variant', function() {

      it('should be initially Coral.AnchorButton.variant.DEFAULT', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#"></a>');
        expect(button.variant).to.equal(Coral.AnchorButton.variant.DEFAULT);
        expect(button.hasAttribute('variant')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set the new variant', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" variant="primary"></a>');
        expect(button.variant).to.equal('primary');
        expect(button.variant).to.equal(Coral.AnchorButton.variant.PRIMARY);
        expect(button.getAttribute('variant')).to.equal('primary');
        expect(button.classList.contains('coral3-Button--primary')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should fall back to default variant on empty variant', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" variant=""></a>');
        expect(button.variant).to.equal(Coral.AnchorButton.variant.DEFAULT);
        expect(button.getAttribute('variant')).to.equal(Coral.AnchorButton.variant.DEFAULT);
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should fall back to default variant for invalid variant', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" variant="invalidvariant"></a>');
        expect(button.variant).to.equal(Coral.AnchorButton.variant.DEFAULT);
        expect(button.getAttribute('variant')).to.equal(Coral.AnchorButton.variant.DEFAULT);
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should remove variant classnames when variant changes', function() {
        const button = helpers.build('<a is="coral-anchorbutton" href="#" variant="primary"></a>');
        expect(button.variant).to.equal(Coral.AnchorButton.variant.PRIMARY);
        expect(button.classList.contains('coral3-Button--primary')).to.be.true;

        button.variant = Coral.AnchorButton.variant.WARNING;
        expect(button.classList.contains('coral3-Button--warning')).to.be.true;
        expect(button.classList.contains('coral3-Button--primary')).to.be.false;
      });
    });
  
    it('should accept all attributes at once', function() {
      const button = helpers.build('<a is="coral-anchorbutton" href="#" icon="share" variant="primary" size="L" block>Share</a>');
    
      expect(button.size).to.equal(Coral.AnchorButton.size.LARGE);
      expect(button.block).to.be.true;
      expect(button.variant).to.equal(Coral.AnchorButton.variant.PRIMARY);
      expect(button.icon, 'icon value').to.equal('share');
      expect(button.label.innerHTML, 'innerHTML').to.equal('Share');
      expect(button.classList.contains('coral3-Button--large')).to.be.true;
      expect(button.classList.contains('coral3-Button--block')).to.be.true;
      expect(button.classList.contains('coral3-Button--primary')).to.be.true;
      expect(button._getIconElement()).to.exist;
      expect(button._getIconElement().icon, 'elements.icon.icon').to.equal('share');
      expect(button.textContent, 'text content').to.equal('Share');
      expect(button.classList.contains('coral3-Button')).to.be.true;
    }); // end variant
  }); // end describe markup

  describe('API', function() {

    describe('#icon', function() {

      it('should default to null', function() {
        var button = new Coral.AnchorButton();
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });

      it('should set the new icon', function() {
        var button = new Coral.AnchorButton();
        button.icon = 'add';
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button._getIconElement().classList.contains('coral3-Icon--add')).to.be.true;
      });

      it('should convert everything to string', function() {
        var button = new Coral.AnchorButton();
        button.icon = 5;
        expect(button.icon).to.equal('5');
        button.icon = false;
        expect(button.icon).to.equal('false');
        button.icon = true;
        expect(button.icon).to.equal('true');
        expect(button.icon).to.equal('true');
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button._getIconElement()).not.to.be.null;
      });

      it('should remove the icon with empty string', function() {
        var button = new Coral.AnchorButton();
        button.icon = 'add';
        expect(button._getIconElement().icon).to.equal('add');
        button.icon = '';
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });

      it('should remove the icon with null', function() {
        var button = new Coral.AnchorButton();
        button.icon = 'add';
        expect(button._getIconElement().icon).to.equal('add');
        button.icon = null;
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });

      it('should remove the icon with undefined', function() {
        var button = new Coral.AnchorButton();
        button.icon = 'add';
        
        expect(button._getIconElement().icon).to.equal('add');
        button.icon = undefined;
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });
    });

    describe('#iconSize', function() {

      it('should default to Coral.Icon.size.SMALL', function() {
        var button = new Coral.AnchorButton();
        button.icon = 'add';
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.SMALL);
      });

      it('should sync the iconSize correctly', function() {
        var button = new Coral.AnchorButton();
        button.iconSize = Coral.Icon.size.LARGE;
        button.icon = 'add';
        
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
        expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
      });

      it('should set the new size even if icon is not set', function() {
        var button = new Coral.AnchorButton();

        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
      });

      it('should set the new size', function() {
        var button = new Coral.AnchorButton();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
      });

      it('should accept lowercase values', function() {
        var button = new Coral.AnchorButton();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE.toLowerCase();
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
        expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
      });

      it('should be set with an attribute', function() {
        var button = new Coral.AnchorButton();

        button.icon = 'add';

        button.setAttribute('iconsize', Coral.Icon.size.LARGE);
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        expect(button.getAttribute('iconsize')).to.equal('L');
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
      });

      it('should discard values not part of the enum', function() {
        var button = new Coral.AnchorButton();

        // this value will be accepted
        button.iconSize = 'XS';
        // all these will be discarded
        button.iconSize = 'megalarge';
        button.iconSize = null;
        button.iconSize = -1;
        // Fallbacks to default enum which is SMALL
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
      });

      it('should discard unknonwn attribute', function() {
        var button = new Coral.AnchorButton();

        button.setAttribute('size', 'megalarge');
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
      });

      it('should keep the size after the icon is changed', function() {
        var button = new Coral.AnchorButton();

        button.icon = 'add';
        button.iconSize = 'L';
        expect(button._getIconElement().icon).to.equal('add');
        expect(button._getIconElement().size).to.equal('L');
        
        button.icon = 'delete';
        expect(button.icon).to.equal('delete');
        expect(button.iconSize).to.equal('L');
        expect(button._getIconElement().size).to.equal('L');
        expect(button._getIconElement().icon).to.equal('delete');
        expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
      });
    });
  });

  describe('Accessibility', function() {
    it('should have aria-disabled, role and tabindex set by default', function() {
      const button = helpers.build('<a is="coral-anchorbutton"></a>');
      expect(button.hasAttribute('role')).to.be.true;
      expect(button.hasAttribute('tabindex')).to.be.true;
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.getAttribute('tabindex')).to.equal('0');
      expect(button.getAttribute('aria-disabled')).to.equal('false');
    });

    it('should have tabindex set to -1 while disabled', function() {
      const button = helpers.build('<a is="coral-anchorbutton" disabled></a>');
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.getAttribute('tabindex')).to.equal('-1');
      expect(button.getAttribute('aria-disabled')).to.equal('true');
    });

    it('should set is-select on keyDown', function() {
      var button = helpers.build(new Coral.AnchorButton());
      
      expect(button.classList.contains('coral3-Button')).to.be.true;
      expect(button.classList.contains('is-selected')).to.be.false;

      helpers.keydown('space', button);
      expect(button.classList.contains('is-selected')).to.be.true;
    });

    it('should not set is-select on keyDown', function() {
      var button = helpers.build(new Coral.AnchorButton());

      helpers.keyup('space', button);
      expect(button.classList.contains('is-selected')).to.be.false;
    });
  });

  describe('Event', function() {
    // instantiated anchorbutton element
    var anchorbutton;
    var keyDownSpy;
    var keyUpSpy;
    var clickSpy;
    var preventSpy;

    beforeEach(function() {
      keyDownSpy = sinon.spy();
      keyUpSpy = sinon.spy();
      clickSpy = sinon.spy();
      preventSpy = sinon.spy();
      
      anchorbutton = helpers.target.appendChild(new Coral.AnchorButton());

      // adds the required listeners
      anchorbutton.on('keyup', keyUpSpy);
      anchorbutton.on('keydown', keyDownSpy);

      // clickSpy and preventSpy for event bubble
      Coral.events.on('click', function(event) {
        if (event.target instanceof Coral.AnchorButton) {
          clickSpy();
          if (event.defaultPrevented) {
            preventSpy();
          }
        }
      });

      expect(keyDownSpy.callCount).to.equal(0);
      expect(keyUpSpy.callCount).to.equal(0);
      expect(clickSpy.callCount).to.equal(0);
      expect(preventSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      Coral.events.off('click');
      helpers.target.removeChild(anchorbutton);
      anchorbutton = null;
    });

    it('should trigger on keydown', function() {
      helpers.keydown('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(1);
      expect(keyUpSpy.callCount).to.equal(0);
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);

      expect(anchorbutton.classList.contains('is-selected')).to.be.true;
    });

    it('should trigger on keyup', function() {
      helpers.keyup('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(0);
      expect(keyUpSpy.callCount).to.equal(1);
      expect(clickSpy.callCount).to.equal(0);
      expect(preventSpy.callCount).to.equal(0);
    });

    it('should trigger on keypressed', function() {
      helpers.keypress('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(1);
      expect(keyUpSpy.callCount).to.equal(1);
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);
    });

    it('should prevent event from bubbling while disabled', function() {
      expect(anchorbutton.disabled).to.be.false;
      anchorbutton.click();
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);
      anchorbutton.disabled = true;
      anchorbutton.click();
      expect(clickSpy.callCount).to.equal(2);
      expect(preventSpy.callCount).to.equal(1);
    });
  });
});
