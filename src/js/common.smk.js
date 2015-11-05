(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var common = {};
		factory(common);
		if (typeof define === "function" && define.amd) {
			define(common); // AMD
		} else {
			root.smkCommon = common; // <script>
		}
	}
}(this, function (common) {			

	common.version = "000";
	
	common.split_1_niv = ";-;";
	common.split_2_niv = ";--;";
	common.split_3_niv = ";---;";
	common.split_4_niv = ";-v;";	
	
	common.enum_lang = {'def':'dk', 'en':'en', 'dk':'dk'}; //languages
	
	common.getValueFromSplit = function(splited, index){		
		return splited.length > index && common.isValidDataText(splited[index]) ? splited[index] : null;		
	};
	
	common.firstCapital = function(string){				
		return !this.isValidDataText(string) ? '' : string.charAt(0).toUpperCase() + string.slice(1)		
	};
	
	common.feedlineToHTML = function(text){
		if (!this.isValidDataText(text)) return text;
		
		var conv = text.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
		conv = conv.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
		
		return conv;
		
	};
	
	common.isValidDataText = function(text, field){
		text = new String(text);
		if (text === undefined 
				|| text == null 
				|| text == 'undefined'
				|| text == 'null' 
				|| text == '(blank)' 
				|| text.trim() == '')
			return false;

		var field_expr = field === undefined ? 'defaut' : field;
		text = text.trim().toLowerCase();

		switch(field_expr) {
		case 'role':
			if(text == 'original')
				return false
				break;              
		case 'agent':
			if(text == 'unknown')
				return false
				break;
		case 'date':              
		case 'orga_place':
		case 'natio':
			if(text == 'undefined'
				|| text == 'null' 
				|| text == ''
				|| text == '(?)')
				return false
				break;          
		} 

		return true;

	}; 

	common.ordinal_suffix = function (i) {
		var j = 0;
		
		while(i > 21){
			i = i / 10;
		}
			
		if (j == 1 && i != 11) {
			return "st";
		}
		if (j == 2 && i != 12) {
			return "nd";
		}
		if (j == 3 && i != 13) {
			return "rd";
		}
		return "th";
	};

	common.replace_dansk_char = function(text) {				

		if (!common.isValidDataText(text))
			return text;			

		text = text.toLowerCase();
		
		var res = text;

		// utf8 encoding (JSON)
		if (text.match(/[æøåé]/g) != null)
			res = text.replace( /[æ]/g, "ae" ).replace( /[ø]/g, "oe" ).replace( /[å]/g, "aa" ).replace( /[é]/g, "e" );						

		// 
		if (res.match(/[����]/g) != null)
			res = text.replace( /�/g, "ae" ).replace( /�/g, "oe" ).replace( /�/g, "aa" ).replace( /�/g, "e" );						

		return res;
	};
	
	common.replace_non_alpha_char = function(text) {				

		if (text === undefined)
			return text;			

		text = text.toLowerCase();
		
		var res = text.replace( /[^a-zA-Z]/g, "_" );												

		return res;
	};
	
	common.isElemIntoView = function(elem){		   		    								
		return $(elem).visible(true, false, 'vertical');
	};			

	common.getDefaultPicture = function(size){		
		var picturePath = ""
			var server = common.getCurrentServerName();
		var pluginPath = common.getCurrentPluginDir();

		switch(size){
		case "small":		 			  			  			  
			picturePath = 'http://%s/%simages/default_picture_2_small.png';					  			  			  
			break;
		case "medium":		 			  			  			  
			picturePath = 'http://%s/%simages/default_picture_2_medium.png';					  			  			  
			break;
		case "large":		 			  			  			  
			picturePath = 'http://%s/%simages/default_picture_2_large.png';					  			  			  
			break;
		default:		    			  			   							  
			picturePath = 'http://%s/%simages/default_picture_2_small.png';		  	 		  	  
		break;		  
		}	

		return sprintf(picturePath, server, pluginPath);
	};

	common.getPluginURL = function(){
		var server = common.getCurrentServerName();
		var pluginPath = common.getCurrentPluginDir();

		return sprintf('http://%s/%s', server, pluginPath);				
	};	

	common.getScaledPicture = function(id, size){								 	
		var dam_server = 'http://172.20.1.203:4000/imgsrv/get/%s/%s';
		return sprintf(dam_server, id, size);		
	};

	common.getLocation = function(href) {
		var l = document.createElement("a");
		l.href = href;
		return l;
	};	

	common.getCurrentLanguage = function(){		
		return ModelManager.get_lang();
	};

	common.getCurrentPluginDir = function(){		
		return smkSearchAllConf.pluginDir;
	};

	common.getCurrentServerName = function(){		
		return smkSearchAllConf.serverName;
	};		

	common.getSearchPOST = function (){
		return smkSearchAllConf.searchStringPOST;
	};	


	common.removeFirstFromArray = function (arr) {
		if (!AjaxSolr.isArray(arr))
			return [];

		var what, a = arguments, L = a.length, ax;
		what = a[--L];
		
		if(arr.length > 0 && arr[0].value == what)
			arr.splice(0, 1);
		
		return arr;
	};	
	
	common.setVersion = function(version){
		if(version !== undefined)
			common.version = version;
	};
	
	common.getVersion = function(version){		
		return common.version;
	};
	
	/*** debug mode ****/
	
	common.mode = "prod";
	
	common.setMode = function(mode){
		if(mode !== undefined)
			common.mode = mode;
	};
	
	common.getMode = function(mode){		
		return common.mode;
	};			
	
	common.debugTime = function(){		
		return common.mode.indexOf("perf") >= 0;			
	};	
	
	common.debugLog= function(){
		return common.mode.indexOf("debug") >= 0			
	};	
	

}));