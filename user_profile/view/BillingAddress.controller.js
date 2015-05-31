sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.BillingAddress", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "billingAddress");
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "country");
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "billingAddress") {
				this._initializeBillingAddressData(oEvent.getParameter("arguments").AgreementNumber
						.slice(oEvent.getParameter("arguments").AgreementNumber.indexOf("-")+1, oEvent.getParameter("arguments")
								.AgreementNumber.length));
				this.getView().getModel("billingAddress").setProperty("/AgreementNumber", oEvent.getParameter("arguments")
						.AgreementNumber.slice(0, oEvent.getParameter("arguments").AgreementNumber.indexOf("-")));
			}
		}, this);
	},
	_initializeBillingAddressData: function(sAddressID) {
		var oSelection = sap.umc.mobile.user_profile.js.utils.getEmptyAddress();
		oSelection.AddressInfo.ShortForm = this.getText("USER_PROFILE.BILLING_SAME_ADDRESS");
		this.setData("billingAddress", {
			addresses: [],
			addressKey: sAddressID,
			regions: sap.umc.mobile.user_profile.js.utils.getDefaultRegionArray(),
			selection: oSelection,
			selectionID: "0",
			_isNewAddress: false,
			_isSameAsPremise: true,
			_isSavable: false,
			_isEditable: true
		});
		this.getDataProvider().loadBillingAddresses(sap.umc.mobile.CONSTANTS.CHANGE_SERVICE_CONTEXT.START_SERVICE, this);
	},
	onBillingAddressesLoaded: function(aAddresses) {
		this.getView().getModel("billingAddress").setProperty("/addresses", aAddresses);
		this.getView().getModel("billingAddress").setProperty("/selectionID", "0");
		this.onBillingAddressSelected();
		this._initializeCountryData();
	},
	_setDefaultSelection: function() {
		if(this.getView().getModel("billingAddress").getProperty("/addressKey")){
			for(var i = 0; i < this.getView().getModel("billingAddress").getProperty("/addresses").length; i++ ){
				if(this.getView().getModel("billingAddress").getProperty("/addresses")[i].AddressID === this.getView().getModel("billingAddress").getProperty("/addressKey")){
					this.getView().getModel("billingAddress").setProperty("/selectionID", this.getView().getModel("billingAddress").getProperty("/addresses")[i]._ID);
					this.onBillingAddressSelected();
				}
			}
		}		
	},
	_initializeCountryData: function() {
		this.getView().getModel("country").setSizeLimit(300);
		this.setData("country", {
			countries: [],
			premiseSelectionID: "0",
			billingSelectionID: "0"
		});
		this.getDataProvider().loadCountries_BillingAddress(this);
	},
	onCountriesLoaded: function(aCountries) {
		this.getView().getModel("country").setProperty("/countries", aCountries);
		if(this.getView().getModel("billingAddress").getProperty("/addresses")){
			this._setDefaultSelection();
		}
	},
	onBillingAddressSelected: function() {
		var sSelectionID = this.getProperty("billingAddress", "/selectionID");
		var oSelectedBilling = this.getProperty("billingAddress", "/addresses/" + sSelectionID);
		//Store region in temporary property of model - Strange rewriting issues sometimes occur when regions reload
		this.setProperty("billingAddress", "/_tempRegion", oSelectedBilling.AddressInfo.Region);
		if (oSelectedBilling.AddressInfo.ShortForm === this.getText("USER_PROFILE.DEFAULT_PREMISE_NAME")) { //Enter new address case
			this.setProperty("billingAddress", "/_isNewAddress", true);
			this.setProperty("billingAddress", "/_isSameAsPremise", false);
			var sSelectedCountry = oSelectedBilling.AddressInfo.CountryID;
			if (sSelectedCountry) {
				this.onCountrySelected(undefined, sSelectedCountry);
			}
		} else if (oSelectedBilling.AddressInfo.ShortForm === this.getText("USER_PROFILE.BILLING_SAME_ADDRESS")
				|| oSelectedBilling.AddressInfo.ShortForm === this.getText("USER_PROFILE.BILLING_SAME_NEW_ADDRESS")) {
			oSelectedBilling = this.getProperty("premiseAddress", "/selection");
			this.setProperty("billingAddress", "/_tempRegion", oSelectedBilling.AddressInfo.Region);
			this.setProperty("billingAddress", "/_isNewAddress", false);
			this.setProperty("billingAddress", "/_isSameAsPremise", true);
			this.onCountrySelected(undefined, oSelectedBilling.AddressInfo.CountryID);
		} else {
			this.setProperty("billingAddress", "/_isNewAddress", false);
			this.setProperty("billingAddress", "/_isSameAsPremise", false);
			this.onCountrySelected(undefined, oSelectedBilling.AddressInfo.CountryID);
		}
		this.setProperty("billingAddress", "/selection", oSelectedBilling);
	},
	onCountrySelected: function(selectedItem, sCountryIDFromAddress) {
		var oDataProvider = sap.umc.mobile.user_profile.model.DataProvider;
		var sCountryID;
		//If called from country control, selectedItem exists and we can get the country from there
		//If called from onBillingAddressSelected method, sCountryIDFromAddress exists and we can get the country from there
		sCountryID = selectedItem ? selectedItem.getSource().getSelectedKey() : sCountryIDFromAddress;
		//Regions only displayed in NA region, do not load if EMEA
		if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
			oDataProvider.loadRegions(sCountryID, this);
		}
	},
	onRegionsLoaded: function(aRegions) {
		this.getView().getModel("billingAddress").setProperty("/regions", aRegions);
		//Put the stored region back in the selected premise
		var tempRegion = this.getView().getModel("billingAddress").getProperty("/_tempRegion");
		this.getView().getModel("billingAddress").setProperty("/selection/AddressInfo/Region", tempRegion);
	},
	onPressEdit: function() {
		this.setProperty("billingAddress", "/_isSavable", true);
		this.setProperty("billingAddress", "/_isEditable", false);
	},
	onPressSave: function() {
		var sInvalidDataString = this._getInvalidDataString();
		if (sInvalidDataString) {
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sInvalidDataString);
			return;
		}

		if (this.getDataProvider().isMock) {
			this.onBatchSubmitSuccess();
		} else {
			if (this.getView().getModel("billingAddress").getData()._isNewAddress) {
				this._createNewAddress();
			} else {
				this._finishEditingBusinessAgreements(this.getView().getModel("billingAddress").getData().selection.AccountID, this.getView().getModel(
						"billingAddress").getData().selection.AddressID);
			}
		}

	},
	_createNewAddress: function() {
		var oData = {
			AccountID: "",
			AddressInfo: this.getView().getModel('billingAddress').getData().selection.AddressInfo
		};
		this.getDataProvider().createBillingAddress(oData, this);
	},
	onBillingAddressCreated: function(oNewAddress) {
		this.setProperty("billingAddress", "/selection", oNewAddress);
		this.setProperty("billingAddress", "/_isNewAddress", false);
		this._finishEditingBusinessAgreements(oNewAddress.AccountID, oNewAddress.AddressID);
	},
	//submit batch
	_finishEditingBusinessAgreements: function(sAccountID, sAccountAddressID) {
		var aBusinessAgreements = this.getDataProvider().oBusinessAgreements.getData().results;
		var batch = [];
		if (aBusinessAgreements && aBusinessAgreements.length) {
			$.each(aBusinessAgreements, $.proxy(function(iIndex, oBusinessAgreement) {
				if (oBusinessAgreement.BusinessAgreementID === this.getView().getModel("billingAddress").getProperty("/AgreementNumber")) {
					oBusinessAgreement.AccountAddressID = sAccountAddressID;
					oBusinessAgreement.AccountID = sAccountID;
					oBusinessAgreement.BillToAccountAddressID = sAccountAddressID;
					this._saveBusinessAgreement(oBusinessAgreement, batch);
				}
			}, this));
		}
		if (batch.length > 0) {
			this.getDataProvider().updateBillingAddress(this, batch);
		} else {
			this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR,
					sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.NOT_CHANGED"));
		}
	},
	_saveBusinessAgreement: function(oBusinessAgreement, batch) {
		var oBusinessAgreementCopy = this.getApp().getUtils().copyObject(oBusinessAgreement);
		delete oBusinessAgreementCopy._incomingPaymentIdChanged;
		delete oBusinessAgreementCopy.SwitchFlag;
		delete oBusinessAgreementCopy.ContractItems;
		delete oBusinessAgreementCopy.SelectedPaymentMethodKey;
		this.getDataProvider().addBatchOperation(oBusinessAgreementCopy, batch);
	},
	onBatchSubmitSuccess: function() {
		this.getDataProvider()._bContractAccountsChanged = true;
		this._loadBussinessAgreements();
	},
	_loadBussinessAgreements: function() {
		this.getDataProvider().loadBusinessAgreements(this);
	},
	onReadBusinessAgreementsSuccess: function(oBusinessAgreements) {
		var fnCallback = jQuery.proxy(function(oContractAccounts) {
			this.getDataProvider().setContractAccountsChanged(false);	
			//this.getRouter().myNavTo("userProfile");
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty(
			"USER_PROFILE.BATCH_SUSSCESS2"));
			this.setProperty("billingAddress", "/_isSavable", false);
			this.setProperty("billingAddress", "/_isEditable", true);
		}, this);
		this.getDataProvider().setContractAccountsChanged(true);	
		this.getDataProvider().loadContractAccounts(fnCallback);		
	},
	_getInvalidDataString: function() {
		var sMessage = "";
		sMessage += this._validateAddress("billingAddress");
		return sMessage;
	},
	_validateAddress: function(sModel) {
		if (this.getProperty(sModel, "/_isNewAddress")) {
			var sMessage = "";
			var oEnteredAddress = this.getProperty(sModel, "/selection/AddressInfo");
			var bIsDataValid = false;
			bIsDataValid = (oEnteredAddress.HouseNo === "" || oEnteredAddress.Street === "" || oEnteredAddress.City === ""
					|| oEnteredAddress.CountryID === "-1" || oEnteredAddress.PostalCode === "") ? false : true;
			//If region is NA, make sure region field is entered
			if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
				bIsDataValid = bIsDataValid && (oEnteredAddress.Region !== "" && oEnteredAddress.Region !== "-1");
			}
			if (!bIsDataValid) {
				if (sModel === "billingAddress") {
					sMessage += this.getText("USER_PROFILE.ERROR_BILLING_ADDRESS") + "\n";
				}
			}
			return sMessage;
		}
		return "";
	}

});