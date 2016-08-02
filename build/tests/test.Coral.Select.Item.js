describe('Coral.Select.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Select).to.have.property('Item');
    });
  });

  describe('API', function() {
    // the select list item used in every test
    var el;

    beforeEach(function() {
      el = new Coral.Select.Item();
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
        el.content.innerHTML = 'Switzerland';

        expect(el.content.innerHTML).to.equal('Switzerland');
        expect(el.value).to.equal('Switzerland');

        helpers.next(function() {
          expect(el.hasAttribute('value')).to.be.false;
          done();
        });
      });

      it('should keep maximum 1 space from the content', function() {
        el.content.innerHTML = 'Costa   Rica';

        expect(el.content.innerHTML).to.equal('Costa   Rica');
        expect(el.value).to.equal('Costa Rica');
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
        el.value = 'crc';

        helpers.next(function() {
          expect(el.getAttribute('value')).to.equal('crc');
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

      // mixin-selection does not allow parentless items to be selected
      it.skip('should be settable', function(done) {
        el.selected = true;

        expect(el.selected).to.be.true;

        helpers.next(function() {
          expect(el.hasAttribute('selected')).to.be.true;
          done();
        });
      });

      // mixin-selection does not allow parentless items to be selected
      it.skip('should accept truthy', function(done) {
        el.selected = 1;

        expect(el.selected).to.be.true;

        helpers.next(function() {
          expect(el.hasAttribute('selected')).to.be.true;
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should be not be disabled by default', function(done) {
        expect(el.disabled).to.be.false;

        helpers.next(function() {
          expect(el.hasAttribute('disabled')).to.be.false;
          done();
        });
      });

      it('should be settable', function(done) {
        el.disabled = true;

        expect(el.disabled).to.be.true;

        helpers.next(function() {
          expect(el.hasAttribute('disabled')).to.be.true;
          done();
        });
      });

      it('should accept truthy', function(done) {
        el.disabled = 1;

        expect(el.disabled).to.be.true;

        helpers.next(function() {
          expect(el.hasAttribute('disabled')).to.be.true;
          done();
        });
      });
    });
  });

  describe('Markup', function() {

    describe('#content', function() {
      it('should have content set to innerHTML if property not provided', function(done) {

        helpers.build(window.__html__['Coral.Select.Item.base.html'], function(el) {
          expect(el.content.innerHTML).to.equal('Costa Rica');
          expect(el.value).to.equal('Costa Rica');
          done();
        });
      });

      it('should support HTML content', function(done) {

        helpers.build(window.__html__['Coral.Select.Item.full.html'], function(el) {
          expect(el.content.innerHTML).to.equal('<em>Costa</em> Rica');
          expect(el.innerHTML).to.equal('<em>Costa</em> Rica');
          expect(el.value).to.equal('crc');
          done();
        });
      });
    });

    // @todo: it can remove the attribute and goes back to default
    describe('#value', function() {
      it('should set the value from markup', function(done) {
        helpers.build(window.__html__['Coral.Select.Item.full.html'], function(el) {
          expect(el.value).to.equal('crc');
          done();
        });
      });

      it('should default to the content', function(done) {
        helpers.build(window.__html__['Coral.Select.Item.base.html'], function(el) {
          expect(el.value).to.equal('Costa Rica');
          expect(el.hasAttribute('value')).to.be.false;
          done();
        });
      });

      // @todo: this is the behavior of the default select option since we use coral.transform.string we cannot detect
      // the difference
      it.skip('should fall back to content if attribute is removed', function(done) {
        helpers.build(window.__html__['Coral.Select.Item.full.html'], function(el) {
          expect(el.value).to.equal('crc');
          el.removeAttribute('value');
          expect(el.value).to.equal('Costa Rica');
          done();
        });
      });
    });

    describe('#selected', function() {
      it('should not be selected by default', function(done) {
        helpers.build(window.__html__['Coral.Select.Item.base.html'], function(el) {
          expect(el.selected).to.be.false;
          expect(el.$).not.to.have.class('is-selected');
          expect(el.$).not.to.have.attr('selected');
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should not be disabled by default', function(done) {
        helpers.build(window.__html__['Coral.Select.Item.base.html'], function(el) {
          expect(el.disabled).to.be.false;
          expect(el.$).not.to.have.class('is-disabled');
          expect(el.$).not.to.have.attr('disabled');
          done();
        });
      });
    });
  });

  describe('Events', function() {
    // the select list item used in every test
    var el;

    beforeEach(function() {
      el = new Coral.Select.Item();
      el.value = 'item1';
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#coral-select-item:valuechange', function() {
      it('should not be triggered if the same value is set', function() {
        var changeSpy = sinon.spy();
        el.on('coral-select-item:valuechange', changeSpy);

        // we set the same value
        el.value = el.value;

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should be triggered when the value changes', function() {
        var changeSpy = sinon.spy();
        el.on('coral-select-item:valuechange', changeSpy);

        el.value = 'value';

        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.getCall(0).args[0].target.value).to.equal('value');
      });
    });

    describe('#coral-select-item:contentchange', function() {
      it('should be triggered when the content changes', function(done) {
        var changeSpy = sinon.spy();
        el.on('coral-select-item:contentchange', changeSpy);

        el.content.innerHTML = 'new content';

        // we need to wait for the mutation observer
        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.getCall(0).args[0].target.content.innerHTML).to.equal('new content');

          done();
        });
      });

      it('should be triggered when item is appended', function(done) {
        var changeSpy = sinon.spy();
        el.on('coral-select-item:contentchange', changeSpy);

        var icon = new Coral.Icon();

        el.content.appendChild(icon);

        // we need to wait for the mutation observer
        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(1);

          done();
        });
      });
    });

    describe('#coral-select-item:disablechange', function() {
      it('should not be triggered if disabled did not change', function() {
        var changeSpy = sinon.spy();
        el.on('coral-select-item:disabledchange', changeSpy);

        el.disabled = el.disabled;

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should be triggered when the value changes', function() {
        var changeSpy = sinon.spy();
        el.on('coral-select-item:disabledchange', changeSpy);

        el.disabled = true;

        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.getCall(0).args[0].target.disabled).to.be.true;
      });
    });
  });

  describe('Implementation Details', function() {
    it('should always be hidden', function(done) {
      var el = new Coral.Select.Item();
      helpers.target.appendChild(el);

      helpers.next(function() {
        expect(el.$.is(':visible')).to.be.false;
        done();
      });
    });

    it('should have correct accesibility values', function(done) {
      var el = new Coral.Select.Item();
      helpers.target.appendChild(el);

      helpers.next(function() {
        expect(el.tabIndex).to.equal(-1);
        expect(el.hasAttribute('tabindex')).to.be.false;
        expect(el.getAttribute('role')).to.equal('option');
        done();
      });
    });
  });
});
