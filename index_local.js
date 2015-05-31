sap.ui.getCore().attachInitEvent(function() {
		
		
	var fnRegisterModules = function(sModuleName, sAppName, sNamespace){
		var sAppUrl = window.location.protocol + "//" + window.location.host + sNamespace + "/" + sAppName;
		jQuery.sap.registerModulePath(sModuleName, sAppUrl);
	};

	fnRegisterModules('sap.umc.mobile.foundation', "sap.umc.mobile.foundation", "");
	fnRegisterModules('sap.umc.mobile.public', "sap.umc.mobile.public", "");
	fnRegisterModules('sap.umc.mobile', "sap.umc.mobile", "");
	fnRegisterModules('sap.umc.mobile.private', "sap.umc.mobile", "");

	var oAppComponent = sap.ui.getCore().createComponent({
	   name: "sap.umc.mobile.app",
	   id: "AppComponent",
	   url: jQuery.sap.getModulePath("sap.umc.mobile") + "/app_private",
	   settings: {
			componentData: {
				isPrivate: true
			}
	   }
	}); 
	//sap.m.URLHelper.redirect("local_index_next.html"); 
	
});