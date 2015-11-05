(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatacommon = {};
		factory(getdatacommon);
		if (typeof define === "function" && define.amd) {
			define(getdatacommon); // AMD
		} else {
			root.getData_Common = getdatacommon; // <script>
		}
	}
}(this, function (getdatacommon) {

	/**
	 * Location
	 * */

//	getdatacommon.getLocation_location = function (doc, caller){
//	var location = smkCommon.firstCapital(doc.location_name);
//	var location_inhouse = smkCommon.isValidDataText(location) ? caller.manager.translator.getCollection(smkCommon.replace_dansk_char(location)) : ''; 
//	return smkCommon.isValidDataText(location_inhouse) ? location_inhouse : null;
//	};

	getdatacommon.getLocation_location = function (doc, caller){
		var location = doc.location_name;
		var location_inhouse = smkCommon.isValidDataText(location) ? caller.manager.translator.getCollection(location) : ''; 
		var label = smkCommon.isValidDataText(location_inhouse) ? 
				sprintf('%s %s', caller.manager.translator.getLabel("teaser_on_display"), location_inhouse) 
				: 
					getdatacommon.getIdent_invnummer(doc).toLowerCase().indexOf('kks') == 0 || getdatacommon.getIdent_invnummer(doc).toLowerCase().indexOf('kas') == 0 ? caller.manager.translator.getLabel("teaser_appoint") : null;

					return label;
	};

	getdatacommon.getLocation_location_kks = function (doc, caller){
		return doc.location_kks_kas === undefined ? null : doc.location_kks_kas;		
	};

	/**
	 * Identification
	 * */
	getdatacommon.getIdent_vaerktype = function(doc){							
		var vaerktype;

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			vaerktype = doc.object_type_dk;
			break;
		case "en":
			vaerktype = doc.object_type_en;
			break;
		}

		return smkCommon.isValidDataText(vaerktype) ? vaerktype : null;

	};		

	getdatacommon.getIdent_dele = function(doc){			
		return doc.numberofobjects === undefined ? null : doc.numberofobjects;
	};

	getdatacommon.getIdent_invnummer = function(doc){			
		return doc.id === undefined ? null : doc.id;
	};

	getdatacommon.getIdent_samling = function(doc, caller){	
		if (doc.department === undefined) 
			return null;		

		var dep;
		$.each(getData_Common.enumDepartment, function(key, type) {
			if(doc.department.indexOf(type) > -1){
				dep = smkCommon.firstCapital(caller.manager.translator.getLabel('search_'+ key +'_lab'));;
				return false; //break each loop
			}			
		});
		return dep;
	};

	getdatacommon.getIdent_andet_inv = function(doc){			
		return doc.other_numbers_andet_inventar === undefined ? null : doc.other_numbers_andet_inventar;
	};


	/**
	 * Producent
	 * */
	getdatacommon.getProducent_producent = function(doc, role){
		var artistData = new Array();
		var docBirth;
		var docDeath;
		var docNatio;

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			docBirth = doc.artist_birth_dk;
			docDeath = doc.artist_death_dk;	
			docNatio = doc.artist_natio_dk;
			break;
		case "en":
			docBirth = doc.artist_birth_en;
			docDeath = doc.artist_death_en;
			docNatio = doc.artist_natio_en; 
			break;
		}

		if (doc.artist_name !== undefined){
			// check if all arrays containing artist's data have the same size
			if((doc.artist_name.length != doc.artist_auth.length) && (doc.artist_name.length != doc.artist_natio_dk.length)  && (doc.artist_name.length != docBirth.length) && (doc.artist_name.length != docDeath.length))
				return doc.artist_name;

			for (var i = 0, l = doc.artist_name.length; i < l; i++) {
				if(doc.artist_auth[i] == role){
					var name = doc.artist_name[i];						
					var nationality = smkCommon.isValidDataText(docNatio[i], 'natio') ? docNatio[i] : '';
					var birth = docBirth[i];
					var death = smkCommon.isValidDataText(docDeath[i], 'date') ? docDeath[i] : (docBirth[i] < 1800) ? '(?)' : '';
					var dates = smkCommon.isValidDataText(docDeath[i], 'date') || smkCommon.isValidDataText(docBirth[i], 'date') ? sprintf('%s - %s', birth, death) : '';
					var auth = !smkCommon.isValidDataText(doc.artist_auth[i]) || doc.artist_auth[i] == 'original' ? '' : doc.artist_auth[i]; 

					artistData.push({'artist_data' : 
					{'name' : name,
						'nationality' : nationality,
						'dates' : dates,
						'role': auth}
					});
					//artistData.push(name);

				}
			}		  		  
		}	  

		return artistData;
	};	

	getdatacommon.getProducent_all_producers = function(doc){		
		var self = this;
		var res = new Array();
		var list = new Array();

		$.each(getdatacommon.enumProducent, function(key, type) {
			var prod_datas = getdatacommon.getProducent_producent(doc, type);

			$.each(prod_datas, function(index, data) {
				data.artist_data.type = key;
				res.push(data.artist_data);					
			});								
		});			

		return res; 			
	};

	getdatacommon.getProducent_formeri = function(doc){			
		return doc.formeri === undefined ? null : doc.formeri;
	};

	getdatacommon.getProducent_objectophavsbeskrivelse= function(doc){
		if (doc.objectophavsbeskrivelse === undefined) 
			return null;

		var res = [];
		var split = doc.objectophavsbeskrivelse.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			res.push({value:split[i]});					
		}				

		return res.length > 0 ? res : null;		
	};				

	/**
	 * Titles
	 * */
	getdatacommon.getTitle = function(doc, type){
		if (doc.title_all === undefined) 
			return null;

		var self = this;
		var titles_split = doc.title_all.split(smkCommon.split_1_niv);
		var titles_data = [];			
		var arrayLength = titles_split.length;

		for (var i = 0; i < arrayLength; i++) {					
			var values = titles_split[i].split(smkCommon.split_2_niv);			
			if(smkCommon.getValueFromSplit(values, 4) != null && smkCommon.getValueFromSplit(values, 4).indexOf(type) > -1 ||
					(smkCommon.getValueFromSplit(values, 4) == null && type == 'museum') || 
					(smkCommon.getValueFromSplit(values, 4) != null && smkCommon.getValueFromSplit(values, 4).indexOf('blank') > -1 && type == 'museum') ||
					type == 'first' ||
					type == 'all'){
				var title = smkCommon.getValueFromSplit(values, 0);
				var title_note = smkCommon.getValueFromSplit(values, 1);
				var title_lang = smkCommon.getValueFromSplit(values, 2);
				var title_transl = smkCommon.getValueFromSplit(values, 3);				
				var title_type = smkCommon.getValueFromSplit(values, 4) == null ? 'museum' : smkCommon.getValueFromSplit(values, 4);
				var tmp;
				var translation = new String();

				// we take only the first translation
				if(smkCommon.isValidDataText(title_transl)){
					var split_trans = title_transl.split(smkCommon.split_3_niv); 	           
					if (split_trans.length > 0)	
						translation= split_trans[0].split(smkCommon.split_4_niv)[0];            					           		         	            				                       
				}        	  		  

				tmp = {'title' : title, 'type':title_type};

				if(smkCommon.isValidDataText(title_note))
					tmp.note = title_note;

				if(smkCommon.isValidDataText(translation))
					tmp.trans = translation;								

				titles_data.push(tmp);	

				if(type == 'first')
					break; // in this case, we want only the first title in the list
			}				
		};

		return titles_data.length > 0 ? titles_data : null;			
	};

	getdatacommon.getFirstTitle = function(doc){			
		var title_teaser = getData_Common.getTitle(doc, 'first');			
		var title = new String();

		if(title_teaser != null && title_teaser.length > 0){
			switch(smkCommon.getCurrentLanguage()){
			case "dk":		 		
				title = title_teaser[0].title;
				break;
			case "en":
				title = smkCommon.isValidDataText(title_teaser[0].trans) ? title_teaser[0].trans : title_teaser[0].title; 
				break;
			}									
		}else{				
			title = doc.title_first;
		}

		return smkCommon.isValidDataText(title) ? title : null;
	};

	/**
	 * Production date
	 * */
	getdatacommon.getProduction_vaerkdatering = function(doc){

		var vaerkdatering;

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			vaerkdatering = doc.object_production_date_text_dk;
			break;
		case "en":
			vaerkdatering = doc.object_production_date_text_en;
			break;
		}

		return smkCommon.isValidDataText(vaerkdatering) ? vaerkdatering : null;
	};			

	getdatacommon.getProduction_udgivet_place = function(doc){	
		if (doc.object_production_place_udgivet === undefined) 
			return null;

		var res = [];
		var split = doc.object_production_place_udgivet.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {				
			res.push({value:split[i]});		
		}				

		return res.length > 0 ? res : null;						
	};

	getdatacommon.getProduction_udfoert_place = function(doc){
		if (doc.object_production_place_udfoert === undefined) 
			return null;

		var res = [];
		var split = doc.object_production_place_udfoert.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			res.push({value:split[i]});							
		}	
		
		return res.length > 0 ? res : null;	
	};

	getdatacommon.getProduction_note = function(doc){					
		if (doc.object_production_note === undefined) 
			return null;

		var res = [];
		var split = doc.object_production_note.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			res.push({value:split[i]});					
		}				

		return res.length > 0 ? res : null;
	};

	/**
	 * Technique
	 * */	

	getdatacommon.getTechnique_technique = function (doc){			
		if (doc.prod_technique_dk === undefined && doc.prod_technique_en === undefined) 
			return null;

		var technique;
		var technique_all = [];
		var default_value = null;						

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			technique = doc.prod_technique_dk !== undefined ? doc.prod_technique_dk : default_value;					  			  			  
			break;
		case "en":
			technique = doc.prod_technique_en !== undefined ? doc.prod_technique_en : default_value;
			break;
		default:	
			technique = default_value;
		break;		  
		}

		if(smkCommon.isValidDataText(technique)){
			var tech_split = technique.split(smkCommon.split_1_niv);							
			var arrayLength = tech_split.length;

			for (var i = 0; i < arrayLength; i++) {	
				technique_all.push({value:tech_split[i]});					
			}				
		}

		return technique_all.length == 0 ? null : technique_all;

	};

	getdatacommon.getTechnique_dimensions = function (doc){

		var dimensions = new Array();			

		if (doc.dimension_netto !== undefined)
			dimensions.push( 
					{
						'type' : 'netto',
						'dim' : doc.dimension_netto
					}
			);	

		if (doc.dimension_bladmaal !== undefined)
			dimensions.push( 
					{
						'type' : 'bladmaal',
						'dim' : doc.dimension_bladmaal
					}
			);			

		if (doc.dimension_plademaal!== undefined)
			dimensions.push( 
					{
						'type' : 'plademaal',
						'dim' : doc.dimension_plademaal
					}
			);

		if (doc.dimension_brutto !== undefined)
			dimensions.push( 
					{
						'type' : 'brutto',
						'dim' : doc.dimension_brutto
					}
			);	

		if (doc.dimension_billedmaal !== undefined)
			dimensions.push( 
					{
						'type' : 'billedmaal',
						'dim' : doc.dimension_billedmaal
					}
			);	

		if (doc.dimension_monteringsmaal!== undefined)
			dimensions.push( 
					{
						'type' : 'monteringsmaal',
						'dim' : doc.dimension_monteringsmaal
					}
			);	

		return dimensions;
	};				

	getdatacommon.getTechnique_diameter = function(doc){			
		return doc.dimension_diameter === undefined ? null : doc.dimension_diameter;
	};

	getdatacommon.getTechnique_vaegt = function(doc){			
		return doc.dimension_weight === undefined ? null : doc.dimension_weight;
	};

	getdatacommon.getTechnique_materiale = function(doc){
		var mat;
		var mat_all = [];
		var default_value = null;						

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			mat = doc.materiale !== undefined ? doc.materiale : default_value;					  			  			  
			break;
		case "en":
			mat = doc.materiale_en !== undefined ? doc.materiale_en : default_value;
			break;
		default:	
			mat = default_value;
		break;		  
		}

		if( Object.prototype.toString.call( mat ) === '[object Array]' ){									
			var arrayLength = mat.length;

			for (var i = 0; i < arrayLength; i++) {	
				var values = mat[i].split(smkCommon.split_2_niv); 					 										
				var mat_val = smkCommon.getValueFromSplit(values, 0) != null ? smkCommon.getValueFromSplit(values, 0) : "";
				var mat_type = smkCommon.getValueFromSplit(values, 1) != null ? smkCommon.getValueFromSplit(values, 1) : "";					
				var res = {	mat_val: mat_val, 
						mat_type: mat_type};

				mat_all.push(res);					
			}				
		}

		return mat_all;
	};

	getdatacommon.getTechnique_format = function(doc){			
		return doc.form === undefined ? null : doc.form;
	};

	getdatacommon.getTechnique_watermark = function(doc){			
		return doc.watermark === undefined ? null : doc.watermark;
	};

	getdatacommon.getTechnique_tilstand = function(doc){			
		return doc.physicaldescription === undefined ? null : doc.physicaldescription;
	};

	getdatacommon.getTechnique_vaerkstatus = function(doc){			
		if (doc.vaerkstatus === undefined) 
			return null;

		var res = [];
		var split = doc.vaerkstatus.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			res.push({value:split[i]});					
		}				

		return res.length > 0 ? res : null;
	};


	getdatacommon.getTechnique_vaerkstatus_translate = function(vaerkstatus, caller){
		if (!smkCommon.isValidDataText(vaerkstatus)) 
			return null;
		
		var res = [];									
		var arrayLength = vaerkstatus.length;

		for (var i = 0; i < arrayLength; i++) {	
			var vaerktag = smkCommon.replace_non_alpha_char(smkCommon.replace_dansk_char(vaerkstatus[i].value));
			var value = caller.manager.translator.getLabel('vaerkstatus_' + vaerktag);	
			res.push({value:value});					
		}				

		return res.length > 0 ? res : null;
		
		
	};

	getdatacommon.getTechnique_eksemplar = function(doc){			
		return doc.oplag === undefined ? null : doc.oplag;
	};

	getdatacommon.getTechnique_bladnummer = function(doc){			
		return doc.other_numbers_bladnummer === undefined ? null : doc.other_numbers_bladnummer;
	};

	getdatacommon.getTechnique_sidetal = function(doc){			
		return doc.other_numbers_sidetal === undefined ? null : doc.other_numbers_sidetal;
	};

	getdatacommon.getTechnique_omslag = function(doc){			
		return doc.omslag === undefined ? null : doc.omslag;
	};

	getdatacommon.getTechnique_stadium = function(doc){			
		return doc.stadium === undefined ? null : doc.stadium;
	};

	getdatacommon.getTechnique_kollation = function(doc){
		if (doc.object_briefdescriptions === undefined) 
			return null;

		var res = [];
		var split = doc.object_briefdescriptions.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			if (getdatacommon.getIdent_invnummer(doc).indexOf("/") == -1){ // Only for parent artwork				
				var conv_text = smkCommon.feedlineToHTML(split[i]);
				res.push({value: conv_text});
			}
		}				

		return res.length > 0 ? res : null;

	};

	getdatacommon.getTechnique_note_vaerkstatus = function (doc){			
		if (doc.description_note_dk === undefined && doc.description_note_en === undefined) 
			return null;

		var status;
		var status_all = [];
		var default_value = null;						

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			status = doc.description_note_dk !== undefined ? doc.description_note_dk : default_value;					  			  			  
			break;
		case "en":
			status = doc.description_note_en !== undefined ? doc.description_note_en : doc.description_note_dk !== undefined ? doc.description_note_dk : default_value;
			break;
		default:	
			status = default_value;
		break;		  
		}

		if(smkCommon.isValidDataText(status)){
			var status_split = status.split(smkCommon.split_1_niv);							
			var arrayLength = status_split.length;

			for (var i = 0; i < arrayLength; i++) {	
				status_all.push({value: status_split[i]});					
			}				
		}

		return status_all;

	};

	getdatacommon.getTechnique_opstilling = function(doc){			
		return doc.opstilling === undefined ? null : doc.opstilling;
	};

	getdatacommon.getTechnique_note_elementer = function(doc){			
		return doc.note_elementer === undefined ? null : doc.note_elementer;
	};		

	/**
	 * Inscription
	 * */

	getdatacommon.getInscription_signatur = function(doc){
		if (doc.inscription_signatur === undefined) 
			return null;

		var res = [];
		var inscr_split = doc.inscription_signatur.split(smkCommon.split_1_niv);							
		var arrayLength = inscr_split.length;

		for (var i = 0; i < arrayLength; i++) {					
			var conv_text = smkCommon.feedlineToHTML(inscr_split[i]);
			res.push({value: conv_text});
		}				

		return res.length > 0 ? res : null;
	};

	getdatacommon.getInscription_tryktsignatur = function(doc){	
		if (doc.inscription_tryktsignatur === undefined) 
			return null;

		var res = [];
		var inscr_split = doc.inscription_tryktsignatur.split(smkCommon.split_1_niv);							
		var arrayLength = inscr_split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(inscr_split[i]);
			res.push({value: conv_text});					
		}				

		return res.length > 0 ? res : null;
	};

	getdatacommon.getInscription_paaskrift = function(doc){
		if (doc.inscription_paaskrift === undefined) 
			return null;

		var res = [];
		var inscr_split = doc.inscription_paaskrift.split(smkCommon.split_1_niv);							
		var arrayLength = inscr_split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(inscr_split[i]);
			res.push({value: conv_text});						
		}				

		return res.length > 0 ? res : null;
	};

	getdatacommon.getInscription_trykttekst = function(doc){
		if (doc.inscription_trykttekst === undefined) 
			return null;

		var res = [];
		var inscr_split = doc.inscription_trykttekst.split(smkCommon.split_1_niv);							
		var arrayLength = inscr_split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(inscr_split[i]);
			res.push({value: conv_text});					
		}				

		return res.length > 0 ? res : null;
	};

	getdatacommon.getInscription_samlermaerke = function(doc){
		if (doc.inscription_samlermaerke === undefined) 
			return null;

		var res = [];
		var inscr_split = doc.inscription_samlermaerke.split(smkCommon.split_1_niv);							
		var arrayLength = inscr_split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(inscr_split[i]);
			res.push({value: conv_text});					
		}				

		return res.length > 0 ? res : null;
	};				

	/**
	 * Acquisition
	 * */
	getdatacommon.getErhverv_dato = function(doc){						
		var date;
		var default_value = null;

		switch(smkCommon.getCurrentLanguage()){
		case "dk":		 			  			  			  
			date = doc.acq_date !== undefined ? doc.acq_date : default_value;					  			  			  
			break;
		case "en":
			date = doc.acq_date_eng !== undefined ? doc.acq_date_eng : default_value;
			break;
		default:	
			date = default_value;
		break;		  
		}

		return date;
	};

	getdatacommon.getErhverv_method = function(doc){						
		return doc.acq_method === undefined ? null : doc.acq_method;
	};

	getdatacommon.getErhverv_source= function(doc){						
		return doc.acq_source === undefined ? null : doc.acq_source;
	};							

	getdatacommon.getErhverv_proveniens = function(doc){	
		if (doc.proveniens === undefined) 
			return null;

		var res = [];
		var split = doc.proveniens.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(split[i]);
			res.push({value: conv_text});				
		}				

		return res.length > 0 ? res : null;								
	};

	/**
	 * References
	 * */
	getdatacommon.getReferences_vaerkfortegn = function(doc){			
		return doc.other_numbers_vaerkfortegn === undefined ? null : doc.other_numbers_vaerkfortegn;
	};

	getdatacommon.getReferences_gernsheim = function(doc){			
		return doc.other_numbers_gernsheim === undefined ? null : doc.other_numbers_gernsheim;
	};

	getdatacommon.getReferences_beckett = function(doc){			
		return doc.other_numbers_beckett === undefined ? null : doc.other_numbers_beckett;
	};

	getdatacommon.getReferences_texts = function(doc){
		if(doc.reference_texts === undefined)
			return null;


		var split = doc.reference_texts.split(smkCommon.split_1_niv);
		var arrayLength = split.length;
		var default_value = null;
		var reference_texts = [];

		for (var i = 0; i < arrayLength; i++) {	
			var values = split[i].split(smkCommon.split_2_niv);
			var type = smkCommon.getValueFromSplit(values, 0);
			var text = smkCommon.getValueFromSplit(values, 1);
			var author = smkCommon.getValueFromSplit(values, 3);
			var date = smkCommon.getValueFromSplit(values, 4);

			if(smkCommon.isValidDataText(text)){
				text = smkCommon.feedlineToHTML(text);

				var lang = smkCommon.getValueFromSplit(values, 2);
				var current_lang = "";

				switch(smkCommon.getCurrentLanguage()){
				case "dk":		 			  			  			  
					current_lang = "dansk";
					break;
				case "en":
					current_lang = "engelsk";
					break;
				}

				if(smkCommon.isValidDataText(lang) && lang.indexOf(current_lang) > -1){
					var json = {};

					json['value'] = text;

					if(smkCommon.isValidDataText(type))
						json['type'] = type;

					if(smkCommon.isValidDataText(author))
						json['author'] = author;

					if(smkCommon.isValidDataText(date))
						json['date'] = date;						

					reference_texts.push(json);
				}

			}
		}				

		return reference_texts.length == 0 ? null : reference_texts;

	};	

	getdatacommon.getReferences_litteratur = function(doc){			
		if (doc.citations === undefined) 
			return null;

		var citations_split = doc.citations.split(smkCommon.split_1_niv);
		var citations_data = [];			
		var arrayLength = citations_split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var values = citations_split[i].split(smkCommon.split_2_niv);

			if (smkCommon.isValidDataText(smkCommon.getValueFromSplit(values, 1))){					
				var agent = smkCommon.getValueFromSplit(values, 0);
				var title = smkCommon.getValueFromSplit(values, 1);
				var place = smkCommon.getValueFromSplit(values, 2);
				var date = smkCommon.getValueFromSplit(values, 3);
				var refnote = smkCommon.getValueFromSplit(values, 4);  
				var tmp;

				tmp = sprintf('%s%s%s%s%s' , 
						smkCommon.isValidDataText(agent, 'agent') ? sprintf('%s : ', agent ) : '',
								smkCommon.isValidDataText(title) ? sprintf('<span>%s</span> : ', title ) : '',						
										smkCommon.isValidDataText(place) ? sprintf('%s ', place ) : '',
												smkCommon.isValidDataText(date) ? sprintf('<i>%s</i> :', date ) : ' :',
														smkCommon.isValidDataText(refnote) ? sprintf('%s', refnote ) : '');

				citations_data.push({value:tmp});
			}
		};

		return citations_data.length == 0 ? null : citations_data;

	};

	/**
	 * Exhibitions
	 * */
	getdatacommon.getUdstilling_udstilling = function(doc){
		if (doc.exhibitionvenues === undefined) 
			return null;

		var exhibitionvenues_split = doc.exhibitionvenues.split(smkCommon.split_1_niv);			
		var exhibitions_data = [];			
		var arrayLength = exhibitionvenues_split.length;

		for (var i = 0; i < arrayLength; i++) {
			var values = exhibitionvenues_split[i].split(smkCommon.split_2_niv);

			if (smkCommon.isValidDataText(smkCommon.getValueFromSplit(values, 1))){

				var title = smkCommon.getValueFromSplit(values, 0);
				var place = smkCommon.getValueFromSplit(values, 1);
				var date_start = smkCommon.getValueFromSplit(values, 2);
				var date_end = smkCommon.getValueFromSplit(values, 3);   
				var tmp;

				tmp = sprintf('<span>%s</span> : %s : <i>%s | %s</i>' , 							
						title, 
						place, 
						date_start, 
						date_end);

				if (smkCommon.isValidDataText(title))
					exhibitions_data.push({value:tmp});	      			
			}	      			      
		};

		return exhibitions_data.length == 0 ? null : exhibitions_data;
	}

	/**
	 * Remarks
	 * */
	getdatacommon.getBemaerk_anden_litt = function(doc){	
		if (doc.comments === undefined) 
			return null;

		var res = [];
		var split = doc.comments.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(split[i]);
			res.push({value: conv_text});					
		}				

		return res.length > 0 ? res : null;		
	};

	/**
	 * Motiv
	 * */
	getdatacommon.getMotiv_topografisk = function(doc){	
		if (doc.topografisk_motiv === undefined) 
			return null;

		var res = [];
		var split = doc.topografisk_motiv;							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			res.push({value:split[i]});						
		}				

		return res.length > 0 ? res : null;		
	};

	getdatacommon.getMotiv_portraet = function(doc){
		if (doc.portrait_person === undefined) 
			return null;

		var res = [];
		var split = doc.portrait_person;							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			res.push({value:split[i]});					
		}				

		return res.length > 0 ? res : null;	
	};

	getdatacommon.getMotiv_note = function(doc){	
		if (doc.content_notes === undefined) 
			return null;

		var res = [];
		var split = doc.content_notes.split(smkCommon.split_1_niv);							
		var arrayLength = split.length;

		for (var i = 0; i < arrayLength; i++) {	
			var conv_text = smkCommon.feedlineToHTML(split[i]);
			res.push({value: conv_text});					
		}				

		return res.length > 0 ? res : null;		
	};

	/**
	 * Subwidgets
	 * */

	/* Request for Original work */
	getdatacommon.getSubWidgReq_original = function(doc){
		return doc.related_works_orig_number === undefined ? null : sprintf('id:"%s"', doc.related_works_orig_number);													
	};

	/* Request for Multipart work */
	getdatacommon.getSubWidgReq_vaerkdele = function(doc){
		if(doc.multi_work_ref === undefined )
			return null;

		/*
		var multi_works = doc.multi_work_ref.split(';-;');						
		var allworksRequest = [];		

		for ( var i = 0, l = multi_works.length; i<l; ++i ) {
			var work = multi_works[i].split(';--;');
			if(work.length > 0)
				allworksRequest.push(sprintf('id:%s', work[1]));	
		}
		var res = allworksRequest.length == 0 ? null : allworksRequest.join(' OR ');

		return res == null ? null : sprintf('%s -id:%s', res, doc.id);
		 */		
		var rootId = smkCommon.getValueFromSplit(doc.id.split('/'), 0);
		var partNr = smkCommon.getValueFromSplit(doc.id.split('/'), 1); 
		var includeRootId = partNr != null ? sprintf('id:"%s"', rootId) : null;
		return sprintf('id:%s/* -id:"%s" %s', rootId, doc.id, includeRootId);

	};

	/* Request for Related works */
	getdatacommon.getSubWidgReq_relatere= function(doc){
		if(doc.related_id === undefined )
			return null;

		var related_works = doc.related_id.split(';-;');						
		var allrelatedRequest = [];

		for ( var i = 0, l = related_works.length; i<l; ++i ) {
			var work = related_works[i].split(';--;');
			if(work.length > 0)
				allrelatedRequest.push(sprintf('id:"%s"', work[1]));	
		}

		return allrelatedRequest.length == 0 ? null : allrelatedRequest.join(' OR ');
	};	

	/**
	 * Media
	 * */
	getdatacommon.getMedia_alt = function (doc){	  
		var artist = smkCommon.isValidDataText(getData_Common.getProducent_producent(doc, getData_Common.enumProducent.orig)) ? '' : getData_Common.getProducent_producent(doc, getData_Common.enumProducent.orig) + ' - ';
		var title = getData_Common.getTitle(doc, 'museum');
		var copyright = this.computeCopyright(doc); 

		return  copyright == false ? sprintf('%s%s', artist, title) : sprintf('%s - %s', copyright, title); 	  
	};

	getdatacommon.getMedia_image = function (doc, size){	  			
		return doc.value !== undefined ? smkCommon.getScaledPicture(doc.id, size) : null;
	};

	getdatacommon.getMedia_copyright = function (doc, caller){	  
		var copyright = {};

		copyright.link = caller.manager.translator.getLabel('copyright_link');
		copyright.show = doc.medium_image_url !== undefined && this.computeCopyright(doc);
		copyright.img_cc0 = this.computeCopyright(doc) == false;		
		copyright.text = this.computeCopyright(doc) != false ?	this.computeCopyright(doc).trim() : null;

		return copyright; 	  
	};

	/**
	 * Utils
	 * */
	getdatacommon.computeCopyright = function(doc) {
		return doc.copyright !== undefined ? doc.copyright.replace(String.fromCharCode(169), "") : false;
	};

	/**
	 * Enum
	 * */

	getdatacommon.enumDepartment = {			
			'kks': 'kks',
			'kms': 'kms',
			'kas': 'kas'
	};

	getdatacommon.enumProducent = {			
			'orig': 'original',
			'tilsk': 'tilskrevet',
			'tidl': 'tidl. tilskrevet',
			'vaerksted': 'vAOrksted',
			'efterfoel': 'efterfA¸lger',
			'efter': 'efter',
			'inventor': 'inventor',
			'skole': 'skole',
			'stil': 'stil',
			'kopi': 'kopi efter',
			'efterfor': 'efter forlAOg af',
			'udgiver': 'udgiver',
			'trykker': 'trykker',
			'forfatter': 'forfatter/redaktA¸r'								
	};

	getdatacommon.enumTitleTypes = {			
			"anden":"anden",
			"auktion":"auktion",
			"beskriv":"beskriv",
			"kunstner":"kunstner",
			"museum":"museum",
			"blank":"museum",
			"oeuvre":"oeuvre",
			"popu":"popu",
			"samler":"samler",
			"serie":"serie",		
			"tidlig":"tidlig",		
			"udstill":"udstill"									
	};

	/**
	 * Debug
	 * */

	getdatacommon.getScore = function(doc){
		return doc.score;

	}


}));