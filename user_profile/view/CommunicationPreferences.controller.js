/*global window */
sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.CommunicationPreferences", {
    onInit: function() {
        sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
        this.PREFERENCES = sap.umc.mobile.CONSTANTS.COMMUNICATION_PREFERENCES;
        this.PERMISSIONS = sap.umc.mobile.CONSTANTS.COMMUNICATION_PERMISSIONS;
        this._handleRouting();
        this._initializeLanguagesModel();
        this._initializeAccountLanguageModel();
    },
    _handleRouting: function() {
        this.getRouter().attachRouteMatched(function(oEvent) {
            var sNavigationName = oEvent.getParameter("name");
            if (sNavigationName === "communicationPref") {
                this._initializeViewModel();
                this.getDataProvider().loadCommunicationPreferences(this);
                this.getDataProvider().loadLanguageBatch(this);
            }
        }, this);
    },
    isDirty: function() {
        sap.ui.getCore().getEventBus().subscribe("navigation_confirmation", "ok", jQuery.proxy(function(sChannelId, sEventId, oData) {
            if (oData.sViewGUID !== this._GUID) {
                return false;
            }
            this.getView().getModel("viewModel").setProperty("/bDataMOdified", false);

        }, this), this);
        return this.getView().getModel("viewModel").getProperty("/bDataMOdified");
    },
    _initializeViewModel: function() {
        var oData = {
            bEditable: false,
            sBillingValue: "",
            sOutageValue: "",
            sHotOfferValue: ""
        };
        var oViewModel = new sap.ui.model.json.JSONModel();
        oViewModel.setData(oData);
        this.getView().setModel(oViewModel, "viewModel");
    },
    onCommunicationPreferencesloaded: function(oPreferences, oAddress, oBillingMethods, oOutageMethods, oPersonalInfo) {
        this.getDataProvider().loadCommunicationChannels(this);
        this.getDataProvider().loadHotOffers(this);
        this._oAddress = oAddress.getData();
        this.getView().setModel(oBillingMethods, "communicationBilling");

        this.getView().setModel(oOutageMethods, "communcationOutage");

        this.getView().setModel(oPreferences, "communicationPreferences");
        
        this.getView().setModel(oPersonalInfo, "personalInfo");

        this._updateBillingFields();
        this._updateOutageFields();
    },
    _initializeLanguagesModel: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "languages");
        this.getView().getModel("languages").setData({
            languages: [],
            selectedCommunicationLanguageISO: ""
        });
    },
    _initializeAccountLanguageModel: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "accountLanguage");
        this.getView().getModel("accountLanguage").setData({});
    },
    onLanguageBatchLoaded: function(oData, oResponse) {
        //First batch response is the Languages array  
        var aLanguages = oData.__batchResponses[0].data.results;

        var oDefaultLanguage = this.getApp().getUtils().getLanguageSkeleton();
        oDefaultLanguage.Name = this.getText("USER_PROFILE.SELECT_LANGUAGE");
        aLanguages.unshift(oDefaultLanguage);

        this.getView().getModel("languages").setProperty("/languages", aLanguages);


        //Second batch contains the account data with the preferred language
        var oAccount = oData.__batchResponses[1].data;
        this.getView().getModel("accountLanguage").setData(oAccount);

        if (oAccount.CorrespondenceLanguageISO === oAccount.LanguageISO) {
            //If both language properties match, display that language
            //Otherwise the displayed preffered language should remain empty
            this.getView().getModel("languages").setProperty("/selectedCommunicationLanguageISO", oAccount.CorrespondenceLanguageISO);
        }
    },

    _updateBillingFields: function() {
        var oPreferences = this.getView().getModel("communicationPreferences").getData();
        var sKeyBilling = oPreferences.results[0].CommunicationMethodID;
        if (sKeyBilling === this.PREFERENCES.EMAIL) {
            var oEmail = this._getPreferredEmail();
            if (oEmail) {
                this._updateBillingValue(oEmail.Email);
                return;
            } else {
                this._updateBillingValue("");
            }
        } else if (sKeyBilling === this.PREFERENCES.MOBILE) {
            var oPhone = this._getPreferredPhone();
            if (oPhone) {
                this._updateBillingValue(oPhone.CompletePhoneNo);
                return;
            } else {
                this._updateBillingValue("");
            }
        } else if (sKeyBilling === this.PREFERENCES.MAIL) {
            this._updateBillingValue(this._oAddress.AddressInfo.ShortForm);
        } else {
            this._updateBillingValue("");
        }
    },
    _updateOutageFields: function() {
        var oPreferences = this.getView().getModel("communicationPreferences").getData();
        var sKeyOutage = oPreferences.results[1].CommunicationMethodID;
        if (sKeyOutage === this.PREFERENCES.EMAIL) {
            var oEmail = this._getPreferredEmail();
            if (oEmail) {
                this._updateOutageValue(oEmail.Email);
                return;
            } else {
                this._updateOutageValue("");
            }
        } else if (sKeyOutage === this.PREFERENCES.MOBILE) {
            var oPhone = this._getPreferredPhone();
            if (oPhone) {
                this._updateOutageValue(oPhone.CompletePhoneNo);
                return;
            } else {
                this._updateOutageValue("");
            }
        } else if (sKeyOutage === this.PREFERENCES.MAIL) {
            this._updateOutageValue(this._oAddress.AddressInfo.ShortForm);
        } else {
            this._updateOutageValue("");
        }
    },

    _updateHotOfferFields: function() {
        var oHotOffers = this.getView().getModel("hotOffers").getData();
        var sKey = oHotOffers.CommunicationChannelID;
        if (sKey === this.PERMISSIONS.EMAIL) {
            var oEmail = this._getPreferredEmail();
            if (oEmail) {
                this._updateHotOfferValue(oEmail.Email);
                return;
            } else {
                this._updateHotOfferValue("");
            }
        } else if (sKey === this.PERMISSIONS.MOBILE) {
            var oPhone = this._getPreferredPhone();
            if (oPhone) {
                this._updateHotOfferValue(oPhone.CompletePhoneNo);
                return;
            } else {
                this._updateHotOfferValue("");
            }
        } else if (sKey === this.PERMISSIONS.LETTER) {
            this._updateHotOfferValue(this._oAddress.AddressInfo.ShortForm);
        } else {
            this._updateHotOfferValue("");
        }
    },

    _getPreferredPhone: function() {
        var aPhones = this._oAddress.AccountAddressDependentMobilePhones.results;
        var i;
        for (i = 0; i < aPhones.length; i++) {
            if (aPhones[i].DefaultFlag) {
                return aPhones[i];
            }
        }
    },
    _getPreferredEmail: function() {
        var aEmails = this._oAddress.AccountAddressDependentEmails.results;
        var i;
        for (i = 0; i < aEmails.length; i++) {
            if (aEmails[i].StandardFlag) {
                return aEmails[i];
            }
        }
    },

    _updateBillingValue: function(sValue) {
        this.getView().getModel("viewModel").setProperty("/sBillingValue", sValue);
    },

    _updateOutageValue: function(sValue) {
        this.getView().getModel("viewModel").setProperty("/sOutageValue", sValue);
    },

    _updateHotOfferValue: function(sValue) {
        this.getView().getModel("viewModel").setProperty("/sHotOfferValue", sValue);
    },

    onHotOffersLoaded: function(oModel) {
        var oData = oModel.getData();
        var oPermissionsData = {
            CommunicationChannelID: this.PERMISSIONS.NOT_SET
        };
        if (oData.length) {
            oPermissionsData.CommunicationChannelID = oData[0].CommunicationChannelID;
        }
        this.getView().byId("hotOfferDropDown").setSelectedKey(oPermissionsData.CommunicationChannelID);

        var oPermissionsModel = new sap.ui.model.json.JSONModel();
        oPermissionsModel.setData(oPermissionsData);
        this.getView().setModel(oPermissionsModel, "hotOffers");
        if (oData.length) {
            this._updateHotOfferFields();
        }
    },
    onCommunicationChannelsLoaded: function(oModel) {
        this.getView().setModel(oModel, "communicationChannels");
    },
    onCommuncationPreferencesNotSet: function() {
        sap.m.MessageBox.show(this.getText("USER_PROFILE.COMMUNICATION_NOTSET"), "sap-icon://hint", this.getText("APP.CONFIRM"), [
            sap.ui.getCore().getModel("i18n").getProperty("APP.OK"), sap.ui.getCore().getModel("i18n").getProperty("APP.CANCEL")
        ], jQuery.proxy(function(sResult) {
            if (sResult === sap.ui.getCore().getModel("i18n").getProperty("APP.OK")) {
                this._updateViewstate();
                return;
            } else {
                window.history.back();
            }
        }, this));
    },
    onSaveCommunication: function(oEvent) {
        //If data was not updated, display a toast informing the user
        var bDataModified = this.getView().getModel("viewModel").getProperty("/bDataMOdified");
        if (!bDataModified) {
            this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("USER_PROFILE.COMMUNICATION_UP_TO_DATE"));
            this._updateViewstate();
        } else {
            var oPreferences = this.getView().getModel("communicationPreferences").getData();
            this.getDataProvider().updateCommunicationPreferences(oPreferences, this._getPaperlessBill().getState(),
                jQuery.proxy(this._onCommunicationPreferencesUpdated, this), this);
        }
    },
    _onCommunicationPreferencesUpdated: function() {
        var oHotOffers = this.getView().getModel("hotOffers").getData();
        var sContactMethod = this.getView().getModel("viewModel").getData().sHotOfferValue;

        //If language preference has been changed, then save it.
        var oAccountLanguage = this.getView().getModel("accountLanguage").getData();
        var sSelectedCommunicationLanguageISO = this.getView().getModel("languages").getProperty("/selectedCommunicationLanguageISO");
        if (oAccountLanguage.CorrespondenceLanguageISO !== sSelectedCommunicationLanguageISO || oAccountLanguage.LanguageISO !== sSelectedCommunicationLanguageISO) {
            oAccountLanguage.CorrespondenceLanguageISO = sSelectedCommunicationLanguageISO;
            oAccountLanguage.LanguageISO = sSelectedCommunicationLanguageISO;
            var oPersonalInfo = this.getData("personalInfo");
            oAccountLanguage.FirstName = oPersonalInfo.FirstName;
            oAccountLanguage.LastName = oPersonalInfo.LastName;
        } else {
            oAccountLanguage = null;
        }

        this.getDataProvider().updateCommunicationPermissions(oHotOffers.CommunicationChannelID, sContactMethod, oAccountLanguage,
            jQuery.proxy(this._onCommunicationUpdated, this));
    },
    _onCommunicationUpdated: function() {
        this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("USER_PROFILE.COMMUNICATION_SAVED"));
        this._updateViewstate();
    },

    onLanguageChange: function() {
        this.getView().getModel("viewModel").setProperty("/bDataMOdified", true);
    },

    onPaperlessBillSwitchChange: function() {
        this.getView().getModel("viewModel").setProperty("/bDataMOdified", true);
    },

    onOutageChange: function(oEvent) {
        this._updateOutageFields();
        this.getView().getModel("viewModel").setProperty("/bDataMOdified", true);
    },
    onBillChange: function(oEvent) {
        this._updateBillingFields();
        this.getView().getModel("viewModel").setProperty("/bDataMOdified", true);
    },
    _updateViewstate: function() {
        var bEditable = this.getView().getModel("viewModel").getProperty("/bEditable");
        this.getView().getModel("viewModel").setProperty("/bEditable", !bEditable);
        this.getView().getModel("viewModel").setProperty("/bDataMOdified", false);
    },
    onEditCommunication: function(oEvent) {
        this.getDataProvider().loadHotOffers(this);
        this._updateViewstate();
    },
    onHotOfferChange: function(oEvent) {
        this._updateHotOfferFields();
        this.getView().getModel("viewModel").setProperty("/bDataMOdified", true);
    },
    _getPaperlessBill: function() {
        return this.getView().byId("paperlessBillSwitch");
    },
    _getHotOfferDropDown: function() {
        return this.getView().byId("hotOfferDropDown");
    }
});
