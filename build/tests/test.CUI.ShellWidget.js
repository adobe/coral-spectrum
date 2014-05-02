describe('CUI.ShellWidget', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('ShellWidget');
  });

  describe('option storage', function () {

    var orgStore,
        storage = {},

        el,
        widget,

    // Used to overwrite CUI.Endor.store, so we can check if
    // the correct calls are invoked from CUI.ShellWidget:
        MockStore = {

          save: function (name, value) {
            storage[name] = value;
          },

          clear: function (name) {
            delete storage[name];
          }
        };

    beforeEach(function () {
      orgStore = CUI.Endor.store;
      CUI.Endor.store = MockStore;

      el = $('<div>');
      widget = new CUI.ShellWidget({
        element: el,
        option1: 'option1-init-value',
        storeOption1: true,
        option2: 'option2-init-value',
        storeOption2: false, //will still store, for the option is present.
        option3: 'option3-init-value',
        storeOption3: 'custom-key', // will store appending the spec. key.
        storeOption4: 1 // no matching value.
      });
    });

    afterEach(function () {
      CUI.Endor.store = orgStore;
      storage = {};
    });

    it('will store a an option when store[Option] is set', function () {

      var newValue = 'new';
      widget.set('option1', newValue);

      expect(storage.hasOwnProperty('ShellWidget.option1')).to.be.true;
      expect(storage['ShellWidget.option1']).to.eql(newValue);
    });

    it('will clear a stored option when value is set undefined', function () {

      var newValue = 'new';
      widget.set('option2', newValue);
      expect(storage['ShellWidget.option2']).to.eql(newValue);

      widget.set('option2', undefined);
      expect(storage.hasOwnProperty('ShellWidget.option2')).to.be.false;
    });

    it('will store an option using a custom key, when given', function () {

      var newValue = 'new';
      widget.set('option3', newValue);
      expect(storage['ShellWidget.option3.custom-key']).to.eql(newValue);
    });

    it('will store an option if no init value is present', function () {

      var newValue = 'new';
      widget.set('option4', newValue);
      expect(storage['ShellWidget.option4']).to.eql(newValue);
    });

  });

});
