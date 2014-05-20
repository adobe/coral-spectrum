
// Report Suite Selector

(function ($) {
	CUI.ReportSuiteSelector = new Class({
		toString: 'ReportSuiteSelector',
		extend: CUI.Widget,
		defaults: {
			// The URL this component should use to get report suites.
			reportSuiteListUrl: null,
			// The URL this component should POST to to change report suite.
			changeReportSuitesEndpoint: null,
			// If true, this component will POST a form to the changeReportSuitesEndpoint.
			// If false, this component will emit a changeReportSuiteEvent.
			reloadPage: true,
			// If true, will show a confirmation dialog asking the user to confirm report suite change.
			confirm: false,
			// The report suite that should be selected when this component is initialized.
			rsid: null,
			// The l10n show all label.
			showAllLabel: "Show All",
			// The l10n search placeholder label.
			searchPlaceholderLabel: "Search Report Suites",
			// The l10n label to represent no report suites.
			noReportSuitesLabel: "No report suites.",
			// The l10n label to represent a warning that changing a report suite will cause data to be lost. 
			changeReportSuiteWarningLabel: 'Changing report suites may cause any unsaved data on the page to be lost.',
			// The l10n confirm label
			confirmLabel: 'Yes',
			// Cancel label
			cancelLabel: 'Cancel'
		},
		construct: function(options) {

			var thisWidget = this;

			// Increment selector count. This is to avoid ID collisions
			// if multiple selectors are used on the same page.
			if (CUI.ReportSuiteSelector.hasOwnProperty('count'))
				CUI.ReportSuiteSelector.count++;
			else
				CUI.ReportSuiteSelector.count = 0;

			// Build HTML elements for component.
			var ui = thisWidget._buildElements();

			// Wire up events.
			thisWidget._wireEvents();

			// Load initial report suite data and store it.
			// Pass in a callback and do the rest of the setup within it.
			thisWidget._loadData(false, function () {

				// Populate report suite list with initial data.
				thisWidget._populateList();

				// If an initial report suite was supplied, select it.
				if (thisWidget.options.rsid !== null && thisWidget._cachedReportSuiteData.length > 0) {
					// Pass in false to prevent changeSuite from reloading the page.
					// If you don't pass in false then the initial setting of report suite would
					// cause the page to refresh in an infinite loop.
					thisWidget.changeSuite(thisWidget.options.rsid, false, true);
				} else {
					ui.$triggerLink.setText("No Report Suite");
				}

				// Select the top report suite.
				ui.$selectedSuite = ui.$suiteList
					.find('li')
					.first()
					.addClass('suite-selected');

			});

		},

		// PUBLIC: Changes the currently selected report suite.
		changeSuite: function (rsid, confirmAndPost, initialSuite) {
			var thisWidget = this,
				ui = thisWidget.uiElements;

			// Put the suite change logic into a function.
			// If options.confirm is true then we'll show a modal and fire this function when the user clicks confirm.
			// If confirm is false then we will simply fire this logic immediately.
			var performChange = function() {
				if (thisWidget.selectedSuite && thisWidget.selectedSuite === rsid) {
					return;
				}
				thisWidget.selectedSuite = rsid;
				ui.$triggerLink.setText(reportSuiteData.name);
				var changeSuiteAndReload = function (rsid) {
					// Construct a form to be posted.
					var $form = $('<form>')
						.attr('method', 'POST')
						.attr('action', thisWidget.options.changeReportSuitesEndpoint)
						.appendTo('body');
					$('<input>')
						.attr('type', 'hidden')
						.attr('name', 'd_url')
						.attr('id', 'switch_destination_url')
						.val(window.btoa(location.href))
						.appendTo($form);
					$('<input>')
						.attr('type', 'hidden')
						.attr('name', 'switch_accnt')
						.val(rsid)
						.appendTo($form);

					// Submit the form, thus making a POST request to the server
					// and refreshing the page.
					$form.submit();
				};
				if (confirmAndPost !== false && CUI.ReportSuiteSelector.reloadPage !== false) {
					changeSuiteAndReload(rsid);
				} else {
					// Trigger a report-suite-changed event if we're not going to
					// reload the page.
					var suiteChangedEvent = $.Event(CUI.ReportSuiteSelector.EVENT_REPORT_SUITE_CHANGED);
					suiteChangedEvent.initialSuite = initialSuite;
					$(document).trigger(suiteChangedEvent, {
						rsid: rsid,
						changeSuiteAndReload: changeSuiteAndReload
					});
				}
			};

			// Iterate over all loaded report suites.
			for (var key in thisWidget._cachedReportSuiteData) {
				var reportSuiteData = thisWidget._cachedReportSuiteData[key];
				// Find the report suite that was selected to confirm it exists.
				if (reportSuiteData.value === rsid) {
					// If options.confirm is true then show a modal.
					if (thisWidget.options.confirm && !initialSuite) {
						// Get reference to the modal API.
						var modal = ui.$modal.data('modal');
						// If there is no modal API then no modal has been created yet.
						if (!modal)
							// Instantiate the modal.
							modal = ui.$modal.modal();
						// Set up a one-time click event on the confirm button of the modal.
						ui.$modalConfirmButton.one('click', performChange);
						// Show the modal.
						modal.show();
					} else
						// Skip modal logic and just change the suite.
						performChange();
					return;
				}
			}
			// If we've made it this far then we have no report suite that matches the
			// supplied RSID. Throw an error.
			throw new Error("Report suite \"" + rsid + "\" was specified but none were found with that RSID.");
		},
		// PRIVATE: Builds all HTML elements required. (called from construct)
		_buildElements: function () {

			// Create and add trigger link.
			var $link = $('<a>')
				.addClass('coral-ButtonGroup-item coral-Button coral-Button--secondary coral-Button--quiet coral-Button--rsidSelector')
				.attr('data-toggle', 'popover')
				.attr('data-target', '#reportSuiteSelector-' + CUI.ReportSuiteSelector.count)
				.appendTo(this.$element);

			// Helper function for updating the link text so it always includes the icon.
			// I preferred this over adding an entirely separate element to this.uiElements
			// just for updating the displayed text.
			$link.setText = function (text) {
				$link.html('<i class="endor-ActionButton-icon coral-Icon coral-Icon--data"></i>');
				$('<span class="endor-ActionButton-label">').text(text).appendTo($link);
			};

			/*** SELECTOR MARKUP ***/

			// Create and add popover container.
			var $container = $('<div>')
				.attr('data-align-from', this.options.alignFrom)
				.attr('data-point-from', this.options.pointFrom)
				.attr('id', 'reportSuiteSelector-' + CUI.ReportSuiteSelector.count)
				.addClass('coral-Popover report-suite-selector')
				.appendTo(this.$element);

			// Create list for search box list item.
			var $searchList = $('<div>')
				.addClass('endor-List')
				.appendTo($container);

			// Create endor list item for search box.
			var $searchListItem = $('<div>')
				.addClass('endor-List-item')
				.appendTo($searchList);

			var $searchFieldContainer = $('<div>')
				.addClass('searchfield')
				.appendTo($searchListItem);

			// Create container for search box and icon.
			var $searchBoxContainer = $('<div>')
				.addClass('coral-DecoratedTextfield coral-Popover-content--Textfield')
				.appendTo($searchFieldContainer);

			// Create icon.
			var $searchBoxIcon = $('<i>')
				.addClass('coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search')
				.appendTo($searchBoxContainer);

			// Add a filter input to popover.
			var $searchBox = $('<input>')
				.addClass('coral-DecoratedTextfield-input coral-Textfield')
				.attr('type', 'text')
				.attr('placeholder', this.options.searchPlaceholderLabel)
				.appendTo($searchBoxContainer);

			// Add a filter input clear button.
			var $clearButton = $('<button>')
				.addClass('coral-DecoratedTextfield-button coral-MinimalButton')
				.attr('type', 'button')
				.html('<i class="coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close">')
				.hide()
				.appendTo($searchBoxContainer);

			// Create and add a container for the report suite list.
			var $suiteList = $('<div>')
				.addClass('endor-List report-suite-list')
				.appendTo($container);

			// Create a "show all" link that only shows if the search box is empty.
			var $showAllLink = $('<a>')
				.addClass('endor-List-item show-all-link')
				.text(this.options.showAllLabel)
				.appendTo($container);
			$showAllLink.hidden = false;

			/*** MODAL MARKUP ***/

			var $modal = $('<div>')
				.addClass('coral-Modal')
				.appendTo(this.$element);

			var $modalHeader = $('<div>')
				.addClass('coral-Modal-header')
				.appendTo($modal);

			$('<i>')
				.addClass('coral-Modal-typeIcon coral-Icon coral-Icon-sizeS')
				.appendTo($modalHeader);

			$('<h2>')
				.addClass('coral-Modal-title coral-Heading coral-Heading--2')
				.text('Are you sure?')
				.appendTo($modalHeader);

			var $modalCloseButton = $('<button>')
				.attr('type', 'button')
				.attr('title', 'Close')
				.attr('data-dismiss', 'modal')
				.addClass('coral-MinimalButton coral-Modal-closeButton')
				.appendTo($modalHeader);

			$('<i>')
				.addClass('coral-Icon coral-Icon-sizeXS coral-Icon--close coral-MinimalButton-icon')
				.appendTo($modalCloseButton);

			var $modalBody = $('<div>')
				.addClass('coral-Modal-body')
				.appendTo($modal);

			var $modalText = $('<p>')
				.text(this.options.changeReportSuiteWarningLabel)
				.appendTo($modalBody);

			var $modalFooter = $('<div>')
				.addClass('coral-Modal-footer')
				.appendTo($modal);

			var $modalCancelButton = $('<button>')
				.attr('type', 'button')
				.attr('data-dismiss', 'modal')
				.addClass('coral-Button')
				.text(this.options.cancelLabel)
				.appendTo($modalFooter);

			var $modalConfirmButton = $('<button>')
				.attr('type', 'button')
				.attr('data-dismiss', 'modal')
				.addClass('coral-Button coral-Button--primary')
				.text(this.options.confirmLabel)
				.appendTo($modalFooter);

			/********************/

			// Attach elements to component for easy access.
			this.uiElements = {
				$triggerLink: $link,
				$popoverContainer: $container,
				$searchBox: $searchBox,
				$clearButton: $clearButton,
				$suiteList: $suiteList,
				$showAllLink: $showAllLink,
				$modal: $modal,
				$modalHeader: $modalHeader,
				$modalCloseButton: $modalCloseButton,
				$modalBody: $modalBody,
				$modalText: $modalText,
				$modalFooter: $modalFooter,
				$modalCancelButton: $modalCancelButton,
				$modalConfirmButton: $modalConfirmButton
			};

			return this.uiElements;

		},

		// PRIVATE: Wires events to UI elements. (called from construct)
		_wireEvents: function () {

			var thisWidget = this,
				ui = thisWidget.uiElements;

			// Declare function to see if an element is in its parent's viewport.
			var visibleY = function(childElement, parentElement){
				// Get the child element's rectangle.
				var childRectangle = childElement.getBoundingClientRect();
				// Get the parent element's rectangle.
				var parentRectangle = parentElement.getBoundingClientRect();
				// Check if the bottom of the child's rectangle is below the bottom of the parent's rectangle.
				var isBelow = childRectangle.bottom < parentRectangle.bottom;
				// Check if the top of the child's rectangle is above the top of the parent's rectangle.
				var isAbove = childRectangle.top > parentRectangle.top;
				// If the child rectangle is above or below the parent rectangle, even slightly, we consider it not visible.
				return !isBelow && !isAbove;
			};

			// Repopulate report suite list when the user stops typeing in the search for more than half a second.
			// Also allow arrow keys to scroll through list items.
			ui.$searchBox.on('keydown', function (e) {

				// Hash of key names to key codes for readability.
				var keys = {
					upArrow: 38,
					downArrow: 40,
					enter: 13,
					escape: 27
				};

				// Check which key was pressed.
				switch (e.keyCode) {
					case keys.upArrow:
						// If the selected element is not the first element...
						if (ui.$selectedSuite.index() > 0) {
							ui.$selectedSuite.removeClass('suite-selected');
							// Select previous sibling.
							ui.$selectedSuite = ui.$selectedSuite.prev();
							// If the list item is visible within the vertically scrollable viewport...
							if (!visibleY(ui.$selectedSuite[0], ui.$suiteList[0]))
								// Scroll the element into view, aligning with the top of the viewport.
								ui.$selectedSuite[0].scrollIntoView(true);
							ui.$selectedSuite.addClass('suite-selected');
						}
						break;
					case keys.downArrow:
						// If the selected element is not the last element...
						if (ui.$selectedSuite.index() < ui.$suiteList.children('li').length - 1) {
							ui.$selectedSuite.removeClass('suite-selected');
							// Select next sibling.
							ui.$selectedSuite = ui.$selectedSuite.next();
							// If the list item is visible within the vertically scrollable viewport...
							if (!visibleY(ui.$selectedSuite[0], ui.$suiteList[0]))
								// Scroll the element into view, aligning with the bottom of the viewport.
								ui.$selectedSuite[0].scrollIntoView(false);
							ui.$selectedSuite.addClass('suite-selected');
						}
						break;
					case keys.enter:
						// Prevent default because enter key press is somehow clearing the confirmation modal.
						e.preventDefault();
						// If the user presses the enter key then fire its click event.
						ui.$selectedSuite.click();
						break;
					case keys.escape:
						// If the search box has text...
						if (ui.$searchBox.val().length > 0) {
							// Clear search text by clicking clear button.
							ui.$clearButton.click();
						}
						// If the search box has no text...
						else {
							// Close entire popover.
							ui.$popoverContainer.data('popover').hide();
						}
						break;
					default:
						// If none of the above keys were pressed then re-populate the result list.
						$(this).data('delayId', setTimeout(function () {
							thisWidget._populateList();
							// Select the top report suite.
							ui.$selectedSuite = ui.$suiteList
								.find('li')
								.first()
								.addClass('suite-selected');
						}, 500));
						if ($(this).val().length > 0) {
							ui.$clearButton.show();
						} else {
							ui.$clearButton.hide();
						}
						break;
				}
			});

			// Show all report suites when "show all" is clicked.
			ui.$showAllLink.on('click', function (e) {
				e.preventDefault();
				thisWidget._loadData(true, function () {
					thisWidget._populateList();
					ui.$showAllLink.hide();
					ui.$showAllLink.hidden = true;

					// Select the top report suite.
					ui.$selectedSuite = ui.$suiteList
						.find('li')
						.first()
						.addClass('suite-selected');
				});
			});

			// Clear filter text when clear button is clicked.
			ui.$clearButton.click(function (e) {
				e.preventDefault();
				// Hide clear button.
				$(this).hide();
				// Clear filter text.
				ui.$searchBox.val('');
				// Repopulate list.
				thisWidget._populateList();
				// Select the top report suite.
				ui.$selectedSuite = ui.$suitList
					.find('li')
					.first()
					.addClass('suite-selected');
			});

			// Focus filter box when popup opens.
			ui.$popoverContainer.on('show', function (e) {
				setTimeout(ui.$searchBox.focus.bind(ui.$searchBox), 100);
			});

		},

		// PRIVATE: The raw list data is cached here.
		_cachedReportSuiteData: [],

		// PRIVATE: Load list data. If loadAll is set to true then retrieve all report suites.
		_loadData: function (loadAll, callback) {
			var thisWidget = this;

			$.ajax({
				url: thisWidget.options.reportSuiteListUrl,
				data: { limit: loadAll ? 0 : 10 }
			}).done(function (data) {
				thisWidget._cachedReportSuiteData = data;
				thisWidget._populateList();
				if (callback) callback();
			});
		},

		// PRIVATE: Populates the list of report suites.
		// (called once from construct and again from search box keydown event)
		_populateList: function () {

			var data = this._cachedReportSuiteData,
				thisWidget = this,
				ui = thisWidget.uiElements,
				searchText = ui.$searchBox.val(),
				placeholderText = ui.$searchBox.attr('placeholder'),
				isZeroOrPlaceholder = searchText.length === 0 || searchText === placeholderText;

			// If there is search text then load full data set if it hasn't been loaded already.
			// We pass in _populateList as a callback so this method will re-run after the full list is loaded.
			if (!isZeroOrPlaceholder && !ui.$showAllLink.hidden) {
				ui.$showAllLink.hide();
				ui.$showAllLink.hidden = true;
				thisWidget._loadData(true, function () {
					thisWidget._populateList();
					// Select the top report suite.
					ui.$selectedSuite = ui.$suiteList
						.find('li')
						.first()
						.addClass('suite-selected');
				});
				return;
			}

			// Empty the report suite list and rebuild it using stored data.
			ui.$suiteList.empty();
			function reportSuiteClick(e) {
				var reportSuiteData = $(this).data('reportSuiteData');
				thisWidget.changeSuite(reportSuiteData.value, thisWidget.options.reloadPage, false);
				ui.$popoverContainer.data('popover').hide();
			}

			// Only load the item into the list if there is no search text or the item matches the search text.
			if (!isZeroOrPlaceholder) {
				data = this._cachedReportSuiteData.filter(function (item) {
					var itemName = item.name.toLowerCase(),
						score = 0,
						currentChar,
						charPosition = 0,
						nextPosition;

					// Iterate over search text characters.
					for (var index = 0; index < searchText.length; index++) {
						// Get the current character.
						currentChar = searchText[index].toLowerCase();
						// If the character is a space, move on.
						if (currentChar === ' ') continue;
						// Check if current character is in the string, starting from the index of the last found character.
						nextPosition = itemName.indexOf(currentChar, index === 0 ? charPosition : charPosition + 1);
						// Calculate a score by subtracting the current character position from the next character position.
						score += (nextPosition - charPosition) * (index === 0 ? 1 : 3);
						// Set the current character position to the next character position.
						charPosition = nextPosition;
						// If the next character position is -1 then it was not found in the string so return false.
						if (charPosition === -1) return false;
					}
					// Increase the score based on string length.
					score = score + (itemName.length - charPosition);
					// Add the current score onto the current item to be used later when sorting.
					item.score = score;
					return true;
				});

				// Sort items by score.
				data.sort(function (current, next) {
					if (current.score > next.score) return 1;
					if (current.score < next.score) return -1;
					// If a is equal to be then return zero.
					return 0;
				});
			}

			// Iterate over all cached report suites and generate list item for each.
			for (var index = 0; index < data.length; index++) {
				var reportSuiteData = data[index];
				// Build list item.
				var $reportSuiteListItem = $('<li>')
					// Attach the report suite data item to the list element for later access.
					.data('reportSuiteData', reportSuiteData)
					.addClass('endor-List-item endor-List-item--interactive')
					.attr('data-rsid', reportSuiteData.value)
					.text(reportSuiteData.name)
					.appendTo(ui.$suiteList);

				$reportSuiteListItem.on('click', reportSuiteClick);
			}

			// If there are no cached report suite items then display "no report suites".
			if (data.length === 0) {
				$('<li>')
					.addClass('endor-List-item')
					.text(this.options.noReportSuitesLabel)
					.appendTo(ui.$suiteList);
			}

		}

	});

	// Static event constants.
	CUI.ReportSuiteSelector.EVENT_REPORT_SUITE_CHANGED = 'report-suite-changed';

	/*
	 * Coral jazz...
	 */
	CUI.Widget.registry.register('reportSuiteSelector', CUI.ReportSuiteSelector);

	if (CUI.options.dataAPI) {
		$(document).on("cui-contentloaded.data-api", function(e) {
			CUI.ReportSuiteSelector.init($("[data-init~=report-suite-selector]", e.target));
		});
	}
})(jQuery);
