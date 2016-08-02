describe('Coral.CycleButton.Action', function() {
  'use strict';

  var action;

  beforeEach(function() {
    action = new Coral.CycleButton.Action();
    helpers.target.appendChild(action);
  });

  afterEach(function() {
    action = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('CycleButton');
      expect(Coral.CycleButton).to.have.property('Action');
    });
  });

  describe('API', function() {
    describe('#content', function() {
      it('should default to empty string', function() {
        expect(action.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        action.content.innerHTML = htmlContent;

        expect(action.content.innerHTML).to.equal(htmlContent);
        expect(action.innerHTML).to.equal(htmlContent);
      });

      it('should not be settable', function() {
        action.content = null;
        expect(action.content).not.to.be.null;
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(action.icon).to.equal('');
      });

      it('should be reflected to the DOM', function() {
        action.icon = 'add';
        expect(action.$).to.have.attr('icon', 'add');
      });

      it('should convert any value to string', function() {
        action.icon = 45;
        expect(action.icon).to.equal('45');
        expect(action.$).to.have.attr('icon', '45');
      });
    });
  });
});
