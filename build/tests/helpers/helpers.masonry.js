var helpers = helpers || {};

helpers.masonryLayouted = function(masonry, callback) {
  'use strict';

  if (!(masonry instanceof Coral.Masonry)) {
    throw new Error('Not a masonry: ' + masonry);
  }
  helpers.methodCalled(masonry, '_doLayout', callback);
};
