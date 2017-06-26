var helpers = helpers || {};

/**
  Helpers used to test a cloned component.

  @param {String} markup - The markup used to initialize the component.
  @param {Object} [options] - Object that contains configuration values to test.
  @param {Boolean} [options.deepClone=true] - deepClone the component. True, if not provided.
*/
helpers.cloneComponent = function(markup, options) {

  'use strict';

  // sets the default if component should be deep cloned
  options = options || {};
  options.deepClone = options.deepClone || true;

  /* Clone Helper */
  function getCloneComponent(element, deepClone) {
    if (!element || typeof element.cloneNode !== 'function') {
      return null;
    }
    return (element.cloneNode(deepClone));
  }

  describe('testComponentClone', function() {

    var el;
    var elClone;

    beforeEach(function(done) {

      helpers.build(markup, function(_el) {
        el = _el;

        // Do the clone
        elClone = getCloneComponent(el, options.deepClone);

        if (!elClone) {
          console.warn('Something wrong with the clone of ', el);
        }

        helpers.target.appendChild(elClone);

        // Wait until the clone is ready
        Coral.commons.ready(elClone, function() {
          // The sync methods won't be called until the frame after that
          // Wait until sync methods have been called
          helpers.next(function() {
            // Pass the instance along
            done();
          });
        });
      });
    });

    afterEach(function() {
      el = elClone = null;
    });

    describe('cloned classname', function() {
      // Expect component css classes to match
      var elClassNameArray;
      var elCloneClassNameArray;

      beforeEach(function() {
        elClassNameArray = el.className.split(' ');
        elCloneClassNameArray = elClone.className.split(' ');
      });

      it('should have the same members', function() {
        expect(elCloneClassNameArray).to.have.members(elClassNameArray, 'clone className members does not match');
      });

      it('should have the same length', function() {
        expect(elCloneClassNameArray.length).to.equal(elClassNameArray.length, 'clone className count does not match');
      });
    });


    describe('cloned children', function() {
      var elChildren;
      var elCloneChildren;

      beforeEach(function() {
        elChildren = el.querySelectorAll('*');
        elCloneChildren = elClone.querySelectorAll('*');
      });

      it('should have the same legnth', function() {
        expect(elCloneChildren.length).to.equal(elChildren.length, 'cloned children count does not match');
      });

      it('should have the same tagname', function() {
        for (var i = 0; i < elCloneChildren.length; i++) {
          expect(elCloneChildren[i].tagName).to.equal(elChildren[i].tagName, 'cloned child tagName does not match');
        }
      });

      it('should have matching classnames', function() {
        for (var i = 0; i < elCloneChildren.length; i++) {
          var elChildrenClassNameArray = elChildren[i].className.split(' ');
          var elCloneChildrenClassNameArray = elCloneChildren[i].className.split(' ');
          expect(elCloneChildrenClassNameArray).to.have.members(elChildrenClassNameArray,
            'clone child className vs new child className');
          expect(elCloneChildrenClassNameArray.length).to.equal(elChildrenClassNameArray.length,
            'clone child className length vs new child className length');
        }
      });
    });
  });
};
