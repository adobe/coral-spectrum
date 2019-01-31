import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {commons} from '../../../coralui-utils';

describe('commons', function() {
  describe('#extend', function() {
    it('should combine properties', function() {
      var obj1 = {
        a: 1,
        b: 2
      };
      var obj2 = {
        c: 3,
        d: 4
      };

      var extended = commons.extend({}, obj1, obj2);

      // Make sure original objects are unmodified
      expect(Object.keys(obj1).length).to.equal(2);
      expect(Object.keys(obj2).length).to.equal(2);

      expect(Object.keys(extended).length).to.equal(4);

      expect(extended).to.have.property('a');
      expect(extended).to.have.property('b');
      expect(extended).to.have.property('c');
      expect(extended).to.have.property('d');

      expect(extended.a).to.equal(1);
      expect(extended.b).to.equal(2);
      expect(extended.c).to.equal(3);
      expect(extended.d).to.equal(4);
    });
  });

  describe('#augment', function() {
    it('should not overwrite properties', function() {
      var obj1 = {
        a: 1,
        b: 2
      };
      var obj2 = {
        a: -1,
        c: 3
      };

      var augmented = commons.augment(obj1, obj2);

      expect(Object.keys(augmented).length).to.equal(3);

      expect(augmented).to.have.property('a');
      expect(augmented).to.have.property('b');
      expect(augmented).to.have.property('c');

      expect(augmented.a).to.equal(1);
      expect(augmented.b).to.equal(2);
      expect(augmented.c).to.equal(3);
    });

    it('should support multiple source objects', function() {
      var obj1 = {
        a: 1,
        b: 2
      };
      var obj2 = {
        a: -1,
        c: 3
      };
      var obj3 = {
        c: -1,
        d: 4
      };

      var augmented = commons.augment({}, obj1, obj2, obj3);

      expect(Object.keys(augmented).length).to.equal(4);

      expect(augmented).to.have.property('a');
      expect(augmented).to.have.property('b');
      expect(augmented).to.have.property('c');
      expect(augmented).to.have.property('d');

      expect(augmented.a).to.equal(1);
      expect(augmented.b).to.equal(2);
      expect(augmented.c).to.equal(3);
      expect(augmented.d).to.equal(4);
    });

    it('should not modify source objects', function() {
      var obj1 = {
        a: 1,
        b: 2
      };
      var obj2 = {
        c: 3,
        d: 4
      };

      var augmented = commons.augment({}, obj1, obj2);

      // Make sure original objects are unmodified
      expect(Object.keys(obj1).length).to.equal(2);
      expect(Object.keys(obj2).length).to.equal(2);

      // Make sure properties were added
      expect(Object.keys(augmented).length).to.equal(4);
    });

    it('should call the callback for collisions and assign its return value', function() {
      var obj1 = {
        a: 1,
        b: 2
      };
      var obj2 = {
        a: -1
      };

      var augmented = commons.augment(obj1, obj2, function(oldValue, newValue, prop, dest, source) {
        expect(dest).to.equal(obj1);
        expect(source).to.equal(obj2);
        expect(oldValue).to.equal(1);
        expect(newValue).to.equal(-1);
        expect(prop).to.equal('a');
        return 'collision';
      });

      expect(Object.keys(augmented).length).to.equal(2);

      expect(augmented).to.have.property('a');
      expect(augmented).to.have.property('b');

      expect(augmented.a).to.equal('collision');
      expect(augmented.b).to.equal(2);
    });

    it('should not assign the return value of the callback if it is undefined', function() {
      var obj1 = {
        a: 1,
        b: 2
      };
      var obj2 = {
        a: -1
      };

      var augmented = commons.augment(obj1, obj2, function(oldValue, newValue, prop, dest, source) {
        return undefined;
      });

      expect(Object.keys(augmented).length).to.equal(2);

      expect(augmented).to.have.property('a');
      expect(augmented).to.have.property('b');

      expect(augmented.a).to.equal(1);
      expect(augmented.b).to.equal(2);
    });
  });

  describe('#getUID', function() {
    it('should return unique IDs', function() {
      var id1 = commons.getUID();
      var id2 = commons.getUID();
      expect(id1).to.not.equal(id2);
    });
  });

  describe('#setSubProperty', function() {
    it('should set immediate properties', function() {
      var a = {
        b: 'value'
      };

      commons.setSubProperty(a, 'b', 'value');

      expect(a.b).to.equal('value');
    });

    it('should assign nested properties', function() {
      var a = {
        b: {
          c: {}
        }
      };

      commons.setSubProperty(a, 'b.c.d', 'value');

      expect(a.b.c).to.have.property('d');
      expect(a.b.c.d).to.equal('value');
    });
  });

  describe('#getSubProperty', function() {
    it('should get immediate properties', function() {
      var a = {
        b: 'value'
      };

      expect(commons.getSubProperty(a, 'b')).to.equal('value');
    });

    it('should get undefined immediate properties', function() {
      var a = {};

      expect(commons.getSubProperty(a, 'b')).to.be.undefined;
    });

    it('should get nested properties', function() {
      var a = {
        b: {
          c: {
            d: 'value'
          }
        }
      };

      expect(commons.getSubProperty(a, 'b.c.d')).to.equal('value');
    });

    it('should get undefined nested properties', function() {
      var a = {
        b: {
          c: {}
        }
      };

      expect(commons.getSubProperty(a, 'b.c.d')).to.be.undefined;
    });
  });

  describe('#swapKeysAndValues', function() {
    it('should swap the keys and values of an object', function() {
      var obj = {
        a: 'z',
        b: 'y',
        c: 'x'
      };

      var swapped = commons.swapKeysAndValues(obj);

      expect(swapped).to.not.have.property('a');
      expect(swapped).to.not.have.property('b');
      expect(swapped).to.not.have.property('c');

      expect(swapped).to.have.property('z');
      expect(swapped).to.have.property('y');
      expect(swapped).to.have.property('x');

      expect(swapped.z).to.equal('a');
      expect(swapped.y).to.equal('b');
      expect(swapped.x).to.equal('c');
    });
  });

  describe('#callAll', function() {
    it('should call all provided functions in order and return the specified index', function() {
      var calls = [];

      function pushCall(count) {
        calls.push(count);
        return count;
      }

      var aggregate = commons.callAll(
        pushCall.bind(null, 0),
        pushCall.bind(null, 1),
        pushCall.bind(null, 2),
        1 // Return the value of the function at arguments[1]
      );

      var ret = aggregate();

      expect(calls.length).to.equal(3);
      expect(calls).to.have.members([0, 1, 2]);
      expect(ret).to.equal(1);
    });

    it('should ignore non-function arguments and assume index is relative to arguments', function() {
      var calls = [];

      function pushCall(count) {
        calls.push(count);
        return count;
      }

      var aggregate = commons.callAll(
        pushCall.bind(null, 0),
        'string',
        pushCall.bind(null, 2),
        null,
        pushCall.bind(null, 4),
        2 // Return the return value of the function at arguments[2]
      );

      var ret = aggregate();

      expect(ret).to.equal(2);
    });

    it('should return the return value of the 0th function if nth not provided', function() {
      var calls = [];

      function pushCall(count) {
        calls.push(count);
        return count;
      }

      var aggregate = commons.callAll(
        pushCall.bind(null, 'a'),
        pushCall.bind(null, 'b'),
        pushCall.bind(null, 'c')
      );

      var ret = aggregate();

      expect(ret).to.equal('a');
    });

    it('should just return the return value of the function if only one function provided', function() {
      function noop() {
      }

      var aggregate = commons.callAll(noop, null, null);

      expect(aggregate).to.equal(noop);
    });

    it('should return the return value of the first valid function if nth argument is not a function', function() {
      function noop() {
      }
      function returnOne() {
        return 1;
      }

      var aggregate = commons.callAll(null, returnOne, null, noop, 2);

      var ret = aggregate();

      expect(ret).to.equal(1);
    });

    it('should still return a function if no functions provided', function() {
      var aggregate = commons.callAll(null, null, null);

      expect(aggregate).to.be.a('function');
    });
  });

  describe('#ready', function() {
    // Define custom element parent
    window.customElements.define('coral-element', class extends HTMLElement {
      constructor() {
        super();
      }
  
      connectedCallback() {
        this.appendChild(document.createElement('coral-element-item'));
      }
    });

    // Define custom element item
    window.customElements.define('coral-element-item', class extends HTMLElement {
      constructor() {
        super();
      }
    });

    // Define custom element extended button
    window.customElements.define('coral-element-button', class extends HTMLButtonElement {
      constructor() {
        super();
      }
    }, {extends: 'button'});
    
    it('should call the callback when all components are ready', function(done) {
      const el = helpers.build(document.createElement('coral-element'));
      
      commons.ready(() => {
        expect(el.contains(el.querySelector('coral-element-item')));
        expect(window.customElements.get('coral-element')).to.not.equal(undefined);
        expect(window.customElements.get('coral-element-item')).to.not.equal(undefined);
        
        done();
      });
    });

    it('should call the callback when all subcomponents components are ready (recursively)', function(done) {
      const el = helpers.build(document.createElement('coral-element'));
  
      commons.ready(el, () => {
        expect(el.contains(el.querySelector('coral-element-item')));
        expect(window.customElements.get('coral-element')).to.not.equal(undefined);
        expect(window.customElements.get('coral-element-item')).to.not.equal(undefined);
        
        done();
      });
    });

    it('should work with custom elements that use is=""', function(done) {
      const el = document.createElement('button', {is: 'coral-element-button'});
  
      commons.ready(el, () => {
        expect(window.customElements.get('coral-element-button')).to.not.equal(undefined);
        done();
      });
    });

    it('should pass the element to the callback', function(done) {
      const el = document.createElement('button', {is: 'coral-element-button'});
  
      commons.ready(el, (passedEl) => {
        expect(el).to.equal(passedEl);
        done();
      });
    });

    it('should pass window to the callback when no element is passed', function(done) {
      const el = helpers.build(document.createElement('button', {is: 'coral-element-button'}));
  
      commons.ready((passedEl) => {
        expect(window).to.equal(passedEl);
        done();
      });
    });
    
    it('should work with normal custom elements and some that use is="..."', function(done) {
      helpers.target.appendChild(document.createElement('coral-element'));
      helpers.target.appendChild(document.createElement('coral-element-button'), {is:'coral-element-button'});
  
      commons.ready(() => {
        expect(window.customElements.get('coral-element')).to.not.equal(undefined);
        expect(window.customElements.get('coral-element-item')).to.not.equal(undefined);
        expect(window.customElements.get('coral-element-button')).to.not.equal(undefined);
        
        done();
      });
    });
    
    it('should not be blocking', function(done) {
      commons.ready(10, () => {
        done();
      });
    });
  });

  describe('#transitionEnd', function() {

    it('should call the provided callback (even if the browser does not support transitions)', function(done) {
      var el = helpers.target.appendChild(document.createElement('div'));
      el.textContent = 'onTransitionEnd Test';
      el.setAttribute('style', '-webkit-transition: all 100ms ease; -moz-transition: all 100ms ease; -o-transition: all 100ms ease; transition: all 100ms ease;');
      
      commons.transitionEnd(el, function(event) {
        expect(el).to.equal(event.target);

        // In most browsers the callback should be asynchronous
        expect(event.cssTransitionSupported).to.equal(true);
        expect(event.transitionStoppedByTimeout).to.equal(false, 'CSS transition should have triggered callback');

        done();
      });
  
      el.style.marginTop = '100px';
    });

    it('should call the provided callback even if no transition was configured', function(done) {
      var el = helpers.target.appendChild(document.createElement('div'));
      el.textContent = 'onTransitionEnd Test';

      commons.transitionEnd(el, function(event) {
        expect(el).to.equal(event.target);

        // In most browsers the callback should be asynchronous
        expect(event.cssTransitionSupported).to.equal(true);
        expect(event.transitionStoppedByTimeout).to.equal(true, 'Handled by the timeout since no transition has been configured');

        done();
      });
    });

    it('should call the provided callback even if the transition duration is 0', function(done) {
      var el = helpers.target.appendChild(document.createElement('div'));
      el.textContent = 'onTransitionEnd Test';
      el.setAttribute('style', '-webkit-transition: all 0s ease; -moz-transition: all 0s ease; -o-transition: all 0s ease; transition: all 0s ease;');

      commons.transitionEnd(el, function(event) {
        expect(el).to.equal(event.target);

        // In most browsers the callback should be asynchronous
        expect(event.cssTransitionSupported).to.equal(true);
        expect(event.transitionStoppedByTimeout).to.equal(true, 'Handled by the timeout since no transition has been configured');

        done();
      });
    });

    it('should only call the transitionEnd callback once', function(done) {
      var el = helpers.target.appendChild(document.createElement('div'));
      el.textContent = 'onTransitionEnd Test';
      el.setAttribute('style', '-webkit-transition: all 300ms ease; -moz-transition: all 300ms ease; -o-transition: all 300ms ease; transition: all 300ms ease;');

      var spy = sinon.spy();
      var animate = function() {
        el.style.marginTop = '100px';

        setTimeout(function() {
          expect(spy.callCount).to.equal(1);
          done();
        }, 400); // transition-duration (ms) + 100ms
      };

      commons.transitionEnd(el, spy);

      // Wait a moment after the append before triggering the animation otherwise transitionend event doesn't fire
      setTimeout(animate, 1);
    });

    it('per default transitionEnd is automatically unregistered after one callback', function(done) {
      var el = helpers.target.appendChild(document.createElement('div'));
      el.textContent = 'onTransitionEnd Test';
      el.setAttribute('style', '-webkit-transition: all 300ms ease; -moz-transition: all 300ms ease; -o-transition: all 300ms ease; transition: all 300ms ease;');

      var spy = sinon.spy();
      var wait = 450; // transition-duration (ms) + 100ms

      commons.transitionEnd(el, spy);

      // Wait a moment after the append before triggering the animation otherwise transitionend event doesn't fire
      setTimeout(function() {
        el.style.marginTop = '100px';
        setTimeout(function() {
          expect(spy.callCount).to.equal(1);

          // Undo last CSS animation and check that the callback has not been called again
          setTimeout(function() {
            el.style.marginTop = '0px';
            setTimeout(function() {
              expect(spy.callCount).to.equal(1); // => callback should not have been called again
              done();
            }, wait);
          }, 1);
        }, wait);
      }, 1);
    });
  });

  describe('#addResizeListener', function() {

    it('should call the provided callback when element is initially loaded', function(done) {
      const div = helpers.build('<div></div>');
      
      commons.addResizeListener(div, function() {
        done();
      });
    });

    it('should call the provided callback whenever the size of the element is changed (due to content added)', function(done) {
      const div = helpers.build('<div><div id="container"></div></div>');
      
      var containerHTML = '<div>Test</div>';
      var container = document.getElementById('container');
      
      commons.addResizeListener(div, function() {
        expect(container.innerHTML).to.equal(containerHTML, 'inner content should now be set and a resize has been called');
        done();
      });
      container.innerHTML = containerHTML;
    });

    it('should call the provided callback whenever the size of the element is changed (due to content removed)', function(done) {
      const div = helpers.build('<div><div id="container"><div>Test</div></div></div>');
      var container = document.getElementById('container');
      
      commons.addResizeListener(div, function() {
        expect(container.innerHTML).to.equal('', 'inner content should now be removed and a resize has been called');
        done();
      });
      container.innerHTML = '';
    });

    it('should be possible to listen to resize events even if element is initially hidden', function(done) {
      const div =helpers.build('<div style="display:none;"></div>');
      
      commons.addResizeListener(div, function() {
        done();
      });
      div.style.display = 'block';
    });

    it('should be possible to listen to resize events even if parent is initially hidden', function(done) {
      const div = helpers.build('<div id="parent" style="display:none;"><div id="child"></div></div>');
      
      var parentEl = document.getElementById('parent');
      var childEl = document.getElementById('child');
      
      commons.addResizeListener(childEl, function() {
        done();
      });
      parentEl.style.display = 'block';
    });

    it('should be possible get notified when sizeof the element is changed via css', function(done) {
      const div = helpers.build('<div style="width:50px; height: 50px;"></div>');
      
      var widthWasChanged = false;
      
      commons.addResizeListener(div, function() {
        if (widthWasChanged) {
          expect(div.style.width).to.equal('70px', 'width of div should be 70px');
          done();
        }
      });

      widthWasChanged = true;
      div.style.width = '70px';
    });

    it('should be possible get notified when size is changed due to css change anywhere hierarchy', function(done) {
      const div = helpers.build('<div id="parent" style="width:50px; height: 50px;"><div id="child" style="width:100%; height: 100%;" ></div></div>');
      
      var parentEl = document.getElementById('parent');
      var childEl = document.getElementById('child');
      var widthOfParentWasSet = false;
      
      commons.addResizeListener(childEl, function() {
        if (widthOfParentWasSet) {
          expect(parentEl.style.width).to.equal('70px', 'width of parent should be 70px');
          done();
        }
      });

      widthOfParentWasSet = true;
      parentEl.style.width = '70px';
    });
  });

  describe('#removeResizeListener', function() {
    it('should be possible to remove a resize listener if no longer needed', function(done) {
      const div = helpers.build('<div style="width:50px; height: 50px;"></div>');

      var isCallbackDetached = false;
      var resizeCallback = function() {
        // This resize callback should only be called once as we detach it after the first time
        expect(isCallbackDetached).to.be.false;
        isCallbackDetached = true;
        commons.removeResizeListener(div, resizeCallback);

        // Force a resize of the element
        div.style.width = '70px';

        window.setTimeout(function() {
          // If after a short time resize was not triggered again we are sure that removeResizeListener did work
          expect(div.style.width).to.equal('70px', 'width of div should be 70px');
          done();
        }, 500);
      };

      commons.addResizeListener(div, resizeCallback);
    });
  });

  describe('#TABBABLE_ELEMENT_SELECTOR', function() {
    it('should not select items with tabIndex=-1', function() {
      var div = document.createElement('div');
      div.tabIndex = -1;
      expect(div.matches(commons.TABBABLE_ELEMENT_SELECTOR)).to.equal(false, 'Div with tabIndex=-1 should not be selected');

      var button = document.createElement('button');
      expect(button.matches(commons.TABBABLE_ELEMENT_SELECTOR)).to.equal(true, 'Button should be selected');
    });
  });
});
