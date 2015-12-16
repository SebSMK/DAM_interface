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
				var auto_value = ModelManager.get_auto_value();
				var auto_field = auto_value.field;
				var auto_facet = smkCommon.isValidDataText(auto_value.text) ? AjaxSolr.Parameter.unescapeValue(auto_value.text.replace(/^"|"$/g, '')) : null;		
				var q_value = ModelManager.get_q();
				var searchstring = q_value.length != 0 ? q_value.toString() : this.get_text_display(auto_facet, auto_field);

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
			//dropdown_list.initialize();

			$(self.target).find('input.search-bar-field').typeahead({
				hint: false,
				highlight: !0,
				minLength: 1
			}, {
				name: 'autosearch',
				displayKey: 'display',
				source: dropdown_list.ttAdapter(),
				templates: {
					suggestion: function(data){
						return sprintf('<p>%s&nbsp;<i>(%s)</i></p>', data.text_dropdown, data.type);
					}
				}
			});
		},

		init_bloodhound: function(){
			var self = this;
			self.list = [];

			var proxyurl = this.get_proxy_url_ng();      

			return new Bloodhound({
				datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				limit: self.limit,
				remote: {
					url: proxyurl, 
					ajax: {
						beforeSend: function(jqXhr, settings){							
							self.requestSent = false;
						},
						success: function(data, textStatus, jqXHR ){},
						dataType: 'jsonp',

						data: {
							'wt': 'json',
							'solrUrl': self.manager.solrUrl,
							'language': smkCommon.getCurrentLanguage()
						},

						type: 'POST'
					},

					filter:function(response){
						return self.filter_response_ng(response);	
					}  
				}
			});
		},	

		get_text_from_facet: function(facet, field){
			var res = new String();

			switch (field){
			case "materiale":
			case "materiale_en":
				var values = facet.split(smkCommon.split_2_niv); 					 										
				res = smkCommon.isValidDataText(smkCommon.getValueFromSplit(values, 0)) ? smkCommon.firstCapital(smkCommon.getValueFromSplit(values, 0).trim()) : "";										
				break;
			default:
				res = facet;
			break;
			}

			return res;
		},
		
		get_text_display: function(facet, field){
			var text = this.get_text_from_facet(facet, field);
			return smkCommon.isValidDataText(text) ? sprintf('%s (%s)', text, this.manager.translator.getLabel("autocomp_" +  field)) : "";
		},
		
		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},

		get_proxy_url: function(){
			var self = this;
			var qf = (self.manager.store.get_qf_string());			
			var params = [ 'facet=true', 
			               'facet.limit=-1', 
			               'facet.mincount=1', 
			               'json.nl=map', 
			               'sort=score desc',
			               'rows=0',
			               'defType=edismax'];

			for (var i = 0; i < self.fields.length; i++) {
				params.push('facet.field=' + self.fields[i]);
			}			

			var locquery = encodeURIComponent(sprintf('&%s&qf=%s', params.join('&'), qf));								
			var proxyurl = self.manager.proxyUrl + "?query=q%3D%QUERY"+ locquery + "&callback=" + function(data){};

			return proxyurl;

		},

		get_proxy_url_ng: function(){
			var self = this;
			
			var params = [ "facet=true",
			               "facet.mincount=1",
			               "facet.limit=-1",
			               "q.op=AND",
			               "rows=0"];
			
			for (var i = 0; i < self.fields.length; i++) {
				params.push('facet.field=' + self.fields[i]);
			}			

			var locquery = encodeURIComponent(sprintf('&%s', params.join('&')));								
			var proxyurl = self.manager.proxyUrl + "?query=q%3DcollectorAutoCompNG1:(%QUERY)"+ locquery + "&callback=" + function(data){};

			return proxyurl;

		},

		filter_response: function (response) {
			var self = this;

			// clear typeahead list
			self.list = [];

			// Map the remote source JSON array to a JavaScript object array						
			for (var i = 0; i < self.fields.length; i++) {
				var field = self.fields[i];								

				for (var facet in response.facet_counts.facet_fields[field]) {
					if(facet.toLowerCase().indexOf(response.responseHeader.params.q.toLowerCase()) > -1){
						var text = new String();
						self.list.push({
							facet: facet,
							field: field,
							type: self.manager.translator.getLabel("autocomp_" +  field),
							count: response.facet_counts.facet_fields[field][facet],
							text: self.get_text_from_facet(facet, field)
						});
					}

					if (self.list.length >= self.limit)
						break;
				}
			}
			return self.list;				        					           
		},

		filter_response_ng: function (response) {
			var self = this;

			// clear typeahead list
			self.list = [];
			var regExp = /\(([^)]+)\)/;
			var paramq = regExp.exec(response.responseHeader.params.q.toLowerCase());

			// Map the remote source JSON array to a JavaScript object array						
			for (var i = 0; i < self.fields.length; i++) {
				var field = self.fields[i];								

				for (var facet in response.facet_counts.facet_fields[field]) {
					if(self.containSearchString(facet, paramq[1])){
						var text = new String();
						self.list.push({
							facet: facet,
							field: field,
							type: self.manager.translator.getLabel("autocomp_" +  field),
							count: response.facet_counts.facet_fields[field][facet],
							display: self.get_text_display(facet, field),
							text_dropdown: self.get_text_from_facet(facet, field)
						});
					}

					if (self.list.length >= self.limit)
						break;
				}
			}
			return self.list;				        					           
		},

		containSearchString: function(facet, searchString){
			var res = false;
			var searchSplit = searchString.split(" ");

			$.each(searchSplit, function( index, value){
				if(smkCommon.isValidDataText(value) && facet.toLowerCase().indexOf(value) > -1){
					res = true;
					return false; // break each loop
				}
			});

			return res;
		},

		limit: 10

	});

})(jQuery);
