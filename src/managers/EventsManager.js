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
			});	  	  
		};

		/********
		 * EVENTS
		 * *******/									

		/*
		 * change in address bar
		 * */
		this.addressChange = function(e){	 											

			//* reset all current running ajax request, queued functions and preloaded data
			Manager.requestAbort();
			$.taskQueue.clear();								

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

			//* process language
			Manager.translator.setLanguage(model.lang);		

			Manager.store.set_current_lang(model.lang);
			
			ViewManager.beforeRequest();

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
					//q = sprintf('id:"%s"', model.q);
          q = model.q;			    	
			};

			Manager.store.addByValue('q', q);			

			// facets
			Manager.store.remove('facet');
			Manager.store.remove('facet.field');
			if (model.view != 'detail'){
				Manager.store.addByValue('facet', true);

				// advanced search
				var adv_data = Manager.store.facets_default;

				$.each(adv_data, function( index, adv_values ){
					var values = [];
					var ranges = [];
					
					$.each(adv_values['values'], function( index1, value){

						if(value['ranges'] === undefined)
							values.push(value['id']);
						else{
							var adv_range = value['ranges'];
							var opt = sprintf('f.%s.facet.range.', adv_range['range']);

							ranges.push({id: 'facet.range', value: adv_range['range']});				 
							ranges.push({id: opt + 'start', value: adv_range['start']});
							ranges.push({id: opt + 'end', value: adv_range['end']});
							ranges.push({id: opt + 'gap', value: adv_range['gap']});
							if(adv_range['other'] !== undefined)
								ranges.push({id:opt + 'other', value: adv_range['other']});														
						}												
					});

					if (values.length > 0)
						Manager.store.addByValue('facet.field', values);
					if (ranges.length > 0)
						for (var m = 0, n = ranges.length; m < n; m++) {
							Manager.store.addByValue(ranges[m]['id'],ranges[m]['value'] );									
						}						
				});					
			}																				

			// fq param	
			if (model.view != 'detail')				
				Manager.store.addByValue('fq', Manager.store.fq_default);			

			if(model.fq !== undefined && AjaxSolr.isArray(model.fq)){
				for (var i = 0, l = model.fq.length; i < l; i++) {						
					Manager.store.addByValue('fq', model.fq[i].value, model.fq[i].locals);
				};											
			};

			// auto param (auto parameter is in fact a fq param called from autocomplete box)
			if(model.auto !== undefined && AjaxSolr.isArray(model.auto)){
				for (var i = 0, l = model.auto.length; i < l; i++) {						
					Manager.store.addByValue('fq', model.auto[i].value, model.auto[i].locals);
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
		 * call to detail view
		 * @result:  open detail in a new window
		 * */  
		this.smk_search_call_detail = function(event){						 		  
			var detail_url = event.detail_url + '&fl=detail';
			if(event.samewin == true){
				// open detail in the same window
				ModelManager.update(event.detail_url, "url");
			}
			else{
				// open detail in a new window
				window.open(event.detail_url);
			}						
		};	

		/*
		 * a search string has been added in SearchBox
		 * @result:  model update 
		 * */
		this.smk_search_q_added = function(event){
			if(smkCommon.debugTime()) console.time("smk_search_q_added");
			var search_string = jQuery.trim(event.val);			


			var default_teaser_view = ModelManager.get_view() == 'detail';
			var model = {};										
			model.q = [search_string];					
//			model.sort = ModelManager.current_value_joker;
//			model.view = default_teaser_view ? "teasers" : ModelManager.current_value_joker;
//			model.category = default_teaser_view ? "all" : ModelManager.current_value_joker;
			model.lang = ModelManager.current_value_joker;

//			if (!default_teaser_view)
//				model.fq = ModelManager.current_value_joker;

			ModelManager.update(model);					

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
		 * search filter added / removed
		 * @result:  model update 
		 * */
		this.smk_search_filter_changed = function (caller, params){

			var trigg_req = false;
			var current_fqs = ModelManager.get_fq(); // get all current fq ()

			if (params.selected !== undefined){								
				current_fqs.push(new AjaxSolr.Parameter({ name: 'fq', value: params.selected})); 
				trigg_req = true;
			}else if (params.deselected !== undefined){ 
				// remove from fq list
				current_fqs = jQuery.grep(current_fqs, function(fq) {
					return fq.value != params.deselected;
				});
				trigg_req = true;
			}else if (params.auto !== undefined){				
				trigg_req = true;
			}else if (params.date_range !== undefined){
				$.each(params.date_range, function( key, value){
					// remove from fq list
					current_fqs = jQuery.grep(current_fqs, function(fq) {
						return fq.value.indexOf(key) == -1;
					});
					// if it's valid, add the new value to fq
					if(smkCommon.isValidDataText(value))
						current_fqs.push(new AjaxSolr.Parameter({ name: 'fq', value: value}));																				
				});
					
				trigg_req = true;
			};    

			if (trigg_req){	
				var model = {};					
				model.fq = params.auto !== undefined ? null : params.date_range !== undefined || params.selected !== undefined || params.deselected !== undefined ? current_fqs : ModelManager.current_value_joker;
				model.auto = params.auto !== undefined ? [new AjaxSolr.Parameter({ name: 'fq', value: params.auto})] : ModelManager.current_value_joker;
				model.q = params.auto === undefined ? ModelManager.current_value_joker : null;
				model.sort = ModelManager.current_value_joker;
				model.view = "teasers";
				model.category = "all";
				model.lang = ModelManager.current_value_joker;

				ModelManager.update(model);
			}
		};

		/*
		 * sorting changed
		 * @result:  model update  
		 * */
		this.smk_search_sorter_changed = function(params, all_facets){			
			if (params == undefined)																					
				return;	  

			for (var i = 0, l = all_facets.length; i < l; i++) {				
				ViewManager.callWidgetFn("adv_" + all_facets[i], 'setRefresh', {params: [false]});
			};	

			var sortvalue = params;
			var model = {};
			model.sort = sortvalue;
			model.q = ModelManager.current_value_joker;
			model.auto = ModelManager.current_value_joker;
			model.fq = ModelManager.current_value_joker;	
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;
			model.lang = ModelManager.current_value_joker;

			ModelManager.update(model);	
		};		

		/* 
		 * switch language
		 * @result:  view changes - reset all search and filters in teaser view
		 */
		this.smk_lang_changed = function(lang){ 

			var default_teaser_view = ModelManager.get_view() == 'detail';
			
			var model = {};
			model.lang = lang;
			model.sort = ModelManager.current_value_joker;
			if(ModelManager.get_view() == 'detail')				
				model.q = ModelManager.current_value_joker;				
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
		},

		//* a searchfilter has finished loading	
		this.smk_search_filter_loaded = function(value){			
			ViewManager.remove_modal_loading_from_widget(value);
			this.wigdetLoaded();
		};	

		//* all image have finished loading in "teaser"
		this.smk_teasers_all_images_loaded = function(all_facets){			
			ViewManager.smk_teasers_all_images_loaded();
			this.wigdetLoaded();
			var self = this;

			// start searchFilters processing
			// we're queuing processing of each advanced filter field, so that they're processed in a row with a 10ms interval
			var doQueueProcess = function(field){				
				var doQueue= function() {
					ViewManager.callWidgetFn(field, 'process_filter');
				};
				$.taskQueue.add(doQueue, this, 10);	
			};

			for (var i = 0, l = all_facets.length; i < l; i++) {				
				//doQueueProcess(all_facets[i]);
				doQueueProcess("adv_" + all_facets[i]);
			};			
		};			

		//* image has finished loading in "detail"
		this.smk_detail_this_img_loaded = function(){						
			ViewManager.smk_detail_this_img_loaded();
			this.wigdetLoaded();

			// start details_tabs processing
			ViewManager.callWidgetFn('details_tabs', 'process_details_tabs');
		};
		
		//* all tabs loaded in "detail tabs"		 
		this.smk_search_detail_tabs_loaded = function(){									
			ViewManager.smk_search_detail_tabs_loaded();
			this.wigdetLoaded();
		}		
	}
}));
