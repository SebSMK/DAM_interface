(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var viewManager = {};
		factory(viewManager);
		if (typeof define === "function" && define.amd) {
			define(viewManager); // AMD
		} else {
			root.ViewManager = viewManager; // <script>
		}
	}
}(this, function (viewManager) {

	viewManager.constructor = function(options){
		var generalSpinopts = {
				lines: 11, // The number of lines to draw
				length: 20, // The length of each line
				width: 10, // The line thickness
				radius: 29, // The radius of the inner circle
				corners: 1, // Corner roundness (0..1)
				rotate: 0, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				color: '#000', // #rgb or #rrggbb or array of colors
				speed: 0.8, // Rounds per second
				trail: 68, // Afterglow percentage
				shadow: false, // Whether to render a shadow
				hwaccel: false, // Whether to use hardware acceleration
				className: 'generalspinner', // The CSS class to assign to the spinner
				zIndex: 2e9, // The z-index (defaults to 2000000000)
				top: '50%', // Top position relative to parent
				left: '50%' // Left position relative to parent
		};

		this.generalSpin = new Spinner(generalSpinopts);
		this.options = options || {};
		this.template = options.template;
		this.target = options.target;
//		this.allWidgetProcessed = false; 

		/*********
		 * PUBLIC FUNCTIONS
		 ********** */

		this.init = function () {
			var self = this;
			var $target = $(this.target);	

			$target.hide();

			//* merge data and template						
			var html = self.template_integration_json({"general_title": Manager.translator.getLabel("general_title")}, '#generalTemplate');    	  	  
			$target.html(html);						

			ModelManager.setModel($.address.value(), "url");
			var model = ModelManager.getModel();	
			var tohide = model.view == 'detail' ? 'section.section--list' : 'section.section--detail';								
			$target.find(tohide).hide();									

			//* add version number
			$target.find('#smk_search_version').text(smkCommon.getVersion() + "-" + smkCommon.getMode());

			//* add page title
			document.title = Manager.translator.getLabel("site_title");
			$target.show();
			
			//* add click on print button
			$target.find('.print a')
			.attr("href", window.location.href)
			.click(function (event) {
				//display all pictures on the page
				$target.find('.matrix-tile').removeClass('preloaded');			
				window.print();				
			});
		};

		this.beforeRequest = function(){	 

			//this.start_modal_loading();			

			//* start loading mode for some chosen widgets  
			// teasers			
			this.add_modal_loading_to_widget('teasers');

//			//* filters
//			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {		  	
//				if(Manager.widgets[Manager.searchfilterList[i]] != null)
//					this.add_modal_loading_to_widget(Manager.widgets[Manager.searchfilterList[i]].field);
//			};
//
//			//* advanced filters
//			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {
//				if(Manager.widgets["adv_" + Manager.searchfilterList[i]] != null)
//					this.add_modal_loading_to_widget("adv_" + Manager.widgets["adv_" + Manager.searchfilterList[i]].field);
//			};

			// details
			this.add_modal_loading_to_widget('details');
			
			// details tabs
			//this.add_modal_loading_to_widget('details_tabs');
			
			// reload title
			$(this.target).find(".branding i").text(Manager.translator.getLabel("general_title"));
			
			// reload feebackform's text
			$(this.target).find('#smk_feedback').removeClass("sis-Feedback-isOpen").empty();
			var feed = Mustache.getTemplate('templates/feedback.html');
			var html = Mustache.to_html($(feed).find('#feedbackTemplate').html(),
										{
										"title": Manager.translator.getLabel("feedback_title"),			 	 
									      "main": Manager.translator.getLabel("feedback_main"),				
									      "send":	Manager.translator.getLabel("feedback_send"),			
									      "close":	Manager.translator.getLabel("general_title"),			
									      "tak":	Manager.translator.getLabel("feedback_tak"),			
									      "name":	Manager.translator.getLabel("feedback_name"),			
									      "email":	Manager.translator.getLabel("feedback_email"),			
									      "feedback":	Manager.translator.getLabel("feedback_feedback"),		
									      "default": Manager.translator.getLabel("feedback_default"),
									      "button": Manager.translator.getLabel("feedback_button")
										});
			$(this.target).find('#smk_feedback').append(html);
			initFeedForm();
			
			//* reload page title
			document.title = Manager.translator.getLabel("site_title");
			
			//* reload print target
			$(this.target).find('.print a')
			.attr("href", window.location.href)					

		};  

		this.template_integration_json = function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		};		

		/**
		 * Call function in a given widget / subwidget of the manager
		 * @param {String} [widget] Widget name
		 * @param {String} [fn] function name
		 * @params {Json} [options]		 
		 * * * @param {String[]} [params] array of function's parameters
		 */
		this.callWidgetFn = function(widget, fn, options){	
			var options = options || {};
			var params = options.params;								

			if(Manager.widgets[widget] === undefined || typeof(Manager.widgets[widget][fn]) !== "function"){
				console.log(sprintf("%s - %s not defined", widget, fn));								
				return false;
			}									
			return Manager.widgets[widget][fn].apply(Manager.widgets[widget], params);	
		};

		/**
		 * Call target of a given widget / subwidget of the manager
		 * @param {String} [widget] Widget name
		 * @param {String} [subwidget] subWidget name - optional
		 */
		this.callWidgetTarget = function(widget, subwidget){												

			if(Manager.widgets[widget] === undefined ||
					(subwidget !== undefined && Manager.widgets[widget][subwidget] === undefined)
			){
				console.log(sprintf("target %s/%s not defined", widget, subwidget));
				return [];
			}						

			return subwidget === undefined ? Manager.widgets[widget].target : Manager.widgets[widget][subwidget].target;
		};

		/**
		 * image loading handlers
		 * */		

		//* teaser	
		this.smk_teasers_all_images_loaded = function(){
			var $this = $(this);

			this.showWidget($(this.callWidgetTarget('teasers')));																			
			// highlight search string in teasers
			//this.highlightning();
			// we stop the modal "waiting image" for Teaser
			this.remove_modal_loading_from_widget(this.callWidgetTarget('teasers'));				

			if(smkCommon.debugTime()) console.timeEnd("Teasers");																
		};				

		//* detail
		this.smk_detail_this_img_loaded = function(){			
			this.remove_modal_loading_from_widget(this.callWidgetTarget('details'));												
		};	
		
		this.smk_search_detail_tabs_loaded = function(){			
			this.remove_modal_loading_from_widget(this.callWidgetTarget('details_tabs'));												
		};	

		this.viewChanged = function (stateChange) {        	    
			var $target = $(this.target);
			var self = this;

			if (stateChange["view"] === undefined)
				return;


			//* hide widgets that aren't in the current language
			this.hideWidgetsNotInCurrentLanguage(smkCommon.getCurrentLanguage());

			switch(stateChange["view"]){
			case "teasers":			  

				//$target.find("section.section--list").show();
				//$target.find("section.section--detail").hide();

//				$(self.callWidgetTarget('details', 'thumbnails_subWidget')).empty();
//				self.hideWidget($(self.callWidgetTarget('details', 'thumbnails_subWidget')));
//				$(self.callWidgetTarget('details', 'related_subWidget')).empty();
//				self.hideWidget($(self.callWidgetTarget('details', 'related_subWidget')));

				$(self.callWidgetTarget('details')).empty();
				self.hideWidget($(self.callWidgetTarget('details')));

				self.callWidgetFn('details', 'removeAllRelated');				

				//self.showWidget($target.find("#pager-viser"));
//				self.showWidget($(self.callWidgetTarget('currentsearch')));
				self.showWidget($(self.callWidgetTarget('category')));
				self.showWidget($(self.callWidgetTarget('sorter')));
				//self.showWidget($(self.callWidgetTarget('pager')));				
				self.showWidget($(self.callWidgetTarget('teasers')));

				self.showWidget($target.find("#search-filters"));

				break;

			case "detail":										 

				//self.callWidgetFn('details_tabs', 'removeAllRelated');
				//self.callWidgetFn('details_tabs', 'removeAllParts');
				//self.callWidgetFn('details_tabs', 'hideTabs');

				$target.find("section.section--list").hide();
				$target.find("section.section--detail").show();				

//				for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {				
//					self.hideWidget($(self.callWidgetTarget(Manager.searchfilterList[i])));							
//				};		

				//self.hideWidget($target.find("#pager-viser"));
				self.hideWidget($target.find("#search-filters"));				
//				self.hideWidget($(self.callWidgetTarget('currentsearch')));																			
				self.hideWidget($(self.callWidgetTarget('category')));				
				self.hideWidget($(self.callWidgetTarget('sorter')));
				//self.hideWidget($(self.callWidgetTarget('pager')));							
				//self.hideWidget($(self.callWidgetTarget('teasers')));
				self.showWidget($(self.callWidgetTarget('details')));
//				self.showWidget($(self.callWidgetTarget('details', 'thumbnails_subWidget')));
//				self.showWidget($(self.callWidgetTarget('details', 'related_subWidget')));				

				break;		  
			} 	

			return;
		};

		this.categoryChanged = function (stateChange) {        	    
			var $target = $(this.target);			

			if (stateChange["category"] === undefined )
				return;			

			this.callWidgetFn('teasers', 'removeAllArticles');									
			this.showWidget($(this.callWidgetTarget('teasers')));
			this.showWidget($target.find("#search-filters"));							

			return;
		};

		/*********
		 * PRIVATE FUNCTIONS
		 ********** */		

		/*
		 * start general modal loading screen 
		 */

		this.start_modal_loading = function(){
			//$(this.target).addClass("modal_loading");
			var spintarget = document.getElementById(this.target.replace('#', ''));
			$(this.target).addClass('opaque');
			this.generalSpin.spin(spintarget);
		};

		/*
		 * stop general modal loading screen 
		 */
		this.stop_modal_loading = function(){	  
			//$(this.target).removeClass("modal_loading");
			this.generalSpin.stop();
			$(this.target).removeClass('opaque');  
		};

		/*
		 * start loading mode for a given widget.
		 * - only if widget's state is "active"
		 */
		this.add_modal_loading_to_widget = function(widget){
			if(this.isThisWidgetActive(widget))				
				$(this.callWidgetTarget(widget)).addClass('widget_modal_loading');												
		};

		/*
		 * stop loading mode for a given widget.
		 */
		this.remove_modal_loading_from_widget = function(target){
			$(target).removeClass("widget_modal_loading");
		};


		this.isThisWidgetActive = function(widget){			
			return this.callWidgetFn(widget, 'getRefresh');			
		};

		/*
		 * all widgets are processed AND loaded
		 */
		this.allWidgetsLoaded = function(){
			this.stop_modal_loading();					
			this.set_focus();
		};

		this.set_focus = function(){
			var self = this;
			$(document).ready(function () {				
				var $elem = $(self.callWidgetTarget('searchboxauto')).find('input.search-bar-field.tt-input');

				if($elem.length > 0){
					if ($elem.val() != ""){
						$elem.blur();
						return;
					}
					
					var $window = $(window);

					var docViewTop = $window.scrollTop();
					var docViewBottom = docViewTop + $window.height();		    

					var elemTop = $elem.offset().top;
					var elemBottom = elemTop + $elem.height();

					// we set focus only if the searchbox is visible (otherwise Firefox scrolls up automatically to the element!!)
					if ((elemBottom > docViewTop)){
						if(smkCommon.debugLog()) console.log(sprintf(sprintf("View - elemTop_%s : docViewTop%s", elemBottom, docViewTop )));
						$elem.focus();					
					}					
				}
			});	  	  
		};		

		this.showWidget = function($target){
			$target.removeClass('no_refresh');
			$target.show().children().show();	  	  
		};		

		this.hideWidget = function($target){
			$target.addClass('no_refresh');
			$target.hide();	  	  
		};

//		this.highlightning = function(){
//			// highlight search string in teasers
//			var vArray = [].concat(Manager.store.get('q').value);
//			if (undefined !== vArray && vArray.length > 0){    			
//				var words = [];
//
//				for (var i = 0, l = vArray.length; i < l; i++) {    				
//					words = words.concat(vArray[i].trim().replace('*', "").split(" "));    				
//				};
//
//				$(this.callWidgetTarget('teasers')).find('.matrix-tile-header').highlight(words);
//				$(this.callWidgetTarget('teasers')).find('.matrix-tile-meta').highlight(words);
//			}    
//		};

		this.generalSolrError = function(e){
			$(this.target).empty().html(sprintf('%s &nbsp;&nbsp; returned:&nbsp;&nbsp; %s<br>Please contact website administrator.', Manager.solrUrl, e)); 
		};

		this.hideWidgetsNotInCurrentLanguage = function(lang){
			var setLang;

			switch(lang){
			case smkCommon.enum_lang.en:
				setLang = smkCommon.enum_lang.en;
				break;
			case smkCommon.enum_lang.dk:
				setLang = smkCommon.enum_lang.dk;
				break;

			default:
				setLang = smkCommon.enum_lang.def;											
			}			

			this.hideWidget($(this.target).find("[lang]").not("[lang*='"+setLang+"']"));
			this.showWidget($(this.target).find("[lang][lang*='"+setLang+"']"));						
		};
	}
}));
