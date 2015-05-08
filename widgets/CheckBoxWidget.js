(function ($) {

	AjaxSolr.CheckBoxWidget = AjaxSolr.AbstractFacetWidget.extend({	  

		init: function () {

			var self = this;
			var $target = $(this.target);		  		  
			var html = self.template_integration_json({'hasimage':this.manager.translator.getLabel('checkbox_hasimage')}, '#checkboxTemplate');
			$target.html(html);	  	  	  


			$target.find('#has-image').click(function () {
				var params = {};

				if(this.checked)
					params['selected'] = '[* TO *]';
				else
					params['deselected'] = '[* TO *]';		  			  

				$(self).trigger({
					type: "hasimage",
					params: params
				});			
			});
		},

		beforeRequest: function () {
			$(this.target).find('label').html('<i></i>' + smkCommon.firstCapital(this.manager.translator.getLabel('checkbox_hasimage')));
			
			var check = false;
			var fq = ModelManager.get_fq();
			for (var i = 0, l = fq.length; i < l; i++) {
				if(fq[i].value == 'medium_image_url:[* TO *]'){
					check = true;
					break;
				} 								
			}
			
			$(this.target).find('input').prop('checked', check);
		},

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		}

	});

})(jQuery);
