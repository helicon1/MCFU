jQuery.sap.declare("sap.umc.mobile.user_profile.model.OnlineDataProvider");
sap.umc.mobile.user_profile.model.OnlineDataProvider = {

	_readAddresses: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "AccountAddresses", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},
	_readBankAccounts: function(oDelegate) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oData.results = oData.results.reverse();
			this.oBankAccounts.setSizeLimit(oData.results && oData.results.length);
			this.oBankAccounts.setData(oData);
			if (oDelegate) {
				oDelegate.onBankAccountsLoaded(this.oBankAccounts);
			}
		}, this);
		this.ERP.read(this.getAccountPath() + "BankAccounts", ["$format=json", "$expand=Bank"], true, {
			fnSuccess: fnSuccess
		});
	},
	_readCardAccounts: function(oDelegate) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oData.results = oData.results.reverse();
			this.oCardAccounts.setSizeLimit(oData.results && oData.results.length);
			this.oCardAccounts.setData(oData);
			if (oDelegate) {
				oDelegate.onCardAccountsLoaded(this.oCardAccounts);
			}
		}, this);

		this.ERP.read(this.getAccountPath() + "PaymentCards", ["$format=json", "$expand=PaymentCardType"], true, {
			fnSuccess: fnSuccess
		});
	},
	_readAutoPaymentMethods: function(oDelegate, oDataProvider) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oData.results = oData.results.reverse();
			this.oAutoPaymentMethods.setData(oData);
			oDataProvider.ERP.read(oDataProvider.getAccountPath() + "PaymentCards", ["$format=json", "$expand=PaymentCardType"], true, {
				fnSuccess: jQuery.proxy(function(oData, oResponse) {
					oData.results = oData.results.reverse();
					for ( var i = 0; i < oData.results.length; i++) {
						oDataProvider.oAutoPaymentMethods.oData.results.push(oData.results[i]);
					}
					oDelegate.onAutoPaymentMethodsLoadedSuccess(oDataProvider.oAutoPaymentMethods);
				}, oDataProvider)
			});
		}, this);
		this.ERP.read(this.getAccountPath() + "BankAccounts", ["$format=json", "$expand=Bank"], true, {
			fnSuccess: fnSuccess
		});
	},
	_readCountries: function(oDelegate) {
		this.CRM.read("Countries", ["$format=json"], true, {
			fnSuccess: $.proxy(function(oData) {
				this.oCountries.setSizeLimit(oData.results && oData.results.length);
				this.oCountries.setData(oData);
				if (oDelegate) {
					oDelegate.onLoadCountryListSuccess(this.oCountries);
				}
			}, this)
		});
	},
	_readBanks: function(oDelegate, sCountryID) {
		this.ERP.read("Banks", ["$filter=CountryID eq '" + sCountryID + "'", "$format=json"], true, {
			fnSuccess: $.proxy(function(oData) {
				this.oBanks.setSizeLimit(oData.results && oData.results.length);
				this.oBanks.setData(oData);
				oDelegate.onLoadBankListSuccess(this.oBanks);
			}, this)
		});
	},

	_updateBankAccount: function(oDelegate, oBankAccount) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onSaveBankAccountSuccess();
			oDelegate.refreshBankAccounts();
		}, oDelegate);
		this.ERP.updateEntity("BankAccounts", ["BankAccountID=\'" + oBankAccount.BankAccountID + "\'", "AccountID=\'" + oBankAccount.AccountID + "\'"],
				oBankAccount, {
					fnSuccess: fnSuccess
				});
	},
	_updatePaymentCard: function(oDelegate, oCardAccountCopy) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onSavePaymentCardSuccess();
			oDelegate.refreshCardAccounts();
		}, oDelegate);
		this.ERP.updateEntity("PaymentCards", ["PaymentCardID=\'" + oCardAccountCopy.PaymentCardID + "\'",
				"AccountID=\'" + oCardAccountCopy.AccountID + "\'"], oCardAccountCopy, {
			fnSuccess: fnSuccess
		});
	},
	_deleteBankAccount: function(oDelegate, oBankAccount) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onDeleteBankAccountSuccess();
		}, oDelegate);
		this.ERP.removeEntity("/BankAccounts",
				["AccountID=\'" + oBankAccount.AccountID + "\'", "BankAccountID=\'" + oBankAccount.BankAccountID + "\'"], {
					fnSuccess: fnSuccess
				});
	},
	_deletePaymentCard: function(oDelegate, oCreditCard) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onDeletePaymentCardSuccess();
		}, oDelegate);
		this.ERP.removeEntity("/PaymentCards", ["AccountID=\'" + oCreditCard.AccountID + "\'", "PaymentCardID=\'" + oCreditCard.PaymentCardID + "\'"],
				{
					fnSuccess: fnSuccess
				});
	},
	_createBankAccount: function(oDelegate, oBankAccount) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onCreateBankAccountSuccess(oData);
		}, oDelegate);
		this.ERP.createEntity("BankAccounts", oBankAccount, {
			fnSuccess: fnSuccess
		});
	},
	_createCreditCard: function(oDelegate, oCardAccount) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onCreatePaymentCardSuccess(oData);
		}, oDelegate);
		this.ERP.createEntity("PaymentCards", oCardAccount, {
			fnSuccess: fnSuccess
		});
	},
	_readPaymentCardType: function(oDelegate) {
		this.ERP.read("PaymentCardTypes", ["$format=json"], true, {
			fnSuccess: $.proxy(function(oData) {
				if (oData.results) {
					this.oPaymentCardTypes.setSizeLimit(oData.results && oData.results.length);
					this.oPaymentCardTypes.setData(oData);
					oDelegate.onReadPaymentCardSuccess(this.oPaymentCardTypes);
				}
			}, this)
		});
	},
	_readBusinessAgreements: function(oDelegate) {
		this.CRM.read(this.getAccountPath() + "BusinessAgreements", ["$format=json", "$expand=ContractItems/Division"], true, {
			fnSuccess: $.proxy(function(oData) {
				if (oData.results) {
					this.oBusinessAgreements.setSizeLimit(oData.results && oData.results.length);
					this.oBusinessAgreements.setData(oData);
					oDelegate.onReadBusinessAgreementsSuccess(this.oBusinessAgreements);
				}
			}, this)
		});

	},
	_addChangedPaymentMethod: function(oBusinessAgreementCopy, batch) {
		batch.push(this.CRM.createBatchOperation("/BusinessAgreements('" + oBusinessAgreementCopy.BusinessAgreementID + "')",
				sap.umc.mobile.CONSTANTS.HTTP_PUT, oBusinessAgreementCopy, null));
	},
	_submitBatchOperation: function(oDelegate, batch) {
		this.CRM.addBatchChangeOperations(batch);
		this.CRM.submitChangeBatch({
			fnSuccess: $.proxy(function(oData, response) {
				oDelegate.onBatchSubmitSuccess();
			}, this)
		}, true);
	},
	_refreshPersonalInfo: function(oDelegate) {
		this.oPersonalInfo = this.getAccount();
		this.CRM.read("AccountTitles", ["$format=json"], true, {
			fnSuccess: $.proxy(function(oData) {
				var sTitle = null;
				if (this.oPersonalInfo.getData().AccountTitleID === "") {
					sTitle = "";
				} else {
					for ( var i = 0; i < oData.results.length; i++) {
						if (this.oPersonalInfo.getData().AccountTitleID === oData.results[i].TitleID) {
							sTitle = oData.results[i].Description;
						}
					}
				}
				oDelegate.onRefreshPersonalInfoSuccess(this.oPersonalInfo, sTitle);
			}, this)
		});
	},
	_readContractAccounts: function(fnCallback) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData.results) {
				this.oContractAccounts.setSizeLimit(oData.results && oData.results.length);
				this.oContractAccounts.setData(oData);
				fnCallback(this.oContractAccounts);
			}
		}, this);
		this.SERVICE.read(this.getAccountPath() + this.oHelper.getContractAccountName(this.SERVICE), ["$format=json",
				"$expand=ContractAccountBalance,BillToAccountAddress"], true, {
			fnSuccess: fnSuccess
		});
	},
	/*	_updateContractAccounts: function() {
	 var fnSuccess = jQuery.proxy(function(oData, oResponse) {
	 if (oData.results) {
	 this.oContractAccounts.setSizeLimit(oData.results && oData.results.length);
	 this.oContractAccounts.setData(oData);
	 }
	 }, this);
	 this.SERVICE.read(this.getAccountPath() + this.oHelper.getContractAccountName(this.SERVICE), ["$format=json",
	 "$expand=ContractAccountBalance,BillToAccountAddress"], true, {
	 fnSuccess: fnSuccess
	 });
	 },*/
	_readContracts: function(oContractAccount, fnCallback) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData) {
				var oContracts = new sap.ui.model.json.JSONModel();
				oContracts.setSizeLimit(oData.results && oData.results.length);
				oContracts.setData(oData);
				oContractAccount._Contracts = oContracts;

				fnCallback(oContracts);
			}
		}, this);
		this.SERVICE.read("ContractAccounts('" + oContractAccount.ContractAccountID + "')/" + this.oHelper.getContractName(this.SERVICE), [
				"$format=json", "$expand=Division,Premise"], true, {
			fnSuccess: fnSuccess
		});
	},
	_readPaymentAccounts_M: function(fnCallBack) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData) {
				this.oBankAccounts.setSizeLimit(oData.BankAccounts.results && oData.BankAccounts.results.length);
				this.oBankAccounts.setData(oData.BankAccounts);
				this.oPaymentCards.setSizeLimit(oData.PaymentCards.results && oData.PaymentCards.results.length);
				this.oPaymentCards.setData(oData.PaymentCards);
				fnCallBack(this.oBankAccounts, this.oPaymentCards);
			}
		}, this);
		this.ERP.read(this.getAccountPath(), ["$format=json", "$expand=BankAccounts,PaymentCards"], true, {
			fnSuccess: fnSuccess
		});
	},
	_readPaymentCardTypes_M: function(fnCallback) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData.results) {
				this.oPaymentCardTypes.setSizeLimit(oData.results && oData.results.length);
				this.oPaymentCardTypes.setData(oData);
				fnCallback(this.oPaymentCardTypes);
			}
		}, this);
		this.ERP.read("PaymentCardTypes", ["$format=json"], true, {
			fnSuccess: fnSuccess
		});
	},

	_onReadCommunicationCategoriesSuccess: function(oData, oResponse) {
		if (oData.results) {
			var aData = [];
			for ( var i = 0; i < oData.results.length; i++) {
				this.SERVICE.read("GetAllowedCommunicationMethods", "CommunicationCategoryID='"
						+ encodeURIComponent(oData.results[i].CommunicationCategoryID) + "'", false, {
					fnSuccess: function(oCommunicationMethods) {
						aData.push(oCommunicationMethods.results);
					}
				});
			}
			this.oBillingMethods.setData(aData[1]);
			this.oOutageMethods.setData(aData[2]);
			this.oPersonalInfo = this.getAccount();
			this.fnPreferencesCallback(this.oCommunicationPreferences, this.oStandardAddress, this.oBillingMethods, this.oOutageMethods, this.oPersonalInfo);
		}
	},

	_onReadCommunicationPreferencesSuccess: function(oData, oResponse) {

		var fnSuccess = jQuery.proxy(function(oAccount, oResponse) {
			this.oStandardAddress.setData(oAccount);
			this.SERVICE.read("CommunicationCategories", ["$format=json"], true, {
				fnSuccess: jQuery.proxy(this._onReadCommunicationCategoriesSuccess, this)
			});
		});
		if (oData.results && oData.results.length) {
			this.oCommunicationPreferences.setSizeLimit(oData.results && oData.results.length);
			this.oCommunicationPreferences.setData(oData);
			if (oData.results[0].AddressID) {
				this.SERVICE
						.read(
								"/AccountAddresses(AccountID='" + oData.results[0].AccountID + "',AddressID='" + oData.results[0].AddressID + "')",
								["$format=json",
										"$expand=AccountAddressDependentEmails,AccountAddressDependentFaxes,AccountAddressDependentMobilePhones,AccountAddressDependentPhones"],
								true, {
									fnSuccess: jQuery.proxy(fnSuccess, this)
								});
			} else {
				this.SERVICE
						.read(
								this.getAccountPath() + "StandardAccountAddress",
								["$format=json",
										"$expand=AccountAddressDependentEmails,AccountAddressDependentFaxes,AccountAddressDependentMobilePhones,AccountAddressDependentPhones"],
								true, {
									fnSuccess: jQuery.proxy(fnSuccess, this)
								});
			}
		} else {
			// user does not have communication permissions but mimick the Object
			this.ERP
					.read(
							this.getAccountPath() + "ContractAccounts",
							["$format=json"],
							true,
							{
								fnSuccess: $
										.proxy(
												function(oData) {
													var oPreferences = {
														results: [{
															AccountID: this.getAccountId(),
															AddressID: "",
															CommunicationCategoryID: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.GC_CAT_BILL_NOTIFICATION,
															CommunicationMethodID: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.NOT_SET,
															ContractAccountID: oData.results[0].ContractAccountID
														}, {
															AccountID: this.getAccountId(),
															AddressID: "",
															CommunicationCategoryID: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.GC_CAT_OUTAGE,
															CommunicationMethodID: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.NOT_SET,
															ContractAccountID: oData.results[0].ContractAccountID
														}, {
															AccountID: this.getAccountId(),
															AddressID: "",
															CommunicationCategoryID: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.GC_CAT_BILLING,
															CommunicationMethodID: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.NOT_SET,
															ContractAccountID: oData.results[0].ContractAccountID
														}]
													};
													this.oCommunicationPreferences.setSizeLimit(oPreferences.results && oPreferences.results.length);
													this.oCommunicationPreferences.setData(oPreferences);
													this.fnPreferencesCallbackNotSet();
													this.SERVICE
															.read(
																	this.getAccountPath() + "StandardAccountAddress",
																	["$format=json",
																			"$expand=AccountAddressDependentEmails,AccountAddressDependentFaxes,AccountAddressDependentMobilePhones,AccountAddressDependentPhones"],
																	true, {
																		fnSuccess: jQuery.proxy(fnSuccess, this)
																	});
												}, this)
							});
		}
	},

	_readCommunicationPreferences: function(fnCallback) {
		this.SERVICE.read(this.getAccountPath() + "CommunicationPreferences", ["$format=json", "$expand=CommunicationCategory,CommunicationMethod"],
				true, {
					fnSuccess: jQuery.proxy(this._onReadCommunicationPreferencesSuccess, this)
				});
	},

	_readLanguageBatch: function(fnCallback) {
		var aBatchOperations = [];

		aBatchOperations.push(this.CRM.createBatchOperation("/Languages", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []));
		aBatchOperations.push(this.CRM.createBatchOperation(this.getAccountPath() + "?$select=CorrespondenceLanguageISO,LanguageISO,AccountID,AccountTypeID", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []));

		this.CRM.clearBatch();
		this.CRM.addBatchReadOperations(aBatchOperations);
		this.CRM.submitBatch({
			fnSuccess: fnCallback
		}, true);
	},

	_updateCommunicationPref: function(aPreferences, bIsPaperless, fnCallback) {
		var sContractAccountID = aPreferences.results[0].ContractAccountID;
		var sAccountID = aPreferences.results[0].AccountID;
		var sAddressID = aPreferences.results[0].AddressID;
		var oPreference = {
			ContractAccountID: sContractAccountID,
			CommunicationCategoryID: aPreferences.results[0].CommunicationCategoryID,
			CommunicationMethodID: aPreferences.results[0].CommunicationMethodID,
			AccountID: sAccountID,
			AddressID: sAddressID,
			DependentAccountCommPreferences: [
					{
						ContractAccountID: sContractAccountID,
						CommunicationCategoryID: aPreferences.results[1].CommunicationCategoryID,
						CommunicationMethodID: aPreferences.results[1].CommunicationMethodID,
						AccountID: sAccountID,
						AddressID: sAddressID
					},
					{
						ContractAccountID: sContractAccountID,
						CommunicationCategoryID: aPreferences.results[2].CommunicationCategoryID,
						CommunicationMethodID: !bIsPaperless
								? sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.MAIL
								: sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES.NOT_SET,
						AccountID: sAccountID,
						AddressID: sAddressID
					}]
		};
		this.SERVICE.createEntity("CommunicationPreferences", oPreference, {
			fnSuccess: fnCallback
		});
	},
	// Pass preferened email and sms
	// Include updated correspondance language in the batch 
	_updateCommunicationPermissions: function(sCommunicationMethodID, sContactInfo, oAccountLanguage, fnCallback) {
		var aBatch = [];
		var oPermissionToCreate = {};
		oPermissionToCreate.AccountID = this.getAccountId();
		oPermissionToCreate.ValidFrom = new Date();
		oPermissionToCreate.CommunicationPermissionStatusID = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS.GIVEN;
		oPermissionToCreate.CommunicationDetail = "";
		oPermissionToCreate.CommunicationChannelID = sCommunicationMethodID;
		oPermissionToCreate.CommunicationDetail = sContactInfo;
		for ( var i = 0; i < this.oPermissions.length; i++) {
			aBatch.push((this.CRM.createBatchOperation("/CommunicationPermissions(CommunicationPermissionGUID=\'"
					+ this.oPermissions[i].CommunicationPermissionGUID + "\',AccountID=\'" + this.getAccountId() + "\')",
					sap.umc.mobile.CONSTANTS.HTTP_DELETE, null)));
		}
		if (sCommunicationMethodID !== sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS.NOT_SET) {
			// given for a specific channel
			aBatch.push(this.CRM.createBatchOperation("/CommunicationPermissions", sap.umc.mobile.CONSTANTS.HTTP_POST, oPermissionToCreate, null));
		} else {
			// reject all
			oPermissionToCreate.CommunicationDetail = sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.ALL");
			oPermissionToCreate.CommunicationPermissionStatusID = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS.REJECTED;
			oPermissionToCreate.CommunicationChannelID = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS.EMAIL;
			aBatch.push(this.CRM.createBatchOperation("/CommunicationPermissions", sap.umc.mobile.CONSTANTS.HTTP_POST, oPermissionToCreate, null));
			var oPermissionToCreate2 = $.extend(true, {}, oPermissionToCreate);
			oPermissionToCreate2.CommunicationChannelID = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS.MOBILE;
			aBatch.push(this.CRM.createBatchOperation("/CommunicationPermissions", sap.umc.mobile.CONSTANTS.HTTP_POST, oPermissionToCreate2, null));
			var oPermissionToCreate3 = $.extend(true, {}, oPermissionToCreate2);
			oPermissionToCreate3.CommunicationChannelID = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS.LETTER;
			aBatch.push(this.CRM.createBatchOperation("/CommunicationPermissions", sap.umc.mobile.CONSTANTS.HTTP_POST, oPermissionToCreate3, null));
		}

		//Save Account Language if it has changed (passed as null if it has not changed)
		if (oAccountLanguage) {
			aBatch.push(this.CRM.createBatchOperation(this.getAccountPath(), sap.umc.mobile.CONSTANTS.HTTP_PUT, oAccountLanguage, null));
		}

		this.CRM.clearBatch();
		this.CRM.addBatchChangeOperations(aBatch);
		this.CRM.submitChangeBatch({
			fnSuccess: jQuery.proxy(function(oData) {
				this.oPermissions = [];
				fnCallback(oData);
			}, this)
		}, true);
	},

	_updateCorrespondenceLanguage: function(oAccount, fnCallback) {

	},

	// for hotoffers
	_readCommunicationChannels: function(fnCallback) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData.results) {
				this.oCommunicationChannels.setSizeLimit(oData.results && oData.results.length);
				this.oCommunicationChannels.setData(oData);
				fnCallback(this.oCommunicationChannels);
			}
		}, this);
		this.CRM.read("CommunicationChannels", ["$format=json"], true, {
			fnSuccess: fnSuccess
		});
	},

	_readCommunicationPermissions: function(fnCallback) {
		var fnSuccess = jQuery
				.proxy(
						function(oData, oResponse) {
							var CONSTANTS = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS;
							if (oData.results) {
								this.oPermissions = oData.results;
								var oMap = {};
								var aPermissions = [];
								for ( var i = 0; i < oData.results.length; i++) {
									if (oMap[oData.results[i].CommunicationChannelID]) {
									} else {
										var oValue = oData.results[i];
										// only allows not empty, its given, its either sms or email
										if (oValue
												&& oValue.CommunicationPermissionStatusID === CONSTANTS.GIVEN
												&& (oValue.CommunicationChannelID === CONSTANTS.EMAIL || oValue.CommunicationChannelID === CONSTANTS.MOBILE || oValue.CommunicationChannelID === CONSTANTS.LETTER)) {
											oMap[oData.results[i].CommunicationChannelID] = oData.results[i];
											aPermissions.push(oData.results[i]);
										}
									}
								}
								// this.oCommunicationPermissions.setDefaultBindingMode("OneWay");
								this.oCommunicationPermissions.setData(aPermissions);
								fnCallback(this.oCommunicationPermissions);
							} else {
								this.oPermissions = [];
								// this.oCommunicationPermissions.setDefaultBindingMode("OneWay");
								this.oCommunicationPermissions.setData([]);
								fnCallback(this.oCommunicationPermissions);
							}

						}, this);
		this.CRM.read(this.getAccountPath() + "CommunicationPermissions",
				["$format=json", "$expand=CommunicationChannel,CommunicationPermissionStatus"], true, {
					fnSuccess: fnSuccess
				});
	},

	_readContactAddress: function(fnCallBack) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData && oData.AddressInfo) {
				fnCallBack(oData);
			}
		}, this);
		this.CRM.read(this.getAccountPath() + "StandardAccountAddress", ["$format=json"], true, {
			fnSuccess: fnSuccess
		});
	},

	_readRegions: function(oDelegate, sCountryID) {
		var fnSuccess = jQuery.proxy(function(oData) {
			if (oData) {
				oDelegate.onRegionsLoaded(oData);
			}
		}, this);
		this.CRM.read("Regions", ["$filter=CountryID eq '" + sCountryID + "'", "$format=json"], true, {
			fnSuccess: fnSuccess
		});
	},

	_updateContactAddress: function(oDelegate, oContactAddress) {
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onSaveContactAddressSuccess();
			// oDelegate.refreshBankAccounts();
		}, oDelegate);
		this.CRM.updateEntity("AccountAddresses",
				["AccountID=\'" + oContactAddress.AccountID + "\'", "AddressID=\'" + oContactAddress.AddressID + "\'"], oContactAddress, {
					fnSuccess: fnSuccess
				});
	},

	_getReadContactPhonesOperation: function() {
		return this.CRM.createBatchOperation(this.getAccountPath() + "StandardAccountAddress/AccountAddressDependentPhones",
				sap.umc.mobile.CONSTANTS.HTTP_GET, null, ["$format=json"]);
	},

	_getReadContactMobilePhonesOperation: function() {
		return this.CRM.createBatchOperation(this.getAccountPath() + "StandardAccountAddress/AccountAddressDependentMobilePhones",
				sap.umc.mobile.CONSTANTS.HTTP_GET, null, ["$format=json"]);
	},

	_getReadContactEmailsOperation: function() {
		return this.CRM.createBatchOperation(this.getAccountPath() + "StandardAccountAddress/AccountAddressDependentEmails",
				sap.umc.mobile.CONSTANTS.HTTP_GET, null, ["$format=json"]);
	},

	_readContactPhonesAndEmails: function(oDelegate) {
		//		var aBatchOperations = [];
		//		aBatchOperations.push(this._getReadContactPhonesOperation());
		//		aBatchOperations.push(this._getReadContactMobilePhonesOperation());
		//		aBatchOperations.push(this._getReadContactEmailsOperation());
		//		this.CRM.clearBatch();
		//		this.CRM.addBatchReadOperations(aBatchOperations);

		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onContactPhonesAndEmailsLoaded(oData);
		});

		var oCallbacks = {
			fnSuccess: fnSuccess
		};

		this.CRM.read(this.getAccountPath() + "StandardAccountAddress", ["$format=json",
				"$expand=AccountAddressDependentPhones,AccountAddressDependentMobilePhones,AccountAddressDependentEmails"], true, oCallbacks);

		//		(this.getAccountPath() + "CommunicationPermissions",
		//				["$format=json", "$expand=CommunicationChannel,CommunicationPermissionStatus"], true, {
		//					fnSuccess: fnSuccess
		//				});		

	},

	_getUpdateContactEmailOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentEmails(AccountID=\'" + oData.AccountID + "\',AddressID=\'" + oData.AddressID
				+ "\',SequenceNo=\'" + oData.SequenceNo + "\')", "PUT", oData, ["$format=json"]);
	},

	_getCreateContactEmailOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentEmails", "POST", oData, ["$format=json"]);
	},

	_getDeleteContactEmailOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentEmails(AccountID=\'" + oData.AccountID + "\',AddressID=\'" + oData.AddressID
				+ "\',SequenceNo=\'" + oData.SequenceNo + "\')", "DELETE", oData, ["$format=json"]);
	},

	_getUpdateContactHomePhoneOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentPhones(AccountID=\'" + oData.AccountID + "\',AddressID=\'" + oData.AddressID
				+ "\',SequenceNo=\'" + oData.SequenceNo + "\')", "PUT", oData, ["$format=json"]);
	},

	_getCreateContactHomePhoneOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentPhones", "POST", oData, ["$format=json"]);
	},

	_getDeleteContactHomePhoneOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentPhones(AccountID=\'" + oData.AccountID + "\',AddressID=\'" + oData.AddressID
				+ "\',SequenceNo=\'" + oData.SequenceNo + "\')", "DELETE", oData, ["$format=json"]);
	},

	_getUpdateContactMobilePhoneOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentMobilePhones(AccountID=\'" + oData.AccountID + "\',AddressID=\'"
				+ oData.AddressID + "\',SequenceNo=\'" + oData.SequenceNo + "\')", "PUT", oData, ["$format=json"]);
	},

	_getCreateContactMobilePhoneOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentMobilePhones", "POST", oData, ["$format=json"]);
	},

	_getDeleteContactMobilePhoneOperation: function(oData) {
		return this.CRM.createBatchOperation("/AccountAddressDependentMobilePhones(AccountID=\'" + oData.AccountID + "\',AddressID=\'"
				+ oData.AddressID + "\',SequenceNo=\'" + oData.SequenceNo + "\')", "DELETE", oData, ["$format=json"]);
	},

	_updateContactPhonesAndEmails: function(oDelegate, oContactData) {
		var aBatchOperations = [];
		var oContactPhonesAndEmails = $.extend(true, {}, oContactData);

		if (oContactPhonesAndEmails.emails && oContactPhonesAndEmails.emails.change) {
			for ( var i = 0; i < oContactPhonesAndEmails.emails.change.length; i++) {
				aBatchOperations.push(this._getUpdateContactEmailOperation(oContactPhonesAndEmails.emails.change[i]));
			}
		}

		if (oContactPhonesAndEmails.emails && oContactPhonesAndEmails.emails.add) {
			for ( var i = 0; i < oContactPhonesAndEmails.emails.add.length; i++) {
				oContactPhonesAndEmails.emails.add[i].SequenceNo = "";
				aBatchOperations.push(this._getCreateContactEmailOperation(oContactPhonesAndEmails.emails.add[i]));
			}
		}

		if (oContactPhonesAndEmails.emails && oContactPhonesAndEmails.emails.remove) {
			for ( var i = 0; i < oContactPhonesAndEmails.emails.remove.length; i++) {
				aBatchOperations.push(this._getDeleteContactEmailOperation(oContactPhonesAndEmails.emails.remove[i]));
			}
		}

		if (oContactPhonesAndEmails.homePhones && oContactPhonesAndEmails.homePhones.change) {
			for ( var i = 0; i < oContactPhonesAndEmails.homePhones.change.length; i++) {
				if (oContactPhonesAndEmails.homePhones.change[i].StandardFlag) {
					oContactPhonesAndEmails.homePhones.change[i].PhoneType = "1";
				} else {
					oContactPhonesAndEmails.homePhones.change[i].PhoneType = "";
				}
				aBatchOperations.push(this._getUpdateContactHomePhoneOperation(oContactPhonesAndEmails.homePhones.change[i]));
			}
		}

		if (oContactPhonesAndEmails.homePhones && oContactPhonesAndEmails.homePhones.add) {
			for ( var i = 0; i < oContactPhonesAndEmails.homePhones.add.length; i++) {
				oContactPhonesAndEmails.homePhones.add[i].SequenceNo = "";
				if (oContactPhonesAndEmails.homePhones.add[i].StandardFlag) {
					oContactPhonesAndEmails.homePhones.add[i].PhoneType = "1";
				} else {
					oContactPhonesAndEmails.homePhones.add[i].PhoneType = "";
				}
				aBatchOperations.push(this._getCreateContactHomePhoneOperation(oContactPhonesAndEmails.homePhones.add[i]));
			}
		}

		if (oContactPhonesAndEmails.homePhones && oContactPhonesAndEmails.homePhones.remove) {
			for ( var i = 0; i < oContactPhonesAndEmails.homePhones.remove.length; i++) {
				aBatchOperations.push(this._getDeleteContactHomePhoneOperation(oContactPhonesAndEmails.homePhones.remove[i]));
			}
		}

		if (oContactPhonesAndEmails.mobilePhones && oContactPhonesAndEmails.mobilePhones.change) {
			for ( var i = 0; i < oContactPhonesAndEmails.mobilePhones.change.length; i++) {
				if (oContactPhonesAndEmails.mobilePhones.change[i].StandardFlag) {
					oContactPhonesAndEmails.mobilePhones.change[i].PhoneType = "3";
				} else {
					oContactPhonesAndEmails.mobilePhones.change[i].PhoneType = "2";
				}
				aBatchOperations.push(this._getUpdateContactMobilePhoneOperation(oContactPhonesAndEmails.mobilePhones.change[i]));
			}
		}

		if (oContactPhonesAndEmails.mobilePhones && oContactPhonesAndEmails.mobilePhones.add) {
			for ( var i = 0; i < oContactPhonesAndEmails.mobilePhones.add.length; i++) {
				oContactPhonesAndEmails.mobilePhones.add[i].SequenceNo = "";
				if (oContactPhonesAndEmails.mobilePhones.add[i].StandardFlag) {
					oContactPhonesAndEmails.mobilePhones.add[i].PhoneType = "3";
				} else {
					oContactPhonesAndEmails.mobilePhones.add[i].PhoneType = "2";
				}
				aBatchOperations.push(this._getCreateContactMobilePhoneOperation(oContactPhonesAndEmails.mobilePhones.add[i]));
			}
		}

		if (oContactPhonesAndEmails.mobilePhones && oContactPhonesAndEmails.mobilePhones.remove) {
			for ( var i = 0; i < oContactPhonesAndEmails.mobilePhones.remove.length; i++) {
				aBatchOperations.push(this._getDeleteContactMobilePhoneOperation(oContactPhonesAndEmails.mobilePhones.remove[i]));
			}
		}

		this.CRM.clearBatch();
		this.CRM.addBatchChangeOperations(aBatchOperations);

		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			oDelegate.onContactPhonesAndEmailsUpdated();
		});

		var oCallbacks = {
			fnSuccess: fnSuccess
		};

		if (aBatchOperations.length) {
			this.CRM.submitChangeBatch(oCallbacks, true);
		} else {
			oDelegate._initializeContactPhonesAndEmailsModels();
		}
	},

	_createInteractionRecord: function(fnCallback, oIRData) {
		this.CRM.createEntity("InteractionRecords", oIRData, {
			fnSuccess: fnCallback
		});
	},

	_sendChangeNameRequest: function(fnCallback, oChangeNameData) {
		this.CRM.functionImport("RequestChange", sap.umc.mobile.CONSTANTS.HTTP_POST, oChangeNameData, true, {
			fnSuccess: fnCallback
		});
	},
	//****
	_readBillingAddresses: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "AccountAddresses", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},
	_readBillingAddressCountries: function(fnCallback) {
		this.CRM.read("Countries", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},
	_readBillingAddressRegions: function(sCountryID, fnCallback) {
		this.CRM.read("Regions", ["$filter=CountryID eq '" + sCountryID + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},
	_createAddress: function(oAddressData, fnCallback) {
		this.CRM.createEntity(this.getAccountPath() + "AccountAddresses", oAddressData, {
			fnSuccess: fnCallback
		});
	},
	_readBusinessAgreement: function(oDelegate, sBusinessAgreementID) {
		this.CRM.read(this.getAccountPath() + "BusinessAgreements(BusinessAgreementID=\'" + sBusinessAgreementID + "\')", ["$format=json"], true, {
			fnSuccess: $.proxy(function(oData) {
				if (oData) {				
					oDelegate.onReadBusinessAgreementSuccess(oData.BillToAccountAddressID);
				}
			}, this)
		});
	}
	
}
