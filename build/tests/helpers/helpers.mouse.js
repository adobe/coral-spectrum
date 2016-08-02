var helpers = helpers || {};

helpers.mockMouse = function(actions, callback) {
  'use strict';

  var interval = 16;
  var eventInfos = [];

  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    if (action.type === 'move') {
      var duration = action.duration;
      var startX = action.startX;
      var startY = action.startY;
      var endX = action.endX;
      var endY = action.endY;

      duration = Math.ceil(duration / interval) * interval;
      for (var time = 0; time <= duration; time += interval) {
        eventInfos.push({
          type: 'mousemove',
          clientX: Math.round(startX + (endX - startX) * (time / duration)),
          clientY: Math.round(startY + (endY - startY) * (time / duration))
        });
      }
    }
    else {
      action.type = 'mouse' + action.type;
      eventInfos.push(action);
    }
  }

  var j = 0;
  function next() {
    var eventInfo = eventInfos[j];
    if (!eventInfo) {
      callback();
    }
    else {
      j++;
      var target = document.elementFromPoint(eventInfo.clientX, eventInfo.clientY);
      if (!target) {
        console.warn('Target missing:', eventInfo);
      }
      else {
        var event = new MouseEvent(eventInfo.type, {
          clientX: eventInfo.clientX,
          clientY: eventInfo.clientY,
          // TODO must be improved if used with scrolling
          pageX: eventInfo.clientX,
          pageY: eventInfo.clientY,
          bubbles: true,
          cancelable: true
        });
        target.dispatchEvent(event);
      }
      window.setTimeout(next, interval);
    }
  }

  next();
};
