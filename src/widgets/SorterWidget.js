(function ($) {

	AjaxSolr.SorterWidget = AjaxSolr.AbstractFacetWidget.extend({

		constructor: function (attributes) {
			AjaxSolr.AbstractFacetWidget.__super__.constructor.apply(this, arguments);
			AjaxSolr.extend(this, {
				options:{}
			}, attributes);
		},						
		
		beforeRequest: function () {                  	  
			var self = this;
			var $target = $(this.target);			
			var objectedItems = new Array();			
			var all_options = jQuery.extend(true, {}, this.options); // clone json
			var optDef = true;
			
			// get current selected option
			for (var i = 0, l = all_options.all.length; i < l; i++) {
				if(ModelManager.getModel().sort == all_options.all[i].value){
					all_options.all[i].selected = true;
					optDef = false;
					break;
				}				
			};			
			if(optDef)
				all_options.all[0].selected = true;
			
			for (var i = 0, l = all_options.all.length; i < l; i++) {
				all_options.all[i].text = smkCommon.firstCapital(self.manager.translator.getLabel("sorter_" + all_options.all[i].value));
				objectedItems.push(all_options.all[i]);    	  
			}

			//* init template
			var html = self.template_integration_json(
					{	"label": smkCommon.firstCapital(this.manager.translator.getLabel("sorter_sort")),
					"options": objectedItems}, 
				'#sorterItemsTemplate');
			$target.html(html);

			$(".dropit-sortby").dropit(), // Add active submenu item's text to trigger link.
			// So that you can see what's active.
			$(".dropit-sortby .dropit-toggle span").text($(".dropit-sortby li.active a").text()), 
			// Prevent default when selecting
			$(".dropit ul li a").click(function(a) {
				a.preventDefault();
			}), // Make the selected li active
			$(".dropit ul li").click(function() {
				var a = $(this).closest(".dropit");
				// Remove other active classes
				$(this).siblings().each(function() {
					// console.log(el);
					$(this).removeClass("active");
				}), // Make the selected active
				$(this).addClass("active"), // Show the selected text
				a.find(".dropit-toggle span").text($(this).find("a").text());

				$(self).trigger({
					type: "smk_search_sorter_changed",
					params: $(this).attr("sort")
				});  

			});
		},
		
		/**
		 * @returns {Function} Sends a request to Solr if it successfully adds a
		 *   filter query with the given value.
		 */
		clickHandler: function () {   
			var self = this;
			return function (event, params) {
				event.stopImmediatePropagation(); 

				$(self).trigger({
					type: "smk_search_sorter_changed",
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

		resetSelect: function() {
			$(this.target).find('select').prop('selectedIndex',0);	  	  
			//* update 'chosen' plugin		
			$(this.target).find('select').trigger("chosen:updated");	  	  
		},

		setOption: function(option) {
			$(this.target).find('select').val(option);
			$(this.target).find('select').trigger("chosen:updated");
		}
	});

})(jQuery);
