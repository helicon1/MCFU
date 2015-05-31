sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.ChangeProduct", {

    onInit: function() {
        sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);
        this.utils = sap.umc.mobile.change_service.js.utils;

        this._handleRouting();

        this._initializeChangeProductModels();
    },

    _handleRouting: function() {
        this.getRouter().attachRouteMatched(function(oEvent) {
            var sNavigationName = oEvent.getParameter("name");
            if (sNavigationName === "changeProduct") {
                if (this.oComponent.bChangeProductDirty) {
                    this._initializeChangeProductModels();
                }
            }
        }, this);
    },

    _initializeChangeProductModels: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "changeProductSettings");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "date");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "premise");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "product");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "confirmation");

        this._initializeChangeProductSettingsData();
        this._initializeDateData();
        this._initializePremiseData();
        this._initializeProductData();
        this._initializeConfirmationInfo();

        this.oComponent.bChangeProductDirty = false;
    },

    _initializeChangeProductSettingsData: function() {
        this.setData("changeProductSettings", {
            nextButtonVisible: true,
            backButtonVisible: false,
            titleSubtext: this.getText("CHANGE_SERVICE.CHANGE_PRODUCT_STEP1_DESC")
        });
    },

    _initializeDateData: function() {
        this.setData("date", {
            selectedDate: new Date()
        });
    },

    _initializePremiseData: function() {
        var oDefaultPremise = this.utils.getEmptyPremiseWithContract();
        oDefaultPremise._ID = 0;
        oDefaultPremise.AddressInfo.ShortForm = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.SELECT_PREMISE");
        oDefaultPremise.ContractItems[0].Product.Description = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.SELECT_SERVICE");

        this.setData("premise", {
            premises: [],
            selection: oDefaultPremise,
            selectionID: "0",
            selectedContractID: ""
        });

        this.getDataProvider().loadPremisesWithContracts(this);
    },

    onPremisesWithContractsLoaded: function(aPremisesWithContracts) {
        this.setProperty("premise", "/premises", aPremisesWithContracts);
    },

    _initializeProductData: function() {
        this.setData("product", {
            products: [],
            divisions: [],
            productFilters: {
                divisionID: "01",
                consumption: "10,000 KWh"
            },
            _divisionEnabled: false,
            _selectedProductPath: ""
        });

        this.getDataProvider().loadDivisions(this);
    },

    onProductsLoaded: function(aProducts) {
        this.getView().getModel("product").setProperty("/products", aProducts);
    },

    onDivisionsLoaded: function(aDivisions) {
        this.getView().getModel("product").setProperty("/divisions", aDivisions);
    },

    _initializeConfirmationInfo: function() {
        this.setData("confirmation", {
            isChecked: false,
            date: "",
            address: "",
            service: "",
            oldProduct: "",
            newProduct: ""
        });
    },

    onPressNext: function() {
        var oIconTabBar = this.getView().byId("changeProductIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iNextStep = iCurrentStep + 1;

        oIconTabBar.setSelectedKey(iNextStep.toString());
        this.setProperty("changeProductSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.CHANGE_PRODUCT_STEP" + iNextStep.toString() + "_DESC"));

        if (iNextStep === 2) {
            this.setProperty("changeProductSettings", "/backButtonVisible", true);
        } else if (iNextStep === 3) {
            this.setProperty("changeProductSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("changeProduct", "updateConfirmationView");
        }
    },

    onPressBack: function() {
        var oIconTabBar = this.getView().byId("changeProductIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iBackStep = iCurrentStep - 1;

        oIconTabBar.setSelectedKey(iBackStep.toString());
        this.setProperty("changeProductSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.CHANGE_PRODUCT_STEP" + iBackStep.toString() + "_DESC"));

        if (iBackStep === 1) {
            this.setProperty("changeProductSettings", "/backButtonVisible", false);
        } else if (iBackStep === 2) {
            this.setProperty("changeProductSettings", "/nextButtonVisible", true);
        }
    },

    onIconTabBarSelect: function(item) {
        var iSelectedStep = parseInt(item.getParameter("key"), 10);

        this.setProperty("changeProductSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.CHANGE_PRODUCT_STEP" + iSelectedStep.toString() + "_DESC"));

        if (iSelectedStep === 1) {
            this.setProperty("changeProductSettings", "/backButtonVisible", false);
        } else {
            this.setProperty("changeProductSettings", "/backButtonVisible", true);
        }

        if (iSelectedStep === 3) {
            this.setProperty("changeProductSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("changeProduct", "updateConfirmationView");
        } else {
            this.setProperty("changeProductSettings", "/nextButtonVisible", true);
        }
    },

    onPressSubmit: function() {
        var sInvalidDataString = this._getInvalidDataString();
        if (sInvalidDataString) {
            this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sInvalidDataString);
            return;
        }

        var sSelectedProductPath = this.getProperty("product", "/_selectedProductPath");
        var oSelectedProduct = this.getProperty("product", sSelectedProductPath);

        var oBundledData = {
            product: oSelectedProduct,
            premise: this.getData("premise"),
            date: this.getData("date")
        };

        this.getDataProvider().changeProduct(oBundledData, this);
    },

    onChangeProductSuccess: function() {
        this.oComponent.setDetailViewsDirty();

        //Set first step as selected - in case user comes back to this component
        var oIconTabBar = this.getView().byId("changeProductIconTabBar");
        oIconTabBar.setSelectedKey("1");
        this.setProperty("changeProductSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.CHANGE_PRODUCT_STEP1_DESC"));
        this.setProperty("changeProductSettings", "/nextButtonVisible", true);
        this.setProperty("changeProductSettings", "/backButtonVisible", false);

        //Display success message and navigate to home
        var sSuccessText = this.getText("CHANGE_SERVICE.CHANGE_PRODUCT_SUCCESS");
        this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sSuccessText);
        this._backToHome();
    },

    _getInvalidDataString: function() {
        var sMessage = "";

        sMessage += this.validateGeneralInfo();
        sMessage += this.validateSelectProduct();
        sMessage += this.validateConfirmation();

        return sMessage;
    },

    validateGeneralInfo: function() {
        var sMessage = "";

        //Validate date is not in the past
        var oSelectedDate = this.getProperty("date", "/selectedDate");
        if (oSelectedDate < new Date().setHours(0, 0, 0, 0)) { //Using "setHours" here changes the time to midnight
            sMessage += this.getText("CHANGE_SERVICE.ERROR_START_DATE_PAST") + "\n";
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

    validateSelectProduct: function() {
        var sMessage = "";

        var sProductPath = this.getProperty("product", "/_selectedProductPath");
        var oSelectedProduct = this.getProperty("product", sProductPath);

        if (!oSelectedProduct) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_PRODUCT") + "\n";
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
