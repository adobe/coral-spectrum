describe('Coral.Button', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Button');
      expect(Coral.Button).to.have.property('Label');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Button.variant).to.exist;
      expect(Coral.Button.variant.CTA).to.equal('cta');
      expect(Coral.Button.variant.SECONDARY).to.equal('secondary');
      expect(Coral.Button.variant.PRIMARY).to.equal('primary');
      expect(Coral.Button.variant.WARNING).to.equal('warning');
      expect(Coral.Button.variant.QUIET).to.equal('quiet');
      expect(Coral.Button.variant.MINIMAL).to.equal('minimal');
      expect(Coral.Button.variant.DEFAULT).to.equal('secondary');
      expect(Coral.Button.variant.ICON).to.equal('icon');
      expect(Coral.Button.variant._CUSTOM).to.equal('_custom');
      expect(Object.keys(Coral.Button.variant).length).to.equal(9);
    });

    it('should define the iconPositions in an enum', function() {
      expect(Coral.Button.iconPosition).to.exist;
      expect(Coral.Button.iconPosition.LEFT).to.equal('left');
      expect(Coral.Button.iconPosition.RIGHT).to.equal('right');
      expect(Object.keys(Coral.Button.iconPosition).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var button = helpers.build(new Coral.Button());
      expect(button.classList.contains('coral3-Button')).to.be.true;
      expect(button.hasAttribute('block')).to.be.false;
      expect(button.hasAttribute('icon')).to.be.false;
      expect(button.hasAttribute('variant')).to.be.true;
    });

    it('should not blow away loose HTML', function() {
      const button = helpers.build('<button is="coral-button"><span>Add</span></button>');
      expect(button.label.innerHTML).to.equal('<span>Add</span>');
    });

    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<button is="coral-button">Add</button>');
    });

    it('should be possible to clone a button with size attribute using markup', function() {
      helpers.cloneComponent('<button is="coral-button" size="L">Add</button>');
    });

    it('should be possible to clone a button with icon attribute using markup', function() {
      helpers.cloneComponent('<button is="coral-button" icon="add">Add</button>');
    });

    it('should be possible to clone a button with icon and size attribute using markup', function() {
      helpers.cloneComponent('<button is="coral-button" icon="add" size"L">Add</button>');
    });

    it('should be possible to clone a button with quiet attribute using markup', function() {
      helpers.cloneComponent('<button is="coral-button" variant="quiet">Add</button>');
    });

    it('should be possible to clone a button using js', function() {
      var button = new Coral.Button();
      button.label.textContent = 'Add Button';
      helpers.cloneComponent(button);
    });

    it('should be possible to clone a button with a specific size using js', function() {
      var button = new Coral.Button();
      button.size = 'L';
      button.label.textContent = 'Add Button';
      helpers.cloneComponent(button);
    });

    it('should be possible to clone a button with an icon using js', function() {
      var button = new Coral.Button();
      button.icon = 'add';
      button.label.textContent = 'Add Button';
      helpers.cloneComponent(button);
    });

    it('should be possible to clone a button with a variant using js', function() {
      var button = new Coral.Button();
      button.variant = 'quiet';
      button.label.textContent = 'Quiet Button';
      helpers.cloneComponent(button);
    });
  });

  describe('Markup', function() {

    describe('#label', function() {

      it('should be initially empty', function() {
        const button = helpers.build('<button is="coral-button" hidden></button>');
        expect(button.label.textContent).to.equal('', 'label.textContent');
        expect(button.textContent).to.equal('');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should use the existing nodes as the initial label value', function() {
        const button = helpers.build('<button is="coral-button">Button</button>');
        expect(button.label.innerHTML).to.equal('Button');
      });

      it('should resync the icon once the label is modified', function() {
        const button = helpers.build('<button is="coral-button" icon="add">Add</button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().parentNode).not.to.be.null;

        button.label.textContent = 'Hello';
        expect(button.label.textContent).to.equal('Hello');
        expect(button.classList.contains('coral3-Button')).to.be.true;
        expect(button.icon).to.equal('add');
      });

      it('should change to square if the label is removed', function() {
        const button = helpers.build('<button is="coral-button" icon="add">Add</button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().parentNode).not.to.be.null;

        button.label.textContent = '';
        expect(button.label.textContent).to.equal('');
        expect(button.classList.contains('coral3-Button')).to.be.true;
        expect(button.icon).to.equal('add');
      });

      it('should remove square if the label is added', function() {
        const button = helpers.build('<button is="coral-button" icon="add"></button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().parentNode).not.to.be.null;

        button.label.textContent = 'Add';
        expect(button.label.textContent).to.equal('Add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
        expect(button.icon).to.equal('add');
      });
    });

    describe('#icon', function() {

      it('should be initially empty', function() {
        const button = helpers.build('<button is="coral-button"></button>');
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set a new icon', function() {
        const button = helpers.build('<button is="coral-button" icon="add"></button>');
        expect(button.icon).to.equal('add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button.label.textContent).to.equal('');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should not be square when there is a label', function() {
        const button = helpers.build('<button is="coral-button" icon="add">Add</button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button.label.textContent).to.equal('Add');
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should have default icon alt text when there is no label', function() {
        const button = helpers.build('<button is="coral-button" icon="add"></button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button._elements.icon).to.exist;
        expect(button._elements.icon.icon).to.equal('add');
        expect(button._elements.icon.alt).to.equal(null);
        expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should not have icon alt text when there is a label', function() {
        const button = helpers.build('<button is="coral-button" icon="add">Add</button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button.label.textContent).to.equal('Add');
        expect(button._elements.icon).to.exist;
        expect(button._elements.icon.icon).to.equal('add');
        expect(button._elements.icon.alt).to.equal('');
        expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should remove icon alt text if the label is added', function(done) {
        const button = helpers.build('<button is="coral-button" icon="add"></button>');
        expect(button.icon).to.equal('add');
        expect(button.label.innerHTML).to.equal('');
        expect(button.getAttribute('icon')).to.equal('add');
        expect(button._elements.icon).to.exist;
        expect(button._elements.icon.parentNode).not.to.be.null;
        expect(button._elements.icon.alt).to.equal(null);
        expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');

        button.label.textContent = 'Add';
        // Wait for the MO to kick in
        setTimeout(() => {
          expect(button.label.textContent).to.equal('Add');
          expect(button.classList.contains('coral3-Button')).to.be.true;
          expect(button.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
          done();
        });
      });

      it('should restore default icon alt text if the label is removed', function(done) {
        const button = helpers.build('<button is="coral-button" icon="add">Add</button>');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button.icon).to.equal('add');
        expect(button._elements.icon.alt).to.equal('');
        expect(button._elements.icon.getAttribute('aria-label')).to.be.null;

        button.label.innerHTML = '';
        // Wait for the MO to kick in
        setTimeout(() => {
          expect(button.label.textContent).to.equal('');
          expect(button.classList.contains('coral3-Button')).to.be.true;
          expect(button.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');
          done();
        });
      });

      it('should not create a new icon if the value is updated', function(done) {
        const button = helpers.build('<button is="coral-button" icon="add">Add</button>');
        expect(button.label.innerHTML).to.equal('Add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button.icon).to.equal('add');
        expect(button._elements.icon.alt).to.equal('');
        expect(button._elements.icon.getAttribute('aria-label')).to.be.null;

        // icon is updated
        button.icon = 'share';
        button.label.innerHTML = '';
        // Wait for the MO to kick in
        setTimeout(() => {
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('share');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.equal('share');
          expect(button.classList.contains('coral3-Button')).to.be.true;
          done();
        });
      });

      it('should hide the icon element once the icon is set to empty string', function() {
        const button = helpers.build('<button is="coral-button" icon="add"></button>');
        expect(button.icon).to.equal('add');
        expect(button.hasAttribute('icon', 'add')).to.be.true;
        expect(button._getIconElement().parentNode).not.to.be.null;

        button.icon = '';
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });
    }); // end describe icon

    describe('#iconsize', function() {
      it('should be initially the default', function() {
        const button = helpers.build('<button is="coral-button"></button>');
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
        expect(button.hasAttribute('iconsize')).to.be.false;
      });

      it('should set the new iconsize', function() {
        const button = helpers.build('<button is="coral-button" iconsize="L" icon="add"></button>');
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        expect(button.getAttribute('iconsize')).to.equal('L');
        expect(button._getIconElement().icon).to.equal('add');
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
      });

      it('should discard invalid iconsize', function() {
        const button = helpers.build('<button is="coral-button" iconsize="megalarge" icon="add"></button>');
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
        expect(button.hasAttribute('iconsize', 'megalarge')).to.be.true;
        expect(button._getIconElement().icon).to.equal('add');
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });
    });

    describe('#iconposition', function() {
      it('should generate icon per default on left when not defined', function() {
        const button = helpers.build('<button is="coral-button" icon="add"></button>');
        expect(button.iconPosition).to.equal(Coral.Button.iconPosition.LEFT);
        expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
      });

      it('should generate icon on the left when defined in iconposition', function() {
        const button = helpers.build('<button is="coral-button" icon="add" iconposition="left"></button>');
        expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
      });

      it('should generate icon on the right when defined in iconposition', function() {
        const button = helpers.build('<button is="coral-button" icon="add" iconposition="right"></button>');
        expect(button.firstElementChild.tagName).to.equal('CORAL-BUTTON-LABEL');
      });

      it('should move icon on the left iconposition is changed on runtime', function() {
        const button = helpers.build('<button is="coral-button" icon="add" iconposition="RIGHT"></button>');
        button.iconPosition = 'LEFT';
        expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
      });
  
      it('should default to "left" when the attribute is removed', function() {
        const button = helpers.build('<button is="coral-button" icon="add" iconposition="right"></button>');
        button.removeAttribute('iconposition');
        expect(button.iconPosition).to.equal(Coral.Button.iconPosition.LEFT);
        expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
      });
    });

    describe('#size', function() {
      it('should default to medium', function() {
        const button = helpers.build('<button is="coral-button"></button>');
        expect(button.size).to.equal(Coral.Button.size.MEDIUM);
      });

      it('should set the size modifier', function() {
        const button = helpers.build('<button is="coral-button" size="L"></button>');
        expect(button.size).to.equal(Coral.Button.size.LARGE);
      });
    });

    describe('#block', function() {

      it('should be initially false', function() {
        const button = helpers.build('<button is="coral-button"></button>');
        expect(button.block).to.be.false;
        expect(button.hasAttribute('block')).to.be.false;
        expect(button.classList.contains('coral3-Button--block')).to.be.false;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set the size modifier', function() {
        const button = helpers.build('<button is="coral-button" block></button>');
        expect(button.block).to.be.true;
        expect(button.hasAttribute('block')).to.be.true;
        expect(button.classList.contains('coral3-Button--block')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should behave like an attribute boolean', function() {
        const button = helpers.build('<button is="coral-button" block="false"></button>');
        expect(button.block).to.be.true;
        expect(button.hasAttribute('block')).to.be.true;
        expect(button.classList.contains('coral3-Button--block')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });
    });

    describe('#variant', function() {

      it('should be initially Coral.Button.variant.PRIMARY', function() {
        const button = helpers.build('<button is="coral-button"></button>');
        expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
        expect(button.hasAttribute('variant')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should set the new variant', function() {
        const button = helpers.build('<button is="coral-button" variant="cta"></button>');
        expect(button.variant).to.equal('cta');
        expect(button.variant).to.equal(Coral.Button.variant.CTA);
        expect(button.getAttribute('variant')).to.equal(Coral.Button.variant.CTA);
        expect(button.classList.contains('coral3-Button--cta')).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should add the default class if variant is empty', function() {
        const button = helpers.build('<button is="coral-button" variant=""></button>');
        expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
        expect(button.hasAttribute('variant', Coral.Button.variant.PRIMARY)).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should go back to default variant for invalid variant', function() {
        const button = helpers.build('<button is="coral-button" variant="invalidvariant"></button>');
        expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
        expect(button.hasAttribute('variant', Coral.Button.variant.PRIMARY)).to.be.true;
        expect(button.classList.contains('coral3-Button')).to.be.true;
      });

      it('should remove variant classnames when variant changes', function() {
        const button = helpers.build('<button is="coral-button" variant="primary"></button>');
        expect(button.classList.contains('coral3-Button--primary')).to.be.true;

        button.variant = Coral.Button.variant.WARNING;
        expect(button.classList.contains('coral3-Button--warning')).to.be.true;
        expect(button.classList.contains('coral3-Button--primary')).to.be.false;
      });
    });

    describe('#selected', function() {

      it('should default to false', function() {
        const button = helpers.build('<button is="coral-button"></button>');
        expect(button.selected).to.be.false;
        expect(button.classList.contains('is-selected')).to.be.false;
        expect(button.hasAttribute('selected')).to.be.false;
      });

      it('should be settable', function() {
        const button = helpers.build('<button is="coral-button" selected></button>');
        expect(button.selected).to.be.true;
        expect(button.hasAttribute('selected')).to.be.true;
        expect(button.classList.contains('is-selected')).to.be.true;
      });
    });

    it('should accept all attributes at once', function() {
      const button = helpers.build('<button is="coral-button" icon="share" variant="primary" size="L" block>Share</button>');
      expect(button.size).to.equal(Coral.Button.size.LARGE);
      expect(button.block).to.be.true;
      expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
      expect(button.icon).to.equal('share');
      expect(button.classList.contains('coral3-Button--block')).to.be.true;
      expect(button.classList.contains('coral3-Button--primary')).to.be.true;
      expect(button._getIconElement()).to.exist;
      expect(button._getIconElement().icon).to.equal('share');
      expect(button.label.textContent).to.equal('Share');
      expect(button.classList.contains('coral3-Button')).to.be.true;
    }); // end variant
  }); // end describe markup

  describe('API', function() {

    describe('#icon', function() {

      it('should default to empty string', function() {
        var button = new Coral.Button();
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });

      it('should set the new icon', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button._getIconElement().icon).to.equal('add');
      });

      it('should convert everything to string', function() {
        var button = new Coral.Button();
        button.icon = 5;
        expect(button.icon).to.equal('5');

        button.icon = false;
        expect(button.icon).to.equal('false');

        button.icon = true;
        expect(button.icon).to.equal('true');
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button._getIconElement()).not.to.be.null;
        expect(button._getIconElement().icon).to.equal('true');
      });

      it('should remove the icon with empty string', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button._getIconElement().icon).to.equal('add');

        button.icon = '';
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });

      it('should remove the icon with null', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button._getIconElement().icon).to.equal('add');

        button.icon = null;
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });

      it('should remove the icon with undefined', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button._getIconElement().icon).to.equal('add');

        button.icon = undefined;
        expect(button.icon).to.equal('');
        expect(button._getIconElement().parentNode).to.be.null;
      });
    });

    describe('#iconSize', function() {

      it('should default to Coral.Icon.size.EXTRA_SMALL', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should sync the iconSize correctly', function() {
        var button = new Coral.Button();
        button.iconSize = Coral.Icon.size.LARGE;
        button.icon = 'add';
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.LARGE);
        expect(button._getIconElement().classList.contains('coral3-Icon--sizeL')).to.be.true;
      });

      it('should set the new size even if icon is not set', function() {
        var button = new Coral.Button();
        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
      });

      it('should set the new size', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        // Only "EXTRA_SMALL" is currently supported
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should accept lowercase values', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE.toLowerCase();
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        // Only "EXTRA_SMALL" is currently supported
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.EXTRA_SMALL);
        expect(button._getIconElement().classList.contains('coral3-Icon--sizeXS')).to.be.true;
      });

      it('should be set with an attribute', function() {
        var button = new Coral.Button();
        button.icon = 'add';
        button.setAttribute('iconsize', Coral.Icon.size.LARGE);
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
        expect(button.hasAttribute('iconsize', 'L')).to.be.true;
        // Only "EXTRA_SMALL" is currently supported
        expect(button._getIconElement().size).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should discard values not part of the enum', function() {
        var button = new Coral.Button();
        // this value will be accepted
        button.iconSize = 'XS';
        // all these will be discarded
        button.iconSize = 'megalarge';
        button.iconSize = null;
        button.iconSize = -1;
        // Fallbacks to default enum which is EXTRA_SMALL
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should discard unknown attribute', function() {
        var button = new Coral.Button();
        button.setAttribute('size', 'megalarge');
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should keep the size after the icon is changed', function() {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = 'L';

        expect(button._getIconElement().icon).to.equal('add');
        // Only "EXTRA_SMALL" is currently supported
        expect(button._getIconElement().size).to.equal('XS');

        button.icon = 'delete';

        expect(button.icon).to.equal('delete');
        expect(button.iconSize).to.equal('L');
        expect(button._getIconElement().icon).to.equal('delete');
        // Only "EXTRA_SMALL" is currently supported
        expect(button._getIconElement().size).to.equal('XS');
        expect(button._getIconElement().classList.contains('coral3-Icon--sizeXS')).to.be.true;
      });
    });

    describe('#iconPosition', function() {
      it('should default to left', function() {
        var button = new Coral.Button();
        expect(button.iconPosition).to.equal(Coral.Button.iconPosition.LEFT);
      });
    });

    describe('#selected', function() {

      it('should default to false', function() {
        var button = new Coral.Button();
        expect(button.selected).to.be.false;
        expect(button.classList.contains('is-selected')).to.be.false;
        expect(button.hasAttribute('selected')).to.be.false;
      });

      it('should be settable', function() {
        var button = new Coral.Button();
        button.selected = true;
        expect(button.selected).to.be.true;
        expect(button.hasAttribute('selected')).to.be.true;
        expect(button.classList.contains('is-selected')).to.be.true;
      });
    });
  });
});
