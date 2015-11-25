(function (callback) {
	if (typeof define === 'function' && define.amd) {
		define(['core/Core', 'core/ParameterStore'], callback);
	}
	else {
		callback();
	}
}(function () {

	/**
	 */
	AjaxSolr.smkParameterStore = AjaxSolr.ParameterStore.extend(
			/** @lends AjaxSolr.ParameterStore.prototype */
			{

				constructor: function (attributes) {
					AjaxSolr.smkParameterStore.__super__.constructor.apply(this, arguments);
					AjaxSolr.extend(this, {
						fl_options:null,
						fq_default:null,
						q_default:null,
						qf_default:null,
						sort_default:null,
						scroll_rows_default:null,
						facets_default:null,
						current_lang:null
					}, attributes);
				},	 			


				/******************************
				 * PUBLIC FUNCTIONS
				 * * ****************************/	

				/**
				 * Finds all parameters with matching values.
				 *
				 * @param {String} name The name of the parameter.
				 * @param {String|Number|String[]|Number[]|RegExp} value The value.
				 * @returns {String|Number[]} The indices of the parameters found.
				 */
				//---> overwrite ParameterStore function
				find: function (name, value) {
					if (this.params[name] !== undefined) {
						if (this.isMultiple(name)) {
							var indices = [];
							for (var i = 0, l = this.params[name].length; i < l; i++) {
								//if (AjaxSolr.equals(this.params[name][i].val(), value)) { --> 
								if (this.params[name][i].val().indexOf(value) > -1) {
									indices.push(i);
								}
							}
							return indices.length ? indices : false;
						}
						else {
							if (AjaxSolr.equals(this.params[name].val(), value)) {
								return name;
							}
						}
					}
					return false;
				},

				/**
				 * see removeByvalue function in ParameterStore
				 */
				removeElementFrom_q: function (value) {
					var indices = this.findIn_q(value);
					if (indices) {
						if (AjaxSolr.isArray(indices)) {
							for (var i = indices.length - 1; i >= 0; i--) {
								this.removeIn_q_value(indices[i]);
							}
						}
						else {
							this.remove(indices);
						}
					}
					return indices;
				},


				get_qf_string: function(){

					var res = "";

					if( this.qf_default !== null && this.qf_default[this.current_lang] != null){
						$.each(this.qf_default[this.current_lang], function(k, v) {
							res = res.concat(sprintf(' %s^%s', k, v));
						});		  
					};

					return res;
				},

				set_current_lang: function(lang){
					this.current_lang = lang;										
				},

				extract_fq_without_default: function(){	  
					var res = '';
					var fq_all = this.get('fq') == null ? [] : this.get('fq');
					return smkCommon.removeFirstFromArray(fq_all, this.fq_default);
				},
        
        proxystring: function () {          
          return this.get('q').value == this.q_default ? '*' : this.get('q').value;
        },

				/******************************
				 * PRIVATE FUNCTIONS
				 * * ****************************/	

				/**
				 * see remove function in ParameterStore
				 */
				removeIn_q_value: function (index) {
					var name = 'q';
					if (index === undefined) {
						delete this.params[name];
					}
					else {
						this.params[name].value.splice(index, 1);
						if (this.params[name].value.length == 0) {
							delete this.params[name];
						}
					}
				},

				/**
				 * see find function in ParameterStore
				 */
				findIn_q: function (value) {
					var name = 'q';  
					if (this.params[name] !== undefined) {
						//if (this.isMultiple(name)) {
						var indices = [];
						for (var i = 0, l = this.params[name].val().length; i < l; i++) {
							if (AjaxSolr.equals(this.params[name].val()[i], value)) {
								indices.push(i);
							}    
						}
						return indices.length ? indices : false;
//						}
//						else {
//						if (AjaxSolr.equals(this.params[name].val(), value)) {
//						return name;
//						}
//						}
					}
					return false;
				}

			});
}));
