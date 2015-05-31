jQuery.sap.declare("sap.umc.mobile.change_service.model.OfflineDataProvider");
sap.umc.mobile.change_service.model.OfflineDataProvider = {

	_readCountries: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/Countries.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readRegions: function(sCountryID, fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if (sCountryID === "DE") {
			oFakeJsonModel.loadData("change_service/model/mockdata/BillingAddressRegions_DE.json");
		} else {
			oFakeJsonModel.loadData("change_service/model/mockdata/BillingAddressRegions.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readPremiseAddresses: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/PremiseAddresses.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readProducts: function(sDivisionID, sConsumption, fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/Products.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readDivisions: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/Divisions.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBillingAddresses: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/AccountAddresses.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContracts: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/ContractItems.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readSuppliers: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/Suppliers.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBankAccounts: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/BankAccounts.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContractEndable: function(sContractID, fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/CheckMoveOut.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, {
				requestUri: "https://ldcigm6.wdf.sap.corp:44333/sap/opu/odata/sap/CRM_UTILITIES_UMC/CheckMoveOut?ContractID='" + "900009070"
						+ "'&$format=json"
			});
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readCardAccounts: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/PaymentCards.json");
		var fnCompleted = jQuery.proxy(function() {
			for ( var i = 0; i < oFakeJsonModel.getData().d.results.length; i++) {
				var sDate = oFakeJsonModel.getData().d.results[i].ValidTo;
				sDate = sDate.slice(sDate.indexOf("(") + 1, sDate.indexOf(")") + 1);
				oFakeJsonModel.getData().d.results[i].ValidTo = new Date(parseInt(sDate, 10));
			}
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);

	},
	_readCardAccountTypes: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/PaymentCardTypes.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBankAccountTypes: function(sCountryID, fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("change_service/model/mockdata/BankAccountTypes.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	}

};
