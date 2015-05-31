sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.SelectProduct", {

	onInit: function() {
		this.utils = sap.umc.mobile.change_service.js.utils;

		sap.ui.getCore().getEventBus().subscribe("changeService", "updateSelectProduct", $.proxy(function() {
			this.onConsumptionChange();
			this.onProductListRefreshPressed();
		}, this));
	},

	onProductListRefreshPressed: function() {
		var oDataProvider = sap.umc.mobile.change_service.model.DataProvider;

		var sDivisionID = this.getProperty("product", "/productFilters/divisionID");
		var sConsumption = this.utils.getPlainConsumption(this.getProperty("product", "/productFilters/consumption"));

		oDataProvider.loadProducts(sDivisionID, sConsumption, this);
	},

	onProductsLoaded: function(aProducts) {
		this.getView().getModel("product").setProperty("/products", aProducts);
	},

	onProductSelected: function(listItem) {
		var sProductPath = listItem.getSource().getSelectedContexts()[0].getPath();
		this.setProperty("product", "/_selectedProductPath", sProductPath);
	},

	onConsumptionChange: function() {
		var sConsumption = this.utils.getPlainConsumption(this.getProperty("product", "/productFilters/consumption"));

		// Format according to the locale
		sConsumption = parseInt(sConsumption, 10).toLocaleString({maximumFractionDigits: 0});
		sConsumption = sConsumption.replace(/\..+/g, ""); //Remove decimal and numbers after if returned by toLocaleString
		if (sConsumption === "NaN") {
			sConsumption = "0";
		}

		// Add units
		var sDivisionID = this.getProperty("product", "/productFilters/divisionID");
		switch (sDivisionID) {
			case "01":
				sConsumption = sConsumption + " " + this.getText("CHANGE_SERVICE.ELECTRICITY_UNIT");
				break;
			case "02":
				sConsumption = sConsumption + " " + this.getText("CHANGE_SERVICE.GAS_UNIT");
				break;
			case "03":
				sConsumption = sConsumption + " " + this.getText("CHANGE_SERVICE.WATER_UNIT");
				break;
		}

		this.setProperty("product", "/productFilters/consumption", sConsumption);
		this.onProductListRefreshPressed();
	}

});
