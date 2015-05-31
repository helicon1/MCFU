/*global window */
jQuery.sap.declare("sap.umc.mobile.agent_panel.model.OfflineDataProvider");
sap.umc.mobile.agent_panel.model.OfflineDataProvider = {
//	_readInvoices: function(oDelegate) {
//		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
//		oFakeJsonModel.loadData("invoice/model/mockdata/invoices.json");
//		var fnCompleted = jQuery.proxy(function() {
//			this.oInvoices.setData(oFakeJsonModel.getData().d);
//			this._determinePaymentState();
//			oDelegate.onInvoicesLoaded(this.oInvoices, this._getBalanceModel());
//		}, this);
//		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
//	},
//	_readPaymentMethods: function(fnProviderCallBack) {
//		var oBankAccountsOdata = null;
//		var oPaymentCardsOdata = null;
//		var oFakeBankModel = new sap.ui.model.json.JSONModel();
//		var oFakeCardModel = new sap.ui.model.json.JSONModel();
//		oFakeBankModel.loadData("invoice/model/mockdata/bankaccounts.json");
//		var fnPaymentCardsCompleted = jQuery.proxy(function() {
//			oPaymentCardsOdata = oFakeCardModel.getData().d;
//			fnProviderCallBack(oBankAccountsOdata, oPaymentCardsOdata);
//		}, this);
//		var fnBanksCompleted = jQuery.proxy(function() {
//			oBankAccountsOdata = oFakeBankModel.getData().d;
//			oFakeCardModel.loadData("invoice/model/mockdata/paymentcards.json");
//			oFakeCardModel.attachRequestCompleted(oFakeCardModel.getData().d, fnPaymentCardsCompleted);
//		}, this);
//		oFakeBankModel.attachRequestCompleted(oFakeBankModel.getData().d, fnBanksCompleted);
//	},
//	getInvoicePdf: function(oInvoiceID) {
//		window.open("invoice/model/mockdata/bill.pdf");
//	},
//	_createPaymentByCard: function(sCVC, dExecution, sPaymentCardID, sAmount, sInvoiceID, fnSuccess) {
//		//TODO: Implement payments in offline mode
//	},
//	_createPaymentByBank: function(dExecution, sBankID, sAmount, sInvoiceID, fnSuccess) {
//		//TODO: Implement payments in offline mode
//	},
//	_createBalancePaymentByBank: function(dExecution, sBankID, sAmount, fnSuccess) {
//		//TODO: Implement payments in offline mode
//	},
//	_createBalancePaymentByCard: function(sCVC, dExecution, sPaymentCardID, sAmount, fnSuccess) {
//		//TODO: Implement payments in offline mode
//	},
//	/*   _getBalanceModel: function(){
// if (!this.oBalance){
// var countractAccounts = this.oContractAccounts.getData().results;
// var balance = {"Amount": 0, "Currency": null };
// for (var i = 0; i < countractAccounts.length; i++){
// balance.Amount = parseFloat(balance.Amount) + parseFloat(countractAccounts[i].ContractAccountBalance.CurrentBalance);
// balance.Currency = countractAccounts[i].ContractAccountBalance.Currency;
// }
// this.oBalance = new sap.ui.model.json.JSONModel();
// this.oBalance.setData(balance);
// return this.oBalance;
// } else{
// return this.oBalance;
// }
// },*/
//	_readContractAccounts: function(oDelegate) {
//		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
//		oFakeJsonModel.loadData("invoice/model/mockdata/contractAccounts.json");
//		var fnCompleted = jQuery.proxy(function() {
//			this.oContractAccounts.setData(oFakeJsonModel.getData().d);
//			oDelegate.onContractAccountsLoaded(this.oContractAccounts, this._getBalanceModel());
//		}, this);
//		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
//	},
//
//	_readBillHistory: function(oDelegate, sContractAccountId) {
//		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
//		oFakeJsonModel.loadData("invoice/model/mockdata/bill_history.json");
//		var fnCompleted = jQuery.proxy(function() {
//			this.oInvoiceHistory.setData(oFakeJsonModel.getData().d);
//			oDelegate.onBillHistoryLoaded(this.oInvoiceHistory);
//		}, this);
//		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
//	},
//	_readPaymentHistory: function(oDelegate) {
//		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
//		oFakeJsonModel.loadData("invoice/model/mockdata/payment_history.json");
//		var fnCompleted = jQuery.proxy(function() {
//			var payments = this._sortPaymentHistory(oFakeJsonModel.getData().d.results);
//			this.oInProcessPayments.setData(payments.InProcess.results);
//			this.oProcessedPayments.setData(payments.Processed.results);
//			oDelegate.onPaymentHistoryLoaded(this.oInProcessPayments, this.oProcessedPayments);
//		}, this);
//		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
//	}

};