describe('CUI.Tabs', function() {
  var config = {
    tabs: [
      {
        id: 'first-tab',
        label: 'First tab',
        content: 'The contents of the first tab',
        active: true
      },
      {
        id: 'second-tab',
        label: 'Second tab',
        content: 'The contents of the second tab'
      },
      {
        id: 'third-tab',
        label: 'Remote tab',
        remote: '404.html'
      },
      {
        id: 'disabled-tab',
        disabled: true,
        label: 'Disabled tab',
        content: 'The contents of the disabled tab'
      },
      {
        id: 'last-tab',
        label: 'Last tab',
        content: 'The contents of the last tab'
      }
    ]
  };
  
  describe('definition', function() {
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Tabs');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('tabs');
    });
  });
  
  describe('from template', function() {
    var el = $('<div/>').appendTo('body').tabs(config);

    var first_tab = el.find('a[href="#first-tab"]'), second_tab = el.find('a[href="#second-tab"]'),
        third_tab = el.find('a[data-target="#third-tab"]'), disabled_tab = el.find('a[href="#disabled-tab"]'),
        last_tab = el.find('a[href="#last-tab"]');
  
    it('should have correct CSS classname', function() {
      expect(el).to.have.class('tabs');
    });
    
    it('should have correct markup', function() {
      expect(el).to.have('nav[role="tablist"]');
      expect(el).to.have('section[role="tabpanel"]');
      expect(el).to.have('nav > a[role="tab"]');
    });
    
    it('should have tab links', function() {
      expect(el.find('nav > a[role="tab"]')).to.have.lengthOf(5); 
    });

    it('should have sections', function() {
      expect(el.find('section[role="tabpanel"]')).to.have.lengthOf(5);
    });

    it('should have both the first tab and section active', function() {
      expect(first_tab).to.have.class('active');
      expect(el.find('section[role="tabpanel"]').first()).to.have.class('active');
    });
    
    it('should have a visible first section', function() {
      expect(el.find('section[role="tabpanel"]').first()).to.not.have.css('display', 'none');
    });

    describe('click handlers', function() {
      // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//      it('should switch to a non-disabled tab', function() {
//        second_tab.click();
//        expect(second_tab).to.have.class('active');
//        expect(el.find('#second-tab')).to.have.class('active');
//      });

      it('should not switch to disabled tabs', function() {
        disabled_tab.click();
        expect(disabled_tab).not.to.have.class('active');
        expect(el.find('#disabled-tab')).not.to.have.class('active');
      });

      // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//      it('should load content remotely', function(done) {
//        var third_section = el.find('#third-tab');
//        third_tab.click();
//        expect(third_tab).to.have.class('active');
//        expect(third_section).to.have.class('active');
//        // this call will fail, but that's ok - this checks both the error handling
//        // and the remote call
//        third_section.ajaxComplete(function() {
//          third_section.unbind('ajaxComplete');
//          expect(third_section).to.have('div.alert.error');
//          done();
//        });
//      });
    });

    describe('keyboard handlers', function() {
      // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//      it('should go to the next tab on right arrow/down arrow', function() {
//        first_tab.click();
//        first_tab.trigger(jQuery.Event('keydown', {which: 39})); // right arrow
//        expect(second_tab).to.have.class('active');
//      });

      it('should go to the previous tab on left arrow/up arrow', function() {
        second_tab.click();
        second_tab.trigger(jQuery.Event('keydown', {which: 37})); // left arrow
        expect(first_tab).to.have.class('active');
      });

      // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//      it('should skip over disabled tabs on right arrow', function() {
//        third_tab.click();
//        expect(third_tab).to.have.class('active');
//        third_tab.trigger(jQuery.Event('keydown', {which: 39}));
//        expect(last_tab).to.have.class('active');
//      });

      // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//      it('should skip over disabled tabs on left arrow', function() {
//        last_tab.click();
//        last_tab.trigger(jQuery.Event('keydown', {which: 37}));
//        expect(third_tab).to.have.class('active');
//      });

      it('should wrap around on right arrow/down arrow', function() {
        last_tab.click();
        last_tab.trigger(jQuery.Event('keydown', {which: 40}));
        expect(first_tab).to.have.class('active');
      });

      // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//      it('should wrap around on left arrow/up arrow', function() {
//        first_tab.click();
//        first_tab.trigger(jQuery.Event('keydown', {which: 38}));
//        expect(last_tab).to.have.class('active');
//      });
    });
  });
  
  describe('from template with custom config', function() {
    it('should set the first tab to active when no active tab is specified', function() {
      var new_config = $.extend({}, config);
      new_config.tabs[0].active = false;
      var el = $('<div/>').appendTo('body').tabs(new_config);
      expect(el.find('a[href="#first-tab"]')).to.have.class('active');
    });
  });

  
  describe('from markup', function() {
    var tabsHTML = [
      '<div class="tabs">',
        '<nav>',
          '<a href="#" data-toggle="tab" class="active">Tab 1</a>',
          '<a href="#" data-toggle="tab">Tab 2</a>',
          '<a href="/remote.html" data-target="#" data-toggle="tab">Tab 3</a>',
          '<a href="#" data-toggle="tab" class="disabled">Disabled Tab</a>',
        '</nav>',
        '<section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>',
        '<section>Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>',
        '<section>This will be replaced :)</section>',
        '<section>This section will never be shown :(</section>',
      '</div>'
    ].join();
    
    var el = $(tabsHTML).appendTo('body');
    
    var modal = new CUI.Tabs({
      element: el
    });
  
    it('should not overwrite tabs and have proper role', function() {
      expect(el.find('a[role="tab"]').first()).to.have.html('Tab 1');
    });
    
    it('should not overwrite sections', function() {
      expect(el.find('section[role="tabpanel"]').first()).to.have.html('Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.');
    });

    // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-572)
//    it('should switch tabs on click', function() {
//      var second_tab = el.find('a').eq(1);
//      second_tab.click();
//      expect(second_tab).to.have.class('active');
//      expect(el.find('section').eq(1)).to.have.class('active');
//    });
  });

  describe('from markup with missing active', function() {
    var tabsHTML = [
      '<div class="tabs">',
        '<nav>',
          '<a href="#" data-toggle="tab">Tab 1</a>',
        '</nav>',
        '<section>Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>',
      '</div>'
    ].join();
    
    it('sets the first tab as active on load if none are specified', function() {
      var el = $(tabsHTML).appendTo('body');
      $('body').trigger('cui-onload');

      expect(el.find('a')).to.have.class('active');
      expect(el.find('section')).to.have.class('active');
    });
  });
  
  describe('options', function() {
    var el, tabs;

    var optionsTests = function(set) {
      ['white', 'stacked', 'nav'].forEach(function(type) {
        it('can set type to '+type, function() {
          set('type', type);
          expect(el).to.have.class(type);
        });
      });

      it('can not set an invalid type', function() {
        set('type', 'mariachi');
        expect(el).not.to.have.class('mariachi');
      });

      it('can set the active tab', function() {
        set('active', 'second-tab');
        expect(el.find('a[href="#second-tab"]')).to.have.class('active');
      });

      it('can not activate a disabled tab', function() {
        set('active', 'disabled-tab');
        expect(el.find('a[href="#disabled-tab"]')).not.to.have.class('active');
      });
    }

    describe('with class', function() {
      beforeEach(function() {
        el = $('<div/>');
        tabs = new CUI.Tabs($.extend({element: el}, config));
      });

      optionsTests(function(k, v) {
        tabs.set(k, v);
      });
    });

    describe('with jQuery', function() {
      beforeEach(function() {
        el = $('<div/>').tabs(config);
      });

      optionsTests(function(k, v) {
        var c = {};
        c[k] = v;
        el.tabs(c)
      });
    });
  });
});
