(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var eventsManager = {};
		factory(eventsManager);
		if (typeof define === "function" && define.amd) {
			define(eventsManager); // AMD
		} else {
			root.EventsManager = eventsManager; // <script>
		}
	}
}(this, function (eventsManager) {

	eventsManager.constructor = function(){

		this.allWidgetProcessed = false;
		this.startScroll = false;

		this.init = function(){
			/*
			 * Management of changes in address bar
			 * n.b.: externalChange is triggered also on document load
			 * */
			var self = this;

			// set windows to top
			$(window).scrollTop(0);

			$.address.strict(false);
			$( document ).ready(function() {				  
				$.address.externalChange(function(e){self.addressChange(e)});
				$(window).mousewheel(function(event){self.scrollStart(event)});								
			});	  	  
		};

		/********
		 * EVENTS
		 * *******/

		/*
		 * page scrolled 
		 * */			        		           
		this.scrollStart = function(event) {		        															

			
			if (ModelManager.get_view() != 'detail' 
				&& $('.generalspinner').length == 0
				&& event.deltaY < 0 // scrolling down
				&& !$(event.target).hasClass('active-result') // user is not scrolling a facet-list				
			){
					//* start scroll request
					ViewManager.callWidgetFn('scroll_update', 'start_scroll_request');	        																	        		    

					//* start preloading of teaser's images				
					ViewManager.callWidgetFn('scroll_update', 'start_scroll_preload_request');					
								
			}																				
		};							

		/*
		 * change in address bar
		 * */
		this.addressChange = function(e){	 											

			//* reset all current running ajax request, queued functions and preloaded data
			Manager.requestAbort();
			$.taskQueue.clear();
			this.startScroll = false;						

			if(smkCommon.debugTime()) console.time("adresschanged");	

			if(smkCommon.debugTime()) console.time("adresschanged-process view");

			ViewManager.start_modal_loading();

			//* set windows to top
			$(window).scrollTop(0);	

			//* get the view's model
			ModelManager.setModel(e.value, "url");
			var model = ModelManager.getModel();	

			//* process view
			if(model.view !== undefined){
				ViewManager.viewChanged({'view': model.view});				    				    				    					    					    	
			}else{
				ViewManager.viewChanged({'view': "teasers"});
			}			    

			ViewManager.beforeRequest();				    			    

			//* process language
			Manager.translator.setLanguage(model.lang);		

			Manager.store.set_current_lang(model.lang);	

			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process view");

			if(smkCommon.debugTime()) console.time("adresschanged-process view_cate");

			//* process category
			if(model.category !== undefined){
				if (model.view != 'detail'){			    		
					ViewManager.categoryChanged({'category': model.category});
				}
			}else if(model.category == undefined && model.view != 'detail'){
				ViewManager.categoryChanged({'category': "all"});
			}

			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process view_cate");			

			//****** process Solr request *******

			if(smkCommon.debugTime()) console.time("adresschanged-process_q");

			// reset exposed parameters
			Manager.store.exposedReset();

			// q param
			var q = [];
			if (model.view != 'detail'){									
				if(model.q !== undefined){
					q = q.concat(model.q);
				}else{
					q = Manager.store.q_default;
				}					
			}else{
				if(model.q !== undefined)
					q = sprintf('id:%s', model.q);			    	
			};

			Manager.store.addByValue('q', q);

			// facets
			Manager.store.remove('facet');
			Manager.store.remove('facet.field');
			if (model.view != 'detail'){
				Manager.store.addByValue('facet', true);
								
				
					// advanced search
					var adv_data = Manager.store.facets_default['advanced'];
					if(adv_data !== undefined){
						for (var i = 0, l = adv_data.length; i < l; i++) {
							var values = [];
							var ranges = [];
							for (var m = 0, n = adv_data[i]['values'].length; m < n; m++) {
								
								if(adv_data[i]['values'][m]['ranges'] === undefined)
									values.push(adv_data[i]['values'][m]['id']);
								else{
									var adv_range = adv_data[i]['values'][m]['ranges'];
									var opt = sprintf('f.%s.facet.range.', adv_range['range']);

									ranges.push({id: 'facet.range', value: adv_range['range']});				 
									ranges.push({id: opt + 'start', value: adv_range['start']});
									ranges.push({id: opt + 'end', value: adv_range['end']});
									ranges.push({id: opt + 'gap', value: adv_range['gap']});
									if(adv_range['other'] !== undefined)
										ranges.push({id:opt + 'other', value: adv_range['other']});														
								}
							}
							
							if (values.length > 0)
								Manager.store.addByValue('facet.field', values);
							if (ranges.length > 0)
								for (var m = 0, n = ranges.length; m < n; m++) {
									Manager.store.addByValue(ranges[m]['id'],ranges[m]['value'] );									
								}
																																						
						}				
					};						
				
//					// filters
//					Manager.store.addByValue('facet.field', Manager.store.facets_default[model.lang]['filters']);
//
//					if (Manager.store.facets_default[model.lang]['ranges'] !== undefined){
//						var range = Manager.store.facets_default[model.lang]['ranges']['range'];
//						var opt = sprintf('f.%s.facet.range.', range);
//
//						Manager.store.addByValue('facet.range', range);				 
//						Manager.store.addByValue(opt + 'start', Manager.store.facets_default[model.lang]['ranges']['start']);
//						Manager.store.addByValue(opt + 'end', Manager.store.facets_default[model.lang]['ranges']['end']);
//						Manager.store.addByValue(opt + 'gap', Manager.store.facets_default[model.lang]['ranges']['gap']);
//						if(Manager.store.facets_default[model.lang]['ranges']['other'] !== undefined)
//							Manager.store.addByValue(opt + 'other', Manager.store.facets_default[model.lang]['ranges']['other']);					
//					}						
																			
			}																				

			// fq param						
			if (model.view != 'detail')				
				Manager.store.addByValue('fq', Manager.store.fq_default);			

			if(model.fq !== undefined && AjaxSolr.isArray(model.fq)){
				for (var i = 0, l = model.fq.length; i < l; i++) {						
					Manager.store.addByValue('fq', model.fq[i].value, model.fq[i].locals);
				};											
			};	

			// qf param
			if(model.view != "detail")
				Manager.store.addByValue('qf', Manager.store.get_qf_string());					    		

			// sort param
			if(model.sort !== undefined){
				Manager.store.addByValue('sort', model.sort);
			}else{
				Manager.store.addByValue('sort', Manager.store.sort_default);
			};

			// start param
			if(model.start !== undefined){
				Manager.store.addByValue('start', model.start);
			}else{
				Manager.store.addByValue('start', 0);
			};

			// fl param
			if (model.view == 'detail'){									
				Manager.store.addByValue('fl', Manager.store.fl_options.detail);			
			}else{
				Manager.store.addByValue('fl', Manager.store.fl_options.list);		    	
			};									

			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process_q");

			//* process widgets
			if(smkCommon.debugTime()) console.time("adresschanged-process_widgets");
			if(smkCommon.debugTime()) console.time("adresschanged-process_widgets-1");
//			if(smkCommon.debugTime()) console.time("adresschanged-process_widgets-1-1");
//			// remove all previous search filters - only if search filters is set to "getRefresh"					
//			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {				
//			if(ViewManager.callWidgetFn(Manager.searchfilterList[i], 'getRefresh'))
//			ViewManager.callWidgetFn(Manager.searchfilterList[i], 'removeAllSelectedFilters', {params:[false]});	

//			};
//			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process_widgets-1-1");
			if(smkCommon.debugTime()) console.time("adresschanged-process_widgets-1-2");
			if (model.fq !== undefined){
				// add selected filters in searchFiltersWidget
				for (var i = 0, l = model.fq.length; i < l; i++) {
					if(model.fq[i].value !== undefined){
						var field = model.fq[i].value.split(':')[0]; 
						ViewManager.callWidgetFn(field, 'addSelectedFilter', {params: [model.fq[i].value.split(':')[1]]});
					}															
				}			    			
			}
			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process_widgets-1-2");
			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process_widgets-1");

			if(smkCommon.debugTime()) console.time("adresschanged-process_widgets-2");				

			// copy "q" values in Currentsearch widget (without q default)	
			ViewManager.callWidgetFn('currentsearch', 'removeAllCurrentSearch');			
			var q_wout_q_def = ModelManager.get_q();									
			for (var i = 0, l = q_wout_q_def.length; i < l; i++) {				
				ViewManager.callWidgetFn('currentsearch', 'add_q', {params: [q_wout_q_def[i], q_wout_q_def[i]]} );
			};	

			// select "sort" option in sorterWidget
			ViewManager.callWidgetFn('sorter', 'setOption', {params: [Manager.store.get('sort').val()]});

			// reset scroll manager				
			ViewManager.callWidgetFn('scroll_update', 'reset');
			
			// add current fq to scroll manager
			
			ViewManager.callWidgetFn('scroll_update', 'set_sub_manager_fq', {params: [model.fq]});

			if(smkCommon.debugTime()) console.time("adresschanged-process_widgets-2");

			if(smkCommon.debugTime()) console.timeEnd("adresschanged-process_widgets");

			//**> start Solr request 
			if(smkCommon.debugLog()) console.log(sprintf("adresschanged - request: %s", model.q));
			Manager.doRequest();

			if(smkCommon.debugTime()) console.timeEnd("adresschanged");
			if(smkCommon.debugTime()) console.timeEnd("smk_search_q_added");

		};


		/**
		 * UI events
		 * 
		 * */

		/*
		 * current page changed
		 * @result:  model update
		 * */
		this.smk_search_pager_changed = function(start, searchFieldsTypes){			
			ViewManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});
			ViewManager.callWidgetFn('category', 'setRefresh', {params: [false]});
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {				
				ViewManager.callWidgetFn(searchFieldsTypes[i], 'setRefresh', {params: [false]});
			};			

			var model = {};
			model.q = ModelManager.current_value_joker;
			model.fq = ModelManager.current_value_joker;
			model.start = start;
			model.sort = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;
			model.lang = ModelManager.current_value_joker;

			ModelManager.update(model);
		};

		/*
		 * Category changed
		 * @result:  model update 
		 * */
		this.smk_search_category_changed = function(event){

			var category = event.category;
			var view = event.view;  	  	  

			if (ViewManager.callWidgetFn('category', 'set', {params: [category]})){   				
				ViewManager.callWidgetFn('category', 'setActiveTab', {params: [category]});

				ViewManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});

				var model = {};
				model.q = ModelManager.current_value_joker;
				model.category = category;
				model.lang = ModelManager.current_value_joker;

				ModelManager.update(model); 
			};
		};

		/*
		 * call to teaser view
		 * @result:  model update 
		 * */
		this.smk_search_call_teasers = function(){

			//restore previous search params
			var model = ModelManager.loadStoredModel();

			ModelManager.update(model); 			
		};	

		/*
		 * call to detail view
		 * @result:  open detail in a new window
		 * */  
		this.smk_search_call_detail = function(event){						 		  
			var detail_url = event.detail_url + '&fl=detail';
			window.open(event.detail_url);			
		};	
		
		/*
		 * call to detail view
		 * @result:  open detail in the same window
		 * */  
		this.smk_search_call_detail_same = function(event){						 		  
			var detail_url = event.detail_url;
			ModelManager.update_url(detail_url);			
		};	

		/*
		 * a search string has been added in SearchBox
		 * @result:  model update 
		 * */
		this.smk_search_q_added = function(event){
			if(smkCommon.debugTime()) console.time("smk_search_q_added");
			var search_string = jQuery.trim(event.val);			
			var q = new Array()
			if (search_string != '') {																																									
				var default_teaser_view = ModelManager.getModel().view == 'detail';

				if (!default_teaser_view)
					q = AjaxSolr.isArray(ModelManager.get_q()) ?  
							ModelManager.get_q() 
							: 
								ModelManager.get_q() === undefined ? new Array() : new Array(ModelManager.get_q());				

								q.push(search_string); 			

								var model = {};										
								model.q = q;					
								model.sort = ModelManager.current_value_joker;
								model.view = default_teaser_view ? "teasers" : ModelManager.current_value_joker;
								model.category = default_teaser_view ? "all" : ModelManager.current_value_joker;
								model.lang = ModelManager.current_value_joker;

								if (!default_teaser_view)
									model.fq = ModelManager.current_value_joker;

								ModelManager.update(model);					
			};
		};

		/*
		 * search string removed in Currentsearch
		 * @result:  model update 
		 * */
		this.smk_search_remove_one_search_string = function(event){
			var facet = event.facet;			

			Manager.store.removeElementFrom_q(facet);   			

			var qvalue = Manager.store.get('q').value;
			var model = {};
			model.q = qvalue;
			model.fq = ModelManager.current_value_joker;
			model.sort = ModelManager.current_value_joker;
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;
			model.lang = ModelManager.current_value_joker;

			ModelManager.update(model); 
		};  

		/*
		 * search filter added / removed (only in "collection" tab/category)
		 * @result:  model update 
		 * */
		this.smk_search_filter_changed = function (caller, params){

			var trigg_req = false;

			if (params.selected !== undefined){
				if (caller.add(params.selected)) //!! -> add fq param in Manager.store
					trigg_req = true;
			}else if (params.deselected !== undefined){    		
				if (caller.remove(params.deselected)) //!! -> remove fq param in Manager.store
					trigg_req = true;
			};    	    	

			if (trigg_req){				
				ViewManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});

				var fqvalue = Manager.store.extract_fq_from_manager();	
				var model = {};				
				model.fq = fqvalue;
				model.q = ModelManager.current_value_joker;
				model.sort = ModelManager.current_value_joker;
				model.view = ModelManager.current_value_joker;
				model.category = ModelManager.current_value_joker;
				model.lang = ModelManager.current_value_joker;

				ModelManager.update(model);
			}
		};

		/*
		 * sorting changed
		 * @result:  model update  
		 * */
		this.smk_search_sorter_changed = function(params, searchFieldsTypes){			
			if (params == undefined)																					
				return;	  

			ViewManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});
			ViewManager.callWidgetFn('category', 'setRefresh', {params: [false]});			
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {				
				ViewManager.callWidgetFn(searchFieldsTypes[i], 'setRefresh', {params: [false]});
			};	

			var sortvalue = params;
			var model = {};
			model.sort = sortvalue;
			model.q = ModelManager.current_value_joker;
			model.fq = ModelManager.current_value_joker;	
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;
			model.lang = ModelManager.current_value_joker;

			ModelManager.update(model);	
		};		

		/* 
		 * switch language
		 * @result:  view changes  	 
		 */
		this.smk_lang_changed = function(lang){ 

			var model = {};
			model.lang = lang;
			model.sort = ModelManager.current_value_joker;
			model.q = ModelManager.current_value_joker;
			model.fq = ModelManager.current_value_joker;	
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.update(model);		

		};	

		/**
		 * Finish loading events
		 * 
		 * */

		//* all widgets have been processed (but maybe some of them are still loading)
		this.allWidgetsProcessed = function(){
			this.allWidgetProcessed = true;
			if ($('.widget_modal_loading').length == 0)
				this.allWidgetsLoaded();						
		},

		//* a new widget has finished loading
		this.wigdetLoaded = function(){
			if ($('.widget_modal_loading').length == 0 && this.allWidgetProcessed)
				this.allWidgetsLoaded();
		},

		//* all widgets have been process AND finished loading
		this.allWidgetsLoaded = function(){

			this.allWidgetProcessed = false;
			if(smkCommon.debugLog()) console.log(sprintf(sprintf("Events - allWidgetsLoaded b4 - scrollTop_%s", $(window).scrollTop() )));
			
			ViewManager.allWidgetsLoaded();

			if(smkCommon.debugLog()) console.log(sprintf(sprintf("Events - allWidgetsLoaded - scrollTop_%s", $(window).scrollTop() )));
			
			this.startScroll = true;
			//* start preloading of teaser's images 
//			ViewManager.callWidgetFn('scroll_update', 'start_scroll_preload_request');		
		},

		//* scroll - no more result to show		 
		this.smk_scroll_no_more_results = function() {},

		//* scroll - all new pictures has been added (in teaser)		
		this.smk_scroll_all_images_displayed = function(added){
			ViewManager.highlightning(); // highlight search words
			ViewManager.smk_scroll_all_images_displayed(added);	

//			//* start preloading of teaser's images 
//			if(this.startScroll)
//			ViewManager.callWidgetFn('scroll_update', 'start_scroll_preload_request');	

		},

		//* a searchfilter has finished loading	
		this.smk_search_filter_loaded = function(value){			
			ViewManager.remove_modal_loading_from_widget(value);
			this.wigdetLoaded();
		};	

		//* all image have finished loading in "teaser"
		this.smk_teasers_all_images_loaded = function(searchFieldsTypes){			
			ViewManager.smk_teasers_all_images_loaded();
			this.wigdetLoaded();
			var self = this;

			// start searchFilters processing
			// we're queuing processing of each searchField, so that they're processed in a row with a 10ms interval
			var doQueueProcess = function(field){				
				var doQueue= function() {
					ViewManager.callWidgetFn(field, 'process_filter');
				};
				$.taskQueue.add(doQueue, this, 10);	
			};

			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {				
				doQueueProcess(searchFieldsTypes[i]);
				doQueueProcess("adv_" + searchFieldsTypes[i]);
			};			
		};			

		//* image has finished loading in "detail"
		this.smk_detail_this_img_loaded = function(){						
			ViewManager.smk_detail_this_img_loaded();
			this.wigdetLoaded();
			
			var self = this;
			// start details_tabs processing
			// we're queuing processing of each tab, so that they're processed in a row with a 10ms interval
			var doQueueProcess = function(tab){				
				var doQueue= function() {
					ViewManager.callWidgetFn('details_tabs', tab);
				};
				$.taskQueue.add(doQueue, this, 10);	
			};
						
			doQueueProcess('process_init_tabs');
			doQueueProcess('process_reference');
			doQueueProcess('process_related');
			doQueueProcess('process_parts');
			doQueueProcess('process_extended');
			doQueueProcess('process_extended_original');
			doQueueProcess('process_show_extended_titles');	
			doQueueProcess('process_show_tabs');
				
			
		};
	}
}));
