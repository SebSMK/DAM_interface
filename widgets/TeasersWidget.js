(function ($) {

	AjaxSolr.TeasersWidget = AjaxSolr.AbstractWidget.extend({  

		start: 0,		  

		default_picture_path: null, 

		//teaser_article_class: null, // current article visualization classes	

		init: function(){

			var self = this;
			var $target = $(this.target);		

			//* load empty template
			var html = self.template;     
			$target.html($(html).find('#teaserInitTemplate').html());					

			//* init masonry*/
			var $matrix = $target.find('.matrix');
			$matrix.masonry( {
				itemSelector: '.matrix-tile',
				columnWidth: '.matrix-tile-size'			
			});
			
			this.default_picture_path = smkCommon.getDefaultPicture('medium');      	

		},  

		afterRequest: function () {  
			var self = this;
			var $target = $(this.target);
			var $matrix = $target.find('.matrix');
			
			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			}	 		  
			
			if(smkCommon.debugTime()) console.time("Teasers");									
			
			var container = document.querySelector($matrix.selector);
			var msnry = Masonry.data(container);
			
			if (this.manager.response.response.docs.length == 0){
				// trig "is loaded" event	      
				$(self).trigger({
					type: "smk_teasers_all_images_loaded"
				});				
				return;		
			}
			else{																														
				var $tiles = this.getTiles();				
				$(msnry.element).masonryImagesReveal(msnry, $tiles,  $.proxy(this.onComplete, self), self, this.onClickLink);				
			}	   
		}, 				
		
		getTiles: function(){			
			var artwork_data = null;		
			var dataHandler = new getData_Teasers.constructor(this);				
			var tiles = new String();													
			
			for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
				var doc = this.manager.response.response.docs[i];	      	      	      
				
				//* load data for this artwork		      
				artwork_data = dataHandler.getData(doc);	      	      

				//* merge data and template
				 var $tile = $(this.template_integration_json({"artworks": artwork_data}, '#teaserArticleTemplate'));
				 
				// add image					
				var $imgcontainer = $tile.find('.matrix-tile-image');								
				
				var img = dataHandler.getImage($imgcontainer);				
				$imgcontainer.prepend( $(img) );
				$imgcontainer.find('img').addClass('image-loading');
				
				tiles += $tile[0].outerHTML;										
			}									
			
			return $(tiles);
			
		},				

		onComplete: function onComplete() {										
			$(this).trigger({
				type: "smk_teasers_all_images_loaded"
			});	
			return true;
		},

		onClickLink: function (event) {
			event.preventDefault();
			$(event.data.caller).trigger({
				type: "smk_search_call_detail",
				detail_url: event.data.detail_url 
			});

			return;
		},
				
		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},

		removeAllArticles: function(){
			
			var $target = $(this.target); 
			var $all_articles = $target.find('.matrix .matrix-tile');
			
			if($all_articles.length > 0 ){
				$target.find('.matrix').masonry('remove', $all_articles);		
			};		  
		}

	});

})(jQuery);

$.fn.masonryImagesReveal = function(msnry, $tiles, onComplete, caller, onClickLink) {	  
	  var itemSelector = msnry.options.itemSelector;
	  // hide by default
	  $tiles.hide();
			  
	  // append to container
	  this.append( $tiles );
	  $tiles.find('img').imagesLoaded().progress( function( imgLoad, image ) {
	    // get item
	    // image is imagesLoaded class, not <img>, <img> is image.img
	    var $tile = $(image.img).parents( itemSelector );	 
		var $imgcontainer = $tile.find('.matrix-tile-image');
	    
		// add click on image
		$imgcontainer.click({detail_url: $imgcontainer.find('a').attr('href'), caller: caller}, 
			function (event) {onClickLink(event);}
		)

		// add click on title
		$tile.find('.artwork-title').click({detail_url: $tile.find('.artwork-title').attr('href'), caller: caller}, 
			function (event) {onClickLink(event);}
		)
		
		// add copyright info on image
		$imgcontainer.find('a').mouseenter(function (event) {$tile.find('span.copyright-info').css('opacity', 1);});
		$imgcontainer.find('a').mouseleave(function (event) {$tile.find('span.copyright-info').css('opacity', 0);});
	    	    
	    $(image.img).removeClass('image-loading');
	    
	    // if all images are loaded, append to masonry
	    if ($(msnry.element).find('img.image-loading').length == 0){	    		    	
		        		    	
	    	$tiles.each(function() {
	    		// show tile
	    		$(this).show();
	    		// masonry does its thing	
	    		msnry.appended( this );
	    	}); 	    	
	    	msnry.on( 'layoutComplete', onComplete);
	    	msnry.layout();
	    }	    	
	  });
	  
	  return this;
};
