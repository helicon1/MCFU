sap.umc.mobile.app.view.MasterBaseController.extend("sap.umc.mobile.change_service.view.ChangeService", {

	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();

		// Model controls visibility of "End Service", "Transfer
		// Service", and "Change Product". They will not appear
		// if user has no contracts
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "changeServiceSettings");
		this.setData("changeServiceSettings", {
			hasContracts: false,
			hasQuotations: false,
			hasPendingContracts: false,
			hasRequestedService: false
		});
		this.getDataProvider().loadPremisesWithContracts(this);
		this._refreshPendingServices();
		sap.ui.getCore().getEventBus().subscribe("pendingServiceChanged", "changeServiceView", $.proxy(function() {
			this._refreshPendingServices();
		}, this));

	},

	_refreshPendingServices: function() {
		this.getDataProvider().loadRequestedServices(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE, this);
		this.getDataProvider().loadRequestedServices(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION, this);
	},

	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "changeServiceMaster") {
				if (!jQuery.device.is.phone) {
					this.showStartService();
					var oList = this.getView().byId("changeServiceList");
					oList.setSelectedItem(this.getView().byId("listItemStartService"));
				}
			}
		}, this);
	},

	onRequestedServicesLoaded: function(type, aServices) {
		if (aServices.length > 0) {
			if (type == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION) {
				this.setProperty("changeServiceSettings", "/hasQuotations", true);
			} else if (type == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE) {
				this.setProperty("changeServiceSettings", "/hasPendingContracts", true);
			}
			this.setProperty("changeServiceSettings", "/hasRequestedService", true);
		}
	},

	onPremisesWithContractsLoaded: function(aPremises) {
		// Check if length is greater than 1 because there is
		// always a "Select an Address" entry returned
		if (aPremises.length > 1) {
			this.setProperty("changeServiceSettings", "/hasContracts", true);
		} else {
			this.setProperty("changeServiceSettings", "/hasContracts", false);
		}
	},

	showStartService: function() {
		var bReplace = !jQuery.device.is.phone;
		// fix navigation issue on desktop - "false"
		this.getRouter().myNavTo("startService", {},  bReplace); 
	},

	showEndService: function() {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("endService", {}, bReplace);
	},

	showTransferService: function() {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("transferService", {}, bReplace);
	},

	showChangeProduct: function() {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("changeProduct", {}, bReplace);
	},

	handleListPress: function(listItem) {
		switch (listItem.getParameter("listItem").getProperty("title")) {
			case this.getText("CHANGE_SERVICE.START_SERVICE"):
				this.showStartService();
				break;
			case this.getText("CHANGE_SERVICE.END_SERVICE"):
				this.showEndService();
				break;
			case this.getText("CHANGE_SERVICE.TRANSFER_SERVICE"):
				this.showTransferService();
				break;
			case this.getText("CHANGE_SERVICE.CHANGE_PRODUCT"):
				this.showChangeProduct();
				break;
		}

	},

	handleRequestedServiceListPress: function(listItem) {
		switch (listItem.getParameter("listItem").getProperty("title")) {
			case this.getText("CHANGE_SERVICE.PENDING_SERVICE"):
				this.showRequestedService(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE);
				break;
			case this.getText("CHANGE_SERVICE.QUOTATION"):
				this.showRequestedService(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION);
				break;
		}
	},
	showRequestedService: function(requestedServieType) {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("requestedService", {
			RequestedServiceType: requestedServieType
		}, false);
	}
});
