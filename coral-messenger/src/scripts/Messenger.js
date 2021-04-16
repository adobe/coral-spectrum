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
 * Messenger will used to pass the messages from child component to its parent. Currently we are relying on
 * events to do the job. When a large DOM is connected, these events as a bulk leads to delays.
 * With the use of messenger we will directly call the parent method provided in the messages list.
 * The current implmentation only supports one to many mapping i.e. one parent and many children and any
 * in child property will result in execution of only one parent method.
 *
 * Caveat :
   a) This doesnot support the case where any change in child property, needs to be notified to two or more parents.
      In that case rely do not use this.
   b) Do not use messenger for generic events like click, hover, etc. This is implemented to support internal coral events.
  @private
 */
class Messenger {
  /** @ignore */
  constructor(element) {
    this._element = element;
    this._connected = false;
    this._clearQueue();
    this._clearListeners();
  }

  /* checks whether Messenger is connected or not.
    @returns {Boolean} true if connected
    @private
   */
  get isConnected() {
    return this._connected === true;
  }

  /* checks whether element corresponding to messenger is connected or not.
    @returns {Boolean} true if connected
    @private
   */
  get isElementConnected() {
    return this._element.isConnected === true;
  }

  /* checks whether the event is silenced or not
    @returns {Boolean} true if silenced
    @private
   */
  get isSilenced() {
    return this._element._silenced === true;
  }

  /* specifies the list of listener attached to messenger.
    @returns {Array} array of listeners
    @private
   */
  get listeners() {
    return this._listeners;
  }

  /* validates whether the current connection is valid or not.
    @private
   */
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

  /* add a message to the queue only if messenger is not connected
    message will be added only if element is not connected.
    @private
   */
  _addMessageToQueue(message) {
    if(!this.isConnected) {
      this._queue.push(message);
    }
  }

  /* executes the stored queue messages.
    It will be executed when element is connected.
    @private
   */
  _executeQueue() {
    this._queue.forEach(function(message) {
      this.postMessage(message);
    });
    this._clearQueue();
  }

  /* empty the stored queue message
    @private
   */
  _clearQueue() {
    this._queue = [];
  }

  /* clears the listeners
    @private
   */
  _clearListeners() {
    this._listeners = [];
  }

  /* element should call this method when they are connected in DOM.
    its the responsibility of the element to call this hook
    @triggers `${element.tagName.toLowerCase()}:_messengerconnected`
    @private
   */
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

  /* add the listener to messenger
    this handler will be passed when messengerconnect event is trigger
    the handler needs to be executed by listeners.
    @private
   */
  update(listener) {
    if(listener) {
      this._listeners.push(listener);
    }
  }

  /* post the provided message to all listener.
    @param {String} message which should be posted
    @param {Object} additional detail which needs to be posted.
    @private
   */
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

  /* element should call this method when they are disconnected from DOM.
    its the responsibility of the element to call this hook
    @private
   */
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
