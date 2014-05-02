describe('CUI.UserProfile', function() {
  it ('should be defined in CUI namespace', function(){
		expect(CUI).to.have.property('UserProfile');
	});

	it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('userProfile');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="user-profile"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('userProfile').toString()).to.eql('UserProfile');
  });

  describe('Markup generation', function(){
    var $element,
      $widget;

    beforeEach(function(){
      $element = $('<div></div>');
      $widget = new CUI.UserProfile({
        element: $element
      });
    });

    it ("should add the init classes", function(){
      expect($element.hasClass('endor-BlackBar-item')).to.be.true;
      expect($element.hasClass('endor-UserProfile')).to.be.true;
    });

    it ('should create a default href', function(){
      expect($element.attr('href')).to.eql('#user-account-popover');
    });

    it ('should set a popover data toggle attribute', function(){
      expect($element.data('toggle')).to.eql('popover');
    });

    it ('should set up the popover with a data point from the bottom', function(){
      expect($element.data('pointFrom')).to.eql('bottom');
    });

    it ('should align the popover from the right by default', function(){
      expect($element.data('alignFrom')).to.eql('right');
    });
  });

  describe('Single Tenant Markup generation', function(){
    var $element,
      $widget;

    beforeEach(function(){
      $element = $('<div></div>');
      $widget = new CUI.UserProfile({
        element: $element,
        user: {
          "info": {
            "displayName": "Sally Springheart",
            "title": "Social Marketing Manager",
            "avatar": ""
          },
          "actions": [
            {
              "id": "logout",
              "url": "",
              "text": "Sign out"
            },
            {
              "id": "settings",
              "url": "",
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
        }
      });
    });

    it ('should not add a tenant label for a single tenant', function(){
      expect($element.find('.endor-UserProfile-tenant').text()).to.eql('');
    });

    it ('should add an avatar if updated with a user', function(){
      var $avatar = $element.find('.endor-UserProfile-avatar');
      //Expect no icon initially.
      expect($avatar.html()).to.eql('<i class="coral-Icon coral-Icon--sizeM coral-Icon--user"></i>');
      //Update the icon.
      $widget.updateAvatar('images/user/avatar.png');
      expect($avatar.html()).to.eql('<img src="images/user/avatar.png" alt="avatar">');
    });
  });

  describe('Multi-Tenant Markup generation', function(){
    var $element = $('<div></div>');
    var $widget = new CUI.UserProfile({
      element: $element,
      user: {
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
      }
    });

    it ('should add a tenant label when there are multiple tenants', function(){
      expect($element.find('.endor-UserProfile-tenant').text()).to.eql('Volkswagen');
    });
  });
});