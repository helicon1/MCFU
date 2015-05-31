jQuery.sap.declare("sap.umc.mobile.app.view.DetailBaseController");

fnBaseProxy(sap.umc.mobile.base.view.DetailBaseController);

sap.umc.mobile.app.view.BaseController.extend("sap.umc.mobile.app.view.DetailBaseController", {
	onInit: function() {
		sap.umc.mobile.app.view.BaseController.prototype.onInit.call(this);
	},
	_initHeader: function() {
		sap.umc.mobile.app.view.BaseController.prototype._initHeader.call(this);
		if(jQuery.device.is.phone){
			this.oHeaderFooterHelper.addBackButton();
			this.oHeaderFooterHelper.addHomeButton();
		}
		this.oHeaderFooterHelper.addUserProfileButton();
	},
	_initFooter: function() {
		sap.umc.mobile.app.view.BaseController.prototype._initFooter.call(this);
		if(jQuery.device.is.phone){
			this.oHeaderFooterHelper.addEmailButton();
		}
	}
});