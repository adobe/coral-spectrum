describe('Class', function() {
  it('should be defined in global namespace', function() {
    window.should.have.property('Class');
  });
  
  describe('Base methods', function() {
    var MyClass = new Class();
    
    describe('the Class object', function() {
      it('should have extend method', function() {
        MyClass.extend.should.be.a('function');
      });
    });
    
    describe('an instance', function() {
      it('should have destruct method', function() {
        var myInstance = new MyClass();

        myInstance.destruct.should.be.a('function');
      });
    
      it('should have bind method', function() {
        var myInstance = new MyClass();

        myInstance.bind.should.be.a('function');
      });

      it('should have inherited method', function() {
        var myInstance = new MyClass();

        myInstance.inherited.should.be.a('function');
      });
    }); 
  });
  
  describe('toString()', function() {
    describe('if descriptor.toString is a String', function() {
      var MyClass = new Class({
        toString: 'MyClass'
      });
      
      it('should return the string on the Class object', function() {
        MyClass.toString().should.equal('MyClass');
      });
      
      it('should return the string on the instance', function() {
        var myInstance = new MyClass();
        myInstance.toString().should.equal('MyClass');
      });
    });
    
    
    describe('if descriptor.toString is a Function', function() {
      var MyClass = new Class({
        toString: function() {
          return 'MyClass'
        }
      });

      it('should return the string on the Class object', function() {
        MyClass.toString().should.equal('MyClass');
      });

      it('should return the string on the instance', function() {
        var myInstance = new MyClass();
        myInstance.toString().should.equal('MyClass');
      });
    });
  });
  
  describe('Lifecycle', function() {
    
    var Parent = new Class({
      construct: function() {
        this.parentConstructed = true;
        this.lastConstructed = 'parent';
      },
      destruct: function() {
        this.parentConstructed = false;
        this.lastDestructed = 'parent';
      }
    });

    var Child = Parent.extend({
      construct: function() {
        this.childConstructed = true;
        this.lastConstructed = 'child';
      },
      destruct: function() {
        this.childConstructed = false;
        this.lastDestructed = 'child';
      }
    });
    
    describe("Construction", function() {
      it("should result in parent constructor being called first", function() {
        var kid = new Child();
        kid.parentConstructed.should.be.true; // parent constructor ran
        kid.childConstructed.should.be.true; // child constructor ran
        kid.lastConstructed.should.equal('child'); // child constructor ran last
      });
    });
    
    describe("Destruction", function() {
      it("should result in parent destructor being called last", function() {
        var kid = new Child();
        kid.destruct();
        kid.parentConstructed.should.be.false; // parent destructor ran
        kid.childConstructed.should.be.false; // child destructor ran
        kid.lastDestructed.should.equal('parent'); // parent destructor ran last
      });
    });
  });
  
  describe('Inheritance', function() {
    var Parent = new Class({
      a: function() { return 'a'; },
      b: function() { return 'b'; }
    });
    
    var Child = Parent.extend({
      a: function() { 
        var parentReturnVal = this.inherited(arguments);
        return parentReturnVal+'1';
      },
      
      b: function() { return 'b1'; }
    });
    
    it('should allow calling of superclass methods with inherited()', function() {
      var kid = new Child();
      kid.a().should.equal('a1');
    });
    
    it('should call of overridden methods on childmost class', function() {
      var kid = new Child();
      kid.b().should.equal('b1');
    });
    
    it('should throw when extending an non-truthy thing', function() {
      (function extendUndefined() {
        var MyClass = new Class({
          extend: undefined
        });
      }).should.throw(Class.NonTruthyExtendError);
    });
    
    it('should throw when calling inherited() with no superclass method by the same name', function() {
      var MyClass = new Class({
        myFunc: function() {
          this.inherited(arguments);
        }
      });
      var myInstance = new MyClass();
      
      (function callInherited() {
        myInstance.myFunc();
      }).should.throw(Class.InheritedMethodNotFoundError);
    });
    
    it('should throw when calling inherited() with non-class function', function() {
      var MyClass = new Class();
      var myInstance = new MyClass();
      
      (function callInherited() {
        myInstance.inherited.call(myInstance, arguments);
      }).should.throw(Class.MissingCalleeError);
    });
    
  });
  
  
  describe('Polyfills', function() {
    describe('Function.bind', function() {
      (function bindArray() {
        Function.prototype.bind.call([], window);
      }).should.throw(TypeError);
    });
    
    describe('Object.create', function() {
      // TODO: figure out how to test?
    });
  });
});
