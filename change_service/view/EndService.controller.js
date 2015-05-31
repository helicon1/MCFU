sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.EndService", {
    onInit: function() {
        this.utils = sap.umc.mobile.change_service.js.utils;
        sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);

        this._handleRouting();

        this._initializeEndServiceModels();
    },

    _handleRouting: function() {
        this.getRouter().attachRouteMatched(function(oEvent) {
            var sNavigationName = oEvent.getParameter("name");
            if (sNavigationName === "endService") {
                if (this.oComponent.bEndServiceDirty) {
                    this._initializeEndServiceModels();
                }
            }
        }, this);
    },

    _initializeEndServiceModels: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "endServiceSettings");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "endDate");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "premise");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "confirmation");

        this._initializeEndServiceSettingsData();
        this._initializeEndDateData();
        this._initializePremiseData();
        this._initializeConfirmationInfo();

        this.oComponent.bEndServiceDirty = false;
    },

    _initializeEndServiceSettingsData: function() {
        this.setData("endServiceSettings", {
            nextButtonVisible: true,
            backButtonVisible: false,
            titleSubtext: this.getText("CHANGE_SERVICE.END_SERVICE_STEP1_DESC")
        });
    },

    _initializeEndDateData: function() {
        this.setData("endDate", {
            selectedDate: new Date()
        });
    },

    _initializePremiseData: function() {
        this.setData("premise", {
            premises: [],
            selection: {
                _ID: 0,
                ContractItems: [],
                AddressInfo: {
                    ShortForm: this.getText("CHANGE_SERVICE.SELECT_PREMISE")
                }
            },
            selectionID: "0"
        });

        this.getDataProvider().loadPremisesWithContracts(this);
    },

    onPremisesWithContractsLoaded: function(aPremisesWithContracts) {
        this.setProperty("premise", "/premises", aPremisesWithContracts);
    },

    _initializeConfirmationInfo: function() {
        this.setData("confirmation", {
            isChecked: false,
            date: "",
            address: "",
            services: ""
        });
    },

    onPressNext: function() {
        var oIconTabBar = this.getView().byId("endServiceIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iNextStep = iCurrentStep + 1;

        oIconTabBar.setSelectedKey(iNextStep.toString());
        this.setProperty("endServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.END_SERVICE_STEP" + iNextStep.toString() + "_DESC"));

        if (iNextStep === 2) {
            this.setProperty("endServiceSettings", "/backButtonVisible", true);
            sap.ui.getCore().getEventBus().publish("endService", "updateSelectServiceView");
        } else if (iNextStep === 3) {
            this.setProperty("endServiceSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("endService", "updateConfirmationView");
        }
    },

    onPressBack: function() {
        var oIconTabBar = this.getView().byId("endServiceIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iBackStep = iCurrentStep - 1;

        oIconTabBar.setSelectedKey(iBackStep.toString());
        this.setProperty("endServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.END_SERVICE_STEP" + iBackStep.toString() + "_DESC"));

        if (iBackStep === 1) {
            this.setProperty("endServiceSettings", "/backButtonVisible", false);
        } else if (iBackStep === 2) {
            this.setProperty("endServiceSettings", "/nextButtonVisible", true);
            sap.ui.getCore().getEventBus().publish("endService", "updateSelectServiceView");
        }
    },

    onIconTabBarSelect: function(item) {
        var iSelectedStep = parseInt(item.getParameter("key"), 10);

        this.setProperty("endServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.END_SERVICE_STEP" + iSelectedStep.toString() + "_DESC"));

        if (iSelectedStep === 1) {
            this.setProperty("endServiceSettings", "/backButtonVisible", false);
        } else {
            this.setProperty("endServiceSettings", "/backButtonVisible", true);
        }

        if (iSelectedStep === 2) {
            sap.ui.getCore().getEventBus().publish("endService", "updateSelectServiceView");
        }

        if (iSelectedStep === 3) {
            this.setProperty("endServiceSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("endService", "updateConfirmationView");
        } else {
            this.setProperty("endServiceSettings", "/nextButtonVisible", true);
        }
    },

    onPressSubmit: function() {
        var sInvalidDataString = this._getInvalidDataString();
        if (sInvalidDataString) {
            this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sInvalidDataString);
            return;
        }

        this._onPressSubmitStep1();
    },

    _onPressSubmitStep1: function() {
        var oBundledData = {
            premise: this.getData("premise"),
            endDate: this.getData("endDate")
        };

        this.getDataProvider().endSelectedContracts(oBundledData, this);
    },

    onEndContractSuccess: function() {
        this.oComponent.setDetailViewsDirty();

        //Set first step as selected - in case user comes back to this component
        var oIconTabBar = this.getView().byId("endServiceIconTabBar");
        oIconTabBar.setSelectedKey("1");
        this.setProperty("endServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.END_SERVICE_STEP1_DESC"));
        this.setProperty("endServiceSettings", "/backButtonVisible", false);
        this.setProperty("endServiceSettings", "/nextButtonVisible", true);

        //Display success message and navigate to home
        var sSuccessText = this.getText("CHANGE_SERVICE.END_CONTRACT_SUCCESS");
        this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sSuccessText);
        this._backToHome();
    },

    _getInvalidDataString: function() {
        var sMessage = "";

        sMessage += this.validateGeneralInfo();
        sMessage += this.validateSelectService();
        sMessage += this.validateConfirmation();

        return sMessage;
    },

    validateGeneralInfo: function() {
        var sMessage = "";

        //Validate date is not in the past
        var oSelectedDate = this.getProperty("endDate", "/selectedDate");
        if (oSelectedDate < new Date().setHours(0, 0, 0, 0)) { //Using "setHours" here changes the time to midnight
            sMessage += this.getText("CHANGE_SERVICE.ERROR_END_DATE_PAST") + "\n";
        }

        //Validate premise was selected
        var oSelectedPremise = this.getProperty("premise", "/selection");
        if (oSelectedPremise.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.SELECT_PREMISE")) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_PREMISE_NOT_SELECTED") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step1IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    },

    validateSelectService: function() {
        var aContracts = this.getProperty("premise", "/selection/ContractItems");
        var bIsServiceSelected = false;
        var sMessage = "";
        var i;
        for (i = 0; i < aContracts.length; i++) {
            if (aContracts[i]._isChecked) {
                bIsServiceSelected = true;
            }
        }

        if (!bIsServiceSelected) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_SERVICE_NOT_SELECTED") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step2IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    },

    validateConfirmation: function() {
        var sMessage = "";

        if (!this.getProperty("confirmation", "/isChecked")) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_CONFIRMATION") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step3IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    }


});
