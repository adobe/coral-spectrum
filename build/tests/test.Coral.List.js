/* global helpers:true */
describe('Coral.AnchorList', function() {
  'use strict';

  it('should be defined in the Coral namespace', function() {
    expect(Coral).to.have.property('List');
    expect(Coral).to.have.property('ButtonList');
    expect(Coral).to.have.property('AnchorList');
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-list>', function(el) {
      expect(el instanceof Coral.List).to.equal(true);
      done();
    });
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-buttonlist>', function(el) {
      expect(el instanceof Coral.ButtonList).to.equal(true);
      done();
    });
  });

  it('should support creation from markup', function(done) {
    helpers.build('<coral-anchorlist>', function(el) {
      expect(el instanceof Coral.AnchorList).to.equal(true);
      done();
    });
  });

  it('should support co-existing anchor/button/list items', function(done) {
    helpers.build(window.__html__['Coral.List.mixed.html'], function(el) {
      expect(el.items.length).to.equal(3);
      done();
    });
  });

});
