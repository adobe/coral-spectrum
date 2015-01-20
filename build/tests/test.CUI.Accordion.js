describe('CUI.Accordion', function () {
  var ACCORDION_HTML = '' +
    '<ul class="coral-Accordion">' +
    '  <li class="coral-Accordion-item">' +
    '    <h3 class="coral-Accordion-header">' +
    '      <span class="coral-Accordion-title">My title 1</span>' +
    '    </h3>' +
    '    <div class="coral-Accordion-content">My content 1.</div>' +
    '  </li>' +
    '  <li class="coral-Accordion-item">' +
    '    <h3 class="coral-Accordion-header">' +
    '      <span class="coral-Accordion-title">My title 2</span>' +
    '    </h3>' +
    '    <div class="coral-Accordion-content">My content 2.</div>' +
    '  </li>' +
    '</ul>';

  var COLLAPSIBLE_HTML = '' +
    '<div class="coral-Collapsible">' +
    '  <h3 class="coral-Collapsible-header">' +
    '    <span class="coral-Collapsible-title">My title 1</span>' +
    '  </h3>' +
    '  <div class="coral-Collapsible-content">My content 1.</div>' +
    '</div>';

  // Assert whether a collapsible (whether alone or inside an accordion) is properly active or inactive.
  var assertActiveness = function(collapsible, isActive) {
    var header = collapsible.find('.coral-Accordion-header,.coral-Collapsible-header');
    var content = collapsible.find('.coral-Accordion-content,.coral-Collapsible-content');
    var isAccordion = header.hasClass('.coral-Accordion-header');

    if (isActive) {
      expect(collapsible).to.have.class("is-active");
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
      expect(content.height()).to.be.above(0);
      expect(content.css('display')).to.equal('block');

      if (isAccordion) {
        expect(header.attr('aria-selected')).to.equal('true');
      }
    } else {
      expect(collapsible).to.not.have.class("is-active");
      expect(content.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-hidden')).to.equal('true');
      expect(content.height()).to.equal(0);
      expect(content.css('display')).to.equal('none');

      if (isAccordion) {
        expect(header.attr('aria-selected')).to.equal('false');
      }
    }
  };

  beforeEach(function() {
    $.fx.off = true; // Turn off animations to ease testing.
  });

  afterEach(function() {
    $.fx.off = false;
  });

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Accordion');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('accordion');
  });

  describe("events", function () {
    it('should fire activate when activating one of its collapsibles', function (done) {
      var el = $(ACCORDION_HTML).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible

      el.on('activate', function (evt) {
        // expect event target to be the collapsible that has been clicked
        expect(evt.target).to.equal(collapsible.get(0));
        done();
      });

      header.trigger('click');
    });

    it('should fire deactivate when deactivating one of its collapsibles', function (done) {
      var el = $(ACCORDION_HTML).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible

      el.on('deactivate', function (evt) {
        // expect event target to be the collapsible that has been clicked
        expect(evt.target).to.equal(collapsible.get(0));
        done();
      });

      el.accordion('setActive', 0);
      header.trigger('click');
    });

    it('should fire deactivate when activating one of its collapsibles and another was active', function (done) {
      var el = $(ACCORDION_HTML).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible

      el.on('deactivate', function (evt) {
        // expect event target to be the collapsible that has been collapsed
        var collapsedCollapsible = el.find('li').get(1);
        expect(evt.target).to.equal(collapsedCollapsible);
        done();
      });

      el.accordion('setActive', 1);
      header.trigger('click');
    });

    it('should fire multiple expand events when activating one of its collapsibles', function (done) {
      var prevFx = $.fx.off;
      $.fx.off = false; // Important for animations to be on.
      var el = $(ACCORDION_HTML).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible
      var i = 0;

      el.on('expand', function (evt, options) {
        i++;
        if (options.progress === 1) {
          expect(i).to.be.above(1);
          done();
        }
      });

      // activate second collapsible in oder to collapse first collapsible
      header.trigger('click');
      $.fx.off = prevFx;
    });

    it('should fire multiple collapse events when deactivating one of its collapsibles', function (done) {
      var prevFx = $.fx.off;
      $.fx.off = false; // Important for animations to be on.
      var el = $(ACCORDION_HTML).appendTo('body').accordion({active: 0});
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible
      var i = 0;

      el.on('collapse', function (evt, options) {
        i++;
        if (options.progress === 1) {
          expect(i).to.be.above(1);
          el.remove();
          done();
        }
      });

      header.trigger('click');
      $.fx.off = prevFx;
    });

  });

  describe("from markup", function () {
    it('should be an accordion', function () {
      var html =
        '<ul><li></li><li class="is-active"></li><li></li></ul>';
      var el = $(html).accordion();

      expect(el).to.have.class("coral-Accordion");
      expect(el).to.not.have.class("coral-Collapsible");
    });

    it('should have role=tablist', function () {
      var el = $(ACCORDION_HTML).accordion();

      expect(el.is("[role=tablist]")).to.be.true;
      expect(el.find("li h3[role=tab]").length).equal(2);
      expect(el.find("li div[role=tabpanel]").length).equal(2);
      expect(el.find("li h3[role=tab]").attr('aria-controls')).equal(el.find("li div[role=tabpanel]").attr('id'));
      expect(el.find("li div[role=tabpanel]").attr('aria-labelledby')).equal(el.find("li h3[role=tab]").attr('id'));
    });

    it('should be a collapsible', function () {
      var el = $(COLLAPSIBLE_HTML).accordion();

      expect(el).to.have.class("coral-Collapsible");
      expect(el).to.not.have.class("coral-Accordion");
    });

    it('should disable accordion', function () {
      var el = $(ACCORDION_HTML).attr('data-disabled', true).accordion();

      expect(el.attr('aria-disabled')).to.equal('true');
      expect(el).to.have.class("is-disabled");
      expect(el.find(".coral-Accordion-item > .coral-Accordion-header[role=tab]")).attr('aria-disabled').to.equal('true');
    });

    it('should disable collapsible', function () {
      var el = $(COLLAPSIBLE_HTML).attr('data-disabled', true).accordion();

      expect(el.attr('aria-disabled')).to.equal('true');
      expect(el).to.have.class("is-disabled");
      expect(el.find("> [role=button]")).attr('aria-disabled').to.equal('true');
    });

    it('should activate collapsible', function () {
      var el = $(COLLAPSIBLE_HTML).addClass('is-active').accordion();

      var content = el.find('div');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
    });

    it('should activate collapsible within accordion', function () {
      var el = $(ACCORDION_HTML);
      el.find('li:eq(1)').addClass('is-active');
      el.accordion();
      var secondCollapsible = el.find('li').eq(1);
      var secondCollapsibleHeader = secondCollapsible.find('h3');
      var secondContent = secondCollapsible.find('div');
      expect(secondContent.attr('aria-expanded')).to.equal('true');
      expect(secondContent.attr('aria-hidden')).to.equal('false');
      expect(secondCollapsibleHeader.attr('aria-selected')).to.equal('true');
    });

    it('should use the default collapsed icon when none is set', function () {
      var html = $(COLLAPSIBLE_HTML);
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');

      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--chevronRight')).to.be.true;
    });

    it('should use the default expanded icon when none is set', function () {
      var html = $(COLLAPSIBLE_HTML);
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');
      header.trigger('click');
      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--chevronDown')).to.be.true;
    });

    it('should use the set collapsed icon', function () {
      var html =
        $(COLLAPSIBLE_HTML).attr('data-icon-class-collapsed', 'coral-Icon--heart');
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');

      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--heart')).to.be.true;
    });

    it('should use the default expanded icon', function () {
      var html =
        $(COLLAPSIBLE_HTML).attr('data-icon-class-expanded', 'coral-Icon--heart');
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');
      header.trigger('click');
      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--heart')).to.be.true;
    });
  });

  describe('imperative API', function () {
    it('should expand collapsible in accordion', function () {
      var el = $(ACCORDION_HTML).appendTo('body').accordion();
      el.accordion('setActive', 1);
      var secondCollapsible = el.find('li').eq(1);
      var secondCollapsibleHeader = secondCollapsible.find('h3');
      var secondContent = secondCollapsible.find('div');

      assertActiveness(secondCollapsible, true);
      el.remove();
    });

    it('should disable accordion', function () {
      var el = $(ACCORDION_HTML).accordion({
        disabled: true
      });

      expect(el).to.have.class("is-disabled");
    });

    it('should update the active panel on "active" option changing', function () {
      var el = $(ACCORDION_HTML).appendTo('body').accordion({active: 0});
      expect(el.find('.is-active').index()).to.equal(0);

      el.data('accordion').set('active', 1);
      expect(el.find('.is-active').length).to.equal(1);
      expect(el.find('.is-active').index()).to.equal(1);
    });

    it('should do nothing when activating a panel that is already active', function() {
      var el = $(ACCORDION_HTML).appendTo('body');
      var accordion = new CUI.Accordion({element: el, active: 1});

      var spy = sinon.spy();
      el.on('activate deactivate', spy);

      accordion.setActive(1);
      accordion.setActive(1);
      accordion.setActive(1);

      expect(spy.callCount).to.equal(0);
    });
  });

  describe('user interaction', function () {
    it('should expand collapsible in accordion when header is clicked', function () {
      var el = $(ACCORDION_HTML).appendTo('body').accordion();

      var collapsible = el.find('li').eq(1);
      collapsible.find('h3').trigger('click');

      assertActiveness(collapsible, true);
      el.remove();
    });

    it.skip('should collapse expanded collapsible in accordion when header is clicked', function () {
      var el = $(ACCORDION_HTML).appendTo('body').accordion({active: 1});

      var collapsible = el.find('li').eq(1);
      collapsible.find('h3').trigger('click');

      assertActiveness(collapsible, false);
      el.remove();
    });

    it.skip('should collapse markup-expanded collapsible in accordion when header is clicked', function () {
      var el = $(ACCORDION_HTML).appendTo('body');

      var collapsible = el.find('li').eq(1);
      collapsible.addClass('is-active');

      el.accordion();

      collapsible.find('h3').trigger('click');

      assertActiveness(collapsible, false);
      el.remove();
    });

    it('should expand collapsed collapsible when header is clicked', function () {
      var el = $(COLLAPSIBLE_HTML).appendTo('body').accordion();

      var header = el.find('h3');

      header.trigger('click');
      assertActiveness(el, true);
      el.remove();
    });

    it.skip('should collapse expanded collapsible when header is clicked', function () {
      var el = $(COLLAPSIBLE_HTML).appendTo('body').accordion({active: true});

      var header = el.find('h3');

      header.trigger('click');
      assertActiveness(el, false);
      el.remove();
    });

    it.skip('should collapse markup-expanded collapsible when header is clicked', function () {
      var el = $(COLLAPSIBLE_HTML).addClass('is-active').appendTo('body').accordion();

      var header = el.find('h3');

      header.trigger('click');
      assertActiveness(el, false);
      el.remove();
    });

    it.skip('should collapse expanded collapsible when header of different collapsible in same accordion is clicked', function () {
      var el = $(ACCORDION_HTML).appendTo('body').accordion();

      var firstCollapsible = el.find('li').eq(0);
      var firstCollapsibleHeader = firstCollapsible.find('h3');

      var secondCollapsibleHeader = el.find('li h3').eq(1);

      // Activate the first collapsible.
      // (ensuring the collapsible is active after click is covered by a separate test case)
      firstCollapsibleHeader.trigger('click');

      // Activate the second collapsible.
      secondCollapsibleHeader.trigger('click');

      assertActiveness(firstCollapsible, false);
      el.remove();
    });

    it.skip('should not expand collapsible when accordion is disabled', function () {
      var el = $(ACCORDION_HTML).attr('data-disabled', true).appendTo('body').accordion();

      var collapsible = el.find('.coral-Accordion-item').eq(0);
      var header = collapsible.find('.coral-Accordion-header');

      header.trigger('click');
      assertActiveness(collapsible, false);
      el.remove();
    });

    it.skip('should not expand collapsible when disabled', function () {
      var el = $(COLLAPSIBLE_HTML).attr('data-disabled', true).appendTo('body').accordion();

      var header = el.find('.coral-Collapsible-header');

      header.trigger('click');
      assertActiveness(el, false);
      el.remove();
    });
  });

});
