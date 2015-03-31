describe('CUI.Tabs', function() {

  var el, first_tab, second_tab, third_tab, disabled_tab, last_tab;


  var activate = function(target) {
    target.trigger('click');
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
  };

  var jQueryMarkup = [
  '<div class="coral-TabPanel" id="dataInitMarkup">',
    '<nav class="coral-TabPanel-navigation">',
      '<a class="coral-TabPanel-tab" href="#first-tab" data-toggle="tab">Tab 1</a>',
      '<a class="coral-TabPanel-tab" href="#second-tab" data-toggle="tab">Tab 2</a>',
      '<a class="coral-TabPanel-tab" href="404.html" data-target="#third-tab" data-toggle="tab">Tab 3</a>',
      '<a class="coral-TabPanel-tab is-disabled" href="#disabled-tab" data-toggle="tab">Disabled Tab</a>',
      '<a class="coral-TabPanel-tab" href="#last-tab" data-toggle="tab">Last Tab</a>',
    '</nav>',
    '<div class="coral-TabPanel-content">',
      '<section class="coral-TabPanel-pane" id="first-tab">Lorem ipsum dolor sit amet.</section>',
      '<section class="coral-TabPanel-pane" id="second-tab">Aenean faucibus ornare laoreet. Cras luctus purus.</section>',
      '<section class="coral-TabPanel-pane" id="third-tab">faucibus ornare laoreet. Cras luctus purus.</section>',
      '<section class="coral-TabPanel-pane" id="disabled-tab">This will not be shown as the corresponding tab is disabled.</section>',
      '<section class="coral-TabPanel-pane" id="last-tab">This is the last tab</section>',
    '</div>',
  '</div>'
  ].join('');


  var buildDataInitElement = function(htmlMarkup) {
    el = $(htmlMarkup).appendTo('body');
    $('body').trigger('cui-contentloaded.data-api');
    first_tab = $(el.find('a')[0]);
    second_tab = $(el.find('a')[1]);
    third_tab = $(el.find('a')[2]);
    disabled_tab = last_tab = null;
  };

  var dataInitMarkup = [
    '<div class="coral-TabPanel" data-init="tabs">',
      '<nav class="coral-TabPanel-navigation">',
        '<a class="coral-TabPanel-tab" data-toggle="tab">Tab 1</a>',
        '<a class="coral-TabPanel-tab is-active" data-toggle="tab" data-target="foo">Tab 2</a>',
        '<a class="coral-TabPanel-tab" data-toggle="tab">Tab 3</a>',
        '<a class="coral-TabPanel-tab" data-toggle="tab">Tab 4</a>',
        '<a class="coral-TabPanel-tab" data-toggle="tab">Tab 3</a>',
      '</nav>',
      '<div class="coral-TabPanel-content">',
      '<section class="coral-TabPanel-pane">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>',
      '<section class="coral-TabPanel-pane is-active" id="foo">Nulla gangsta. Brizzle shizzlin dizzle pharetra neque. </section>',
      '<section class="coral-TabPanel-pane">Ipsizzle fo borizzle  mah zizzle fo rizzle.</section>',
      '</div>',
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
      expect(el).to.have.class('coral-TabPanel');
    });

    it('should have correct markup', function() {
      expect(el).to.have.descendants('nav[role="tablist"]');
      expect(el).to.have.descendants('section[role="tabpanel"]');
      expect(el).to.have.descendants('nav > a[role="tab"]');
    });

    it('should have role set to tab for links', function() {
      expect(el.find('nav > a[role="tab"]')).to.have.lengthOf(5);
    });

    it('should have role tab panel set on sections', function() {
      expect(el.find('section[role="tabpanel"]')).to.have.lengthOf(5);
    });

    it('should have both the first tab and section active', function() {
      expect(first_tab).to.have.class('is-active');
      expect(second_tab).to.not.have.class('is-active');
      expect(el.find('section[role="tabpanel"]').first()).to.have.class('is-active');
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
      expect(second_tab).to.have.class('is-active');
      expect(secondSection).to.have.class('is-active');
    });

    it('should not switch to disabled tabs', function() {
      expect(disabled_tab).to.have.class('is-disabled');
      activate(disabled_tab);
      expect(disabled_tab).to.have.class('is-disabled');
    });

    // THIS TEST USED TO BREAK IF RUN IN THE SAME SUITE AS THE MODAL TESTS
    // BUT ONLY RUNNING VIA GRUNT, NOT IN THE BROWSER :(
    // I THINK BECAUSE MODAL LEFT A LOT OF CRUFT IN THE TEST RUNNER HTML...

    it.skip('should load content remotely', function(done) {
      var third_section = el.find('section[id="' + third_tab.attr('aria-controls') + '"]');
      // the load call will fail, but that's ok - we will check both
      // the remote call and the error response
      $(document).on("ajaxComplete", function() {
        $(document).off("ajaxComplete");
        expect(third_section).to.have('div.alert.error');
        expect(third_tab).to.have.class('is-active');
        expect(third_section).to.have.class('is-active');
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
      expect(first_tab).to.have.class('is-active');
      sendKey(first_tab, 39); // right arrow
      expect(second_tab).to.have.class('is-active');
    });

    it('should go to the previous tab on left arrow/up arrow', function() {
      // newly constructed tabs widget defaults to first tab
      expect(first_tab).to.have.class('is-active');
      activate(second_tab);
      expect(first_tab).to.not.have.class('is-active');
      expect(second_tab).to.have.class('is-active');
      sendKey(second_tab, 37); // left arrow
      expect(second_tab).to.not.have.class('is-active');
      expect(first_tab).to.have.class('is-active');
    });

    it('should skip over disabled tabs on right arrow', function() {
      activate(third_tab);
      expect(third_tab).to.have.class('is-active');
      sendKey(third_tab, 39); // right arrow
      expect(third_tab).to.not.have.class('is-active');
      expect(disabled_tab).to.not.have.class('is-active');
      expect(last_tab).to.have.class('is-active');       
    });

    it('should skip over disabled tabs on left arrow', function() {
      activate(last_tab);
      expect(last_tab).to.have.class('is-active');
      sendKey(last_tab, 37);
      expect(last_tab).to.not.have.class('is-active');
      expect(disabled_tab).to.not.have.class('is-active');
      expect(third_tab).to.have.class('is-active');
    });

    it('should wrap around on right arrow/down arrow', function() {
      activate(last_tab);
      expect(last_tab).to.have.class('is-active');
      expect(first_tab).to.not.have.class('is-active');
      sendKey(last_tab, 40); // down arrow
      expect(last_tab).to.not.have.class('is-active');
      expect(first_tab).to.have.class('is-active');
    });

    it('should wrap around on left arrow/up arrow', function() {
      // newly constructed tabs widget defaults to first tab
      expect(first_tab).to.have.class('is-active');
      expect(last_tab).to.not.have.class('is-active');
      sendKey(first_tab, 38); // up arrow
      expect(first_tab).to.not.have.class('is-active');
      expect(last_tab).to.have.class('is-active');
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
      expect(first_tab).to.not.have.class('is-active');
      expect(first_section).to.not.have.class('is-active');
      expect(second_tab).to.have.class('is-active');
      expect(second_section).to.have.class('is-active');
    }); 

    it('should switch tabs on click', function() {
      var first_section = el.find('section[id="' + first_tab.attr('aria-controls') + '"]');
      var second_section = el.find('section[id="' + second_tab.attr('aria-controls') + '"]');
      activate(first_tab);
      expect(first_tab).to.have.class('is-active');
      expect(first_section).to.have.class('is-active');
      expect(second_tab).to.not.have.class('is-active');
      expect(second_section).to.not.have.class('is-active');
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
      var tbp = CUI.Tabs();
      tbp.VARIANT_TYPES.forEach( function(type) {
        if (type != 'default' && tbp.VARIANT_CLASS_MAPPING[type].length) {
          it('can set type variant to '+ type, function() {
            expect($('#options-test-tabs')).to.not.have.class(tbp.VARIANT_CLASS_MAPPING[type]);
            set('type', type);
            expect($('#options-test-tabs')).to.have.class(tbp.VARIANT_CLASS_MAPPING[type]);
          });
        } else {
          it('can set type variant to default', function() {
            expect($('#options-test-tabs')).to.not.have.class(type);
            set('type', type);
            expect($('#options-test-tabs')).to.not.have.class(type);
            expect($('#options-test-tabs').attr('class')).to.equal('coral-TabPanel');
          });
        }
      });


      it('will ignore type if sent an invalid type', function() {
        set('type', 'mariachi');
        expect($(tabs)).to.not.have.class('mariachi');
      });

      it('will set active for a non-active tab', function() {
        // first tab active by default
        expect(second_tab.hasClass('is-active')).to.be.false;
        set('active', 1); // index of second tab
        expect(second_tab.hasClass('is-active'), 'second tab active').to.be.true;
        var controlId = second_tab.attr('aria-controls');
        var second_section = $('#options-test-tabs').find('section#' + controlId);
        expect(second_section.hasClass('is-active'), 'second section active').to.be.true;
      });

      it('will ignore active for a disabled tab', function() {
        set('active', 3); // index of disabled tab
        expect(disabled_tab.hasClass('is-active')).to.equal(false);
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

  describe('adding/removing tabs', function() {
    var $el,
      widget,
      tabContent = 'Test tab',
      panelContent = 'Test panel';

    var getTabs = function() {
      return widget._getTabs();
    };

    var getPanels = function() {
      return widget._getPanels();
    };

    beforeEach(function() {
      $el = $(jQueryMarkup).appendTo('body');
      widget = new CUI.Tabs({element:$el});
    });

    afterEach(function() {
      $el.remove();
      $el = widget = null;
    });

    describe('adding tabs', function() {
      it('will use provided content as a string', function() {
        widget.addItem({
          tabContent: tabContent,
          panelContent: panelContent
        });

        var $tabs = getTabs();
        var $panels = getPanels();

        expect($tabs.length).to.equal(6);
        expect($panels.length).to.equal(6);
        expect($tabs.last()).to.have.text(tabContent);
        expect($panels.last()).to.have.text(panelContent);
      });

      it('will use provided content as a DOM element', function() {
        var tabHTML = '<div>my tab</div>';
        var panelHTML = '<div>my panel</div>';

        widget.addItem({
          tabContent: $(tabHTML)[0],
          panelContent: $(panelHTML)[0]
        });

        var $tabs = getTabs();
        var $panels = getPanels();

        expect($tabs.length).to.equal(6);
        expect($panels.length).to.equal(6);
        expect($tabs.last()).to.have.html(tabHTML);
        expect($panels.last()).to.have.html(panelHTML);
      });

      it('will use provided content as a jQuery-wrapped element(s)', function() {
        var tabHTML = '<div>my tab</div>';
        var panelHTML = '<div>content</div><div>and more content</div>';

        widget.addItem({
          tabContent: $(tabHTML),
          panelContent: $(panelHTML)
        });

        var $tabs = getTabs();
        var $panels = getPanels();

        expect($tabs.length).to.equal(6);
        expect($panels.length).to.equal(6);
        expect($tabs.last()).to.have.html(tabHTML);
        expect($panels.last()).to.have.html(panelHTML);
      });

      it('will apply a consumer-provided ID to the panel and return it', function() {
        var testID = 'testID';

        var returnID = widget.addItem({
          panelID: 'testID'
        });

        expect(getPanels().last()).to.have.attr('id', testID);
        expect(returnID).to.equal(returnID);
      });

      it('will create and return a panel ID if one is not provided', function() {
        var returnID = widget.addItem();

        expect(returnID).to.be.a('string');
        expect(returnID).to.have.length.above(0);
        expect(getPanels().last().attr('id')).to.equal(returnID);
      });

      it('will link the tab to the panel', function() {
        widget.addItem();

        expect(getTabs().last()).to.have.attr('aria-controls',
            getPanels().last().attr('id'));
      });

      it('will apply remote URL', function() {
        widget.addItem({
          panelURL: 'test.html'
        });

        expect(getTabs().last()).to.have.attr('href', 'test.html');
      });

      it('will add a tab at index 0', function() {
        widget.addItem({
          tabContent: tabContent,
          panelContent: panelContent,
          index: 0
        });

        expect(getTabs().first()).to.have.text(tabContent);
        expect(getPanels().first()).to.have.text(panelContent);
      });

      it('will correct a negative index', function() {
        widget.addItem({
          tabContent: tabContent,
          panelContent: panelContent,
          index: -100
        });

        expect(getTabs().first()).to.have.text(tabContent);
        expect(getPanels().first()).to.have.text(panelContent);
      });

      it('will correct an index that is too high', function() {
        widget.addItem({
          tabContent: tabContent,
          panelContent: panelContent,
          index: 100
        });

        expect(getTabs().last()).to.have.text(tabContent);
        expect(getPanels().last()).to.have.text(panelContent);
      });

      it('will add a tab when no other tabs exist', function() {
        $el.find('a,section').remove(); // shortcut

        widget.addItem({
          tabContent: tabContent,
          panelContent: panelContent
        });

        expect(getTabs().first()).to.have.text(tabContent);
        expect(getPanels().first()).to.have.text(panelContent);
      });

      it('will activate the tab when active=true', function() {
        widget.addItem({
          active: true
        });

        expect(getTabs().last()).to.have.class('is-active');
        expect(getPanels().last()).to.have.class('is-active');
      });

      it('will not activate the tab when active=false', function() {
        widget.addItem({
          active: false
        });

        expect(getTabs().last()).not.to.have.class('is-active');
        expect(getPanels().last()).not.to.have.class('is-active');
      });

      it('will not activate the tab when active=true and enabled=false', function() {
        widget.addItem({
          active: true,
          enabled: false
        });

        expect(getTabs().last()).not.to.have.class('is-active');
        expect(getPanels().last()).not.to.have.class('is-active');
      });

      it('will disable the tab when enabled=false', function() {
        widget.addItem({
          enabled: false
        });

        expect(getTabs().last()).to.have.class('is-disabled');
      });
    });

    describe('removing tabs', function() {
      it('will remove a tab by index', function() {
        var $tab = getTabs().eq(1);
        var $panel = getPanels().eq(1);

        widget.removeItem(1);

        expect($tab.parent().length).to.equal(0);
        expect($panel.parent().length).to.equal(0);
      });

      it('will remove a tab by panel ID', function() {
        var $tab = getTabs().eq(1);
        var $panel = getPanels().eq(1);

        widget.removeItem($panel.attr('id'));

        expect($tab.parent().length).to.equal(0);
        expect($panel.parent().length).to.equal(0);
      });

      it('will activate nearest eligible following tab if tab being removed is active', function() {
        widget.set('active', 1);
        var $nearestTab = getTabs().eq(2);
        var $nearestPanel = getTabs().eq(2);
        widget.removeItem(1);
        expect($nearestTab).to.have.class('is-active');
        expect($nearestPanel).to.have.class('is-active');
      });

      it('will activate nearest eligible previous tab if tab being removed is active and no eligible tabs follow', function() {
        widget.set('active', 4);
        var $nearestTab = getTabs().eq(2); // tab at index 3 is disabled.
        var $nearestPanel = getTabs().eq(2); // tab at index 3 is disabled.
        widget.removeItem(4);
        expect($nearestTab).to.have.class('is-active');
        expect($nearestPanel).to.have.class('is-active');
      });

      it('will not activate a different tab if tab being removed is not active', function() {
        widget.set('active', 4);
        var $activeTab = getTabs().eq(4);
        widget.removeItem(1);
        expect($activeTab).to.have.class('is-active');
      });
    });
  });
}); // end test


