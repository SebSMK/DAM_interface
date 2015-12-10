(function ($) {

	AjaxSolr.DetailTabsWidget = AjaxSolr.AbstractWidget.extend({

		constructor: function (attributes) {
			AjaxSolr.DetailTabsWidget.__super__.constructor.apply(this, arguments);
			AjaxSolr.extend(this, {
				partsManager:null,
				parts_subWidget:null,
				relatedManager: null,
				related_subWidget: null,
				originalManager: null,
				original_subWidget: null
			}, attributes);
		},	

		start: 0,

		current_language: null, 

		tab_related_id_req: null,
		
		tab_original_id_req: null,

		tab_multi_work_ref_req: null,

		tab_extended_html: null,
		
		tab_reference_html: null,

		init: function(){	  	    
			var self = this;
			
			self.current_language = self.manager.translator.getLanguage();

			//* related              
			var params = 

			{
					"related": {					
						'rows':20,					
						'start': 0,						
						'fl': self.relatedManager.store.fl_options.related,
						'json.nl': 'map'
					},

					"multi_work": {					
						'rows':20,					
						'start': 0,
						'fq': self.partsManager.store.fq_default,
						'sort': "part_nr asc",
						'fl': self.partsManager.store.fl_options.parts,
						'json.nl': 'map'
					},

					"detail": {					
						'rows':20,					
						'start': 0,
						'fl': self.originalManager.store.fl_options.detail,
						'json.nl': 'map'
					}

			};

			for (var name in params.related) {				
				self.relatedManager.store.addByValue(name, params.related[name]);				
			}   						

			for (var name in params.multi_work) {
				self.partsManager.store.addByValue(name, params.multi_work[name]);			
			}   

			for (var name in params.detail) {				
				self.originalManager.store.addByValue(name, params.detail[name]);
			}   

			//***
			//* original sub widget
			//***
			//* sub widget coupling
			self.originalManager.addWidget(self.original_subWidget); 

			//***
			//* related sub widget
			//***
			//* sub widget coupling
			self.relatedManager.addWidget(self.related_subWidget); 				

			// click on a related artwork
			$(self.related_subWidget).on('smk_search_call_detail', function(event){ 								
				$(self).trigger({
					type: "smk_search_call_detail",
					detail_url: event.detail_url,
					samewin: true
				});
			});

			//***
			//* part sub widget
			//***
			//* sub widget coupling
			self.partsManager.addWidget(self.parts_subWidget); 							

			// click on a component of the artwork
			$(self.parts_subWidget).on('smk_search_call_detail', function(event){ 								
				$(self).trigger({
					type: "smk_search_call_detail",
					detail_url: event.detail_url,
					samewin: true
				});
			});		
			
			//***
			//* events
			//***
			//* all images loaded in parts "teaser"
			$(self.parts_subWidget).on('smk_teasers_all_images_loaded', function(event){     	            	
				self.end_tab_process(self.parts_subWidget.target);
			});		

			//* all images loaded in related "teaser"
			$(self.related_subWidget).on('smk_teasers_all_images_loaded', function(event){     	            	
				self.end_tab_process(self.related_subWidget.target);
			});	
			
			//* original data loaded
			$(self.original_subWidget).on('smk_original_loaded', function(event){     	            	
				self.end_tab_process(self.original_subWidget.target);
			});	

			
		}, 

		process_details_tabs: function () {	  

			var self = this;		
			var $target = $(this.target);

			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			}	

			// in case there are no results
			if (this.manager.response.response.docs.length == 0){
				$target
				// remove the loading class (so the ViewManager can remove background spinner), 
				.removeClass('image_loading')
				.html(this.manager.translator.getLabel("no_results"))	
				// trig "this image is loaded" event	      
				$(self).trigger({
					type: "smk_detail_tabs_loaded"
				});
				return;		
			}			

			var tab_data = null;
			var dataHandler = new getData_Detail_Extended.constructor(this);
			this.tab_multi_work_ref_req = null;
			this.tab_related_id_req = null;
			this.tab_original_id_req = null;

			for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
				var doc = this.manager.response.response.docs[i]; 												
				tab_data = dataHandler.get_data(doc);  
				//* get parts request
				this.tab_multi_work_ref_req = tab_data.subwidget.req_multiwork;	
				//* get related request
				this.tab_related_id_req = tab_data.subwidget.req_relatedid;
				//* get original request
				this.tab_original_id_req = tab_data.subwidget.req_original;
				// get reference text
				this.tab_reference_html = self.template_integration_json(tab_data, '#detailReferenceTemplate');    				
				// get extended text
				this.tab_extended_html = self.template_integration_json(tab_data.info, '#detailExtendedTemplate'); 
			};
			
			this.process_init_tabs();
			this.process_reference();
			this.process_related();
			this.process_parts();
			this.process_extended();
			this.process_extended_original();
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},				

		removeAllParts: function(){
			this.parts_subWidget.removeAllArticles();
		},

		removeAllRelated: function(){
			this.related_subWidget.removeAllArticles();
		},

		process_related: function(){
			if(this.tab_related_id_req != null && this.relatedManager != null){				
				//* start related sub request
				var param = new AjaxSolr.Parameter({name: "q", value: this.tab_related_id_req });					  					
				this.relatedManager.store.add(param.name, param);	 			
				this.relatedManager.doRequest();
			}else{
				this.end_tab_process('#related');
			}
		},	

		process_parts: function(){
			if(this.tab_multi_work_ref_req != null && this.partsManager != null){				
				//* start part sub request
				var param = new AjaxSolr.Parameter({name: "q", value: this.tab_multi_work_ref_req });					  					
				this.partsManager.store.add(param.name, param);	 			
				this.partsManager.doRequest();				
			}else{
				this.end_tab_process('#components');
			}		
		},

		process_extended: function(){
			if(this.tab_extended_html != null){				
				$(this.target).find("#extended_tab").html(this.tab_extended_html);	
				if(smkCommon.debugLog()) console.log('process_extended' + this.tab_extended_html.substring(0, 50));
			}				
			this.end_tab_process('#extended');
		},

		process_extended_original: function(){
			if(this.tab_original_id_req != null && this.originalManager != null){	
				//* start original  sub request
				var param = new AjaxSolr.Parameter({name: "q", value: this.tab_original_id_req });					  					
				this.originalManager.store.add(param.name, param);	 			
				this.originalManager.doRequest();
			}else{
				this.end_tab_process('#tab_original');
			}			
						
		},

		process_reference: function(){
			if(this.tab_reference_html != null){				
				$(this.target).find("#reference_tab").html(this.tab_reference_html);
			}
			this.end_tab_process('#reference');
		},				

		// in the extended tab, show/hide titles of each sub-section
		process_show_extended_titles: function(){			
			var $target = $(this.target);
			$target.find("#extended_tab .data-section").each(function(){				
				if($(this).find(".data-pair").length == 0)										
					// hide title
					$(this).hide();					
			})																								
		},

		process_init_tabs: function(){				
			var self = this;
			var $target = $(self.target);

			$target.css('visibility', 'hidden');
			
			if ($target.is(':empty')){
				//* merge data and template
				var html = self.template_integration_json({}, '#detailTemplate');    
				$target.html(html); 						

				//* click on tab
				$target.find('.tabs').not('.print-tabs').find('a').click(function (event) {
					event.preventDefault();
					$target.find('.tabs').not('.print-tabs').find('a').removeClass("active");
					$(this).addClass("active");												
					$target.find(".tab-content").removeClass("tab-content--open");
					$target.find($(this).attr("href")).addClass("tab-content--open");					
					
					self.refreshLayout();
					
				});													
			}
			
			$target.find('.tabs').not('.print-tabs').find('a').each(function(){
				$(this).removeClass('active');
				$(this).addClass('isloading');
				$target.find($(this).attr('href')).removeClass("tab-content--open");				
				
				//* add text to tabs (and change language if needed)
				$(this).text(self.manager.translator.getLabel($(this).attr('lab-id')));
			});

		},

		process_show_tabs: function(){				
			var self = this;
			var $target = $(self.target);						
			var i = 0;			
			
			$target.find('.tabs').not('.print-tabs').find('a').each(function(){
				
				var tab_content = $target.find($(this).attr('href'));
				if(	$(this).hasClass('dontshow') ||
					(tab_content.find('.data-pair').length == 0 
					&& tab_content.find('.matrix-tile').length == 0
					&& tab_content.find('.copy').length == 0)){
					//* hide empty tabs
					$(this).hide();
				}else{
					//* tab in use - show it
					$(this).show();
					if(i == 0){
						$(this).addClass('active');
						$target.find($(this).attr('href')).addClass("tab-content--open");
						if(smkCommon.debugLog()) console.log('process_show_tabs ' + $target.find($(this).attr('href'))[0].outerHTML.substring(0, 50));
						i++;
					}	
					
					//* if required, add html-code for print
					if ($(this).hasClass('to-print')){
						var print_tab = sprintf('<div class="tabs print-tabs"><a class="active" href="#">%s</a></div>', $(this).text());
						var print_break = '<div class="print-page-break"></div>';						
						
						$target.find($(this).attr('href')).prepend(print_tab);
						
						if ($(this).hasClass('break'))
							$target.find($(this).attr('href')).append(print_break); 
					}										
				} 																		
			});
			
			//self.refreshLayout();

			//* show tabs	
			$target.css('visibility', 'visible');						
		},		
		
		hideTabs: function(){
			var self = this;
			var $target = $(self.target);
			$target.find('.tabs').not('.print-tabs').find('a').each(function(){
			//$target.find(".tabs a").each(function(){
				$(this).removeClass('active');
				$target.find($(this).attr('href')).removeClass("tab-content--open");									
			});			
			$target.css('visibility', 'hidden');
		},
		
		end_tab_process: function(id){
			$(this.target).find(sprintf('a[href=%s]', id)).removeClass('isloading');
			
			// all tabs loaded
			if($(this.target).find('.isloading').length == 0){
				if(smkCommon.debugLog()) console.log('teasers_all_images_loaded'); 
				this.process_show_extended_titles();
				this.process_show_tabs();	
				
				$(this).trigger({
					type: "smk_search_detail_tabs_loaded"
				});
			}													
		},
		
		refreshLayout: function(){
			var self = this;
			var $target = $(self.target);

			this.related_subWidget.refreshViewport();
			this.parts_subWidget.refreshViewport();
		}
	});

})(jQuery);