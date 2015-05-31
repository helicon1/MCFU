jQuery.sap.declare("sap.umc.mobile.invoice.model.DataProvider");

sap.umc.mobile.invoice.model.DataProvider = {
	loadInvoices: function(oDelegate, bForcedReload) {
		if (bForcedReload == true){
			this._reloadInvoices(oDelegate);
		} else {
			if (!this.oInvoices) {
				this._reloadInvoices(oDelegate);
			} else {
				if (oDelegate != null){
					oDelegate.onInvoicesLoaded(this.oInvoices);
				}
			}
		}
	},
	_reloadInvoices: function(oDelegate) {
		this.oInvoices = new sap.ui.model.json.JSONModel();
		this._readInvoices(oDelegate);
	},
	loadPaymentMethods: function(oDelegate, oParameters) {
		// if (!this.oExistingAccounts) {
		var fnCallBack = jQuery.proxy(function(oBanks, oCards) {
			this.oExistingAccounts = new sap.ui.model.json.JSONModel();
			var aBankAccounts = null;
			var aPaymentCards = null;
			if (oBanks.results) {
				oBanks.results = oBanks.results.reverse();
				for ( var i = 0; i < oBanks.results.length; i++) {
					oBanks.results[i].id = oBanks.results[i].BankAccountID + "bank";
					oBanks.results[i].entryName = jQuery.sap.formatMessage("{0}-{1}", [oBanks.results[i].BankAccountNo, oBanks.results[i].BankID]);
				}
				aBankAccounts = oBanks.results;
			}
			if (oCards.results) {
				oCards.results = oCards.results.reverse();
				for ( var i = 0; i < oCards.results.length; i++) {
					oCards.results[i].cvc = "";
					oCards.results[i].id = oCards.results[i].PaymentCardID + "card";
					oCards.results[i].entryName = jQuery.sap.formatMessage("{0}-{1}", [oCards.results[i].CardNumber,
					                                                                   oCards.results[i].PaymentCardType.Description]);
				}
				aPaymentCards = oCards.results;
			}
			var aNewAccounts = [];
			aNewAccounts.push({
				id: -1,
				entryName: sap.ui.getCore().getModel("i18n").getProperty("INVOICE.NEWBANK")
			});
			aNewAccounts.push({
				id: -2,
				entryName: sap.ui.getCore().getModel("i18n").getProperty("INVOICE.NEWCARD")
			});

			//Default account to be prepended to the account array
			oDefaultAccount = {
				id: -3,
				entryName: sap.ui.getCore().getModel("i18n").getProperty("INVOICE.SELECT_PAYMENT_METHOD")
			};

			var aAccounts;
			if (aBankAccounts !== null && aPaymentCards !== null) {
				aAccounts = aBankAccounts.concat(aPaymentCards).concat(aNewAccounts);
			} else if (aBankAccounts !== null) {
				aAccounts = aBankAccounts.concat(aNewAccounts);
			} else if (aPaymentCards !== null) {
				aAccounts = aPaymentCards.concat(aNewAccounts);
			}else{
				aAccounts = aNewAccounts;
			}
			aAccounts.unshift(oDefaultAccount);
			this.oExistingAccounts.setData(aAccounts);
			this.oExistingAccounts.setProperty("/date", new Date());
			this.oExistingAccounts.setProperty("/_defaultDate", new Date());
			this.oExistingAccounts.setProperty("/cvc", "");
			// parameters
			if (oParameters.Currency) {
				this.oExistingAccounts.setProperty("/_currency", oParameters.Currency);
			}
			this.oExistingAccounts.setProperty("/amount", oParameters.Amount);
			this.oExistingAccounts.setProperty("/_defaultAmount", oParameters.Amount);
			this.oExistingAccounts.setProperty("/paymentEnabled", oParameters.EnablePaymentAmount);
			oDelegate.onPaymentMethodsLoaded(this.oExistingAccounts, oParameters.PaymentID);
		}, this);
		this._readPaymentMethods(fnCallBack);
		// }
		// else {
		// oDelegate.onPaymentMethodsLoaded(this.oExistingAccounts, fnCallBackView);
		// }
	},
//	loadBillHistoryByContractAccountId: function(oDelegate, sContractAccountId) {
//		this.oInvoiceHistory = new sap.ui.model.json.JSONModel();
//		this._readBillHistory(oDelegate, sContractAccountId);
//	},
	updatecvc: function(oModel, sCvc) {
		oModel.setProperty("/cvc", sCvc);
		return oModel;
	},
	updatePaymentMethodId: function(oModel, oSelectedPaymentKey) {
		var oPaymentsUpdatedModel = oModel;
		oPaymentsUpdatedModel.setProperty("/selectedKey", oSelectedPaymentKey);
		return oPaymentsUpdatedModel;
	},
	getInvoiceById: function(invoiceId) {
		var invoices = this.oInvoices.getData().results;
		var invoiceModel;
		if (invoices) {
			for ( var i = 0; i < invoices.length; i++) {
				if (invoices[i].InvoiceID === invoiceId) {
					invoiceModel = new sap.ui.model.json.JSONModel();
					invoiceModel.setData(invoices[i]);
					break;
				}
			}
		}
		return invoiceModel;
	},
	createOneTimePaymentByCard: function(sCVC, dExecution, sPaymentCardID, sAmount, sInvoiceID, fnSuccess) {
		this._createPaymentByCard(sCVC, dExecution, sPaymentCardID, sAmount, sInvoiceID, fnSuccess);
	},
	createOneTimePaymentByBank: function(dExecution, sBankID, sAmount, sInvoiceID, fnSuccess) {
		this._createPaymentByBank(dExecution, sBankID, sAmount, sInvoiceID, fnSuccess);
	},
	createBalancePaymentByCard: function(sCVC, dExecution, sPaymentCardID, sAmount, sCurrency, fnSuccess) {
		this._createBalancePaymentByCard(sCVC, dExecution, sPaymentCardID, sAmount, sCurrency, fnSuccess);
	},
	createBalancePaymentByBank: function(dExecution, sBankID, sAmount, sCurrency, fnSuccess) {
		this._createBalancePaymentByBank(dExecution, sBankID, sAmount, sCurrency, fnSuccess);
	},
	loadContractAccounts: function(oDelegate) {
		// if (!this.oContractAccounts) {
			this.oContractAccounts = new sap.ui.model.json.JSONModel();
			this._readContractAccounts(oDelegate);
			// }
			// else {
			// oDelegate.onContractAccountsLoaded(this.oContractAccounts, this._getBalanceModel());
			// }
	},
	_getBalanceModel: function() {
		// if (!this.oBalance){
		var countractAccounts = this.oContractAccounts.getData().results;
		var balance = {
				"Amount": 0,
				"Currency": null
		};
		for ( var i = 0; i < countractAccounts.length; i++) {
			if (parseFloat(countractAccounts[i].ContractAccountBalance.CurrentBalance) > 0) {
				balance.Amount = parseFloat(balance.Amount) + parseFloat(countractAccounts[i].ContractAccountBalance.CurrentBalance);
				balance.Currency = countractAccounts[i].ContractAccountBalance.Currency;
			}
		}
		this.oBalance = new sap.ui.model.json.JSONModel();
		this.oBalance.setData(balance);
		return this.oBalance;
		// } else{
			// return this.oBalance;
		// }
	},
	_determinePaymentState: function() {
		var invoices = this.oInvoices.getData().results;
		for ( var i = 0; i < invoices.length; i++) {
			if (invoices[i].AmountRemaining > 0) {
				invoices[i].PaymentStateDescription = sap.ui.getCore().getModel("i18n").getProperty("INVOICE.DUE");
				invoices[i].PaymentState = "Warning";
			} else {
				invoices[i].PaymentStateDescription = sap.ui.getCore().getModel("i18n").getProperty("INVOICE.PAID");
				invoices[i].PaymentState = "Success";
			}
		}
	},
	loadPaymentHistory: function(oDelegate) {
		this.oInProcessPayments = new sap.ui.model.json.JSONModel();
		this.oProcessedPayments = new sap.ui.model.json.JSONModel();
		this._readPaymentHistory(oDelegate);
	},
	_sortPaymentHistory: function(data) {
		var payments = {
				"InProcess": {
					"results": []
				},
				"Processed": {
					"results": []
				}
		};
		for ( var i = 0; i < data.length; i++) {
			if (data[i].PaymentStatusID == 2 || data[i].PaymentStatusID == 3 || data[i].PaymentStatusID == 4) {
				data[i].PaymentStatus = sap.ui.getCore().getModel("i18n").getProperty("INVOICE.IN_PROCESS");
				payments.InProcess.results.push(data[i]);
			} else if (data[i].PaymentStatusID == 9) {
				data[i].PaymentStatus = sap.ui.getCore().getModel("i18n").getProperty("INVOICE.PROCESSED");
				payments.Processed.results.push(data[i]);
			} else {
				data[i].PaymentStatus = sap.ui.getCore().getModel("i18n").getProperty("INVOICE.OTHERS");
			}
		}
		return payments;
	},
	cancelPayment: function(oDelegate, oPaymentDocument){
		this._removePaymentDocument(oDelegate, oPaymentDocument);
	}
};
