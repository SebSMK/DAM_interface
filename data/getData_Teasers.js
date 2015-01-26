(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatateasers = {};
		factory(getdatateasers);
		if (typeof define === "function" && define.amd) {
			define(getdatateasers); // AMD
		} else {
			root.getData_Teasers = getdatateasers; // <script>
		}
	}
}(this, function (getdatateasers) {

	getdatateasers.constructor = function(caller){

		this.getData = function (doc){
			var data;

			var data =  {
					url: this.getDetailUrl(doc),
					
					media:{
						title:  getData_Common.getTitle(doc, 'museum'),	
						alt: getData_Common.getMedia_alt(doc),
						image: getData_Common.getMedia_image(doc, this.caller),						
						copyright: getData_Common.getMedia_copyright(doc, this.caller),
						copyright_default: !smkCommon.computeCopyright(doc) && doc.medium_image_url !== undefined,
						copyright_valid: smkCommon.computeCopyright(doc),
						img_id: doc.id,
						url: this.getDetailUrl(doc)
						
					},
					
					info:{
						producent_kunster: this.getListProducers(doc),																																
						title_museum: this.getListTitle(doc),															
						datering_production_vaerkdatering: getData_Common.getProduction_vaerkdatering(doc),		
						ident_invnummer: getData_Common.getIdent_invnummer(doc),	
						location_location: this.getListLocation(doc, this.caller),
						url: this.getDetailUrl(doc),
						
						title_pad: smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.orig)) ? false : true,						
						
						label_ref: this.caller.manager.translator.getLabel("list_reference")
					},
					
					debug:{
						score: getData_Common.getScore(doc)						
					}
			};	


			return data;

		};  				
		
		this.getDetailUrl = function(doc){									
			var model = {};
			model.q = doc.id;
			model.view = 'detail';

			return ModelManager.buildURLFromModel(model); 
		};
		
		this.getListTitle = function(doc){
			var title = getData_Common.getTitle(doc, 'museum');
			var max = 70;
			var short;
			if (title != undefined && title.length > 0){
				short = title[0].title.length > max ? sprintf('%s(...)', title[0].title.substring(0, max)) : title[0].title;
				title[0].title = short;
			}
				
			return title != undefined && title.length > 0 ? title[0] : null;
		};
		
		this.getListLocation = function (doc, caller){
			var location = smkCommon.firstCapital(doc.location_name);
			var location_inhouse = smkCommon.isValidDataText(location) ? caller.manager.translator.getCollection(smkCommon.replace_dansk_char(location)) : ''; 
			var label = smkCommon.isValidDataText(location_inhouse) ? 
					sprintf('%s %s', caller.manager.translator.getLabel("teaser_on_display"), location) 
						: 
					caller.manager.translator.getLabel("teaser_appoint");
			
			return label;
		};
		
		this.getListProducers = function(doc){									
			var res = new Array();
			var list = new Array();
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.orig)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.orig));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.tilsk)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.tilsk));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.tidl)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.tidl));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.vaerksted)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.vaerksted));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.efterfoel)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.efterfoel));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.inventor)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.inventor));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.skole)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.skole));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.stil)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.stil));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.kopi)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.kopi));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.efterfor)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.efterfor));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.udgiver)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.udgiver));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.trykker)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.trykker));
			if (smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.forfatter)))
				list.push(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.forfatter));
			
			var max = 3;
			
			for (var i = 0, l = list.length; res.length < max && i < l; i++) {
				
				for (var j = 0, k = list[i].length; res.length < max && j < k ; j++) {
					if (res.length == max - 1 && (j + 1 < k || i + 1 < l))
						list[i][j].artist_data.etc = '(...)';
						
					
					if(smkCommon.isValidDataText(list[i][j].artist_data.role))
						list[i][j].artist_data.role = sprintf(' %s', list[i][j].artist_data.role);
						
					res.push(list[i][j]);
				}				
				
			}
			
			return res; 
		};
		
		this.getImage = function ($container, $target){

			var self = this.caller;

			if ($target === undefined || $target.length == 0){
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	
				return;
			}

			var img_id = $target.attr("img_id");
			var path = $target.attr("src");
			var alt = $target.attr("alt");
			var title = $target.attr("alt");

			//
			var img = new Image();

			// wrap our new image in jQuery, then:
			$(img)
			// once the image has loaded, execute this code
			.load(function () {
				// set the image hidden by default    
				$(this).hide();

				// with the holding div #loader, apply:
				$target
				// remove the loading class (so no background spinner), 
				.removeClass('image_loading')				
				.append(this);

				$(this).addClass('not_displayed');				

				// fade our image in to create a nice effect
				var duration = 400;
				$(this).fadeIn({
					duration: duration, 
					complete: function(){
						$(this).removeClass('not_displayed');
						// trig "this image is loaded" event	      
						$(self).trigger({
							type: "smk_teasers_this_img_displayed"
						}); 						
					}
				}
				);

				// trig "this image is loaded" event	      
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	    	  

			})

			// if there was an error loading the image, react accordingly
			.error(function () {
				$target.removeClass('image_loading');	// remove the loading class (so no background spinner), 								
				$target.fadeIn();

				// trig "this image is loaded" event	    	
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	    	  	     
			})	    	

			.attr('alt', alt)
			.attr('title', title)

			// *finally*, set the src attribute of the new image to our image
			.attr('src', path); 
		};

		
		this.addLink = function (event) {
			event.preventDefault();
			$(event.data.caller).trigger({
				type: "smk_search_call_detail",
				detail_url: event.data.detail_url 
			});

			return;
		};
		
		/*
		 * variables
		 */
		this.caller = caller;
	}

}));