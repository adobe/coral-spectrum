/* global OM */
/* global Event */
/* global adobe */
/* jshint devel:true */
(function($){
	if (window.OM && OM.Config){
		$.noConflict();
	}

	CUI.Shell.COMPACT_WINDOW_WIDTH_BOUNDARY = 1300;

	$(document).on('click', '.coral-Button--betaFeedback', function(){
		console.log('inside on beta feedback click');
		if ($("#beta_feedback_iframe").length === 0) {
			var betaFeedbackConfig = (window.OM && OM.Config) ? OM.Config.betaFeedbackConfig : adobe.analytics.betaFeedbackConfig;
			var p = "?",
				css,
				url = betaFeedbackConfig.betaFeedBackFormUrl,
				iframe;

			p += "&project=AN";
			p += "&environment=";

			for(var name in betaFeedbackConfig.betaFeedBackData)
			{
				if (betaFeedbackConfig.betaFeedBackData.hasOwnProperty(name))
				{
					p += name + ": " + betaFeedbackConfig.betaFeedBackData[name] + ", ";
				}
			}

			css = "width: 100%; height: 100%; background-color: transparent; border: none; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 30000;";

			iframe = $("<iframe frameborder='0' src='" + url + encodeURI(p) + "' id='beta_feedback_iframe' style='" + css + "'/>");

			$("body").append(iframe);

			$(window).on("message", function messageHandler(e) {
				e = e.originalEvent;
				if (e.source == iframe[0].contentWindow) {
					var data = JSON.parse(e.data);
					switch (data.type) {
						case "closed":
							iframe.remove();
							$(window).off("message", messageHandler);
							break;
					}
				}
			});
		}
	});

	//Dispatch the jQuery event as a prototype event.
	$(document).on('report-suite-changed', function(e, rsid){
		if ( window.Prototype ) {
			Event.fire(window.document, 'jq:report-suite-changed', {
				rsid: rsid,
				initialSuite: e.initialSuite
			});
		}
	});

	//Close the more popup when you click on one of the items.
	$(document).on('click', '#more-popup .endor-List-item', function(){
		$('#more-popup').data('popover').hide();
	});

	window.adobe = window.adobe || {};
	adobe.manuallyBootstrapShell = function(){
		/**
		 * Initialize Shell directly and don't wait for the cui-contentloaded.data event.
		 */

		CUI.Page.init($('[data-manual-init~=page]'));
		CUI.ShellMac.init($('[data-manual-init~=shell-mac]'));
		CUI.Crumbs.init($('[data-manual-init~=crumbs]'));
		CUI.BreadcrumbBar.init($('[data-manual-init~=breadcrumb-bar]'));

		//Outer rail
		CUI.OuterRail.init($('[data-manual-init~=outer-rail]'));
		CUI.Brand.init($('[data-manual-init~=brand]'));
		CUI.NavigationView.init($('[data-manual-init~=navigation-view]'));

		//BlackBar and BlackBar components
		CUI.BlackBar.init($('[data-manual-init~=black-bar]'));
		CUI.OuterRailToggle.init($('[data-manual-init~=outer-rail-toggle]'));
		CUI.Badge.init($('[data-manual-init~=badge]'));
		CUI.UserProfile.init($('[data-manual-init~=user-profile]'));
		CUI.HelpPopover.init($('[data-manual-init~=help-popover]'));
		CUI.NotificationsPopover.init($('[data-manual-init~=notifications-popover]'));
		CUI.UserAccountPopover.init($('[data-manual-init~=user-account-popover]'));

		CUI.ActionBar.init($('[data-manual-init~=action-bar]'));
		CUI.InnerRail.init($('[data-manual-init~=inner-rail]'));
		CUI.InnerRailToggle.init($('[data-manual-init~=inner-rail-toggle]'));
		CUI.ReportSuiteSelector.init($('[data-manual-init~=report-suite-selector]'));
	};
}(jQuery));