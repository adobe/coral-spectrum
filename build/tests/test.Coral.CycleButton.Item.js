describe('Coral.CycleButton.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('CycleButton');
      expect(Coral.CycleButton).to.have.property('Item');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function(done) {
      helpers.build('<coral-cyclebutton-item id="btn1" icon="viewCard">Card</coral-cyclebutton-item>', function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.CycleButton.Item();
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });
});
