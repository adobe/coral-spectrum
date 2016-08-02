describe('Coral.Step', function() {
  'use strict';

  var el;
  var item;
  var item2;

  beforeEach(function() {
    el = new Coral.StepList();
    el.interaction = Coral.StepList.interaction.ON;

    item = new Coral.Step();
    el.appendChild(item);
    item2 = new Coral.Step();
    el.appendChild(item2);
  });

  afterEach(function() {
    el = item = item2 = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Step');
      expect(Coral.Step).to.have.property('Label');
    });
  });

  describe('API', function() {
    describe('#label', function() {

      it('should default to empty string', function() {
        expect(item.label.textContent).to.equal('');
      });

      it('should be a content zone', function() {
        expect(item.label instanceof HTMLElement).to.be.true;
      });

      it('should be settable', function() {
        item.label.innerHTML = 'Item 1';
        expect(item.label.innerHTML).to.equal('Item 1');
      });
    });

    describe('#selected', function() {
      it('should default to false', function(done) {
        expect(item.selected).to.be.false;

        helpers.next(function() {
          expect(item.getAttribute('tabindex')).to.equal('-1');

          done();
        });
      });

      it('should be settable to truthy', function(done) {
        item.selected = 123;

        helpers.next(function() {
          expect(item.selected).to.be.true;
          expect(item.hasAttribute('selected')).to.be.true;
          expect(item.$).to.have.class('is-selected');
          expect(item.getAttribute('tabindex')).to.equal('0');

          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    it('tabindex should be removed when StepList interaction is OFF', function(done) {
      // we wait a frame for the sync, since we set there the tabindex
      helpers.next(function() {
        expect(item.hasAttribute('tabindex')).to.be.true;
        expect(item.hasAttribute('aria-readonly')).to.be.false;

        el.interaction = Coral.StepList.interaction.OFF;

        helpers.next(function() {
          expect(item.hasAttribute('tabindex')).to.be.false;
          expect(item.getAttribute('aria-readonly')).to.equal('true');

          done();
        });
      });
    });
  });
});
