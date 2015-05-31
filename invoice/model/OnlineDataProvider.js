/*global window */
jQuery.sap.declare("sap.umc.mobile.invoice.model.OnlineDataProvider");
sap.umc.mobile.invoice.model.OnlineDataProvider = {
		_readInvoices: function(oDelegate) {
			var fnSuccess = jQuery.proxy(function(oData, oResponse) {
				if (oData.results) {
					this.oInvoices.setSizeLimit(oData.results && oData.results.length);
					this.oInvoices.setData(oData);
					sap.umc.mobile.invoice.js.utils.invoiceFormatter(this.oInvoices);
					this._determinePaymentState();
					if (oDelegate != null) {
						oDelegate.onInvoicesLoaded(this.oInvoices);
					}
				}
			}, this);
			var sInvoicePath = this.getAccountPath() + "Invoices";
			this.SERVICE.read(sInvoicePath, ["$format=json", "$expand=ContractAccount"], true, {
				fnSuccess: fnSuccess
			});
		},
		_readContractAccounts: function(oDelegate) {
			var fnSuccess = jQuery.proxy(function(oData, oResponse) {
				if (oData.results) {
					this.oContractAccounts.setSizeLimit(oData.results && oData.results.length);
					this.oContractAccounts.setData(oData);
					oDelegate.onContractAccountsLoaded(this.oContractAccounts, this._getBalanceModel());

				}
			}, this);
			var sInvoicePath = this.getAccountPath() + "ContractAccounts";
			this.SERVICE.read(sInvoicePath, ["$format=json", "$expand=ContractAccountBalance"], true, {
				fnSuccess: fnSuccess
			});
		},
		getInvoicePdf: function(sInvoiceID) {
//			window.open(this.SERVICE._getServiceUrl_old(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_ERP, true) + "/Invoices('" + sInvoiceID
//					+ "')/InvoicePDF/$value");
			 window.open(this.SERVICE._getServiceUrl(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_ERP, true) + "/Invoices('" +
			 sInvoiceID
			 + "')/InvoicePDF/$value");
		},
		_readPaymentMethods: function(fnProviderCallBack) {
			var sBanksPath = this.getAccountPath() + "BankAccounts";
			var sCardsPath = this.getAccountPath() + "PaymentCards";
			var oBanks = null;
			var oCards = null;
			var fnCardsSuccess = jQuery.proxy(function(oData, oResponse) {
				oCards = oData;
				fnProviderCallBack(oBanks, oCards);
			}, this);
			var fnBanksSuccess = jQuery.proxy(function(oData, oResponse) {
				oBanks = oData;
				this.SERVICE.read(sCardsPath, ["$format=json", "$expand=PaymentCardType"], true, {
					fnSuccess: fnCardsSuccess
				});
			}, this);

			this.SERVICE.read(sBanksPath, ["$format=json", "$expand=Bank"], true, {
				fnSuccess: fnBanksSuccess
			});
		},
		_constructBasePaymentPayload: function(dDate) {
			var oOneTimePayment = {
					PaymentDocumentItems: []
			};
			oOneTimePayment.AccountID = this.getAccountId();
			oOneTimePayment.PaymentMethodDescription = "";
			oOneTimePayment.Cardholder = "";
			oOneTimePayment.BankAccountID = "";
			oOneTimePayment.PaymentCardID = "";
			oOneTimePayment.CVC = "";
			oOneTimePayment.Currency = "";
			oOneTimePayment.Amount = "0";
			oOneTimePayment.PaymentCardTypeID = "";
			oOneTimePayment.CardNumber = "";
			oOneTimePayment.PaymentStatusID = "";
			oOneTimePayment.PaymentDocumentID = "";
			oOneTimePayment.ExecutionDate = dDate;
			return oOneTimePayment;
		},
		_constructBaseInvoicePayload: function(sInvoiceID, sPaymentAmount) {
			var oInvoiceEntity = {};
			oInvoiceEntity.InvoiceID = sInvoiceID;
			oInvoiceEntity.Amount = sPaymentAmount.replace(/,/, '');
			oInvoiceEntity.Currency = "";
			oInvoiceEntity.PaymentDocumentID = "";
			return oInvoiceEntity;
		},
		_createPaymentByCard: function(sCVC, dExecution, sPaymentCardID, sAmount, sInvoiceID, fnSuccess) {
			var oOneTimePayment = this._constructBasePaymentPayload(dExecution);
			oOneTimePayment.PaymentCardID = sPaymentCardID;
			oOneTimePayment.CVC = sCVC;
			oOneTimePayment.PaymentDocumentItems.push(this._constructBaseInvoicePayload(sInvoiceID, sAmount));
			this._postPaymentDocuments(oOneTimePayment, fnSuccess);
		},
		_createPaymentByBank: function(dExecution, sBankID, sAmount, sInvoiceID, fnSuccess) {
			var oOneTimePayment = this._constructBasePaymentPayload(dExecution);
			oOneTimePayment.BankAccountID = sBankID;
			oOneTimePayment.PaymentDocumentItems.push(this._constructBaseInvoicePayload(sInvoiceID, sAmount));
			this._postPaymentDocuments(oOneTimePayment, fnSuccess);
		},
		_createBalancePaymentByBank: function(dExecution, sBankID, sAmount, sCurrency, fnSuccess) {
			var oBalancePayment = this._constructBasePaymentPayload(dExecution);
			oBalancePayment.BankAccountID = sBankID;
			oBalancePayment.Amount = sAmount.toString();
			oBalancePayment.Currency = sCurrency;
			this._postPaymentDocuments(oBalancePayment, fnSuccess);
		},
		_createBalancePaymentByCard: function(sCVC, dExecution, sPaymentCardID, sAmount, sCurrency, fnSuccess) {
			var oBalancePayment = this._constructBasePaymentPayload(dExecution);
			oBalancePayment.PaymentCardID = sPaymentCardID;
			oBalancePayment.CVC = sCVC;
			oBalancePayment.Currency = sCurrency;
			oBalancePayment.Amount = sAmount.toString();
			this._postPaymentDocuments(oBalancePayment, fnSuccess);
		},
		_postPaymentDocuments: function(oPayload, fnSuccess) {
			this.SERVICE.createEntity("PaymentDocuments", oPayload, {
				fnSuccess: fnSuccess
			});
		},
		_readBillHistory: function(oDelegate, sContractAccountId) {
			var fnSuccess = jQuery.proxy(function(oData, oResponse) {
				if (oData.results) {
					oData.results = oData.results.reverse();
					this.oInvoiceHistory.setSizeLimit(oData.results && oData.results.length);
					this.oInvoiceHistory.setData(oData);
					oDelegate.onBillHistoryLoaded(this.oInvoiceHistory);
				}
			}, this);
			var dDateFrom = new Date();
			var dDateTo = new Date();
			dDateFrom.setMonth(dDateFrom.getMonth() - 6);
			var sDateFrom = (dDateFrom.getFullYear()) + "-" + (dDateFrom.getMonth() + 1) + "-" + dDateFrom.getDate() + "T00:00:00";
			var sDateTo = (dDateTo.getFullYear()) + "-" + (dDateTo.getMonth() + 1) + "-" + dDateTo.getDate() + "T00:00:00";
			var sPath = "ContractAccounts('" + sContractAccountId + "')/Invoices";
			var sFilterOptions = '$filter=InvoiceDate ge datetime\'' + sDateFrom + '\'  and InvoiceDate le datetime\'' + sDateTo + '\'';
			this.SERVICE.read(sPath, [sFilterOptions, "$format=json"], false, {
				fnSuccess: fnSuccess
			});
		},
		_readPaymentHistory: function(oDelegate) {
			var fnSuccess = jQuery.proxy(function(oData, oResponse) {
				var payments = this._sortPaymentHistory(oData.results);
				this.oInProcessPayments.setSizeLimit(payments.InProcess.results && payments.InProcess.results.length);
				this.oInProcessPayments.setData(payments.InProcess);
				this.oProcessedPayments.setSizeLimit(payments.Processed.results && payments.Processed.results.length);
				this.oProcessedPayments.setData(payments.Processed);
				oDelegate.onPaymentHistoryLoaded(this.oInProcessPayments, this.oProcessedPayments);
			}, this);
			var sPath = this.getAccountPath() + "PaymentDocuments";
			this.SERVICE.read(sPath, ["$format=json"], false, {
				fnSuccess: fnSuccess
			});
		},
		_removePaymentDocument: function(oDelegate, oPaymentDocument) {
			var fnSuccess = jQuery.proxy(function(oData, oResponse) {
				oDelegate.onCancelPaymentSuccess();
			}, oDelegate);
			this.SERVICE.removeEntity("/PaymentDocuments", ["PaymentDocumentID=\'" + oPaymentDocument.PaymentDocumentID + "\'"], {
				fnSuccess: fnSuccess
			});
		}
};