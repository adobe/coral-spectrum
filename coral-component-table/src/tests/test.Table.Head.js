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

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Table} from '../../../coral-component-table';

describe('Table.Head', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Table).to.have.property('Head');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Table.Head());
      expect(el.classList.contains('_coral-Table-head')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('thead', {is: 'coral-table-head'}));
      expect(el.classList.contains('_coral-Table-head')).to.be.true;
    });
  });

  describe('API', function() {
    describe('#sticky', function() {});

    describe('#divider', function() {
      it('should default to row divider', function() {
        var el = helpers.build(new Table.Head());
        expect(el.divider).to.equal(Table.divider.ROW);
    
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });
  
      it('should apply column divider', function() {
        var el = new Table.Head();
        el.divider = Table.divider.COLUMN;
    
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });
  
      it('should apply cell divider', function() {
        var el = new Table.Head();
        el.divider = Table.divider.CELL;
    
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
      });
    });
  });
  
  describe('Markup', function() {
    describe('#sticky', function() {
      // @flaky
      it.skip('should not set min-width on header cell without visible content', function(done) {
        const el = helpers.build(window.__html__['Table.sticky.empty.headercell.html']);
        el._wait = 0;
        // Because of debouncing
        window.setTimeout(function() {
          var headerCells = el.querySelectorAll('thead th');
          expect(headerCells[0].style.minWidth).to.equal('');
          expect(headerCells[1].style.minWidth).to.not.equal('');
          done();
        }, 10);
      });
  
      it('should handle long header cell label with short content without overflowing', function(done) {
        const el = helpers.build(window.__html__['Table.sticky.labeloverlap.html']);
        
        el._wait = 0;
        // Because of debouncing
        window.setTimeout(function() {
          const longLabelHeaderCell = el.querySelector('thead th:nth-child(4)');
          const labelWidth = longLabelHeaderCell.clientWidth;
      
          el._elements.head.sticky = false;
      
          window.setTimeout(function() {
            el._elements.head.sticky = true;
        
            window.setTimeout(function() {
              expect(longLabelHeaderCell.clientWidth >= labelWidth).to.be.true;
              done();
            }, 10);
          }, 10);
        }, 10);
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-table-head:_contentchanged', function() {
      it('should trigger when content changed', function(done) {
        const el = new Table.Head();
        const spy = sinon.spy();
        el.on('coral-table-head:_contentchanged', spy);
        el.appendChild(document.createElement('span'));
      
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
    
    describe('#coral-table-head:_stickychanged', function() {
      it('should trigger when changing sticky', function(done) {
        const el = new Table.Head();
        const spy = sinon.spy();
        el.on('coral-table-head:_stickychanged', spy);
        el.sticky = true;
    
        // Event is triggered in next frame
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    it('should set a11y attribute', function() {
      var row = helpers.build(new Table.Head());
      expect(row.tagName).to.equal('THEAD');
      expect(row.hasAttribute('role')).to.be.false;
    });
  });
});
