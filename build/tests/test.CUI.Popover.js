describe('CUI.Popover', function() {
  var popoverBorderThickness = 8;
  var tailDimensions = {
    topBottom: {
      width: 24,
      height: 12
    },
    leftRight: {
      width: 12,
      height: 24
    }
  };

  // To properly test popover positioning we need to simulate styles that will be commonly found in
  // a real environment. While we could use the CoralUI stylesheet directly, the test cases would then need
  // to be updated when trivial changes are made to the stylesheet (e.g., tail size or border width). Instead, we'll
  // use these styles (derived from the CoralUI stylesheet) to sufficiently simulate.
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '' +
      '.coral-Popover,' +
      '.coral-Popover-arrow {' +
      '  position: absolute;' +
      '  display: none;' +
      '  z-index: 1010;' +
      '  top: -9999px;' +
      '  left: -9999px;' +
      '}' +
      '.coral-Popover {' +
      '  background-color: #f5f5f5;' +
      '  -webkit-background-clip: padding-box;' +
      '  -moz-background-clip: padding-box;' +
      '  background-clip: padding-box;' +
      '  border: ' + popoverBorderThickness + 'px solid rgba(90, 90, 90, 0.8);' +
      '  margin: 10px;' +
      '}' +
      '.coral-Popover-arrow {' +
      '  pointer-events: none;' +
      '  height: 0;' +
      '  width: 0;' +
      '  display: block;' +      
      '}' +
      '.coral-Popover-arrow--up {' +
      '  border-left: ' + tailDimensions.topBottom.width / 2 + 'px solid transparent;' +
      '  border-right: ' + tailDimensions.topBottom.width / 2 + 'px solid transparent;' +
      '  border-bottom: ' + tailDimensions.topBottom.height + 'px solid rgba(90, 90, 90, 0.8);' +
      '}' +
      '.coral-Popover-arrow--right {' +
      '  border-top: ' + tailDimensions.leftRight.height / 2 + 'px solid transparent;' +
      '  border-bottom: ' + tailDimensions.leftRight.height / 2 + 'px solid transparent;' +
      '  border-left: ' + tailDimensions.leftRight.width + 'px solid rgba(90, 90, 90, 0.8);' +
      '}' +
      '.ccoral-Popover-arrow--down {' +
      '  border-left: ' + tailDimensions.topBottom.width / 2 + 'px solid transparent;' +
      '  border-right: ' + tailDimensions.topBottom.width / 2 + 'px solid transparent;' +
      '  border-top: ' + tailDimensions.topBottom.height + 'px solid rgba(90, 90, 90, 0.8);' +
      '}' +
      '.coral-Popover-arrow--left {' +
      '  border-top: ' + tailDimensions.leftRight.height / 2 + 'px solid transparent;' +
      '  border-bottom: ' + tailDimensions.leftRight.height / 2 + 'px solid transparent;' +
      '  border-right: ' + tailDimensions.leftRight.width + 'px solid rgba(90, 90, 90, 0.8);' +
      '}';

  var removeElements = function() {
    $('.target,.coral-Popover,.coral-Popover-arrow').remove();
  };

  before(function() {
    $('head').append(style);
  });

  after(function() {
    $(style).remove();
    removeElements();
  });

  beforeEach(function(done) {
    // Necessary for positional tests to function consistently because the position of a popover changes
    // depending on where the target (e.g., a button the popover is point to) is in relation to the view pane.
    // This must run before each test because after each test mocha scrolls to the bottom of the document.
    window.scrollTo(0, 0);
    // Safari's scrollTo() works asynchronously so we have to wait until the next frame to proceed.
    setTimeout(done, 0);
  });

  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Popover');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('popover');
    });
  });

  describe('popover from plugin', function() {
    it('should have correct CSS classnames', function() {
      var el = $('<div/>').popover({
        pointAt: [100, 100]
      });
      expect(el).to.have.class('coral-Popover');
    });
  });

  describe('content option', function() {
    it('can set content through constructor', function() {
      var content = '<span>My content</span>';

      var el = $('<div/>').popover({
        pointAt: [100, 100],
        content: content
      });

      // el.html() and content don't match exactly because the popover adds the tail as a child.
      expect(el.html()).to.have.string(content);
    });

    it('can set content through setter', function() {
      var content = '<span>My content</span>';

      var el = $('<div/>').popover({
        pointAt: [100, 100]
      });

      el.popover('set', 'content', content);

      // el.html() and content don't match exactly because the popover adds the tail as a child.
      expect(el.html()).to.have.string(content);
    });
  });

  describe('visibility', function() {
    var popover;

    beforeEach(function() {
      popover = new CUI.Popover({
        element: $('<div/>'),
        pointAt: [0, 0]
      });
    });

    it('shows popover elements', function() {
      popover.hide();
      popover.show();
      expect(popover.$element.css('display')).to.equal('block');
    });

    it('hides popover elements', function() {
      popover.show();
      popover.hide();
      expect(popover.$element.css('display')).to.equal('none');
    });
  });

  describe('basic positioning', function() {
    var popoverWidth = 10,
        popoverHeight = 10,
        popover,
        popoverEl,
        tailEl;

    var testAllSides = function(targetRect) {
      it('positions popover below', function() {
        popover.set('pointFrom', 'bottom');

        expect(popoverEl.offset()).to.eql({
          top: targetRect.top + targetRect.height + tailDimensions.topBottom.height,
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2 - popoverBorderThickness
        });

        expect(popover._$tail.offset()).to.eql({
          top: targetRect.top + targetRect.height,
          left: targetRect.left + targetRect.width / 2 - tailDimensions.topBottom.width / 2
        });
      });

      it('positions popover above', function() {
        popover.set('pointFrom', 'top');

        expect(popoverEl.offset()).to.eql({
          top: targetRect.top - tailDimensions.topBottom.height - popoverHeight - popoverBorderThickness * 2,
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2 - popoverBorderThickness
        });

        expect(popover._$tail.offset()).to.eql({
          top: targetRect.top - tailDimensions.topBottom.height,
          left: targetRect.left + targetRect.width / 2 - tailDimensions.topBottom.width / 2
        });
      });

      it('positions popover to the left', function() {
        popover.set('pointFrom', 'left');

        expect(popoverEl.offset()).to.eql({
          top: targetRect.top + targetRect.height / 2 - popoverHeight / 2 - popoverBorderThickness,
          left: targetRect.left - tailDimensions.leftRight.width - popoverWidth - popoverBorderThickness * 2
        });

        expect(popover._$tail.offset()).to.eql({
          top: targetRect.top + targetRect.height / 2 - tailDimensions.leftRight.height / 2,
          left: targetRect.left - tailDimensions.leftRight.width
        });
      });

      it('positions popover to the right', function() {
        popover.set('pointFrom', 'right');

        expect(popoverEl.offset()).to.eql({
          top: targetRect.top + targetRect.height / 2 - popoverHeight / 2 - popoverBorderThickness,
          left: targetRect.left + targetRect.width + tailDimensions.leftRight.width
        });

        expect(popover._$tail.offset()).to.eql({
          top: targetRect.top + targetRect.height / 2 - tailDimensions.leftRight.height / 2,
          left: targetRect.left + targetRect.width
        });
      });
    };

    before(function() {
      popoverEl = $('<div/>');
      popoverEl.css({
        width: popoverWidth + 'px',
        height: popoverHeight + 'px'
      });
      $('body').append(popoverEl);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: [0, 0]
      });

      popover.show();

      tailEl = popover._$tail;
    });

    after(function() {
      removeElements();
    });

    describe('around target element', function() {
      var targetTop = 50,
          targetLeft = 50,
          targetWidth = 20,
          targetHeight = 20;

      before(function() {
        var targetEl = $('<div class="target"/>');
        targetEl.css({
          position: 'absolute',
          top: targetTop + 'px',
          left: targetLeft + 'px',
          width: targetWidth + 'px',
          height: targetHeight + 'px'
        });

        $('body').append(targetEl);
        popover.set('pointAt', targetEl);
      });

      testAllSides({
        top: targetTop,
        left: targetLeft,
        width: targetWidth,
        height: targetHeight
      });
    });

    describe('around coordinate', function() {
      var targetX = 100,
          targetY = 100;

      before(function() {
        popover.set('pointAt', [targetX, targetY]);
      });

      testAllSides({
        top: targetY,
        left: targetX,
        width: 0,
        height: 0
      })
    });
  });

  describe('edge flipping', function() {
    var popoverWidth = 10,
        popoverHeight = 10,
        popover,
        popoverEl,
        tailEl;

    before(function() {
      popoverEl = $('<div/>');
      popoverEl.css({
        width: popoverWidth + 'px',
        height: popoverHeight + 'px'
      });
      $('body').append(popoverEl);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: [0, 0]
      });

      popover.show();

      tailEl = popover._$tail;
    });

    after(function() {
      removeElements();
    });

    it('flips popover horizontally when conflicting with the viewport left edge', function() {
      popover.set({
        pointAt: [1, 50],
        pointFrom: 'left'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().left).to.equal(1 + tailDimensions.leftRight.width);
    });

    it('flips popover horizontally when conflicting with the viewport right edge', function() {
      var viewportWidth = $(window).width();
      popover.set({
        pointAt: [viewportWidth - 1, 50],
        pointFrom: 'right'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().left).to.be.below(viewportWidth);
    });

    it('flips popover vertically when conflicting with the viewport top edge', function() {
      popover.set({
        pointAt: [50, 1],
        pointFrom: 'bottom'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().top).to.be.above(0);
    });

    it('flips popover vertically when conflicting with the viewport bottom edge', function() {
      var viewportHeight = $(window).height();
      popover.set({
        pointAt: [50, viewportHeight - 1],
        pointFrom: 'bottom'
      });

      // Because a gap is provided for the tail to be placed between, the popover would normally be positioned
      // outside the viewport if not flipped.
      expect(popoverEl.offset().top).to.be.below(viewportHeight);
    });

    it('does not position the popover to be cropped by the top of the document (CUI-794)' , function() {
      // The popover will generally flip to whichever side of the target will show a larger portion of
      // the popover. However, we never want to position the popover in such a way that it's cropped by the
      // top or left of the document since the user, in this case, wouldn't even be able to scroll to see
      // the rest of the popover.
      var viewportHeight = $(window).height();

      popoverEl.css({
        height: viewportHeight
      });

      popover.set({
        pointAt: [50, viewportHeight * .6],
        pointFrom: 'bottom'
      });

      expect(popoverEl.offset().top).to.be.above(viewportHeight / 2);

      popover.set({
        pointFrom: 'top'
      });

      expect(popoverEl.offset().top).to.be.above(viewportHeight / 2);
    });

    it('does not position the popover to be cropped by the left of the document (CUI-794)' , function() {
      // The popover will generally flip to whichever side of the target will show a larger portion of
      // the popover. However, we never want to position the popover in such a way that it's cropped by the
      // top or left of the document since the user, in this case, wouldn't even be able to scroll to see
      // the rest of the popover.
      var viewportWidth = $(window).width();

      popoverEl.css({
        width: viewportWidth
      });

      popover.set({
        pointAt: [viewportWidth * .6, 50],
        pointFrom: 'left'
      });

      expect(popoverEl.offset().left).to.be.above(viewportWidth / 2);

      popover.set({
        pointFrom: 'right'
      });

      expect(popoverEl.offset().left).to.be.above(viewportWidth / 2);
    });
  });

  describe('alignFrom', function() {
    var popoverEl,
        popover;
    before(function() {
      popoverEl = $('<div/>');
      popoverEl.css({
        width: '10px',
        height: '10px'
      });
      $('body').append(popoverEl);

      popover = new CUI.Popover({
        element: popoverEl,
        pointAt: [100, 100]
      });

      popover.show();
    });

    after(function() {
      removeElements();
    });

    it('supports left and right alignment', function() {
      popover.set('alignFrom', 'left');
      var alignLeftOffset = popoverEl.offset();
      expect(popoverEl.css('left')).to.have.string('px');
      // Doesn't work in Firefox since it reports the calculated value even though it's set to auto.
      //expect(popoverEl.css('right')).to.equal('auto');
      popover.set('alignFrom', 'right');
      var alignRightOffset = popoverEl.offset();
      // Doesn't work in Firefox since it reports the calculated value even though it's set to auto.
      // expect(popoverEl.css('left')).to.equal('auto');
      expect(popoverEl.css('right')).to.have.string('px');
      expect(alignLeftOffset).to.eql(alignRightOffset);
    });
  });
});