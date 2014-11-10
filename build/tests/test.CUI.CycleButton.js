describe('CUI.CycleButton', function() {
  /**
   * HTML Fixture setup
   *
   * Creating container div which is as big as the current page. Removing it
   * after each test.
   */
  beforeEach(function () {
    $("<div>", {id: "fixtures"}).
      css({position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}).
      appendTo(document.body);
  });
  afterEach(function () {
    $("#fixtures").remove();
  });



  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('CycleButton');
  });

  it('should be defined on jQuery object', function() {
    expect($('<div>')).to.have.property('cycleButton');
  });

  var HTML =
    "<span class=\"coral-CycleButton\">" +
    "  <button type=\"button\" class=\"coral-CycleButton-button is-active\">A</button>" +
    "  <button type=\"button\" class=\"coral-CycleButton-button\">B</button>" +
    "  <button type=\"button\" class=\"coral-CycleButton-button\">C</button>" +
    "</span>";

  var buildElement = function (html) {
    var element = $(html || HTML);

    element.cycleButton().appendTo("#fixtures");

    return element;
  };

  var trigger = function (element, event) {
    element.find(".is-active").trigger(event || "click");
  };

  describe("Initializers", function () {
    var expectElementIsCycleButton = function (element) {
      // Test whether cycle button was initialized properly

      // Verify state before test
      expect(element.find(".is-active").text()).to.equal("A");

      trigger(element);

      // Verify state after test
      expect(element.find(".is-active").text()).to.equal("B");
    };

    it("should be properly initialized using $().cycleButton()", function () {
      var element = $(HTML);

      element.cycleButton();

      expectElementIsCycleButton(element);
    });

    it("should be properly initialized using JS Class API", function () {
      var element = $(HTML);

      var cycleButton = new CUI.CycleButton({element: element});

      expectElementIsCycleButton(element);
    });

    it("should be properly initialized using data-init on cui-contentloaded", function () {
      var element = $(HTML);

      element.attr("data-init", "cyclebutton");
      element.appendTo("#fixtures");
      $(document.body).trigger("cui-contentloaded");

      expectElementIsCycleButton(element);
    });
  });

  describe("Interaction", function () {
    it("should not manipulate .is-active on initialization", function () {
      var element = buildElement();

      element.find(".coral-CycleButton-button").removeClass("is-active").
              last().addClass("is-active");

      // Verify state before test
      expect(element.find(".is-active").text()).to.equal("C");

      element.cycleButton();

      // Verify state after test
      expect(element.find(".is-active").text()).to.equal("C");
    });

    it("should switch to next element on click", function () {
      var element = buildElement();

      // Verify state before test
      expect(element.find(".is-active").text()).to.equal("A");
      trigger(element);

      // Verify state after test
      expect(element.find(".is-active").text()).to.equal("B");
    });

    // When executed more than once within the same page, e.g. in context of
    // `grunt dev`, this test fails reliably. Unfortunately, I cannot tell why.
    it.skip("should focus newly visible element", function (done) {
      var element = buildElement();
      element.appendTo("#fixtures");

      // Use focusin event instead of is(":focus") since the latter does not
      // work reliable across UAs - desktop vs. phantomjs - and seems to be
      // applied asynchronously anyway - so it would need a setTimeout or event
      // handler anyway.
      element.on("focusin", ".coral-CycleButton-button", function () {
        expect($(this).html()).to.equal("B");
        done();
      });

      trigger(element);
    });

    it("should cycle back to first element when reaching end of list", function () {
      var element = buildElement();

      trigger(element); // A -> B
      trigger(element); // B -> C

      // Verify state before test
      expect(element.find(".is-active").text()).to.equal("C");

      trigger(element);

      // Verify state after test
      expect(element.find(".is-active").text()).to.equal("A");
    });

    it("should allow adding of buttons at run time", function () {
      var element = buildElement();

      var b = element.find(".coral-CycleButton-button").eq(1);
      b.after(b.clone().html("X"));

      // Maybe we should trigger cui-contentloaded, but technically, it is
      // currently not neccessary.

      trigger(element); // A -> B

      // Verify state before test
      expect(element.find(".is-active").text()).to.equal("B");

      trigger(element); // B -> X

      // Verify state after test
      expect(element.find(".is-active").text()).to.equal("X");

      trigger(element); // X -> C

      // Verify state after test
      expect(element.find(".is-active").text()).to.equal("C");
    });
  });

  describe("Event handling", function () {
    describe("Delegated event handlers for buttons on container", function () {
      it("should abort the click event on current button and trigger it on the next", function (done) {
        var element = buildElement();

        var current = element.find(".coral-CycleButton-button").get(0),
            next    = element.find(".coral-CycleButton-button").get(1);

        element.on("click", ".coral-CycleButton-button", function (e) {
          if (this === current) {
            expect("Should not trigger click on current button, but does").to.not.be.ok;
            done(); // test may be aborted. It didn't work anyway
          }

          if (this === next) {
            expect("Should trigger click on next button").to.be.ok;
            done(); // test may be aborted. The other handler would be executed before this one, right?
          }
        });

        trigger(element);
      });
    });

    describe("Delegated event handlers for buttons on surrounding node", function () {
      it("should abort the click event for the current button and trigger it for the next", function (done) {
        var element = buildElement();

        var current = element.find(".coral-CycleButton-button").get(0),
            next    = element.find(".coral-CycleButton-button").get(1);

        $("#fixtures").on("click", ".coral-CycleButton-button", function (e) {
          if (this === current) {
            expect("Should not trigger click on current button, but does").to.not.be.ok;
            done(); // test may be aborted. It didn't work anyway
          }

          if (this === next) {
            expect("Should trigger click on next button").to.be.ok;
            done(); // test may be aborted. The other handler would be executed before this one, right?
          }
        });

        trigger(element);
      });
    });

    describe("Simple event handlers on container", function () {
      it("should abort the click event for the current button and trigger it for the next", function (done) {
        var element = buildElement();

        var current = element.find(".coral-CycleButton-button").get(0),
            next    = element.find(".coral-CycleButton-button").get(1);

        element.on("click", function (e) {
          if (e.target === current) {
            expect("Should not trigger click on current button, but does").to.not.be.ok;
            done(); // test may be aborted. It didn't work anyway
          }

          if (e.target === next) {
            expect("Should trigger click on next button").to.be.ok;
            done(); // test may be aborted. The other handler would be executed before this one, right?
          }
        });

        trigger(element);
      });
    });
  });

  describe("Single element buttons", function () {
    var buildSingleButtonElement = function () {
      return buildElement(
          "<span class=\"coral-CycleButton\">" +
          "  <button type=\"button\" class=\"coral-CycleButton-button is-active\">A</button>" +
          "</span>"
        );
    };

    it("should keep the single element active on click", function () {
      var element = buildSingleButtonElement();

      expect(element.find(".is-active").text()).to.equal("A");

      trigger(element);

      expect(element.find(".is-active").text()).to.equal("A");
    });

    it("should propagate the click event", function (done) {
      var element = buildSingleButtonElement();

      element.on("click", ".coral-CycleButton-button", function (e) {
        expect("Should trigger click on single button").to.be.ok;
        done();
      });

      trigger(element);
    });
  });
});
