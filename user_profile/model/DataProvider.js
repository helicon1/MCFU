jQuery.sap.declare("sap.umc.mobile.user_profile.model.DataProvider");

sap.umc.mobile.user_profile.model.DataProvider = {

	utils: sap.umc.mobile.user_profile.js.utils,

	loadPaymentAccounts: function(oDelegate) {
		this.oBankAccounts = new sap.ui.model.json.JSONModel();
		this.oCardAccounts = new sap.ui.model.json.JSONModel();
		this._readPaymentAccounts(oDelegate);
	},
	loadCountries: function() {
		this.oCountries = new sap.ui.model.json.JSONModel();
		this._readCountries();
	},
	loadBusinessAgreements: function(oDelegate) {
		this.oBusinessAgreements = new sap.ui.model.json.JSONModel();
		this._readBusinessAgreements(oDelegate);
	},
	loadAutoPaymentMethods: function(oDelegate) {
		this.oAutoPaymentMethods = new sap.ui.model.json.JSONModel();
		this._readAutoPaymentMethods(oDelegate, this);
	},
	_readPaymentAccounts: function(oDelegate) {
		this._readBankAccounts(oDelegate);
		this._readCardAccounts(oDelegate);
	},
	reloadBankAccounts: function() {
		this._readBankAccounts();
	},
	reloadPaymentCards: function() {
		this._readCardAccounts();
	},
	getBankAccountById: function(sBankId) {
		var oBankAccounts = this.oBankAccounts.getData().results;
		var bankModel = new sap.ui.model.json.JSONModel();
		if (oBankAccounts) {
			for ( var i = 0; i < oBankAccounts.length; i++) {
				if (oBankAccounts[i].BankAccountID === sBankId) {
					oBankAccounts[i].CountryName = this.getCountryNameById(oBankAccounts[i].CountryID);
					bankModel.setData(oBankAccounts[i]);
					break;
				}
			}
		}
		return bankModel;
	},
	getPaymentCardById: function(sPaymentCardID) {
		var oCardAccounts = this.oCardAccounts.getData().results;
		var cardModel = null;
		if (oCardAccounts) {
			for ( var i = 0; i < oCardAccounts.length; i++) {
				if (oCardAccounts[i].PaymentCardID === sPaymentCardID) {
					cardModel = new sap.ui.model.json.JSONModel();
					oCardAccounts[i].CardType = oCardAccounts[i].PaymentCardType.Description;
					cardModel.setData(oCardAccounts[i]);
					break;
				}
			}
		}
		return cardModel;
	},
	getCountryNameById: function(sCountryId) {
		var oCountries = this.oCountries.getData().results;
		var sCountryName = null;
		if (oCountries) {
			for ( var i = 0; i < oCountries.length; i++) {
				if (oCountries[i].CountryID === sCountryId) {
					sCountryName = oCountries[i].Name;
					break;
				}
			}
		}
		return sCountryName;
	},
	saveBankAccount: function(oDelegate, oBankAccount) {
		if (this.isMock) {
			oDelegate.onSaveBankAccountSuccess();
		} else {
			this._updateBankAccount(oDelegate, oBankAccount);
		}
	},
	savePaymentCard: function(oDelegate, oPaymentCard) {
		if (this.isMock) {
			oDelegate.onSavePaymentCardSuccess();	
		} else {
			this._updatePaymentCard(oDelegate, oPaymentCard);
		}	
	},
	removeBankAccount: function(oDelegate, oBankAccount) {	
		if (this.isMock) {
			oDelegate.onDeleteBankAccountSuccess();
		} else {
			this._deleteBankAccount(oDelegate, oBankAccount);
		}
	},
	removePaymentCard: function(oDelegate, oPaymentCard) {		
		if (this.isMock) {
			oDelegate.onDeletePaymentCardSuccess();
		} else {
			this._deletePaymentCard(oDelegate, oPaymentCard);
		}	
	},
	loadCountryList: function(oDelegate) {
		this.oCountries = new sap.ui.model.json.JSONModel();
		this._readCountries(oDelegate);
	},
	loadBankList: function(oDelegate, sCountryID) {
		this.oBanks = new sap.ui.model.json.JSONModel();
		this._readBanks(oDelegate, sCountryID);
	},
	createNewBankAccount: function(oDelegate, oBankAccount) {
		this._createBankAccount(oDelegate, oBankAccount);
	},
	createNewCreditCard: function(oDelegate, oCardAccount) {
		this._createCreditCard(oDelegate, oCardAccount);
	},
	loadPaymentCardTypes: function(oDelegate) {
		this.oPaymentCardTypes = new sap.ui.model.json.JSONModel();
		this._readPaymentCardType(oDelegate);
	},
	readAccountAddress: function(oDelegate) {
		this._readAddresses(oDelegate);
	},
	addBatchOperation: function(oBusinessAgreementCopy, batch) {
		this._addChangedPaymentMethod(oBusinessAgreementCopy, batch);
	},
	updateAutoPayMethod: function(oDelegate, batch) {
		this._submitBatchOperation(oDelegate, batch);
	},
	readPersonalData: function(oDelegate) {
		//if (!this.oPersonalInfo) {
			this._refreshPersonalInfo(oDelegate);
		//}
	},
	reloadPersonalData: function(oDelegate) {
		this._refreshPersonalInfo(oDelegate);
	},
	loadContractAccounts: function(fnCallback) {
		if (!this.oContractAccounts) {
			this._bContractAccountsChanged = false;
			this.oContractAccounts = new sap.ui.model.json.JSONModel();
			this._readContractAccounts(fnCallback);
		} 
		else if (this._bContractAccountsChanged) {
			this.oContractAccounts = new sap.ui.model.json.JSONModel();
			this._readContractAccounts(fnCallback);
		} else {
			//fnCallback(this.oContractAccounts);
			this.oContractAccounts = new sap.ui.model.json.JSONModel();
			this._readContractAccounts(fnCallback);
		}
	},
	setContractAccountsChanged: function(bIsChanged) {
		this._bContractAccountsChanged = bIsChanged;
	},
	getContractAccountById: function(sContractAccountId) {
		var oContractAccount = this.oHelper.getEntityById(this.oContractAccounts, "ContractAccountID", sContractAccountId, false);
		return oContractAccount;
	},
	loadContracts: function(sContractAccountId, fnCallback) {
		var oContractAccount = this.oHelper.getEntityById(this.oContractAccounts, "ContractAccountID", sContractAccountId, false);
		/*
		 * if (!oContractAccount._Contracts) { this._readContracts(oContractAccount, fnCallback); }else{
		 * fnCallback(oContractAccount._Contracts); }
		 */
		this._readContracts(oContractAccount, fnCallback);
	},
	loadPaymentAccounts_M: function(fnCallback) {
		this.oBankAccounts = new sap.ui.model.json.JSONModel();
		this.oPaymentCards = new sap.ui.model.json.JSONModel();
		this._readPaymentAccounts_M(fnCallback);
	},
	getBankAccountById_M: function(sBankAccountId) {
		var _oBankAccounts = this.oBankAccounts.getData().results;
		if (_oBankAccounts) {
			for ( var i = 0; i < _oBankAccounts.length; i++) {
				if (_oBankAccounts[i].BankAccountID === sBankAccountId) {
					return new sap.ui.model.json.JSONModel(_oBankAccounts[i]);
				}
			}
		}
		return null;
	},
	getPaymentCardById_M: function(sPaymentCardId) {
		var _oPaymentCards = this.oPaymentCards.getData().results;
		if (_oPaymentCards) {
			for ( var i = 0; i < _oPaymentCards.length; i++) {
				if (_oPaymentCards[i].PaymentCardID === sPaymentCardId) {
					return new sap.ui.model.json.JSONModel(_oPaymentCards[i]);
				}
			}
		}
		return null;
	},
	getPaymentCardTypeById_M: function(sPaymentCardTypeId, fnCallback) {
		var _fnCallback = jQuery.proxy(function() {
			var oPaymentCardType = this.oHelper.getEntityById(this.oPaymentCardTypes, "PaymentCardTypeID", sPaymentCardTypeId, true);
			fnCallback(oPaymentCardType);
		}, this);

		if (!this.oPaymentCardTypes) {
			this.oPaymentCardTypes = new sap.ui.model.json.JSONModel();
			this._readPaymentCardTypes_M(_fnCallback);
		} else {
			_fnCallback();
		}
	},
	loadCommunicationPreferences: function(oDelegate) {
		this.oCommunicationPreferences = new sap.ui.model.json.JSONModel();
		// this.oCommunicationPreferencesMethods = new sap.ui.model.json.JSONModel();
		this.oStandardAddress = new sap.ui.model.json.JSONModel();
		this.oBillingMethods = new sap.ui.model.json.JSONModel();
		this.oOutageMethods = new sap.ui.model.json.JSONModel();
		this.fnPreferencesCallback = jQuery.proxy(oDelegate.onCommunicationPreferencesloaded, oDelegate);
		this.fnPreferencesCallbackNotSet = jQuery.proxy(oDelegate.onCommuncationPreferencesNotSet, oDelegate);
		this._readCommunicationPreferences(oDelegate);
	},
	loadCommunicationMethods: function(oDelegate) {
		// if (!this.oCommunicationPreferencesMethods) {
		// this.oCommunicationPreferencesMethods = new sap.ui.model.json.JSONModel();
		// this._readCommunicationCategories(jQuery.proxy(oDelegate.onCommunicationMethodsloaded, oDelegate));
		// } else {
		// oDelegate.onCommunicationMethodsloaded(this.oCommunicationPreferencesMethods);
		// }
	},
	loadCommunicationChannels: function(oDelegate) {
		// \ if (!this.oCommunicationChannels) {
		this.oCommunicationChannels = new sap.ui.model.json.JSONModel();
		this.PERMISSIONS = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS;
		var aChannels = [{
			Description: sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.SMS"),
			CommunicationChannelID: this.PERMISSIONS.MOBILE
		}, {
			Description: sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.EMAIL"),
			CommunicationChannelID: this.PERMISSIONS.EMAIL
		}, {
			Description: sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.MAIL"),
			CommunicationChannelID: this.PERMISSIONS.LETTER
		}, {
			Description: sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.DO_NOT_SEND"),
			CommunicationChannelID: this.PERMISSIONS.NOT_SET
		}];
		this.oCommunicationChannels.setData(aChannels);
		// this._readCommunicationChannels(jQuery.proxy(oDelegate.onCommunicationChannelsLoaded, oDelegate));
		// } else {
		oDelegate.onCommunicationChannelsLoaded(this.oCommunicationChannels);
		// }
	},
	loadLanguageBatch: function(oDelegate) {
		this._readLanguageBatch(jQuery.proxy(oDelegate.onLanguageBatchLoaded, oDelegate));
	},
	updateCommunicationPreferences: function(aPreferences, bIsPaperless, fnCallback, oDelegate) {	
		if (this.isMock) {
			oDelegate._onCommunicationUpdated();
		} else {
			this._updateCommunicationPref(aPreferences, bIsPaperless, fnCallback);
		}	
	},
	updateCommunicationPermissions: function(sCommunicationMethodID, sContactMethod, oAccountLanguage, fnCallback) {
		this._updateCommunicationPermissions(sCommunicationMethodID, sContactMethod, oAccountLanguage, fnCallback);
	},
	updateCorrespondenceLanguage: function(oAccount, fnCallback) {
		this._updateCorrespondenceLanguage(oAccount, fnCallback);
	},
	loadHotOffers: function(oDelegate) {
		this.oCommunicationPermissions = new sap.ui.model.json.JSONModel();
		this._readCommunicationPermissions(jQuery.proxy(oDelegate.onHotOffersLoaded, oDelegate));
	},

	loadContactAddress: function(oDelegate) {
		this._readContactAddress(jQuery.proxy(oDelegate.onContactAddressLoaded, oDelegate));
	},

	loadContactAddressRegions: function(oDelegate, sCountryID) {
		this._readRegions(oDelegate, sCountryID);
	},

	updateContactAddress: function(oDelegate, oContactAddress) {
		if (this.isMock) {
			oDelegate.onSaveContactAddressSuccess();
		} else {
			this._updateContactAddress(oDelegate, oContactAddress);
		}	
	},

	loadContactPhonesAndEmails: function(oDelegate) {
		this._readContactPhonesAndEmails(oDelegate);
	},

	updateContactPhonesAndEmails: function(oDelegate, oContactPhonesAndEmails) {
		if (this.isMock) {
			oDelegate.onContactPhonesAndEmailsUpdated();
		} else {
			this._updateContactPhonesAndEmails(oDelegate, oContactPhonesAndEmails);
		}	
	},

	sendChangeNameRequest: function(oDelegate, oPersonalInfo) {
		// Create interaction record
		var fnCallback = jQuery.proxy(function(oData) {
			this.sendChangeNameRequestStep2(oDelegate, oPersonalInfo, oData.InteractionRecordID);
		}, this);

		var oIRData = {
			AccountID: this.getAccountId(),
			Description: oDelegate.getText("USER_PROFILE.CHANGE_NAME_IR_DESCRIPTION"),
			Note: oDelegate.getText("USER_PROFILE.CHANGE_NAME_IR_MESSAGE") + " " + oPersonalInfo.firstName + " " + oPersonalInfo.lastName
		};
		
		if (this.isMock) {
			oDelegate.onChangeNameSuccess();
		} else {
			this._createInteractionRecord(fnCallback, oIRData);
		}	
		// Send function import
	},
	sendChangeNameRequestStep2: function(oDelegate, oPersonalInfo, iInteractionRecordID) {
		var fnCallback = jQuery.proxy(function(oData) {
			oDelegate.onChangeNameSuccess();
		}, this);

		var oChangeNameData = {
			Attribute1Name: "FirstName",
			Attribute1Value: oPersonalInfo.firstName,
			Attribute2Name: "LastName",
			Attribute2Value: oPersonalInfo.lastName,
			InteractionRecordID: iInteractionRecordID
		};

		this._sendChangeNameRequest(fnCallback, oChangeNameData);
	},
	// ******************************
	loadBillingAddresses: function(sContext, oDelegate) {
		if (this.oBillingAddresses && !this.bBillingAddressesIsDirty) {
			// Set the text for the "same as service address" entry. It is always in the first position of the address
			// array
			this.oBillingAddresses[0].AddressInfo.ShortForm = sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.DEFAULT_PREMISE_NAME");
			// this.utils.getSameAsServiceAddressText(sContext);
			oDelegate.onBillingAddressesLoaded(this.oBillingAddresses);
			return;
		}
		var fnCallBack = jQuery.proxy(function(oData) {
			var aAddresses = [];
			var oEmptyAddress = this.utils.getEmptyAddress();
			oEmptyAddress.PremiseID = "-1";
			oEmptyAddress.AddressInfo.ShortForm = sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.DEFAULT_PREMISE_NAME");
			if (oData && oData.results) {
				var i;
				aAddresses = oData.results;
				aAddresses.unshift(oEmptyAddress);
				for (i = 0; i < aAddresses.length; i++) {
					aAddresses[i]._ID = i.toString();
				}
			}
			oDelegate.onBillingAddressesLoaded(aAddresses);
			this.oBillingAddresses = aAddresses;
			this.bBillingAddressesIsDirty = false;
		}, this);
		this._readBillingAddresses(fnCallBack);
	},
	loadCountries_BillingAddress: function(oDelegate) {
		var fnCallBack = jQuery.proxy(function(oData) {
			var aCountries = oData.results;
			var defaultCountry = this.utils.getEmptyCountry();
			defaultCountry.Name = " " + sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.DEFAULT_COUNTRY_NAME");
			aCountries.unshift(defaultCountry);
			// Remove countries with blank names
			var i;
			for (i = 0; i < aCountries.length; i++) {
				if (aCountries[i].Name === "") {
					aCountries.splice(i, 1);
					i--;
				}
			}
			this.oCountries = new sap.ui.model.json.JSONModel();
			this.oCountries.setData({
				results: aCountries
			});
			oDelegate.onCountriesLoaded(aCountries);
		}, this);
		this._readBillingAddressCountries(fnCallBack);
	},
	loadRegions: function(sCountryID, oDelegate) {
		// No caching for regions because it depends on the country
		var fnCallback = jQuery.proxy(function(oData) {
			var aRegions = oData.results;
			var defaultRegion = this.utils.getEmptyRegion();
			defaultRegion.Name = " " + sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.DEFAULT_REGION_NAME");
			aRegions.unshift(defaultRegion);
			oDelegate.onRegionsLoaded(aRegions);
		}, this);
		this._readBillingAddressRegions(sCountryID, fnCallback);
	},
	createBillingAddress: function(oAddressData, oDelegate) {
		var fnCallback = jQuery.proxy(function(oData) {
			this.bBillingAddressesIsDirty = true;
			oDelegate.onBillingAddressCreated(oData);
		}, this);
		oAddressData.AccountID = this.getAccountId();
		delete oAddressData.PremiseID;
		delete oAddressData._ID;
		this._createAddress(oAddressData, fnCallback);
	},
	updateBillingAddress: function(oDelegate, batch) {
		this._submitBatchOperation(oDelegate, batch);
	},
	loadBusinessAgreement: function(oDelegate, sBusinessAgreementID) {
		this._readBusinessAgreement(oDelegate, sBusinessAgreementID);
	}

}