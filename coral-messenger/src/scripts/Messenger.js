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

class Messenger {
  /** @ignore */
  constructor(element) {
    this._element = element;
    this._connected = false;
    this._clearQueue();
    this._clearListeners();
  }

  get isConnected() {
    return this._connected === true;
  }

  get isElementConnected() {
    return this._element.isConnected === true;
  }

  get isSilenced() {
    return this._element._silenced === true;
  }

  get listeners() {
    return this._listeners;
  }

  _validateConnection() {
    let connected = this.isConnected;
    let elementConnected = this.isElementConnected;

    if(elementConnected && !connected) {
      this.connect();
    }

    if(!elementConnected && connected) {
      this.disconnect();
    }
  }

  _addMessageToQueue(message) {
    if(!this.isConnected) {
      this._queue.push(message);
    }
  }

  _executeQueue() {
    this._queue.forEach(function(message) {
      this.postMessage(message);
    });
    this._clearQueue();
  }

  _clearQueue() {
    this._queue = [];
  }

  _clearListeners() {
    this._listeners = [];
  }

  connect() {
    if(!this.isElementConnected) {
      this.disconnect();
      return;
    }

    if(!this.isConnected) {
      let element = this._element;

      this._connected = true;

      element.trigger(`${element.tagName.toLowerCase()}:_messengerconnected`, {
        handler : this.update.bind(this)
      });
    }
  }

  update(listener) {
    if(listener) {
      this._listeners.push(listener);
    }
  }

  postMessage(message, detail) {
    let element = this._element;

    this._validateConnection();

    if(element.isSilenced) {
      return;
    }

    if(!this.isConnected) {
      this._addMessageToQueue();
      return;
    }

    this._listeners.forEach((listener) => {
      let observedMessages = listener.observedMessages;
      let messageInfo = observedMessages[message];

      if(messageInfo) {
        let selector;
        let handler;
        if(typeof messageInfo === 'string') {
          selector = "*";
          handler = messageInfo;
        } else if(typeof messageInfo === 'object') {
          selector = messageInfo.selector || "*";
          handler = messageInfo.handler;
        }

        if(selector.indexOf(SCOPE_SELECTOR) === 0 ) {
          if(!listener.id) {
            listener.id = commons.getUID();
          }
          selector = selector.replace(SCOPE_SELECTOR, `#${listener.id} > `);
        }

        if(element.matches(selector)) {
          listener[handler].call(listener, new Event({
            target: element,
            detail: detail,
            type: message,
            currentTarget: listener
          }));
        }
      }
    });
  }

  disconnect() {
    if(this.isElementConnected) {
      this.connect();
      return;
    }

    if(this.isConnected) {
      this._connected = false;
      this._clearListeners();
      this._clearQueue();
    }
  }
}

/**
 * This Event class is just a bogus class, current message callback aspect
 * actual event as a parameter, since we are directly calling the method instead
 * of triggering event, this would disguised class object will be passed,
 * and avoid breaks.
 * This just disguise most used functionality of event object
 */
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
