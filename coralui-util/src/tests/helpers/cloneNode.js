var helpers = helpers || {};

/**
  Note: these helpers are implicitly tested by test.Coral.Component.js and designed as used in every coralui-component
*/
(function() {
  'use strict';

  function getClone(element, cloneNestedElements) {
    if (element && typeof element.cloneNode === 'function') {
      return helpers.target.appendChild(element.cloneNode(cloneNestedElements));
    }
    return null;
  }

  /**
    Test cloneNode()

    @param {HTMLElement} componentInstance  The element to be cloned and tested
  */
  function testCloneNode(componentInstance, done) {
    var clonedInstance = getClone(componentInstance, true);

    // Wait a frame in case component needs to add nested elements
    helpers.next(function() {
      // Expect component css classes to match
      var clonedClassNameArray = clonedInstance.className.split(' ');
      var originClassNameArray = componentInstance.className.split(' ');

      expect(clonedClassNameArray).to.have.members(originClassNameArray, 'clone className vs origin className');
      expect(clonedClassNameArray.length).to.equal(originClassNameArray.length,
        'clone className length vs origin className length');

      // Wait another frame in case component has to initialize nested elements
      helpers.next(function() {
        var newChildren = componentInstance.querySelectorAll('*');
        var clonedChildren = clonedInstance.querySelectorAll('*');
        expect(clonedChildren.length).to.equal(newChildren.length, 'cloned children count vs new children count');

        for (var i = 0; i < clonedChildren.length; i++) {
          var clonedChildrenClassNameArray = clonedChildren[i].className.split(' ');
          var originChildrenClassNameArray = newChildren[i].className.split(' ');

          expect(clonedChildren[i].tagName).to.equal(newChildren[i].tagName, 'clone child tagName vs new child tagName');
          expect(clonedChildrenClassNameArray).to.have.members(originChildrenClassNameArray,
            'clone child className vs new child className');
          expect(clonedChildrenClassNameArray.length).to.equal(originChildrenClassNameArray.length,
            'clone child className length vs new child className length');
        }
        done();
      });
    });
  }

  /**
    Testing battery for cloneNode tests

    @param {HTMLElement} element The element to be tested
    @deprecated since version coralui-component=1.9.2, use helpers.cloneComponent instead
  */
  helpers.testComponentClone = function(element, done) {
    testCloneNode(element, done);
  };

  /**
    Helper for tests to clone an instance consistently

    @param {HTMLElement} element The element to be cloned
    @param {Boolean} cloneNestedElements=true Deep clone nested elements
  */
  helpers.getCloneFromElement = function(element, cloneNestedElements) {
    cloneNestedElements = cloneNestedElements || true;
    return getClone(element, cloneNestedElements);
  };

}());
