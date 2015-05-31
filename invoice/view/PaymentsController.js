/*global window */
jQuery.sap.declare("sap.umc.mobile.invoice.view.PaymentsController");

sap.umc.mobile.invoice.view.PaymentsController = {
	setView: function(oView) {
		this._oView = oView;
	},
	getView: function() {
		return this._oView;
	},
	getDataProvider: function() {
		return sap.umc.mobile.invoice.model.DataProvider;
	},
	read: function(oParameters) {
		this.getDataProvider().loadPaymentMethods(this, oParameters);
	},
	onPaymentMethodsLoaded: function(oExistingAccounts, sPaymentID) {
		this.getView().setModel(oExistingAccounts, "existingAccounts");
		if(this._paymentComboBox && sPaymentID){
			this.getView().getModel("existingAccounts").setProperty("/selectedKey", sPaymentID);
			this._paymentComboBox.setSelectedKey(sPaymentID);
		}
	},
	isDirty: function() {
		var oExistingAccounts = this.getView().getModel("existingAccounts");
		var sAmount = oExistingAccounts.getProperty("/amount");
		var sDefaultAmount = oExistingAccounts.getProperty("/_defaultAmount");
		var sPaymentMethodKey = oExistingAccounts.getProperty("/selectedKey");
		var sCVC = oExistingAccounts.getProperty("/cvc");
		var dOrginal = sap.umc.mobile.app.js.utils.formatDate(oExistingAccounts.getProperty("/date"));
		var dCurrent = sap.umc.mobile.app.js.utils.formatDate(oExistingAccounts.getProperty("/_defaultDate"));

		if ((sAmount != sDefaultAmount) || sPaymentMethodKey || sCVC || (dOrginal != dCurrent)) {
			return true;
		} else {
			return false;
		}
	},
	_isValidPayment: function() {
		var oExistingAccounts = this.getView().getModel("existingAccounts");
		var sAmount = oExistingAccounts.getProperty("/amount");
		var sPaymentMethodKey = oExistingAccounts.getProperty("/selectedKey");
		var sCVC = oExistingAccounts.getProperty("/cvc");
		var dPaymentDate = oExistingAccounts.getProperty("/date");

		//sPaymentMethodKey = -3 is the default selection "Select a payment method" key
		if (!sPaymentMethodKey || sPaymentMethodKey === "-3") {
			sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"INVOICE.METHOD_MISSING"));
			return false;
		} else if (!sAmount) {
			sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"INVOICE.AMOUNT_MISSING"));
			return false;
		} else if (!sCVC && sPaymentMethodKey.indexOf("card") != -1) {
			sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"INVOICE.CVC_MISSING"));
			return false;
		} else if (!dPaymentDate) {
			sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"INVOICE.DATE_MISSING"));
			return false;
		} else {
			return true;
		}
	},
	onSubmitOneTimePayment: function() {
		var oExistingAccounts = this.getView().getModel("existingAccounts");
		var sPaymentMethodKey = oExistingAccounts.getProperty("/selectedKey");
		var oSelectedAccount = this._getSelectedPaymentMethod(oExistingAccounts.getProperty("/"), sPaymentMethodKey);
		var sInvoiceID = this.getView().getModel("invoice").getProperty("/InvoiceID");
		var sAmount = sap.umc.mobile.app.js.formatters.parseFormattedAmount(oExistingAccounts.getProperty("/amount")).toString();
		var sCVC = oExistingAccounts.getProperty("/cvc");
		var dPaymentDate = oExistingAccounts.getProperty("/date");
		if (this._isValidPayment()) {
			dPaymentDate.setHours(22);
			if (sPaymentMethodKey.indexOf("card") != -1) {
				this.getDataProvider().createOneTimePaymentByCard(sCVC, dPaymentDate, oSelectedAccount.PaymentCardID, sAmount, sInvoiceID,
						jQuery.proxy(this._onPaymentSuccess, this));
			}
			if (sPaymentMethodKey.indexOf("bank") != -1) {
				this.getDataProvider().createOneTimePaymentByBank(dPaymentDate, oSelectedAccount.BankAccountID, sAmount, sInvoiceID,
						jQuery.proxy(this._onPaymentSuccess, this));
			}
		}
	},
	onSubmitBalancePayment: function() {
		var oExistingAccounts = this.getView().getModel("existingAccounts");
		var sPaymentMethodKey = oExistingAccounts.getProperty("/selectedKey");
		var sCurrency = oExistingAccounts.getProperty("/_currency");
		var oSelectedAccount = this._getSelectedPaymentMethod(oExistingAccounts.getProperty("/"), sPaymentMethodKey);
		var sAmount = sap.umc.mobile.app.js.formatters.parseFormattedAmount(oExistingAccounts.getProperty("/amount")).toString();
		var sCVC = oExistingAccounts.getProperty("/cvc");
		var dPaymentDate = oExistingAccounts.getProperty("/date");
		if (this._isValidPayment()) {
			dPaymentDate.setHours(22);
			if (sPaymentMethodKey.indexOf("card") != -1) {
				this.getDataProvider().createBalancePaymentByCard(sCVC, dPaymentDate, oSelectedAccount.PaymentCardID, sAmount, sCurrency,
						jQuery.proxy(this._onPaymentSuccess, this));
			}
			if (sPaymentMethodKey.indexOf("bank") != -1) {
				this.getDataProvider().createBalancePaymentByBank(dPaymentDate, oSelectedAccount.BankAccountID, sAmount, sCurrency,
						jQuery.proxy(this._onPaymentSuccess, this));
			}
		}
	},
	_getSelectedPaymentMethod: function(oExistingAccounts, sKey) {
		for ( var i = 0; i < oExistingAccounts.length; i++) {
			if (oExistingAccounts[i].id === sKey) {
				return oExistingAccounts[i];
			}
		}
	},
	_onPaymentSuccess: function() {
		this.getView().getModel("existingAccounts").setProperty("/selectedKey", null);
		sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty(
		"INVOICE.PAYMENT_SUCCESS"));
		this.getDataProvider().loadInvoices(null, true);
		window.history.back();
	},
	onPaymentMethodChange: function(oEvent) {
		if(!this._paymentComboBox){
			this._paymentComboBox = oEvent.getSource();
		}
		var sSelectedKey = oEvent.getSource().getSelectedKey();
		if (sSelectedKey === "-1") {
			// To New Bank account Page
			sap.ui.getCore().getComponent("AppComponent").getComponents().getUserProfile().getRouter().myNavTo("bankDetail", {
				BankAccountID: "-1"
			}, false);
		} else if (sSelectedKey === "-2") {
			// To New credit card page
			sap.ui.getCore().getComponent("AppComponent").getComponents().getUserProfile().getRouter().myNavTo("cardDetail", {
				PaymentCardID: "-1"
			}, false);
		} else {
			var oCurrentModel = this.getView().getModel("existingAccounts");
			this.getView().setModel(this.getDataProvider().updatePaymentMethodId(oCurrentModel, sSelectedKey), "existingAccounts");
		}
	},
	onCvcLiveChange: function(oEvent) {
		var oModel = this.getView().getModel("existingAccounts");
		var sCVC = oModel.getProperty("/cvc");
		var sNewCVC = sCVC.replace(/\D/g, '');
		this.getView().setModel(this.getDataProvider().updatecvc(oModel, sNewCVC), "existingAccounts");
	}
};