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
						title: getData_Common.getFirstTitle(doc),	
						alt: getData_Common.getMedia_alt(doc),
						image: getData_Common.getMedia_image(doc, 'medium'),
						no_image: doc.medium_image_url === undefined ? true : false,
						copyright: getData_Common.getMedia_copyright(doc, this.caller),	
						copyright_text_cc0: this.caller.manager.translator.getLabel('teaser_copyright_def'),
						img_id: doc.id,
						url: this.getDetailUrl(doc)
						
					},
					
					info:{
						producent_kunster: this.getListAllProducers(doc),																																
						title_museum: getData_Common.getFirstTitle(doc), 															
						datering_production_vaerkdatering:{'lab': smkCommon.firstCapital(this.caller.manager.translator.getLabel('teaser_date_lab')), 'value':getData_Common.getProduction_vaerkdatering(doc)},		
						ident_invnummer: {'lab': smkCommon.firstCapital(this.caller.manager.translator.getLabel("list_reference")), 'value': getData_Common.getIdent_invnummer(doc)},	
						location_location: smkCommon.firstCapital(getData_Common.getLocation_location(doc, this.caller)),
						location_kks: {'lab': smkCommon.firstCapital(this.caller.manager.translator.getLabel("detail_ident_kks_location")), 'value': getData_Common.getLocation_location_kks(doc)},						
						url: this.getDetailUrl(doc)
					},
					
					debug:{
						score: smkCommon.debugLog() ? getData_Common.getScore(doc) : null					
					}
			};	


			return data;

		};  				
		
		this.getDetailUrl = function(doc){									
			var model = {};
			model.q = doc.id;
			model.view = 'detail';
			model.lang = smkCommon.getCurrentLanguage();

			return ModelManager.buildURLFromModel(model); 
		};				
		
//		this.getListLocation = function (doc, caller){
//			var location = smkCommon.firstCapital(doc.location_name);
//			var location_inhouse = smkCommon.isValidDataText(location) ? caller.manager.translator.getCollection(smkCommon.replace_dansk_char(location)) : ''; 
//			var label = smkCommon.isValidDataText(location_inhouse) ? 
//					sprintf('%s %s', caller.manager.translator.getLabel("teaser_on_display"), location) 
//						: 
//					caller.manager.translator.getLabel("teaser_appoint");
//			
//			return label;
//		};
		
		this.getListAllProducers = function(doc){
			var self = this;
			var all_prod_datas = getData_Common.getProducent_all_producers(doc);
			var res = [];
			var max_lines = 3;
			var i = 0;
			
			$.each(all_prod_datas, function(index, data) {	
				if (i >= max_lines){
					res.push({'artist_data':{'name':'...'}});
					return false; //break each loop
				}
									
				data.type = (data.type != 'orig') ? self.caller.manager.translator.getLabel('detail_producent_' + data.type) : null;
				var output = {'artist_data': self.getArtistOutput(data)};				
				res.push(output);
				i++;
				
			});	
			
			res.show = res.length > 0 ? true : false;

			return res; 			
		};				

		this.getArtistOutput = function(doc){
			var res = {};
			
			if (doc.name != undefined)
				res.name = doc.name;
			
			if (smkCommon.isValidDataText(doc.type))
					res.role = doc.type;															
			
			return res;
		};					
		
		this.getImage = function ($src){			

			if ($src === undefined || $src.length == 0)				
				return;			
			
			var path = $src.attr("src");
			var alt = $src.attr("alt");
			var title = $src.attr("alt");
			
			return '<img src="' + path + '" />'; 
		};
		
		
		/*
		 * variables
		 */
		this.caller = caller;
	}

}));
