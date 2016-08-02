describe('Coral.QuickActions.Item', function() {
  'use strict';

  var item;

  beforeEach(function() {
    item = new Coral.QuickActions.Item();
    helpers.target.appendChild(item);
  });

  afterEach(function() {
    item = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.QuickActions).to.have.property('Item');
    });

    it('should expose the type in an enum', function() {
      expect(Coral.QuickActions.Item).to.have.property('type');
      expect(Coral.QuickActions.Item.type.BUTTON).to.equal('button');
      expect(Coral.QuickActions.Item.type.ANCHOR).to.equal('anchor');
      expect(Object.keys(Coral.QuickActions.Item.type).length).to.equal(2);
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

      it('should not be settable', function() {
        item.content = null;
        expect(item.content).not.to.be.null;
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
        expect(item.$).to.have.attr('icon', 'add');
      });

      it('should convert any value to string', function() {
        item.icon = 45;
        expect(item.icon).to.equal('45');
        expect(item.$).to.have.attr('icon', '45');
      });
    });

    describe('#type', function() {
      it('should default to empty button', function() {
        expect(item.type).to.equal('button');
      });

      it('should be settable', function() {
        item.type = Coral.QuickActions.Item.type.ANCHOR;
        expect(item.type).to.equal(Coral.QuickActions.Item.type.ANCHOR);
      });

      it('should ignore invalid values', function() {
        item.type = 'invalid_type';
        expect(item.type).to.equal(Coral.QuickActions.Item.type.BUTTON);
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
        item.type = Coral.QuickActions.Item.type.ANCHOR;

        expect(spy.callCount).to.equal(1, 'spy called once after changing the icon');
      });
    });
  });
});
