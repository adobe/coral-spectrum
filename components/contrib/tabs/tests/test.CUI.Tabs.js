describe('CUI.Tabs', function() {

  var el, first_tab, second_tab, third_tab, disabled_tab, last_tab;


  var activate = function(target) {
    if (window._phantom) {
      target.trigger('tap');
    } else {
      target.trigger('click');
    }
  };

  var sendKey = function(target, code) {
    target.trigger(jQuery.Event('keydown', {which: code}));
  };

  var buildJQueryElement = function(htmlMarkup) {
    el = $(htmlMarkup).tabs();
    first_tab = el.find('a[href="#first-tab"]');
    second_tab = el.find('a[href="#second-tab"]');
    third_tab = el.find('a[data-target="#third-tab"]');
    disabled_tab = el.find('a[href="#disabled-tab"]');
    last_tab = el.find('a[href="#last-tab"]');
  }

  var jQueryMarkup = [
  '<div class="tabs" id="dataInitMarkup">',
  '<nav>',
  '<a href="#first-tab" data-toggle="tab">Tab 1</a>',
  '<a href="#second-tab" data-toggle="tab">Tab 2</a>',
  '<a href="404.html" data-target="#third-tab" data-toggle="tab">Tab 3</a>',
  '<a href="#disabled-tab" data-toggle="tab" class="disabled">Disabled Tab</a>',
  '<a href="#last-tab" data-toggle="tab">Last Tab</a>',
  '</nav>',
  '<section id="first-tab">Lorem ipsum dolor sit amet.</section>',
  '<section id="second-tab">Aenean faucibus ornare laoreet. Cras luctus purus.</section>',
  '<section id="third-tab">faucibus ornare laoreet. Cras luctus purus.</section>',
  '<section id="disabled-tab">This will not be shown as the corresponding tab is disabled.</section>',
  '<section id="last-tab">This is the last tab</section>',
  '</div>'
  ].join('');


  var buildDataInitElement = function(htmlMarkup) {
    el = $(htmlMarkup).appendTo('body');
    $('body').trigger('cui-contentloaded.data-api');
    first_tab = $(el.find('a')[0]);
    second_tab = $(el.find('a')[1]);
    third_tab = $(el.find('a')[2]);
    disabled_tab = last_tab = null;
  }

  var dataInitMarkup = [
    '<div class="tabs" data-init="tabs">',
      '<nav>',
        '<a data-toggle="tab">Tab 1</a>',
        '<a data-toggle="tab" data-target="foo" class="active">Tab 2</a>',
        '<a data-toggle="tab">Tab 3</a>',
        '<a data-toggle="tab">Tab 4</a>',
        '<a data-toggle="tab">Tab 3</a>',
      '</nav>',
      '<section>Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>',
      '<section id="foo" class="active">Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>',
      '<section>Ipsizzle fo borizzle  mah zizzle fo rizzle.</section>',
    '</div>'
  ].join('');


  describe('definition', function() {
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Tabs');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('tabs');
    });
  });
  // describe definition
  
  describe('from JQuery constructor', function() {


    beforeEach( function() {
      buildJQueryElement(jQueryMarkup);
    });

    it('should have correct CSS classname', function() {
      expect(el).to.have.class('tabs');
    });
    
    it('should have correct markup', function() {
      expect(el).to.have('nav[role="tablist"]');
      expect(el).to.have('section[role="tabpanel"]');
      expect(el).to.have('nav > a[role="tab"]');
    });
    
    it('should have role set to tab for links', function() {
      expect(el.find('nav > a[role="tab"]')).to.have.lengthOf(5); 
    });

    it('should have role tab panel set on sections', function() {
      expect(el.find('section[role="tabpanel"]')).to.have.lengthOf(5);
    });

    it('should have both the first tab and section active', function() {
      expect(first_tab).to.have.class('active');
      expect(second_tab).to.not.have.class('active');
      expect(el.find('section[role="tabpanel"]').first()).to.have.class('active');
    });
    
    it('should have a visible first section', function() {
      expect(el.find('section[role="tabpanel"]').first()).to.not.have.css('display', 'none');
    });

  }); // jquery constructed

  describe('click handlers', function() {

    beforeEach( function() {
      buildJQueryElement(jQueryMarkup);
    });

    it('should switch to a non-disabled tab', function() {
      var targetTab = second_tab.attr('aria-controls');
      var secondSection = el.find('section[id="' + targetTab + '"]');
      activate(second_tab);
      expect(second_tab).to.have.class('active');
      expect(secondSection).to.have.class('active');
    });

    it('should not switch to disabled tabs', function() {
      expect(disabled_tab).to.have.class('disabled');
      activate(disabled_tab);
      expect(disabled_tab).to.have.class('disabled');
    });

    // THIS TEST USED TO BREAK IF RUN IN THE SAME SUITE AS THE MODAL TESTS
    // BUT ONLY RUNNING VIA GRUNT, NOT IN THE BROWSER :(
    // I THINK BECAUSE MODAL LEFT A LOT OF CRUFT IN THE TEST RUNNER HTML... 
      
    it('should load content remotely', function(done) {
      var third_section = el.find('section[id="' + third_tab.attr('aria-controls') + '"]');
      // the load call will fail, but that's ok - we will check both 
      // the remote call and the error response
      $(document).on("ajaxComplete", function() {
        $(document).off("ajaxComplete");
        expect(third_section).to.have('div.alert.error');
        expect(third_tab).to.have.class('active');
        expect(third_section).to.have.class('active');
        done();
      });
      activate(third_tab);
    });

  }); // click handlers

  describe('keyboard handlers', function() {
    beforeEach( function() {
      buildJQueryElement(jQueryMarkup);
    });

    it('should go to the next tab on right arrow/down arrow', function() {
      expect(first_tab).to.have.class('active');
      sendKey(first_tab, 39); // right arrow
      expect(second_tab).to.have.class('active');
    });

    it('should go to the previous tab on left arrow/up arrow', function() {
      // newly constructed tabs widget defaults to first tab
      expect(first_tab).to.have.class('active');
      activate(second_tab);
      expect(first_tab).to.not.have.class('active');
      expect(second_tab).to.have.class('active');
      sendKey(second_tab, 37); // left arrow
      expect(second_tab).to.not.have.class('active');
      expect(first_tab).to.have.class('active');
    });

    it('should skip over disabled tabs on right arrow', function() {
      activate(third_tab);
      expect(third_tab).to.have.class('active');
      sendKey(third_tab, 39); // right arrow
      expect(third_tab).to.not.have.class('active');
      expect(disabled_tab).to.not.have.class('active');
      expect(last_tab).to.have.class('active');       
    });

    it('should skip over disabled tabs on left arrow', function() {
      activate(last_tab);
      expect(last_tab).to.have.class('active');
      sendKey(last_tab, 37);
      expect(last_tab).to.not.have.class('active');
      expect(disabled_tab).to.not.have.class('active');
      expect(third_tab).to.have.class('active');
    });

    it('should wrap around on right arrow/down arrow', function() {
      activate(last_tab);
      expect(last_tab).to.have.class('active');
      expect(first_tab).to.not.have.class('active');
      sendKey(last_tab, 40); // down arrow
      expect(last_tab).to.not.have.class('active');
      expect(first_tab).to.have.class('active');
    });

    it('should wrap around on left arrow/up arrow', function() {
      // newly constructed tabs widget defaults to first tab
      expect(first_tab).to.have.class('active');
      expect(last_tab).to.not.have.class('active');
      sendKey(first_tab, 38); // up arrow
      expect(first_tab).to.not.have.class('active');
      expect(last_tab).to.have.class('active');
    });

  }); // keyboard handlers

  describe('from data-init', function() {
    beforeEach( function(){
      buildDataInitElement(dataInitMarkup);
    });

    afterEach( function () {
      $(el).remove();
    });

    // minor sanity check ... no need to retest all function for every constructor
    // find target by aria-controls and testing click handlers will 
    // validate constructor and initialization has worked
    it('does not override explicit active elements', function() {
      var first_section = el.find('section[id="' + first_tab.attr('aria-controls') + '"]');
      var second_section = el.find('section[id="' + second_tab.attr('aria-controls') + '"]');
      expect(first_tab).to.not.have.class('active');
      expect(first_section).to.not.have.class('active');
      expect(second_tab).to.have.class('active');
      expect(second_section).to.have.class('active');
    }); 

    it('should switch tabs on click', function() {
      var first_section = el.find('section[id="' + first_tab.attr('aria-controls') + '"]');
      var second_section = el.find('section[id="' + second_tab.attr('aria-controls') + '"]');
      activate(first_tab);
      expect(first_tab).to.have.class('active');
      expect(first_section).to.have.class('active');
      expect(second_tab).to.not.have.class('active');
      expect(second_section).to.not.have.class('active');
    });

  }); // from data-init


  // constructor option testing
  describe('passing options to', function() {
    
    var tabs;
    var tabsElement; 

    var constructElement = function() {
      tabsElement = $(jQueryMarkup).appendTo('body');
      tabsElement.attr('id', 'options-test-tabs');
      first_tab = $('#options-test-tabs').find('a').eq(0);
      second_tab = $('#options-test-tabs').find('a').eq(1);
      third_tab = $('#options-test-tabs').find('a').eq(2);
      disabled_tab = $('#options-test-tabs').find('a').eq(3);
      last_tab = $('#options-test-tabs').find('a').eq(4);
    };

    // set callback for each test run defined below
    var testOptions = function(set) {
      
      // test variants using private array of types
      CUI.Tabs().VARIANT_TYPES.forEach( function(type) {
        if (type != 'default') {
          it('can set type variant to '+ type, function() {
            expect($('#options-test-tabs')).to.not.have.class(type);
            set('type', type);
            expect($('#options-test-tabs')).to.have.class(type);
          });
        } else {
          it('can set type variant to default', function() {
            expect($('#options-test-tabs')).to.not.have.class(type);
            set('type', type);
            expect($('#options-test-tabs')).to.not.have.class(type);
            expect($('#options-test-tabs').attr('class')).to.equal('tabs');
          });
        }
      });


      it('will ignore type if sent an invalid type', function() {
        set('type', 'mariachi');
        expect($(tabs)).to.not.have.class('mariachi');
      });

      it('will set active for a non-active tab', function() {
        // first tab active by default
        expect(second_tab.hasClass('active')).to.be.false;
        set('active', 1); // index of second tab
        expect(second_tab.hasClass('active'), 'second tab active').to.be.true;
        var controlId = second_tab.attr('aria-controls');
        var second_section = $('#options-test-tabs').find('section[id="' + controlId + '"]');
        expect(second_section.hasClass('active'), 'second section active').to.be.true;
      });

      it('will ignore active for a disabled tab', function() {
        set('active', 3); // index of disabled tab
        expect(disabled_tab.hasClass('active')).to.equal(false);
      });
    }; // options tests


    describe('CUI.Tabs constructor', function() {

      beforeEach( function() {
        constructElement();
      });

      afterEach( function() {
        tabs = null;
        tabsElement.remove();
      });
        
      testOptions(function(key, value) {
        var options = {};
        options['element'] = tabsElement;
        options[key] = value;
        tabs = new CUI.Tabs(options);
      });

    }); // CUI.Tabs constructor

    describe('jQuery.tabs() constructor', function() {

      beforeEach( function() {
        constructElement();
      });

      afterEach( function() {
        tabs = null;
        tabsElement.remove();
      });
        
      testOptions(function(key, value) {
        var options = {};
        options['element'] = tabsElement;
        options[key] = value;
        tabs = $('#options-test-tabs').tabs(options);
      });

    }); // /jQuery tabs constructor


    describe('#set on existing Tabs', function() {

      before( function() {
        constructElement();
        tabs = new CUI.Tabs({element:tabsElement});
      });

      after( function() {
        tabs = null;
        tabsElement.remove();
      });
        
      testOptions(function(key, value) {
          tabs.set(key, value);
      });

    }); // set on existing tabs


  }); // passing options


}); // end test


