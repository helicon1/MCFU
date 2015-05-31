sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.TransferService", {
    onInit: function() {
        this.utils = sap.umc.mobile.change_service.js.utils;
        sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);

        this._handleRouting();

        this._initializeTransferServiceModels();
    },

    _handleRouting: function() {
        this.getRouter().attachRouteMatched(function(oEvent) {
            var sNavigationName = oEvent.getParameter("name");
            if (sNavigationName === "transferService") {
                if (this.oComponent.bTransferServiceDirty) {
                    this._initializeTransferServiceModels();
                }
            }
        }, this);
    },

    _initializeTransferServiceModels: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "transferServiceSettings");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "date");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "deregulation");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "premise");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "premiseAddress");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "billingAddress");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "country");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "confirmation");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "businessAgreement");

        this._initializetransferServiceSettingsData();
        this._initializeEndDateData();
        this._initializeDeregulationData();
        this._initializePremiseData();
        this._initializePremiseAddressData();
        this._initializeBillingAddressData();
        this._initializeCountryData();
        this._initializeConfirmationData();
        this._initializeBusinessAgreementData();

        this.oComponent.bTransferServiceDirty = false;
    },

    _initializetransferServiceSettingsData: function() {
        this.setData("transferServiceSettings", {
            nextButtonVisible: true,
            backButtonVisible: false,
            titleSubtext: this.getText("CHANGE_SERVICE.TRANSFER_SERVICE_STEP1_DESC")
        });
    },

    _initializeEndDateData: function() {
        var dToday = new Date();
        var dTomorrow = new Date(new Date().setDate(dToday.getDate() + 1));

        this.setData("date", {
            endDate: dToday,
            startDate: dTomorrow
        });
    },

    _initializeDeregulationData: function() {
        this.setData("deregulation", {
            meterNumber: "",
            externalPOD: ""
        });
    },

    _initializePremiseData: function() {
        var oSelection = this.utils.getEmptyAddress();
        oSelection._ID = 0;
        oSelection.ContractItems = [];
        oSelection.AddressInfo.ShortForm = this.getText("CHANGE_SERVICE.SELECT_PREMISE");

        this.setData("premise", {
            premises: [],
            selection: oSelection,
            selectionID: "0"
        });

        this.getDataProvider().loadPremisesWithContracts(this);
    },

    onPremisesWithContractsLoaded: function(aPremisesWithContracts) {
        this.setProperty("premise", "/premises", aPremisesWithContracts);
    },

    _initializePremiseAddressData: function() {
        var oSelection = this.utils.getEmptyAddress();
        oSelection.AddressInfo.ShortForm = this.getText("CHANGE_SERVICE.DEFAULT_PREMISE_NAME");

        this.setData("premiseAddress", {
            addresses: [],
            regions: this.utils.getDefaultRegionArray(),
            selection: oSelection,
            selectionID: "0",
            _isNewAddress: true
        });

        this.getDataProvider().loadPremiseAddresses(this);
    },

    onPremiseAddressesLoaded: function(aAddresses) {
        this.getView().getModel("premiseAddress").setProperty("/addresses", aAddresses);
    },

    _initializeBillingAddressData: function() {
        var oSelection = this.utils.getEmptyAddress();
        oSelection.AddressInfo.ShortForm = this.getText("CHANGE_SERVICE.BILLING_SAME_ADDRESS");

        this.setData("billingAddress", {
            addresses: [],
            regions: this.utils.getDefaultRegionArray(),
            selection: oSelection,
            selectionID: "0",
            _isNewAddress: false,
            _isSameAsPremise: true
        });

        this.getDataProvider().loadBillingAddresses(sap.umc.mobile.CONSTANTS.CHANGE_SERVICE_CONTEXT.TRANSFER_SERVICE, this);
    },

    onBillingAddressesLoaded: function(aAddresses) {
        this.getView().getModel("billingAddress").setProperty("/addresses", aAddresses);
    },

    _initializeCountryData: function() {
        this.getView().getModel("country").setSizeLimit(300);
        this.setData("country", {
            countries: [],
            premiseSelectionID: "0"
        });

        this.getDataProvider().loadCountries(this);
    },

    onCountriesLoaded: function(aCountries) {
        this.getView().getModel("country").setProperty("/countries", aCountries);
    },

    _initializeConfirmationData: function() {
        this.setData("confirmation", {
            isChecked: false,
            startDate: "",
            oldAddress: "",
            endDate: "",
            newAddress: "",
            services: "",
            billingAddress: ""
        });
    },

    _initializeBusinessAgreementData: function() {
        this.setData("businessAgreement", {
            selection: {},
            buags: []
        });
    },

    onPressNext: function() {
        var oIconTabBar = this.getView().byId("transferServiceIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iNextStep = iCurrentStep + 1;

        oIconTabBar.setSelectedKey(iNextStep.toString());
        this.setProperty("transferServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.TRANSFER_SERVICE_STEP" + iNextStep.toString() + "_DESC"));

        if (iNextStep === 2) {
            this.setProperty("transferServiceSettings", "/backButtonVisible", true);
            sap.ui.getCore().getEventBus().publish("transferService", "updateSelectServiceView");
        } else if (iNextStep === 3) {
            sap.ui.getCore().getEventBus().publish("changeService", "updateBillingAddressView");
        } else if (iNextStep === 4) {
            this.setProperty("transferServiceSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("transferService", "updateConfirmationView");
        }
    },

    onPressBack: function() {
        var oIconTabBar = this.getView().byId("transferServiceIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iBackStep = iCurrentStep - 1;

        oIconTabBar.setSelectedKey(iBackStep.toString());
        this.setProperty("transferServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.TRANSFER_SERVICE_STEP" + iBackStep.toString() + "_DESC"));

        if (iBackStep === 1) {
            this.setProperty("transferServiceSettings", "/backButtonVisible", false);
        } else if (iBackStep === 3) {
            this.setProperty("transferServiceSettings", "/nextButtonVisible", true);
            sap.ui.getCore().getEventBus().publish("changeService", "updateBillingAddressView");
        }
    },

    onIconTabBarSelect: function(item) {
        var iSelectedStep = parseInt(item.getParameter("key"), 10);

        this.setProperty("transferServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.TRANSFER_SERVICE_STEP" + iSelectedStep.toString() + "_DESC"));

        if (iSelectedStep === 1) {
            this.setProperty("transferServiceSettings", "/backButtonVisible", false);
        } else {
            this.setProperty("transferServiceSettings", "/backButtonVisible", true);
        }

        if (iSelectedStep === 3) {
            sap.ui.getCore().getEventBus().publish("changeService", "updateBillingAddressView");
        }

        if (iSelectedStep === 4) {
            this.setProperty("transferServiceSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("transferService", "updateConfirmationView");
        } else {
            this.setProperty("transferServiceSettings", "/nextButtonVisible", true);
        }
    },

    onPressSubmit: function() {
        var sInvalidDataString = this._getInvalidDataString();
        if (sInvalidDataString) {
            this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sInvalidDataString);
            return;
        }

        //Get the business agreements, process continues once they are retreived
        this.getDataProvider().loadBusinessAgreements(this);
    },

    onBusinessAgreementsLoaded: function(aBuags) {
        this.setProperty("businessAgreement", "/buags", aBuags);
        this._onPressSubmitStep1();
    },

    _onPressSubmitStep1: function() {
        //Create billing address if new
        if (this.getProperty("billingAddress", "/_isNewAddress")) {
            var oAddressData = this.getProperty("billingAddress", "/selection");
            this.getDataProvider().createBillingAddress(oAddressData, this);
            return;
        }

        this._onPressSubmitStep2();
    },

    onBillingAddressCreated: function(oNewAddress) {
        this.setProperty("billingAddress", "/selection", oNewAddress);
        this.setProperty("billingAddress", "/_isNewAddress", false);

        this._onPressSubmitStep2();
    },

    _onPressSubmitStep2: function() {
        this.iNumberOfContracts = this.getProperty("premise", "/selection/ContractItems").length;

        if (this.getProperty("premiseAddress", "/_isNewAddress")) {
            var oAddressInfo = this.getProperty("premiseAddress", "/selection/AddressInfo");
            this.getDataProvider().findPremiseByAddress(oAddressInfo, this);
        } else {
            var sCurrentContractIndex = (this.iNumberOfContracts - 1).toString();

            var sPremiseID = this.getProperty("premiseAddress", "/selection/PremiseID");
            var sDivisionID = this.getProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/DivisionID");
            this.getDataProvider().checkPODExists(sPremiseID, sDivisionID, this);
        }
    },

    onFoundPremiseByAddress: function(oData) {
        var sErrorText = "";
        var sCurrentContractIndex = (this.iNumberOfContracts - 1).toString();

        var oPremise, sDivisionID, sExternalID;
        if (oData.results.length === 0) {
            //Create deep PoD (Premise & PoD technical objects)
            oPremise = this.getProperty("premiseAddress", "/selection");
            sDivisionID = this.getProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/DivisionID");
            sExternalID = this.getProperty("deregulation", "/externalPOD");

            this.getDataProvider().createPremisePOD(true, oPremise, sDivisionID, sExternalID, this);

        } else if (oData.results.length === 1) {
            //Check PoD exists for premise and division (create if not)
            this.setProperty("premiseAddress", "/selection/PremiseID", oData.results[0].PremiseID);
            sDivisionID = this.getProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/DivisionID");

            this.getDataProvider().checkPODExists(oData.results[0].PremiseID, sDivisionID, this);

        } else {
            sErrorText = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.ERROR_TOO_MANY_PREMISE");
            sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sErrorText);

            var errorStep = "step1IconTabFilter";
            this.getView().byId(errorStep).setIconColor("Negative");
        }
    },

    onCheckedPODExists: function(oData) {
        var sCurrentContractIndex = (this.iNumberOfContracts - 1).toString();

        if (oData.results.length === 0) {
            //If not exists create (shallow) PoD and then a quotation
            var oPremise = this.getProperty("premiseAddress", "/selection");
            var sDivisionID = this.getProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/DivisionID");
            var sExternalID = this.getProperty("deregulation", "/externalPOD");

            this.getDataProvider().createPremisePOD(false, oPremise, sDivisionID, sExternalID, this);
        } else {
            //Set local properties to handle contract properly in data provider
            this.setProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/_createContract", true);
            this.setProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/_pod", oData.results[0]);

            var oBundledData = {
                premise: this.getData("premise"),
                date: this.getData("date"),
                businessAgreement: this.getData("businessAgreement"),
                billingAddress: this.getData("billingAddress"),
                premiseAddress: this.getData("premiseAddress"),
                deregulation: this.getData("deregulation")
            };

            if (this.getProperty("deregulation", "/externalPOD") !== "") {

                //External POD entered, check that one of the POD's returned has the same external ID
                var i;
                for (i = 0; i < oData.results.length; i++) {
                    if (oData.results[i].ExternalID === this.getProperty("deregulation", "/externalPOD")) {
                        oBundledData.premise.selection.ContractItems[sCurrentContractIndex]._pod = oData.results[i];
                        this.transferService(oBundledData);
                        return;
                    }
                }

                //Matching POD was not found. Throw error
                var sErrorText = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.ERROR_POD_MISMATCH");
                sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sErrorText);
                this.getView().byId("step1IconTabFilter").setIconColor("Negative");
                return;

            }

            //No POD entered, continue on with all PODs returned
            this.transferService(oBundledData);
        }
    },

    onPremisePODCreated: function(oData) {
        var sCurrentContractIndex = (this.iNumberOfContracts - 1).toString();

        this.setProperty("premiseAddress", "/selection/PremiseID", oData.PremiseID);

        this.setProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/_createContract", false);
        this.setProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/_pod", oData);

        var oBundledData = {
            premise: this.getData("premise"),
            date: this.getData("date"),
            businessAgreement: this.getData("businessAgreement"),
            billingAddress: this.getData("billingAddress"),
            premiseAddress: this.getData("premiseAddress"),
            deregulation: this.getData("deregulation")
        };

        this.transferService(oBundledData);
    },

    transferService: function(oBundledData) {
        this.iNumberOfContracts--;

        //Make sure all contracts were processed (created POD/premise if appropriate and determined if creating contract or quotation)
        if (this.iNumberOfContracts === 0) {
            this.getDataProvider().transferService(oBundledData, this);
        } else {
            //Check POD exists for next contract
            var sCurrentContractIndex = (this.iNumberOfContracts - 1).toString();

            var sPremiseID = this.getProperty("premiseAddress", "/selection/PremiseID");
            var sDivisionID = this.getProperty("premise", "/selection/ContractItems/" + sCurrentContractIndex + "/DivisionID");
            this.getDataProvider().checkPODExists(sPremiseID, sDivisionID, this);
        }
    },

    onTransferServiceSuccess: function() {
        this.oComponent.setDetailViewsDirty();

        //Set first step as selected - in case user comes back to this component
        var oIconTabBar = this.getView().byId("transferServiceIconTabBar");
        oIconTabBar.setSelectedKey("1");
        this.setProperty("transferServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.TRANSFER_SERVICE_STEP1_DESC"));
        this.setProperty("transferServiceSettings", "/backButtonVisible", false);
        this.setProperty("transferServiceSettings", "/nextButtonVisible", true);

        //Display success message and navigate to home
        var sSuccessText = this.getText("CHANGE_SERVICE.TRANSFER_SERVICE_SUCCESS");
        this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sSuccessText);
        this._backToHome();
    },

    _getInvalidDataString: function() {
        var sMessage = "";

        sMessage += this._validateGeneralInfo();
        sMessage += this._validateAddress("premiseAddress");
        sMessage += this._validateAddress("billingAddress");
        sMessage += this._validateConfirmation();

        return sMessage;
    },

    _validateGeneralInfo: function() {
        var sMessage = "";

        var oEndDate = this.getProperty("date", "/endDate");
        if (oEndDate < new Date().setHours(0, 0, 0, 0)) { //Using "setHours" changes the time to midnight
            sMessage += this.getText("CHANGE_SERVICE.ERROR_END_DATE_PAST") + "\n";
        }

        var oStartDate = this.getProperty("date", "/startDate");
        var oDayAfterEndDate = new Date(new Date().setDate(oEndDate.getDate() + 1));
        if (oStartDate < oDayAfterEndDate.setHours(0, 0, 0, 0)) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_START_DATE_BEFORE_END_DATE") + "\n";
        }

        var oSelectedPremise = this.getProperty("premise", "/selection");
        if (oSelectedPremise.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.SELECT_PREMISE")) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_PREMISE_NOT_SELECTED") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step1IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    },

    _validateAddress: function(sModel) {
        if (this.getProperty(sModel, "/_isNewAddress")) {
            var sMessage = "";
            var oEnteredAddress = this.getProperty(sModel, "/selection/AddressInfo");
            var bIsDataValid = false;

            bIsDataValid = (oEnteredAddress.HouseNo === "" ||
                oEnteredAddress.Street === "" ||
                oEnteredAddress.City === "" ||
                oEnteredAddress.CountryID === "-1" ||
                oEnteredAddress.PostalCode === "") ? false : true;

            //If region is NA, make sure region field is entered
            if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
                bIsDataValid = bIsDataValid && (oEnteredAddress.Region !== "" && oEnteredAddress.Region !== "-1");
            }

            if (!bIsDataValid) {
                if (sModel === "premiseAddress") {
                    sMessage += this.getText("CHANGE_SERVICE.ERROR_NEW_ADDRESS") + "\n";
                    this.getView().byId("step2IconTabFilter").setIconColor("Negative");
                } else if (sModel === "billingAddress") {
                    sMessage += this.getText("CHANGE_SERVICE.ERROR_BILLING_ADDRESS") + "\n";
                    this.getView().byId("step3IconTabFilter").setIconColor("Negative");
                }
            } else {
                if (sModel === "premiseAddress") {
                    this.getView().byId("step2IconTabFilter").setIconColor("Default");
                } else if (sModel === "billingAddress") {
                    this.getView().byId("step3IconTabFilter").setIconColor("Default");
                }
            }

            return sMessage;
        }

        if (sModel === "premiseAddress") {
            this.getView().byId("step2IconTabFilter").setIconColor("Default");
        } else if (sModel === "billingAddress") {
            this.getView().byId("step3IconTabFilter").setIconColor("Default");
        }
        return "";
    },

    _validateConfirmation: function() {
        var sMessage = "";

        if (!this.getProperty("confirmation", "/isChecked")) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_CONFIRMATION") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step4IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    }
});
