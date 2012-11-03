function changeSize(by) {
  var newSize = (by === 0) ? '16px' : (parseInt($('html').css('fontSize') || 16, 10)+by)+'px';

  $('html').css('fontSize', newSize);
}

$(function() {
  // Prettify code examples
  prettyPrint();
 
  // Size changers
  $('#res-plus').on('click', function(evt) {
    changeSize(+8);
  });
 
  $('#res-minus').on('click', function(evt) {
    changeSize(-8);
  });
  
  $('#res-reset').on('click', function(evt) {
    changeSize(0);
  });

  $('.tab-variant').on('click', function() {
    $('#tabsExample').attr('class', $(this).data('variant'));
  });

  // make rail pullable
  var rail = $('#main-rail');
  rail.removeClass('with-toolbar-bottom');
  rail.rail({
    refreshCallback: function() {
      var def = $.Deferred();
      setTimeout(function() {
        def.resolve();      
      }, 3000); 

      return def.promise();
    }
  });

  $('#close-rail').fipo('tap', 'click', function () {
    rail.toggleClass('closed');
  });
  
  /**
    Show the paragraph link icon when a heading is hovered on that is within a named section
  */
  (function() {
    var anchor = $('#SectionAnchor');

    // Not linking any H3s in this fashion
    $('h1, h2').on('mouseenter', function(evt) {
      var heading = evt.target;
      var section = heading.parentNode;

      if (section.tagName === 'SECTION' && section.id) {
        anchor.attr('href', '#'+section.id);
        $(heading).append(anchor);
        anchor.show();
      }
    }).on('mouseleave', function(evt) {
      anchor.hide();
    });    
  }());
});
