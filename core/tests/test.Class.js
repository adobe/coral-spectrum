describe('Class', function() {
  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in global namespace', function() {
      expect(window).to.have.property('Class');
    });
  });
  
  describe('Base methods', function() {
    var MyClass = new Class();
    
    describe('the Class object', function() {
      it('should have extend method', function() {
        expect(MyClass.extend).to.be.a('function');
      });
    });
    
    describe('an instance', function() {
      it('should have destruct method', function() {
        var myInstance = new MyClass();

        expect(myInstance.destruct).to.be.a('function');
      });
    
      it('should have bind method', function() {
        var myInstance = new MyClass();

        expect(myInstance.bind).to.be.a('function');
      });

      it('should have inherited method', function() {
        var myInstance = new MyClass();

        expect(myInstance.inherited).to.be.a('function');
      });
    }); 
  });
  
  describe('toString()', function() {
    describe('if descriptor.toString is a String', function() {
      var MyClass = new Class({
        toString: 'MyClass'
      });
      
      it('should return the string on the Class object', function() {
        expect(MyClass.toString()).to.equal('MyClass');
      });
      
      it('should return the string on the instance', function() {
        var myInstance = new MyClass();
        expect(myInstance.toString()).to.equal('MyClass');
      });
    });
    
    
    describe('if descriptor.toString is a Function', function() {
      var MyClass = new Class({
        toString: function() {
          return 'MyClass'
        }
      });

      it('should return the string on the Class object', function() {
        expect(MyClass.toString()).to.equal('MyClass');
      });

      it('should return the string on the instance', function() {
        var myInstance = new MyClass();
        expect(myInstance.toString()).to.equal('MyClass');
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
        expect(kid.parentConstructed).to.be.true; // parent constructor ran
        expect(kid.childConstructed).to.be.true; // child constructor ran
        expect(kid.lastConstructed).to.equal('child'); // child constructor ran last
      });
    });
    
    describe("Destruction", function() {
      it("should result in parent destructor being called last", function() {
        var kid = new Child();
        kid.destruct();
        expect(kid.parentConstructed).to.be.false; // parent destructor ran
        expect(kid.childConstructed).to.be.false; // child destructor ran
        expect(kid.lastDestructed).to.equal('parent'); // parent destructor ran last
      });
    });
  });
  
  describe('Binding', function() {
    var MyClass = new Class({
      construct: function() {
        this.bind(this.getVal);
      },
      getVal: function() {
        return this.val;
      },
      val: 'testVal'
    });
    
    it('should always execute a function bound with this.bind() in the scope of its class', function() {
      var myInstance = new MyClass();
      
      expect(myInstance.getVal.call(window)).to.equal('testVal');
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
      expect(kid.a()).to.equal('a1');
    });
    
    it('should call of overridden methods on childmost class', function() {
      var kid = new Child();
      expect(kid.b()).to.equal('b1');
    });
    
    it('should throw when extending an non-truthy thing', function() {
      expect(function extendUndefined() {
        var MyClass = new Class({
          extend: undefined
        });
      }).to.throw(Class.NonTruthyExtendError);
    });
    
    it('should throw when calling inherited() with no superclass method by the same name', function() {
      var MyClass = new Class({
        myFunc: function() {
          this.inherited(arguments);
        }
      });
      var myInstance = new MyClass();
      
      expect(function callInherited() {
        myInstance.myFunc();
      }).to.throw(Class.InheritedMethodNotFoundError);
    });
    
    it('should throw when calling inherited() with non-class function', function() {
      var MyClass = new Class();
      var myInstance = new MyClass();
      
      expect(function callInherited() {
        myInstance.inherited.call(myInstance, arguments);
      }).to.throw(Class.MissingCalleeError);
    });
    
  });
  
  
  describe('Polyfills', function() {
    describe('Function.bind', function() {
      it('should bind the execution context of a function', function() {
        var obj = {
          value1: 1
        };
        
        var func = function() {
          return this.value1;
        };
        
        var boundFunc = func.bind(obj);
        
        expect(boundFunc()).to.equal(1);
      });
      
      it('should bind arguments and always pass when called', function() {
        var func = function(arg1, arg2, arg3) {
          return arg1+arg2+arg3;
        };
        
        var boundFunc = func.bind(window, '1','2','3');
        
        expect(boundFunc()).to.equal('123');
      });
      
      it('should throw when called on a non-function', function() {
        expect(function bindArray() {
          Function.prototype.bind.call([], window);
        }).to.throw(TypeError);
      });
    });
    
    describe('Object.create', function() {
      it('should create object with passed prototype', function() {
        var arr = Object.create(Array.prototype);
        expect(arr).to.have.property('push');
      });
      
      it('should throw when called with more than more argument', function() {
        expect(function() {
          Object.create({}, {});
        }).to.throw(Error);
      });
    });
  });
});
