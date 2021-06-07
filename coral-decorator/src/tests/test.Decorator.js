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
import {Decorator} from '../../../coral-decorator';
import {BaseComponent} from '../../../coral-base-component';

describe('Decorator', function () {
  const UndecoratedCustomComponent = class extends BaseComponent(HTMLElement) {
    constructor() {
      super();
      this._disconnectedCallCount = 0;
      this._connectedCallCount = 0;
    }
    connectedCallback() {
      super.connectedCallback();

      this._connectedCallCount = this._connectedCallCount + 1;
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      this._disconnectedCallCount = this._disconnectedCallCount + 1;
    }

    resetCallCount() {
      this._connectedCallCount = 0;
      this._disconnectedCallCount = 0;
    }
  }

  const DecoratedCustomComponent = Decorator(UndecoratedCustomComponent);

  window.customElements.define('undecorated-custom-component', UndecoratedCustomComponent);
  window.customElements.define('decorated-custom-component', DecoratedCustomComponent);

  function moveItem(item, parent, ignoreCallbacks) {
    item.resetCallCount();
    if(ignoreCallbacks) {
      item._ignoreConnectedCallback = true;
      parent.appendChild(item);
      item._ignoreConnectedCallback = false;
    } else {
      parent.appendChild(item);
    }
  }

  describe("#decorated", function() {
    let item1, item2, item3;
    beforeEach(function() {
      item1 = helpers.build('<decorated-custom-component></decorated-custom-component>');
      item2 = helpers.build(document.createElement('decorated-custom-component'));
      item3 = helpers.build(new DecoratedCustomComponent());
    });

    afterEach(function() {
      item1 = item2 = item3 = null;
    });

    it("callbacks should be executed when not skipped", function() {
      expect(item1._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._connectedCallCount).to.be.equal(1, "connected callback should be executed once");

      item1.remove();
      item2.remove();
      item3.remove();

      expect(item1._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
    });

    it("callback should not be executed when skipped", function() {
      let parentItem1 = item1.parentElement;
      let parentItem2 = item2.parentElement;
      let parentItem3 = item3.parentElement;

      parentItem1.appendChild(document.createElement("div"));
      parentItem2.appendChild(document.createElement("div"));
      parentItem3.appendChild(document.createElement("div"));

      let destItem1 = parentItem1.querySelector("div > div");
      let destItem2 = parentItem1.querySelector("div > div");
      let destItem3 = parentItem1.querySelector("div > div");

      // move item1 to new position with ignoring connected callback
      moveItem(item1, destItem1, true);

      // move item2 to new position with ignoring connected callback
      moveItem(item2, destItem2, true);

      // move item3 to new position with ignoring connected callback
      moveItem(item3, destItem3, true);

      expect(item1._connectedCallCount).to.be.equal(0, "connected callback should not be executed");
      expect(item2._connectedCallCount).to.be.equal(0, "connected callback should not be executed");
      expect(item3._connectedCallCount).to.be.equal(0, "connected callback should not be executed");

      expect(item1._disconnectedCallCount).to.be.equal(0, "connected callback should not be executed");
      expect(item2._disconnectedCallCount).to.be.equal(0, "connected callback should not be executed");
      expect(item3._disconnectedCallCount).to.be.equal(0, "connected callback should not be executed");

      item1.remove();
      item2.remove();
      item3.remove();

      expect(item1._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
    });
  });

  describe("#undecorated", function() {
    let item1, item2, item3;

    beforeEach(function() {
      item1 = helpers.build('<undecorated-custom-component></decorated-custom-component>');
      item2 = helpers.build(document.createElement('undecorated-custom-component'));
      item3 = helpers.build(new UndecoratedCustomComponent());
    });

    afterEach(function() {
      item1 = item2 = item3 = null;
    });

    it("callbacks should be executed when not skipped", function() {
      expect(item1._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._connectedCallCount).to.be.equal(1, "connected callback should be executed once");

      item1.remove();
      item2.remove();
      item3.remove();

      expect(item1._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
    });

    it("callbacks should be executed when skipped", function() {
      let parentItem1 = item1.parentElement;
      let parentItem2 = item2.parentElement;
      let parentItem3 = item3.parentElement;

      parentItem1.appendChild(document.createElement("div"));
      parentItem2.appendChild(document.createElement("div"));
      parentItem3.appendChild(document.createElement("div"));

      let destItem1 = parentItem1.querySelector("div > div");
      let destItem2 = parentItem1.querySelector("div > div");
      let destItem3 = parentItem1.querySelector("div > div");

      // move item1 to new position with ignoring connected callback
      moveItem(item1, destItem1, true);

      // move item2 to new position with ignoring connected callback
      moveItem(item2, destItem2, true);

      // move item3 to new position with ignoring connected callback
      moveItem(item3, destItem3, true);

      expect(item1._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");

      expect(item1._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._connectedCallCount).to.be.equal(1, "connected callback should be executed once");

      // move item1 to old position without ignoring connected callback
      moveItem(item1, parentItem1, false);

      // move item2 to old position without ignoring connected callback
      moveItem(item2, parentItem2, false);

      // move item3 to old position without ignoring connected callback
      moveItem(item3, parentItem3, false);

      expect(item1._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._disconnectedCallCount).to.be.equal(1, "connected callback should be executed once");

      expect(item1._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item2._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
      expect(item3._connectedCallCount).to.be.equal(1, "connected callback should be executed once");
    });
  });
});
