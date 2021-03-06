(function (callback) {
	if (typeof define === 'function' && define.amd) {
		define(['core/AbstractManager'], callback);
	}
	else {
		callback();
	}
}(function () {

	/**
	 * @see http://wiki.apache.org/solr/SolJSON#JSON_specific_parameters
	 * @class Manager
	 * @augments AjaxSolr.AbstractManager
	 */
	AjaxSolr.smkManager = AjaxSolr.AbstractManager.extend(
			/** @lends AjaxSolr.Manager.prototype */
			{ 

				constructor: function (attributes) {
					AjaxSolr.smkManager.__super__.constructor.apply(this, arguments);
					AjaxSolr.extend(this, {
//						searchfilterList: [],
						allWidgetsProcessed: null,
						generalSolrError: null,
						translator:null,
						id:null
					}, attributes);
				},	  	  

				xhr: null,	 

				executeRequest: function (servlet, string, handler, errorHandler) {
					var self = this,
					options = {}; // = {dataType: 'jsonp'};
					//options = {dataType: 'html'};
					prev_string = this.store.storedString();
					//string = string || this.store.string();
          string = this.store.string();
					handler = handler || function (data) {
						self.handleResponse(data);
					};   
					errorHandler = errorHandler || function (jqXHR, textStatus, errorThrown) {
						self.handleError(textStatus + ', ' + errorThrown);
					};
					if (this.proxyUrl) {
						//options.url = this.proxyUrl + '?wt=json';
            //options.url = this.proxyUrl + this.solrUrl + '?' +  string + '&wt=json&json.wrf=?';
            //options.url = this.proxyUrl + this.solrUrl + '?' +  string + '&wt=json'; //&json.wrf=?';
            var proxy_path =  ModelManager.get_view() != null ? '/dam/foto/?' : '/dam/search/?';  
            
            options.url = this.proxyUrl + proxy_path + string; 
            options.dataType = 'jsonp';           
						/*
            options.data = {	
								query: 		string, 
								prev_query: prev_string, 
								solrUrl:	this.solrUrl,
								language:	smkCommon.getCurrentLanguage()
						};
						options.type = 'POST';
            */
					}
					else {
						options.url = this.solrUrl + servlet + '?' + string + '&wt=json&json.wrf=?';
					}    

					/*
					 * Executes request
					 * */

					//* 1st method: direct -> JSON without error / timeout handling
					jQuery.ajax(options).done(handler).fail(errorHandler);
					//jQuery.ajax('http://pc-0076/proxySolrPHP/proxy.php').done(handler).fail(errorHandler);

					//* 2nd method: indirect -> JSONP with error / timeout handling
					//this.getJSONP(options, handler);

				},


				// fn to handle jsonp with timeouts and errors
				getJSONP: function(s, handler, errorhandler) {
					var self = this;
					//s.url = "http://csdev-seb:8180/solr-example/SMK_All_v/select?q=*%3A*&wt=json&json.wrf=?";

					//s.url = s.url + '&callback=' + function(data){};       

//					s.data = {'q': "*:*", 'wt':'json'};
//					s.dataType = 'jsonp';
					s.success = handler;
//					s.jsonp = 'json.wrf'

//					s.jsonpCallback = handler;
					this.xhr = jQuery.ajax(s);

					//$.getJSON(s.url, handler);

					// figure out what the callback fn is
					var $script = $(document.getElementsByTagName('head')[0].firstChild);
					var url = $script.attr('src') || '';
					var cb = (url.match(/callback=(\w+)/)||[])[1];
					if (!cb)
						return; // bail
					var t = 0, cbFn = window[cb];

					$script[0].onerror = function(e) {
						$script.remove();
						handleError(s, {}, "error", e);
						clearTimeout(t);
					};

					if (!s.timeout)
						return;

					/*
					 * --------> if you want to use the timeout below, don't forget to clearTimeout after result handling!!!
					 * */ 
//					window[cb] = function(json) {
//					clearTimeout(t);
//					cbFn(json);
//					cbFn = null;
//					};

//					t = setTimeout(function() {
//					$script.remove();
//					handleError(s, {}, "timeout");
//					if (cbFn)
//					window[cb] = function(){};
//					}, s.timeout);

					function handleError(s, o, msg, e) {
						// support jquery versions before and after 1.4.3
						//($.ajax.handleError || $.handleError)(s, o, msg, e);
						if(self.generalSolrError != null)
							self.generalSolrError(msg);
					}
				},


				requestAbort: function(){
					if(this.xhr != null)
						this.xhr.abort();
				},

				/**
				 * This method is executed after the Solr response data arrives. Allows each
				 * widget to handle Solr's response separately.
				 *
				 * @param {Object} data The Solr response.
				 */
				handleResponse: function (data) {
					this.response = data;

					for (var widgetId in this.widgets) {
						this.widgets[widgetId].afterRequest();
					}; 

					//* Uses a callBack function
					//* The whole idea is that this callback function should refer to a function in EventManager
					if(this.allWidgetsProcessed != null)
						this.allWidgetsProcessed();

				}  
			});

}));
