(function ($) {
  CUI.Rail = new Class(/** @lends CUI.Rail# */{
    toString: 'Rail',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc this widget extends the rail to the following features
        - enables foldable sections
        - optionally pull-to-refresh functionality for the rail

      <div id="myRail" class="rail">
        <div class="pull-to-refresh">
          <div class="icon"></div>
          <div class="message">
            <i class="arrow"></i>
            <i class="spinner large"></i>
            <span class="pull">Pull to refresh</span>
            <span class="release">Release to refresh</span>
            <span class="loading">Loading</span>
          </div>
        </div>
        <div class="wrap">
          Place your content here.
        </div>
      </div>
      @example
<caption>Instantiate with Class</caption>
var alert = new CUI.Rail({
  element: '#myRail',
  refreshCallback: function () { // if the callback is set then the pull-to-refresh feature is getting enabled
    var def = $.Deferred(); 
    setTimeout(function() {
      def.resolve();      
    }, 3000); 

    return def.promise(); // it is expected that the callback returns a promise
  }
});
// Within the callback function execute your ajax call to get the necessary data
// reminder jQuery.ajax returns a promise by default

      @example
<caption>Instantiate with jQuery</caption>
$('#myRail').rail({
  refreshCallback: function () {
    var def = $.Deferred();
    setTimeout(function() {
      def.resolve();      
    }, 3000); 

    return def.promise();
  }
});

      @example
<caption>Markup</caption>
&lt;div class=&quot;rail right&quot; role=&quot;complementary&quot;&gt;
  &lt;div class=&quot;pull-to-refresh&quot;&gt;
    &lt;div class=&quot;message&quot;;&gt;
      &lt;i class=&quot;arrow&quot;;&gt;&lt;/i;&gt;
      &lt;i class=&quot;spinner large&quot;;&gt;&lt;/i;&gt;
      &lt;span class=&quot;pull&quot;;&gt;Pull to refresh&lt;/span;&gt;
      &lt;span class=&quot;release&quot;;&gt;Release to refresh&lt;/span;&gt;
      &lt;span class=&quot;loading&quot;;&gt;Loading&lt;/span;&gt;
    &lt;/div;&gt;
  &lt;/div&gt;
  &lt;div class=&quot;wrap&quot;&gt;
    &lt;section&gt;
        &lt;h4&gt;Update Feed&lt;/h4&gt;
    &lt;/section&gt;
    &lt;section class=&quot;foldable&quot;&gt;
        &lt;h4 class=&quot;heading&quot;&gt;Revised asset ready for review&lt;/h4&gt;
        &lt;div class=&quot;fold smallText greyText lightText&quot;&gt;Modified yesterday by Rob Cobourn&lt;/div&gt;
        &lt;p class=&quot;small&quot;&gt;I created a new segment thing for the...&lt;/p&gt;
    &lt;/section&gt;
  &lt;/div&gt;
&lt;/div&gt;
&lt;div class=&quot;content&quot;&gt;
  &lt;p&gt;Content.&lt;/p&gt;
&lt;/div&gt;

      @desc extends the functionality of a rail
      @constructs

      @param {Object} options                               Component options
      @param {Function} options.refreshCallback             Callback to be called after a refresh is triggered
    */
    construct: function(options) {

      var e = this.$element,
          opt = $.extend(true, {}, this.defaults, options),
          html = '<div class="pull-to-refresh">' +
                  '<div class="icon"></div>' +
                  '<div class="message">' +
                    '<i class="arrow"></i>' +
                    '<i class="spinner large"></i>' +
                    '<span class="pull">' + opt.message.pull + '</span>' +
                    '<span class="release">' + opt.message.release + '</span>' +
                    '<span class="loading">' + opt.message.loading + '</span>' +
                  '</div>' +
                '</div>',
            _ = { // fill all locals
            rail: e,
              content: e.find('.wrap'),
              ptr: e.find('.pull-to-refresh') 
            },
            foldable = _.content.find('section.foldable'),
            switcher = _.content.find('.rail-switch'),
			quickform = _.content.find('.quickform');

      // Accessibility
      _makeAccessible(e);

      // enable foldable section
      foldable.each(function (i, e) {
        
        var f = $(e),
            trigger = f.find('.heading'),
			fold = f.find('.fold');  

        // register for events with fingerpointer
        trigger.fipo('tap', 'click', function (ev) {
            var expanded = f.toggleClass('open').hasClass('open'), 
				showFocus = false;
            fold.attr({'aria-hidden':!expanded, 'aria-expanded':expanded});
			
			// hack to make sure that VoiceOver announces the expanded items.
			if (expanded && ev.type==='click' && !trigger.is('a')) {
				showFocus = trigger.hasClass('focus');
				fold.attr('tabindex', '-1').focus();
				if (showFocus) trigger.addClass('focus');
				setTimeout(function () { fold.removeAttr('tabindex'); trigger.focus(); }, 100);
			}
        });
      });

      //enable swiping
      $(document).finger('swipe', function (e) {
        var openTriggerArea = 30,
            w = _.rail.width(),
            x = e.touches.start[0].pageX,
            dir = e.direction;

        
          if (dir === 'left') { // close
            if (x < w) {
              _.rail.addClass('closed');
            }
          } else if (dir === 'right') { // open
            if (x < openTriggerArea) {
              _.rail.removeClass('closed');
            }
          }
      });

      // rail switcher
      if (switcher.length > 0) {
        this._initRailSwitcher(_.content, switcher);
      }

      // accordion
      if (_.content.hasClass('accordion')) {
        this._initAccordion(_.content);
      }


      // pull-to-refresh    
      if (options.refreshCallback) { // the refreshable option will be activated of the refreshCallback is set
        if (!_.ptr.get(0)) { // add markup if there is non
          _.rail.prepend(html);  
          _.ptr = e.find('.pull-to-refresh');
        }

        _ = $.extend(_, {
          arrow: _.ptr.find('.arrow'),
          spinner: _.ptr.find('.spinner'),
          pull: _.ptr.find('.pull'),
          release: _.ptr.find('.release'),
          loading: _.ptr.find('.loading'),
          h: _.ptr.height(),
          active: false,
          waiting: false
        });

        // add locals to the object
        this._ = _;
        // add callback
        this.callback = options.refreshCallback;

        // add pullable class to apply styling
        _.rail.addClass('pullable');

        // enable scrolling to top from point 0
        _.content.finger('touchstart', $.proxy(this._handleTouchstart, this))
                .finger('touchmove', $.proxy(this._handleTouchmove, this))
                .finger('touchend', $.proxy(this._handleTouchend, this));    
      }
    },

    defaults: {
      message: {
        pull: 'Pull to refresh',
        release: 'Release to refresh',
        loading: 'Loading'
      }
    },

    _handleTouchstart: function (ev) {
      var _ = this._;
	  
	  if (_.waiting) {
        return true;
      }
	  
	  _.rail.addClass('scroll touch'); 
      
	  if (_.rail.scrollTop() === 0) {
        _.rail.scrollTop(1);
      } 
    },

    _handleTouchmove: function (ev) {
      var _ = this._,
          delay = _.h / 3 * 2, // spacing where the arrow is not moved
          top = _.rail.scrollTop(), // current scrollTop
          deg = 180 - (top < -_.h ? 180 : // degrees to move for the arrow (starts at 180° and decreases)
                      (top < -delay ? Math.round(180 / (_.h - delay) * (-top - delay)) 
                      : 0));
	  
	  if (_.waiting) {
        return true;
      }

      // handle arrow UI
      _.arrow.show();
      _.arrow.css('transform', 'rotate('+ deg + 'deg)');

      // hide spinner while showing the arrow
      _.spinner.hide();


      if (-top > _.h) { // release state
        _.pull.css('opacity', 0);
        _.loading.css('opacity', 0);
        _.release.css('opacity', 1);

        _.active = true;
      } else if (top > -_.h) { // pull state
        _.release.css('opacity', 0);
        _.loading.css('opacity', 0);
        _.pull.css('opacity', 1);

        _.active = false;
      } 
    },

    _handleTouchend: function (ev) {
      var _ = this._,
          top = _.rail.scrollTop();

      if (_.active) { // loading state
        ev.preventDefault();

        _.waiting = true;

        _.release.css('opacity', 0);
        _.pull.css('opacity', 0);
        _.loading.css('opacity', 1);

        // show spinner
        _.arrow.hide();
        _.spinner.show();

        // fix bar
        _.rail.scrollTop(top - _.h);
        _.ptr.css('position', 'static');
        _.active = false;

        // execute callback
        this.callback().done(function() {
          _.ptr.animate({
            height: 0
          }, 'fast', 'linear', function () {
            _.ptr.css('position', 'absolute');
            _.ptr.height(_.h);
            _.waiting = false;
			_.rail.removeClass('touch');
          });  
        });
      } else {
		  _.rail.removeClass('touch');
	  }
    },

    _initAccordion: function (con) {
      var activeAccordion = 'active-accordion',
          accordions = con.find('section'),
          closedHeight = accordions.outerHeight(true); // height of one closed accordion


      accordions.each(function (i, e) {
        var f = $(e),
            containerHeight = con.outerHeight(),
            contentHeight = containerHeight - (accordions.length * closedHeight), // height of the content for one open accordion
            trigger = f.find('.heading'),
            fold = f.find('.fold');

        trigger.fipo('tap', 'click', function (ev) {
          var curHeight = fold.height(),
              targetHeight,
              cur = con.data(activeAccordion);

          if (cur) {
            cur.removeClass('open').find('.fold').height(0).attr({'aria-hidden': true,'aria-expanded': false});
          }
          
          fold.height(contentHeight).attr({'aria-hidden': false ,'aria-expanded': true});
          con.data(activeAccordion, f.addClass('open'));
        });
      });  
    },

    _initRailSwitcher: function (con, switcher) {
      var tablist = switcher.find('nav'),
	      tablist_id,
          trigger = tablist.find('a'),
          views = con.find('.rail-view'),
          active = con.find('.rail-view.active'),
          search = switcher.find('input'),
          cl = 'active';
		  
      tablist_id = tablist.attr({'role':'tablist'}).attr("id");
      
	  if (!tablist_id) {
        tablist.data('rail-switch-tablist','rail-switch-tablist');
        tablist_id = 'cui-rail-switch-tablist-'+$.expando+'-'+tablist[0][$.expando];
        tablist.attr('id', tablist_id);
      }
  
      // init switcher
      trigger.each(function (i, e) {
        var t = $(e),
			t_id = t.attr('id'),
			isActive = t.hasClass('active'),
            viewName = t.data('view'),
            view = con.find('.rail-view[data-view="'+ viewName +'"]'),
			view_id = view.attr('id');
		
		if (!t_id) {
			t_id = tablist_id+'-tab-'+viewName;
			t.attr('id', t_id);
		}
		
		if (!view_id) {
			view_id = tablist_id+'-tabpanel-'+viewName;
			view.attr('id', view_id);
		}
		
		t.attr({'role': 'tab', 
			'aria-selected': isActive,
			'tabindex': isActive ? 0 : -1,
			'aria-controls':view_id}).filter('[href="#"]').attr('href',"#"+view_id);
		view.attr({'role': 'tabpanel',
			'aria-hidden': !isActive,
            'aria-expanded': isActive,
			'aria-labelledby':t_id});
		
        t.fipo('tap', 'click', function (ev) {
          ev.preventDefault();

          views.removeClass(cl)
            .attr({'aria-hidden':true,'aria-expanded': false});
          trigger.removeClass(cl)
            .attr({'aria-selected': false,
              'tabindex': -1});

          $(this).addClass(cl).attr({'aria-selected': true, 'tabindex': 0});
          view.addClass('active').attr({'aria-hidden':false,'aria-expanded': true});
        }).focus(function(ev) {
			if (!CUI.util.isTouch && !$(this).data('mousedown')) {
				$(this).addClass('focus')
					.parent().addClass('focus');
			}
		}).blur(function(ev) {
			$(this).removeClass('focus').removeData('mousedown')
				.parent().removeClass('focus');
		}).mousedown(function(ev) {
			// flags activation by a mousedown event, 
			// so that we only show the focus rectangle after a tab receives keyboard focus
			$(this).data('mousedown', true);
		}).keydown(function(ev) {
			switch(ev.which)
			{
				case 33:
					// page up
					if (ev.ctrlKey || ev.metaKey) {
						ev.preventDefault();
						$(this).prev(":focusable").data('mousedown', !!$(this).data('mousedown')).focus().click();
					}
					break;
				case 34:
					// page down
					if (ev.ctrlKey || ev.metaKey) {
						ev.preventDefault();
						$(this).next(":focusable").data('mousedown', !!$(this).data('mousedown')).focus().click();
					}
					break;
				
				case 35:
					// end
					trigger.last(":focusable").data('mousedown', !!$(this).data('mousedown')).not(this).focus().click();
					break;
				case 36:
					// home
					trigger.first(":focusable").data('mousedown', !!$(this).data('mousedown')).not(this).focus().click();
					break;
				case 37:
				case 38:
					// left/up arrow
					ev.preventDefault();
					$(this).prev(":focusable").data('mousedown', !!$(this).data('mousedown')).focus().click();
					break;
				case 39:
				case 40:
					// right/down arrow
					ev.preventDefault();
					$(this).next(":focusable").data('mousedown', !!$(this).data('mousedown')).focus().click();
					break;
			  }
		});
      });
    }
  });

  var _makeAccessible = function($element) {
    // The rail is complementary content
    // See: http://www.w3.org/TR/wai-aria/roles#complementary
    $element.attr('role', 'complementary');
        var wrap = $element.find('.wrap'),
            switcher = wrap.find('.rail-switch'),
            isAccordion = wrap.hasClass('accordion'),
            sections = wrap.find('section'),
            foldables = isAccordion ? sections : sections.filter('.foldable'),
            foldableHeadings = foldables.find('h4, .heading'),
            folds = foldables.find('.fold'),
            expanded = sections.not('.foldable'),
            tablists,
            foldableParent = null,
            foldableWrapper = null,
			quickform = $element.find('.quickform'),
			quickformAction = quickform.find('.action'),
			quickformTrigger = quickform.find('>.control .trigger');
      
        foldables.not('[role]').attr('role','presentation');
		
		if (isAccordion) {		
			foldables.each(function(index) {
				var foldable = $(this);
				if (!foldable.parent().is(foldableParent))
				{
					foldableParent = foldable.parent();
					foldableWrapper = $('<div role="tablist" class="tablist" aria-multiselectable="true"></div>');
					foldable.wrap(foldableWrapper);
				} else {
					foldable.siblings('[role="tablist"]').append(foldable);
				}
			});
			
			if(folds.is("ul")) {
				folds.wrap('<div role="tabpanel" class="fold"></div>');
				folds = wrap.find('[role="tabpanel"]');
			} else {
				folds.attr({'role':'tabpanel'});
			}
		}

		foldableHeadings.attr({'tabindex':0});
		if (isAccordion) {
            foldableHeadings.attr({'role':'tab'});
        } else {
            foldableHeadings.not('[role]').filter('span, a[href="#"]').attr({'role':'button'});
        }
		
		tablists = isAccordion ? $element.find('[role="tablist"]') : wrap;
		tablists.each(function(index) {
            var $wrap = $(this), 
                wrap_id = $wrap.attr('id');
            if (!wrap_id) {
              $wrap.data('rail-tablist','rail-tablist');
              wrap_id = 'cui-rail-tablist-'+$.expando+'-'+this[$.expando];
              $wrap.attr('id', wrap_id);
            }
		});
		
		folds.each(function(index) {
			var $fold = $(this), 
                fold_id = $fold.attr('id'),
				wrap_id = $fold.closest('[id|="cui-rail-tablist"]').attr('id'),
                $foldableSection = $fold.closest('section'),
				$foldableHeading = $foldableSection.find('h4, .heading'),
				foldableHeading_id = $foldableHeading.attr('id'),
                expanded = $foldableSection.hasClass('open');
			if (!fold_id) {
              fold_id = wrap_id+'-fold'+index;
              $fold.attr('id', fold_id);
            }
			if (!foldableHeading_id) {
              foldableHeading_id = wrap_id+'-foldable'+index;
              $foldableHeading.attr('id', foldableHeading_id);
            }
			$foldableHeading.attr('aria-controls',fold_id).filter('[href="#"]').attr('href',"#"+fold_id);
			$fold.attr({'aria-labelledby':foldableHeading_id,'aria-hidden':!expanded,'aria-expanded':expanded});
		});
		
		$element.on('focus',':focusable', function(event) {
			var $target = $(event.target), 
				$section,
				$tab;

			if (!CUI.util.isTouch && !$target.data('mousedown')) {
				$target.addClass('focus');
			}
            
            if (!$target.is('section :focusable')) {
                if (!$target.is('input[type=text]')) return;
            }
            
            $section = $target.closest('section');
            $tab = $section.find('[aria-controls]');
			
            foldableHeadings.filter('[aria-selected]').attr({'aria-selected':false});
            
			if ($tab.length>0) {
				$tab.attr({'aria-selected':true});
				if ($tab.is('[role="tab"]')) {
					$tab.attr('tabindex',0);
					foldableHeadings.not($tab).not('section.open *').attr('tabindex',-1);
				}
			}
            
			$target
				.keydown(_keyDownHandler)
				.blur(function(e) {
					var $t = $(e.target),
					$s = $t.closest('section'),
					$t2 = $s.find('[aria-controls]');
					$t.unbind('keydown', _keyDownHandler)
						.removeClass('focus').filter('[aria-selected]').attr('aria-selected',false);
					if ($t2.length>0) {
						$t2.filter('[aria-selected]').attr('aria-selected',false);
					}
					if ($t.is('[role="tab"]')) {
						$t.not('[aria-selected=true], a[href]').attr('tabindex',-1);
						if (foldableHeadings.filter('[tabindex=0]').length===0) {
							foldableHeadings.eq(0).attr('tabindex',0);
						}
					}
				});
		}).on('blur',':focusable', function(event) {
            var $target = $(event.target);
            if ($target.not('section :focusable, input[type="text"]')) {
                $target.removeClass('focus');
            }
        }).on('mousedown', 'label', function(event) {
            var $target = $(event.currentTarget),
                $labelled = $('#'+$target.attr('for'));            
            if ($labelled.length===0) {
               $labelled = $target.find('input, textarea, select').filter(':focusable');
            }
            if ($labelled.length===0 && $target.attr('id')) {
               $labelled = $('[aria-labelledby*="'+$target.attr('id')+'"]');
            }
            if ($labelled.length===1) setTimeout(function() { $labelled.get(0).focus(); }, 1);
        });
		
		if (quickform.length>0) {
			if (quickformAction.length > 0) {
				quickformAction.attr('role','dialog');
				var quickformAction_id = quickformAction.attr('id');
				if (!quickformAction_id) {
					quickformAction.data('rail-quickform-action','rail-quickform-action');
					quickformAction_id = 'cui-rail-quickform-action-'+$.expando+'-'+quickformAction[0][$.expando];
					quickformAction.attr('id', quickformAction_id);
				}
				if (quickformTrigger.length > 0) {
					var quickformTrigger_id = quickformTrigger.attr('id');
					if (!quickformTrigger_id) {
						quickformTrigger_id = quickformAction_id+'-trigger';
						quickformTrigger.attr('id', quickformTrigger_id);
					}
					quickformAction.attr({'aria-labelledby':quickformTrigger_id,'tabindex':-1});
					quickformTrigger.attr({'role':'button','aria-pressed':quickformAction.css('display')!=='none', 'aria-haspopup':true, 'aria-controls':quickformAction_id}); 
					quickform.on('click', '>.control .trigger', function(event) {
						var pressed = quickformAction.css('display')!=='none';
						quickformTrigger.attr({'aria-pressed':pressed}); 
						if (pressed) {
							quickformAction.attr('tabindex',-1).focus().removeAttr('tabindex');
							quickformAction.on('keydown', function(event) {
								if (event.which === 27) {
									quickform.removeClass('open');
									quickformTrigger.attr({'aria-pressed':false}).focus();
								}
							});
						}
					});
				}
			}
			
		}
  };
  var _keyDownHandler = function(event) {
    var $target = $(event.target),
	    wrap = $target.closest('.wrap'),
		switcher = wrap.find('.rail-switch'),
		isRailSwitchTab = $target.is("[data-view]"),
		isAccordion = wrap.hasClass('accordion'),
		sections = wrap.find('section'),
        foldables = isAccordion ? sections : sections.filter('.foldable'),
		expanded = sections.not('.foldable'),
		foldableHeadings = foldables.find('h4, .heading'),
		folds = foldables.find('.fold'),
        ctrlKey = event.ctrlKey,
        altKey = event.altKey,
        metaKey =  event.metaKey,
        shiftKey = event.shiftKey,
		isFoldableHeading = $target.is('[aria-controls]'),
		currentSection = (isFoldableHeading) ? $target.closest('section') : null,
		currentFoldableHeading = (isFoldableHeading) ? $target : null,
		currentIndex = (isFoldableHeading) ? foldableHeadings.index($target) : -1,
		tabbables = wrap.find(":focusable"),
		tabIndexPosition = tabbables.index($target),
		prevTabbableIndex = tabIndexPosition-1,
		nextTabbableIndex = tabIndexPosition+1,
		nextTabbable;
	
	if (!isFoldableHeading) {
		currentSection = $target.parentsUntil('.wrap','section');
		currentFoldableHeading = currentSection.find('h4, .heading');
		currentIndex = foldableHeadings.index(currentFoldableHeading);
	}
	
	switch(event.which)
	{
		case 9:
			// tab
			if (nextTabbableIndex<tabbables.length-1 && !shiftKey) {
				nextTabbable = tabbables.eq(nextTabbableIndex);
				if (nextTabbable.is('[role="tab"]') && $('#'+nextTabbable.attr('aria-controls')).is('[aria-expanded="true"]')) {
					tabbables.eq(nextTabbableIndex+1).focus();
					event.preventDefault();
				}
			} 
			break;
		case 13:
			// enter
			if (isFoldableHeading && !$target.is('a[href]')) {
			  currentFoldableHeading.click();
			}
			break;
		case 32:
			// space
			if (isFoldableHeading) {
			  currentFoldableHeading.click();
			}
			break;
		case 33:
			// page up
			if (ctrlKey || metaKey) {
				event.preventDefault();
				foldableHeadings.eq( Math.max(0,currentIndex-1) ).not($target).focus();
			}
			break;
		case 34:
			// page down
			if (ctrlKey || metaKey) {
				event.preventDefault();
				if (isFoldableHeading) {
					foldableHeadings.eq( Math.min(foldableHeadings.length-1,currentIndex+1) ).not($target).focus();
				} else {
					currentFoldableHeading.not($target).focus();
				}
			}
			break;
		
		case 35:
			// end
			foldableHeadings.last().not($target).focus();
			break;
		case 36:
			// home
			foldableHeadings.first().not($target).focus();
			break;
		case 37:
		case 38:
			// left/up arrow
			if (isFoldableHeading) {
                event.preventDefault();
                foldableHeadings.eq( Math.max(0, currentIndex-1) ).not($target).focus();
			} else if ((ctrlKey || metaKey) && event.which===38) {
				event.preventDefault();
				currentFoldableHeading.not($target).focus();
			} else if (currentSection.length && currentSection.hasClass('links') && prevTabbableIndex > 0) {
				event.preventDefault();
				tabbables.eq(prevTabbableIndex).not($target).focus();
			} 
			break;
		case 39:
		case 40:
			// right/down arrow
			if (isFoldableHeading) {
                event.preventDefault();
				foldableHeadings.eq( Math.min(foldableHeadings.length-1, currentIndex+1) ).not($target).focus();
			} else if (currentSection.length && currentSection.hasClass('links') && nextTabbableIndex < tabbables.length-1) {
				event.preventDefault();
				tabbables.eq(nextTabbableIndex).not($target).focus();
			}
			break;
      }
  };
  
  CUI.util.plugClass(CUI.Rail);

}(window.jQuery));
