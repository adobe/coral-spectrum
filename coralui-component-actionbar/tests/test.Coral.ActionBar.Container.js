describe('Coral.ActionBar.Container', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ActionBar).to.have.property('Container');
    });
  });

  describe('Implementation Details', function() {
    it('should warn that coral-actionbar-container is deprecated', function() {
      const warn = console.warn;
      let called = 0;
      
      console.warn = function() {
        called++;
      };

      new Coral.ActionBar.Container();
      
      console.warn = warn;

      expect(called).to.equal(1, 'it should warn that the container is deprecated');
    });
  });
});
