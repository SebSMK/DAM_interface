(function ($) {

	AjaxSolr.SearchFiltersWidget = AjaxSolr.AbstractFacetWidget.extend({

		previous_values: {},

		init: function () {
			var self = this;
			var $target = $(this.target);
			var title = self.manager.translator.getLabel("tagcloud_" + this.field);

			var json_data = {"options" : new Array({title:title, search_lab:self.manager.translator.getLabel(sprintf('search_%s_lab', this.id)), values:[{ "value": 'value', "text": ''}]})};	 
			var html = self.template_integration_json(json_data, '#chosenTemplate'); 	

			$target.html(html);	

			this.previous_values[this.field] = new Array(),

			//* init 'chosen' plugin			
			$target.find('select').chosen({
				width: "198px"
			});
  
		},

		beforeRequest: function(){			
			var self = this;
			var $target = $(this.target);					
			
			var $select = $(this.target).find('select');

			if (!self.getRefresh())				
				return;			

			$select.attr('data-placeholder', self.manager.translator.getLabel('search_data_loading'));
			$target.find('select').trigger("chosen:updated");	

		},

		//* processing is started after all images are loaded (managed by the EventManager)
		process_filter: function () {
			var self = this;
			var $target = $(this.target);
			var $select = $(this.target).find('select');
			var title = self.manager.translator.getLabel("tagcloud_" + this.field);

			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			};	 		  	  			  		

			if(smkCommon.debugTime()) console.time("SearchFilters - " + this.field);	
			
			if(smkCommon.debugTime()) console.time("SearchFilters - " + this.field + " - process");
						
			if (self.manager.response.facet_counts.facet_fields[self.field] === undefined &&
				self.manager.response.facet_counts.facet_ranges[self.field] === undefined) {

				return;
			};

			//* proceed facet values
			var maxCount = 0;
			var totalCount = 0;
			var i = 0;
			var objectedItems = [];

			switch (self.field){
			case 'object_production_date_earliest':		 			  			  			  
				for (var facet in self.manager.response.facet_counts.facet_ranges[self.field].counts) {
					var count = parseInt(self.manager.response.facet_counts.facet_ranges[self.field].counts[facet]);
					if (count > maxCount) {
						maxCount = count;
					};	

					var daterange = new Date(facet);
					
					objectedItems.push({ "value": sprintf("[%1$s TO %1$s+100YEARS]", facet), "text": this.getCentury(daterange.getFullYear()), "count": count, "i": i });
					//objectedItems.push({ "value": facet, "text": this.getCentury(daterange.getFullYear()), "count": count, "i": i });
					i++;
				};
				if (self.manager.response.facet_counts.facet_ranges[self.field].before !== undefined && self.manager.response.facet_counts.facet_ranges[self.field].before > 0){
					var count = self.manager.response.facet_counts.facet_ranges[self.field].before;				
					var first_facet = self.manager.response.facet_counts.facet_ranges[self.field].start;
					var datefirst_facet = new Date(first_facet);
					var text = sprintf("%s %s",  self.manager.translator.getLabel("search_filter_before"), this.getCentury(datefirst_facet.getFullYear()));
					
					objectedItems.push({ "value": sprintf("[* TO %s]", first_facet), "text": text, "count": count, "i": i });
					i++;
				}
				
				totalCount = i;
				objectedItems.sort(function (a, b) {
					return parseInt(b.text)-parseInt(a.text);	  	      
				});				  			  			  
				break;	

			case 'artist_natio_en':
			case 'artist_natio_dk':
			case 'object_type_dk':
			case 'object_type_en':
			case 'prod_technique_dk':
			case 'prod_technique_en':
				for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
					var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
					if (count > maxCount) {
						maxCount = count;
					};

					if(smkCommon.isValidDataText(facet)){
						objectedItems.push({ "value": facet, "text": smkCommon.firstCapital(facet).trim(), "count": count, "i": i }); 
						i++;
					}

				};
				totalCount = i;
				objectedItems.sort(function (a, b) {
					if (self.manager.translator.getLanguage() == 'dk')
						return typeof (a.value === 'string') && typeof (b.value === 'string') ? (a.value.trim() < b.value.trim() ? -1 : 1) : (a.value < b.value ? -1 : 1);

						return typeof (a.text === 'string') && typeof (b.text === 'string') ? (a.text.trim() < b.text.trim() ? -1 : 1) : (a.text < b.text ? -1 : 1);
				});	  	 		  	  
				break;					  

			default:		    			  			   							  
				for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
					var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
					if (count > maxCount) {
						maxCount = count;
					};

					objectedItems.push({ "value": facet, "text": smkCommon.firstCapital(facet).trim(), "count": count, "i": i }); 
					i++;	    	  	  	      	  	      
				};
				totalCount = i;
				objectedItems.sort(function (a, b) {
					return typeof (a.value === 'string') && typeof (b.value === 'string') ? (a.value.trim() < b.value.trim() ? -1 : 1) : (a.value < b.value ? -1 : 1);	  	      
				});	  	 		  	  
				break;		  
			};

			//* merge facet data and template			
			var json_data = {"options" : new Array({title:title, totalCount:totalCount, values:objectedItems})};	    	    	    
			var html = self.template_integration_json(json_data, '#chosenTemplate'); 			
			
			if(smkCommon.debugTime()) console.timeEnd("SearchFilters - " + this.field + " - process");						
			if(smkCommon.debugTime()) console.time("SearchFilters - " + this.field + " - chosen");
			
			//* save previous selected values in the target 'select' component	  	 
			$select.find("option:selected").each(function (){
				self.previous_values[self.field].push(this.value.replace(/^"|"$/g, ''));	  		
			});

			//* remove all options in 'select'...
			$select.empty();	  	
			//*... and copy the new option list
			
			$select.append($(html).find('option'));	  		  	
			
			//* add previous selected values in the target 'select' component
			if (self.previous_values[self.field].length > 0){

				// if there were no result after the request, we add 'manually' the previous selected values in the "select" component
				if (objectedItems.length == 0){
					for (var i = 0, l = self.previous_values[self.field].length; i < l; i++) {
						var facet = self.previous_values[self.field][i];
						objectedItems.push({ "value": facet, "text": smkCommon.firstCapital(facet), "count": '0' });					
					}	
					var json_data = {"options" : new Array({title:this.title, values:objectedItems})};	    	    	    
					var html = self.template_integration_json(json_data, '#chosenTemplate');
					$select.append($(html).find('option'));
				}

				// add previous selected values 
				$(this.target).find('select').val(self.previous_values[self.field]); 	

			}			

			//* add behaviour on select change
			$target.find('select').change(self.clickHandler());

			//* change default text			
			$select.attr('data-placeholder', self.manager.translator.getLabel(sprintf('search_%s_lab', this.id)));

			
			if(smkCommon.debugTime()) console.time("SearchFilters - " + this.field + " - chosen - update");
			//* update 'chosen' plugin		
			$target.find('select').trigger("chosen:updated");		
			if(smkCommon.debugTime()) console.timeEnd("SearchFilters - " + this.field + " - chosen - update");
			
			if(smkCommon.debugTime()) console.time("SearchFilters - " + this.field + " - chosen - show");			

			var doQueueShow = function(target){				
				var doShow= function() {
					$(target).find('.chosen-drop').show();
				};
				$.taskQueue.add(doShow, this, 10);	
			};
										
			doQueueShow(self.target);								

			if(smkCommon.debugTime()) console.timeEnd("SearchFilters - " + this.field + " - chosen - show");				
					
			self.previous_values[self.field] = new Array();					
			
			if(smkCommon.debugTime()) console.timeEnd("SearchFilters - " + this.field + " - chosen");
			if(smkCommon.debugTime()) console.timeEnd("SearchFilters - " + this.field);	
			
			//* send "loaded" event
			$(this).trigger({
				type: "smk_search_filter_loaded"
			});
		},


		getCentury: function(facet){

			var number = parseInt(facet);
			var ordinal = "";
			var century = this.manager.translator.getLabel("search_filter_cent");

			switch (this.manager.translator.getLanguage()){
			case "dk":
				//number = (number -1) * 100; 
				ordinal = "-";					  			  			  
				break;
			case "en":		 
				while(number > 21){
					number = number / 10;
				}
				ordinal = smkCommon.ordinal_suffix(number);					  			  			  
				break;		  
			};

			return sprintf('%s%s%s', number, ordinal, century); 

		},

		/**
		 * @param {String} value The value.
		 * @returns {Function} Sends a request to Solr if it successfully adds a
		 *   filter query with the given value.
		 */
		clickHandler: function () {
			var self = this, meth = this.multivalue ? 'add' : 'set';
			return function (event, params) {
				event.stopImmediatePropagation();     	    	

				$(self).trigger({
					type: "smk_search_filter_changed",
					params: params
				});    	    	

				return false;
			}
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},

		/**
		 * @param {String}
		 * */
		addSelectedFilter: function (value){	 
			this.previous_values[this.field].push(value.replace(/^"|"$/g, ''));
		},

		removeAllSelectedFilters: function(removeFromStore){
			var self = this;
			var $select = $(self.target).find('select');

			$select.find("option:selected").each(function (){
				$(this).removeAttr("selected");
				if(removeFromStore == true)
					self.manager.store.removeByValue('fq', self.fq(this.value));
			});	

			//* update 'chosen' plugin		
			$select.trigger("chosen:updated");

			this.previous_values[this.field] = new Array();
		},
		
		change_title: function () {
			var self = this;
			var $target = $(this.target);
			var title = self.manager.translator.getLabel("tagcloud_" + this.field);
			
			$target.find('label').text(title);
		}
	});

})(jQuery);
