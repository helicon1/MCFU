jQuery.sap.declare("sap.umc.mobile.user_profile.model.OfflineDataProvider");
sap.umc.mobile.user_profile.model.OfflineDataProvider = {

	_readBankAccounts: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/BankAccounts.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oBankAccounts.setData(oFakeJsonModel.getData().d);
			//this._determinePaymentState();
			oDelegate.onBankAccountsLoaded(this.oBankAccounts);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readCardAccounts: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/PaymentCards.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oCardAccounts.setData(oFakeJsonModel.getData().d);
			for ( var i = 0; i < oFakeJsonModel.getData().d.results.length; i++) {
				var sDate = oFakeJsonModel.getData().d.results[i].ValidTo;
				sDate = sDate.slice(sDate.indexOf("(") + 1, sDate.indexOf(")"));
				oFakeJsonModel.getData().d.results[i].ValidTo = new Date(parseInt(sDate, 10));
			}
			oDelegate.onCardAccountsLoaded(this.oCardAccounts);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readCountries: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/Countries.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oCountries.setData(oFakeJsonModel.getData().d);
			if (oDelegate) {
				oDelegate.onLoadCountryListSuccess(this.oCountries);
			}
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBusinessAgreements: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/BusinessAgreements.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oBusinessAgreements.setSizeLimit(oFakeJsonModel.getData().d.results && oFakeJsonModel.getData().d.results.length);
			this.oBusinessAgreements.setData(oFakeJsonModel.getData().d);
			oDelegate.onReadBusinessAgreementsSuccess(this.oBusinessAgreements);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_refreshPersonalInfo: function(oDelegate) {
		this.oPersonalInfo = new sap.ui.model.json.JSONModel();
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/PersonalInfo.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oPersonalInfo.setData(oFakeJsonModel.getData().d);
			oDelegate.onRefreshPersonalInfoSuccess(this.oPersonalInfo, "");
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContractAccounts: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/ContractAccounts.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oContractAccounts.setData(oFakeJsonModel.getData().d);
			fnCallback(this.oContractAccounts);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readAddresses: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/ContractAccounts.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContracts: function(oContractAccount, fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/Contracts.json");
		var fnCompleted = jQuery.proxy(function() {
			var oContracts = new sap.ui.model.json.JSONModel();
			oContracts.setData(oFakeJsonModel.getData().d);
			oContractAccount._Contracts = oContracts;
			fnCallback(oContracts);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBillingAddresses: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/BillingAddresses.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBillingAddressCountries: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/BillingAddressCountries.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBillingAddressRegions: function(sCountryID, fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if (sCountryID === "DE") {
			oFakeJsonModel.loadData("user_profile/model/mockdata/BillingAddressRegions_DE.json");
		} else {
			oFakeJsonModel.loadData("user_profile/model/mockdata/BillingAddressRegions.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readAutoPaymentMethods: function(oDelegate, oDataProvider) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/BankAccounts.json");
		var fnCompleted = jQuery.proxy(function() {
			oFakeJsonModel.getData().d.results = oFakeJsonModel.getData().d.results.reverse();
			this.oAutoPaymentMethods.setData(oFakeJsonModel.getData().d);
			var oFakeCardJsonModel = new sap.ui.model.json.JSONModel();
			oFakeCardJsonModel.loadData("user_profile/model/mockdata/PaymentCards.json");
			var fnCardCompleted = jQuery.proxy(function() {
				oFakeCardJsonModel.getData().d.results = oFakeCardJsonModel.getData().d.results.reverse();
				for ( var i = 0; i < oFakeCardJsonModel.getData().d.results.length; i++) {
					oDataProvider.oAutoPaymentMethods.oData.results.push(oFakeCardJsonModel.getData().d.results[i]);
				}
				oDelegate.onAutoPaymentMethodsLoadedSuccess(oDataProvider.oAutoPaymentMethods);
			}, this);
			oFakeCardJsonModel.attachRequestCompleted(oFakeCardJsonModel.getData().d, fnCardCompleted);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readLanguages: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/Languages.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readAccountLanguage: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/AccountLanguage.json");
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readCommunicationPreferences: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		var oFakeJsonModelAddress = new sap.ui.model.json.JSONModel();
		var oFakeJsonModelBillingMethods = new sap.ui.model.json.JSONModel();
		var oFakeJsonModelOutageMethods = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/CommunicationPreferences.json");
		var fnCompleted = jQuery.proxy(function() {
			if (oFakeJsonModel.getData().d && oFakeJsonModelAddress.getData().d && oFakeJsonModelBillingMethods.getData().d
					&& oFakeJsonModelOutageMethods.getData().d) {
				this._updateCommunicationPreferences(oFakeJsonModel, oFakeJsonModelAddress, oFakeJsonModelBillingMethods, oFakeJsonModelOutageMethods,
						oDelegate);
			}
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);

		oFakeJsonModelAddress.loadData("user_profile/model/mockdata/CommunicationAddress.json");
		var fnAddressCompleted = jQuery.proxy(function() {
			if (oFakeJsonModel.getData().d && oFakeJsonModelAddress.getData().d && oFakeJsonModelBillingMethods.getData().d
					&& oFakeJsonModelOutageMethods.getData().d) {
				this._updateCommunicationPreferences(oFakeJsonModel, oFakeJsonModelAddress, oFakeJsonModelBillingMethods, oFakeJsonModelOutageMethods,
						oDelegate);
			}
		}, this);
		oFakeJsonModelAddress.attachRequestCompleted(oFakeJsonModelAddress.getData().d, fnAddressCompleted);

		oFakeJsonModelBillingMethods.loadData("user_profile/model/mockdata/CommunicationBillingMethods.json");
		var fnBillingMethodsCompleted = jQuery.proxy(function() {
			if (oFakeJsonModel.getData().d && oFakeJsonModelAddress.getData().d && oFakeJsonModelBillingMethods.getData().d
					&& oFakeJsonModelOutageMethods.getData().d) {
				this._updateCommunicationPreferences(oFakeJsonModel, oFakeJsonModelAddress, oFakeJsonModelBillingMethods, oFakeJsonModelOutageMethods,
						oDelegate);
			}
		}, this);
		oFakeJsonModelBillingMethods.attachRequestCompleted(oFakeJsonModelBillingMethods.getData().d, fnBillingMethodsCompleted);

		oFakeJsonModelOutageMethods.loadData("user_profile/model/mockdata/CommunicationOutageMethods.json");
		var fnOutageMethodsCompleted = jQuery.proxy(function() {
			if (oFakeJsonModel.getData().d && oFakeJsonModelAddress.getData().d && oFakeJsonModelBillingMethods.getData().d
					&& oFakeJsonModelOutageMethods.getData().d) {
				this._updateCommunicationPreferences(oFakeJsonModel, oFakeJsonModelAddress, oFakeJsonModelBillingMethods, oFakeJsonModelOutageMethods,
						oDelegate);
			}
		}, this);
		oFakeJsonModelOutageMethods.attachRequestCompleted(oFakeJsonModelOutageMethods.getData().d, fnOutageMethodsCompleted);
	},
	_updateCommunicationPreferences: function(oFakeJsonModel, oFakeJsonModelAddress, oFakeJsonModelBillingMethods, oFakeJsonModelOutageMethods,
			oDelegate) {
		oFakeJsonModel.setData(oFakeJsonModel.getData().d);
		oFakeJsonModelAddress.setData(oFakeJsonModelAddress.getData().d);
		oFakeJsonModelBillingMethods.setData(oFakeJsonModelBillingMethods.getData().d.results);
		oFakeJsonModelOutageMethods.setData(oFakeJsonModelOutageMethods.getData().d.results);
		oDelegate.onCommunicationPreferencesloaded(oFakeJsonModel, oFakeJsonModelAddress, oFakeJsonModelBillingMethods, oFakeJsonModelOutageMethods);
	},
	_readCommunicationPermissions: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/CommunicationPermissions.json");
		var fnCompleted = jQuery.proxy(function() {
			oFakeJsonModel.setData(oFakeJsonModel.getData().d.results);
			fnCallback(oFakeJsonModel, oFakeJsonModel);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContactAddress: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/CommunicationAddress.json");
		var fnCompleted = jQuery.proxy(function() {
			oFakeJsonModel.setData(oFakeJsonModel.getData().d);
			fnCallback(oFakeJsonModel.getData(), oFakeJsonModel);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContactPhonesAndEmails: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("user_profile/model/mockdata/CommunicationAddress.json");
		var fnCompleted = jQuery.proxy(function() {
			oFakeJsonModel.setData(oFakeJsonModel.getData().d);
			oDelegate.onContactPhonesAndEmailsLoaded(oFakeJsonModel.getData());
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readRegions: function(oDelegate, sCountryID) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if (sCountryID === "DE") {
			oFakeJsonModel.loadData("user_profile/model/mockdata/BillingAddressRegions_DE.json");
		} else {
			oFakeJsonModel.loadData("user_profile/model/mockdata/BillingAddressRegions.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			oDelegate.onRegionsLoaded(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	}

};