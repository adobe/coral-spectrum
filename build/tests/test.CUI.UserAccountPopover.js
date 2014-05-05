describe('CUI.UserAccountPopover', function() {
	it ('should be defined in CUI namespace', function(){
		expect(CUI).to.have.property('UserAccountPopover');
	});

	it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('userAccountPopover');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="user-account-popover"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('userAccountPopover').toString()).to.eql('UserAccountPopover');
  });

  describe('Markup Generation', function(){
    var $element,
      widget,
      singleTenantUser = {
        "info": {
          "displayName": "Sally Springheart",
          "title": "Social Marketing Manager",
          "avatar": ""
        },
        "actions": [
          {
            "id": "logout",
            "url": "http://custom-logout-url",
            "text": "Sign out"
          },
          {
            "id": "settings",
            "url": "http://custom-settings-url",
            "text": "Account Settings"
          }
        ],
        "organizations": [
          {
            "orgId": "",
            "tenantId": "",
            "active": true,
            "name": "Volkswagen",
            "avatar": ""
          }
        ]
      },
      multiTenantUser = {
        "info": {
          "displayName": "Sally Springheart",
          "title": "Social Marketing Manager",
          "avatar": "",
          "disableEditAvatar": true
        },
        "actions": [
          {
            "id": "logout",
            "url": "#",
            "text": "Sign out"
          },
          {
            "id": "settings",
            "url": "#",
            "text": "Account Settings"
          }
        ],
        "organizations": [
          {
            "orgId": "",
            "tenantId": "",
            "active": true,
            "name": "Volkswagen",
            "avatar": ""
          },
          {
            "orgId": "",
            "tenantId": "",
            "active": false,
            "name": "Nike Basketball - Europe West",
            "avatar": ""
          },
          {
            "orgId": "",
            "tenantId": "",
            "active": true,
            "name": "Nike Basketball - Europe East",
            "avatar": ""
          }
        ]
      };

    beforeEach(function(){
      $element = $('<div></div>');
      widget = new CUI.UserAccountPopover({
        element: $element
      });
    });

    it ('should add the coral-Popover class', function(){
      expect($element.hasClass('coral-Popover')).to.be.true;
    });

    it ('should add a child element with a class of endor-List', function(){
      expect($element.find('.endor-List').length).to.eql(1);
    });

    it ('should add a loader to the container if there is no user', function(){
      expect($element.find('.coral-Wait').length).to.eql(1);
    });

    it ('should remove the loader when a valid user object is added', function(){
      widget.updateUser(singleTenantUser);
      expect($element.find('.coral-Wait').length).to.eql(0);
    });

    it ('should generate a default avatar if there is no avatar', function(){
      widget.updateUser(singleTenantUser);
      expect($element.find('.coral-Icon--user').length).to.eql(1);
      expect($element.find('img').length).to.eql(0);
    });

    it ('should generate an avatar if one is defined in the user object', function(){
      singleTenantUser.info.avatar = "/examples/shell-mac/images/user/avatar.png";
      widget.updateUser(singleTenantUser);
      expect($element.find('.coral-Icon--user').length).to.eql(0);
      expect($element.find('img').length).to.eql(1);
    });

    it ('should generate a settings button with the appropriate url', function(){
      widget.updateUser(singleTenantUser);
      var settingsBtn = $element.find('.coral-Icon--gear');
      expect(settingsBtn.length).to.eql(1);
      expect(settingsBtn.attr('href')).to.eql('http://custom-settings-url');
    });

    it ('should generate block with the class of endor-Account-data', function(){
      widget.updateUser(singleTenantUser);
      expect($element.find('.endor-Account-data').length).to.eql(1);
    });

    it ('should generate the user account name, user title, and tenant within the endor-Account-data block for a single tenant', function(){
      widget.updateUser(singleTenantUser);
      var acctData = $element.find('.endor-Account-data');
      expect(acctData.find('.endor-Account-name').length).to.eql(1);
      expect(acctData.find('.endor-Account-caption').length).to.eql(2);
    });

    it ('should not generate the tenant name within the endor-Account-data block when there are multiple tenants', function(){
      widget.updateUser(multiTenantUser);
      var acctData = $element.find('.endor-Account-data');
      expect(acctData.find('.endor-Account-name').length).to.eql(1);
      expect(acctData.find('.endor-Account-caption').length).to.eql(1);
    });

    it ('should generate a list of interactive tenant items when there are multiple tenants', function(){
      widget.updateUser(multiTenantUser);
      expect($element.find('.endor-list-item--tenant').length).to.eql(3);
    });

    it ('should generate a logout button with the configuration passed into the logout action', function(){
      widget.updateUser(singleTenantUser);
      var logoutBtn = $element.find('.endor-Account-logout');
      expect(logoutBtn.length).to.eql(1);
      expect(logoutBtn.text()).to.eql("Sign out");
    });
  });
});