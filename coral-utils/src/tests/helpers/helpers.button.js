/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {tracking} from '../../../../coral-utils';
import {build, target} from './helpers.build';
import {cloneComponent} from './helpers.cloneComponent';

/**
 Helper used to check that the component complies with the button behavior.
 
 @param {Object} Constructor
 @param {String} tagName
 @param {String} baseTagName
 */
const testButton = function(Constructor, tagName, baseTagName) {
  describe('testButton', function() {
    
    describe('Enums', function() {
      it('should define the variants in an enum', function() {
        expect(Constructor.variant).to.exist;
        expect(Constructor.variant.CTA).to.equal('cta');
        expect(Constructor.variant.SECONDARY).to.equal('secondary');
        expect(Constructor.variant.PRIMARY).to.equal('primary');
        expect(Constructor.variant.WARNING).to.equal('warning');
        expect(Constructor.variant.QUIET).to.equal('quiet');
        expect(Constructor.variant.MINIMAL).to.equal('minimal');
        expect(Constructor.variant.DEFAULT).to.equal('default');
        expect(Constructor.variant._CUSTOM).to.equal('_custom');
        expect(Object.keys(Constructor.variant).length).to.equal(8);
      });
  
      it('should define the iconPositions in an enum', function() {
        expect(Constructor.iconPosition).to.exist;
        expect(Constructor.iconPosition.LEFT).to.equal('left');
        expect(Constructor.iconPosition.RIGHT).to.equal('right');
        expect(Object.keys(Constructor.iconPosition).length).to.equal(2);
      });
    });
  
    describe('Instantiation', function() {
      it('should be possible using new', function() {
        var button = build(new Constructor());
        expect(button.classList.contains('_coral-Button')).to.be.true;
        expect(button.hasAttribute('block')).to.be.false;
        expect(button.hasAttribute('icon')).to.be.false;
        expect(button.hasAttribute('variant')).to.be.true;
      });
    
      it('should not blow away loose HTML', function() {
        const button = build('<'+ baseTagName +' is="'+ tagName +'"><span>Add</span></'+ baseTagName +'>');
        expect(button.label.innerHTML).to.equal('<span>Add</span>');
      });
  
      cloneComponent(
        'should be possible to clone using markup',
        '<'+ baseTagName +' is="'+ tagName +'">Add</'+ baseTagName +'>'
      );
      
      cloneComponent(
        'should be possible to clone a button with size attribute using markup',
        '<'+ baseTagName +' is="'+ tagName +'" size="L">Add</'+ baseTagName +'>'
      );
  
      cloneComponent(
        'should be possible to clone a button with icon attribute using markup',
        '<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>'
      );
  
      cloneComponent(
        'should be possible to clone a button with icon and size attribute using markup',
        '<'+ baseTagName +' is="'+ tagName +'" icon="add" size"L">Add</'+ baseTagName +'>'
      );
  
      cloneComponent(
        'should be possible to clone a button with quiet attribute using markup',
        '<'+ baseTagName +' is="'+ tagName +'" variant="quiet">Add</'+ baseTagName +'>'
      );
  
      cloneComponent(
        'should be possible to clone a button using js',
        new Constructor().set({
          label: {
            textContent: 'Add Button'
          }
        })
      );
  
      cloneComponent(
        'should be possible to clone a button with a specific size using js',
        new Constructor().set({
          size: 'L',
          label: {
            textContent: 'Add Button'
          }
        })
      );
  
      cloneComponent(
        'should be possible to clone a button with an icon using js',
        new Constructor().set({
          icon: 'add',
          label: {
            textContent: 'Add Button'
          }
        })
      );
  
      cloneComponent(
        'should be possible to clone a button with a variant using js',
        new Constructor().set({
          variant: 'quiet',
          label: {
            textContent: 'Quiet Button'
          }
        })
      );
    });
  
    describe('Markup', function() {
    
      describe('#label', function() {
      
        it('should be initially empty', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" hidden></'+ baseTagName +'>');
          expect(button.label.textContent).to.equal('', 'label.textContent');
          expect(button.textContent).to.equal('');
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should use the existing nodes as the initial label value', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'">Button</'+ baseTagName +'>');
          expect(button.label.innerHTML).to.equal('Button');
        });
      
        it('should resync the icon once the label is modified', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().parentNode).not.to.be.null;
        
          button.label.textContent = 'Hello';
          expect(button.label.textContent).to.equal('Hello');
          expect(button.classList.contains('_coral-Button')).to.be.true;
          expect(button.icon).to.equal('add');
        });
      
        it('should change to square if the label is removed', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().parentNode).not.to.be.null;
        
          button.label.textContent = '';
          expect(button.label.textContent).to.equal('');
          expect(button.classList.contains('_coral-Button')).to.be.true;
          expect(button.icon).to.equal('add');
        });
      
        it('should remove square if the label is added', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add"></'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().parentNode).not.to.be.null;
        
          button.label.textContent = 'Add';
          expect(button.label.textContent).to.equal('Add');
          expect(button.classList.contains('_coral-Button')).to.be.true;
          expect(button.icon).to.equal('add');
        });
      });
    
      describe('#icon', function() {
      
        it('should be initially empty', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'"></'+ baseTagName +'>');
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
          expect(button.hasAttribute('icon')).to.be.false;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should set a new icon', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add"></'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.label.textContent).to.equal('');
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('add');
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should not be square when there is a label', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.label.textContent).to.equal('Add');
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('add');
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should have default icon alt text when there is no label', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add"></'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal(null);
          expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should not have icon alt text when there is a label', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.label.textContent).to.equal('Add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should remove icon alt text if the label is added', function(done) {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add"></'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.label.innerHTML).to.equal('');
          expect(button.getAttribute('icon')).to.equal('add');
          expect(button._elements.icon).to.exist;
          expect(button._elements.icon.parentNode).not.to.be.null;
          expect(button._elements.icon.alt).to.equal(null);
          expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');
        
          button.label.textContent = 'Add';
          // Wait for the MO to kick in
          setTimeout(() => {
            expect(button.label.textContent).to.equal('Add');
            expect(button.classList.contains('_coral-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            expect(button._elements.icon.alt).to.equal('');
            expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
            done();
          });
        });
      
        it('should restore default icon alt text if the label is removed', function(done) {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
        
          button.label.innerHTML = '';
          // Wait for the MO to kick in
          setTimeout(() => {
            expect(button.label.textContent).to.equal('');
            expect(button.classList.contains('_coral-Button')).to.be.true;
            expect(button.icon).to.equal('add');
            expect(button._elements.icon.alt).to.equal('');
            expect(button._elements.icon.getAttribute('aria-label')).to.equal('add');
            done();
          });
        });
      
        it('should not create a new icon if the value is updated', function(done) {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add">Add</'+ baseTagName +'>');
          expect(button.label.innerHTML).to.equal('Add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button.icon).to.equal('add');
          expect(button._elements.icon.alt).to.equal('');
          expect(button._elements.icon.getAttribute('aria-label')).to.be.null;
        
          // icon is updated
          button.icon = 'share';
          button.label.innerHTML = '';
          // Wait for the MO to kick in
          setTimeout(() => {
            expect(button._getIconElement()).to.exist;
            expect(button._getIconElement().icon).to.equal('share');
            expect(button._elements.icon.alt).to.equal('');
            expect(button._elements.icon.getAttribute('aria-label')).to.equal('share');
            expect(button.classList.contains('_coral-Button')).to.be.true;
            done();
          });
        });
      
        it('should hide the icon element once the icon is set to empty string', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add"></'+ baseTagName +'>');
          expect(button.icon).to.equal('add');
          expect(button.hasAttribute('icon', 'add')).to.be.true;
          expect(button._getIconElement().parentNode).not.to.be.null;
        
          button.icon = '';
          expect(button._getIconElement()).to.exist;
          expect(button._getIconElement().icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
  
        it('should support defining a custom icon', function() {
          const button = build(`<${baseTagName} is="${tagName}" icon="add"><coral-icon icon="home" class="custom"></coral-icon></${baseTagName}>`);
          expect(button.icon).to.equal('home');
          expect(button._getIconElement().classList.contains('custom')).to.be.true;
        });
        
        it('should clear the label from extra space to support icon only usecase', function() {
          const button = build(`<${baseTagName} is="${tagName}" icon="add"> </${baseTagName}>`);
          expect(button.label.textContent).to.equal('');
        });
      }); // end describe icon
    
      describe('#iconsize', function() {
        it('should be initially the default', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'"></'+ baseTagName +'>');
          expect(button.iconSize).to.equal(Constructor.iconSize.SMALL);
          expect(button.hasAttribute('iconsize')).to.be.false;
        });
      
        it('should set the new iconsize', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" iconsize="XS" icon="add"></'+ baseTagName +'>');
          expect(button.iconSize).to.equal(Constructor.iconSize.EXTRA_SMALL);
          expect(button.getAttribute('iconsize')).to.equal('XS');
          expect(button._getIconElement().icon).to.equal('add');
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.EXTRA_SMALL);
        });
      
        it('should discard invalid iconsize', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" iconsize="megalarge" icon="add"></'+ baseTagName +'>');
          expect(button.iconSize).to.equal(Constructor.iconSize.SMALL);
          expect(button.hasAttribute('iconsize', 'megalarge')).to.be.true;
          expect(button._getIconElement().icon).to.equal('add');
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.SMALL);
        });
      });
    
      describe('#iconposition', function() {
        it('should generate icon per default on left when not defined', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add"></'+ baseTagName +'>');
          expect(button.iconPosition).to.equal(Constructor.iconPosition.LEFT);
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
        });
      
        it('should generate icon on the left when defined in iconposition', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add" iconposition="left"></'+ baseTagName +'>');
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
        });
      
        it('should generate icon on the right when defined in iconposition', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add" iconposition="right"></'+ baseTagName +'>');
          expect(button.firstElementChild.tagName).to.equal(tagName.toUpperCase() + '-LABEL');
        });
      
        it('should move icon on the left iconposition is changed on runtime', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add" iconposition="RIGHT"></'+ baseTagName +'>');
          button.iconPosition = 'LEFT';
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
        });
      
        it('should default to "left" when the attribute is removed', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" icon="add" iconposition="right"></'+ baseTagName +'>');
          button.removeAttribute('iconposition');
          expect(button.iconPosition).to.equal(Constructor.iconPosition.LEFT);
          expect(button.firstElementChild.tagName).to.equal('CORAL-ICON');
        });
      });
    
      describe('#size', function() {
        it('should default to medium', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'"></'+ baseTagName +'>');
          expect(button.size).to.equal(Constructor.size.MEDIUM);
        });
      
        it('should set the size modifier', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" size="L"></'+ baseTagName +'>');
          expect(button.size).to.equal(Constructor.size.LARGE);
        });
      });
    
      describe('#block', function() {
      
        it('should be initially false', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'"></'+ baseTagName +'>');
          expect(button.block).to.be.false;
          expect(button.hasAttribute('block')).to.be.false;
          expect(button.classList.contains('_coral-Button--block')).to.be.false;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should set the size modifier', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" block></'+ baseTagName +'>');
          expect(button.block).to.be.true;
          expect(button.hasAttribute('block')).to.be.true;
          expect(button.classList.contains('_coral-Button--block')).to.be.true;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should behave like an attribute boolean', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" block="false"></'+ baseTagName +'>');
          expect(button.block).to.be.true;
          expect(button.hasAttribute('block')).to.be.true;
          expect(button.classList.contains('_coral-Button--block')).to.be.true;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      });
    
      describe('#variant', function() {
      
        it('should be initially Constructor.variant.DEFAULT', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'"></'+ baseTagName +'>');
          expect(button.variant).to.equal(Constructor.variant.DEFAULT);
          expect(button.hasAttribute('variant')).to.be.true;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should set the new variant', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" variant="cta"></'+ baseTagName +'>');
          expect(button.variant).to.equal('cta');
          expect(button.variant).to.equal(Constructor.variant.CTA);
          expect(button.getAttribute('variant')).to.equal(Constructor.variant.CTA);
          expect(button.classList.contains('_coral-Button--cta')).to.be.true;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should add the default class if variant is empty', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" variant=""></'+ baseTagName +'>');
          expect(button.variant).to.equal(Constructor.variant.DEFAULT);
          expect(button.hasAttribute('variant', Constructor.variant.DEFAULT)).to.be.true;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should go back to default variant for invalid variant', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" variant="invalidvariant"></'+ baseTagName +'>');
          expect(button.variant).to.equal(Constructor.variant.DEFAULT);
          expect(button.hasAttribute('variant', Constructor.variant.DEFAULT)).to.be.true;
          expect(button.classList.contains('_coral-Button')).to.be.true;
        });
      
        it('should remove variant classnames when variant changes', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" variant="cta"></'+ baseTagName +'>');
          expect(button.classList.contains('_coral-Button--cta')).to.be.true;
        
          button.variant = Constructor.variant.WARNING;
          expect(button.classList.contains('_coral-Button--warning')).to.be.true;
          expect(button.classList.contains('_coral-Button--cta')).to.be.false;
        });
      });
    
      describe('#selected', function() {
      
        it('should default to false', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'"></'+ baseTagName +'>');
          expect(button.selected).to.be.false;
          expect(button.classList.contains('is-selected')).to.be.false;
          expect(button.hasAttribute('selected')).to.be.false;
        });
      
        it('should be settable', function() {
          const button = build('<'+ baseTagName +' is="'+ tagName +'" selected></'+ baseTagName +'>');
          expect(button.selected).to.be.true;
          expect(button.hasAttribute('selected')).to.be.true;
          expect(button.classList.contains('is-selected')).to.be.true;
        });
      });
    
      it('should accept all attributes at once', function() {
        const button = build('<'+ baseTagName +' is="'+ tagName +'" variant="cta" icon="share" size="L" block>Share</'+ baseTagName +'>');
        expect(button.size).to.equal(Constructor.size.LARGE);
        expect(button.block).to.be.true;
        expect(button.variant).to.equal(Constructor.variant.CTA);
        expect(button.icon).to.equal('share');
        expect(button.classList.contains('_coral-Button--block')).to.be.true;
        expect(button.classList.contains('_coral-Button--cta')).to.be.true;
        expect(button._getIconElement()).to.exist;
        expect(button._getIconElement().icon).to.equal('share');
        expect(button.label.textContent).to.equal('Share');
        expect(button.classList.contains('_coral-Button')).to.be.true;
      }); // end variant
    });
  
    describe('API', function() {
    
      describe('#icon', function() {
      
        it('should default to empty string', function() {
          var button = new Constructor();
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
        });
      
        it('should set the new icon', function() {
          var button = new Constructor();
          button.icon = 'add';
          expect(button.hasAttribute('icon')).to.be.false;
          expect(button._getIconElement().icon).to.equal('add');
        });
      
        it('should convert everything to string', function() {
          var button = new Constructor();
          button.icon = 5;
          expect(button.icon).to.equal('5');
        
          button.icon = false;
          expect(button.icon).to.equal('false');
        
          button.icon = true;
          expect(button.icon).to.equal('true');
          expect(button.hasAttribute('icon')).to.be.false;
          expect(button._getIconElement()).not.to.be.null;
          expect(button._getIconElement().icon).to.equal('true');
        });
      
        it('should remove the icon with empty string', function() {
          var button = new Constructor();
          button.icon = 'add';
          expect(button._getIconElement().icon).to.equal('add');
        
          button.icon = '';
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
        });
      
        it('should remove the icon with null', function() {
          var button = new Constructor();
          button.icon = 'add';
          expect(button._getIconElement().icon).to.equal('add');
        
          button.icon = null;
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
        });
      
        it('should remove the icon with undefined', function() {
          var button = new Constructor();
          button.icon = 'add';
          expect(button._getIconElement().icon).to.equal('add');
        
          button.icon = undefined;
          expect(button.icon).to.equal('');
          expect(button._getIconElement().parentNode).to.be.null;
        });
      });
    
      describe('#iconSize', function() {
      
        it('should default to SMALL', function() {
          var button = new Constructor();
          button.icon = 'add';
          expect(button.iconSize).to.equal(Constructor.iconSize.SMALL);
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.SMALL);
        });
      
        it('should sync the iconSize correctly', function() {
          var button = new Constructor();
          button.iconSize = Constructor.iconSize.EXTRA_SMALL;
          button.icon = 'add';
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.EXTRA_SMALL);
        });
      
        it('should set the new size even if icon is not set', function() {
          var button = new Constructor();
          button.iconSize = Constructor.iconSize.EXTRA_SMALL;
          expect(button.iconSize).to.equal(Constructor.iconSize.EXTRA_SMALL);
        });
      
        it('should set the new size', function() {
          var button = new Constructor();
          button.icon = 'add';
          button.iconSize = Constructor.iconSize.EXTRA_SMALL;
          expect(button.iconSize).to.equal(Constructor.iconSize.EXTRA_SMALL);
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.EXTRA_SMALL);
        });
      
        it('should accept lowercase values', function() {
          var button = new Constructor();
          button.icon = 'add';
          button.iconSize = Constructor.iconSize.EXTRA_SMALL.toLowerCase();
          expect(button.iconSize).to.equal(Constructor.iconSize.EXTRA_SMALL);
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.EXTRA_SMALL);
        });
      
        it('should be set with an attribute', function() {
          var button = new Constructor();
          button.icon = 'add';
          button.setAttribute('iconsize', Constructor.iconSize.EXTRA_SMALL);
          expect(button.iconSize).to.equal(Constructor.iconSize.EXTRA_SMALL);
          expect(button.hasAttribute('iconsize', 'XS')).to.be.true;
          expect(button._getIconElement().size).to.equal(Constructor.iconSize.EXTRA_SMALL);
        });
      
        it('should discard values not part of the enum', function() {
          var button = new Constructor();
          // this value will be accepted
          button.iconSize = 'XS';
          // all these will be discarded
          button.iconSize = 'megalarge';
          button.iconSize = null;
          button.iconSize = -1;
          // Falls back to default enum which is SMALL
          expect(button.iconSize).to.equal(Constructor.iconSize.SMALL);
        });
      
        it('should discard unknown attribute', function() {
          var button = new Constructor();
          button.setAttribute('size', 'megalarge');
          expect(button.iconSize).to.equal(Constructor.iconSize.SMALL);
        });
      
        it('should keep the size after the icon is changed', function() {
          var button = new Constructor();
        
          button.icon = 'add';
          button.iconSize = 'XS';
        
          expect(button._getIconElement().icon).to.equal('add');
          expect(button._getIconElement().size).to.equal('XS');
        
          button.icon = 'delete';
        
          expect(button.icon).to.equal('delete');
          expect(button.iconSize).to.equal('XS');
          expect(button._getIconElement().icon).to.equal('delete');
          expect(button._getIconElement().size).to.equal('XS');
        });
      });
    
      describe('#iconPosition', function() {
        it('should default to left', function() {
          var button = new Constructor();
          expect(button.iconPosition).to.equal(Constructor.iconPosition.LEFT);
        });
      });
    
      describe('#selected', function() {
      
        it('should default to false', function() {
          var button = new Constructor();
          expect(button.selected).to.be.false;
          expect(button.classList.contains('is-selected')).to.be.false;
          expect(button.hasAttribute('selected')).to.be.false;
        });
      
        it('should be settable', function() {
          var button = new Constructor();
          button.selected = true;
          expect(button.selected).to.be.true;
          expect(button.hasAttribute('selected')).to.be.true;
          expect(button.classList.contains('is-selected')).to.be.true;
        });
      });
  
      describe('#trackingElement', function() {
        it('should default to empty string', function() {
          var button = new Constructor();
          expect(button.trackingElement).to.equal('');
          expect(button.label.textContent).to.equal('');
          expect(button.icon).to.equal('');
        });
    
        it('should default to the content when available', function() {
          var button = new Constructor();
      
          button.label.textContent = 'My button';
          expect(button.trackingElement).to.equal('My button');
      
          button.label.textContent = '  My content   with spaces';
          expect(button.trackingElement).to.equal('My content with spaces');
      
          button.trackingElement = 'create';
      
          expect(button.trackingElement).to.equal('create', 'Respects the user set value when available');
        });
    
        it('should strip the html out of the content', function() {
          var button = new Constructor();
      
          button.label.innerHTML = 'My <b>b</b>utton';
          expect(button.trackingElement).to.equal('My button');
        });
    
        it('should default to the icon when there is no content', function() {
          var button = new Constructor();
          button.icon = 'add';
      
          expect(button.trackingElement).to.equal('add');
        });
      });
    });
  
    describe('Tracking', function() {
      var trackerFnSpy;
    
      beforeEach(function() {
        trackerFnSpy = sinon.spy();
        tracking.addListener(trackerFnSpy);
      });
    
      afterEach(function() {
        tracking.removeListener(trackerFnSpy);
      });
  
      it('should call the tracker callback fn once when a click is triggered', function() {
        var button = new Constructor();
        target.appendChild(button);
        button.click();
    
        expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called only once.');
      });
  
      it('should call the tracker callback fn with trackData when a click is triggered', function() {
        const el = build(new Constructor());
        el.setAttribute('trackingfeature', 'feature name');
        el.setAttribute('trackingelement', 'element name');
        
        el.click();
    
        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
    
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', tagName);
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', tagName);
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Constructor);
      });
  
      it('should not call the tracker callback when disabled', function() {
        const el = new Constructor();
        el.disabled = true;
        el.click();
        expect(trackerFnSpy.callCount).to.equal(0, 'Track event should\'t have been called.');
      });
    
      it('should call the tracker callback fn when a click is triggered', function() {
        var button = new Constructor();
        target.appendChild(button);
        button.click();
      
        expect(trackerFnSpy.callCount).to.equal(1, 'Track event should be called once.');
      });
    
      it('should call the tracker callback fn with at least four parameters: trackData, event, component, childComponent', function() {
        var button = new Constructor();
        target.appendChild(button);
        button.click();
      
        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType');
        expect(trackData).to.have.property('eventType');
        expect(trackData).to.have.property('rootElement');
        expect(trackData).to.have.property('rootFeature');
        expect(trackData).to.have.property('rootType');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Constructor);
      });
    
      it('should call the tracker callback fn with custom trackData properties: trackingfeature and trackingelement', function() {
        var button = new Constructor();
        button.setAttribute('trackingfeature', 'sites');
        button.setAttribute('trackingelement', 'rail toggle');
        target.appendChild(button);
        button.click();
      
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootElement', 'rail toggle');
      });
    
      it('should not call the tracker callback fn when component has tracking=off attribute', function() {
        var button = new Constructor();
        button.setAttribute('tracking', Constructor.tracking.OFF);
        target.appendChild(button);
        button.click();
      
        expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
      });
    
      it('should not call the tracker callback fn when component tracking=off', function() {
        var button = new Constructor();
        target.appendChild(button);
        button.tracking = Constructor.tracking.OFF;
        button.click();
      
        expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
      });
    
      it('should fallback to the default trackingElement when not specified', function() {
        const el = build(new Constructor());
        el.setAttribute('trackingfeature', 'feature name');
        el.label.textContent = 'Button contents';
        el.click();
      
        expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
      
        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', tagName);
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootElement', 'Button contents');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', tagName);
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Constructor);
      });
    });
  });
};

export {testButton};
