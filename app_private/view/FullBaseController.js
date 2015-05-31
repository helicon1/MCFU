/*global fnBaseProxy */
jQuery.sap.declare("sap.umc.mobile.app.view.FullBaseController");

fnBaseProxy(sap.umc.mobile.base.view.FullBaseController);

sap.umc.mobile.app.view.BaseController.extend("sap.umc.mobile.app.view.FullBaseController", {
	onInit: function() {
		sap.umc.mobile.app.view.BaseController.prototype.onInit.call(this);		
	},
	_initHeader: function() {
		sap.umc.mobile.app.view.BaseController.prototype._initHeader.call(this);
		if(!this.isHome() && !this.isAgentPanel()){
			this.oHeaderFooterHelper.addBackButton();
			this.oHeaderFooterHelper.addHomeButton();
		}
		if(this.oApp.isAgent() && this.isHome()){
			this.oHeaderFooterHelper.addAgentSearchButton();
		}

			this.oHeaderFooterHelper.addUserProfileButton();			

	},
	_initFooter: function() {
		sap.umc.mobile.app.view.BaseController.prototype._initFooter.call(this);
		
		if(!this.isAgentPanel()){
			this.oHeaderFooterHelper.addEmailButton();			
		}else{
			this.oHeaderFooterHelper.setFooter();
		}	
			
	}
});