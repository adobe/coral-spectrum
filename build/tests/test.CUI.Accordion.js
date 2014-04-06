describe('CUI.Accordion', function () {
  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Accordion');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('accordion');
  });

  describe("events", function () {

    afterEach(function () {
      // some tests disable animations in order to accelerate the test; reset after each test
      $.fx.off = false;
    });

    it('should fire activate when activating one of its collapsibles', function (done) {
      var html =
        '<ul class="coral-Accordion"><li class="coral-Accordion-item"></li><li class="coral-Accordion-item"></li><li class="coral-Accordion-item"></li></ul>';
      var el = $(html).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible
      $.fx.off = true;

      el.on('activate', function (evt) {
        // expect event target to be the collapsible that has been clicked
        expect(evt.target).to.equal(collapsible.get(0));
        done();
      });

      header.trigger('click');
    });

    it('should fire deactivate when deactivating one of its collapsibles', function (done) {
      var html =
        '<ul><li></li><li></li><li></li></ul>';
      var el = $(html).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible
      $.fx.off = true;

      el.on('deactivate', function (evt) {
        // expect event target to be the collapsible that has been clicked
        expect(evt.target).to.equal(collapsible.get(0));
        done();
      });

      el.accordion('setActive', 0);
      header.trigger('click');
    });

    it('should fire deactivate when activating one of its collapsibles and another was active', function (done) {
      var html =
        '<ul><li></li><li></li><li></li></ul>';
      var el = $(html).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible
      $.fx.off = true;

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
      var html =
        '<ul><li></li><li></li><li></li></ul>';
      var el = $(html).accordion();
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
    });

    it('should fire multiple collapse events when deactivating one of its collapsibles', function (done) {
      var html =
        '<ul><li></li><li></li><li></li></ul>';
      var el = $(html).accordion();
      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3'); // header of the first collapsible
      var i = 0;

      el.on('collapse', function (evt, options) {
        i++;
        if (options.progress === 1) {
          expect(i).to.be.above(1);
          done();
        }
      });

      el.accordion('setActive', 0);
      header.trigger('click');
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
      var html =
        '<ul><li></li><li class="is-active"></li><li></li></ul>';
      var el = $(html).accordion();

      expect(el.is("[role=tablist]")).to.be.true;
      expect(el.find("li h3[role=tab]").length).equal(3);
      expect(el.find("li div[role=tabpanel]").length).equal(3);
      expect(el.find("li h3[role=tab]").attr('aria-controls')).equal(el.find("li div[role=tabpanel]").attr('id'));
      expect(el.find("li div[role=tabpanel]").attr('aria-labelledby')).equal(el.find("li h3[role=tab]").attr('id'));
    });

    it('should be a collapsible', function () {
      var html =
        '<div class="coral-Collapsible"></div>';
      var el = $(html).accordion();

      expect(el).to.have.class("coral-Collapsible");
      expect(el).to.not.have.class("coral-Accordion");
    });

    it('should disable accordion', function () {
      var html =
        '<ul data-disabled="true"><li></li><li></li><li></li></ul>';
      var el = $(html).accordion();

      expect(el.attr('aria-disabled')).to.equal('true');
      expect(el).to.have.class("is-disabled");
      expect(el.find(".coral-Accordion-item > .coral-Accordion-header[role=tab]")).attr('aria-disabled').to.equal('true');
    });

    it('should disable collapsible', function () {
      var html =
        '<div class="coral-Collapsible" data-disabled="true"></div>';
      var el = $(html).accordion();

      expect(el.attr('aria-disabled')).to.equal('true');
      expect(el).to.have.class("is-disabled");
      expect(el.find("> [role=button]")).attr('aria-disabled').to.equal('true');
    });

    it('should activate collapsible', function () {
      var html =
        '<div class="coral-Collapsible is-active"></div>';
      var el = $(html).accordion();

      var content = el.find('div');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
    });

    it('should activate collapsible within accordion', function () {
      var html =
        '<ul><li></li><li class="is-active"></li><li></li></ul>';
      var el = $(html).accordion();
      var secondCollapsible = el.find('li').eq(1);
      var secondCollapsibleHeader = secondCollapsible.find('h3');
      var secondContent = secondCollapsible.find('div');
      expect(secondContent.attr('aria-expanded')).to.equal('true');
      expect(secondContent.attr('aria-hidden')).to.equal('false');
      expect(secondCollapsibleHeader.attr('aria-selected')).to.equal('true');
    });

    it('should use the default collapsed icon when none is set', function () {
      var html =
        $('<div class="coral-Collapsible"></div>');
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');

      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--chevronRight')).to.be.true;
    });

    it('should use the default epxanded icon when none is set', function () {
      var html =
        $('<div class="coral-Collapsible"></div>');
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');
      header.trigger('click');
      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--chevronDown')).to.be.true;
    });

    it('should use the set collapsed icon', function () {
      var html =
        $('<div class="coral-Collapsible" data-icon-class-collapsed="coral-Icon--heart"></div>');
      var widget = new CUI.Accordion({element: html});
      var header = html.find('.coral-Collapsible-header');

      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--heart')).to.be.true;
    });

    it('should use the default epxanded icon', function () {
      var html =
        $('<div class="coral-Collapsible" data-icon-class-expanded="coral-Icon--heart"></div>');
      var widget = new CUI.Accordion({element: html});
      console.log(widget.options);
      var header = html.find('.coral-Collapsible-header');
      header.trigger('click');
      expect(header.eq(0).children().eq(0).hasClass('coral-Icon--heart')).to.be.true;
    });
  });

  describe('imperative API', function () {
    it('should expand collapsible in accordion', function () {
      var html =
        '<ul><li></li><li></li></ul>';
      var el = $(html).accordion();
      el.accordion('setActive', 1);
      var secondCollapsible = el.find('li').eq(1);
      var secondCollapsibleHeader = secondCollapsible.find('h3');
      var secondContent = secondCollapsible.find('div');

      expect(secondCollapsible).to.have.class("is-active");
      expect(secondCollapsibleHeader.attr('aria-selected')).to.equal('true');
      expect(secondContent.attr('aria-expanded')).to.equal('true');
      expect(secondContent.attr('aria-hidden')).to.equal('false');
    });

    it('should disable accordion', function () {
      var html =
        '<ul><li></li><li></li><li></li></ul>';
      var el = $(html).accordion({
        disabled: true
      });

      expect(el).to.have.class("is-disabled");
    });
  });

  describe('user interaction', function () {
    it('should expand collapsible in accordion when header is clicked', function () {
      var html =
        '<ul class="coral-Accordion"><li></li><li></li></ul>';
      var el = $(html).accordion();
      el.find('li h3').eq(1).trigger('click');

      var collapsible = el.find('li').eq(1);
      var collapsibleHeader = collapsible.find('h3');
      var content = collapsible.find('div');

      expect(collapsible).to.have.class("is-active");
      expect(collapsibleHeader.attr('aria-selected')).to.equal('true');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
    });

    it('should expand collapsible when header is clicked', function () {
      var html =
        '<div class="coral-Collapsible"></div>';
      var el = $(html).accordion();

      var header = el.find('h3');
      var content = el.find('div');

      header.trigger('click');
      expect(el).to.have.class('is-active');
      expect(header.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
    });

    it('should collapse expanded collapsible when header of different collapsible in same accordion is clicked', function () {
      var html =
        '<ul><li></li><li></li></ul>';
      var el = $(html).accordion();

      var firstCollapsible = el.find('li').eq(0);
      var firstCollapsibleHeader = firstCollapsible.find('h3');
      var firstContent = firstCollapsible.find('div');

      var secondCollapsibleHeader = el.find('li h3').eq(1);

      // Activate the first collapsible.
      // (ensuring the collapsible is active after click is covered by a separate test case)
      firstCollapsibleHeader.trigger('click');

      // Activate the second collapsible.
      secondCollapsibleHeader.trigger('click');
//    The "is-active" class and "display" css are modified after the animation. Turning $.fx.off = true and using an
//    async test still takes >200ms. Leaving assertions out.
//    expect(firstCollapsible).to.not.have.class("is-active");
//    expect(firstContent.css('display')).to.equal('none');
      expect(firstCollapsibleHeader.attr('aria-selected')).to.equal('false');
      expect(firstContent.attr('aria-expanded')).to.equal('false');
      expect(firstContent.attr('aria-hidden')).to.equal('true');
    });

    it('should not expand collapsible when accordion is disabled', function () {
      var html =
        '<ul class="coral-Accordion" data-disabled="true"><li></li><li></li></ul>';
      var el = $(html).accordion();

      var collapsible = el.find('.coral-Accordion-item').eq(0);
      var header = collapsible.find('.coral-Accordion-header');
      var content = collapsible.find('.coral-Accordion-content');

      header.trigger('click');
      expect(collapsible).to.not.have.class('is-active');
      expect(header.attr('aria-selected')).to.equal('false');
      expect(content.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-hidden')).to.equal('true');
    });

    it('should not expand collapsible when disabled', function () {
      var html =
        '<div class="coral-Collapsible" data-disabled="true"></div>';
      var el = $(html).accordion();

      var header = el.find('.coral-Collapsible-header');
      var content = el.find('.coral-Collapsible-content');

      header.trigger('click');
      expect(el).to.not.have.class('is-active');
      expect(header.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-hidden')).to.equal('true');
    });
  });

});
