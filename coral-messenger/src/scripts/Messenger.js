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

import {commons} from '../../../coral-utils';

const SCOPE_SELECTOR = ':scope > ';

/**
 Utility belt.
 */
class Messenger {
  /** @ignore */
  constructor(options) {
    let self = this;
    self._element = options.element;
    self._listeners = [];
    self._connected = false;
  }

  connect() {
    let self = this;
    let element = self._element;

    self._connected = true;
    element.trigger(`${element.tagName.toLowerCase()}:_addMessengerListener`, {
      handler : self.update.bind(self)
    });
  }

  update(listener) {
    if(listener) {
      let listenerRef = new WeakRef(listener);
      this._listeners.push(listenerRef);
    }
  }

  postMessage(message, detail) {
    let splicedIndex = [];
    let self = this;
    let element = self._element;

    if(self._connected) {
      self._listeners.forEach((listenerRef, index) => {
        let listener = listenerRef.deref();
        if(listener) {
          let observedMessages = listener.observedMessages;
          let messageOptions = observedMessages[message];

          if(messageOptions) {
            let selector;
            let handler;
            if(typeof messageOptions === 'string') {
              selector = "*";
              handler = messageOptions;
            } else if(typeof messageOptions === 'object') {
              selector = messageOptions.selector || "*";
              handler = messageOptions.handler;
            }

            if(selector.indexOf(SCOPE_SELECTOR) === 0 ) {
              if(!listener.id) {
                listener.id = commons.getUID();
              }
              selector = selector.replace(SCOPE_SELECTOR, `#${listener.id} > `);
            }

            if(element.matches(selector)) {
              let event = new Event({
                target: element,
                detail: detail,
                type: message,
                currentTarget: listener
              });

              listener[handler].call(listener, event);
            }
          }
        } else {
          splicedIndex.push(index);
        }
      });
    } else {
      this._element.trigger(message);
    }
    splicedIndex.forEach((value) => {
      this._listeners.splice(value, 1);
    });
  }

  disconnect() {
    let self = this;
    let element = self._element;

    self._connected = false;
    self._listeners = [];
  }
}

class Event {
  constructor(options) {
    this._detail = options.detail;
    this._target = options.target;
    this._type = options.type;
    this._currentTarget = options.currentTarget;
    this._defaultPrevented = false;
    this._propagationStopped = false;
    this._immediatePropagationStopped = false;
  }

  get detail() {
    return this._detail;
  }

  get type() {
    return this._type;
  }

  get target() {
    return this._target;
  }

  get currentTarget() {
    return this._currentTarget;
  }

  preventDefault() {
    this._defaultPrevented = true;
  }

  stopPropagation() {
    this._propagationStopped = true;
  }

  stopImmediatePropagation() {
    this._immediatePropagationStopped = true;
  }
}

export default Messenger;
