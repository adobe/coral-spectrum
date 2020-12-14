/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {keys, Keys} from '../../../coral-utils';

describe('keys', function () {
  it('should have a numeric keycode', function () {
    var spy = sinon.spy();
    keys.on('a', spy);
    helpers.keypress('a');
    expect(spy.args[0][0].keyCode).to.be.a('number');
    keys.on('return', spy);
    helpers.keypress('return');
    expect(spy.args[1][0].keyCode).to.be.a('number');
  });

  it('should support single key shortcuts', function () {
    var spy = sinon.spy();
    keys.on('a', spy);
    helpers.keypress('a');
    expect(spy.callCount).to.equal(1);
    helpers.keypress('a');
    expect(spy.callCount).to.equal(2);
  });

  it('should not explode when keyevent originates from an element that is not in the DOM', function () {
    var childBSpy = sinon.spy();
    var parentASpy = sinon.spy();
    var parentBSpy = sinon.spy();

    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    div1.appendChild(div2);

    helpers.target.appendChild(div1);

    var customKeys = new Keys(div1);

    customKeys.on('b', function (event) {
      // Remove the node
      event.target.parentNode.removeChild(event.target);
      childBSpy();
    });

    keys.on('a', parentASpy);
    keys.on('b', parentBSpy);

    helpers.keypress('b', div2);

    // We should get the event locally
    expect(childBSpy.callCount).to.equal(1, 'childBSpy call count after B keypress');
    // We should still be able to get the keycombo event globally
    expect(parentBSpy.callCount).to.equal(1, 'parentBSpy call count after B keypress');

    helpers.keypress('a');

    // We should get other keycombos without interference as a result of removing the target
    expect(parentASpy.callCount).to.equal(1, 'parentASpy call count after A keypress');
  });

  it('should support key combinations with modifiers', function () {
    var spies = {};
    spies.a = sinon.spy();
    spies.shiftA = sinon.spy();
    spies.ctrlShiftA = sinon.spy();
    spies.commandCtrlShiftA = sinon.spy();
    spies.commandCtrlAltShiftA = sinon.spy();
    spies.meta = sinon.spy();

    keys.on('command+c', spies.meta);

    helpers.keydown('c', null, ['meta'], 91);
    helpers.keyup('c', null);

    expect(spies.meta.callCount).to.equal(1, 'Command+C keypress count');

    helpers.keydown('c', null, ['meta'], 224);
    helpers.keyup('c', null);

    expect(spies.meta.callCount).to.equal(2, 'Command+C keypress count');

    keys.on('a', spies.a);
    keys.on('shift+a', spies.shiftA);
    keys.on('ctrl+shift+a', spies.ctrlShiftA);
    keys.on('command+ctrl+shift+a', spies.commandCtrlShiftA);
    keys.on('command+ctrl+alt+shift+a', spies.commandCtrlAltShiftA);

    helpers.keydown('a');
    helpers.keyup('a');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(0, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(0, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(0, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('shift');
    helpers.keydown('a', null, ['shift']);
    helpers.keyup('a');
    helpers.keyup('shift');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(0, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(0, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('shift');
    helpers.keydown('control');
    helpers.keydown('a', null, ['shift', 'control']);
    helpers.keyup('a');
    helpers.keyup('shift');
    helpers.keyup('control');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(0, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('command');
    helpers.keydown('shift');
    helpers.keydown('control');
    helpers.keydown('a', null, ['command', 'shift', 'control']);
    helpers.keyup('a');
    helpers.keyup('shift');
    helpers.keyup('control');
    helpers.keyup('command');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(1, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(0, 'Command+Ctrl+Alt+Shift+A keypress count');

    helpers.keydown('alt');
    helpers.keydown('command');
    helpers.keydown('shift');
    helpers.keydown('control');
    helpers.keydown('a', null, ['alt', 'command', 'shift', 'control']);
    helpers.keyup('a');
    helpers.keyup('shift');
    helpers.keyup('control');
    helpers.keyup('command');
    helpers.keyup('alt');

    expect(spies.a.callCount).to.equal(1, 'A keypress count');
    expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
    expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlShiftA.callCount).to.equal(1, 'Command+Ctrl+Shift+A keypress count');
    expect(spies.commandCtrlAltShiftA.callCount).to.equal(1, 'Command+Ctrl+Alt+Shift+A keypress count');
  });

  it('should unbind a single key listener', function () {
    var spy = sinon.spy();
    keys.on('a', spy);
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy.callCount).to.equal(1);
    keys.off('a', spy);
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy.callCount).to.equal(1);
  });

  it('should unbind all listeners for a key', function () {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    keys.on('a', spy1);
    keys.on('a', spy2);
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy1.callCount).to.equal(1);
    expect(spy2.callCount).to.equal(1);
    keys.off('a');
    helpers.keydown('a');
    helpers.keyup('a');
    expect(spy1.callCount).to.equal(1);
    expect(spy2.callCount).to.equal(1);
  });

  it('should unbind multiple key combinations with modifiers', function () {
    var spies = {};
    spies.a = sinon.spy();
    spies.shiftA = sinon.spy();
    spies.ctrlShiftA = sinon.spy();
    spies.commandCtrlShiftA = sinon.spy();
    spies.commandCtrlAltShiftA = sinon.spy();

    keys.on('a', spies.a);
    keys.on('shift+a', spies.shiftA);
    keys.on('ctrl+shift+a', spies.ctrlShiftA);
    keys.on('command+ctrl+shift+a', spies.commandCtrlShiftA);
    keys.on('command+ctrl+alt+shift+a', spies.commandCtrlAltShiftA);

    function pressKeys() {
      helpers.keydown('a');
      helpers.keyup('a');

      helpers.keydown('shift');
      helpers.keydown('a', null, ['shift']);
      helpers.keyup('a');
      helpers.keyup('shift');

      helpers.keydown('shift');
      helpers.keydown('control');
      helpers.keydown('a', null, ['shift', 'control']);
      helpers.keyup('a');
      helpers.keyup('shift');
      helpers.keyup('control');

      helpers.keydown('command');
      helpers.keydown('shift');
      helpers.keydown('control');
      helpers.keydown('a', null, ['command', 'shift', 'control']);
      helpers.keyup('a');
      helpers.keyup('shift');
      helpers.keyup('control');
      helpers.keyup('command');

      helpers.keydown('alt');
      helpers.keydown('command');
      helpers.keydown('shift');
      helpers.keydown('control');
      helpers.keydown('a', null, ['alt', 'command', 'shift', 'control']);
      helpers.keyup('a');
      helpers.keyup('shift');
      helpers.keyup('control');
      helpers.keyup('command');
      helpers.keyup('alt');
    }

    function testSpies() {
      expect(spies.a.callCount).to.equal(1, 'A keypress count');
      expect(spies.shiftA.callCount).to.equal(1, 'Shift+A keypress count');
      expect(spies.ctrlShiftA.callCount).to.equal(1, 'Ctrl+Shift+A keypress count');
      expect(spies.commandCtrlShiftA.callCount).to.equal(1, 'Command+Ctrl+Shift+A keypress count');
      expect(spies.commandCtrlAltShiftA.callCount).to.equal(1, 'Command+Ctrl+Alt+Shift+A keypress count');
    }

    pressKeys();
    testSpies();

    keys.off('a', spies.a);
    keys.off('shift+a', spies.shiftA);
    keys.off('ctrl+shift+a', spies.ctrlShiftA);
    keys.off('command+ctrl+shift+a', spies.commandCtrlShiftA);
    keys.off('command+ctrl+alt+shift+a', spies.commandCtrlAltShiftA);

    pressKeys();
    testSpies();
  });

  it('should support fancy modifier keys', function () {
    var sequence = '';
    keys.on('⌃+a', function () {
      sequence += 'a';
    });
    keys.on('⌥+b', function () {
      sequence += 'b';
    });
    keys.on('⇧+c', function () {
      sequence += 'c';
    });
    keys.on('⌘+d', function () {
      sequence += 'd';
    });

    helpers.keydown('control');
    helpers.keydown('a', null, ['control']);
    helpers.keyup('a');
    helpers.keyup('control');

    helpers.keydown('option');
    helpers.keydown('b', null, ['alt']);
    helpers.keyup('b');
    helpers.keyup('option');

    helpers.keydown('shift');
    helpers.keydown('c', null, ['shift']);
    helpers.keyup('c');
    helpers.keyup('shift');

    helpers.keydown('command');
    helpers.keydown('d', null, ['command']);
    helpers.keyup('d');
    helpers.keyup('command');

    expect(sequence).to.equal('abcd');
  });

  it('should support listeners on F keys', function () {
    var sequence = '';

    function makeSequencer(index) {
      return function () {
        sequence += '.' + index;
      };
    }

    // Add listeners for each F key
    for (var i = 1 ; i <= 19 ; i++) {
      keys.on('f' + i, makeSequencer(i));
    }

    // Trigger a keypress on each F key
    for (var j = 1 ; j <= 19 ; j++) {
      helpers.keypress(111 + j);
    }

    expect(sequence).to.equal('.1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19');
  });

  it('should support non-alphanumeric keys', function () {
    var sequence = '';
    const characters = ['plus', 'minus', '+', ',', '.', '/', '=', ';', '\'', ']', '\\'];

    function makeSequencer(character) {
      return function () {
        sequence += character;
      };
    }

    characters.forEach((character) => {
      keys.on(character, makeSequencer(character));
      helpers.keypress(character);
    });

    expect(sequence).to.equal('plusminus+,./=;\']\\');

    characters.forEach((character) => {
      keys.off(character);
      helpers.keypress(character);
    });

    expect(sequence).to.equal('plusminus+,./=;\']\\');

    // Test the key "[" separately because the key charcode which is generated with the keyhelper is reserved inside
    // the implementation with the modifier key 91
    sequence = '';
    keys.on('[', makeSequencer('['));
    helpers.keypress(221, null, null, '[');
    expect(sequence).to.equal('[');
  });

  it('should support whitespace keys', function () {
    var enterSpy = sinon.spy();
    var spaceSpy = sinon.spy();

    keys.on('enter', enterSpy);
    keys.on('space', spaceSpy);
    keys.on(' ', spaceSpy);

    helpers.keypress(32); // space
    expect(spaceSpy.callCount).to.equal(2, 'Space key was pressed');
    helpers.keypress(13); // enter
    expect(enterSpy.callCount).to.equal(1, 'Enter key was pressed');
  });

  it('should support both the top row of number keys and the numeric keypad', function () {
    // An array of pairs of identical keys
    var keysMap = [
      [96, 48],
      [97, 49],
      [98, 50],
      [99, 51],
      [100, 52],
      [101, 53],
      [102, 54],
      [103, 55],
      [104, 56],
      [105, 57]
    ];

    var i;
    var spies = [];

    function makeSpy(i) {
      var spy = spies[i] = sinon.spy();
      return spy;
    }

    // Add a listener for each number
    for (i = 0 ; i < keysMap.length ; i++) {
      keys.on(i, makeSpy(i));
    }

    // Trigger a keypress on each key for a given number
    for (i = 0 ; i < keysMap.length ; i++) {
      helpers.keypress(keysMap[i][0]);
      helpers.keypress(keysMap[i][1]);
    }

    for (i = 0 ; i < keysMap.length ; i++) {
      expect(spies[i].callCount).to.equal(2, 'Spy ' + i + ' should be called twice');
    }
  });

  it('should not trigger handlers when an event originates from an input', function () {
    var spy = sinon.spy();
    keys.on('a', spy);

    helpers.build(window.__html__['keys.inputs.html']);

    // Trigger key events
    helpers.keypress('a', document.getElementById('input_text'));
    expect(spy.callCount).to.equal(0, 'Call count after A keypress in input');

    helpers.keypress('a', document.getElementById('textarea'));
    expect(spy.callCount).to.equal(0, 'Call count after A keypress in textarea');

    helpers.keypress('a', document.getElementById('select'));
    expect(spy.callCount).to.equal(0, 'Call count after A keypress in select');

    helpers.keypress('a', document.getElementById('editable'));
    expect(spy.callCount).to.equal(0, 'Call count after A keypress in contenteditable');
  });

  it('should trigger handler when an event originates from an input if key is escape', function () {
    var spy = sinon.spy();
    keys.on('escape', spy);

    helpers.build(window.__html__['keys.inputs.html']);

    // Trigger key events
    helpers.keypress('escape', document.getElementById('input_text'));
    expect(spy.callCount).to.equal(1, 'Call count after ESC keypress in input');

    helpers.keypress('escape', document.getElementById('textarea'));
    expect(spy.callCount).to.equal(2, 'Call count after ESC keypress in textarea');

    helpers.keypress('escape', document.getElementById('select'));
    expect(spy.callCount).to.equal(3, 'Call count after ESC keypress in select');

    helpers.keypress('escape', document.getElementById('editable'));
    expect(spy.callCount).to.equal(4, 'Call count after ESC keypress in contenteditable');
  });

  it('should initialize itself when called with new', function () {
    var noop = function () {
    };

    var keysWithNew = new Keys(window);
    expect(function () {
      keysWithNew.on('a', noop);
    }).to.not.throw(Error, null, 'Instance created with new should not throw');

    // Clean up
    keysWithNew.destroy();
  });

  it('should throw when not passed element to scope', function () {
    expect(function () {
      Keys();
    }).to.throw(Error, null);
  });

  it('should set context correctly', function () {
    var obj = {};
    var keys = new Keys(document.body, {
      context: obj
    });
    keys.on('a', function () {
      expect(this).to.equal(obj);
    });

    // Trigger a key event on the document
    helpers.keypress('a');

    keys.destroy();
  });

  it('should be chainable', function () {
    var keys = new Keys(document.documentElement);
    var noop = function () {
    };

    expect(keys.init()).to.equal(keys);
    expect(keys.on('a', noop)).to.equal(keys);
    expect(keys.off('a', noop)).to.equal(keys);
    expect(keys.reset()).to.equal(keys);
    expect(keys.destroy()).to.equal(keys);
  });

  it('should support a map of keyCombos to handlers', function () {
    var aSpy = sinon.spy();
    var bSpy = sinon.spy();

    var keys = new Keys(document.documentElement);

    keys.on({
      'a': aSpy,
      'b': bSpy
    });

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(1, 'A spy call count after A keypress');
    expect(bSpy.callCount).to.equal(0, 'B spy call count after A keypress');

    helpers.keypress('b');
    expect(aSpy.callCount).to.equal(1, 'A spy call count after A keypress');
    expect(bSpy.callCount).to.equal(1, 'B spy call count after A keypress');
  });

  it('should support a map of keyCombos to handlers with delegation', function () {
    const snippet = helpers.build(window.__html__['keys.keyComboMapWithDelegation.html']);

    var aSpy = sinon.spy();
    var bSpy = sinon.spy();

    var keys = new Keys(snippet);

    keys.on({
      'a': aSpy,
      'b': bSpy
    }, '#someDiv');

    helpers.keypress('a', snippet);
    expect(aSpy.callCount).to.equal(0, 'A spy call count after A keypress on outer element');
    helpers.keypress('b', snippet);
    expect(bSpy.callCount).to.equal(0, 'B spy call count after A keypress on outer element');

    helpers.keypress('a', document.getElementById('someDiv'));
    expect(aSpy.callCount).to.equal(1, 'A spy call count after A keypress on delegate');
    helpers.keypress('b', document.getElementById('someDiv'));
    expect(bSpy.callCount).to.equal(1, 'B spy call count after A keypress on delegate');
  });

  it('should support event namespaces', function () {
    var aSpy = sinon.spy();
    var aSpyNS = sinon.spy();
    var otherASpyNS = sinon.spy();

    var keys = new Keys(document.documentElement);

    keys.on('a', aSpy);
    keys.on('a.myNS', aSpyNS);
    keys.on('a.myNS', otherASpyNS);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(1, 'A spy call count after first A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'Namespaced A spy call count after first A keypress');
    expect(otherASpyNS.callCount).to.equal(1, 'Other namespaced A spy call count after first A keypress');

    // Remove only one namespaced listener
    keys.off('a.myNS', aSpyNS);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'A spy call count after off(a.myNS, aSpyNS) and second A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'Namespaced A spy call count after off(a.myNS, aSpyNS) and second A keypress');
    expect(otherASpyNS.callCount).to.equal(2, 'Other namespaced A spy call count after off(a.myNS, aSpyNS) and second A keypress');

    // Remove a non-namespaced A event
    keys.off('a', aSpy);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'A spy call count after off(a, aSpy) and third A keypress');
    expect(otherASpyNS.callCount).to.equal(3, 'Other namespaced A spy call count after off(a, aSpy) and third A keypress');

    // Remove all A events
    keys.off('a');

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'A spy call count after off(a) and fourth A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'Namespaced A spy call count after off(a) and fourth A keypress');
    expect(otherASpyNS.callCount).to.equal(3, 'Other namespaced A spy call count after off(a) and fourth A keypress');

    keys.destroy();
  });

  it('should remove all listeners for a given namespace when provided with only the namespace', function () {
    var aSpyNS = sinon.spy();
    var bSpyNS = sinon.spy();
    var aSpy = sinon.spy();

    var keys = new Keys(document.documentElement);

    keys.on('a', aSpy);
    keys.on('a.myNS', aSpyNS);
    keys.on('b.myNS', bSpyNS);

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(1, 'Non-namespaced A spy call count after A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'A spy call count after A keypress');

    helpers.keypress('b');
    expect(bSpyNS.callCount).to.equal(1, 'B spy call count after B keypress');

    // Remove all events for a given namespace, irrespective of key combo
    keys.off('.myNS');

    helpers.keypress('a');
    expect(aSpy.callCount).to.equal(2, 'Non-namespaced A spy call count after off called with .myNS and A keypress');
    expect(aSpyNS.callCount).to.equal(1, 'A spy call count after off called with .myNS and A keypress');

    helpers.keypress('b');
    expect(bSpyNS.callCount).to.equal(1, 'B spy call count after off called with .myNS and B keypress');

    keys.destroy();
  });

  it('should support custom filter functions', function () {
    const snippet = helpers.build(window.__html__['keys.filter.html']);

    var filterSpy = sinon.spy();
    var handlerSpy = sinon.spy();
    var keys = new Keys(snippet, {
      filter: function (event) {
        filterSpy();
        // Don't register keypresses triggered on a div
        return event.target.tagName !== 'DIV';
      }
    });

    keys.on('a', handlerSpy);

    helpers.keypress('a', document.getElementById('someDiv'));
    expect(filterSpy.callCount).to.equal(1, 'Filter call count after first keypress');
    expect(handlerSpy.callCount).to.equal(0, 'Handler call count after keypress on element that fails filter test');

    helpers.keypress('a', document.getElementById('someSpan'));
    expect(filterSpy.callCount).to.equal(2, 'Filter call count after second keypress');
    expect(handlerSpy.callCount).to.equal(1, 'Handler call count after keypress on element that passes filter test');

    keys.destroy();
  });

  it('should support event delegation', function () {
    var spy = sinon.spy();

    keys.on('a', '#delegateDiv', spy);

    helpers.build(window.__html__['keys.delegation.html']);

    // Trigger a key event on the document
    helpers.keypress('a');
    expect(spy.callCount).to.equal(0);

    // Trigger a key event on another div
    helpers.keypress('a', document.getElementById('someOtherDiv'));
    expect(spy.callCount).to.equal(0);

    // Trigger a key event on the target div
    helpers.keypress('a', document.getElementById('delegateDiv'));
    expect(spy.callCount).to.equal(1);
  });

  it('should set original keys that triggered the event', function () {
    var spy = sinon.spy();
    keys.on('c-s', spy);
    keys.on('t', spy);
    keys.on('shift+q', spy);

    helpers.keypress('c');
    helpers.keypress('s');
    expect(spy.callCount).to.equal(1);
    expect(spy.args[0][0].keys).to.equal('c-s');

    spy.resetHistory();
    helpers.keypress('t');
    expect(spy.callCount).to.equal(1);
    expect(spy.args[0][0].keys).to.equal('t');

    spy.resetHistory();
    helpers.keydown('q', null, ['shift']);
    expect(spy.callCount).to.equal(1);
    expect(spy.args[0][0].keys).to.equal('shift+q');
  });

  it('should set event.matchedTarget correctly', function () {
    var spy = sinon.spy();

    var keys = new Keys(document.body);

    var matchedTarget;
    keys.on('a', '#delegateDiv', function (event) {
      matchedTarget = event.matchedTarget;
      spy();
    });

    helpers.build(window.__html__['keys.delegation.html']);
    // Trigger a key event on the document
    helpers.keypress('a', document.getElementById('delegateDiv'));

    expect(spy.callCount).to.equal(1);
    expect(matchedTarget).to.equal(document.getElementById('delegateDiv'));

    keys.destroy();
  });

  it('should unbind delegated events', function () {
    var globalSpy = sinon.spy();
    var otherSpy = sinon.spy();
    var delegateSpy = sinon.spy();

    keys.on('a', globalSpy);
    keys.on('a', otherSpy);
    keys.on('a', '#delegateDiv', delegateSpy);

    helpers.build(window.__html__['keys.delegation.html']);
    // Trigger a key event on the document
    helpers.keypress('a');
    expect(globalSpy.callCount).to.equal(1);
    expect(delegateSpy.callCount).to.equal(0);

    // Trigger a key event on another div
    helpers.keypress('a', document.getElementById('someOtherDiv'));
    expect(globalSpy.callCount).to.equal(2);
    expect(delegateSpy.callCount).to.equal(0);

    // Remove the other global event listener
    // This is to see if the delegate listener or other global listener is blown away
    keys.off('a', otherSpy);

    // Trigger a key event on the target div
    helpers.keypress('a', document.getElementById('delegateDiv'));
    expect(globalSpy.callCount).to.equal(3);
    expect(delegateSpy.callCount).to.equal(1);

    // Remove delegate event listener
    // This is to see if the global listener is blown away
    keys.off('a', '#delegateDiv', delegateSpy);

    // Trigger a key event on the target div
    helpers.keypress('a', document.getElementById('delegateDiv'));
    expect(globalSpy.callCount).to.equal(4);
    expect(delegateSpy.callCount).to.equal(1);
  });

  it('should support event data', function () {
    var keys = new Keys(document.documentElement);

    var obj = {};
    keys.on('a', obj, function (event) {
      expect(event.data).to.equal(obj);
    });

    helpers.keypress('a');
  });

  it('should support event data with delegation', function () {
    const snippet = helpers.build(window.__html__['keys.dataWithDelegation.html']);
    var spy = sinon.spy();

    var keys = new Keys(snippet);
    var obj = {};
    keys.on('a', '#someDiv', obj, function (event) {
      spy();
      expect(event.data).to.equal(obj);
    });

    // Trigger on the outer element
    helpers.keypress('a', snippet);
    expect(spy.callCount).to.equal(0);

    // Trigger on the delegate element
    helpers.keypress('a', document.getElementById('someDiv'));
    expect(spy.callCount).to.equal(1);
  });

  it('should scope events to a given element', function () {
    const snippet = helpers.build(window.__html__['keys.scoped.html']);

    var spy = sinon.spy();

    var keys = new Keys(snippet);
    keys.on('a', spy);

    // Trigger a key event on the document
    helpers.keypress('a');
    expect(spy.callCount).to.equal(0);

    // Trigger a key event on the div itself
    helpers.keypress('a', snippet);

    expect(spy.callCount).to.equal(1);

    // Trigger a key event on a child of the div
    helpers.keypress('a', snippet.firstElementChild);

    expect(spy.callCount).to.equal(2);

    // Remove the listener
    keys.off('a', spy);

    // Trigger a few keypresses
    helpers.keypress('a', snippet);
    helpers.keypress('a', snippet.firstElementChild);

    expect(spy.callCount).to.equal(2);
  });

  it('should allow event delegation to immediate children', function () {
    const snippet = helpers.build(window.__html__['keys.scoped.html']);

    var spy = sinon.spy();

    var keys = new Keys(snippet);
    keys.on('a', '> div', spy);

    // Trigger a key event on the document
    helpers.keypress('a');
    expect(spy.callCount).to.equal(0);

    // Trigger a key event on the div itself
    helpers.keypress('a', snippet);
    expect(spy.callCount).to.equal(0);

    // Trigger a key event on the inner child
    helpers.keypress('a', document.getElementById('inner'));
    expect(spy.callCount).to.equal(0);

    // Trigger a key event on the inner child
    helpers.keypress('a', document.getElementById('outer'));
    expect(spy.callCount).to.equal(1);
  });

  it('should support focus shifting away from element on keydown but before keyup (CUI-3319)', function () {
    var div = document.createElement('div');
    helpers.target.appendChild(div);

    var keys = new Keys(div);
    var spy = sinon.spy();

    keys.on('return', spy);

    // Simulates the event handler shifting focus to something other than the element on keydown
    // but before keyup. When the keyup occurs, keys needs to properly clear out the "return"
    // key from its key registry.
    helpers.keydown('return', div);
    helpers.keyup('return', document.body);

    helpers.keydown('down', div);
    // If "return" wasn't properly cleared, this keyup would make the "return" event trigger again.
    helpers.keyup('down', div);

    expect(spy.callCount).to.equal(1);
  });

  describe('sequences', function () {
    it('should support two key sequences', function () {
      var spy = sinon.spy();
      keys.on('a-b', spy);
      helpers.keypress('a');
      helpers.keypress('b');
      expect(spy.callCount).to.equal(1);
    });

    it('should support three key sequences', function () {
      var spy = sinon.spy();
      keys.on('a-b-c', spy);
      helpers.keypress('a');
      helpers.keypress('b');
      helpers.keypress('c');
      expect(spy.callCount).to.equal(1);
    });

    it('should support the Konami code', function () {
      var spy = sinon.spy();
      keys.on('up-up-down-down-left-right-b-a', spy);
      helpers.keypress('up');
      helpers.keypress('up');
      helpers.keypress('down');
      helpers.keypress('down');
      helpers.keypress('left');
      helpers.keypress('right');
      helpers.keypress('b');
      helpers.keypress('a');
      expect(spy.callCount).to.equal(1);
    });

    it('should support key sequences in succession without timeout', function () {
      var spy = sinon.spy();
      keys.on('a-b', spy);

      helpers.keypress('a');
      expect(spy.callCount).to.equal(0);
      helpers.keypress('b');
      expect(spy.callCount).to.equal(1);

      spy.resetHistory();
      helpers.keypress('b');
      expect(spy.callCount).to.equal(0);

      spy.resetHistory();
      helpers.keypress('a');
      helpers.keypress('b');
      expect(spy.callCount).to.equal(1);
    });

    it('should support key sequences with combinations', function () {
      var spy = sinon.spy();
      keys.on('ctrl+n-1', spy);
      helpers.keydown('control');
      helpers.keydown('n', null, ['control']);
      helpers.keyup('a');
      helpers.keyup('control');
      helpers.keypress('1');
      expect(spy.callCount).to.equal(1);
    });

    it('should support key sequences with combinations when modifier released first', function () {
      var spy = sinon.spy();
      keys.on('ctrl+n-1', spy);
      helpers.keydown('control');
      helpers.keydown('n', null, ['control']);
      helpers.keyup('control');
      helpers.keyup('a');
      helpers.keypress('1');
      expect(spy.callCount).to.equal(1);
    });

    describe('removing sequence listeners', function () {
      it('should support adding/removing key sequence listeners by name', function () {
        var spy = sinon.spy();
        keys.on('a-b', spy);
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(1);

        spy.resetHistory();
        keys.off('a-b');
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(0);
      });

      it('should support adding/removing key sequence listeners with namespaces', function () {
        var spy = sinon.spy();
        keys.on('a-b.myNS', spy);
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(1);

        spy.resetHistory();
        keys.off('.myNS');
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(0);
      });

      it('should support adding/removing key sequence listeners with namespace and by name', function () {
        var spy = sinon.spy();
        keys.on('a-b.myNS', spy);
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(1);

        spy.resetHistory();
        keys.off('a-b.myNS');
        helpers.keypress('a');
        helpers.keypress('b');
        expect(spy.callCount).to.equal(0);
      });
    });
  });
});
