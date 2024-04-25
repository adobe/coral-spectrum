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
import {DragAction} from '../../../coral-dragaction';
import {events} from '../../../coral-utils';

describe('DragAction', function () {
  // Mock for dragging
  function dragTo(dragAction, x, y) {
    var action = function (type, x, y) {
      dragAction[type]({
        pageX: x,
        pageY: y,
        preventDefault: function () {
        },
        target: {}
      });
    };
    action('_dragStart', 0, 0);
    action('_drag', x, y);
    action('_dragEnd', x, y);
  }

  describe('Instantiation', function () {

    it('should initialize an instance of DragAction', function () {
      var dragElement = helpers.build(window.__html__['DragAction.base.html']);
      new DragAction(dragElement);

      expect(dragElement.dragAction._dragElement).to.equal(dragElement);
      expect(dragElement.classList.contains('u-coral-openHand')).to.be.true;
    });

    it('should destroy the DragAction instance', function () {
      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);

      var dragElementEvents = dragAction._dragEvents;
      var dragElementEventCount = dragElementEvents._allListeners.length;
      // @todo don't use private _vent instance
      var windowEventCount = events._vent._allListeners.length;

      dragAction.destroy();
      // mousestart, touchstart, keydown, keyup, focusout
      expect(dragElementEvents._allListeners.length).to.equal(dragElementEventCount - 5);
      // touchmove, mousemove, touchend, mouseend
      // @todo don't use private _vent instance
      expect(events._vent._allListeners.length).to.equal(windowEventCount - 4);
    });

    it('should destroy the DragAction instance and restore the dragElement position', function () {
      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      var initialPosition = {
        top: dragElement.offsetTop,
        left: dragElement.offsetLeft
      };

      dragTo(dragAction, 100, 100);

      dragAction.destroy(true);

      expect(dragElement.offsetTop).to.equal(initialPosition.top);
      expect(dragElement.offsetLeft).to.equal(initialPosition.left);
    });
  });

  describe('API', function () {

    describe('#dragElement', function () {
      it('should throw an error is dragElement is not passed', function () {
        var error = null;
        try {
          new DragAction();
        } catch (e) {
          error = e;
        }
        expect(error.message.indexOf('DragAction: dragElement is missing') !== -1).to.be.true;
      });
    });
  });

  describe('Markup', function () {

    describe('#dragElement', function () {

      it('should set a DOM dragElement', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        expect(dragAction._dragElement).to.equal(dragElement);
        expect(dragElement.classList.contains('u-coral-openHand')).be.true;
      });

      it('should set the dragAction instance to the dragElement', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        expect(dragElement.dragAction).to.equal(dragAction);
      });

      it('should set a dragElement using a selector', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        expect(dragAction._dragElement).to.equal(dragElement);
        expect(dragElement.classList.contains('u-coral-openHand')).to.be.true;
      });

      it('should return the dragElement', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);

        expect(dragElement).to.equal(dragAction.dragElement);
        expect(dragAction.dragElement).to.equal(dragAction._dragElement);
      });

      it('should not be possible to set the dragElement', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);

        try {
          dragAction.dragElement = '';
        } catch (e) {
          expect(dragAction.dragElement).to.equal(dragElement);
        }
      });
    });

    describe('#dropZone', function () {

      it('should set a DOM dropZone', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dropElement = helpers.build(window.__html__['DragAction.drop.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.dropZone = dropElement;
        expect(dragAction._dropZones.length).to.equal(1);
        expect(dragAction._dropZones[0]).to.equal(dropElement);
      });

      it('should set a dropZone using a selector', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dropElement = helpers.build(window.__html__['DragAction.drop.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.dropZone = '.drop';
        expect(dragAction._dropZones.length).to.equal(1);
        expect(dragAction._dropZones[0]).to.equal(dropElement);
      });

      it('should set a dropZone using a NodeList', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dropElement = helpers.build(window.__html__['DragAction.drop.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.dropZone = document.querySelectorAll('.drop');
        expect(dragAction._dropZones.length).to.equal(1);
        expect(dragAction._dropZones[0]).to.equal(dropElement);
      });

      it('should return the dropZone', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dropElement = helpers.build(window.__html__['DragAction.drop.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.dropZone = dropElement;
        expect(dropElement).to.equal(dragAction.dropZone);
        expect(dragAction.dropZone).to.equal(dragAction._dropZone);
      });
    });

    describe('#handle', function () {

      it('should set a DOM as handle', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var handleElement = helpers.build(window.__html__['DragAction.handle.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.handle = handleElement;
        expect(dragAction._handles.length).to.equal(1);
        expect(dragAction._handles[0]).to.equal(handleElement);
      });

      it('should set a handle using a selector', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var handleElement = helpers.build(window.__html__['DragAction.handle.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.handle = '.handle';
        expect(dragAction._handles.length).to.equal(1);
        expect(dragAction._handles[0]).to.equal(handleElement);
      });

      it('should set a handle using a NodeList', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var handleElement = helpers.build(window.__html__['DragAction.handle.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.handle = document.querySelectorAll('.handle');
        expect(dragAction._handles.length).to.equal(1);
        expect(dragAction._handles[0]).to.equal(handleElement);
      });

      it('should return the handle', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var handleElement = helpers.build(window.__html__['DragAction.handle.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.handle = handleElement;
        expect(handleElement).to.equal(dragAction.handle);
        expect(dragAction.handle).to.equal(dragAction._handle);
      });
    });

    describe('#axis', function () {

      it('should set axis to horizontal', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.axis = 'horizontal';
        expect(dragAction.axis).to.equal('horizontal');
      });

      it('should not accept other values than horizontal, vertical or default', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.axis = 'diagonale';
        expect(dragAction.axis).to.equal(DragAction.axis.FREE);
      });

      it('should restrict the drag element to the horizontal axis', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.axis = 'horizontal';
        var expectedPosition = {
          left: dragElement.offsetLeft + 1000,
          top: dragElement.offsetTop
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, 1000, 1000);

        var detail = eventSpy.args[0][0].detail;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(1000);
        expect(detail.pageY).to.equal(1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });

      it('should restrict the drag element to the vertical axis', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.axis = 'vertical';
        var expectedPosition = {
          left: dragElement.offsetLeft,
          top: dragElement.offsetTop + 1000
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, 1000, 1000);

        var detail = eventSpy.args[0][0].detail;
        expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(1000);
        expect(detail.pageY).to.equal(1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });
    });

    describe('#scroll', function () {
      it('should set scroll to true', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.scroll = true;
        expect(dragAction.scroll).to.be.true;
      });
    });

    describe('#containment', function () {

      it('should set containment to true', function () {
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);
        var dragAction = new DragAction(dragElement);
        dragAction.containment = true;
        expect(dragAction.containment).to.be.true;
      });

      it('should contain the drag element and set the new position', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.containment = true;
        var expectedPosition = {
          left: container.offsetLeft,
          top: container.offsetTop
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, -1000, -1000);

        var detail = eventSpy.args[0][0].detail;
        expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(-1000);
        expect(detail.pageY).to.equal(-1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });

      it('should contain the drag element in the bottom right', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.containment = true;
        var expectedPosition = {
          left: container.offsetLeft + 150,
          top: container.offsetTop + 150
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, 1000, 1000);

        var detail = eventSpy.args[0][0].detail;
        expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(1000);
        expect(detail.pageY).to.equal(1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });

      it('should contain the drag element in the bottom left', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.containment = true;
        var expectedPosition = {
          left: container.offsetLeft,
          top: container.offsetTop + 150
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, -1000, 1000);

        var detail = eventSpy.args[0][0].detail;
        expect(document.body.classList.contains('u-coral-closedHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(-1000);
        expect(detail.pageY).to.equal(1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });

      it('should contain the drag element in the top left', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.containment = true;
        var expectedPosition = {
          left: container.offsetLeft,
          top: container.offsetTop
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, -1000, -1000);

        var detail = eventSpy.args[0][0].detail;
        expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(-1000);
        expect(detail.pageY).to.equal(-1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });

      it('should contain the drag element in the top right', function () {
        var eventSpy = sinon.spy();

        var container = helpers.build(window.__html__['DragAction.container.html']);
        var dragElement = helpers.build(window.__html__['DragAction.base.html']);

        container.appendChild(dragElement);
        var dragAction = new DragAction(dragElement);
        dragAction.containment = true;
        var expectedPosition = {
          left: container.offsetLeft + 150,
          top: container.offsetTop
        };

        dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
        dragTo(dragAction, 1000, -1000);

        var detail = eventSpy.args[0][0].detail;
        expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
        expect(dragElement.classList.contains('is-dragging')).to.be.false;
        expect(eventSpy.callCount).to.equal(1);
        expect(detail.dragElement).to.equal(dragElement);
        expect(detail.pageX).to.equal(1000);
        expect(detail.pageY).to.equal(-1000);
        expect(dragElement.offsetTop).to.equal(expectedPosition.top);
        expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
      });
    });
  });

  describe('Events', function () {

    it('should trigger coral-dragaction:dragstart', function () {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      dragElement.addEventListener('coral-dragaction:dragstart', eventSpy);
      dragAction._dragStart({
        pageX: 0,
        pageY: 0,
        preventDefault: function () {
        },
        target: {}
      });

      var detail = eventSpy.args[0][0].detail;
      expect(document.body.classList.contains('u-coral-closedHand')).to.be.true;
      expect(dragElement.classList.contains('is-dragging')).to.be.true;
      expect(eventSpy.callCount).to.equal(1);
      expect(detail.dragElement).to.equal(dragElement);
      expect(detail.pageX).to.equal(0);
      expect(detail.pageY).to.equal(0);
    });

    it('should trigger coral-dragaction:dragstart once', function () {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      dragAction.handle = [];
      dragElement.addEventListener('coral-dragaction:dragstart', eventSpy);

      helpers.mouseEvent('mousedown', dragElement);

      expect(eventSpy.callCount).to.equal(1);
    });

    it('should trigger coral-dragaction:drop', function () {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      dragAction.dropZone = 'body';
      dragElement.addEventListener('coral-dragaction:drop', eventSpy);
      dragTo(dragAction, 20, 20);

      var detail = eventSpy.args[0][0].detail;
      expect(detail.dragElement).to.equal(dragElement);
      expect(detail.pageX).to.equal(20);
      expect(detail.pageY).to.equal(20);
      expect(detail.dropElement).to.equal(document.body);
      expect(eventSpy.callCount).to.equal(1);
    });

    it('should not trigger coral-dragaction:drop', function () {
      var eventSpy = sinon.spy();

      var dropZone = helpers.build(window.__html__['DragAction.drop.html']);
      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      dragAction.dropZone = dropZone;
      dragElement.addEventListener('coral-dragaction:drop', eventSpy);
      dragTo(dragAction, -1000, -1000);

      expect(eventSpy.callCount).to.equal(0);
    });

    it('should trigger coral-dragaction:drag', function () {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      dragAction.dropZone = 'body';
      var expectedPosition = {
        left: dragElement.offsetLeft + 50,
        top: dragElement.offsetTop + 50
      };

      dragElement.addEventListener('coral-dragaction:drag', eventSpy);
      dragTo(dragAction, 50, 50);

      var detail = eventSpy.args[0][0].detail;
      expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
      expect(dragElement.classList.contains('is-dragging')).to.be.false;
      expect(eventSpy.callCount).to.equal(1);
      expect(detail.dragElement).to.equal(dragElement);
      expect(detail.pageX).to.equal(50);
      expect(detail.pageY).to.equal(50);
      expect(dragElement.offsetTop).to.equal(expectedPosition.top);
      expect(dragElement.offsetLeft).to.equal(expectedPosition.left);
    });

    it('should trigger coral-dragaction:dragend', function () {
      var eventSpy = sinon.spy();

      var dragElement = helpers.build(window.__html__['DragAction.base.html']);

      var dragAction = new DragAction(dragElement);
      dragElement.addEventListener('coral-dragaction:dragend', eventSpy);
      dragTo(dragAction, 50, 50);

      var detail = eventSpy.args[0][0].detail;
      expect(dragElement.classList.contains('u-coral-closeHand')).to.be.false;
      expect(dragElement.classList.contains('is-dragging')).to.be.false;
      expect(eventSpy.callCount).to.equal(1);
      expect(detail.dragElement).to.equal(dragElement);
      expect(detail.pageX).to.equal(50);
      expect(detail.pageY).to.equal(50);
    });
  });
});
