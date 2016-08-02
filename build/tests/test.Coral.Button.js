describe('Coral.Button', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Button');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Button.variant).to.exist;
      expect(Coral.Button.variant.DEFAULT).to.equal('secondary'); // backwards compat
      expect(Coral.Button.variant.SECONDARY).to.equal('secondary');
      expect(Coral.Button.variant.PRIMARY).to.equal('primary');
      expect(Coral.Button.variant.WARNING).to.equal('warning');
      expect(Coral.Button.variant.QUIET).to.equal('quiet');
      expect(Coral.Button.variant.MINIMAL).to.equal('minimal');
      expect(Object.keys(Coral.Button.variant).length).to.equal(7);
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function(done) {
      var button = new Coral.Button();
      expect(button.$).to.have.class('coral-Button');
      helpers.next(function() {
        expect(button.$).not.to.have.attr('block');
        expect(button.$).not.to.have.attr('icon');
        expect(button.$).to.have.attr('variant');
        expect(button.$).to.have.class('coral-Button');
        done();
      });
    });

    it('should not blow away loose HTML', function() {
      helpers.build('<button is="coral-button"><span>Add</span></button>', function(button) {
        expect(button.label.innerHTML).to.equal('<span>Add</span>');
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build('<button is="coral-button">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with size attribute using markup', function(done) {
      helpers.build('<button is="coral-button" size="L">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with icon attribute using markup', function(done) {
      helpers.build('<button is="coral-button" icon="add">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with icon and size attribute using markup', function(done) {
      helpers.build('<button is="coral-button" icon="add" size"L">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with quiet attribute using markup', function(done) {
      helpers.build('<button is="coral-button" variant="quiet">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button using js', function(done) {
      var button = new Coral.Button();
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with a specific size using js', function(done) {
      var button = new Coral.Button();
      button.size = 'L';
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with an icon using js', function(done) {
      var button = new Coral.Button();
      button.icon = 'add';
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with a variant using js', function(done) {
      var button = new Coral.Button();
      button.variant = 'quiet';
      button.label.textContent = 'Quiet Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });
  });

  describe('Markup', function() {

    describe('#hidden', function() {

      it('should hide component on false', function(done) {
        var markup = '<button is="coral-button" hidden></button>';
        helpers.build(markup, function(button) {
          expect(button.$).to.have.css('display', 'none');
          expect(button.$).to.have.attr('hidden');
          done();
        });
      });
    });

    describe('#label', function() {

      it('should be initially empty', function(done) {
        var markup = '<button is="coral-button" hidden></button>';
        helpers.build(markup, function(button) {
          expect(button.label.textContent).to.equal('', 'label.textContent');
          expect(button.textContent).to.equal('');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should use the existing nodes as the initial label value', function(done) {
        var markup = '<button is="coral-button">Button</button>';
        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Button');
          done();
        });
      });

      it('should resync the icon once the label is modified', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.parentNode).not.to.be.null;
          expect(button.$).to.not.have.class('coral-Button--square');

          button.label.textContent = 'Hello';

          helpers.next(function() {
            expect(button.textContent).to.equal('Hello');
            expect(button.$).to.have.class('coral-Button');
            expect(button.icon).to.equal('add');
            expect(button.$).not.to.have.class('coral-Button--square');
            done();
          }); // end next frame
        }); // end build
      }); // end it

      it('should change to square if the label is removed', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.parentNode).not.to.be.null;
          expect(button.$).to.not.have.class('coral-Button--square');

          button.label.textContent = '';

          helpers.next(function() {
            expect(button.textContent).to.equal('');
            expect(button.$).to.have.class('coral-Button');
            expect(button.icon).to.equal('add');
            expect(button.$).to.have.class('coral-Button--square');
            done();
          }); // end next frame
        }); // end build
      }); // end it

      it('should remove square if the label is added', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.parentNode).not.to.be.null;
          expect(button.$).have.class('coral-Button--square');

          button.label.textContent = 'Add';

          helpers.next(function() {
            expect(button.textContent).to.equal('Add');
            expect(button.$).to.have.class('coral-Button');
            expect(button.icon).to.equal('add');
            expect(button.$).to.not.have.class('coral-Button--square');
            done();
          }); // end next frame
        }); // end build
      }); // end it

    }); // end describe label

    describe('#icon', function() {

      it('should be initially empty', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('');
          expect(button._elements.icon.parentNode).to.be.null;
          expect(button.$).not.to.have.attr('icon');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should set a new icon', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button.textContent).to.equal('');
          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--square');
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.icon).to.equal('add');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should not be square when there is a label', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button.textContent).to.equal('Add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('add');

          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button.$).not.to.have.class('coral-Button--square');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should not create a new icon if the value is updated', function(done) {
        var markup = '<button is="coral-button" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button.icon).to.equal('add');

          // icon is updated
          button.icon = 'share';
          button.label.innerHTML = '';
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('share');

          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--square');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should hide the icon element once the icon is set to empty string', function(done) {
        var markup = '<button is="coral-button" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button._elements.icon.parentNode).not.to.be.null;

          button.icon = '';

          helpers.next(function() {

            expect(button.$).not.to.have.class('coral-Button--square');
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.icon).to.equal('');
            expect(button._elements.icon.parentNode).to.be.null;
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });
    }); // end describe icon

    describe('#iconsize', function() {

      it('should be initially the default', function() {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
          expect(button.$).not.to.have.attr('iconsize');
        });
      });

      it('should set the new iconsize', function() {
        var markup = '<button is="coral-button" iconsize="L" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
          expect(button.$).to.have.attr('iconsize', 'L');
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);
        });
      });

      it('should discard invalid iconsize', function() {
        var markup = '<button is="coral-button" iconsize="megalarge" icon="add"></button>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
          expect(button.$).to.have.attr('iconsize', 'megalarge');
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.SMALL);
        });
      });
    });

    describe('#size', function() {

      it('should default to medium', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.size).to.equal(Coral.Button.size.MEDIUM);
          expect(button.$).not.to.have.class('coral-Button--large');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should set the size modifier', function(done) {
        var markup = '<button is="coral-button" size="L"></button>';
        helpers.build(markup, function(button) {
          expect(button.size).to.equal(Coral.Button.size.LARGE);
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--large');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

    });

    describe('#block', function() {

      it('should be initially false', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.block).to.be.false;
          expect(button.$).not.to.have.attr('block');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.$).not.to.have.class('coral-Button--block');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should set the size modifier', function(done) {
        var markup = '<button is="coral-button" block></button>';
        helpers.build(markup, function(button) {
          expect(button.block).to.be.true;
          expect(button.$).to.have.attr('block');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--block');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should behave like an attribute boolean', function(done) {
        var markup = '<button is="coral-button" block="false"></button>';
        helpers.build(markup, function(button) {
          expect(button.block).to.be.true;
          expect(button.$).to.have.attr('block');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--block');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });
    });

    describe('#variant', function() {

      it('should be initially Coral.Button.variant.DEFAULT', function(done) {
        var markup = '<button is="coral-button"></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.attr('variant');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should set the new variant', function(done) {
        var markup = '<button is="coral-button" variant="primary"></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal('primary');
          expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
          expect(button.$).to.have.attr('variant', 'primary');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--primary');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should add the default class if variant is empty', function(done) {
        var markup = '<button is="coral-button" variant=""></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.attr('variant', Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should go back to default variant for invalid variant', function(done) {
        var markup = '<button is="coral-button" variant="invalidvariant"></button>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.attr('variant', Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        var markup = '<button is="coral-button" variant="primary"></button>';
        helpers.build(markup, function(button) {

          expect(button.$).to.have.class('coral-Button--primary');

          button.variant = Coral.Button.variant.WARNING;

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--warning');
            expect(button.$).not.to.have.class('coral-Button--primary');
            done();
          });
        });
      });
    });

    describe('#selected', function() {

      it('should default to false', function(done) {
        var markup = '<button is="coral-button"></button>';

        helpers.build(markup, function(button) {
          expect(button.selected).to.be.false;
          expect(button.$).not.to.have.class('is-selected');
          expect(button.$).not.to.have.attr('selected');

          done();
        });
      });

      it('should be settable', function(done) {
        var markup = '<button is="coral-button" selected></button>';

        helpers.build(markup, function(button) {
          expect(button.selected).to.be.true;

          expect(button.$).to.have.attr('selected');

          // we wait for the sync
          helpers.next(function() {
            expect(button.$).to.have.class('is-selected');

            done();
          });
        });
      });
    });

    it('should accept all attributes at once', function(done) {
      var markup = '<button is="coral-button" icon="share" variant="primary" size="L" block>Share</button>';
      helpers.build(markup, function(button) {
        // these don't pass in IE9
        expect(button.size).to.equal(Coral.Button.size.LARGE);
        expect(button.block).to.be.true;
        expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
        expect(button.icon).to.equal('share');

        // these need an extra frame to pass in IE11
        helpers.next(function() {
          expect(button.$).to.have.class('coral-Button--large');
          expect(button.$).to.have.class('coral-Button--block');
          expect(button.$).to.have.class('coral-Button--primary');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('share');
          expect(button.textContent).to.equal('Share');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });
    }); // end variant
  }); // end describe markup

  describe('API', function() {

    describe('#icon', function() {

      it('should default to empty string', function() {
        var button = new Coral.Button();
        expect(button.icon).to.equal('');
        helpers.next(function() {
          expect(button._elements.icon.parentNode).to.be.null;
        });
      });

      it('should set the new icon', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';

        helpers.next(function() {
          expect(button.$).not.to.have.attr('icon');

          helpers.next(function() {
            expect(button._elements.icon.$).to.have.class('coral-Icon--add');
            done();
          });
        });
      });

      it('should convert everything to string', function(done) {
        var button = new Coral.Button();
        button.icon = 5;
        expect(button.icon).to.equal('5');
        button.icon = false;
        expect(button.icon).to.equal('false');
        button.icon = true;
        expect(button.icon).to.equal('true');

        helpers.next(function() {
          expect(button.icon).to.equal('true');
          expect(button.$).not.to.have.attr('icon');
          expect(button._elements.icon).not.to.be.null;
          expect(button._elements.icon.$).to.have.class('coral-Icon--true');
          done();
        });
      });

      it('should remove the icon with empty string', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button._elements.icon.icon).to.equal('add');

        button.icon = '';

        helpers.next(function() {
          expect(button.icon).to.equal('');
          expect(button._elements.icon.parentNode).to.be.null;
          done();
        });
      });

      it('should remove the icon with null', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button._elements.icon.icon).to.equal('add');

        button.icon = null;

        helpers.next(function() {
          expect(button.icon).to.equal('');
          expect(button._elements.icon.parentNode).to.be.null;
          done();
        });
      });

      it('should remove the icon with undefined', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';

        expect(button._elements.icon.icon).to.equal('add');

        button.icon = undefined;

        helpers.next(function() {
          expect(button.icon).to.equal('');
          expect(button._elements.icon.parentNode).to.be.null;
          done();
        });
      });
    });

    describe('#iconSize', function() {

      it('should default to Coral.Icon.size.SMALL', function(done) {
        var button = new Coral.Button();
        button.icon = 'add';
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);

        helpers.next(function() {
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.SMALL);
          done();
        });
      });

      it('should sync the iconSize correctly', function(done) {
        var button = new Coral.Button();
        button.iconSize = Coral.Icon.size.LARGE;
        button.icon = 'add';

        expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._elements.icon.$).to.have.class('coral-Icon--sizeL');
          done();
        });
      });

      it('should set the new size even if icon is not set', function() {
        var button = new Coral.Button();

        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
      });

      it('should set the new size', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);
          done();
        });
      });

      it('should accept lowercase values', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE.toLowerCase();
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._elements.icon.$).to.have.class('coral-Icon--sizeL');
          done();
        });
      });

      it('should be set with an attribute', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';

        button.setAttribute('iconsize', Coral.Icon.size.LARGE);
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button.$).to.have.attr('iconsize', 'L');
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);
          done();
        });
      });

      it('should discard values not part of the enum', function() {
        var button = new Coral.Button();

        // this value will be accepted
        button.iconSize = 'XS';
        // all these will be discarded
        button.iconSize = 'megalarge';
        button.iconSize = null;
        button.iconSize = -1;
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should discard unknonwn attribute', function() {
        var button = new Coral.Button();

        button.setAttribute('size', 'megalarge');
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
      });

      it('should keep the size after the icon is changed', function(done) {
        var button = new Coral.Button();

        button.icon = 'add';
        button.iconSize = 'L';

        expect(button._elements.icon.icon).to.equal('add');
        expect(button._elements.icon.size).to.equal('L');

        button.icon = 'delete';

        expect(button.icon).to.equal('delete');
        expect(button.iconSize).to.equal('L');
        expect(button._elements.icon.size).to.equal('L');
        expect(button._elements.icon.icon).to.equal('delete');

        helpers.next(function() {
          expect(button._elements.icon.$).to.have.class('coral-Icon--sizeL');
          done();
        });
      });
    });

    describe('#selected', function() {

      it('should default to false', function() {
        var button = new Coral.Button();

        expect(button.selected).to.be.false;
        expect(button.$).not.to.have.class('is-selected');
        expect(button.$).not.to.have.attr('selected');
      });

      it('should be settable', function(done) {
        var button = new Coral.Button();

        button.selected = true;

        expect(button.selected).to.be.true;

        expect(button.$).to.have.attr('selected');

        // we wait for the sync to kick in
        helpers.next(function() {
          expect(button.$).to.have.class('is-selected');

          done();
        });
      });
    });
  });
});
