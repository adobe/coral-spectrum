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
      it('should not move items into the content zone if tag is explicitly given', function() {
        const el = helpers.build(window.__html__['Coral.ColumnView.Preview.content.html']);
        var button = el.querySelector('button');
        expect(button.parentElement).not.to.equal(el.content);
      });

      it('should move items into the content zone if tag is not given', function() {
        const el = helpers.build(window.__html__['Coral.ColumnView.Preview.content.implicit.html']);
        var button = el.querySelector('button');
        expect(button.parentElement).to.equal(el.content);
      });
    });
  });

  describe('Events', function() {});
  describe('User Interaction', function() {});
  describe('Implementation Details', function() {});
});
