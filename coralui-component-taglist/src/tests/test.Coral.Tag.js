describe('Coral.Tag', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Tag');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone a tag using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Tag.base.html']);
    });

    it('should be possible to clone a tag with full markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Tag.full.html']);
    });

    it('should be possible to clone a tag with comments cusing markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Tag.full.html']);
    });

    it('should be possible to clone using js', function() {
      var tag = new Coral.Tag();
      tag.label.innerHTML = 'San José';
      tag.value = 'SJ';
      helpers.cloneComponent(tag);
    });
  });

  describe('Markup', function() {

    describe('#label', function() {
      it('should have label set to innerHTML if property not provided', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        expect(tag.label.innerHTML).to.equal('Paris');
        expect(tag.value).to.equal('paris');
      });
    });

    describe('#closable', function() {
      it('should block user interaction', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        var removeButton = tag._elements.button;
        expect(tag.closable).to.be.false;
        expect(removeButton.hidden).to.be.true;
        removeButton.click();
        expect(tag.parentNode).to.not.be.null;
      });

      it('should remove tag if its button is triggered', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        tag.closable = true;
        tag._elements.button.trigger('click');
        expect(tag.parentNode).to.be.null;
      });
    });

    describe('#value', function() {
      it('should set the value without setting it to an input element', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        tag.value = 'SJ';

        expect(tag.value).to.equal('SJ');
        expect(tag._input).to.be.undefined;
      });
    });

    describe('#multiline', function() {
      it('should set multiline class if property is true', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        tag.multiline = true;
        expect(tag.classList.contains('coral3-Tag--multiline')).to.be.true;
      });
    });

    describe('#quiet', function() {
      it('should set quiet class if property is true', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        tag.quiet = true;

        expect(tag.classList.contains('coral3-Tag--quiet')).to.be.true;
      });
    });

    describe('#color', function() {
      it('should set another tag color', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        tag.color = 'grey';

        expect(tag.classList.contains('coral3-Tag--grey')).to.be.true;
      });
    });

    describe('#size', function() {
      it('should set another tag size', function() {
        var tag = helpers.build(window.__html__['Coral.Tag.base.html']);
        tag.size = 's';
        expect(tag.classList.contains('coral3-Tag--small')).to.be.true;
        tag.size = 'M';
        expect(tag.classList.contains('coral3-Tag--medium')).to.be.true;
      });
    });
  });

  describe('API', function() {

    let el = null;

    beforeEach(function() {
      el = new Coral.Tag();
    });

    afterEach(function() {
      el = null;
    });

    describe('#label', function() {
      it('should have a label', function() {
        expect(el.label).to.not.be.null;
      });
    });

    describe('#closable', function() {
      it('should default to false', function() {
        expect(el.closable).to.be.false;
      });

      it('should insert the button in the DOM only if required', function() {
        expect(el.contains(el._elements.button)).to.be.false;
        el.closable = true;
        expect(el.contains(el._elements.button)).to.be.true;
      });
    });

    describe('#value', function() {
      it('value should default to empty string', function() {
        expect(el.value).to.equal('');
      });
    });

    describe('#multiline', function() {
      it('should default to false', function() {
        expect(el.multiline).to.be.false;
      });
    });

    describe('#quiet', function() {
      it('should default to false', function() {
        expect(el.quiet).to.be.false;
      });
    });

    describe('#size', function() {
      it('should default to L', function() {
        expect(el.size).to.equal(Coral.Tag.size.LARGE);
      });
    });

    describe('#color', function() {
      it('should default to empty string', function() {
        expect(el.color).to.equal(Coral.Tag.color.DEFAULT);
      });
    });
  });
});
