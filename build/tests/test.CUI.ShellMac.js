describe('CUI.ShellMac', function() {
	it ('should be defined in the CUI namespace', function(){
		expect(CUI).to.have.property('ShellMac');
	});

	it ("should be defined on jQuery object", function(){
		var div = $('<div/>');
		expect(div).to.have.property('shellMac');
	});

	it ("should be instantiated on data-init and cui-contentloaded", function(){
		var div = $('<div data-init="shell-mac"/>');
		div.appendTo($(document).find('body'));

		$(document).trigger('cui-contentloaded');

		expect(div.data('shellMac').toString()).to.eql('ShellMac');
	});

	describe ("Public Methods", function(){
		var $element, 
			widget, 
			badgeWidget, 
			notificationsPopoverWidget, 
			notifications = {newNotifications:[]};

		beforeEach(function() {
			$element = $('<div></div>');
			widget = new CUI.ShellMac({element: $element});
		});

		it ("should update the MAC IMSSession configuration", function(){
			expect(CUI.MacApiService.hasImsSession()).to.be.false;
			widget.setHasImsSession(true);
			expect(CUI.MacApiService.hasImsSession()).to.be.true;

			//Set this back to false so that it doesn't screw up all the other test cases. 
			widget.setHasImsSession(false);
		});

		it ('should update the MAC Server configuration', function(){
			expect(CUI.MacApiService.getImsServer()).to.eql('https://marketing.adobe.com');
			widget.setImsServer('http://example.com');
			expect(CUI.MacApiService.getImsServer()).to.eql('http://example.com');
		});

		it ('should update the MAC active org id configuration', function(){
			expect(CUI.MacApiService.getActiveOrgId()).to.eql(null);
			widget.setActiveOrgId('000023@adobe.com');
			expect(CUI.MacApiService.getActiveOrgId()).to.eql('000023@adobe.com');
		});

		it ('should update the MAC locale configuration', function(){
			expect(CUI.MacApiService.getLocale()).to.eql('en_US');
			widget.setLocale('es_ES');
			expect(CUI.MacApiService.getLocale()).to.eql('es_ES');
		});

		it ('should update the MAC search product configuration', function(){
			expect(CUI.MacApiService.getSearchProduct()).to.eql('mcloud');
			widget.setSearchProduct('analytics');
			expect(CUI.MacApiService.getSearchProduct()).to.eql('analytics');
		});

		it ('should update the badge and the notifications popup when addNotification is called', function(){
			badgeWidget = new CUI.Badge({
				element: $('<div></div>'),
				notifications: notifications
			});

			notificationsPopoverWidget = new CUI.NotificationsPopover({
				element: $('<div></div>'),
				notifications: notifications
			});

			expect(badgeWidget.$element.text()).to.eql('0');
			expect($(notificationsPopoverWidget.$element.find('.endor-List-item')[0]).text()).to.eql('You have no new notifications');

			widget.addNotification('First Notification');
			expect(badgeWidget.$element.text()).to.eql('1');
			expect($(notificationsPopoverWidget.$element.find('.endor-List-item')[0]).text()).to.eql('First Notification');			
		});
	});
});