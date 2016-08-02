describe('Coral.Autocomplete.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Autocomplete).to.have.property('Item');
    });
  });

  describe('API', function() {
    // the select list item used in every test
    var el;

    beforeEach(function() {
      el = new Coral.Autocomplete.Item();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#content', function() {
      it('should default to empty string', function() {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });
    });

    describe('#value', function() {
      it('should default empty string', function(done) {
        expect(el.value).to.equal('');

        helpers.next(function() {
          expect(el.hasAttribute('value')).to.be.false;
          done();
        });
      });

      it('should default to the content', function(done) {
        el.content.innerHTML = 'My Content';

        expect(el.content.innerHTML).to.equal('My Content');
        expect(el.value).to.equal('My Content');

        helpers.next(function() {
          expect(el.hasAttribute('value')).to.be.false;
          done();
        });
      });

      it('should keep maximum 1 space from the content', function() {
        el.content.innerHTML = 'Two    Words';

        expect(el.content.innerHTML).to.equal('Two    Words');
        expect(el.value).to.equal('Two Words');
      });

      it('should remove the html from the value', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.value).to.equal('Highlighted text');
      });

      it('should convert the value to string', function(done) {
        el.value = 9.5;

        expect(el.value).to.equal('9.5');

        helpers.next(function() {
          expect(el.getAttribute('value')).to.equal('9.5');
          done();
        });
      });

      it('should reflect the value', function(done) {
        el.value = 'ch';

        helpers.next(function() {
          expect(el.getAttribute('value')).to.equal('ch');
          done();
        });
      });
    });

    describe('#selected', function() {
      it('should be not be selected by default', function(done) {
        expect(el.selected).to.be.false;

        helpers.next(function() {
          expect(el.hasAttribute('selected')).to.be.false;
          done();
        });
      });

      it('should be settable', function(done) {
        el.selected = true;

        expect(el.selected).to.be.true;

        helpers.next(function() {
          expect(el.hasAttribute('selected')).to.be.true;
          done();
        });
      });

      it('should accept truthy', function(done) {
        el.selected = 1;

        expect(el.selected).to.be.true;

        helpers.next(function() {
          expect(el.hasAttribute('selected')).to.be.true;
          done();
        });
      });
    });
  });

  describe('Markup', function() {

    describe('#content', function() {
      it('should have content set to innerHTML if property not provided', function(done) {
        helpers.build(window.__html__['Coral.Autocomplete.Item.base.html'], function(el) {
          expect(el.content.innerHTML).to.equal('Switzerland');
          expect(el.value).to.equal('Switzerland');
          done();
        });
      });

      it('should support HTML content', function(done) {
        helpers.build(window.__html__['Coral.Autocomplete.Item.full.html'], function(el) {
          expect(el.content.innerHTML).to.equal('<em>Switzerland</em>');
          expect(el.innerHTML).to.equal('<em>Switzerland</em>');
          expect(el.value).to.equal('ch');
          done();
        });
      });
    });

    // @todo: it can remove the attribute and goes back to default
    describe('#value', function() {
      it('should set the value from markup', function(done) {
        helpers.build(window.__html__['Coral.Autocomplete.Item.full.html'], function(el) {
          expect(el.value).to.equal('ch');
          done();
        });
      });

      it('should default to the content', function(done) {
        helpers.build(window.__html__['Coral.Autocomplete.Item.base.html'], function(el) {
          expect(el.value).to.equal('Switzerland');
          expect(el.hasAttribute('value')).to.be.false;
          done();
        });
      });
    });
  });

  describe('Events', function() {});
});
