describe('CUI.Accordion', function() {
  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('Accordion');
  });

  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('accordion');
  });

  describe("from markup", function() {
    it('should be an accordion', function() {
      var html =
          '<ul><li></li><li class="active"></li><li></li></ul>';
      var el = $(html).accordion();

      expect(el).to.have.class("accordion");
      expect(el).to.not.have.class("collapsible");
    });

    it('should have role=tablist', function() {
      var html =
          '<ul><li></li><li class="active"></li><li></li></ul>';
      var el = $(html).accordion();

      expect(el.is("[role=tablist]")).to.be.true;
      expect(el.find("li h3[role=tab]").length).equal(3);
      expect(el.find("li div[role=tabpanel]").length).equal(3);
    });

    it('should be a collapsible', function() {
      var html =
          '<div class="collapsible"></div>';
      var el = $(html).accordion();

      expect(el).to.have.class("collapsible");
      expect(el).to.not.have.class("accordion");
    });

    it('should disable accordion', function() {
      var html =
          '<ul data-disabled="true"><li></li><li></li><li></li></ul>';
      var el = $(html).accordion();

      expect(el.attr('aria-disabled')).to.equal('true');
      expect(el).to.have.class("disabled");
    });

    it('should disable collapsible', function() {
      var html =
          '<div class="collapsible" data-disabled="true"></div>';
      var el = $(html).accordion();

      expect(el.attr('aria-disabled')).to.equal('true');
      expect(el).to.have.class("disabled");
    });

    it('should activate collapsible', function() {
      var html =
          '<div class="collapsible active"></div>';
      var el = $(html).accordion();

      var content = el.find('div');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
      expect(content.css('display')).to.equal('block');
    });

    it('should activate collapsible within accordion', function() {
      var html =
          '<ul><li></li><li class="active"></li><li></li></ul>';
      var el = $(html).accordion();
      var secondContent = el.find('li div').eq(1);
      expect(secondContent.attr('aria-expanded')).to.equal('true');
      expect(secondContent.attr('aria-hidden')).to.equal('false');
      expect(secondContent.css('display')).to.equal('block');
    });
  });

  describe('imperative API', function() {
    it('should expand collapsible in accordion', function() {
      var html =
          '<ul><li></li><li></li></ul>';
      var el = $(html).accordion();
      el.accordion('setActive', 1);
      var secondCollapsible = el.find('li').eq(1);
      var secondCollapsibleHeader = secondCollapsible.find('h3');
      var secondContent = secondCollapsible.find('div');

      expect(secondCollapsible).to.have.class("active");
      expect(secondCollapsibleHeader.attr('aria-selected')).to.equal('true');
      expect(secondContent.css('display')).to.equal('block');
      expect(secondContent.attr('aria-expanded')).to.equal('true');
      expect(secondContent.attr('aria-hidden')).to.equal('false');
    });

    it('should disable accordion', function() {
      var html =
          '<ul><li></li><li></li><li></li></ul>';
      var el = $(html).accordion({
        disabled: true
      });

      expect(el).to.have.class("disabled");
    });
  });

  describe('user interaction', function() {
    it('should expand collapsible in accordion when header is clicked', function() {
      var html =
          '<ul><li></li><li></li></ul>';
      var el = $(html).accordion();
      el.find('li h3').eq(1).trigger('click');

      var collapsible = el.find('li').eq(1);
      var collapsibleHeader = collapsible.find('h3');
      var content = collapsible.find('div');

      expect(collapsible).to.have.class("active");
      expect(collapsibleHeader.attr('aria-selected')).to.equal('true');
      expect(content.css('display')).to.equal('block');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
    });

    it('should expand collapsible when header is clicked', function() {
      var html =
          '<div class="collapsible"></div>';
      var el = $(html).accordion();

      var header = el.find('h3');
      var content = el.find('div');

      header.trigger('click');
      expect(el).to.have.class('active');
      expect(header.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-expanded')).to.equal('true');
      expect(content.attr('aria-hidden')).to.equal('false');
      expect(content.css('display')).to.equal('block');
    });

    it('should collapse expanded collapsible when header of different collapsible in same accordion is clicked', function() {
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
//    The "active" class and "display" css are modified after the animation. Turning $.fx.off = true and using an
//    async test still takes >200ms. Leaving assertions out.
//    expect(firstCollapsible).to.not.have.class("active");
//    expect(firstContent.css('display')).to.equal('none');
      expect(firstCollapsibleHeader.attr('aria-selected')).to.equal('false');
      expect(firstContent.attr('aria-expanded')).to.equal('false');
      expect(firstContent.attr('aria-hidden')).to.equal('true');
    });

    it ('should not expand collapsible when accordion is disabled', function() {
      var html =
          '<ul data-disabled="true"><li></li><li></li></ul>';
      var el = $(html).accordion();

      var collapsible = el.find('li').eq(0);
      var header = collapsible.find('h3');
      var content = collapsible.find('div');

      header.trigger('click');
      expect(collapsible).to.not.have.class('active');
      expect(header.attr('aria-selected')).to.equal('false');
      expect(content.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-hidden')).to.equal('true');
      expect(content.css('display')).to.equal('none');
    });

    it ('should not expand collapsible when disabled', function() {
      var html =
          '<div class="collapsible" data-disabled="true"></div>';
      var el = $(html).accordion();

      var header = el.find('h3');
      var content = el.find('div');

      header.trigger('click');
      expect(el).to.not.have.class('active');
      expect(header.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-expanded')).to.equal('false');
      expect(content.attr('aria-hidden')).to.equal('true');
      expect(content.css('display')).to.equal('none');
    });
  });

});
