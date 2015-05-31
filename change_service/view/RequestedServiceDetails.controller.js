sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.RequestedServiceDetails", {
	onInit: function() {
		this.utils = sap.umc.mobile.change_service.js.utils;
		sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);
		this._handleRouting();
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "requestedService");
	},

	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "requestedServiceDetails") {
				this.getDataProvider().loadRequestedService(oEvent.getParameter("arguments").Type, oEvent.getParameter("arguments").ID, this);
			}
		}, this);
	},

	onPressBack: function() {
		window.history.back();
	},
	onServiceLoaded: function(oService) {
		this.setData("requestedService", oService);
		this._showPrices(oService.Prices);
	},
	_showPrices: function(aPrices) {
		this.getView().byId("prices_form").removeAllContent();
		for ( var i = 0; i < aPrices.length; i++) {
			var oLabel = new sap.m.Label();
			var oText = new sap.m.Text().addStyleClass("sapUmcBillMText");
			oLabel.setText(aPrices[i].ConditionType);
			oText.setText(aPrices[i].Description);
			this.getView().byId("prices_form").addContent(oLabel);
			this.getView().byId("prices_form").addContent(oText);
		}
	}

});
