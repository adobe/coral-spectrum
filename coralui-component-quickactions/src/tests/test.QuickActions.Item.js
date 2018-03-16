import {helpers} from '/coralui-util/src/tests/helpers';
import {QuickActions} from '/coralui-component-quickactions';

describe('QuickActions.Item', function() {
  var item;

  beforeEach(function() {
    item = helpers.build(new QuickActions.Item());
  });

  afterEach(function() {
    item = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(QuickActions).to.have.property('Item');
    });

    it('should expose the type in an enum', function() {
      expect(QuickActions.Item).to.have.property('type');
      expect(QuickActions.Item.type.BUTTON).to.equal('button');
      expect(QuickActions.Item.type.ANCHOR).to.equal('anchor');
      expect(Object.keys(QuickActions.Item.type).length).to.equal(2);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-quickactions-item></coral-quickactions-item>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new QuickActions.Item());
    });
  });

  describe('API', function() {
    describe('#content', function() {
      it('should default to empty string', function() {
        expect(item.content.textContent).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        item.content.innerHTML = htmlContent;

        expect(item.content.innerHTML).to.equal(htmlContent);
        expect(item.innerHTML).to.equal(htmlContent);
      });
    });

    describe('#href', function() {
      it('should default to empty string', function() {
        expect(item.href).to.equal('');
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(item.icon).to.equal('');
      });

      it('should be reflected to the DOM', function() {
        item.icon = 'add';
        expect(item.getAttribute('icon')).to.equal('add');
      });

      it('should convert any value to string', function() {
        item.icon = 45;
        expect(item.icon).to.equal('45');
        expect(item.getAttribute('icon')).to.equal('45');
      });
    });

    describe('#type', function() {
      it('should default to empty button', function() {
        expect(item.type).to.equal('button');
      });

      it('should be settable', function() {
        item.type = QuickActions.Item.type.ANCHOR;
        expect(item.type).to.equal(QuickActions.Item.type.ANCHOR);
      });

      it('should ignore invalid values', function() {
        item.type = 'invalid_type';
        expect(item.type).to.equal(QuickActions.Item.type.BUTTON);
      });

      it('should be reflected to the DOM', function() {
        item.type = QuickActions.Item.type.ANCHOR;
        expect(item.getAttribute('type')).to.equal(QuickActions.Item.type.ANCHOR, 'type should be reflected');
      });
    });
  });

  describe('Events', function() {
    describe('#coral-quickactions-item:_contentchanged', function() {
      it('should be triggered when content is changed', function(done) {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_contentchanged', spy);

        // Do the update
        item.content.textContent = 'New Content';

        // we need to wait for the mutation observer to kick in
        helpers.next(function() {
          expect(spy.callCount).to.equal(1, 'spy called once after changing the content');

          done();
        });
      });
    });

    describe('#coral-quickactions-item:_hrefchanged', function() {
      it('should be triggered when icon is changed', function() {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_hrefchanged', spy);

        // Do the update
        item.href = 'http://localhost';

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });

    describe('#coral-quickactions-item:_iconchanged', function() {
      it('should be triggered when icon is changed', function() {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_iconchanged', spy);

        // Do the update
        item.icon = 'copy';

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });

    describe('#coral-quickactions-item:_typechanged', function() {
      it('should be triggered when type is changed', function() {
        var spy = sinon.spy();

        item.on('coral-quickactions-item:_typechanged', spy);

        // Do the update
        item.type = QuickActions.Item.type.ANCHOR;

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });
  });
});
