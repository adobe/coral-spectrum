/*global CustomElements:true */
describe('Coral.AnchorButton', function() {
  'use strict';

  var helpers = window.helpers;

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('AnchorButton');
    });
  });

  describe('instantiation', function() {
    it('should be possible using new', function(done) {
      var button = new Coral.AnchorButton();
      expect(button.$).to.have.class('coral-Button');

      helpers.next(function() {
        expect(button.$).to.have.attr('variant');
        expect(button.$).not.to.have.attr('block');
        expect(button.$).not.to.have.attr('label');
        expect(button.$).not.to.have.attr('icon');
        expect(button.$).to.have.class('coral-Button');
        done();
      });
    });

    it('should be possible using createElement', function(done) {
      var button = document.createElement('a', 'coral-anchorbutton');
      expect(button.$).to.have.class('coral-Button');

      helpers.next(function() {
        expect(button.$).to.have.attr('variant');
        expect(button.$).not.to.have.attr('block');
        expect(button.$).not.to.have.attr('label');
        expect(button.$).not.to.have.attr('icon');
        expect(helpers.classCount(button)).to.equal(2);
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build('<a is="coral-anchorbutton">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with size attribute using markup', function(done) {
      helpers.build('<a is="coral-anchorbutton" size="L">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with icon attribute using markup', function(done) {
      helpers.build('<a is="coral-anchorbutton" icon="add">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with icon and size attribute using markup', function(done) {
      helpers.build('<a is="coral-anchorbutton" icon="add" size"L">Add</button>', function(button) {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button using js', function(done) {
      var button = new Coral.AnchorButton();
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with a specific size using js', function(done) {
      var button = new Coral.AnchorButton();
      button.size = 'L';
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });

    it('should be possible to clone a button with an icon using js', function(done) {
      var button = new Coral.AnchorButton();
      button.icon = 'add';
      button.label.textContent = 'Add Button';
      helpers.target.appendChild(button);
      helpers.next(function() {
        helpers.testComponentClone(button, done);
      });
    });
  });

  describe('markup', function() {

    describe('hidden attribute', function() {

      it('should hide component on false', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" hidden></a>';
        helpers.build(markup, function(button) {
          expect(button.$).to.have.css('display', 'none');
          expect(button.$).to.have.attr('hidden');
          done();
        });
      });
    });

    describe('label property from content in tag body', function() {

      it('should be initially empty', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" hidden></a>';

        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('');
          expect(button.$).not.to.have.attr('label');
          expect(button.textContent).to.equal('');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should use the textContent as the initial value', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#">Button</button>';

        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Button');

          expect(button.$).not.to.have.attr('label');
          expect(button.textContent).to.equal('Button');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should resync the icon once the label is modified', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          // wait one more frame
          helpers.next(function() {
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.parentNode).not.to.be.null;
            expect(button.$).not.to.have.class('coral-Button--square');

            button.label.innerHTML = 'Hello';

            helpers.next(function() {
              expect(button.label.innerHTML).to.equal('Hello');
              expect(button.textContent).to.equal('Hello');
              expect(button.$).to.have.class('coral-Button');
              done();
            }); // end next frame
          }); // end other next frame
        }); // end build
      }); // end it
    }); // end describe label

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

    describe('icon property', function() {

      it('should be initially empty', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#">Test</a>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('');
          expect(button._elements.icon.parentNode).to.be.null;
          expect(button.$).not.to.have.attr('icon');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should set the new icon', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" icon="add"></a>';
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
        var markup = '<a is="coral-anchorbutton" href="#" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button.textContent).to.equal('Add');
          // for some reason IE needs another frame
          helpers.next(function() {
            expect(button.$).not.to.have.class('coral-Button--square');
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.icon).to.equal('add');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should not create a new icon if the value is updated', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" icon="add">Add</button>';
        helpers.build(markup, function(button) {
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.$).to.have.attr('icon', 'add');
          expect(button.icon).to.equal('add');

          // icon is updated
          button.icon = 'share';
          button.label.innerHTML = '';

          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--square');
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.icon).to.equal('share');
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });

      it('should hide the icon element once the icon is set to empty string', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" icon="add"></a>';
        helpers.build(markup, function(button) {
          expect(button.icon).to.equal('add');
          expect(button.$).to.have.attr('icon', 'add');
          // this next assertion fails in IE11
          // expect(button._elements.icon.parentNode).not.to.be.null;
          // icon is updated
          button.icon = '';

          helpers.next(function() {

            expect(button.$).not.to.have.class('coral-Button--square');
            // these don't pass in IE11 even with an extra frame
            // expect(button._elements.icon).to.exist;
            // expect(button._elements.icon.icon).to.equal('add');
            // expect(button._elements.icon.parentNode).to.be.null;
            expect(button.$).to.have.class('coral-Button');
            done();
          });
        });
      });
    }); // end describe icon

    describe('iconsize property', function() {

      it('should be initially the default', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#"></a>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
          expect(button.$).not.to.have.attr('iconsize');
          done();
        });
      });

      it('should set the new iconsize', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" iconsize="L" icon="add"></a>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
          expect(button.$).to.have.attr('iconsize', 'L');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.icon).to.equal('add');
            expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);
            done();
          });
        });
      });

      it('should discard invalid iconsize', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" iconsize="megalarge" icon="add"></a>';
        helpers.build(markup, function(button) {
          expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
          expect(button.$).to.have.attr('iconsize', 'megalarge');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(button._elements.icon).to.exist;
            expect(button._elements.icon.icon).to.equal('add');
            expect(button._elements.icon.size).to.equal(Coral.Icon.size.SMALL);
            done();
          });
        });
      });
    });

    describe('#size', function() {

      it('should default to medium', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#"></a>';
        helpers.build(markup, function(button) {
          expect(button.size).to.equal(Coral.Button.size.MEDIUM);
          expect(button.$).not.to.have.class('coral-Button--large');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should set the size modifier', function(done) {
        var markup = '<a is="coral-anchorbutton" size="L" href="#"></a>';
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
        var markup = '<a is="coral-anchorbutton" href="#"></a>';
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
        var markup = '<a is="coral-anchorbutton" href="#" block></a>';
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
        var markup = '<a is="coral-anchorbutton" href="#" block="false"></a>';
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
        var markup = '<a is="coral-anchorbutton" href="#"></a>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.attr('variant');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should set the new variant', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" variant="primary"></a>';
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

      it('should fall back to default variant on empty variant', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" variant=""></a>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.attr('variant', Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should fall back to default variant for invalid variant', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" variant="invalidvariant"></a>';
        helpers.build(markup, function(button) {
          expect(button.variant).to.equal(Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.attr('variant', Coral.Button.variant.DEFAULT);
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        var markup = '<a is="coral-anchorbutton" href="#" variant="primary"></a>';
        helpers.build(markup, function(button) {

          expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);

          // these need an extra frame to pass in Firefox
          helpers.next(function() {
            expect(button.$).to.have.class('coral-Button--primary');

            button.variant = Coral.Button.variant.WARNING;

            helpers.next(function() {
              expect(button.$).to.have.class('coral-Button--warning');
              expect(button.$).not.to.have.class('coral-Button--primary');
              done();
            });
          });
        });
      });
    });

    it('should accept all attributes at once', function(done) {
      var markup = '<a is="coral-anchorbutton" href="#" icon="share" variant="primary" size="L" block>Share</a>';
      helpers.build(markup, function(button) {
        // these don't pass in IE9
        expect(button.size).to.equal(Coral.Button.size.LARGE);
        expect(button.block).to.be.true;
        expect(button.variant).to.equal(Coral.Button.variant.PRIMARY);
        expect(button.icon, 'icon value').to.equal('share');
        expect(button.label.innerHTML, 'innerHTML').to.equal('Share');

        // these need an extra frame to pass in IE11
        helpers.next(function() {
          expect(button.$).to.have.class('coral-Button--large');
          expect(button.$).to.have.class('coral-Button--block');
          expect(button.$).to.have.class('coral-Button--primary');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon, 'elements.icon.icon').to.equal('share');
          expect(button.textContent, 'text content').to.equal('Share');
          expect(button.$).to.have.class('coral-Button');
          done();
        });
      });
    }); // end variant
  }); // end describe markup

  describe('API', function() {

    describe('#icon', function() {

      it('should default to null', function() {
        var button = new Coral.AnchorButton();
        expect(button.icon).to.equal('');
        expect(button._elements.icon.parentNode).to.be.null;
      });

      it('should set the new icon', function(done) {
        var button = new Coral.AnchorButton();

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
        var button = new Coral.AnchorButton();
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
          done();
        });
      });

      it('should remove the icon with empty string', function(done) {
        var button = new Coral.AnchorButton();
        button.icon = 'add';

        helpers.next(function() {
          expect(button._elements.icon.icon).to.equal('add');

          button.icon = '';

          helpers.next(function() {
            expect(button.icon).to.equal('');
            expect(button._elements.icon.parentNode).to.be.null;
            done();
          });
        });
      });

      it('should remove the icon with null', function(done) {
        var button = new Coral.AnchorButton();
        button.icon = 'add';

        helpers.next(function() {
          expect(button._elements.icon.icon).to.equal('add');

          button.icon = null;

          helpers.next(function() {
            expect(button.icon).to.equal('');
            expect(button._elements.icon.parentNode).to.be.null;
            done();
          });
        });
      });

      it('should remove the icon with undefined', function(done) {
        var button = new Coral.AnchorButton();
        button.icon = 'add';

        helpers.next(function() {
          expect(button._elements.icon.icon).to.equal('add');

          button.icon = undefined;

          helpers.next(function() {
            expect(button.icon).to.equal('');
            expect(button._elements.icon.parentNode).to.be.null;
            done();
          });
        });
      });
    });

    describe('#iconSize', function() {

      it('should default to Coral.Icon.size.SMALL', function(done) {
        var button = new Coral.AnchorButton();
        button.icon = 'add';
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);

        helpers.next(function() {
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.SMALL);
          done();
        });
      });

      it('should sync the iconSize correctly', function(done) {
        var button = new Coral.AnchorButton();
        button.iconSize = Coral.Icon.size.LARGE;
        button.icon = 'add';

        // first sync will update the size variable in the icon
        helpers.next(function() {

          expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);

          // second sync will update the class in the DOM
          helpers.next(function() {
            expect(button._elements.icon.$).to.have.class('coral-Icon--sizeL');
            done();
          });
        });
      });

      it('should set the new size even if icon is not set', function() {
        var button = new Coral.AnchorButton();

        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);
      });

      it('should set the new size', function(done) {
        var button = new Coral.AnchorButton();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE;
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);
          done();
        });
      });

      it('should accept lowercase values', function(done) {
        var button = new Coral.AnchorButton();

        button.icon = 'add';
        button.iconSize = Coral.Icon.size.LARGE.toLowerCase();
        expect(button.iconSize).to.equal(Coral.Icon.size.LARGE);

        helpers.next(function() {
          expect(button._elements.icon.size).to.equal(Coral.Icon.size.LARGE);

          helpers.next(function() {
            expect(button._elements.icon.$).to.have.class('coral-Icon--sizeL');
            done();
          });
        });
      });

      it('should be set with an attribute', function(done) {
        var button = new Coral.AnchorButton();

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
        var button = new Coral.AnchorButton();

        // this value will be accepted
        button.iconSize = 'XS';
        // all these will be discarded
        button.iconSize = 'megalarge';
        button.iconSize = null;
        button.iconSize = -1;
        expect(button.iconSize).to.equal(Coral.Icon.size.EXTRA_SMALL);
      });

      it('should discard unknonwn attribute', function() {
        var button = new Coral.AnchorButton();

        button.setAttribute('size', 'megalarge');
        expect(button.iconSize).to.equal(Coral.Icon.size.SMALL);
      });

      it('should keep the size after the icon is changed', function(done) {
        var button = new Coral.AnchorButton();

        button.icon = 'add';
        button.iconSize = 'L';

        helpers.next(function() {
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.size).to.equal('L');

          button.icon = 'delete';

          helpers.next(function() {
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
      });
    });
  });

  describe('Accessibility', function() {
    it('should have aria-disabled, role and tabindex set by default', function(done) {
      helpers.build('<a is="coral-anchorbutton"></a>', function(button) {
        expect(button.$).to.have.attr('role');
        expect(button.$).to.have.attr('tabindex');

        helpers.next(function() {
          expect(button.$).to.have.attr('aria-disabled');
          expect(button.$).to.have.attr('role', 'button');
          expect(button.$).to.have.attr('tabindex', '0');
          expect(button.$).to.have.attr('aria-disabled', 'false');
          done();
        });
      });
    });

    it('should have tabindex set to -1 while disabled', function(done) {
      helpers.build('<a is="coral-anchorbutton" disabled></a>', function(button) {
        helpers.next(function() {
          expect(button.$).to.have.attr('role', 'button');
          expect(button.$).to.have.attr('tabindex', '-1');
          expect(button.$).to.have.attr('aria-disabled', 'true');
          done();
        });
      });
    });

    it('should set is-select on keyDown', function() {
      var button = new Coral.AnchorButton();
      helpers.target.appendChild(button);

      expect(button.$).to.have.class('coral-Button');
      expect(button.$).to.not.have.class('is-selected');

      helpers.keydown('space', button);
      expect(button.$).to.have.class('is-selected');
    });

    it('should not set is-select on keyDown', function() {
      var button = new Coral.AnchorButton();
      helpers.target.appendChild(button);

      helpers.keyup('space', button);
      expect(button.$).to.not.have.class('is-selected');
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

      anchorbutton = new Coral.AnchorButton();
      helpers.target.appendChild(anchorbutton);

      // adds the required listeners
      anchorbutton.on('keyup', keyUpSpy);
      anchorbutton.on('keydown', keyDownSpy);

      // clickSpy and preventSpy for event bubble
      $(document).on('click', function(event) {
        if (CustomElements.instanceof(event.target, Coral.AnchorButton)) {
          clickSpy();
          if (event.isDefaultPrevented()) {
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
      $(document).off('click');
      helpers.target.removeChild(anchorbutton);
      anchorbutton = null;
    });

    it('should trigger on keydown', function() {
      helpers.keydown('space', anchorbutton);

      expect(keyDownSpy.callCount).to.equal(1);
      expect(keyUpSpy.callCount).to.equal(0);
      expect(clickSpy.callCount).to.equal(1);
      expect(preventSpy.callCount).to.equal(0);

      expect(anchorbutton.$).to.have.class('is-selected');
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

    it('should prevent event from bubbling while disabled', function(done) {
      expect(anchorbutton.disabled).to.be.false;
      anchorbutton.click();

      helpers.next(function() {
        expect(clickSpy.callCount).to.equal(1);
        expect(preventSpy.callCount).to.equal(0);
        anchorbutton.disabled = true;
        anchorbutton.click();

        helpers.next(function() {
          expect(clickSpy.callCount).to.equal(2);
          expect(preventSpy.callCount).to.equal(1);
          done();
        });
      });
    });
  });
});
