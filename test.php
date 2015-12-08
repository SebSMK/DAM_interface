<!DOCTYPE html>
<html>
  <head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">  
  <title>SMK | DAM prototype</title>
  

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script src="http://code.jquery.com/jquery-migrate-1.2.1.js"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js"></script>
			
	<script src="src/managers/ModelManager.js" type="text/javascript"></script>	
	  
  	<script src="src/managers/WidgetsManager.js" type="text/javascript"></script>
	<script src="src/core/Core.js" type="text/javascript"></script>
	<script src="src/core/AbstractManager.js" type="text/javascript"></script>
	<script src="src/managers/smkManager.jquery.js" type="text/javascript"></script>
	<script src="src/core/Parameter.js" type="text/javascript"></script>
	<script src="src/core/ParameterStore.js" type="text/javascript"></script>
	<script src="src/core/smkParameterStore.js" type="text/javascript"></script>
	<script src="src/core/AbstractWidget.js" type="text/javascript"></script>
	<script src="src/widgets/DetailWidget.js" type="text/javascript"></script>
	<script src="src/widgets/DetailTabsManagerWidget.js" type="text/javascript"></script>
	<script src="src/widgets/OriginalWidget.js" type="text/javascript"></script>	
	<script src="src/widgets/TeasersWidget.js" type="text/javascript"></script>
  <script src="src/widgets/TeasersDocWidget.js" type="text/javascript"></script>
	<script src="src/widgets/SearchInfoWidget.js" type="text/javascript"></script>	
	<script src="src/widgets/ScrollWidget.js" type="text/javascript"></script>
	<script src="src/widgets/LanguagePickerWidget.js" type="text/javascript"></script>	
	<script src="src/widgets/ScrollUpdateManagerWidget.js" type="text/javascript"></script>				
	<script src="src/core/AbstractFacetWidget.js" type="text/javascript"></script>
	<script src="src/widgets/SearchFiltersWidget.js" type="text/javascript"></script>
	<script src="src/widgets/AdvancedSearchWidget.js" type="text/javascript"></script>
	<script src="src/widgets/CurrentSearchWidget.js" type="text/javascript"></script>
	<script src="src/widgets/CheckBoxWidget.js" type="text/javascript"></script>
	<script src="src/widgets/DateRangeWidget.js" type="text/javascript"></script>		
	<script src="src/managers/EventsManager.js" type="text/javascript"></script>
	<script src="src/managers/ViewManager.js" type="text/javascript"></script>                   
	<script src="src/core/AbstractTextWidget.js" type="text/javascript"></script>
	<script src="src/widgets/SearchBoxAutoWidget.js" type="text/javascript"></script>
	<script src="src/widgets/SorterWidget.js" type="text/javascript"></script>
  <script src="src/widgets/TagCloudWidget.js" type="text/javascript"></script>
	
	<script src="src/data/getData_Common_functions.js" type="text/javascript"></script>			
	<script src="src/data/getData_Detail_Standard.js" type="text/javascript"></script>
	<script src="src/data/getData_Detail_Original.js" type="text/javascript"></script>
	<script src="src/data/getData_Detail_Extented.js" type="text/javascript"></script>		
	<script src="src/data/getData_Teasers.js" type="text/javascript"></script>
  <script src="src/data/getData_Teasers_Doc.js" type="text/javascript"></script>
	<script src="src/data/getData_Advanced.js" type="text/javascript"></script>	
    
  	<script src="src/js/mustache.smk.js" type="text/javascript"></script>	
	<script src="src/js/imageLoaded.smk.extend.js" type="text/javascript"></script>
	<script src="src/js/queueProcessor.js" type="text/javascript"></script>	
	<script src="src/js/sorter.js" type="text/javascript"></script>
  	<script src="src/js/common.smk.js" type="text/javascript"></script>
  	<script src="src/js/language.js" type="text/javascript"></script>
	<script src="src/js/config.js" type="text/javascript"></script>

  
  	<script src="js/supplier/jquery.highlight.js" type="text/javascript"></script>  	
	<script src="js/supplier/backtotop/js/main.js" type="text/javascript"></script>
	<script src="js/supplier/backtotop/js/modernizr.js" type="text/javascript"></script>
  	<script src="js/supplier/imagesloaded.pkgd.min.js" type="text/javascript"></script>  
	<script src="js/supplier/fancybox/source/jquery.fancybox.pack.js" type="text/javascript"></script>
	<script src="js/supplier/jquery.address.js" type="text/javascript"></script>
	<script src="js/supplier/spin.min.js" type="text/javascript"></script>	
  	<script src="js/supplier/chosen.jquery.min.js" type="text/javascript"></script>	      
	<script src="js/supplier/typeahead.bundle.js" type="text/javascript"></script>  
	<script src="js/supplier/sprintf.min.js" type="text/javascript"></script>
	<script src="js/supplier/jquery.visible.min.js" type="text/javascript"></script>
	<script src="js/supplier/feed.js" type="text/javascript"></script>
	<script src="js/supplier/dotdotdot.js" type="text/javascript"></script>
	<script src="js/supplier/dotdotdot-config.js" type="text/javascript"></script>
	<script src="js/supplier/ga.js" type="text/javascript"></script>
	
	<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/themes/smoothness/jquery-ui.css" media="all" />
	<link rel="stylesheet" type="text/css" href="js/supplier/fancybox/source/jquery.fancybox.css" media="all" />	
	<link rel="stylesheet" type="text/css" href="js/supplier/backtotop/css/style.css" media="all" />
	<link rel="stylesheet" type="text/css" href="css/app.css" media="all" />
	<link rel="stylesheet" type="text/css" href="css/smk_modif.css" media="all" />
	<link rel="stylesheet" type="text/css" href="css/print.css" media="print" />
  
  <link rel="stylesheet" type="text/css" href="js/supplier/iip/css/site.css" media="all" />
  <link rel="stylesheet" type="text/css" href="js/supplier/iip/css/content.css" media="all" />


</head>
  <body>

<?php


echo main();

function main() {			
	$content = '';
	
	//* check browser version
	$check_browser = false; 		
	$pattern = '/(?i)msie [4-8]/';
	$u_agent = $_SERVER['HTTP_USER_AGENT'];		

	if(preg_match($pattern,$u_agent))
	{
		// browser is configured in compatibility mode IE <= 8... 
		// ... we must check the "real" IE version			
		$pattern = '/(?i)trident\/\d{1,2}.\d{1,2}/';
		preg_match($pattern, $u_agent, $matches);
		
		if(count($matches) > 0){
			$str = $matches[0];
			
			preg_match_all('!\d+!', $str, $matches_v);
			
			if(count($matches_v) > 0 && count($matches_v[0]) > 0 && $matches_v[0][0] > 4){
				// browser is IE > 8
				$check_browser = true;					
			}				
		}						
	}
	else{
		// browser is IE > 8 or other than IE
		$check_browser = true;
	};				
	
	
	
	//* proceed plugin if browser is IE > 8 or other than IE
	if ($check_browser == true)
	{	
		//echo 'ok';					
		//* get search string in POST
		$sword =  '';//htmlspecialchars($this->piVars['sword']);			
		$dir_base = dirname($_SERVER['PHP_SELF']) == '/' ? "" :  dirname($_SERVER['PHP_SELF']);
		//$dir_base .= t3lib_extMgm::siteRelPath('smk_search_all');						
		$solr_path = 'http://solr-02.smk.dk:8080/solr/prod_all_dk';
		$language = 'dk';
		
		
		//* in first place, we create a dummy page (below in $content) that will be replaced by the Widgets on loading
		//* this trick is implemented in order to avoid a glitch between the call from search form and widget's loading
		$content = sprintf('
		
				<script>
		
				var smkSearchAllConf = {
					solrPath: "%s/",
					pluginDir: "%s/",
					serverName: "%s/",
					currentLanguage: "%s",
					searchStringPOST: "%s"
				}
		
				</script>
					
				<div id="smk_search_wrapper"></div>
								
',
					
				$solr_path,
				$dir_base,
				$_SERVER['SERVER_NAME'],
				$language,
				$sword						
		);
		
	}else{
		// IE<=8
		$content = sprintf('
					
				<div id="smk_search_wrapper">
				<div class="view">
				<div class="container">
				<section class="section--main" role="main">
				<div class="" id="smk_teasers">
				<div id="smk_search_info" style="
				    left: 25%%;
				    padding-left: 2px;
				    padding-right: 2px;
				    top: 10%%;
				    width: 50%%;
				"
				class="tooltipster-base tooltipster-shadow tooltipster-fade tooltipster-fade-show">
		
				<div class="tooltipster-content">
				%s
				</div>
		
				</div>
					
					
				</div>
				</section>
				</div>
				</div>
				</div>',
					
				"You're version of Internet Explorer is outdated.<br><br>Please update Internet Explorer, or try accessing our website with another browser (Firefox, Safari, Opera...).<br><br>Thank you for your understanding."
		
		);			
	}

	return $content;
}


?>

  </body>
</html>
