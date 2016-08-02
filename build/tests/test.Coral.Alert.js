describe('Coral.Alert', function() {
  'use strict';

  var el;
  beforeEach(function() {
    el = new Coral.Alert();
    helpers.target.appendChild(el);
  });

  afterEach(function() {
    el = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Alert');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Alert.variant).to.exist;
      expect(Coral.Alert.variant.ERROR).to.equal('error');
      expect(Coral.Alert.variant.WARNING).to.equal('warning');
      expect(Coral.Alert.variant.SUCCESS).to.equal('success');
      expect(Coral.Alert.variant.HELP).to.equal('help');
      expect(Coral.Alert.variant.INFO).to.equal('info');
      expect(Object.keys(Coral.Alert.variant).length).to.equal(5);
    });

    it('should define the sizes in an enum', function() {
      expect(Coral.Alert.size).to.exist;
      expect(Coral.Alert.size.SMALL).to.equal('S');
      expect(Coral.Alert.size.LARGE).to.equal('L');
      expect(Object.keys(Coral.Alert.size).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Alert.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a large alert using markup', function(done) {
      helpers.build(window.__html__['Coral.Alert.large.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a large alert using js', function(done) {
      el.size = 'L';
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {

    describe('#content', function() {
      it('should set provided content', function() {
        var content = 'I am content!';
        el.content.innerHTML = content;
        expect(el._elements.content.innerHTML).to.equal(content, 'content after set');
      });
    });

    describe('#header', function() {
      it('should set provided header', function() {
        var header = 'I am header!';
        el.header.innerHTML = header;
        expect(el._elements.header.innerHTML).to.equal(header, 'content after set');
      });
    });

    describe('#size', function() {
      it('should default to small', function(done) {
        expect(el.size).to.equal(Coral.Alert.size.SMALL);

        // helpers.next(function() {
        expect(el.$).to.have.attr('size', Coral.Alert.size.SMALL);
        done();
        // });
      });

      it('should set correct className when size is small', function(done) {
        el.size = Coral.Alert.size.SMALL;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--small');
          done();
        });
      });

      it('should set correct className when size is large', function(done) {
        el.size = Coral.Alert.size.LARGE;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--large');
          done();
        });
      });
    });

    describe('#variant', function() {
      it('should default to info', function(done) {
        expect(el.variant).to.equal(Coral.Alert.variant.INFO);
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--info');
          done();
        });
      });

      it('should set correct className when variant is error', function(done) {
        el.variant = Coral.Alert.variant.ERROR;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--error');
          done();
        });
      });

      it('should set correct className when variant is warning', function(done) {
        el.variant = Coral.Alert.variant.WARNING;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--warning');
          done();
        });
      });

      it('should set correct className when variant is success', function(done) {
        el.variant = Coral.Alert.variant.SUCCESS;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--success');
          done();
        });
      });

      it('should set correct className when variant is help', function(done) {
        el.variant = Coral.Alert.variant.HELP;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--help');
          done();
        });
      });

      it('should set correct className when variant is info', function(done) {
        el.variant = Coral.Alert.variant.INFO;
        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Alert--info');
          done();
        });
      });
    });

    function testContentZoneIndicies(alert) {
      var headerIndex = -1;
      var contentIndex = -2;
      var footerIndex = -3;
      var child;
      for (var i = 0; i < alert.children.length; i++) {
        child = alert.children[i];
        if (child.tagName === 'CORAL-ALERT-HEADER') {
          headerIndex = i;
        }
        else if (child.tagName === 'CORAL-ALERT-CONTENT') {
          contentIndex = i;
        }
        else if (child.tagName === 'CORAL-ALERT-FOOTER') {
          footerIndex = i;
        }
      }

      expect(headerIndex).to.be.below(contentIndex, 'Header should come before the content');
      expect(contentIndex).to.be.below(footerIndex, 'Content should come before the footer');
    }

    describe('content zones', function() {
      it('should have the correct order on render', function() {
        var alert = new Coral.Alert();
        testContentZoneIndicies(alert);
      });
      it('should have the correct order when header set', function() {
        var alert = new Coral.Alert();
        var header = alert.header = document.createElement('coral-alert-header');
        expect(alert.header).to.equal(header);
        expect(alert.querySelector('coral-alert-header')).to.equal(header);
        testContentZoneIndicies(alert);
      });
      it('should have the correct order when content set', function() {
        var alert = new Coral.Alert();
        var content = alert.content = document.createElement('coral-alert-content');
        expect(alert.content).to.equal(content);
        expect(alert.querySelector('coral-alert-content')).to.equal(content);
        testContentZoneIndicies(alert);
      });
      it('should have the correct order when footer set', function() {
        var alert = new Coral.Alert();
        var footer = alert.footer = document.createElement('coral-alert-footer');
        expect(alert.footer).to.equal(footer);
        expect(alert.querySelector('coral-alert-footer')).to.equal(footer);
        testContentZoneIndicies(alert);
      });
    });

    describe('#coral-close', function() {
      it('should hide when any element with [coral-close] clicked', function() {
        expect(el.hidden).to.equal(false, 'hidden before close clicked');

        el.content.innerHTML = '<button coral-close id="closeButton">Close me!</button>';

        el.querySelector('#closeButton').click();

        expect(el.hidden).to.equal(true, 'hidden after close clicked');
      });


      it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
        var spy = sinon.spy();
        helpers.target.addEventListener('click', spy);

        el.id = 'myAlert';
        expect(el.hidden).to.equal(false, 'hidden before close clicked');

        el.content.innerHTML = '<button coral-close="#myAlert" id="closeMyAlert">Close me!</button><button coral-close="#otherAlert" id="closeOtherAlert">Close someone else!</button>';

        el.querySelector('#closeOtherAlert').click();

        expect(el.hidden).to.equal(false, 'hidden after close clicked');
        expect(spy.callCount).to.equal(1);

        spy.reset();
        el.querySelector('#closeMyAlert').click();

        expect(el.hidden).to.equal(true, 'hidden after close clicked');
        expect(spy.callCount).to.equal(0);
      });
    });
  });
});
