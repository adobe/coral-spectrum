describe('Coral.Button', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Button');
      expect(Coral.Button).to.have.property('Label');
    });
  });

  describe('Implementation Details', function() {
    helpers.testButton(Coral.Button, 'coral-button', 'button');
  });
});
