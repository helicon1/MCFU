jQuery.sap.require("sap.umc.mobile.invoice.view.PaymentsController");

sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.invoice.view.Balance", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "balance") {
				this.getDataProvider().loadContractAccounts(this);
				this._removeContentView();
				this._getPayButton().setVisible(true);
				this._getSubmitButton().setVisible(false);
			}
			if (sNavigationName === "addedbalancepayment") {
				// todo with the new returned object pass it here depending if its a card or bank create a new id field
				// whichis the bank or
				// payment card id + bank or + card and it should auto bind
				var sPaymentID = oEvent.getParameter("arguments").PaymentID;
				var oParameters = {};
				oParameters.Amount = this.getView().getModel("Balance").getProperty("/Amount");
				oParameters.Currency = this.getView().getModel("Balance").getProperty("/Currency");
				oParameters.Amount = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oParameters.Amount, oParameters.Currency);
				oParameters.EnablePaymentAmount = false;
				oParameters.ResetModel = true;
				oParameters.PaymentID = sPaymentID;
				this.oPaymentsController.read(oParameters);
				if (sPaymentID) {
					this._getPaymentMethodsComboBox().setSelectedKey(sPaymentID);
				} else {
					this._getPaymentMethodsComboBox().setValue("");
				}
			}
		}, this);
	},
	_getPaymentMethodsComboBox: function() {
		var aControls = this._paymentsFragment.findAggregatedObjects();
		return aControls[4];
	},
	_getPayButton: function() {
		return this.getView().byId("PayBalanceBtn");
	},
	_getSubmitButton: function() {
		return this.getView().byId("SubmitBalanceBtn");
	},
	showDetail: function(oInvoice) {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("invoiceDetail", oInvoice, bReplace);
	},
	onContractAccountsLoaded: function(oContractAccounts, oBalance) {
		this.getView().setModel(oContractAccounts, "ContractAccounts");
		this.getView().setModel(oBalance, "Balance");
		this.getView().getModel("Balance").setProperty("/IsModified", false);
		this._addContractAccountForm(oContractAccounts);
		if (oBalance) {
			if (parseFloat(oBalance.getProperty("/Amount")) <= 0) {
				this._getPayButton().setVisible(false);
			}
		} else {
			this._getPayButton().setVisible(false);
		}
		// Situation when navigating from home page menu "Make a Payment" link
		if (this.oComponent.bShowMakeAPayment === true) {
			this.onClickPayBalance();
			this.oComponent.bShowMakeAPayment = false;
		}
	},
	handleListItemPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("Invoices");
		var oSelectedInvoice = oContext.getProperty(oContext.getPath());
		this.showDetail(oSelectedInvoice);
	},
	handleListSelect: function(oEvent) {
		var oContext = oEvent.getParameter("listItem").getBindingContext("Invoices");
		var oSelectedInvoice = oContext.getProperty(oContext.getPath());
		this.showDetail(oSelectedInvoice);
	},
	isDirty: function() {
		return (this.oPaymentsController && this.oPaymentsController.isDirty() && this.getView().getModel("Balance").getProperty("/IsModified"));
	},

	onClickBillHistory: function(oEvent) {
		this.getRouter().myNavTo("invoiceList", {}, false);
	},
	onClickPaymentHistory: function(oEvent) {
		this.getRouter().myNavTo("paymentHistory", {}, false);
	},
	handleOpen: function(oEvent) {

	},
	onClickPayBalance: function(oEvent) {
		this.getView().getModel("Balance").setProperty("/IsModified", true);
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			selectedKey: -3,
			entryName: ""
		}), "existingAccounts");
		this.getView().getModel("existingAccounts").refresh(true);
		this._getPayButton().setVisible(false);
		this._getSubmitButton().setVisible(true);
		if (!this._paymentsFragment) {
			this.oPaymentsController = sap.umc.mobile.invoice.view.PaymentsController;
			this._paymentsFragment = sap.ui.xmlfragment("sap.umc.mobile.invoice.view.Payments", this.oPaymentsController);
			this.oPaymentsController.setView(this.getView());
			this._getSubmitButton().attachPress(null, this.oPaymentsController.onSubmitBalancePayment, this.oPaymentsController);
		}
		var oParameters = {};
		oParameters.Amount = this.getView().getModel("Balance").getProperty("/Amount");
		oParameters.Currency = this.getView().getModel("Balance").getProperty("/Currency");
		oParameters.Amount = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oParameters.Amount, oParameters.Currency);
		oParameters.EnablePaymentAmount = false;
		oParameters.ResetModel = true;
		this.oPaymentsController.read(oParameters);
		this._getPaymentMethodsComboBox().setValue("");
		this._addContentView(this._paymentsFragment);
		// fix - scroll to Bottom on phone
		if (jQuery.device.is.phone) {
			this.getView().mAggregations.content[0].scrollTo(500, 1);
		}
	},
	_addContentView: function(oFragment) {
		var oView = this.getView().byId("BalanceModeContent");
		oView.addContent(oFragment);
	},
	_removeContentView: function() {
		var oView = this.getView().byId("BalanceModeContent");
		oView.removeAllContent();
	},
	_addContractAccountForm: function(oContractAccounts) {
		this.getView().byId("invoice_contract_account_form").removeAllContent();
		var oData = oContractAccounts.getData().results;
		var i;
		for (i = 0; i < oData.length; i++) {
			var oLabel = new sap.m.Label();
			var oText = new sap.m.Text();
			oText.addStyleClass("sapUmcBillMText");
			oLabel.setText(oData[i].Description);
			oText.setText(sap.umc.mobile.app.js.formatters.amountWithCurrencyFormatter(oData[i].ContractAccountBalance.CurrentBalance,
					oData[i].ContractAccountBalance.Currency));
			this.getView().byId("invoice_contract_account_form").addContent(oLabel);
			this.getView().byId("invoice_contract_account_form").addContent(oText);
		}
	}
});
