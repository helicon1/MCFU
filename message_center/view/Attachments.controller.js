sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.message_center.view.Attachments", {
	onInit: function() {
		sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "attachments") {
				this._sObjectType = oEvent.getParameter("arguments").Type;
				this._sObjectID = oEvent.getParameter("arguments").ID;
				this._setUploadUrl();
				this._loadAttachments();
			}
		}, this);
	},
	_setUploadUrl: function(sObjectId, sObjectType){
		var _sEntity;
		switch (this._sObjectType) {
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE:
				_sEntity = "Outages";
				break;
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.SERVICE_NOTIFICATION:
				_sEntity = "ServiceNotifications";
				break;
		}
		
		var _sUrl = this.getDataProvider().SERVICE.getServiceUrl() + "/" +_sEntity+ "('" + this._sObjectID + "')/Attachments";
		var oUploadCollection = this.getView().byId("attachmentUploadCollection");
		oUploadCollection.setUploadUrl(_sUrl);
		
		var sToken = this.getDataProvider().SERVICE.oServiceModel.oHeaders["x-csrf-token"];
		var oHeaderParameter = new sap.m.UploadCollectionParameter({
			name: "x-csrf-token",
			value: sToken
		});
		oUploadCollection.addHeaderParameter(oHeaderParameter);
	},
	_loadAttachments: function(){
		var fnCallback = jQuery.proxy(function(oContracts) {
			this.getView().setModel(oAttachments, "Attachments");
		}, this);
		this.getDataProvider().loadAttachment(sEntityName, sEntityId, fnCallback);
	}
	
});