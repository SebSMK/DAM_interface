var Manager;
var ViewManager;
var EventsManager;

(function ($) {

	$(function () {	  
		var self = this;	

		//******************************
		//** load configuration
		//****************************** 
		ModelManager.setModel($.address.value(), "url");
		var current_language = smkCommon.getCurrentLanguage();

		//** load solr conf  
		var solr_conf = new Configurator.constructor();
		solr_conf.load_json("conf/solr_conf.json");
		var server = solr_conf.get_server();
		var server_proxy = solr_conf.get_server_proxy();		
		var exposed = solr_conf.get_exposed_params();
		var fq_default = solr_conf.get_fq_default();
		var fl_options = solr_conf.get_fl_options();
		var q_default = solr_conf.get_q_default();
		var sort_default = solr_conf.get_sort_default();
		var qf_default = solr_conf.get_qf_default();
		var scroll_rows_default = solr_conf.get_scroll_rows_default();
		var rows_default = solr_conf.get_rows_default();
		var filter_facets = solr_conf.get_filter_facets();
		var autocomplete_facets = solr_conf.get_autocomplete_facets();		
		var all_facets = solr_conf.get_all_facets();
		
		smkCommon.setMode(solr_conf.get_mode());
		smkCommon.setVersion(solr_conf.get_version());

		//** load multi language script 
		var translator = new Language.constructor();	
		translator.load_json("language/language.json");	
		translator.setLanguage(current_language);	

		

		//** create state manager
		ViewManager = new ViewManager.constructor({				
			template: Mustache.getTemplate('templates/general_template.html'),
			target:'#smk_search_wrapper'
		});

		//** create events manager
		EventsManager = new EventsManager.constructor();

		// those functions will be passed as parameter in the manager - we've got to bind it to an environment
		var allWidgetsProcessedBound = $.proxy(EventsManager.allWidgetsProcessed, EventsManager);
		var generalSolrErrorProcessedBound = $.proxy(ViewManager.generalSolrError, ViewManager);

		//******************************
		//** init widgetManager
		//******************************    
		Manager = new AjaxSolr.smkManager({
			solrUrl: server, 
			proxyUrl: server_proxy,
			store: new AjaxSolr.smkParameterStore({
				exposed: exposed,    		
				fq_default: fq_default,
				fl_options: {"list": fl_options.list, "detail": fl_options.detail, "default": fl_options.default},
				q_default: q_default,
				qf_default: qf_default,
				sort_default: sort_default,
				scroll_rows_default: scroll_rows_default,
				facets_default: filter_facets,
				current_lang: current_language
			}),
//			searchfilterList: all_facets,
			allWidgetsProcessed: allWidgetsProcessedBound,
			generalSolrError: generalSolrErrorProcessedBound,
			translator: translator,
			id: 'Manager'
		});

		//* set and save default request parameters                
		var params = {
				'facet.limit': -1,
				'facet.mincount': 1,
				'rows':rows_default,
				'defType': 'edismax',      
				'start': 0,
				'json.nl': 'map'
		};
		for (var name in params) {
			Manager.store.addByValue(name, params[name]);
		}    
		// add facet category with locals params
//		Manager.store.add('facet.field', 
//		new AjaxSolr.Parameter({ name:'facet.field', 
//		value: 'category', 
//		locals: { ex:'category' } }));


		//******************************
		//** init partsManager
		//******************************    
		var partsManager = new AjaxSolr.smkManager({			
			solrUrl: server, 
			proxyUrl: server_proxy,			
			store: new AjaxSolr.smkParameterStore({
				exposed: exposed,
				fq_default: fq_default,
				fl_options: {"parts": fl_options.parts},
				scroll_rows_default: scroll_rows_default,
				current_lang:current_language
			}),
			allWidgetsProcessed: allWidgetsProcessedBound,
			generalSolrError: generalSolrErrorProcessedBound,
			translator: translator,
			id:'partsManager'
		});	

		//******************************
		//** init relatedManager
		//******************************    
		var relatedManager = new AjaxSolr.smkManager({
			solrUrl: server, 
			proxyUrl: server_proxy,			
			store: new AjaxSolr.smkParameterStore({
				exposed: exposed,
				fq_default: null,
				fl_options: {"related": fl_options.related},
				scroll_rows_default: scroll_rows_default,
				current_lang:current_language
			}),
			allWidgetsProcessed: allWidgetsProcessedBound,
			generalSolrError: generalSolrErrorProcessedBound,
			translator: translator,
			id:'relatedManager'
		});	

		//******************************
		//** init getDetailManager
		//******************************    
		var getDetailManager = new AjaxSolr.smkManager({
			solrUrl: server, 
			proxyUrl: server_proxy,		
			store: new AjaxSolr.smkParameterStore({
				exposed: exposed,
				fq_default: null,
				fl_options: {"detail": fl_options.detail},
				current_lang:current_language
			}),
			allWidgetsProcessed: allWidgetsProcessedBound,
			generalSolrError: generalSolrErrorProcessedBound,
			translator: translator,
			id: 'getDetailManager' 
		});	

		//******************************
		//** load widgets
		//******************************

		Manager.addWidget(new AjaxSolr.SearchInfoWidget({
			id: 'search-info',
			target: '#searchinfo',
      solrsource: 'pictures_DAM',			
			template: Mustache.getTemplate('templates/search_info.html')
		}));
		
		Manager.addWidget(new AjaxSolr.SearchBoxAutoWidget({
			id: 'searchboxauto',
			target: '#searchboxauto',			
			template: Mustache.getTemplate('templates/search_box.html'),
			fields: autocomplete_facets 
		}));
		
//		Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
//			id: 'currentsearch',
//			target: '#currentsearch',
//			template: Mustache.getTemplate('templates/current.html')
//		})); 

		Manager.addWidget(new AjaxSolr.LanguagePickerWidget({
			id: 'lang-picker',
			target: '#lang-picker',
			template: Mustache.getTemplate('templates/language_picker.html')
		})); 


		var sorterOpt = {'all': 
							[ {"value": "field_last_updated desc"},
							 	{"value": "score desc"},						        
				        {"value": "invnumber asc"},
				        {"value": "invnumber desc"},
				        {"value": "created desc"},
                {"value": "created asc"}                    
						  ]};		
		
		Manager.addWidget(new AjaxSolr.SorterWidget({
			id: 'sorter',
			target: '#sorter',
			options: sorterOpt,	
			template: Mustache.getTemplate('templates/sorter.html')
		})); 
		
    /*
		Manager.addWidget(new AjaxSolr.CheckBoxWidget({
			id: 'checkbox',
			target: '#checkbox',
			field: 'medium_image_url',
			template: Mustache.getTemplate('templates/checkbox.html')
		}));*/ 			
		
		Manager.addWidget(new AjaxSolr.TeasersWidget({
			id: 'teasers',
			target: '#smk_teasers',
			template: Mustache.getTemplate('templates/teasers.html'),
      solrsource: 'pictures_DAM',	
			initTemplate:'#teaserInitTemplate',
      dataHandler: getData_Teasers,
      triggerId: "smk_teasers_all_images_loaded"
		}));
     
    
    Manager.addWidget(new AjaxSolr.TeasersWidget({
			id: 'teasers_doc',
			target: '#smk_doc_related',
			template: Mustache.getTemplate('templates/teasers_doc.html'),
      solrsource: 'doc_smk',	
			initTemplate:'#teaserInitTemplate',
      dataHandler: getData_Teasers_Doc,
      triggerId: "smk_teasers_all_doc_loaded",
      onClickLink: function (event) {
    			window.location.href(event.data.detail_url);    			
    		}		
		}));
		
    /*
		//* advanced search panel
		Manager.addWidget(new AjaxSolr.AdvancedSearchWidget({
			id: 'advanced',
			target: '#advanced',
			template: Mustache.getTemplate('templates/advancedsearch.html'),
			facets_list: Manager.store.facets_default 
		}));
		
    
		//* filters
		for (var i = 0, l = all_facets.length; i < l; i++) {						
			// advanced search filters
			Manager.addWidget(new AjaxSolr.SearchFiltersWidget({
				id: 'adv_' + all_facets[i],
				target: '#adv_' + all_facets[i],
				field: all_facets[i],
				template: Mustache.getTemplate('templates/chosen.html')
			}));
		};	
		*/
    
    //* cloud widget
		//for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
  		Manager.addWidget(new AjaxSolr.TagcloudWidget({
    		id: 'tag_prev_q',				
    		target: '#tag_prev_q',
    		field: 'prev_q',
        solrsource: 'users_tags',
        template: Mustache.getTemplate('templates/current.html')
  		}));
		//};	

    /*
		//* daterange -> overrides date filter, so it has to be declared after filters
		Manager.addWidget(new AjaxSolr.DateRangeWidget({
			id: 'adv_acq_date_range',
			target: '#adv_acq_date_range',
			field: {'max': 'acq_date_earliest', 'min': 'acq_date_latest'},
			template: Mustache.getTemplate('templates/daterange.html')
		})); 
		
		//* daterange -> overrides date filter, so it has to be declared after filters
		Manager.addWidget(new AjaxSolr.DateRangeWidget({
			id: 'adv_object_production_date_range',
			target: '#adv_object_production_date_range',
			field: {'max': 'object_production_date_earliest' , 'min': 'object_production_date_latest'},
			template: Mustache.getTemplate('templates/daterange.html')
		})); 
    */
    
		//* Detail widget		
		Manager.addWidget(new AjaxSolr.DetailWidget({
			id: 'details',
			target: '#smk_detail',
      solrsource: 'pictures_DAM',
			template: Mustache.getTemplate('templates/detail.html')
		}));
		
    
		//* Parts / Related widgets   
    
     		
		var sub_partsWidget = new AjaxSolr.TeasersWidget({
			id: 'parts',
			target: '#components',
			template: Mustache.getTemplate('templates/teasers.html'),
			initTemplate:'#relatedInitTemplate'
		});
	/*
		var sub_relatedWidget = new AjaxSolr.TeasersWidget({
			id: 'related',
			target: '#related',
			template: Mustache.getTemplate('templates/teasers.html'),
			initTemplate:'#relatedInitTemplate'
		});
    */
		var sub_originalWidget = new AjaxSolr.OriginalWidget({
			id: 'original',
			target: '#tab_original',
			template: Mustache.getTemplate('templates/detail_tabs.html')
		});
    
		Manager.addWidget(new AjaxSolr.DetailTabsWidget({
			id: 'details_tabs',
			target: '#smk_detail_tabs',
			template: Mustache.getTemplate('templates/detail_tabs.html'),
			partsManager: null,
			parts_subWidget: null,
			relatedManager: null,
			related_subWidget: null,
			originalManager: null,
			original_subWidget: null
		}));	
    
    Manager.addWidget(new AjaxSolr.DetailTabsExtendedWidget({
			id: 'details_extended_tabs',
			target: '#extended',
      template: Mustache.getTemplate('templates/detail_tabs.html'),
      solrsource: 'CollectionSpace'
    }));
    
    Manager.addWidget(new AjaxSolr.DetailTabsHighlightWidget({
			id: 'details_highlight_tabs',
			target: '#reference',
      template: Mustache.getTemplate('templates/detail_tabs.html'),
      solrsource: 'CollectionSpace'
    }));
    
    
    
		//******************************
		//** add event listeners
		//******************************

		/*
		 * UI events
		 * 
		 * */		   
		
    
    
    //* click on tag
		$(Manager.widgets['tag_prev_q']).on('smk_call_cloud_elem', function(event){     	
			EventsManager.smk_call_cloud_elem(event);
		});
    
		//* checkbox changed 				
		$(Manager.widgets['checkbox']).on('hasimage', {self: Manager.widgets['checkbox']}, function(event){    		
			EventsManager.smk_search_filter_changed(event.data.self, event.params);    		    		    		    		
		});

		//* searchfilters changed
		for (var i = 0, l = all_facets.length; i < l; i++) {			
			$(Manager.widgets["adv_" + all_facets[i]]).on('smk_search_filter_changed', {self: Manager.widgets["adv_" + all_facets[i]]}, function(event){    		
				EventsManager.smk_search_filter_changed(event.data.self, event.params);    		    		    		    		
			});
		};		

		//* sorter changed
		$(Manager.widgets['sorter']).on('smk_search_sorter_changed', function(event){     	
			EventsManager.smk_search_sorter_changed(event.params, all_facets);
		});         

		//* new free search term input in search box
		$(Manager.widgets['searchbox']).on('smk_search_q_added', function(event){
			EventsManager.smk_search_q_added(event);	    	
		});
		
		//* new facet search term input in autocomplete search box
		$(Manager.widgets['searchboxauto']).on('smk_search_filter_changed', function(event){			
			EventsManager.smk_search_filter_changed(null, event.params);
		});
		
		//* new free search term input in autocomplete search box
		$(Manager.widgets['searchboxauto']).on('smk_search_q_added', function(event){
			EventsManager.smk_search_q_added(event);	    	
		});

//		//* a search string has been removed in current search
//		$(Manager.widgets['currentsearch']).on('smk_search_remove_one_search_string', function(event){     	
//			EventsManager.smk_search_remove_one_search_string(event);
//		});	

		//* calls to detail view
		$(Manager.widgets['teasers']).on('smk_search_call_detail', function(event){     	
			EventsManager.smk_search_call_detail(event);
		});				

		$(Manager.widgets['details_tabs']).on('smk_search_call_detail', function(event){     	
			EventsManager.smk_search_call_detail(event);
		});

		//* change language
		$(Manager.widgets['lang-picker']).on('smk_lang_changed', function(event){  
			EventsManager.smk_lang_changed(event.value);
		});

		/*
		 * Finish loading events
		 * 
		 * */

		//* all images loaded in "list"
		$(Manager.widgets['teasers']).on('smk_teasers_all_images_loaded', function(event){     	            	
			EventsManager.smk_teasers_all_images_loaded(all_facets);
		});		

		//* image has finished loading in "detail"
		$(Manager.widgets['details']).on('smk_detail_this_img_loaded', function(event){ 
			EventsManager.smk_detail_this_img_loaded();
		});
		
		//* all tabs loaded in "detail tabs"
		$(Manager.widgets['details_tabs']).on('smk_search_detail_tabs_loaded', function(event){ 
			EventsManager.smk_search_detail_tabs_loaded();
		});
			
		//******************************
		//** init main widgets / Manager (not subWidgets and subManagers)
		//****************************** 
		ViewManager.init(); 
		Manager.init();  
		EventsManager.init();		

		//******************************
		//** if POSTed, add request string 
		//******************************     
		//* if a request string has been posted, add it to the manager (the request will be handled on page load by $.address.externalChange
		var postedSearchString = smkCommon.getSearchPOST();         
		if(postedSearchString !== undefined && postedSearchString != ''){

			/*
			//* people coming from a request to SMK's search form    
			if (typeof _gaq !== undefined)
				_gaq.push(['_trackEvent','Search', 'Regular search', postedSearchString, 0, true]);
			 */

			var model = {};
			model.q = postedSearchString;		 		 			
			ModelManager.update(model);    	
		}else{
			/*
			//* people coming through direct link to SMK's search               
			if (typeof _gaq !== undefined)
				_gaq.push(['_trackEvent','Search', 'Searching from ingoing link', sprintf('%s searched: %s', document.referrer,  $.address.value()), 0, true]);
			 */
		}
	});

})(jQuery);
