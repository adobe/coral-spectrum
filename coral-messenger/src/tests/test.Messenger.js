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
import {Messenger} from '../../../coral-messenger';
import {BaseComponent} from '../../../coral-base-component';
import {transform, validate} from '../../../coral-utils';

describe('Messenger', function () {
  const ChildComponent = class extends BaseComponent(HTMLElement) {
    constructor() {
      super();
      this._messenger = new Messenger(this);
    }
    connectedCallback() {
      super.connectedCallback();
      this._messenger.connect();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._messenger.disconnect();
    }

    get selected() {
      return this._selected;
    }
    set selected(value) {
      value = transform.booleanAttr(value);
      this._selected = value;
      this._reflectAttribute("selected", value);
      this._messenger.postMessage('child-component:_selectedchanged');
    }

    get type() {
      return this._type;
    }
    set type(value) {
      value = transform.string(value).toLowerCase();
      this._type = value;
      this._reflectAttribute("type", value);
      this._messenger.postMessage('child-component:_typechanged');
    }

    static get observedAttributes() {
      return super.observedAttributes.concat(['selected', 'type']);
    }
  }

  const ParentComponent = class extends BaseComponent(HTMLElement) {
    constructor() {
      super();
      this._onSelectionChangedCallCount = 0;
      this._onTypeChangedCallCount = 0;

      this._delegateEvents({
        'child-component:_messengerconnected': '_onMessengerConnected'
      });
    }

    _onSelectionChanged() {
      this._onSelectionChangedCallCount = this._onSelectionChangedCallCount + 1
    }

    _onTypeChanged() {
      this._onTypeChangedCallCount = this._onTypeChangedCallCount + 1;
    }

    get observedMessages() {
      return {
        'child-component:_selectedchanged': {'selector' :'[selected]', 'handler': '_onSelectionChanged'},
        'child-component:_typechanged' : '_onTypeChanged'
      };
    }
  }

  window.customElements.define('child-component', ChildComponent);
  window.customElements.define('parent-component', ParentComponent);

  describe("#basic", function() {
    let parent, child;

    beforeEach(function() {
      parent = helpers.build(window.__html__['Messenger.base.html']);
      child = parent.querySelector("child-component");
    });

    it("child messenger element should be child", function() {
      expect(child._messenger._element).to.be.equal(child);
    });

    it("child messenger should be connected when child is connected", function() {
      expect(child.isConnected).to.be.true;
      expect(child._messenger.isConnected).to.be.true;
    });

    it("child messenger should be disconnected when child is disconnected", function() {
      child.remove();
      expect(child.isConnected).to.be.false;
      expect(child._messenger.isConnected).to.be.false;
    });

    it("parent component should be added as listener in child messenger", function() {
      expect(child._messenger.listeners).to.be.an('array').to.deep.include(parent);
    });
  });

  describe("#API", function() {
    it("should execute _onSelectionChanged when selected is set", function() {
      let parent = helpers.build(window.__html__['Messenger.selected.html']);
      expect(parent._onSelectionChangedCallCount).to.be.equal(1, "should call selection changes once");
    });

    it("should execute _onTypeChanged when type is set", function() {
      let parent = helpers.build(window.__html__['Messenger.type.html']);
      expect(parent._onTypeChangedCallCount).to.be.equal(1, "should call selection changes once");
    });

    it("should not execute _onSelectionChanged when item is not connected", function() {
      let el = helpers.build(`<div></div>`);
      let parent = document.createElement("parent-component");
      let child = document.createElement("child-component");
      child.selected = true;
      parent.appendChild(child);

      expect(parent._onSelectionChangedCallCount).to.be.equal(0, "should not call selection change");
      el.appendChild(parent);
      expect(parent._onSelectionChangedCallCount).to.be.equal(1, "should call selection changes once");
    });

    it("should not execute _onTypeChanged when item is not connected", function() {
      let el = helpers.build(`<div></div>`);
      let child = document.createElement("child-component");
      let parent = document.createElement("parent-component");
      child.type = "any";
      parent.appendChild(child);

      expect(parent._onTypeChangedCallCount).to.be.equal(0, "should not call selection change");
      el.appendChild(parent);
      expect(parent._onTypeChangedCallCount).to.be.equal(1, "should call selection changes once");
    });

    it("should not execute message listener when item is disconnected", function() {
      let parent = helpers.build(window.__html__['Messenger.base.html']);
      let child = parent.querySelector("child-component");
      parent._onTypeChangedCallCount = 0;

      child.remove();
      child.type = "one";

      expect(parent._onTypeChangedCallCount).to.be.equal(0, "should not call selection change");
      parent.appendChild(child);
      expect(parent._onTypeChangedCallCount).to.be.equal(1, "should call selection changes once");
    });

    it("should not execute message listener when selector not matched", function() {
      let parent = helpers.build(window.__html__['Messenger.selected.html']);
      let child = parent.querySelector("child-component[selected]");
      let oldValue = parent._onSelectionChangedCallCount
      child.selected = false;

      expect(parent._onSelectionChangedCallCount).to.be.equal(oldValue, "should not call selection change");
      child.selected = true;
      expect(parent._onSelectionChangedCallCount).to.be.equal(oldValue + 1, "should call selection changes once");
    });

    it("messenger info should get updated when child moved to different parent", function() {
      let el = helpers.build(`<div></div>`);
      let parent = helpers.build(window.__html__['Messenger.base.html']);
      let child = parent.querySelector("child-component");
      let newParent = document.createElement("parent-component");

      el.appendChild(newParent);
      newParent.appendChild(child);

      expect(child._messenger._element).to.be.equal(child, "messenger element should match child component");
      expect(child._messenger.isConnected).to.be.equal(true, "messenger should be connected when child is connected");
      expect(child._messenger.listeners).to.be.an('array').to.deep.include(newParent);
    });

    it("silenced event should not execute listener handler", function() {
      let parent = helpers.build(window.__html__['Messenger.base.html']);
      let child = parent.querySelector("child-component");
      let oldValue = parent._onSelectionChangedCallCount
      child.set("selected", true, true);

      expect(parent._onSelectionChangedCallCount).to.be.equal(oldValue, "parent should be present in child messenger");

      child.set("selected", true, false);

      expect(parent._onSelectionChangedCallCount).to.be.equal(oldValue + 1, "parent should be present in child messenger");
    });
  });
});
