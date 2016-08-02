/*global helpers:true */
/*jshint camelcase:false */
describe('Coral.TagList', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('TagList');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone a taglist with one tag using markup', function(done) {
      helpers.build(window.__html__['Coral.TagList.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone a taglist with multiple tags using markup', function(done) {
      helpers.build(window.__html__['Coral.TagList.full.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var tagList = new Coral.TagList();
      helpers.target.appendChild(tagList);
      tagList.items.add({
        label: {
          innerHTML: 'San José'
        },
        value: 'SJ'
      });
      tagList.items.add({
        label: {
          innerHTML: 'New York'
        },
        value: 'NY'
      });

      helpers.next(function() {
        helpers.testComponentClone(tagList, done);
      });
    });
  });

  describe('markup', function() {
    it('should have a role', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        expect(tagList.$).to.have.attr('role', 'listbox');
        done();
      });
    });
  });

  describe('API', function() {

    describe('#value', function() {

      it('should create an input related to the tag item', function(done) {
        var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
          tagList.items.getAll().forEach(function(item) {
            expect(item.querySelector('input[type="hidden"]')).to.equal(item.$.data('input'));
          });
          done();
        });
      });

      it('should set the value to the input related to the tag', function(done) {
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        helpers.next(function() {
          expect(tagList.items.getAll()[0].$.data('input').value).to.equal('SJ');
          expect(tagList.items.getAll()[0].value).to.equal('SJ');
          expect(tagList.value).to.equal('SJ');
          expect(tagList.values[0]).to.equal('SJ');

          done();
        });
      });

      it('should be set to the label when using the the collection API', function(done) {
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          }
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJO'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ1'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: ''
        });

        helpers.next(function() {
          var items = tagList.items.getAll();
          expect(items[0].label.innerHTML).to.equal('San José');
          expect(items[0].value).to.equal('San José');
          expect(items[1].label.innerHTML).to.equal('San José');
          expect(items[1].value).to.equal('SJO');
          expect(items[2].label.innerHTML).to.equal('San José');
          expect(items[2].value).to.equal('SJ');
          expect(items[3].label.innerHTML).to.equal('San José');
          expect(items[3].value).to.equal('SJ1');
          expect(items[4].label.innerHTML).to.equal('San José');
          expect(items[4].value).to.equal('');

          done();
        });
      });

      it('should not allow duplicate tag values', function(done) {
        var eventSpy = sinon.spy();
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });

        helpers.next(function() {
          var items = tagList.items.getAll();
          expect(eventSpy.callCount).to.equal(1);
          expect(items.length).to.equal(1);
          expect(items[0].value).to.equal('SJ');

          done();
        });
      });

      it('should get the first tag value', function(done) {
        var eventSpy = sinon.spy();
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });

        helpers.next(function() {
          expect(tagList.value).to.equal('SJ');
          expect(tagList.value).to.equal(tagList.items.getAll()[0].value);

          done();
        });
      });

      it('should clear all tags and set one tag with the provided value', function(done) {
        var eventSpy = sinon.spy();
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });
        tagList.value = 'Paris';

        helpers.next(function() {
          var items = tagList.items.getAll();
          expect(items.length).to.equal(1);
          expect(items[0].value).to.equal('Paris');
          expect(items[0].label.innerHTML).to.equal('Paris');

          done();
        });
      });

      it('should get an array of values', function(done) {
        var eventSpy = sinon.spy();
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });

        helpers.next(function() {
          var items = tagList.items.getAll();
          var values = tagList.values;
          expect(values.length).to.equal(items.length);
          expect(items[0].value).to.equal(values[0]);
          expect(items[1].value).to.equal(values[1]);

          done();
        });
      });

      it('should clear all tags and set new tags provided by the array of values', function(done) {
        var eventSpy = sinon.spy();
        var tagList = new Coral.TagList();
        helpers.target.appendChild(tagList);
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add({
          label: {
            innerHTML: 'San José'
          },
          value: 'SJ'
        });
        tagList.items.add({
          label: {
            innerHTML: 'New York'
          },
          value: 'NY'
        });
        tagList.values = ['Paris', 'London'];

        helpers.next(function() {
          var items = tagList.items.getAll();
          expect(items[0].value).to.equal('Paris');
          expect(items[0].label.innerHTML).to.equal('Paris');
          expect(items[1].label.innerHTML).to.equal('London');
          expect(items[1].label.innerHTML).to.equal('London');

          done();
        });
      });
    });

    describe('#values', function() {
      it('should return an array of tag values', function() {
        var values = ['SF', 'SJ', 'NY'];
        var tagList = new Coral.TagList();

        tagList.values = values;
        expect(tagList.values).to.deep.equal(values);
      });

      it('should send the correct values when submitted in a form', function() {
        var values = ['SF', 'SJ', 'NY'];
        var form = document.createElement('form');
        var tagList = new Coral.TagList();
        tagList.name = 'componentName';
        form.appendChild(tagList);

        tagList.values = values;

        expect($(form).serializeArray()).to.deep.equal(values.map(function(value) {
          return {
            name: 'componentName',
            value: value
          };
        }));
      });
    });

    it('should disable and block every user interaction', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        expect(tagList.disabled).to.be.false;
        tagList.disabled = true;
        helpers.next(function() {
          tagList.items.getAll().forEach(function(item) {
            expect(item._elements.button.disabled).to.be.true;
            expect(item.$.data('input').disabled).to.be.true;
          });
          done();
        });
      });
    });

    it('should set tag property name to taglist property name', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.name = 'myname';
        helpers.next(function() {
          tagList.items.getAll().forEach(function(item) {
            expect(item.$.data('input').name).to.equal(tagList.name);
          });
          done();
        });
      });
    });

    it('should set added tag property name to taglist property name', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.name = 'myname';
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          tagList.items.getAll().forEach(function(item) {
            expect(item.$.data('input').name).to.equal(tagList.name);
          });
          done();
        });
      });
    });

    it('should submit the form with taglist values', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.full.html'], function() {
        var all = tagList.items.getAll();
        tagList.$
          .wrap('<form>')
          .parent()
          .serializeArray().forEach(function(obj, i) {
          expect(obj.name).to.equal(tagList.name);
          expect(obj.value).to.equal(all[i].value);
        });
        done();
      });
    });

    it('should trigger a change event if a tag is removed by the user', function(done) {
      var eventSpy = sinon.spy();
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.on('change', eventSpy);
        var all = tagList.items.getAll();
        expect(all.length).to.equal(1);
        all[0]._elements.button.click();
        helpers.next(function() {
          expect(tagList.items.getAll().length).to.equal(0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('should trigger a change event if a tag is removed by the user but only after the tag is really removed', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {

        tagList.on('change', function() {
          expect(tagList.items.getAll().length).to.equal(0);
          done();
        });

        var all = tagList.items.getAll();
        expect(all.length).to.equal(1);
        all[0]._elements.button.click();
      });
    });

    it('should remove a focused tag on backspace', function(done) {
      var eventSpy = sinon.spy();
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.on('change', eventSpy);
        var all = tagList.items.getAll();
        expect(all.length).to.equal(1);
        helpers.keypress('backspace', all[0]);
        helpers.next(function() {
          expect(tagList.items.getAll().length).to.equal(0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('set aria-selected attribute to true to focused item', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          expect(all[0].$).to.have.attr('aria-selected', 'false');
          expect(all[1].$).to.have.attr('aria-selected', 'false');
          expect(all[0].$).to.have.attr('tabindex', '0');
          expect(all[1].$).to.have.attr('tabindex', '-1');

          all[0].trigger('focus');
          helpers.next(function() {
            expect(all[0].$).to.have.attr('aria-selected', 'true');
            expect(all[1].$).to.have.attr('aria-selected', 'false');
            done();
          });
        });
      });
    });

    it('should not focus next item on tab', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('tab', all[0]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[0]);
            done();
          });
        });
      });
    });

    it('should set focus to next item on right', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('right', all[0]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[1]);
            done();
          });
        });
      });
    });

    it('should set focus to next item on pagedown', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('pagedown', all[0]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[1]);
            done();
          });
        });
      });
    });

    it('should set focus to next item on down', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('down', all[0]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[1]);
            done();
          });
        });
      });
    });

    it('should set focus to previous item on left', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('left', all[1]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[0]);
            done();
          });
        });
      });
    });

    it('should set focus to previous item on pageup', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('pageup', all[1]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[0]);
            done();
          });
        });
      });
    });

    it('should set focus to previous item on up', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(new Coral.Tag());
        helpers.next(function() {
          var all = tagList.items.getAll();
          helpers.keypress('up', all[1]);
          helpers.next(function() {
            expect(document.activeElement).to.equal(all[0]);
            done();
          });
        });
      });
    });

    it('should set focus to first item on home', function (done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function () {
        tagList.items.add(new Coral.Tag());
        helpers.next(function () {
          var all = tagList.items.getAll();
          helpers.keypress('home', all[1]);
          helpers.next(function () {
            expect(document.activeElement).to.equal(all[0]);
            done();
          });
        });
      });
    });

    it('should set focus to last item on end', function (done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function () {
        tagList.items.add(new Coral.Tag());
        helpers.next(function () {
          var all = tagList.items.getAll();
          helpers.keypress('end', all[0]);
          helpers.next(function () {
            expect(document.activeElement).to.equal(all[1]);
            done();
          });
        });
      });
    });
  });

  describe('Collection API', function() {

    it('#items cannot be set', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        var items = tagList.items;
        tagList.items = null;
        expect(tagList.items).to.equal(items);
        done();
      });
    });

    it('triggers coral-collection:add on appendChild', function(done) {
      var eventSpy = sinon.spy();
      var tag = new Coral.Tag();

      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.on('coral-collection:add', eventSpy);
        tagList.appendChild(tag);

        helpers.next(function() {
          var all = tagList.items.getAll();
          expect(all.length).to.equal(2);
          expect(all[1]).to.equal(tag);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var eventSpy = sinon.spy();

      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.on('coral-collection:remove', eventSpy);
        tagList.removeChild(tagList.items.getAll()[0]);

        helpers.next(function() {
          expect(tagList.items.length).to.equal(0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('#add with before null should insert at the end', function(done) {
      var tag = new Coral.Tag();

      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(tag, null);
        var all = tagList.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[1]).to.equal(tag);
        done();
      });
    });

    it('#add is able to insert before', function(done) {
      var tag = new Coral.Tag();

      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add(tag, tagList.items.getAll()[0]);
        var all = tagList.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[0]).to.equal(tag);
        done();
      });
    });

    it('#add should also support config', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.add({
          label: {
            innerHTML: 'french'
          },
          value: 'fr'
        });
        var all = tagList.items.getAll();
        var item = all[1];
        expect(all.length).to.equal(2);
        expect(item.label.innerHTML).to.equal('french');
        expect(item.value).to.equal('fr');
        expect(item.tagName).to.equal('CORAL-TAG');
        done();
      });
    });

    it('should add a tag with the right role', function(done) {
      var eventSpy = sinon.spy();
      var tag = new Coral.Tag();

      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.on('coral-collection:add', eventSpy);
        tagList.items.add(tag);

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:add should be called once');
          expect(eventSpy.args[0][0].detail.item.tagName).to.equal('CORAL-TAG');
          expect(eventSpy.args[0][0].detail.item.$).to.have.attr('role', 'option');
          expect(tagList.items.length).to.equal(2);
          expect(tagList.$.children()).to.have.attr('role', 'option');
          done();
        });
      });
    });

    it('should remove a tag and remove its specific attributes tied to TagList', function(done) {
      var eventSpy = sinon.spy();

      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.on('coral-collection:remove', eventSpy);
        tagList.items.remove(tagList.items.getAll()[0]);

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove should be called once');
          expect(eventSpy.args[0][0].detail.item.tagName).to.equal('CORAL-TAG');
          expect(eventSpy.args[0][0].detail.item.$).to.not.have.attr('role', 'option');
          expect(eventSpy.args[0][0].detail.item.$).to.not.have.attr('aria-selected');
          expect(tagList.items.length).to.equal(0);
          done();
        });
      });
    });

    it('#getAll should be empty initially', function() {
      expect((new Coral.TagList()).items.getAll().length).to.equal(0);
    });

    it('#getAll should retrieve 1 item', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        expect(tagList.items.getAll().length).to.equal(1);
        done();
      });
    });

    it('#clear should remove all items', function(done) {
      var tagList = helpers.build(window.__html__['Coral.TagList.base.html'], function() {
        tagList.items.clear();
        expect(tagList.items.length).to.equal(0);
        done();
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.TagList.value.html'], {
        value: 'myvalue'
      });
    });
  });
});
