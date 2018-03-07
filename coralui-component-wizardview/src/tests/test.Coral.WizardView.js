describe('Coral.WizardView', function() {
  function testDefaultInstance(el) {
    expect(el.classList.contains('_coral-WizardView')).to.be.true;
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('WizardView');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var el = helpers.build(new Coral.WizardView());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-wizardview'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function() {
      const el = helpers.build('<coral-wizardview></coral-wizardview>');
      testDefaultInstance(el);
    });

    it('should select the correct step and panel when instantiated from markup', function() {
      const el = helpers.build(window.__html__['Coral.WizardView.selectedItem.html']);
      var stepList = el.stepLists.first();
      var panelStack = el.panelStacks.first();
      expect(stepList.items.getAll().indexOf(stepList.selectedItem)).to.equal(1);
      expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(1);
    });

    it('should select the correct step and panel when instantiated from nested markup', function() {
      const el = helpers.build(window.__html__['Coral.WizardView.nested.html']);

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
    });
  
    it('should be possible via clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.WizardView.nested.html']);
    });
  
    it('should be possible via clone using js', function() {
      helpers.cloneComponent(new Coral.WizardView());
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
        
        // Wait for MO
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
        
        // Wait for MO
        helpers.next(function() {
          // Make sure the right panel is selected
          expect(panelStack.items.getAll()[1].selected).to.equal(true, 'second item should be selected');
          done();
        });
      });
      
      it('should support nested WizardViews', function() {
        var nestedWizardView = new Coral.WizardView();
        createStepList(false, nestedWizardView);
        createPanelStack(false, nestedWizardView);

        expect(el.stepLists.getAll().length).to.equal(2);
        expect(el.panelStacks.getAll().length).to.equal(2);
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

        // Wait for MO
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

        // Wait for MO
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

      it('should trigger a coral-wizardview:change event when an item is selected', function() {
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
      });

      it('should trigger an event when next() is called', function() {

        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.base.html']);
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
      });

      it('should not trigger an event when next() is called and there are no steplists', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.empty.html']);
        el.on('coral-wizardview:change', changeSpy);

        el.next();

        expect(changeSpy.callCount).to.equal(0, 'event should not be triggered');
      });

      it('should trigger an event when previous() is called', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.selectedItem.html']);
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
      });

      it('should not trigger an event when previous() is called and there are no steplists', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.empty.html']);
        el.on('coral-wizardview:change', changeSpy);

        el.previous();

        expect(changeSpy.callCount).to.equal(0, 'event should not be triggered');
      });

      it('should not trigger an event when next() is called and it is already the last item', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.base.html']);
        el.on('coral-wizardview:change', changeSpy);

        // selects the 2nd item
        el.next();

        // selects the 3rd item
        el.next();

        // nothing happens
        el.next();

        expect(changeSpy.callCount).to.equal(2);
      });

      it('should not trigger an event when previous() is called and it is already in the first item', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.base.html']);
        el.on('coral-wizardview:change', changeSpy);

        el.previous();

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should have all panels up to date once the event is triggered', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Coral.WizardView.full.html']);
        el.on('coral-wizardview:change', changeSpy);

        el.next();
        
        var items = el.stepLists.first().items.getAll();

        var step1 = items[1];
        var step2 = items[2];
  
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(step2);
        expect(changeSpy.args[0][0].detail.oldSelection).to.equal(step1);
        
        expect(changeSpy.getCall(0).args[0].target.stepLists.first().selectedItem).to.equal(step2);
        
        var contentStack = el.panelStacks.getAll()[0];
        var controlStack = el.panelStacks.getAll()[1];

        // gets the index of the selected step to match it with the other panels
        var stepIndex = el.stepLists.first().items.getAll().indexOf(el.stepLists.first().selectedItem);
        // the index of the selected content panel should match the steplist
        expect(contentStack.selectedItem).to.equal(contentStack.items.getAll()[stepIndex]);
        // the index of the selected controls panel should match the steplist
        expect(controlStack.selectedItem).to.equal(controlStack.items.getAll()[stepIndex]);
      });
    });
  });

  describe('User Interaction', function() {
    it('should show go to the next step when a button is clicked', function() {
      var changeSpy = sinon.spy();

      const el = helpers.build(window.__html__['Coral.WizardView.full.html']);
      el.on('coral-wizardview:change', changeSpy);

      // finds and clicks the next button
      el.querySelector('[coral-wizardview-next]').click();

      expect(changeSpy.callCount).to.equal(1);
    });

    it('should show go to the previous step when a button is clicked', function() {
      var changeSpy = sinon.spy();

      const el = helpers.build(window.__html__['Coral.WizardView.full.html']);
      el.on('coral-wizardview:change', changeSpy);

      // finds and clicks the next button
      el.querySelector('[coral-wizardview-previous]').click();

      expect(changeSpy.callCount).to.equal(1);
    });

    it('should control the right content when nested', function() {
      const el = helpers.build(window.__html__['Coral.WizardView.nested.html']);
      
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
      el.querySelector('[coral-wizardview-next]').click();
    
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
    });
  });

  describe('Implementation Details', function() {
    it('should deselect the panel if there if there is no matching step', function() {
      const el = helpers.build(window.__html__['Coral.WizardView.irregular.html']);
      var stepList = el.stepLists.first();
      var steps = stepList.items.getAll();

      var selectedIndex = steps.indexOf(stepList.selectedItem);

      // we check that all panels have the correct item assigned
      el.panelStacks.getAll().forEach(function(panelStack, index) {
        expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(selectedIndex);
      });

      // we select the last item to force an update on the panels
      selectedIndex = steps.length - 1;
      steps[selectedIndex].setAttribute('selected', '');

      el.panelStacks.getAll().forEach(function(panelStack, index) {
        if (selectedIndex < panelStack.items.length) {
          expect(panelStack.items.getAll().indexOf(panelStack.selectedItem)).to.equal(selectedIndex);
        }
        else {
          // if the panelstack has less panels than steps it should have nothing selected
          expect(panelStack.selectedItem).to.equal(null, 'No panel should be selected');
        }
      });
    });
  });
});
