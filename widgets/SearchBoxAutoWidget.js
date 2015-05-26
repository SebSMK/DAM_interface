(function ($) {

	AjaxSolr.SearchBoxAutoWidget = AjaxSolr.AbstractTextWidget.extend({

		requestSent: false,

		list: [],

		init: function () {						
			var self = this;
			var $target = $(this.target);	
			self.requestSent = false;

			self.create_typeahead();	
			self.init_typeahead();			

			// user chooses a result in dropdown list
			$(self.target).find('input.search-bar-field').bind("typeahead:selected", function(obj, data, name) {					
				self.requestSent = true;				
				$(self).trigger({
					type: "smk_search_filter_changed",
					params: {auto: sprintf('%s:%s', data.field, AjaxSolr.Parameter.escapeValue(data.facet))}
				});					
			});
			
			// user validates a search string (lower priority than dropdown list)
			$(self.target).find('input').bind("keydown", function (e) {
				if (self.requestSent === false && e.which == 13) {										
					var value = $(this).val();
					$(self).trigger({
						type: "smk_search_q_added",
						val: value
					});								
				}
			});
		},

		beforeRequest: function(){	
			var self = this;
			self.create_typeahead();	
			self.init_typeahead();			

			// user chooses a result in dropdown list
			$(self.target).find('input.search-bar-field').bind("typeahead:selected", function(obj, data, name) {					
				self.requestSent = true;				
				$(self).trigger({
					type: "smk_search_filter_changed",
					params: {auto: sprintf('%s:%s', data.field, AjaxSolr.Parameter.escapeValue(data.facet))}
				});					
			});
			
			// user validates a search string (lower priority than dropdown list)
			$(self.target).find('input').bind("keydown", function (e) {
				if (self.requestSent === false && e.which == 13) {										
					var value = $(this).val();
					$(self).trigger({
						type: "smk_search_q_added",
						val: value
					});								
				}
			});
		},

		afterRequest: function () {
			var self = this;
			self.requestSent = false;	
		},

		create_typeahead: function(){
			var self = this;
			var $target = $(this.target);
			var json_data = {"default_text" : this.manager.translator.getLabel("search_box_default"), 'search': this.manager.translator.getLabel("search_box_button")};	 
			var html = self.template_integration_json(json_data, '#searchboxTemplate');		  
			$target.html(html);	

			$target.find('input.search-bar-field').typeahead({});

			$(this.target).find('input.search-bar-field.tt-input').bind('input',function(){
				self.requestSent = false;
			});

			if(ModelManager.get_view() != 'detail'){
				var searchstring = ModelManager.get_q().length != 0 ? ModelManager.get_q().toString() : AjaxSolr.Parameter.unescapeValue(ModelManager.get_auto_values().replace(/^"|"$/g, ''));
				$(this.target).find('input.search-bar-field').val(searchstring);
			}

			// add default text
			$(this.target).find('input.search-bar-field.tt-input').attr('placeholder', this.manager.translator.getLabel("search_box_default"));

			// add "text auto selection" on box click
			$(this.target).find('input').on("click", function () {$(this).select();});

			// clear typeahead
			$(this.target).find('input.search-bar-field').typeahead('destroy');

		},
		
		init_typeahead: function(){
			var self = this;
			var dropdown_list = self.init_bloodhound();
			dropdown_list.initialize();

			$(self.target).find('input.search-bar-field').typeahead({
				hint: !0,
				highlight: !0,
				minLength: 1
			}, {
				name: 'autosearch',
				displayKey: 'facet',
				source: dropdown_list.ttAdapter(),
				templates: {
					suggestion: function(data){
						return sprintf('<p>%s&nbsp;<i>(%s)</i></p>', data.facet, self.manager.translator.getLabel("autocomp_" +  data.field));
					}
				}

			});
		},

		init_bloodhound: function(){
			var self = this;
			self.list = [];
			var params = [ 'sort=score desc&fl=*%2C score&facet=true&facet.limit=-1&facet.mincount=1&json.nl=map' ];
			for (var i = 0; i < self.fields.length; i++) {
				params.push('facet.field=' + self.fields[i]);
			}
			var url = self.manager.solrUrl + 'select?' + params.join('&') + '&defType=edismax&qf=collector1&q=%QUERY';
			var solrurl = sprintf('%sselect?%s&defType=edismax&qf=%s&q=%%QUERY', self.manager.solrUrl, params.join('&'), self.manager.store.get_qf_string());			

			return new Bloodhound({
				datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				limit: 10,
				remote: {
					url: solrurl, 
					ajax: {
						beforeSend: function(jqXhr, settings){							
							self.requestSent = false;
						},
						success: function(data, textStatus, jqXHR ){
							//self.requestSent = true;
						},
						dataType: 'jsonp',

						data: {
							'wt': 'json',
							'rows': 0
						},

						jsonp: 'json.wrf'
					},

					filter: function (response) {
						// clear typeahead list
						self.list = [];

						// Map the remote source JSON array to a JavaScript object array						
						for (var i = 0; i < self.fields.length; i++) {
							var field = self.fields[i];								

							for (var facet in response.facet_counts.facet_fields[field]) {
								if(facet.toLowerCase().indexOf(response.responseHeader.params.q.toLowerCase()) > -1)									
									self.list.push({
										facet: facet,
										field: field,										
										count: response.facet_counts.facet_fields[field][facet],
										value: facet + ' (' + response.facet_counts.facet_fields[field][facet] + ') - ' + field
									});
							}
						}
						return self.list;				        					           
					}
				}

			});

		},

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		}

	});

})(jQuery);
