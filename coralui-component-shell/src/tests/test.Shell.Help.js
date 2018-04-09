import {helpers} from '../../../coralui-util/src/tests/helpers';
import {Shell} from '../../../coralui-component-shell';
import {Collection} from '../../../coralui-collection';

describe('Shell.Help', function() {
  var htmlSnippet = '<coral-shell-help></coral-shell-help>';

  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('Help');
      expect(Shell.Help).to.have.property('Item');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build(htmlSnippet);
      expect(el instanceof Shell.Help).to.equal(true);
    });

    it('should support creation from js', function() {
      var help = new Shell.Help();
      expect(help instanceof Shell.Help).to.equal(true);
    });

    it('should create a help component with predefined items', function() {
      const el = helpers.build(window.__html__['Shell.Help.base.html']);
      expect(el.items.length).to.equal(6);
    });
  
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Shell.Help.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      const el = new Shell.Help();
      el.items.add({textContent: 'Link'});
      helpers.cloneComponent(el);
    });
  });

  describe('API', function() {
    describe('#items', function() {
      it('should return the Help Menu items', function() {
        const el = helpers.build(htmlSnippet);
        expect(el.items instanceof Collection).to.equal(true);
      });

      it('Setting Help Menu items should have no effect', function() {
        const el = helpers.build(htmlSnippet);
        var items = el.items;
        
        try {
          el.items = new Collection();
        }
        catch(e) {
          expect(el.items).to.equal(items);
        }
      });
    });

    describe('#placeholder', function() {
      it('should have a placeholder attribute', function() {
        const el = helpers.build(htmlSnippet);
        expect(el.placeholder).to.equal('Search for Help');
      });

      it('should have a placeholder attribute initialized with the correct value', function() {
        const el = helpers.build('<coral-shell-help placeholder="placeholder"></coral-shell-help>');
        expect(el.placeholder).to.equal('placeholder');
      });
    });
  });

  describe('Markup', function() {
    describe('#showError()', function() {
      it('should display an Error Message on "showError" function call', function() {
        const el = helpers.build(htmlSnippet);
        var resultMessage = el._elements.resultMessage;
        var expectedResultMessage = 'Error fetching results';

        el.showError();
        expect(el._elements.resultMessage.hidden).to.equal(false);
        expect(resultMessage.querySelector('._coral-Shell-help-resultMessage-heading').textContent).to.equal(expectedResultMessage);
      });
    });

    describe('#showResults()', function() {
      it('should show search results on "showResults" function call', function() {
        var resultItems = [
          {
            'tags': [
              'Marketing Cloud',
              'Analytics',
              'Target'
            ],
            'title': 'Customer Attributes',
            'href': 'https://marketing.adobe.com/resources/help/en_US/mcloud/attributes.html'
          },
          {
            'tags': [
              'Marketing Cloud'
            ],
            'title': 'About data file and data sources for customer attributes',
            'href': 'https://marketing.adobe.com/resources/help/en_US/mcloud/crs_data_file.html'
          }
        ];

        var total = 1111;
        var allResultsURL = 'http://coral-spectrum.corp.adobe.com';

        const el = helpers.build(htmlSnippet);
        el.showResults(resultItems, total, allResultsURL);

        expect(el._elements.results.hidden).to.equal(false);
        expect(el._elements.results.lastChild.target).to.equal('_blank');
      });

      it('should display a "no results message" on "showResults" function call with an array and total = 0', function() {
        const el = helpers.build(htmlSnippet);
        el.showResults([], 0);
        var resultMessage = el._elements.resultMessage;
        var expectedResultMessage = 'No results found';

        expect(el._elements.resultMessage.hidden).to.equal(false);
        expect(resultMessage.querySelector('._coral-Shell-help-resultMessage-heading').textContent).to.equal(expectedResultMessage);
      });
    });
  });

  describe('User Interaction', function() {
    describe('search', function() {
      it('should perform a search', function() {
        var searchSpy = sinon.spy();

        const el = helpers.build(window.__html__['Shell.Help.base.html']);
        var search = el.querySelector('coral-search');
        el.on('coral-shell-help:search', searchSpy);
        search.value = 'customer';
        
        search.trigger('coral-search:submit');
  
        expect(searchSpy.called).to.equal(true);
        expect(searchSpy.args[0][0].detail.value).to.equal('customer');
        expect(el._elements.loading.hidden).to.equal(false);
      });
      

      it('it should clear loading spinner on clear button click', function() {
        const el = helpers.build(window.__html__['Shell.Help.base.html']);
        var search = el.querySelector('coral-search');

        search.value = 'customer';
        
        search.querySelector('[handle=clearButton]').click();
        
        expect(el._elements.loading.hidden).to.equal(true);
      });
    });
  });
});
