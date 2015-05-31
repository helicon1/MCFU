jQuery.sap.declare("sap.umc.mobile.app.model.DataProviderFactory");

sap.umc.mobile.app.model.DataProviderFactory = jQuery.extend(sap.umc.mobile.base.model.DataProviderFactory, {
	generate: function(sComponentName){
		(function(oOriginalDataProvider){
			var fn = function(oAppDataProvider){
				var oTargetDataProvider = {};
				jQuery.extend(oTargetDataProvider, oOriginalDataProvider, oAppDataProvider);
				sap.umc.mobile[sComponentName].model.DataProvider = oTargetDataProvider;
			};
			fn(sap.ui.getCore().getComponent("AppComponent").getDataProvider());
			sap.ui.getCore().getEventBus().subscribe("App", "contextAccountChanged", function(sChannelId, sEventId, oAppDataProvider) {
				fn(oAppDataProvider);
		    });
		})(jQuery.extend({},(function(){
			return sap.umc.mobile[sComponentName].model.DataProvider;
		})(), (function(){
			var sContextDataProvider = ((sap.ui.getCore().getComponent("AppComponent").getDataProvider().isMock)?"OfflineDataProvider":"OnlineDataProvider");
			var sNamespace = ( sComponentName === "user_management")?"sap.umc.mobile.public":"sap.umc.mobile";
			var sDataProvider = sNamespace + "." + sComponentName + ".model." + sContextDataProvider;
			jQuery.sap.require(sDataProvider);
			return sap.umc.mobile[sComponentName].model[sContextDataProvider];
		})()));
		
	},
	_getAppDataprovider: function() {
		return sap.ui.getCore().getComponent("AppComponent").getDataProvider();	
	}
});