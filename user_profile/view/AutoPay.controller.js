sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.AutoPay", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "autoPay") {
				this._loadBussinessAgreements();
				this._loadAutoPaymentMethods();
			}
		}, this);
	},
	_loadBussinessAgreements: function() {
		this.getDataProvider().loadBusinessAgreements(this);
	},
	_loadAutoPaymentMethods: function() {
		this.getDataProvider().loadAutoPaymentMethods(this);
	},
	onReadBusinessAgreementsSuccess: function(oBusinessAgreements) {
		this.getView().setModel(sap.umc.mobile.user_profile.js.utils.businessAgreementsListFormatter(oBusinessAgreements), "businessAgreements");
		this.getView().getModel("businessAgreements").setProperty("/isModified", false);
	},
	onAutoPaymentMethodsLoadedSuccess: function(oAutoPaymentMethods) {
		this.getView().setModel(sap.umc.mobile.user_profile.js.utils.paymentMethodsListFormatter(oAutoPaymentMethods), "autoPaymentMethods");
		this._loadBussinessAgreements();
	},
	onSaveBusinessAgreements: function(oEvent) {
		if (this.getView().getModel("businessAgreements").getProperty("/isModified")) {
			if (this.getDataProvider().isMock) {
				this.onBatchSubmitSuccess();
			} else {
				this._finishEditingBusinessAgreements();
			}
		} else {
			this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR,
					sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.AUTOPAY_NONSELECT"));
		}
	},
	onBusinessAgreementPaymentAccountSwitched: function(oEvent) {
		this.getView().getModel("businessAgreements").setProperty("/isModified", true);
	},
	onBusinessAgreementPaymentAccountChanged: function(oEvent) {
		var oBusinessAgreement = this
				._getSelectedPaymentMethod(oEvent.getSource().getParent().mAggregations.content[1].mAggregations.content[1].mProperties.text);
		var oControl = oEvent.getSource();
		var selectedKeyType = oControl.mProperties.selectedKey.slice(-4);
		this.getView().getModel("businessAgreements").setProperty("/isModified", false);
		if (selectedKeyType === sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.BANK) {
			var sBankId = oControl.mProperties.selectedKey.slice(0, -4);
			oBusinessAgreement.IncomingPaymentMethodID = sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.PAYMENT_BANK;
			oBusinessAgreement.IncomingPaymentBankAccountID = sBankId;
			oBusinessAgreement.IncomingPaymentPaymentCardID = "";
			oBusinessAgreement._incomingPaymentIdChanged = true;
			this.getView().getModel("businessAgreements").setProperty("/isModified", true);
		} else if (selectedKeyType === sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.CARD) {
			var sCardId = oControl.mProperties.selectedKey.slice(0, -4);
			oBusinessAgreement.IncomingPaymentMethodID = sap.umc.mobile.CONSTANTS.PAYMENT_METHODS.PAYMENT_CARD;
			oBusinessAgreement.IncomingPaymentBankAccountID = "";
			oBusinessAgreement.IncomingPaymentPaymentCardID = sCardId;
			oBusinessAgreement._incomingPaymentIdChanged = true;
			this.getView().getModel("businessAgreements").setProperty("/isModified", true);
		}
	},
	_getSelectedPaymentMethod: function(sBusinessAgreementID) {
		for ( var i = 0; i < this.getView().getModel("businessAgreements").getData().results.length; i++) {
			if (sBusinessAgreementID === this.getView().getModel("businessAgreements").getData().results[i].BusinessAgreementID) {
				return this.getView().getModel("businessAgreements").getData().results[i];
			}
		}
	},
	//submit batch
	_finishEditingBusinessAgreements: function() {
		var aBusinessAgreements = this.getView().getModel("businessAgreements").getProperty("/results");
		var batch = [];
		if (aBusinessAgreements && aBusinessAgreements.length) {
			$.each(aBusinessAgreements, $.proxy(function(iIndex, oBusinessAgreement) {
				if (oBusinessAgreement.SwitchFlag === false) {
					oBusinessAgreement.IncomingPaymentMethodID = "";
					oBusinessAgreement.IncomingPaymentBankAccountID = "";
					oBusinessAgreement.IncomingPaymentPaymentCardID = "";
					this._saveBusinessAgreement(oBusinessAgreement, batch);
				} else {
					if (oBusinessAgreement.hasOwnProperty("_incomingPaymentIdChanged")) {
						this._saveBusinessAgreement(oBusinessAgreement, batch);
					}
				}
			}, this));
		}
		if (batch.length > 0) {
			if (this._checkNonSelectedAutoPay()) {
				this.getDataProvider().updateAutoPayMethod(this, batch);
			} else {
				this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR,
						sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.AUTOPAY_NONSELECT"));
			}
		} else {
			this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR,
					sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.AUTOPAY_NONSELECT"));
		}
	},
	_checkNonSelectedAutoPay: function() {
		for ( var i = 0; i < this.getView().getModel("businessAgreements").getData().results.length; i++) {
			if (this.getView().getModel("businessAgreements").getData().results[i].SwitchFlag === true
					&& this.getView().getModel("businessAgreements").getData().results[i].SelectedPaymentMethodKey == -1) {
				return false;
			}
		}
		return true;
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
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n")
				.getProperty("USER_PROFILE.BATCH_SUSSCESS"));
		this._loadBussinessAgreements();
	},
	isDirty: function() {
		return this.getView().getModel("businessAgreements").getProperty("/isModified");
	}

});