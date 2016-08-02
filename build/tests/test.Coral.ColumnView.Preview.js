describe('Coral.ColumnView.Preview', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ColumnView).to.have.property('Preview');
      expect(Coral.ColumnView.Preview).to.have.property('Content');
      expect(Coral.ColumnView.Preview).to.have.property('Asset');
      expect(Coral.ColumnView.Preview).to.have.property('Label');
      expect(Coral.ColumnView.Preview).to.have.property('Value');
      expect(Coral.ColumnView.Preview).to.have.property('Separator');
    });
  });

  describe('API', function() {});

  describe('Markup', function() {
    describe('#content', function() {
      it('should not move items into the content zone if tag is explicitely given', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.Preview.content.html'], function(el) {
          var button = el.querySelector('button');
          expect(button.parentElement).not.to.equal(el.content);

          done();
        });
      });

      it('should move items into the content zone if tag is not given', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.Preview.content.implicit.html'], function(el) {
          var button = el.querySelector('button');
          expect(button.parentElement).to.equal(el.content);

          done();
        });
      });
    });
  });

  describe('Events', function() {});
  describe('User Interaction', function() {});
  describe('Implementation Details', function() {});
});
