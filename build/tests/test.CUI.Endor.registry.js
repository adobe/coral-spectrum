var obj1 = { _isSingleton: true, toString: function () {
      return '1';
    } },
    obj2 = { _isSingleton: true },
    obj3 = { _isSingleton: false, toString: function () {
      return '3';
    } },
    obj4 = { _isSingleton: false },
    registry = CUI.Endor.registry;

describe('CUI.Endor.registry', function () {

  afterEach(function () {
    CUI.Endor.registry.reset();
  });

  it('should be defined', function () {
    expect(registry).to.be.defined;
  });

  it('should register singleton correctly', function () {
    expect(registry.has('1')).to.be.false;
    registry.register(obj1);
    expect(registry.has('1')).to.be.true;
    expect(registry.get('1')).to.equal(obj1);
  });

  it('should unregister correctly', function () {
    registry.unregister(obj1);
    expect(registry.has('1')).to.be.false;
  });

  it('should callback when key resolves', function () {

    var self = this;
    var callback = sinon.spy(function (instance, key) {
      expect(key).to.eql('1');
      expect(instance).to.equal(obj1);
      expect(this).to.equal(self);
    });

    registry.resolve('1', callback, { scope: self });
    expect(callback.called).to.be.false;
    registry.register(obj1);
    expect(callback.called).to.be.true;
  });

  it('should NOT callback when cancelled', function () {

    var self = this;
    var callback = sinon.spy(function () {
    });

    var cancel = registry.resolve('1', callback, { scope: self });
    expect(callback.called).to.be.false;
    cancel();
    registry.register(obj1);
    expect(callback.called).to.be.false;
  });

  it('should continue to trigger callback when "once" is false (default)', function () {

    var self = this;
    var callback = sinon.spy(function (instance, key) {
      expect(key).to.eql('1');
    });

    registry.resolve('1', callback);
    expect(callback.called).to.be.false;
    registry.register(obj1);
    expect(callback.called).to.be.true;

    // Callback should continue to trigger:
    registry.unregister(obj1);
    expect(callback.callCount).to.eql(2);
    registry.register(obj1);
    expect(callback.callCount).to.eql(3);
  });

  it('should trigger callback only "once" when the "once" option is set', function () {

    var self = this;
    var callback = sinon.spy(function (instance, key) {
      expect(key).to.eql('1');
    });

    registry.resolve('1', callback, { once: true });
    expect(callback.called).to.be.false;

    registry.register(obj1);
    expect(callback.called).to.be.true;

    // Callback should not continue to trigger:
    registry.unregister(obj1);
    expect(callback.callCount).to.eql(1);
    registry.register(obj1);
    expect(callback.callCount).to.eql(1);
  });

  it('should register with a custom key', function () {
    var key = registry.register(obj1, 'key');
    expect(key).to.eql('key');
    expect(registry.has('key')).to.be.true;
    expect(registry.get('key')).to.equal(obj1);
  });

  it('should generate a key when isString is missing', function () {
    var key = registry.register(obj2);
    expect(key).to.contain('coral');
  });

  it('should keep a list of instances when ._isSingleton is false', function(){
    var key = registry.register(obj4);
    var instances = registry.get(key);
    expect(instances).to.be.an.array;
    expect(instances.length).to.eql(1);
  });

  it('should keep a list of instances when ._isSingleton is false, and toString is defined', function(){
    var key = registry.register(obj3);
    var instances = registry.get(key);
    expect(instances).to.be.an.array;
    expect(instances.length).to.eql(1);
  });

  it('should callback with a list of instances when ._isSingleton is false', function(){
    var self = this;
    var callback = sinon.spy(function (instance, key) {
      expect(instance).to.be.an.array;
      expect(key).to.eql('3');
    });

    registry.resolve('3', callback);
    expect(callback.called).to.be.false;

    registry.register(obj3);
    expect(callback.callCount).to.eql(1);
  });
});
