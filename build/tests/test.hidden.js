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
describe('HTMLElement#hidden', function() {
  'use strict';

  var el;
  beforeEach(function() {
    el = document.createElement('div');
  });

  it('should defaulted to false', function() {
    expect(el.hidden).to.be.false;
    expect(el.hasAttribute('hidden')).to.be.false;
  });

  it('should be settable to truthy/falsy', function() {
    el.hidden = 'abc';

    expect(el.hidden).to.be.true;
    expect(el.hasAttribute('hidden')).to.be.true;

    el.hidden = '';

    expect(el.hidden).to.be.false;
    expect(el.hasAttribute('hidden')).to.be.false;
  });
});
