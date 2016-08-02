describe('Coral.Tag', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Tag');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone a tag using markup', function(done) {
      helpers.build(window.__html__['Coral.Tag.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a tag with full markup', function(done) {
      helpers.build(window.__html__['Coral.Tag.full.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a tag with comments cusing markup', function(done) {
      helpers.build(window.__html__['Coral.Tag.comment.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var tag = new Coral.Tag();
      tag.label.innerHTML = 'San José';
      tag.value = 'SJ';
      helpers.target.appendChild(tag);

      helpers.next(function() {
        helpers.testComponentClone(tag, done);
      });
    });
  });


  describe('markup', function() {

    it('should have label set to innerHTML if property not provided', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        expect(tag.label.innerHTML).to.equal('Paris');
        expect(tag.value).to.equal('paris');
        done();
      });
    });
  });

  describe('API', function() {

    it('should block user interaction', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        var removeButton = tag.querySelector('button');
        expect(tag.closable).to.be.false;
        expect(removeButton.hidden).to.be.true;
        removeButton.click();
        helpers.next(function() {
          expect(tag.parentNode).to.not.be.null;
          done();
        });
      });
    });

    it('should set the value without setting it to an input element', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        tag.value = 'SJ';
        helpers.next(function() {
          expect(tag.value).to.equal('SJ');
          expect(tag.$.data('input')).to.be.undefined;
          done();
        });
      });
    });

    it('should set multiline class if property is true', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        tag.multiline = true;
        helpers.next(function() {
          expect(tag.$).to.have.class('coral-Tag--multiline');
          done();
        });
      });
    });

    it('should set quiet class if property is true', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        tag.quiet = true;
        helpers.next(function() {
          expect(tag.$).to.have.class('coral-Tag--quiet');
          done();
        });
      });
    });

    it('should remove tag if its button is triggered', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        tag.closable = true;
        tag.querySelector('button').trigger('click');
        helpers.next(function() {
          expect(tag.parentNode).to.be.null;
          done();
        });
      });
    });

    it('should set another tag color', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        tag.color = 'grey';
        helpers.next(function() {
          expect(tag.$).to.have.class('coral-Tag--grey');
          done();
        });
      });
    });

    it('should set another tag size', function(done) {
      var tag = helpers.build(window.__html__['Coral.Tag.base.html'], function() {
        tag.size = 's';
        helpers.next(function() {
          expect(tag.$).to.have.class('coral-Tag--small');
          tag.size = 'M';
          helpers.next(function() {
            expect(tag.$).to.have.class('coral-Tag--medium');
            done();
          });
        });
      });
    });

    it('value should default to empty string', function(done) {
      var tag = new Coral.Tag();
      expect(tag.value).to.equal('');
      done();
    });
  });
});
