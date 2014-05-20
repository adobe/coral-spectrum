describe('CUI.NotificationsPopover', function() {
	it ('should be defined in CUI namespace', function(){
		expect(CUI).to.have.property('NotificationsPopover');
	});

	it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('notificationsPopover');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="notifications-popover"/>');
    div.appendTo($(document.body));

    $(document).trigger('cui-contentloaded');

    expect(div.data('notificationsPopover').toString()).to.eql('NotificationsPopover');
  });

  describe('Markup Generation', function(){
    var $element,
      widget;

    beforeEach(function(){
      $element = $('<div></div>');
      widget = new CUI.NotificationsPopover({element: $element});
    });

    it ('should add the coral-Popover class', function(){
      expect($element.hasClass('coral-Popover')).to.be.true;
    });

    it ('should add a child element with a class of endor-List', function(){
      expect($element.find('.endor-List').length).to.eql(1);
    });

    it ('should add a label that indicates 0 notifications when there are none', function(){
      expect($($element.find('.endor-List-item')[0]).text()).to.eql('You have no new notifications');
    });

    it ('should not have more than a single item in the list. This includes a button to view all notifications.', function(){
      expect($element.find('.endor-List-item').length).to.eql(1);
    });

    it ('should not generate a view all button if it is not in the data', function(){
      widget.updateNotifications({
        "newNotifications":[
          {
            "html":"One"
          },
          {
            "html":"Two"
          }
        ]    
      });

      expect($element.find('.endor-List-item').length).to.eql(2);
    });

    it ('should generate a view all button when in the data', function(){
      widget.updateNotifications({
        "newNotifications":[
          {
            "html":"One"
          },
          {
            "html":"Two"
          }
        ],
        "viewAll":{
          "url":"#",
          "text":"View all (0 new)"
        }    
      });

      var listItems = $element.find('.endor-List-item');
      var lastItem = $(listItems.get(listItems.length-1));
      expect(listItems.length).to.eql(3);      
      expect(lastItem.text()).to.eql('View all (0 new)');
    });
  });

  it ("should allow for configuring the no new notifications label", function(){
    var $element = $('<div></div>');
    var widget = new CUI.NotificationsPopover({
      element: $element,
      noNewNotificationsLabel: 'No tienes nuevas notificaciones'
    });

    expect($element.find('.endor-List-item').text()).to.eql('No tienes nuevas notificaciones');
  });

  describe('API', function(){
    var $element,
      widget;

    beforeEach(function(){
      $element = $('<div></div>');
      widget = new CUI.NotificationsPopover({element: $element});
    });

    it ("should initialize with the zero notification label", function(){
      expect($($element.find('.endor-List-item')[0]).text()).to.eql('You have no new notifications');
    });

    it ('should add both a text and object notification', function(){
      widget.addNotification('First Notification');
      expect($element.find('.endor-List-item').length).to.eql(1);

      widget.addNotification({html:'Second Notification'});
      expect($element.find('.endor-List-item').length).to.eql(2);

      widget.addNotification('Third Notification');
      expect($element.find('.endor-List-item').length).to.eql(3);
    });

    it ('should update all notifications instead of adding to them when updateNotifications is called', function(){
      widget.addNotification('First');
      widget.addNotification('Second');
      expect($element.find('.endor-List-item').length).to.eql(2);

      widget.updateNotifications({
        newNotifications: [
          {html:"Awesome"},
          {html:"Awesomer"},
          {html:"Awesomest"},
          {html:"Cool Beans"},
          {html:"Cooler Beans"}
        ]
      });

      expect($element.find('.endor-List-item').length).to.eql(5);
    });

    it ('should allow remove all notifications', function(){
      widget.addNotification('First');
      widget.addNotification('Second');
      expect($element.find('.endor-List-item').length).to.eql(2);

      widget.removeAllNotifications();
      expect($($element.find('.endor-List-item')[0]).text()).to.eql('You have no new notifications');     
    });
  });
});