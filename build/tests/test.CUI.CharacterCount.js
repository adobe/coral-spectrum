describe('CUI.CharacterCount', function() {


  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('CharacterCount');
  });

  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('characterCount');
  });


  var inputHtml = '<input id="example-input" type="text" maxlength="5">';
  var inputCountHtml = '<span class="coral-CharacterCount" data-related="#example-input"></span>';
  var textAreaHtml = '<textarea id="example-textarea" maxlength="5"></textarea>';
  var textAreaCountHtml = '<span class="coral-CharacterCount" data-related="#example-textarea"></span>';
  var inputElement, inputCountElement, textAreaCountElement, textAreaElement;

  describe("Initializers", function () {

    beforeEach(function (){
      inputElement = $(inputHtml).appendTo('body');
      inputCountElement = $(inputCountHtml).attr("data-init", "character-count").appendTo('body');

      textAreaElement = $(textAreaHtml).appendTo('body');
      textAreaCountElement = $(textAreaCountHtml).attr("data-init", "character-count").appendTo('body');
    });

    afterEach(function (){
      inputElement.remove();
      inputCountElement.remove();

      textAreaElement.remove();
      textAreaCountElement.remove();
    });

    it("should be properly initialized using data-init on cui-contentloaded", function () {
      $(document.body).trigger("cui-contentloaded");
      expect(inputCountElement.html()).to.equal('5');
    });

    it("should be properly initialized using data-init on cui-contentloaded", function () {
      $(document.body).trigger("cui-contentloaded");
      expect(textAreaCountElement.html()).to.equal('5');
    });
  });

  describe('input from jQuery constructor', function() {

    beforeEach(function (){
      inputElement = $(inputHtml).appendTo('body');
      inputCountElement = $(inputCountHtml).appendTo('body');
    });

    afterEach(function (){
      inputElement.remove();
      inputCountElement.remove();
    });

    it('should start counter at maxlength', function(){
      inputCountElement.characterCount();
      expect(inputCountElement.html()).to.equal('5');
    });

    it('should reduce counter for each character entered when maxlength not null', function(){
      inputCountElement.characterCount();
      expect(inputCountElement.html()).to.equal('5');
      inputElement.val('123').trigger({ type:'input'});
      expect(inputCountElement.html()).to.equal('2');
    });

    it('should reach 0 when characters entered == maxlength', function(){
      inputCountElement.characterCount();
      expect(inputCountElement.html()).to.equal('5');
      inputElement.val('12345').trigger({ type:'input'});
      expect(inputCountElement.html()).to.equal('0');
    });

    it('should show negative value when characters entered > maxlength', function(){
      inputCountElement.characterCount();
      expect(inputCountElement.html()).to.equal('5');
      inputElement.val('123456789').trigger({ type:'input'});
      expect(inputCountElement.html()).to.equal('-4');
    });

    it('should add is-invalid class when characters entered > maxlength', function(){
      inputCountElement.characterCount();
      expect(inputCountElement).not.to.have.class('is-invalid');
      inputElement.val('123456789').trigger({ type:'input'});
      expect(inputCountElement).to.have.class('is-invalid');
    });

    it('should start counter at 0 when maxlength is null', function(){
      inputElement.attr('maxlength', null);
      inputCountElement.characterCount();
      expect(inputCountElement.html()).to.equal('0');
    });

    it('should increment counter for each character entered when maxlength is null', function(){
      inputElement.attr('maxlength', null);
      inputCountElement.characterCount();
      expect(inputCountElement.html()).to.equal('0');
      inputElement.val('123').trigger({ type:'input'});
      expect(inputCountElement.html()).to.equal('3');
    });

  });

  describe('textarea from jQuery constructor', function() {

    beforeEach(function (){
      textAreaElement = $(textAreaHtml).appendTo('body');
      textAreaCountElement = $(textAreaCountHtml).appendTo('body');
    });

    afterEach(function (){
      textAreaElement.remove();
      textAreaCountElement.remove();
    });

    it('should start counter at maxlength', function(){
      textAreaCountElement.characterCount();
      expect(textAreaCountElement.html()).to.equal('5');
    });

    it('should reduce counter for each character entered when maxlength not null', function(){
      textAreaCountElement.characterCount();
      expect(textAreaCountElement.html()).to.equal('5');
      textAreaElement.val('123').trigger({ type:'input'});
      expect(textAreaCountElement.html()).to.equal('2');
    });

    it('should reach 0 when characters entered == maxlength', function(){
      textAreaCountElement.characterCount();
      expect(textAreaCountElement.html()).to.equal('5');
      textAreaElement.val('12345').trigger({ type:'input'});
      expect(textAreaCountElement.html()).to.equal('0');
    });

    it('should show negative value when characters entered > maxlength', function(){
      textAreaCountElement.characterCount();
      expect(textAreaCountElement.html()).to.equal('5');
      textAreaElement.val('123456789').trigger({ type:'input'});
      expect(textAreaCountElement.html()).to.equal('-4');
    });

    it('should add is-invalid class when characters entered > maxlength', function(){
      textAreaCountElement.characterCount();
      expect(textAreaCountElement).not.to.have.class('is-invalid');
      textAreaElement.val('123456789').trigger({ type:'input'});
      expect(textAreaCountElement).to.have.class('is-invalid');
    });

    it('should start counter at 0 when maxlength is null', function(){
      textAreaElement.attr('maxlength', null);
      textAreaCountElement.characterCount();
      expect(textAreaCountElement.html()).to.equal('0');
    });

    it('should increment counter for each character entered when maxlength is null', function(){
      textAreaElement.attr('maxlength', null);
      textAreaCountElement.characterCount();
      expect(textAreaCountElement.html()).to.equal('0');
      textAreaElement.val('123').trigger({ type:'input'});
      expect(textAreaCountElement.html()).to.equal('3');
    });


  });

  function sendKeyEvent(target) {
    target.trigger({type: 'keypress', keyCode: '65', which: '65', charCode: '65'});
  }

});
