$(document).ready(function(){

  // Render grid only once when they are displayed
  var sourceGridRendered = false;
  var templateGridRendered = false;

  var wizard = new CUI.Wizard({ 
    element: '.wizard' ,
    onPageChanged: function(page) {
        if (page.hasClass('properties')) {
          validateProperties();
        } else if (page.hasClass('select-source') && !sourceGridRendered) {
            new $.CUIGridLayout({}, $('.select-source .grid-container'));
            sourceGridRendered = true;          
        } else if (page.hasClass('select-template') && !templateGridRendered) {
            new $.CUIGridLayout({}, $('.select-template .grid-container'));
            templateGridRendered = true;
        }
    },
    onFinish: function() {
        alert('Page created!');
    }
  });

  var validateProperties = function(){
    if ($('input[name="title"]').val() != '') {
      wizard.setNextButtonDisabled(false);
    } else {
      wizard.setNextButtonDisabled(true);
    }
  };

  $('input[name="title"]').keyup(validateProperties);
});