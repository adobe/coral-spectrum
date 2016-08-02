describe('Coral.WizardView', function() {
  'use strict';

  function testDefaultInstance(el) {
    expect(el.$).to.have.class('coral-WizardView');
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('WizardView');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var el = new Coral.WizardView();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-wizardview');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-wizardview></coral-wizardview>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });

    it('should select the correct step and panel when instantiated from markup', function(done) {
      helpers.build(window.__html__['Coral.WizardView.selectedItem.html'], function(el) {
        var stepList = el.stepLists.first();
        var panelStack = el.panelStacks.first();
        expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(1);
        expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(1);
        done();
      });
    });

    it('should select the correct step and panel when instantiated from nested markup', function(done) {

      helpers.build(window.__html__['Coral.WizardView.nested.html'], function(el) {

        var outer = document.querySelector('#outer');
        var inner = document.querySelector('#inner');

        expect(outer.stepLists.getAll().length).to.equal(1);
        expect(outer.panelStacks.getAll().length).to.equal(2);
        expect(inner.stepLists.getAll().length).to.equal(1);
        expect(inner.panelStacks.getAll().length).to.equal(1);

        outer.panelStacks.getAll().forEach(function(panelStack) {
          expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(1, 'selected outer panel index');
        });

        outer.stepLists.getAll().forEach(function(stepList) {
          expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(1, 'selected outer steplist index');
        });

        inner.panelStacks.getAll().forEach(function(panelStack) {
          expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(2, 'selected inner panel index');
        });

        inner.stepLists.getAll().forEach(function(stepList) {
          expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(2, 'selected inner steplist index');
        });

        done();
      });
    });
  });

  describe('API', function() {
    var el;
    var panelStacks = [];
    var stepLists = [];

    function createStepList(append, parent) {
      parent = parent || el;

      var stepList = new Coral.StepList();
      stepList.setAttribute('coral-wizardview-steplist', '');

      var step1 = new Coral.Step();
      step1.label.innerHTML = 'Item 1';

      var step2 = new Coral.Step();
      step2.label.innerHTML = 'Item 2';

      var step3 = new Coral.Step();
      step3.label.innerHTML = 'Item 3';

      stepList.appendChild(step1);
      stepList.appendChild(step2);
      stepList.appendChild(step3);

      if (append) {
        parent.appendChild(stepList);
      }
      else {
        parent.stepLists.add(stepList);
      }

      stepLists.push(stepList);

      return stepList;
    }

    function createPanelStack(append, parent) {
      parent = parent || el;

      var panelStack = new Coral.PanelStack();
      panelStack.setAttribute('coral-wizardview-panelstack', '');

      var panel1 = new Coral.Panel();
      panel1.content.innerHTML = 'Content 1';

      var panel2 = new Coral.Panel();
      panel2.content.innerHTML = 'Content 1';

      var panel3 = new Coral.Panel();
      panel3.content.innerHTML = 'Content 1';

      panelStack.appendChild(panel1);
      panelStack.appendChild(panel2);
      panelStack.appendChild(panel3);

      if (append) {
        parent.appendChild(panelStack);
      }
      else {
        parent.panelStacks.add(panelStack);
      }

      panelStacks.push(panelStack);

      return panelStack;
    }

    beforeEach(function() {
      el = new Coral.WizardView();

      createStepList();
      createStepList();

      createPanelStack();
      createPanelStack();

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
      stepLists.length = 0;
      panelStacks.length = 0;
    });

    describe('#panelStacks', function() {
      it('should provide a reference to all panelStacks', function() {
        expect(el.panelStacks.getAll().length).to.equal(2);
      });

      it('should add new panelStacks to the collection', function() {
        createPanelStack();
        expect(el.panelStacks.getAll().length).to.equal(3);
      });

      it('should select the correct panel when a panelStack is added using the collections API', function(done) {
        // Select an item first
        stepLists[0].items.getAll()[1].selected = true;

        // Add a new panelstack with the collections API
        var panelStack = createPanelStack();

        // Wait a frame as attachedCallback is used to detect new panelStacks
        helpers.next(function() {
          // Make sure the right panel is selected
          expect(panelStack.items.getAll()[1].selected).to.equal(true, 'second item should be selected');
          done();
        });
      });

      it('should select the correct panel when a panelStack is added using appendChild', function(done) {
        // Select an item first
        stepLists[0].items.getAll()[1].selected = true;

        // Add a new panelstack with appendChild
        var panelStack = createPanelStack(true);

        // Wait a frame as attachedCallback is used to detect new panelStacks
        helpers.next(function() {
          // Make sure the right panel is selected
          expect(panelStack.items.getAll()[1].selected).to.equal(true, 'second item should be selected');
          done();
        });
      });

      describe('Special cases', function() {
        it('should support nested WizardViews', function() {
          var nestedWizardView = new Coral.WizardView();
          createStepList(false, nestedWizardView);
          createPanelStack(false, nestedWizardView);

          expect(el.stepLists.getAll().length).to.equal(2);
          expect(el.panelStacks.getAll().length).to.equal(2);
        });
      });
    });

    describe('#stepLists', function() {
      it('should provide a reference to all stepLists', function() {
        expect(el.stepLists.getAll().length).to.equal(2);
      });

      it('should add new stepLists to the collection', function() {
        createStepList();
        expect(el.stepLists.getAll().length).to.equal(3);
      });

      it('should select the correct panel when a stepList is added using the collections API', function(done) {
        // Select an item first
        stepLists[0].items.getAll()[1].selected = true;

        // Add a new steplist with the collections API
        var stepList = createStepList();

        // Wait a frame as attachedCallback is used to detect new stepLists
        helpers.next(function() {
          // Make sure the right step is selected
          expect(stepList.items.getAll()[1].selected).to.equal(true, 'second item should be selected');
          done();
        });
      });

      it('should select the correct panel when a stepList is added using appendChild', function(done) {
        // Select an item first
        stepLists[0].items.getAll()[1].selected = true;

        // Add a new steplist with appendChild
        var stepList = createStepList(true);

        // Wait a frame as attachedCallback is used to detect new stepLists
        helpers.next(function() {
          // Make sure the right step is selected
          expect(stepList.items.getAll()[1].selected).to.equal(true, 'second item should be selected');
          done();
        });
      });
    });

    describe('#previous()', function() {});
    describe('#next()', function() {});
  });

  describe('Events', function() {

    describe('coral-wizardview:change', function() {

      it('should trigger a coral-wizardview:change event when an item is selected', function(done) {
        var spy = sinon.spy();

        var el = new Coral.WizardView();

        var panelStack = new Coral.PanelStack();
        panelStack.setAttribute('coral-wizardview-panelstack', '');
        var stepList = new Coral.StepList();
        stepList.setAttribute('coral-wizardview-steplist', '');

        var step1 = new Coral.Step();
        var step2 = new Coral.Step();

        var panel1 = new Coral.Panel();
        var panel2 = new Coral.Panel();

        stepList.appendChild(step1);
        stepList.appendChild(step2);
        panelStack.appendChild(panel1);
        panelStack.appendChild(panel2);

        el.appendChild(stepList);
        el.appendChild(panelStack);

        expect(stepList.items.getAll().length).to.equal(2);
        expect(panelStack.items.getAll().length).to.equal(2);

        helpers.target.appendChild(el);

        el.on('coral-wizardview:change', spy);

        // We must wait as Firefox does not select the first panel until the next frame
        // This bug is documented as CUI-4787
        helpers.next(function() {
          spy.reset();
          step2.selected = true;

          // Make sure the step actually got selected
          expect(stepList.selectedItem).to.equal(step2);
          expect(panelStack.selectedItem).to.equal(panel2);

          expect(spy.callCount).to.equal(1, 'spy should be called when step2 is selected');

          expect(spy.getCall(0).args[0].detail.oldSelection).to.equal(step1, 'event.detail.oldSelection should be Step 1');
          expect(spy.getCall(0).args[0].detail.selection).to.equal(step2, 'event.detail.selection should be Step 2');

          spy.reset();
          step1.selected = true;

          // Make sure the step actually got selected
          expect(stepList.selectedItem).to.equal(step1);
          expect(panelStack.selectedItem).to.equal(panel1);

          expect(spy.getCall(0).args[0].detail.oldSelection).to.equal(step2, 'event.detail.selection should be Step 2');
          expect(spy.getCall(0).args[0].detail.selection).to.equal(step1, 'event.detail.oldSelection should be Step 1');

          done();
        });

      });

      it('should trigger an event when next() is called', function(done) {

        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.WizardView.base.html'], function(el) {
          el.on('coral-wizardview:change', changeSpy);

          var stepList = el.stepLists.first();
          var step1 = el.stepLists.first().items.getAll()[0];
          var step2 = el.stepLists.first().items.getAll()[1];

          expect(stepList.selectedItem).to.equal(step1, 'Step 1 should be selected initially');

          el.next();

          expect(changeSpy.callCount).to.equal(1);

          expect(changeSpy.getCall(0).args[0].target.stepLists.first().selectedItem).to.equal(step2, 'Step 2 should be selected after next() is called');

          expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.equal(step1, 'event.detail.oldSelection should be Step 1');
          expect(changeSpy.getCall(0).args[0].detail.selection).to.equal(step2, 'event.detail.selection should be Step 2');

          done();
        });
      });

      it('should trigger an event when previous() is called', function(done) {

        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.WizardView.selectedItem.html'], function(el) {
          el.on('coral-wizardview:change', changeSpy);

          var stepList = el.stepLists.first();
          var step1 = el.stepLists.first().items.getAll()[0];
          var step2 = el.stepLists.first().items.getAll()[1];

          expect(stepList.selectedItem).to.equal(step2, 'Step 2 should be selected initially');

          el.previous();

          expect(changeSpy.callCount).to.equal(1);

          expect(changeSpy.getCall(0).args[0].target.stepLists.first().selectedItem).to.equal(step1, 'Step 1 should be selected after next() is called');

          expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.equal(step2, 'event.detail.oldSelection should be Step 2');
          expect(changeSpy.getCall(0).args[0].detail.selection).to.equal(step1, 'event.detail.selection should be Step 1');

          done();
        });
      });

      it('should not trigger an event when next() is called and it is alaredy the last item', function(done) {

        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.WizardView.base.html'], function(el) {
          el.on('coral-wizardview:change', changeSpy);

          // selects the 2nd item
          el.next();

          // selects the 3rd item
          el.next();

          // nothing happens
          el.next();

          expect(changeSpy.callCount).to.equal(2);

          done();
        });
      });

      it('should not trigger an event when previous() is called and it is already in the first item', function(done) {

        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.WizardView.base.html'], function(el) {
          el.on('coral-wizardview:change', changeSpy);

          el.previous();

          expect(changeSpy.callCount).to.equal(0);

          done();
        });
      });

      it('should have all panels up to date once the event is triggered', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.WizardView.full.html'], function(el) {
          el.on('coral-wizardview:change', changeSpy);

          el.next();

          expect(changeSpy.callCount).to.equal(1);

          var items = el.stepLists.first().items.getAll();

          var step1 = items[1];
          var step2 = items[2];

          expect(changeSpy.getCall(0).args[0].target.stepLists.first().selectedItem).to.equal(step2);

          expect(changeSpy.getCall(0).calledWithMatch({
            detail: {
              oldSelection: step1,
              selection: step2
            }
          })).to.be.true;

          var contentStack = el.panelStacks.getAll()[0];
          var controlStack = el.panelStacks.getAll()[1];

          // gets the index of the selected step to match it with the other panels
          var stepIndex = el.stepLists.first().items.getAll().indexOf(el.stepLists.first().selectedItem);
          // the index of the selected content panel should match the steplist
          expect(contentStack.selectedItem).to.equal(contentStack.items.getAll()[stepIndex]);
          // the index of the selected controls panel should match the steplist
          expect(controlStack.selectedItem).to.equal(controlStack.items.getAll()[stepIndex]);

          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    it('should show go to the next step when a button is clicked', function(done) {
      var changeSpy = sinon.spy();

      helpers.build(window.__html__['Coral.WizardView.full.html'], function(el) {
        el.on('coral-wizardview:change', changeSpy);

        // finds and clicks the next button
        el.$.find('[coral-wizardview-next]')[0].click();

        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should show go to the previous step when a button is clicked', function(done) {
      var changeSpy = sinon.spy();

      helpers.build(window.__html__['Coral.WizardView.full.html'], function(el) {
        el.on('coral-wizardview:change', changeSpy);

        // finds and clicks the next button
        el.$.find('[coral-wizardview-previous]')[0].click();

        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should control the right content when nested', function(done) {

      helpers.build(window.__html__['Coral.WizardView.nested.html'], function(el) {
        var outer = document.querySelector('#outer');
        var inner = document.querySelector('#inner');

        outer.panelStacks.getAll().forEach(function(panelStack) {
          expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(1, 'selected outer panel index');
        });

        outer.stepLists.getAll().forEach(function(stepList) {
          expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(1, 'selected outer steplist index');
        });

        inner.panelStacks.getAll().forEach(function(panelStack) {
          expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(2, 'selected inner panel index');
        });

        inner.stepLists.getAll().forEach(function(stepList) {
          expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(2, 'selected inner steplist index');
        });

        // finds and clicks the next button
        el.$.find('[coral-wizardview-next]')[0].click();

        helpers.next(function() {
          outer.panelStacks.getAll().forEach(function(panelStack) {
            expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(2, 'selected outer panel index');
          });

          outer.stepLists.getAll().forEach(function(stepList) {
            expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(2, 'selected outer steplist index');
          });

          inner.panelStacks.getAll().forEach(function(panelStack) {
            expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(2, 'selected inner panel index');
          });

          inner.stepLists.getAll().forEach(function(stepList) {
            expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(2, 'selected inner steplist index');
          });
          done();
        });
      });
    });
  });
});
