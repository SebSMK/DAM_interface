(function ($) {

	AjaxSolr.DetailTabsExtendedWidget = AjaxSolr.AbstractWidget.extend({		 	

		init: function(){	}, 
    
    beforeRequest: function () {
      this.tab_extended_html = null;
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
							// get extended text
				this.tab_extended_html = self.template_integration_json(tab_data.info, '#detailExtendedTemplate'); 
			};
										
			this.process_extended();
		
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},					
	
		process_extended: function(){
			if(this.tab_extended_html != null){				
				$(this.target).html(this.tab_extended_html);	
			}						
		}		
	});

})(jQuery);