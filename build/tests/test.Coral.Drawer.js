/*global helpers:true */
/*jshint camelcase:false */
describe('Coral.Drawer', function () {
  'use strict';

  beforeEach(function() {
    $.fx.off = true; // turn off jQuery animations to ease testing
  });

  afterEach(function() {
    $.fx.off = false;
  });

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Drawer');
    });
  });

  describe('attributes', function() {

    it('should be closed by default', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer._elements.content.$.is(':hidden')).to.be.true;
        done();
      });
    });

    it('should update icon accordingly (open=false and direction=down)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronDown');
          done();
        });
      });
    });

    it('should update icon accordingly (open=true and direction=down)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer.open = true;
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronUp');
          done();
        });
      });
    });

    it('should update icon accordingly (open=false and direction=up)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer.direction = 'up';
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronUp');
          done();
        });
      });
    });

    it('should update icon accordingly (open=true and direction=up)', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.open).to.be.false;
        expect(drawer.direction).to.equal('down');
        drawer.direction = 'up';
        drawer.open = true;
        drawer._updateIcon();
        helpers.next(function() {
          expect(drawer._elements.toggle.icon).to.equal('chevronDown');
          done();
        });
      });
    });

    it('should set direction class up', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.direction).to.equal('down');
        expect(drawer.$).to.have.class('coral-Drawer--down');
        drawer.direction = 'up';
        helpers.next(function() {
          expect(drawer.$).to.have.class('coral-Drawer--up');
          done();
        });
      });
    });

    it('should set direction class down', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.up.html'], function() {
        expect(drawer.direction).to.equal('up');
        expect(drawer.$).to.have.class('coral-Drawer--up');
        drawer.direction = 'down';
        helpers.next(function() {
          expect(drawer.$).to.have.class('coral-Drawer--down');
          done();
        });
      });
    });

    it('should disable the button and set the class name is-disable and aria-disabled', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer.disabled).to.be.false;
        drawer.disabled = true;
        helpers.next(function() {
          expect(drawer.$).to.have.class('is-disabled');
          expect(drawer.$).to.attr('aria-disabled','true');
          expect(drawer._elements.toggle.disabled).to.be.true;
          drawer.disabled = false;
          helpers.next(function() {
            done();
          });
        });
      });
    });

    it('should open the drawer if open is set to true', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        drawer.open = true;
        helpers.next(function() {
          expect(drawer.$).to.have.attr('aria-expanded', 'true');
          expect(drawer._elements.toggle.$.is(':hidden')).to.be.false;
          done();
        });
      });
    });

    it('should close the drawer if open is set to false', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.open.html'], function() {
        drawer.open = false;
        helpers.next(function() {
          expect(drawer.$).to.have.attr('aria-expanded', 'false');
          expect(drawer._elements.content.$.is(':hidden')).to.be.true;
          done();
        });
      });
    });

    it('should use the innerHTML of the drawer to set its content', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        expect(drawer._elements.content.$.html()).to.equal('<textarea></textarea>');
        done();
      });
    });
  });

  describe('events', function() {
    it('should trigger coral-drawer:open', function(done) {
      var eventSpy = sinon.spy();
      var drawer = helpers.build(window.__html__['Coral.Drawer.default.html'], function() {
        drawer.on('coral-drawer:open', eventSpy);
        drawer.open = true;
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-drawer:open should be called once');
          done();
        });
      });
    });

    it('should trigger coral-drawer:close', function(done) {
      var eventSpy = sinon.spy();
      var drawer = helpers.build(window.__html__['Coral.Drawer.open.html'], function() {
        drawer.on('coral-drawer:close', eventSpy);
        drawer.open = false;
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-drawer:close should be called once');
          done();
        });
      });
    });

    it('should toggle coral-drawer on toggle click', function(done) {
      var drawer = helpers.build(window.__html__['Coral.Drawer.open.html'], function() {
        drawer._elements.toggle.$.trigger('click');
        helpers.next(function() {
          expect(drawer.open).to.be.false;
          done();
        });
      });
    });
  });
});
