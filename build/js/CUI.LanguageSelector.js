/* jshint devel:true */
/* global adobe */
/* global OM */
(function($){
	CUI.LanguageSelector = new Class({
		toString: 'LanguageSelector',
		extend: CUI.Widget,
		construct: function(options){
			this.$anchorLabel = $('.endor-currentLanguage');

			if (!options.languages){
				//If the languages array is null then assume that it was built server side and generate the array from the
				//DOM.
				this._buildLanguagesArrayFromDOM();
			} else {
				this._buildDOMFromLanguagesArray();
			}

			this._updateAnchorLabel(options.currentLocale);

			this._addListeners();
		},

		defaults: {
			languages: null,
			changeLocaleUrl: null,
			currentLocaleCode: 'en_US',
			currentLocale: "English"
		},

		_addListeners: function(){
			this.$element.on('click', '.coral-SelectList-item', function(event){
				var language = this._getLanguageObjectFromLocaleCode($(event.target).data('locale'));
				if (language){
					this.options.currentLocaleCode = language.localeCode;
					this.options.currentLocale = language.displayName;
					this._updateAnchorLabel(language.displayName);
					this._updateLocale(language.localeCode);
				}
				this.$element.data('popover').hide();
			}.bind(this));
		},

		_buildLanguagesArrayFromDOM: function(){
			var languages = [];
			this.$element.find('.coral-SelectList-item').each(function(){
				languages.push({
					displayName: $(this).text(),
					localeCode: $(this).data('locale')
				});
			});

			this.options.languages = languages;
		},

		_buildDOMFromLanguagesArray: function(){
			var list = this.$element.find('.coral-SelectList');
			list.empty();

			this.options.languages.forEach(function(language){
				list.append('<li class="coral-SelectList-item coral-SelectList-item--option" data-locale="' + language.localeCode + '">' + language.displayName + '</li>');
			});
		},

		_getLanguageObjectFromLocaleCode: function(locale){
			var languageObj = null;
			if (this.options.languages){
				this.options.languages.forEach(function(language){
					if (language.localeCode == locale){
						languageObj = language;
					}
				});
			}
			return languageObj;
		},

		_updateAnchorLabel: function(text){
			this.$anchorLabel.text(text);
		},

		_updateLocale: function(localeCode){
			location.href = this.options.changeLocaleUrl + '&change_locale=' + localeCode + location.hash;
		}
	});

	CUI.Widget.registry.register('languageSelector', CUI.LanguageSelector);

	if (CUI.options.dataAPI) {
		$(document).on("cui-contentloaded.data-api", function(e) {
			CUI.LanguageSelector.init($("[data-init~=language-selector]", e.target));
		});
	}
}(jQuery));