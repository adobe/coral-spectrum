import {helpers} from '/coralui-util/src/tests/helpers';
import {Textarea} from '/coralui-component-textarea';

describe('Textarea', function() {

  describe('Instantiation', function() {
    it('should be possible via clone using markup', function() {
      helpers.cloneComponent(window.__html__['Textarea.base.html']);
    });

    it('should be possible via clone using markup with textContent', function() {
      helpers.cloneComponent(window.__html__['Textarea.value.html']);
    });

    it('should be possible via clone using js', function() {
      helpers.cloneComponent(new Textarea());
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Textarea();
    });

    afterEach(function() {
      el = null;
    });

    describe('#value', function() {
      it('should return empty string by default', function() {
        expect(el.value).to.equal('');
      });
    });

    describe('#name', function() {
      it('should return empty string by default', function() {
        expect(el.name).to.equal('');
      });
    });

    describe('#variant', function() {
      it('should be set to "default" by default', function() {
        expect(el.variant).to.equal(Textarea.variant.DEFAULT, '"default" should be set');
      });

      it('should be possible to set the variant', function() {

        expect(el.classList.contains('_coral-Textfield--quiet')).to.be.false;

        el.variant = Textarea.variant.QUIET;
        expect(el.variant).to.equal(Textarea.variant.QUIET, '"quiet" should be set');
        expect(el.classList.contains('_coral-Textfield--quiet')).to.be.true;
      });

      it('should increase the height automatically if variant=quiet', function() {
        helpers.build(el);
        el.variant = Textarea.variant.QUIET;
        var initialHeight = el.getBoundingClientRect().height;

        el.value = '\n\n\n';
        el.trigger('input');

        var newHeight = parseInt(el.style.height, 10);
        expect(newHeight > initialHeight).to.be.true;
      });

      it('should decrease the height automatically if variant=quiet', function() {
        helpers.build(el);
        el.variant = Textarea.variant.QUIET;
        el.value = '\n\n\n';
        el.trigger('input');

        var initialHeight = el.getBoundingClientRect().height;
        el.value = '';
        el.trigger('input');
        var newHeight = parseInt(el.style.height, 10);
        expect(newHeight < initialHeight).to.be.true;
      });
  
      it('should restore the default height if variant was quiet', function() {
        var initialHeight = '10px';
        el.style.height = initialHeight;
    
        el.variant = Textarea.variant.QUIET;
  
        el.value = '\n\n\n';
        el.trigger('input');
  
        el.variant = Textarea.variant.DEFAULT;
        
        expect(el.style.height).to.be.equal(initialHeight);
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Textarea.value.html'], {
        value: 'abc'
      });
    });
  });
});
