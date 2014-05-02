describe('CUI.MacApiService.util', function() {
	var singleTenantUser = {
      "info": {
        "displayName": "Sally Springheart",
        "title": "Social Marketing Manager",
        "avatar": "http://awesome/avatar.png"
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
          "orgId": "221",
          "tenantId": "",
          "active": false,
          "name": "Volkswagen",
          "avatar": ""
        },
        {
          "orgId": "357",
          "tenantId": "",
          "active": true,
          "name": "Nike Basketball - Europe West",
          "avatar": ""
        },
        {
          "orgId": "492",
          "tenantId": "",
          "active": true,
          "name": "Nike Basketball - Europe East",
          "avatar": ""
        }
      ]
    };

  it ('should return the name of the current active org for a single tenant', function(){
    var activeOrgName = CUI.MacApiService.util.getActiveOrgNameFromUser(singleTenantUser);
    expect(activeOrgName).to.eql('Volkswagen');
  });

  it ('should return the name of the current active org when there are multiple tenants', function(){
    var activeOrgName = CUI.MacApiService.util.getActiveOrgNameFromUser(multiTenantUser);
    expect(activeOrgName).to.eql('Nike Basketball - Europe West');
  });

  it ('should return the appropriate number of organizations for a given user', function(){
    expect(CUI.MacApiService.util.getNumOrganizationsFromUser(singleTenantUser)).to.eql(1);
    expect(CUI.MacApiService.util.getNumOrganizationsFromUser(multiTenantUser)).to.eql(3);
  });

  it ('should return the appropriate user avatar if it is defined', function(){
    expect(CUI.MacApiService.util.getAvatarFromUser(singleTenantUser)).to.eql('http://awesome/avatar.png');
  });

  it ('should return an empty string for a user avatar if it is not defined', function(){
    expect(CUI.MacApiService.util.getAvatarFromUser(multiTenantUser)).to.eql('');
  });

  it ('should return the current active org for a single tenant', function(){
    var activeOrg = CUI.MacApiService.util.getActiveOrgFromUser(singleTenantUser);
    expect(activeOrg).to.eql({
      "orgId": "",
      "tenantId": "",
      "active": true,
      "name": "Volkswagen",
      "avatar": ""
    });
  });

  it ('should return the appropriate active org when there are multiple tenants', function(){
    var activeOrg = CUI.MacApiService.util.getActiveOrgFromUser(multiTenantUser);
    expect(activeOrg).to.eql({
      "orgId": "357",
      "tenantId": "",
      "active": true,
      "name": "Nike Basketball - Europe West",
      "avatar": ""
    });
  });

  it ('should return the appropriate org from the orgid', function(){
    var org = CUI.MacApiService.util.getOrgFromOrgId(multiTenantUser, "492");
    expect(org).to.eql({
      "orgId": "492",
      "tenantId": "",
      "active": true,
      "name": "Nike Basketball - Europe East",
      "avatar": ""
    });
  });

  it ('should return the logout action', function(){
    var logoutAction = CUI.MacApiService.util.getActionFromUser(singleTenantUser, 'logout');
    expect(logoutAction).to.eql({
      "id": "logout",
      "url": "http://custom-logout-url",
      "text": "Sign out"
    });
  });

  it ('should return the settings action', function(){
    var settingsAction = CUI.MacApiService.util.getActionFromUser(singleTenantUser, 'settings');
    expect(settingsAction).to.eql({
      "id": "settings",
      "url": "http://custom-settings-url",
      "text": "Account Settings"
    });
  });
});