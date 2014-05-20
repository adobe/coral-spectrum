describe('CUI.NavigationView', function () {
  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('NavigationView');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="navigation-view"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('navigationView').toString()).to.eql('NavigationView');
  });

  describe('JSON Menus', function () {
    var element, widget;

    beforeEach(function () {
      element = $('<div data-init="navigation-view" data-json-url="data/nav-menu-full.json"></div>');
      widget = new CUI.NavigationView({
        element: element,
        jsonData: {"name": "menuMain", "backButtonLink":"https://marketing.adobe.com", "backButtonLabel":"Adobe Marketing Cloud", "children": [
          {"name": "Boards", "url": "#"},
          {"name": "Feed", "url": "#", "selected": true},
          {"name": "Assets", "url": "#"},
          {"name": "Analytics", "icon": "coral-Icon--adobeAnalytics", "children": [
            {"name": "Reports & Analytics", "children": []},
            {"name": "Ad Hoc Analysis", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=dsc&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
            {"name": "Data Workbench", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=suite&redirect_command=Insight.Main&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
            {"name": "Report Builder", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=suite&redirect_command=Tools.GetReportBuilder&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
            {"name": "Data Warehouse", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=suite&redirect_command=DataWarehouse.GetRequestReport&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
            {"name": "Admin Tools", "icon": "", "children": [
              {"name": "Admin Tools Home", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=am&redirect_command=Main.Index&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
              {"name": "Report Suites", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=am&redirect_command=ReportSuite.Index&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
              {"name": "User Management", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=am&redirect_command=Permissions.Index&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
              {"name": "Classification Importer", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=suite&redirect_command=Saint.GetDownloadTemplate&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
              {"name": "Classification Rule Builder", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=suite&redirect_command=SaintRules.Rulesets&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"},
              {"name": "Data Sources", "url": "https:\/\/acc-sc2.vm410.dev.ut1.omniture.com\/p\/suite\/1.3\/index.html?a=Product.SwitchProduct&product_id=suite&redirect_command=DataSource.Manager&ssSession=10ccdf065d51b7e14c3c0f7fb0801338&jpj=34529811653071"}
            ]}
          ]},
          {"name": "Experience Manager", "icon": "coral-Icon--adobeExperienceManager", "children": [
            {"name": "Overview", "url": "#"}
          ]},
          {"name": "Media Optimizer", "icon": "coral-Icon--adobeMediaOptimizer", "children": []},
          {"name": "Social", "icon": "coral-Icon--adobeSocial", "children": [
            {"name": "Overview", "url": "#"},
            {"name": "Analytics", "children": []},
            {"name": "Publish", "children": []},
            {"name": "Applications", "url": "#"},
            {"name": "Moderation", "url": "#"},
            {"name": "Settings", "url": "#"}
          ]},
          {"name": "Target", "icon": "coral-Icon--adobeTarget", "children": []}
        ]}
      });
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it("should create a top-level navigation component", function () {
      expect(element.find('.coral-ColumnView--navigation').length).to.eql(1);
    });

    it('should create a single base navigation column', function () {
      expect(element.find('.coral-ColumnView-column').length).to.eql(1);
    });

    it('should navigate to the next menu when clicking on an item with children', function (wait) {
      var initialMenu = element.find('.coral-ColumnView-column'),
          embeddedMenuButton = $(initialMenu.find('.coral-ColumnView-item--hasChildren')[0]);

      //Simulate a click event.
      embeddedMenuButton.click();

      if (window.requestAnimationFrame){
        setTimeout(function(){
          expect(initialMenu.get(0)).not.to.eql(element.find('.coral-ColumnView-column.is-active').get(0));  
          wait();
        }, 500);  
      } else {
        expect(initialMenu.get(0)).not.to.eql(element.find('.coral-ColumnView-column').get(0));
        wait();
      }
    });

    it('should only have a single active column', function (wait) {
      var initialMenu = element.find('.coral-ColumnView-column'),
          embeddedMenuButton = $(initialMenu.find('.coral-ColumnView-item--hasChildren')[0]);

      //Simulate a click event.
      embeddedMenuButton.click();

      if (window.requestAnimationFrame){
        setTimeout(function(){
          expect(element.find('.coral-ColumnView-column.is-active').length).to.eql(1);
          wait();
        }, 500);
      } else {
        expect(element.find('.coral-ColumnView-column.is-active').length).to.eql(1);
        wait();
      }
    });

    it('should navigate back to the same menu when clicking a back button', function () {
      var initialMenu = element.find('.coral-ColumnView-column'),
          embeddedMenuButton = $(initialMenu.find('.coral-ColumnView-item--hasChildren')[0]);

      //Simulate a click event.
      embeddedMenuButton.click();

      var newMenu = element.find('.coral-ColumnView-column'),
          backBtn = newMenu.find('.coral-ColumnView-item--back');

      backBtn.click();

      newMenu = element.find('.coral-ColumnView-column');

      expect(initialMenu.get(0)).to.be(newMenu.get(0));
    });

    it ('should create a back button link to another page if one is provided through JSON', function() {
      var initialMenu = element.find('.coral-ColumnView-column'),
        backButtonLink = initialMenu.find('.coral-ColumnView-item--back');

      expect(backButtonLink.length).to.eql(1);
      expect(backButtonLink.text()).to.eql('Adobe Marketing Cloud');
    });

    it ('should not attempt to navigate to the root menu if the root menu is already selected.', function(wait){
      var initialMenu = element.find('.coral-ColumnView-column'), newMenu;
      widget.navigateHome();
      if (window.requestAnimationFrame){
        setTimeout(function(){
          expect(initialMenu.get(0)).to.eql(element.find('.coral-ColumnView-column.is-active').get(0)); 
          wait();
        }, 500);  
      } else {
        expect(initialMenu.get(0)).to.eql(element.find('.coral-ColumnView-column.is-active').get(0));
        wait();
      }
    });
  });
});