describe('CUI.Badge', function() {
	var notifications = {
    "title":"Notifications",
    "viewAll":{
      "url":"#",
      "text":"View all (0 new)"
    },
    "newNotifications":[
      {
        "html":"One"
      },
      {
        "html":"Two"
      },
      {
        "html":"Three"
      }
    ]
  };

  it ('should be defined in CUI namespace', function(){
		expect(CUI).to.have.property('Badge');
	});

	it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('badge');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="badge"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('badge').toString()).to.eql('Badge');
  });

  describe('Markup generation', function(){
    var $element,
      widget;

    beforeEach(function(){
      $element = $('<div></div>');
      widget = new CUI.Badge({element: $element});
    });

    it ('should have init classes set', function(){
      expect($element.hasClass('endor-BlackBar-item')).to.be.true;
      expect($element.hasClass('endor-Badge')).to.be.true;
    });

    it ('should create a default data-target', function(){
      expect($element.attr('data-target')).to.eql('#notifications-popover');
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

    it ('should set the initial text to 0 if there are no notifications', function(){
      expect($element.text()).to.eql('0');
    });
  });

  describe("Markup provided", function(){
    var $element,
      widget;

    beforeEach(function(){
      $element = $('' + 
        '<div href="#custom-notifications-popup" ' +
          'data-toggle="popover" ' + 
          'data-point-from="top" ' + 
          'data-align-from="left">' + 
        '</div>');
      widget = new CUI.Badge({element: $element});
    });

    it ('should not overwrite the href property for provided markup', function(){
      expect($element.attr('href')).to.eql('#custom-notifications-popup');
    });

    it ('should not overwrite the pointFrom property for provided markup', function(){
      expect($element.data('pointFrom')).to.eql('top');
    });

    it ('should not overwrite the alignFrom property for provided markup', function(){
      expect($element.data('alignFrom')).to.eql('left');
    });
  });

  describe('API', function(){
    var $element,
      widget;

    beforeEach(function(){
      $element = $('<div></div>');
      widget = new CUI.Badge({element: $element});
    });

    it ('should be initialized with 0 notifications', function(){
      expect($element.text()).to.eql('0');
    });

    it ('should have the is-empty class added by default', function(){
      expect($element.hasClass('is-empty')).to.be.true;
    });

    it ('should update the notifications when updateNotifications is called', function(){
      widget.updateNotifications(notifications);
      expect($element.text()).to.eql('3');
      expect($element.hasClass('is-empty')).to.be.false;
    });

    it ('should allow for adding a text based notification', function(){
      expect($element.text()).to.eql('0');
      widget.addNotification('Hello World');
      expect($element.text()).to.eql('1');
    });

    it ('should allow for adding an object notification', function(){
      expect($element.text()).to.eql('0');
      widget.addNotification({html:'Hello World'});
      expect($element.text()).to.eql('1');
    });

    it ('should update, add, and remove all notifications', function(){
      expect($element.text()).to.eql('0');
      widget.updateNotifications(notifications);
      expect($element.text()).to.eql('3');
      widget.addNotification('Hello World');
      widget.addNotification('Hello Again');
      expect($element.text()).to.eql('5');

      widget.removeAllNotifications();
      expect($element.text()).to.eql('0');
      expect($element.hasClass('is-empty')).to.be.true;
    });
  });

  it ('should initialize appropriately if a notifications object is passed in', function(){
    var $element = $('<div></div>'),
      widget = new CUI.Badge({element: $element, notifications: notifications});

    expect($element.hasClass('is-empty')).to.be.false;
    expect($element.text()).to.eql('3');
  });
});