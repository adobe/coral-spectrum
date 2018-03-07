describe('Coral.CharacterCount', function() {
  var input, characterCount;

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var defaultCharacterCount = helpers.build(new Coral.CharacterCount());
      expect(defaultCharacterCount.classList.contains('_coral-CharacterCount')).to.be.true;
      expect(defaultCharacterCount).to.have.property('target');
      expect(defaultCharacterCount).to.have.property('maxLength');
      expect(defaultCharacterCount.target).to.equal(Coral.CharacterCount.target.PREVIOUS);
      expect(defaultCharacterCount.maxLength).to.be.null;
    });

    it('should be possible using createElement', function() {
      var defaultCharacterCount = helpers.build(document.createElement('coral-charactercount'));
      expect(defaultCharacterCount.classList.contains('_coral-CharacterCount')).to.be.true;
      expect(defaultCharacterCount).to.have.property('target');
      expect(defaultCharacterCount).to.have.property('maxLength');
      expect(defaultCharacterCount.target).to.equal(Coral.CharacterCount.target.PREVIOUS);
      expect(defaultCharacterCount.maxLength).to.be.null;
    });

    it('should be possible using markup', function() {
      var defaultCharacterCount = helpers.build('<coral-charactercount></coral-charactercount>');
      expect(defaultCharacterCount.classList.contains('_coral-CharacterCount')).to.be.true;
      expect(defaultCharacterCount).to.have.property('target');
      expect(defaultCharacterCount).to.have.property('maxLength');
      expect(defaultCharacterCount.target).to.equal(Coral.CharacterCount.target.PREVIOUS);
      expect(defaultCharacterCount.maxLength).to.be.null;
    });

    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-charactercount></coral-charactercount>');
    });

    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.CharacterCount());
    });
  });

  describe('Implementation Details', function() {

    var typeValue = function(value){
      input.value = value;

      helpers.event('input', input);
    };

    beforeEach(function(){
      input = document.createElement('input');
      input.type = 'textfield';
      input.id = 'example-input';
      helpers.target.appendChild(input);

      characterCount = new Coral.CharacterCount();
      helpers.target.appendChild(characterCount);
      characterCount.target = '#example-input';
    });

    afterEach(function(){
      input = null;
      characterCount = null;
    });

    it('should reduce counter for each character entered when maxLength not null', function() {
      characterCount.maxLength = 12;

      typeValue('12345');
      expect(characterCount.innerHTML).to.equal('7');
    });

    it('should reach 0 when characters entered == maxLength', function(){
      characterCount.maxLength = 4;

      typeValue('qwer');
      expect(characterCount.innerHTML).to.equal('0');
    });

    it('should show a negative value when characters entered > maxLength', function(){
      characterCount.maxLength = 2;

      typeValue('123');
      expect(characterCount.innerHTML).to.equal('-1');
    });

    it('it should add is-invalid when character entered > maxLength', function(){
      characterCount.maxLength = 3;

      expect(input.classList.contains('is-invalid')).to.be.false;
      expect(characterCount.classList.contains('is-invalid')).to.be.false;

      typeValue('1234');
      expect(input.classList.contains('is-invalid')).to.be.true;
      expect(characterCount.classList.contains('is-invalid')).to.be.true;
    });

    it('should start counter at 0 when maxLength is null', function() {
      expect(characterCount.innerHTML).to.equal('0');
    });

    it('should increment counter for each character entered when maxLength is null', function(){
      typeValue('98765432');
      expect(characterCount.innerHTML).to.equal('8');
    });
  });
});
