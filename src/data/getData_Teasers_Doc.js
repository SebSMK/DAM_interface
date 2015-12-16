(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatateasersdoc = {};
		factory(getdatateasersdoc);
		if (typeof define === "function" && define.amd) {
			define(getdatateasersdoc); // AMD
		} else {
			root.getData_Teasers_Doc = getdatateasersdoc; // <script>
		}
	}
}(this, function (getdatateasersdoc) {

	getdatateasersdoc.constructor = function(caller){

		this.getData = function (doc){
			var data;

			var data =  {					
					
					media:{													
						image: getData_Common.getMedia_image(doc, 'medium'),
						no_image: doc.value === undefined ? true : false,
						img_id: doc.id,
						url: this.getDetailUrl(doc),
            type: this.getFileExt(doc)
						
					},
					
					info:{																																					
						title_museum: this.getFileName(doc), 															
						datering_production_vaerkdatering: {lab: 'date created', value: doc.creation_date !== undefined ? doc.creation_date.toString() : '-'},
            ident_invnummer: {lab: 'type', value: doc.application_name !== undefined ? doc.application_name.toString() : '-'}, 
            size: {lab: 'page count', value: doc.page_count !== undefined ? doc.page_count.toString() : '-'},
            author: {lab: 'author', value: doc.author !== undefined ? doc.author.toString() : '-'}, 
            version: doc._version_
					},
					
					debug:{
						score: smkCommon.debugLog() ? getData_Common.getScore(doc) : null					
					}
			};	


			return data;

		};  				
		
    this.getFileName = function(doc){									
		  if(doc.id === undefined || doc.id == null)
        return null;      
       			
			return doc.id.split('/').pop(); 
		};
    
    this.getFileExt = function(doc){									
		  if(doc.id === undefined || doc.id == null)
        return null;      
       			
			return doc.id.split('.').pop(); 
		};
    
		this.getDetailUrl = function(doc){
      var docAPI = 'http://csdev-seb-02:4000/download/doc%s';												
			var url = sprintf(docAPI, doc.id);
			
			return url; 
		};				
		
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
