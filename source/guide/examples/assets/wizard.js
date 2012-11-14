$(document).ready(function(){

  // Render grid only once when they are displayed
  var sourceGridRendered = false;
  var templateGridRendered = false;

  var wizard = new CUI.Wizard({ 
    element: '.wizard' ,
    onPageChanged: {
      'properties': validateProperties,
      'select-source': function() {
        if (!sourceGridRendered) {
            new $.CUIGridLayout({}, $('.select-source .grid-container'));
            sourceGridRendered = true;
        }
      },
      'select-template': function() {
        if (!templateGridRendered) {
            new $.CUIGridLayout({}, $('.select-template .grid-container'));
            templateGridRendered = true;
        }
      },
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

  $('.select-template article').click(function(){
    $('.select-template article.focused').removeClass('focused');
    $(this).addClass('focused');
    return false;
  });

  $('.select-template article .preview').click(function(){
    $('.select-template .grid-container').addClass('hidden');
    $('.select-template div.preview').addClass('displayed');
  });
});