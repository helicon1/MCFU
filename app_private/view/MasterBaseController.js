jQuery.sap.declare("sap.umc.mobile.app.view.MasterBaseController");

fnBaseProxy(sap.umc.mobile.base.view.MasterBaseController);

sap.umc.mobile.app.view.BaseController.extend("sap.umc.mobile.app.view.MasterBaseController", {
	onInit: function() {
		sap.umc.mobile.base.view.BaseController.prototype.onInit.call(this);
	},
	_initHeader: function() {
		sap.umc.mobile.app.view.BaseController.prototype._initHeader.call(this);
		this.oHeaderFooterHelper.addBackButton();
		this.oHeaderFooterHelper.addHomeButton();
		if(jQuery.device.is.phone){
			this.oHeaderFooterHelper.addUserProfileButton();
		}
	},
	_initFooter: function() {
		sap.umc.mobile.app.view.BaseController.prototype._initFooter.call(this);
		if (!this.isMessageCenter()){
			this.oHeaderFooterHelper.addEmailButton();
		}		
	}
});