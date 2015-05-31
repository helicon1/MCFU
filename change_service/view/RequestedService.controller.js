sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.RequestedService", {
	onInit: function() {
		this.utils = sap.umc.mobile.change_service.js.utils;
		sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "requestedServiceSettings");
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "requestedServices");
		this._handleRouting();
	},

	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "requestedService") {
				this._initializeModels(oEvent.getParameter("arguments").RequestedServiceType);
			}
		}, this);
	},

	_initializeModels: function(requestedServiceType) {
		var sTitle, sTitleSubtext;
		switch (requestedServiceType) {
			case sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE:
				sTitle = this.getText("CHANGE_SERVICE.PENDING_SERVICE");
				sTitleSubtext = this.getText("CHANGE_SERVICE.LIST_OF_NON_ACTIVE_CONTRACTS");
				break;
			case sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION:
				sTitle = this.getText("CHANGE_SERVICE.QUOTATION");
				sTitleSubtext = this.getText("CHANGE_SERVICE.LIST_OF_QUOTATIONS");
				break;
		}
		this.setProperty("requestedServiceSettings", "/title", sTitle);
		this.setProperty("requestedServiceSettings", "/titleSubtext", sTitleSubtext);
		this.getDataProvider().loadRequestedServices(requestedServiceType, this);
	},

	handleListPress: function(oEvent) {
		var oContext = oEvent.getParameter("listItem").getBindingContext("requestedServices");
		var oSelectedService = oContext.getProperty(oContext.getPath());
		this.showDetails(oSelectedService);
	},

	showDetails: function(oSelectedService) {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("requestedServiceDetails", oSelectedService, false);
	},
	onRequestedServicesLoaded: function(type, services) {
		this.setData("requestedServices", services);
	}
});
