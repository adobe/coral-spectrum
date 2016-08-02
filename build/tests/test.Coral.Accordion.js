describe('Coral.Accordion', function() {
  'use strict';

  var SNIPPET_BASE = window.__html__['Coral.Accordion.base.html'];
  var buildSnippet_Base = helpers.build.bind('', SNIPPET_BASE);

  var SNIPPET_FIRST_SELECTED = window.__html__['Coral.Accordion.selected.first.html'];

  var SNIPPET_NESTED = window.__html__['Coral.Accordion.nested.html'];
  var SNIPPET_NESTED_CONTENT = window.__html__['Coral.Accordion.nested.content.html'];


  // Assert whether an item is properly active or inactive.
  var assertActiveness = function(item, isSelected) {

    var content = item.find('.coral3-Accordion-content');
    var header = item.find('.coral3-Accordion-header');

    if (isSelected) {
      expect(item).to.have.class('is-selected');
      expect(header.attr('aria-selected')).to.equal('true');
      expect(header.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
      expect(content.height()).to.be.above(0);
      expect(content.css('display')).to.equal('block');
    }
    else {
      expect(item).to.not.have.class('is-selected');
      expect(header.attr('aria-expanded')).to.equal('false');
      expect(header.attr('aria-selected')).to.equal('false');
      expect(content.attr('aria-hidden')).to.equal('true');
    }
  };

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Accordion');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Accordion.variant).to.exist;
      expect(Coral.Accordion.variant.DEFAULT).to.equal('default');
      expect(Coral.Accordion.variant.QUIET).to.equal('quiet');
      expect(Coral.Accordion.variant.LARGE).to.equal('large');
      expect(Object.keys(Coral.Accordion.variant).length).to.equal(3);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function(done) {
      helpers.build(SNIPPET_BASE, function(accordion) {
        helpers.testComponentClone(accordion, done);
      });
    });

    it('should be possible to clone a nested accordion using markup', function(done) {
      helpers.build(SNIPPET_NESTED, function(accordion) {
        helpers.testComponentClone(accordion, done);
      });
    });

    it('should be possible to clone a nested in content accordion using markup', function(done) {
      helpers.build(SNIPPET_NESTED_CONTENT, function(accordion) {
        helpers.testComponentClone(accordion, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var accordion = new Coral.Accordion();
      helpers.target.appendChild(accordion);

      helpers.next(function() {
        helpers.testComponentClone(accordion, done);
      });
    });
  });

  helpers.testSelectionList(Coral.Accordion, Coral.Accordion.Item);

  describe('from markup', function() {

    it('should be an accordion', function(done) {
      buildSnippet_Base(function(el) {
        expect(el.$).to.have.class('coral3-Accordion');
        done();
      });
    });

    it('should have role=tablist', function(done) {
      buildSnippet_Base(function(el) {
        el = el.$;

        expect(el.is('[role=tablist]')).to.be.true;
        expect(el.find('[role=presentation]').length).equal(3);
        expect(el.find('div[role=tabpanel]').length).equal(3);

        expect(el.find('[role=tab]').attr('aria-controls'))
          .equal(el.find('div[role=tabpanel]').attr('id'));

        expect(el.find('div[role=tabpanel]').attr('aria-labelledby'))
          .equal(el.find('[role=tab]').attr('id'));

        done();
      });

    });

    describe('imperative API', function() {

      it('should expand collapsible in accordion', function(done) {
        helpers.build(SNIPPET_BASE, function(el) {
          var secondItem = el.items.getAll()[1];
          secondItem.selected = true;
          helpers.next(function() {
            assertActiveness(secondItem.$, true);
            done();
          });
        });
      });

      it('should update the active panel on selection changing', function(done) {
        helpers.build(SNIPPET_FIRST_SELECTED, function(el) {
          expect(el.items.getAll()[0]).equal(el.selectedItem);
          var secondItem = el.items.getAll()[1];
          secondItem.selected = true;
          helpers.next(function() {
            assertActiveness(secondItem.$, true);
            expect(secondItem).equal(el.selectedItem);
            done();
          });
        });
      });
    });

    describe('user interaction', function() {

      it('should expand panel in accordion when header is clicked', function(done) {
        helpers.build(SNIPPET_BASE, function(el) {
          var secondItem = el.items.getAll()[1];
          secondItem._elements.label.click();
          helpers.next(function() {
            assertActiveness(secondItem.$, true);
            done();
          });
        });
      });

      it('should collapse expanded panel in accordion when header is clicked', function(done) {
        helpers.build(SNIPPET_FIRST_SELECTED, function(el) {
          var firstItem = el.items.getAll()[0];
          expect(firstItem).equal(el.selectedItem);
          firstItem._elements.label.click();
          helpers.next(function() {
            expect(null).equal(el.selectedItem);
            assertActiveness(firstItem.$, false);
            done();
          });
        });
      });

      it('shouldn\'t update the active panel on clicking disabled panel', function(done) {
        helpers.build(SNIPPET_FIRST_SELECTED, function(el) {
          var firstItem = el.items.getAll()[0];
          var secondItem = el.items.getAll()[1];
          secondItem.disabled = true;
          secondItem.click();
          helpers.next(function() {
            assertActiveness(firstItem.$, true);
            assertActiveness(secondItem.$, false);
            expect(firstItem).equal(el.selectedItem);
            done();
          });
        });
      });
    });
  });
});
