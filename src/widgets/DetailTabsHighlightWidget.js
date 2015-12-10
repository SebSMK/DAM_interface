(function ($) {

	AjaxSolr.DetailTabsHighlightWidget = AjaxSolr.AbstractWidget.extend({		 	

		init: function(){	}, 

		beforeRequest: function () {
      this.tab_reference_html = null;
      $(this.target).html('&nbsp;');	    
    },
    
    afterRequest: function () {	  

			var self = this;		
			var $target = $(this.target);

			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			}	
     

			var dataHandler = new getData_Detail_Extended.constructor(this);

			for (var i = 0, l = this.manager.response[self.solrsource].response.docs.length; i < l ; i++) {
				var doc = this.manager.response[self.solrsource].response.docs[i]; 												
				tab_data = dataHandler.get_data(doc);  				
				// get reference text
				this.tab_reference_html = self.template_integration_json(tab_data, '#detailReferenceTemplate');    							
			};
					
			this.process_reference();					
		
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},					
			
		process_reference: function(){
			if(this.tab_reference_html != null){				
				$(this.target).html(this.tab_reference_html);
			}			
		}
	});

})(jQuery);