var helpers = helpers || {};

helpers.methodCalled = function(object, methodName, callback) {
  'use strict';

  var method = object[methodName];
  object[methodName] = function() {
    var exception, result;
    try {
      result = method.apply(this, arguments);
      return result;
    } catch (e) {
      exception = e;
      throw e;
    } finally {
      delete object[methodName];
      if (!object[methodName]) {
        object[methodName] = method;
      }
      callback(exception, result);
    }
  };

};
