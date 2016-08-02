describe('Coral.commons', function() {
  'use strict';

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

      var extended = Coral.commons.extend({}, obj1, obj2);

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

      var augmented = Coral.commons.augment(obj1, obj2);

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

      var augmented = Coral.commons.augment({}, obj1, obj2, obj3);

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

      var augmented = Coral.commons.augment({}, obj1, obj2);

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

      var augmented = Coral.commons.augment(obj1, obj2, function(oldValue, newValue, prop, dest, source) {
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

      var augmented = Coral.commons.augment(obj1, obj2, function(oldValue, newValue, prop, dest, source) {
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
      var id1 = Coral.commons.getUID();
      var id2 = Coral.commons.getUID();
      expect(id1).to.not.equal(id2);
    });
  });

  describe('#setSubProperty', function() {
    it('should set immediate properties', function() {
      var a = {
        b: 'value'
      };

      Coral.commons.setSubProperty(a, 'b', 'value');

      expect(a.b).to.equal('value');
    });

    it('should assign nested properties', function() {
      var a = {
        b: {
          c: {}
        }
      };

      Coral.commons.setSubProperty(a, 'b.c.d', 'value');

      expect(a.b.c).to.have.property('d');
      expect(a.b.c.d).to.equal('value');
    });
  });

  describe('#getSubProperty', function() {
    it('should get immediate properties', function() {
      var a = {
        b: 'value'
      };

      expect(Coral.commons.getSubProperty(a, 'b')).to.equal('value');
    });

    it('should get undefined immediate properties', function() {
      var a = {};

      expect(Coral.commons.getSubProperty(a, 'b')).to.be.undefined;
    });

    it('should get nested properties', function() {
      var a = {
        b: {
          c: {
            d: 'value'
          }
        }
      };

      expect(Coral.commons.getSubProperty(a, 'b.c.d')).to.equal('value');
    });

    it('should get undefined nested properties', function() {
      var a = {
        b: {
          c: {}
        }
      };

      expect(Coral.commons.getSubProperty(a, 'b.c.d')).to.be.undefined;
    });
  });

  describe('#swapKeysAndValues', function() {
    it('should swap the keys and values of an object', function() {
      var obj = {
        a: 'z',
        b: 'y',
        c: 'x'
      };

      var swapped = Coral.commons.swapKeysAndValues(obj);

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

      var aggregate = Coral.commons.callAll(
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

      var aggregate = Coral.commons.callAll(
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

      var aggregate = Coral.commons.callAll(
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

      var aggregate = Coral.commons.callAll(noop, null, null);

      expect(aggregate).to.equal(noop);
    });

    it('should return the return value of the first valid function if nth argument is not a function', function() {
      function noop() {
      }
      function returnOne() {
        return 1;
      }

      var aggregate = Coral.commons.callAll(null, returnOne, null, noop, 2);

      var ret = aggregate();

      expect(ret).to.equal(1);
    });

    it('should still return a function if no functions provided', function() {
      var aggregate = Coral.commons.callAll(null, null, null);

      expect(aggregate).to.be.a('function');
    });
  });

  describe('#ready', function() {
    var ReadyA;
    var ReadyB;
    var ReadyC;
    var ReadyTest;
    var ReadyTestButton;
    var ReadyNestedInitialize;
    before(function() {
      ReadyTest = Coral.register({
        name: 'ReadyTest',
        tagName: 'coral-readytest',

        properties: {
          'sizeTest': {
            default: -1,
            attribute: 'sizetest',
            transform: Coral.transform.number,
            sync: function() {
              this.style.display = 'block';
              if (this.sizeTest >= 0) {
                this.style.width = this.sizeTest + 'px';
              }
            }
          }
        },

        _wasRenderCalled: false,
        _render: function() {

          if (ReadyTest._renderCallback) {
            ReadyTest._renderCallback(this);
          }
          this._wasRenderCalled = true;
        },

        _wasInitializeCalled: false,
        _initialize: function() {
          this._wasInitializeCalled = true;
        }
      });

      ReadyTestButton = Coral.register({
        name: 'ReadyTestButton',
        tagName: 'coral-readytestbutton',
        baseTagName: 'button'
      });

      ReadyNestedInitialize = Coral.register({
        name: 'ReadyNestedInitialize',
        tagName: 'coral-nestedinitialize',
        _initialize: function() {
          //just call _initializedCallback if defined by a test
          if (ReadyNestedInitialize._initializedCallback) {
            ReadyNestedInitialize._initializedCallback(this);
          }
        },
        _dummy: function() {} //just to test if component was initialized (and methods attached)
      });


      ReadyA = Coral.register({
        name: 'ReadyA',
        tagName: 'coral-ready-a',
        _render: function() {
          var el = document.createElement('coral-ready-b');
          this.appendChild(el);
        }
      });

      ReadyB = Coral.register({
        name: 'ReadyB',
        tagName: 'coral-ready-b',
        _render: function() {
          var el = document.createElement('coral-ready-c');
          this.appendChild(el);
        }
      });

      ReadyC = Coral.register({
        name: 'ReadyC',
        tagName: 'coral-ready-c'
      });

    });

    function makeEl(markup) {
      var el = document.createElement('div');
      el.innerHTML = markup;
      helpers.target.appendChild(el);
      return el;
    }
    function isCoralComponent(element) {
      if (element.tagName.indexOf('CORAL-') === 0) {
        return true;
      }
      else {
        var is = element.getAttribute('is');
        if (is && is.toUpperCase().indexOf('CORAL-') === 0) {
          return true;
        }
      }
      return false;
    }

    function expectComponentsToBeReady(el) {
      var childElements = el.getElementsByTagName('*');
      for (var i = 0; i < childElements.length; i++) {
        var childElement = childElements[i];
        if (isCoralComponent(childElement)) {
          expect(childElement._componentReady).to.equal(true);
        }
      }
    }

    it('should call the callback when all components are ready', function(done) {
      var el = makeEl(window.__html__['Coral.commons.ready.nested.html']);

      Coral.commons.ready(el, function() {
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should call the callback when all subcomponents components are ready (recursively)', function(done) {
      var el = document.createElement('coral-ready-a');
      Coral.commons.ready(el, function() {
        expect(el._componentReady).to.equal(true, 'coral-ready-a should be ready');
        expect(el.querySelector('coral-ready-b')._componentReady).to.equal(true, 'coral-ready-b should be ready');
        expect(el.querySelector('coral-ready-c')._componentReady).to.equal(true, 'coral-ready-c should be ready');

        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should correctly handle elements replaced after call to ready()', function(done) {
      var el = makeEl(window.__html__['Coral.commons.ready.nested.html']);

      Coral.commons.ready(el, function() {
        expectComponentsToBeReady(el);
        done();
      });

      // Wait a milisecond otherwise Mocha interferes with task scheduling and we hit the timeout
      setTimeout(function() {
        // Replace the content
        helpers.target.innerHTML = window.__html__['Coral.commons.ready.nested.html'];
      }, 1);
    });

    it('should correctly handle elements added after call to ready()', function(done) {
      var el = makeEl(window.__html__['Coral.commons.ready.nested.html']);

      Coral.commons.ready(el, function() {
        expectComponentsToBeReady(el);
        done();
      });

      // Add the same content again at the end
      // We can't do innerHTML += or things die
      helpers.target.insertAdjacentHTML('beforeend', window.__html__['Coral.commons.ready.nested.html']);
    });

    it('should work on a custom element with children', function(done) {
      /*
       We don't need a special case for this in code because of the order that custom elements are upgraded in
       Parent elements are upgraded first, we so we know the container has been upgraded if its children have been
       */
      var el = makeEl(
        '<coral-readytest id="container">' +
        window.__html__['Coral.commons.ready.nested.html'] +
        '</coral-readytest>'
      );

      var customEl = el.firstElementChild;

      expect(customEl.tagName).to.equal('CORAL-READYTEST');

      Coral.commons.ready(customEl, function() {
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should work on a custom element with no children', function(done) {
      var el = makeEl(
        '<coral-readytest id="container"></coral-readytest>'
      );

      var customEl = el.firstElementChild;

      expect(customEl.tagName).to.equal('CORAL-READYTEST');

      Coral.commons.ready(customEl, function() {
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should with custom elements that use is=""', function(done) {
      var el = makeEl(
        '<button is="coral-readytestbutton"></button>'
      );

      var customEl = el.firstElementChild;

      Coral.commons.ready(customEl, function() {
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should call the callback asynchronously even if all elements are already upgraded', function(done) {
      var el = document.createElement('div');
      el.appendChild(new ReadyTest());
      el.appendChild(new ReadyTest());
      el.appendChild(new ReadyTest());

      var asyncCallback = false;
      Coral.commons.ready(el, function(){
        expect(asyncCallback).to.be.true;
        done();
      });
      asyncCallback = true;

    });

    it('should be possible to check child components using Coral.commons.ready() method inside of _initialize() method', function(done) {
      //when you check if one of your custom child components is initialized inside an _initialize method,
      //you have to make sure that it works for native implementations of CustomElement and Polyfills
      ReadyNestedInitialize._initializedCallback = function(el) {
        ReadyNestedInitialize._initializedCallback = null;
        var outer = el;
        var nestedChild = outer.querySelector('#nested_child');
        Coral.commons.ready(nestedChild, function() {
          expect(outer._dummy).to.exist;
          expect(nestedChild._dummy).to.exist; //nestedChild._dummy used to be undefined in chrome
          done();
        });
      };

      makeEl(window.__html__['Coral.commons.ready.nested.html']);
    });

    it('should be possible to use Coral.commons.ready callback asynchronously for all browser', function(done) {
      var asyncCallback = false;
      var el = makeEl('<coral-readytest id="container"/>');
      Coral.commons.ready(el, function() {
        expect(asyncCallback).to.be.true;
        done();
      });
      asyncCallback = true;
    });

    it('should be possible to check child components using Coral.commons.ready() method inside of _initialize()', function(done) {
      var asyncCallback = false;
      ReadyNestedInitialize._initializedCallback = function(el) {
        ReadyNestedInitialize._initializedCallback = null;
        var outer = el;
        var nestedChild = outer.querySelector('#nested_child');
        Coral.commons.ready(nestedChild, function() {
          expect(asyncCallback).to.be.true;
          done();
        });
      };

      makeEl(window.__html__['Coral.commons.ready.nested.html']);
      asyncCallback = true;
    });

    it('should be possible to grab the right component size inside Coral.commons.ready callback', function(done) {

      ReadyTest._renderCallback = function(el) {
        ReadyTest._renderCallback = null;
        el.innerHTML = 'Terry Pratchett';
      };

      var el = makeEl('<coral-readytest id="container"/>');
      var readyTestEl = el.firstChild;

      Coral.commons.ready(readyTestEl, function() {
        expect(readyTestEl.offsetWidth > 0).to.be.true;
        done();
      });
    });

    it('should be consistent to grab the component size inside Coral.commons.ready callback if component is altered on nextFrame', function(done) {
      //considering that components may wait a frame to update the DOM based on their initial attributes,
      //will folks using Coral.commons.ready() measure elements and get incorrect results in Chrome (as chrome calls ready synchronously),
      //but correct results in other browsers?

      var el = makeEl('<coral-readytest id="container"/>');
      var readyTestEl = el.firstChild;
      Coral.commons.nextFrame(function() {
        readyTestEl.innerHTML = 'Terry Pratchett';
      });

      Coral.commons.nextFrame(function() {
        expect(readyTestEl.innerHTML).to.equal('Terry Pratchett');
        expect(readyTestEl.offsetWidth > 0).to.be.true;
        done();
      });
    });

    it('should be possible to grab the right component size only after property sync was called', function(done) {

      var el = makeEl('<coral-readytest sizetest="100" id="container"/>');
      var readyTestEl = el.firstChild;
      Coral.commons.ready(readyTestEl, function() {

        expect(readyTestEl._wasRenderCalled).to.be.true;
        expect(readyTestEl._wasInitializeCalled).to.be.true;

        expect(readyTestEl.sizeTest).to.equal(100);
        expect(readyTestEl.offsetWidth).to.equal(100);

        done();

      });
    });

    it('should call the callback asynchronously even if WebComponentsReady has been fired', function() {
      // This will have already happened, but trigger it anyway
      document.dispatchEvent(
        new CustomEvent('WebComponentsReady', {
          bubbles: true
        })
      );

      var asyncCallback = false;
      Coral.commons.ready(function(){
        expect(asyncCallback).to.be.true;
      });
      asyncCallback = true;
    });

    it('should pass the container element to the callback', function(done) {
      var el = makeEl(window.__html__['Coral.commons.ready.nested.html']);

      Coral.commons.ready(el, function(passedEl) {
        expect(passedEl).to.equal(el);
        done();
      });
    });

    it('should pass window to the callback when no element passed', function(done) {
      // This will have already happened, but trigger it anyway
      document.dispatchEvent(
        new CustomEvent('WebComponentsReady', {
          bubbles: true
        })
      );

      Coral.commons.ready(function(el) {
        expect(el).to.equal(window);
        done();
      });
    });

    it('should work with custom elements that are disabled', function(done) {
      var el = makeEl(
        '<coral-readytest disabled></coral-readytest>'
      );

      var customEl = el.firstElementChild;

      Coral.commons.ready(customEl, function() {
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should work with custom elements that use is="..." and are disabled', function(done) {
      var el = makeEl(
        '<button is="coral-readytestbutton" disabled></button>'
      );

      var customEl = el.firstElementChild;

      Coral.commons.ready(customEl, function() {
        // This test used to fail in FF
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should work with nested custom elements where child elements use is="..." and are disabled', function(done) {
      var el = makeEl(
        '<coral-readytest>' +
        '<button is="coral-readytestbutton" disabled>' +
        '<button is="coral-readytestbutton" disabled>' +
        '</button>' +
        '</button>' +
        '</coral-readytest>'
      );

      var customEl = el.firstElementChild;

      Coral.commons.ready(customEl, function() {
        // This test used to fail in FF
        expectComponentsToBeReady(el);
        done();
      });
    });

    it('should work with nested custom elements where all use is="..." and are disabled', function(done) {
      var el = makeEl(
        '<button is="coral-readytestbutton" disabled>' +
        '<button is="coral-readytestbutton" disabled>' +
        '<button is="coral-readytestbutton" disabled>' +
        '</button>' +
        '</button>' +
        '</button>'
      );

      var customEl = el.firstElementChild;

      Coral.commons.ready(customEl, function() {
        // This test used to fail in FF
        expectComponentsToBeReady(el);
        done();
      });
    });

  });

  describe('#transitionEnd', function() {

    it('should call the provided callback (even if the browser does not support transitions)', function(done) {
      var el = document.createElement('div');
      var asyncCallback = false;
      var animate = function() {
        el.style.marginTop = '10px';
      };

      el.setAttribute('style', '-webkit-transition: all 100ms ease; -moz-transition: all 100ms ease; -o-transition: all 100ms ease; transition: all 100ms ease;');
      helpers.target.appendChild(el);
      Coral.commons.transitionEnd(el, function(event) {
        expect(el).to.equal(event.target);

        // In most browsers the callback should be asynchronous (except for browsers where transition is not supported e.g. IE 9)
        // expected: IE9 asyncCallback === false && event.cssTransitionSupported === false
        // expected in other browsers: asyncCallback === true && event.cssTransitionSupported === true
        expect(asyncCallback).to.equal(event.cssTransitionSupported);

        // I'm not sure if we should include the next line as the fallback timeout is included on purpose but should
        // normally only be necessary seldom (e.g.: IE10/IE11 sometimes)
        // if cssTransition is supported the transition should normally not be ended by the timeout
        // expect(event.transitionStoppedByTimeout).to.equal(!event.cssTransitionSupported);

        done();
      });

      asyncCallback = true;

      // Wait a moment after the append before triggering the animation otherwise transitionend event doesn't fire
      setTimeout(animate, 1);
    });

    it('should only call the transitionEnd callback once', function(done) {
      var el = document.createElement('div');
      var spy = sinon.spy();
      var animate = function() {
        el.style.marginTop = '10px';

        setTimeout(function() {
          expect(spy.callCount).to.equal(1);
          done();
        }, 200); // transition-duration (ms) + 100ms
      };

      el.setAttribute('style', '-webkit-transition: all 100ms ease; -moz-transition: all 100ms ease; -o-transition: all 100ms ease; transition: all 100ms ease;');
      helpers.target.appendChild(el);
      Coral.commons.transitionEnd(el, spy);

      // Wait a moment after the append before triggering the animation otherwise transitionend event doesn't fire
      setTimeout(animate, 1);
    });

    it('per default transitionEnd is automatically unregistered after one callback', function(done) {
      var el = document.createElement('div');
      var spy = sinon.spy();
      var wait = 150; // transition-duration (ms) + 100ms

      el.setAttribute('style', '-webkit-transition: all 50ms ease; -moz-transition: all 50ms ease; -o-transition: all 50ms ease; transition: all 50ms ease;');
      helpers.target.appendChild(el);
      Coral.commons.transitionEnd(el, spy);

      // Wait a moment after the append before triggering the animation otherwise transitionend event doesn't fire
      setTimeout(function() {
        el.style.marginTop = '10px';
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
      var markup = '<div></div>';
      helpers.build(markup, function(div) {
        Coral.commons.addResizeListener(div, function() {
          done();
        });
      });
    });

    it('should call the provided callback whenever the size of the element is changed (due to content change)', function(done) {
      var markup = '<div><div id="container"></div></div>';
      helpers.build(markup, function(div) {
        var innerContentWasAdded = false;
        var innerContentWasRemovedAgain = false;
        var container = document.getElementById('container');
        Coral.commons.addResizeListener(div, function() {
          var containerHTML = '<div>Test</div>';
          if (!innerContentWasAdded) {
            container.innerHTML = containerHTML;
            innerContentWasAdded = true;
          }
          else if (!innerContentWasRemovedAgain) {
            expect(container.innerHTML).to.equal(containerHTML, 'inner content should now be set and a resize has been called');
            container.innerHTML = '';
            innerContentWasRemovedAgain = true;
          }
          else {
            expect(container.innerHTML).to.equal('', 'inner content should now be removed again and a resize has been called');
            done();
          }
        });
      });
    });

    it('should be possible to listen to resize events even if element is initially hidden', function(done) {
      var markup = '<div style="display:none;"></div>';
      helpers.build(markup, function(div) {
        Coral.commons.addResizeListener(div, function() {
          done();
        });
        div.style.display = 'block';
      });
    });

    it('should be possible to listen to resize events even if parent is initially hidden', function(done) {
      var markup = '<div id="parent" style="display:none;"><div id="child"></div></div>';
      helpers.build(markup, function(div) {
        var parentEl = document.getElementById('parent');
        var childEl = document.getElementById('child');
        Coral.commons.addResizeListener(childEl, function() {
          done();
        });
        parentEl.style.display = 'block';
      });
    });

    it('should be possible get notified when sizeof the element is changed via css', function(done) {
      var markup = '<div style="width:50px; height: 50px;"></div>';
      helpers.build(markup, function(div) {
        var widthWasChanged = false;
        Coral.commons.addResizeListener(div, function() {
          if (widthWasChanged) {
            expect(div.style.width).to.equal('70px', 'width of div should be 70px');
            done();
          }
        });

        widthWasChanged = true;
        div.style.width = '70px';
      });
    });

    it('should be possible get notified when size is changed due to css change anywhere hierarchy', function(done) {
      var markup = '<div id="parent" style="width:50px; height: 50px;"><div id="child" style="width:100%; height: 100%;" ></div></div>';
      helpers.build(markup, function(div) {
        var parentEl = document.getElementById('parent');
        var childEl = document.getElementById('child');
        var widthOfParentWasSet = false;
        Coral.commons.addResizeListener(childEl, function() {
          if (widthOfParentWasSet) {
            expect(parentEl.style.width).to.equal('70px', 'width of parent should be 70px');
            done();
          }
        });

        widthOfParentWasSet = true;
        parentEl.style.width = '70px';
      });
    });
  });

  describe('#removeResizeListener', function() {
    it('should be possible to remove a resize listener if no longer needed', function(done) {
      var markup = '<div style="width:50px; height: 50px;"></div>';
      helpers.build(markup, function(div) {

        var isCallbackDetached = false;
        var resizeCallback = function() {

          // This resize callback should only be called once as we detach it after the first time
          expect(isCallbackDetached).to.be.false;
          isCallbackDetached = true;
          Coral.commons.removeResizeListener(div, resizeCallback);

          // Force a resize of the element
          div.style.width = '70px';

          window.setTimeout(function() {
            // If after a short time resize was not triggered again we are sure that removeResizeListener did work
            expect(div.style.width).to.equal('70px', 'width of div should be 70px');
            done();
          }, 500);
        };

        Coral.commons.addResizeListener(div, resizeCallback);
      });
    });
  });
});
