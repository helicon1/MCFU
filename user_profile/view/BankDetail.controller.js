/*global window */
sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.BankDetail", {
	_NORTH_AMERICA_FRAGMENT_ID: "BankDetailNA_Fragment",
	_NORTH_AMERICA_FRAGMENT_NAME: "sap.umc.mobile.user_profile.view.BankDetailNA",
	_EMEA_FRAGMENT_ID: "BankDetailEMEA_Fragment",
	_EMEA_FRAGMENT_NAME: "sap.umc.mobile.user_profile.view.BankDetailEMEA",
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
		this._attachBankDetailFragment();
	},
	_attachBankDetailFragment: function(sObjectHeaderInsertionPointId) {
		var sInsertionPointId = "BankDetail_Fragment";
		var oBankDetailFragment = new sap.ui.xmlfragment(this._getBankDetailFragmentId(), this._getBankDetailFragmentName(), this);
		this.getView().byId(sInsertionPointId).addContent(oBankDetailFragment);
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "bankDetail") {
				var sBankId = oEvent.getParameter("arguments").BankAccountID;
				if (sBankId !== "-1") {
					this._handleBankDetail(sBankId);
				} else {
					this._handleAddBank();
					this.getDataProvider().loadCountryList(this);
				}
			}
		}, this);
	},
	_handleBankDetail: function(sBankId) {
		var oModel = this.getDataProvider().getBankAccountById(sBankId);
		this.getView().setModel(oModel, "bankDetail");
		this.getView().getModel("bankDetail").setProperty("/Title", this.getText("USER_PROFILE.BANK_DETAIL"));
		this.getView().getModel("bankDetail").setProperty("/CountryName", this.getDataProvider().getCountryNameById(oModel.oData.CountryID));
		this.getView().getModel("bankDetail").setProperty("/DisplayInfo", false);
		this.getView().getModel("bankDetail").setProperty("/EditInfo", true);
		this.getView().getModel("bankDetail").setProperty("/AddBank", false);
		this.getView().getModel("bankDetail").setProperty("/ShowBank", true);
	},
	_handleAddBank: function(sBankId) {
		var oData = {
			AccountHolder: "",
			AccountID: this.getDataProvider().getAccount().getData().AccountID,
			BankAccountID: "",
			BankAccountName: "",
			BankAccountNo: "",
			BankID: "",
			CountryID: "",
			IBAN: ""
		};
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "bankDetail");
		this.getView().getModel("bankDetail").setProperty("/Title", this.getText("USER_PROFILE.ADD_BANK"));
		this.getView().getModel("bankDetail").setProperty("/DisplayInfo", true);
		this.getView().getModel("bankDetail").setProperty("/EditInfo", false);
		this.getView().getModel("bankDetail").setProperty("/AddBank", true);
		this.getView().getModel("bankDetail").setProperty("/ShowBank", false);
	},
	onLoadCountryListSuccess: function(oCountries) {
		this.getView().setModel(oCountries, "Countries");
		if (oCountries.oData.results[0]) {
			this.getView().getModel("bankDetail").getData().CountryID = oCountries.oData.results[0].CountryID;
			this.getView().getModel("bankDetail").setProperty("/seletedCountryID", oCountries.oData.results[0].CountryID);
			this.getDataProvider().loadBankList(this, oCountries.oData.results[0].CountryID);
		}
		// seletedBankID
		this.getView().getModel("bankDetail").setProperty("/seletedBankID", "-1");
	},
	onLoadBankListSuccess: function(oBanks) {
		this.getView().setModel(oBanks, "Banks");
		if (oBanks.oData.results[0]) {
			this.getView().getModel("bankDetail").getData().BankID = oBanks.oData.results[0].BankID;
			this.getView().getModel("bankDetail").setProperty("/seletedBankID", oBanks.oData.results[0].BankID);
		} else {
         this.getView().getModel("bankDetail").getData().BankID = "";
         this.getView().getModel("bankDetail").setProperty("/seletedBankID", "");
      }
	},
	handleBankSelect: function(oEvent) {
		var sBankID = oEvent.getSource().getSelectedKey();
		this.getView().getModel("bankDetail").getData().BankID = sBankID;
		this.onInformationModified();
	},
	handleCountrySelect: function(oEvent) {
		var sCountryID = oEvent.getParameters().selectedItem.mProperties.key;
		if (sCountryID !== "") {
			this.getDataProvider().loadBankList(this, sCountryID);
		}
		this.getView().getModel("bankDetail").getData().CountryID = sCountryID;
		this.onInformationModified();
	},
	onInformationModified: function(oEvent) {
		this.getView().getModel("bankDetail").setProperty("/Modified", true);
	},
	handleBICSelect: function(oEvent) {
		var sBankID = oEvent.getSource().getSelectedKey();
		this.getView().getModel("bankDetail").getData().BankID = sBankID;
		this.onInformationModified();
	},
	handleIBANChange: function(oEvent) {
		var sIBAN = this.getView().getModel("bankDetail").getProperty("/IBAN");	
		if (sIBAN.length >= 2) {	
			this.getView().getModel("bankDetail").setProperty("/CountryID", sIBAN.slice(0, 2));	
			this.getView().getModel("bankDetail").setProperty("/CountryName", this.getDataProvider().getCountryNameById(sIBAN.slice(0, 2)));
		} else {	
			this.getView().getModel("bankDetail").setProperty("/CountryID", "");		
			this.getView().getModel("bankDetail").setProperty("/CountryName", "");	
		}				
		this.getDataProvider().loadBankList(this, sIBAN.slice(0, 2));	
		this.getView().getModel("bankDetail").setProperty("/Modified", true);
		this.getView().getModel("bankDetail").setProperty("/seletedBankID", "-1");
	},
	handleEditButton: function(oEvent) {
		this.getView().getModel("bankDetail").setProperty("/DisplayInfo", true);
		this.getView().getModel("bankDetail").setProperty("/EditInfo", false);
	},
	handleSaveButton: function(oEvent) {
		var oBankAccount = this.getView().getModel("bankDetail").getData();
		var oCopyBankAccount = this.getApp().getUtils().copyObject(oBankAccount);
		if (this.getView().getModel("bankDetail").getProperty("/Title") === this.getText("USER_PROFILE.BANK_DETAIL")) {
			this._cleanUpBankDetail(oCopyBankAccount);
			var bIsModelModified = this.getView().getModel("bankDetail").getProperty("/Modified");
			if (!bIsModelModified) {
				this.onSaveBankAccountSuccess();
			} else {
				var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
				if (!bIsNorthAmerica) {
					oCopyBankAccount.IBAN = "";
				}
				this.getDataProvider().saveBankAccount(this, oCopyBankAccount);				
			}

		} else {
			this.getView().getModel("bankDetail").getData().AccountID = this.getDataProvider().getAccountId();
			this._cleanUpBankDetail(oCopyBankAccount);
			var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
			if (bIsNorthAmerica) {
				this.getDataProvider().createNewBankAccount(this, oCopyBankAccount);
			} else {
				oCopyBankAccount.CountryID = "";
				oCopyBankAccount.BankID = "";
				this.getDataProvider().createNewBankAccount(this, oCopyBankAccount);
			}
		}
	},
	handleDeleteButton: function(oEvent) {
		var oBankAccount = this.getView().getModel("bankDetail").getData();
		var oCopyBankAccount = this.getApp().getUtils().copyObject(oBankAccount);
		this._cleanUpBankDetail(oCopyBankAccount);
		var oMessageBox = {
			title: this.getText("APP.CONFIRM"),
			actions: [sap.ui.getCore().getModel("i18n").getProperty("APP.OK"), sap.ui.getCore().getModel("i18n").getProperty("APP.CANCEL")],
			onClose: $.proxy(function(oAction) {
				if (oAction === "OK") {
					this.getDataProvider().removeBankAccount(this, oCopyBankAccount);
				}
			}, this)
		};
		sap.m.MessageBox.show(this.getText("USER_PROFILE.CONFIRM_DELETE"), oMessageBox);
	},
	onCreateBankAccountSuccess: function(oBank) {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sLastPage = oHistory.aHistory[oHistory.iHistoryPosition - 1];
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("USER_PROFILE.CREATE_SUSSCESS"));
		var oInvoice = {};
		oInvoice.PaymentID = oBank.BankAccountID + "bank";
		if (sLastPage === "Balance" || sLastPage === "AddedPayment") {
			var oInvoiceComponent = this.getApp().getComponents().getInvoice();
			oInvoiceComponent.getRouter().myNavTo("addedbalancepayment", oInvoice, false);
		} else if (sLastPage.indexOf("Invoice") > -1) {
			var bReplace = !jQuery.device.is.phone;
			oInvoice.InvoiceID = sLastPage.split('/')[1];
			var oInvoiceComponent = this.getApp().getComponents().getInvoice();
			oInvoiceComponent.getRouter().myNavTo("invoiceDetailPayment", oInvoice, bReplace);
		} else {
			this.getRouter().myNavTo("paymentAccounts");
		}
	},
	onSaveBankAccountSuccess: function() {
		var bIsModelModified = this.getView().getModel("bankDetail").getProperty("/Modified");
		if (!bIsModelModified) {
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("USER_PROFILE.SAVE_SUSSCESS_NO_CHANGE"));	
			return;		
		} else {
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("USER_PROFILE.SAVE_SUSSCESS"));		
		}
		this.getView().getModel("bankDetail").setProperty("/DisplayInfo", false);
		this.getView().getModel("bankDetail").setProperty("/EditInfo", true);
		this.getView().getModel("bankDetail").setProperty("/Modified", false);
	},
	onDeleteBankAccountSuccess: function() {
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("USER_PROFILE.DELETE_SUSSCESS"));
		this.getRouter().myNavTo("paymentAccounts");
	},
	_cleanUpBankDetail: function(oCopyBankAccount) {
		delete oCopyBankAccount.DisplayInfo;
		delete oCopyBankAccount.EditInfo;
		delete oCopyBankAccount.AddBank;
		delete oCopyBankAccount.ShowBank;
		delete oCopyBankAccount.CountryName;
		delete oCopyBankAccount.Bank;
		delete oCopyBankAccount.seletedBankID;
		delete oCopyBankAccount.seletedCountryID;
		delete oCopyBankAccount.BIC;
		delete oCopyBankAccount.Title;
		delete oCopyBankAccount.Modified;
	},
	refreshBankAccounts: function() {
		this.getDataProvider().reloadBankAccounts();
	},
	isDirty: function(){
		return this.getView().getModel("bankDetail").getProperty("/Modified");
	},
	_getBankDetailFragmentId: function() {
		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		if (bIsNorthAmerica) {
			return this._NORTH_AMERICA_FRAGMENT_ID;
		} else {
			return this._EMEA_FRAGMENT_ID;
		}
	},
	_getBankDetailFragmentName: function() {
		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		if (bIsNorthAmerica) {
			return this._NORTH_AMERICA_FRAGMENT_NAME;
		} else {
			return this._EMEA_FRAGMENT_NAME;
		}
	},
	_exctractAccountNoFromIBAN: function(sIBAN, sBankCode) {
		sIBAN.indexOf(sBankCode) + sBankCode.length;
		var sAccountNo = sIBAN.substring(sIBAN.indexOf(sBankCode) + sBankCode.length);
		return sAccountNo;
	}
});