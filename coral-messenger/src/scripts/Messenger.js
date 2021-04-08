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
    let self = this;
    self._element = element;
    self._connected = false;
    self._clearQueue();
    self._clearListeners();
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
    let self = this;
    let connected = self.isConnected;
    let elementConnected = self.isElementConnected;

    if(elementConnected && !connected) {
      self.connect();
    }

    if(!elementConnected && connected) {
      self.disconnect();
    }
  }

  _addMessageToQueue(message) {
    let self = this;
    if(!self.isConnected) {
      self._queue.push(message);
    }
  }

  _executeQueue() {
    let self = this;
    self._queue.forEach(function(message) {
      self.postMessage(message);
    });
    self._clearQueue();
  }

  _clearQueue() {
    this._queue = [];
  }

  _clearListeners() {
    this._listeners = [];
  }

  connect() {
    let self = this;

    if(!self.isElementConnected) {
      self.disconnect();
      return;
    }

    if(!self.isConnected) {
      let element = self._element;

      self._connected = true;

      element.trigger(`${element.tagName.toLowerCase()}:_messengerconnected`, {
        handler : self.update.bind(self)
      });
    }
  }

  update(listener) {
    if(listener) {
      this._listeners.push(listener);
    }
  }

  postMessage(message, detail) {
    let self = this;
    let element = self._element;

    self._validateConnection();

    if(element.isSilenced) {
      return;
    }

    if(!self.isConnected) {
      self._addMessageToQueue();
      return;
    }

    self._listeners.forEach((listener) => {
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
    let self = this;

    if(self.isElementConnected) {
      self.connect();
      return;
    }

    if(self.isConnected) {
      let self = this;
      self._connected = false;
      self._clearListeners();
      self._clearQueue();
    }
  }
}

class Event {
  constructor(options) {
    const self = this;
    self._detail = options.detail;
    self._target = options.target;
    self._type = options.type;
    self._currentTarget = options.currentTarget;
    self._defaultPrevented = false;
    self._propagationStopped = false;
    self._immediatePropagationStopped = false;
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
