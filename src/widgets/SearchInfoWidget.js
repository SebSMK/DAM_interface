(function ($) {

	AjaxSolr.SearchInfoWidget = AjaxSolr.AbstractWidget.extend({

		afterRequest: function () {	  	
			var self = this;
			
			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			}	 		  			

			var total = parseInt(self.manager.response[self.solrsource].response.numFound);
			
			var $target = $(self.target);
			$target.empty();
			         
			var html = self.template_integration_json({'results': sprintf('%s %s', total, self.manager.translator.getLabel('pager_results'))}, '#searchinfoTemplate');
			$target.html(html);          
		
		},
	
		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		}
	});

})(jQuery);
