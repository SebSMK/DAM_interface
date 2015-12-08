(function ($) {
	
	AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
	
    httpGetAsync: function(url, callback)
    {  
        var self = this;
        
        $.ajax({
          url: url, 
          dataType: 'jsonp',          
          success: function(data) {
            $.proxy(self, callback(self, data));
          }           
        })          
    },
  
		afterRequest: function () {
    	if (!this.getRefresh()){
				this.setRefresh(true);
				return;
			}
      //var tag_get_url = 'http://csdev-seb-02:4000/tag/get/' + ModelManager.get_q();
      //this.httpGetAsync(tag_get_url, this.proceed_results);
      
      
      var self = this;
      
      if (self.manager.response[self.solrsource].facet_counts.facet_fields[self.field] === undefined) {
				$(self.target).html('no items found in current selection');
				return;
			}
			var maxCount = 0;
			var objectedItems = [];
			for (var facet in self.manager.response[self.solrsource].facet_counts.facet_fields[self.field]) {
				var count = parseInt(self.manager.response[self.solrsource].facet_counts.facet_fields[self.field][facet]);
				if (count > maxCount) {
					maxCount = count;
				}
				objectedItems.push({ facet: facet, count: count });
			}
			
      objectedItems.sort(function (a, b) {
				return a.count < b.count ? 1 : -1;
			});

			$(self.target).fadeOut(500);
			$(self.target).empty();
			$(self.target).hide();
      
      var links = [];
			
      for (var i = 0, l = objectedItems.length; i < l; i++) {
				var facet = objectedItems[i].facet;
				var facet_split = facet.split(':');
				var facet_clean = facet_split.length > 1 ? facet_split[1].replace(/\"/g, "") : facet;
                       
				links.push({"q": facet_clean, "label": facet_clean});				
			}            

			var $target = $(self.target);
			$target.empty();

			if (links.length) {                  
				var html = self.template_integration_json({"current": links}, '#currentItemsTemplate');
				$(self.target).html(html);
				//$(self.target).find('a').click(self.removeClickedFacet());
        // add click handler on each tag
        $(self.target).find('a').click(self.clickHandler());            
			}
			
      
      
      
			$(self.target).fadeIn(500);
			
			//* send finih loading event
			$(self).trigger({
				type: "smk_cloud_load_finished"				
			});            			
		},
		
		proceed_results: function(self, response){              						
			if (response.facet_counts.facet_fields[self.field] === undefined) {
				$(self.target).html('no items found in current selection');
				return;
			}
			var maxCount = 0;
			var objectedItems = [];
			for (var facet in response.facet_counts.facet_fields[self.field]) {
				var count = parseInt(response.facet_counts.facet_fields[self.field][facet]);
				if (count > maxCount) {
					maxCount = count;
				}
				objectedItems.push({ facet: facet, count: count });
			}
			objectedItems.sort(function (a, b) {
				return a.facet < b.facet ? -1 : 1;
			});

			$(self.target).fadeOut(500);
			$(self.target).empty();
			$(self.target).hide();
      
      var links = [];
			
      for (var i = 0, l = objectedItems.length; i < l; i++) {
				var facet = objectedItems[i].facet;
				var facet_split = facet.split(':');
				var facet_clean = facet_split.length > 1 ? facet_split[1].replace(/\"/g, "") : facet;
                       
				links.push({"q": facet_clean, "label": facet_clean});				
			}            

			var $target = $(self.target);
			$target.empty();

			if (links.length) {                  
				var html = self.template_integration_json({"current": links}, '#currentItemsTemplate');
				$(self.target)
        .html(html)        
				//$(self.target).find('a').click(self.removeClickedFacet());            
			}            
			
			$(self.target).fadeIn(500);
			
			//* send finih loading event
			$(self).trigger({
				type: "smk_cloud_load_finished"				
			});
			
			
		},
		
    template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},

	  clickHandler: function () {
	    var self = this;
	    return function (event) {
	      $(self).trigger({
			type: "smk_call_cloud_elem",
			facet: $(event.target).text()
		  });	
	      return false;
	    }
	  }
	});
})(jQuery);