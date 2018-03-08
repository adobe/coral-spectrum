import {Shell} from '/coralui-component-shell';

describe('Shell', function() {
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Shell.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Shell());
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new Shell());
    });

    afterEach(function() {
      el = null;
    });

    describe('#content', function() {
      it('should be defined', function() {
        expect(el.content).to.exist;
      });

      it('should be a content zone', function() {
        el.content.appendChild(document.createElement('button'));
        expect(el.content.children.length).not.to.equal(0);
      });
    });
  });

  describe('Markup', function() {
    describe('#content', function() {
      it('should created if not provided', function() {
        const el = helpers.build(window.__html__['Shell.base.html']);
        expect(el.children.length).to.equal(1);
        expect(el.content).to.exist;
        expect(el.content).to.equal(el.children[0]);
        expect(el.content.textContent.trim()).to.equal('This is the content.');
      });

      it('should keep an existing content if provided', function() {
        const el = helpers.build(window.__html__['Shell.content.html']);
        expect(el.children.length).to.equal(2);
        expect(el.content).to.equal(el.children[1]);
      });
    });
  });
});
