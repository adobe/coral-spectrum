$(document).ready(function(){

  // Render grid only once when they are displayed
  var sourceGridRendered = false;
  var templateGridRendered = false;

  var wizard = new CUI.Wizard({ 
    element: '.wizard' ,
    onPageChanged: {
      //'properties': validateProperties,
      'select-source': function() {
        if (!sourceGridRendered) {
            new $.CUIGridLayout({}, $('.select-source .grid'));
            sourceGridRendered = true;
        }
        // Add body css class for rendering background image on select source page
        $('body').addClass("select-source-page");
      },
      'settings': function() {
        console.log("settings page");
        $('body').removeClass("select-source-page");
      },
      'select-template': function() {
          console.log("select template");
        if (!templateGridRendered) {
            new $.CUIGridLayout({}, $('.select-template .grid'));
            templateGridRendered = true;
        }
        $('body').removeClass("select-source-page");
      },
      'properties': function() {
          console.log("properties");
          $('body').removeClass("select-source-page");
      }
    },
    onFinish: function() {
        window.alert('Page created!');
    },
    onLeaving: function() {
        window.alert('Want to leave the wizard?');
    },
    onNextButtonClick: function() {
      console.log('Click on next button');
    },
    onBackButtonClick: function() {
      console.log('Click on back button');
    }
  });

  var validateProperties = function(){
    if ($('input[name="title"]').val() !== '') {
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