/*
 ADOBE CONFIDENTIAL

 Copyright 2014 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */

describe('CUI.FlexWizard', function() {

  var $wizardMultistep, $wizardMultistepSteplistitems, $wizardMultistepSteps,
      wizardMultistep;

  var WIZARD_MULTISTEP = '' +
    '<form action="test" method="post" class="coral-Wizard" data-init="flexwizard">' +
      '<nav class="js-coral-Wizard-nav coral-Wizard-nav coral--dark">' +
        '<ol class="coral-Wizard-steplist">' +
          '<li class="js-coral-Wizard-steplist-item coral-Wizard-steplist-item">Step 1</li>' +
          '<li class="js-coral-Wizard-steplist-item coral-Wizard-steplist-item">Step 2</li>' +
          '<li class="js-coral-Wizard-steplist-item coral-Wizard-steplist-item">Step 3</li>' +
        '</ol>' +
      '</nav>' +
      '<div class="js-coral-Wizard-step coral-Wizard-step"><p>Step 1 Content.</p></div>' +
      '<div class="js-coral-Wizard-step coral-Wizard-step"><p>Step 2 Content.</p></div>' +
      '<div class="js-coral-Wizard-step coral-Wizard-step"><p>Step 3 Content.</p></div>' +
    '</form>';

  var TEST_ATTRIBUTES = {
    "classes" : {
      "components" : {
        "step" : "coral-Wizard-step"
      },
      "js" : {
        "step"         : "js-coral-Wizard-step",
        "steplistitem" : "js-coral-Wizard-steplist-item"
      },
      "states" : {
        "active"  : "is-active",
        "stepped" : "is-stepped"
      },
      "utils" : {
        "hidden" : "u-coral-hidden"
      }
    }
  };

  var TEST_EVENTS = {
    "stepchange" : "flexwizard-stepchange"
  };

  beforeEach(function() {
    $wizardMultistep = $(WIZARD_MULTISTEP).flexWizard().appendTo(document.body);
    $wizardMultistepSteplistitems = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.js.steplistitem);
    $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
    wizardMultistep = $wizardMultistep.data('flexWizard');
  });

  afterEach(function() {
    $wizardMultistep.remove();
    $wizardMultistep = $wizardMultistepSteplistitems = wizardMultistep = null;
  });

  it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('FlexWizard');
  });

  it('should be defined on jQuery object', function() {
      var form = $('form');
      expect(form).to.have.property('flexWizard');
  });

  describe('api', function() {

    it('initial step should be active', function() {
      expect($wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.js.steplistitem + ':first')).to.have.class(TEST_ATTRIBUTES.classes.states.active);
    });

    describe('nextStep()', function() {

      it('should mark the correct steplist item as active', function() {
        for (var s = 0; s < $wizardMultistepSteps.length-1; s++) {
          wizardMultistep.nextStep();
          expect($wizardMultistepSteplistitems.eq(s + 1)).to.have.class(TEST_ATTRIBUTES.classes.states.active);
        }
      });

      it('should not display inactive steps', function() {
        for (var s = 0; s < $wizardMultistepSteps.length-1; s++) {
          wizardMultistep.nextStep();
          expect($wizardMultistepSteps.eq(s + 1)).not.to.have.class(TEST_ATTRIBUTES.classes.utils.hidden);
          expect($wizardMultistepSteps.not($wizardMultistepSteps.eq(s + 1))).to.have.class(TEST_ATTRIBUTES.classes.utils.hidden);
        }
      });

      it('should mark the previous steplist item as stepped', function() {
        for (var s = 0; s < $wizardMultistepSteps.length-1; s++) {
          wizardMultistep.nextStep();
          expect($wizardMultistepSteplistitems.eq(s)).to.have.class(TEST_ATTRIBUTES.classes.states.stepped);
        }
      });

      it('should continue to display same step when called on last step', function() {
        for (var s = 0; s < $wizardMultistepSteps.length; s++) {
          wizardMultistep.nextStep();
        }
        expect($wizardMultistepSteplistitems.eq($wizardMultistepSteps.length-1)).to.have.class(TEST_ATTRIBUTES.classes.states.active);
      });
    });

    describe('prevStep()', function() {

      beforeEach(function() {
        for (var s = 0; s < $wizardMultistepSteps.length-1; s++) {
          wizardMultistep.nextStep();
        }
      });

      it('should mark the correct steplist item as active', function() {
        for (var s = $wizardMultistepSteps.length-1; s > 0; s--) {
          wizardMultistep.prevStep();
          expect($wizardMultistepSteplistitems.eq(s - 1)).to.have.class(TEST_ATTRIBUTES.classes.states.active);
        }
      });

      it('should not display inactive steps', function() {
        for (var s = $wizardMultistepSteps.length-1; s > 0; s--) {
          wizardMultistep.prevStep();
          expect($wizardMultistepSteps.eq(s - 1)).not.to.have.class(TEST_ATTRIBUTES.classes.utils.hidden);
          expect($wizardMultistepSteps.not($wizardMultistepSteps.eq(s - 1))).to.have.class(TEST_ATTRIBUTES.classes.utils.hidden);
        }
      });

      it('should mark the previous steplist item as stepped', function() {
        for (var s = $wizardMultistepSteps.length-1; s > 1; s--) {
          wizardMultistep.prevStep();
          expect($wizardMultistepSteplistitems.eq(s - 2)).to.have.class(TEST_ATTRIBUTES.classes.states.stepped);
        }
      });

      it('should continue to display same step when called on first step', function() {
        for (var s = 0; s < $wizardMultistepSteps.length; s++) {
          wizardMultistep.prevStep();
        }
        expect($wizardMultistepSteplistitems.eq(0)).to.have.class(TEST_ATTRIBUTES.classes.states.active);
      });
    });

    describe('add(step, index)', function(){
      var newStepHtml, oldStepCount;

      beforeEach(function() {
        newStepHtml = "<div class='"+ TEST_ATTRIBUTES.classes.components.step + "'>new step</div>";
        oldStepCount = $wizardMultistepSteps.length;
      });

      it('should add an additional step using add(HTMLElement)', function() {
        var wrap = document.createElement('div');

        wrap.innerHTML = newStepHtml;
        wizardMultistep.add(wrap.firstChild);
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.length).to.equal(oldStepCount + 1);
      });

      it('should add an additional step using add(jQuery)', function() {
        wizardMultistep.add($(newStepHtml));
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.length).to.equal(oldStepCount + 1);
      });

      it('should add an additional step using add(String)', function() {
        wizardMultistep.add(newStepHtml);
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.length).to.equal(oldStepCount + 1);
      });

      it('should add the additional step as the last step if no index supplied', function() {
        var $newStep = $(newStepHtml);
        wizardMultistep.add($newStep);
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.last().is($newStep)).to.be.true;
      });

      it('should add the additional step after the supplied index', function() {
        var index = 0, $newStep = $(newStepHtml);
        wizardMultistep.add($newStep, index);
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.eq(index + 1).is($newStep)).to.be.true;
      });

      it('should add the additional step list item and not mark it as active or stepped', function () {
        var index = 0; var $newStep = $(newStepHtml);
        wizardMultistep.add($newStep, index);
        $wizardMultistepSteplistitems = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.js.steplistitem);
        expect($wizardMultistepSteplistitems.eq(index + 1)).not.to.have.class(TEST_ATTRIBUTES.classes.states.active);
        expect($wizardMultistepSteplistitems.eq(index + 1)).not.to.have.class(TEST_ATTRIBUTES.classes.states.stepped);
      });
    });

    describe('addAfter(step, refStep)', function() {
      var newStepHtml, oldStepCount;

      beforeEach(function() {
        newStepHtml = "<div class='"+ TEST_ATTRIBUTES.classes.components.step + "'>New step content.</div>";
        oldStepCount = $wizardMultistepSteps.length;
      });

      it('should add an additional step', function() {
        wizardMultistep.addAfter($(newStepHtml), $wizardMultistepSteps.first());
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.length).to.equal(oldStepCount + 1);
      });

      it('should add the additional step after the refStep', function() {
        var $newStep = $(newStepHtml);
        wizardMultistep.addAfter($newStep, $wizardMultistepSteps.first());
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.eq(1).is($newStep)).to.be.true;
      });
    });

    describe('remove(step)', function() {
      var $stepToRemove, oldStepCount;

      beforeEach(function() {
        $stepToRemove = $wizardMultistepSteps.eq(1);
        oldStepCount = $wizardMultistepSteps.length;
      });

      it('should remove a step', function() {
        wizardMultistep.remove($stepToRemove);
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.length).to.equal(oldStepCount - 1);
      });

      it('should remove the correct step', function() {
        wizardMultistep.remove($stepToRemove);
        $wizardMultistepSteps = $wizardMultistep.find('.' + TEST_ATTRIBUTES.classes.components.step);
        expect($wizardMultistepSteps.eq(1).is($stepToRemove)).to.be.false;
      });
    });
  });

  describe('events', function() {

    it('should fire a ' + TEST_EVENTS.stepchange + ' event when step has changed and provide the correct to/from data', function(done) {
      var $expectedFrom = $wizardMultistepSteps.eq(0),
          $expectedTo = $wizardMultistepSteps.eq(1);

      wizardMultistep.on(TEST_EVENTS.stepchange, function(e, to, from) {
        expect($(from).is($expectedFrom)).to.be.true;
        expect($(to).is($expectedTo)).to.be.true;
        done();
      });

      wizardMultistep.nextStep();
    });
  });
});
