(function ($) {

	AjaxSolr.DetailWidget = AjaxSolr.AbstractWidget.extend({

		start: 0,

		current_language: null,

		init: function(){	  	    
			var self = this;

			self.current_language = self.manager.translator.getLanguage();
		}, 		

		afterRequest: function () {	  

			var self = this;		
			var $target = $(this.target);

			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			}	

			$target.empty();

			// in case there are no results
			if (this.manager.response.response.docs.length == 0){
				$target
				// remove the loading class (so the ViewManager can remove background spinner), 
				.removeClass('image_loading')
				.html(this.manager.translator.getLabel("no_results"))	
				// trig "this image is loaded" event	      
				$(self).trigger({
					type: "smk_detail_this_img_loaded"
				});
				return;		
			}			

			var artwork_data = null;
			var dataHandler = new getData_Detail_Standard.constructor(this);			

			for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
				var doc = this.manager.response.response.docs[i]; 												
				artwork_data = dataHandler.get_data(doc);  
			}

			//* merge data and template
			var html = self.template_integration_json({"detail": artwork_data}, '#detailTemplate'); 
			var $html = $(html);						

			// add image			
			var $imgcontainer = $html.find('.gallery__main');												
			if(!$imgcontainer.hasClass('matrix-tile-image-missing')){
				var img = dataHandler.getImage($imgcontainer);				
				$imgcontainer.prepend($(img));
				$imgcontainer.find('img').addClass('image-loading');			

				$imgcontainer.find('img').imagesLoaded().progress( function( imgLoad, image ) {

//					// add copyright info on image
//					$(image.img).mouseenter(function (event) {
//					$html.find('span.copyright-info').css('opacity', 1);}
//					);
//					$(image.img).mouseleave(function (event) {$html.find('span.copyright-info').css('opacity', 0);});

					$(image.img).removeClass('image-loading');	
					
					if (image.isLoaded){// check broken link
						$(image.img).css('opacity', 1);
					}else{
						$imgcontainer.addClass('matrix-tile-image-missing')
					}						

					//* add data to template
					$target.prepend($html); 

					//* add current url to print button					
					$($.find('.print a')).attr('href', window.location.href);					

					//* send loaded event
					$(self).trigger({
						type: "smk_detail_this_img_loaded"
					});
          
          // click on high res
					 $('.mainImg:not([data-zoom=""]), .tool-img-zoom')
		             .click(function () {
		                 if(window.innerWidth >= 1024) {
		                     $('body')
		                             .append($('<div>', {'id': 'img-comparator-cover'}))
		                             .append($('<div>', {'id': 'img-comparator-viewer'})
		                                     .append($('<img>', {
		                                         'class': 'close-icon',
		                                         'src': 'images/close.png'
		                                     }))
		                                     .append($('<iframe>', {
		                                         'src': 'about:blank',
		                                         'frameborder': '0',
		                                         'scrolling': '0'
		                                     })));


		                     $('#img-comparator-viewer .close-icon').click(function () {
		                         $('#img-comparator-cover').remove();
		                         $('#img-comparator-viewer').remove();
		                     });
		                    
		                     var url = "http://csdev-seb-02:4000/imgsrv/test/zoom/" + artwork_data.id;
		                     $('#img-comparator-viewer').find('iframe').attr('src', url);
		                 }
		        });    
            
            // click on download
					 $('.tool-img-down').click(function () {
		            var url = sprintf("http://csdev-seb-02:4000/imgsrv/get/%s/original", artwork_data.id);
                document.getElementById('down_iframe').src = url;		                 		                 
		        });     
          
				});	
			}else{
				//* add data to template
				$target.prepend($html); 

				//* send loaded event
				$(self).trigger({
					type: "smk_detail_this_img_loaded"
				});				
			}																		    	
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		}		
	});

})(jQuery);