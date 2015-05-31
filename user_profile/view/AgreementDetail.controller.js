sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.AgreementDetail", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(
				function(oEvent) {
					var sNavigationName = oEvent.getParameter("name");
					var sContractAccountId = oEvent.getParameter("arguments").ContractAccountID;
					if (sNavigationName === "agreementDetail") {
						var fnCallback = jQuery.proxy(function(oContractAccounts) {
							var oContractAccount = new sap.ui.model.json.JSONModel();
							oContractAccount.setData(this.getDataProvider().getContractAccountById(sContractAccountId));
							this.getView().setModel(oContractAccount, "Agreement");
							var oAccountBalance = new sap.ui.model.json.JSONModel(oContractAccount.getData().ContractAccountBalance);
							this.getView().setModel(oAccountBalance, "AccountBalance");
							var oBillingAddress = new sap.ui.model.json.JSONModel(oContractAccount.getData().BillToAccountAddress.AddressInfo);
							this.getView().setModel(oBillingAddress, "BillingAddress");
							this.getView().getModel("BillingAddress").setProperty("/AddressID", oContractAccount.getData().BillToAccountAddress.AddressID);

							var fnCallback = jQuery.proxy(function(oContracts) {
								this.getView().setModel(oContracts, "Services");
								if (oContracts.getData().results[0]) {
									this.getView().getModel("Agreement").setProperty("/_AgreementAddress",
											oContracts.getData().results[0].Premise.AddressInfo.ShortForm);
								}
								this._populateServices();
							}, this);
							this.getDataProvider().loadContracts(sContractAccountId, fnCallback);
							this.getDataProvider().loadBusinessAgreements(this);

						}, this);
						this.getDataProvider().loadContractAccounts(fnCallback);
						// this._decideAutoPay();
					}
				}, this);
	},
	onReadBusinessAgreementsSuccess: function(oBusinessAgreements) {
		this._decideAutoPay(oBusinessAgreements);
	},
	_populateServices: function() {
		var oServices = this.getView().getModel("Services").getData().results;
		var oForm = this.getView().byId("servicesForm");
		oForm.removeAllContent();
		for (var i = 0; i < oServices.length; i++) {
			var oLabel = new sap.m.Label({
				"text": oServices[i].Division.Description
			});
			var sDate = sap.umc.mobile.app.js.formatters.dateFormatter(oServices[i].ContractStartDate);
			var oText = new sap.m.Text({
				"text": this.getFormattedText("USER_PROFILE.ACTIVE_SINCE", [sDate])
			});
			oForm.addContent(oLabel);
			oForm.addContent(oText);
		}
	},
	_decideAutoPay: function(oBusinessAgreements) {
		var oAutoPay = new sap.ui.model.json.JSONModel({
			_AutoPay: "",
			_AutoPayAccount: ""
		});
		this.getView().setModel(oAutoPay, "AutoPay");
		var oContractAccount = this._getBusinessAgreements(oBusinessAgreements, this.getView().getModel("Agreement").getData().ContractAccountID);
		var sAutoPay;
		if (oContractAccount.IncomingPaymentMethodID === sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.PAYMENT_BANK) {
			sAutoPay = this.getText("APP.ON");
		} else if (oContractAccount.IncomingPaymentMethodID === sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.PAYMENT_CARD) {
			sAutoPay = this.getText("APP.ON");
		} else {
			sAutoPay = this.getText("APP.OFF");
		}
		this.getView().getModel("AutoPay").setProperty("/_AutoPay", sAutoPay);
		if (!oContractAccount.IncomingPaymentMethodID) {
			return;
		}
		var fnCallback = jQuery.proxy(function(oBankAccounts, oPaymentCards) {
			var sAutoPayAccount = "";
			if (oContractAccount.IncomingPaymentMethodID === sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.PAYMENT_BANK) {
				var oBankAccount = this.getDataProvider().getBankAccountById_M(oContractAccount.IncomingPaymentBankAccountID);
				this.getView().getModel("AutoPay").setProperty("/_AutoPayAccount",
						oBankAccount.getProperty("/BankAccountNo") + "-" + oBankAccount.getProperty("/BankID"));
			} else if (oContractAccount.IncomingPaymentMethodID === sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.PAYMENT_CARD) {
				var oPaymentCard = this.getDataProvider().getPaymentCardById_M(oContractAccount.IncomingPaymentPaymentCardID);
				var fnCallbackInner = jQuery.proxy(function(oPaymentCardType) {
					sAutoPayAccount = oPaymentCard.getProperty("/CardNumber") + "-" + oPaymentCardType.getData().Description;
					this.getView().getModel("AutoPay").setProperty("/_AutoPayAccount", sAutoPayAccount);
				}, this);
				this.getDataProvider().getPaymentCardTypeById_M(oPaymentCard.getProperty("/PaymentCardTypeID"), fnCallbackInner);
			}

		}, this);
		this.getDataProvider().loadPaymentAccounts_M(fnCallback);
	},
	_getBusinessAgreements: function(oBusinessAgreements, ContractAccountID) {
		for (var i = 0; i < oBusinessAgreements.getData().results.length; i++) {
			if (oBusinessAgreements.getData().results[i].BusinessAgreementID === ContractAccountID) {
				return oBusinessAgreements.getData().results[i];
			}
		}
	},
	handleBillingAddressPress: function() {
		this.getDataProvider().loadBusinessAgreement(this, this.getView().getModel("Agreement").getProperty("/ContractAccountID"));
	},
	onReadBusinessAgreementSuccess: function(sAddressID) {
		this.getRouter().myNavTo("billingAddress", {
			AgreementNumber: this.getView().getModel("Agreement").getProperty("/ContractAccountID") + "-" + sAddressID
		});
	}

});