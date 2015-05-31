jQuery.sap.declare("sap.umc.mobile.app.Component");

jQuery.sap.require("sap.umc.mobile.foundation.base.Component");

jQuery.sap.require("sap.umc.mobile.app.js.utils");
jQuery.sap.require("sap.umc.mobile.app.js.formatters");
jQuery.sap.require("sap.umc.mobile.app.js.Constants");

jQuery.sap.require("sap.umc.mobile.app.view.BaseController");
jQuery.sap.require("sap.umc.mobile.app.view.FullBaseController");
jQuery.sap.require("sap.umc.mobile.app.view.DetailBaseController");
jQuery.sap.require("sap.umc.mobile.app.view.MasterBaseController");

jQuery.sap.require("sap.umc.mobile.app.model.DataProvider");
jQuery.sap.require("sap.umc.mobile.app.model.DataProviderFactory");
jQuery.sap.require("sap.umc.mobile.app.model.ServiceWrapper");
jQuery.sap.require("sap.umc.mobile.app.model.DataProviderHelper");
jQuery.sap.require("sap.umc.mobile.app.ComponentFactory");

sap.umc.mobile.base.Component.extend("sap.umc.mobile.app.Component", {

	metadata: {
		"name": "sap.umc.mobile.app.Component",
		"version": "1.0.0",
		"description": "UMC Base Component",
		"includes": []
	},
	init: function() {
		sap.umc.mobile.base.Component.prototype.init.apply(this, []);
	},
	_startNavigation: function(){
		var fnInitialNavigation = jQuery.proxy(function(){
			if(this.isAgent()){
				this.navToAgentPanel();
			}else{
				this.navToHome();
			}
		}, this);
		window.addEventListener("hashchange", function(){
			if(window.location.hash === ""){
				fnInitialNavigation();
			}
		    console.log("Hash changed to", window.location.hash);
		});
		fnInitialNavigation();
	},
	isAgent: function(){
		return sap.ui.getCore().getModel("settings").getProperty("/bIsAgent");
	},
	_initializeDataProvider: function() {
		this.oDataProvider = sap.umc.mobile.app.model.DataProvider.init();
	},
	navToHome: function(){
		
		var oSplitScreenWithoutShellContainer = this.getApp().getPage("splitScreenWithoutShellContainer");
		var oMasterPage = oSplitScreenWithoutShellContainer.getMasterPage("homeMasterPage");
		if(!oMasterPage){
			oMasterPage =new sap.ui.xmlview("homeMasterPage", "sap.umc.mobile.home.view.HomeMenu");
			oSplitScreenWithoutShellContainer.addMasterPage(oMasterPage);
			oSplitScreenWithoutShellContainer.setInitialMaster("homeMasterPage");
			oSplitScreenWithoutShellContainer.setMode("HideMode");
		}
		var oHomeComponent = this.getComponents().getHome();
		var bReplace = (this.isAgent())? false : true;
		oHomeComponent.getRouter().myNavTo("home", {}, bReplace);
	},
	navToAgentPanel: function(){
		var oAgentPanelComponent = this.getComponents().getAgentPanel();
		oAgentPanelComponent.getRouter().myNavTo("bpSearch", {}, true);
		
	},
	getDataProvider: function() {
		return this.oDataProvider;
	},
	
	
});
