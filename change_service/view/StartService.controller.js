sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.StartService", {
    onInit: function() {
        this.utils = sap.umc.mobile.change_service.js.utils;
        sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);

        this._handleRouting();

        this._initializeStartServiceModels();
    },

    _handleRouting: function() {
        this.getRouter().attachRouteMatched(function(oEvent) {
            var sNavigationName = oEvent.getParameter("name");
            if (sNavigationName === "startService") {
                if (this.oComponent.bStartServiceDirty) {
                    this._initializeStartServiceModels();
                }
            }
        }, this);
    },

    _initializeStartServiceModels: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "startServiceSettings");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "startDate");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "deregulation");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "currentSupplier");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "premiseAddress");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "billingAddress");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "country");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "product");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "combinedPaymentInfo");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "confirmation");
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "businessAgreement");

        this._initializeStartServiceSettingsData();
        this._initializeStartDateData();
        this._initializeDeregulationData();
        this._initializeCurrentSupplierData();
        this._initializePremiseAddressData();
        this._initializeBillingAddressData();
        this._initializeCountryData();
        this._initializeProductData();
        this._initializeCombinedPaymentInfo();
        this._initializeConfirmationInfo();
        this._initializeBusinessAgreementData();

        this.oComponent.bStartServiceDirty = false;
    },

    _initializeStartServiceSettingsData: function() {
        this.setData("startServiceSettings", {
            nextButtonVisible: true,
            backButtonVisible: false,
            titleSubtext: this.getText("CHANGE_SERVICE.START_SERVICE_STEP1_DESC")
        });
    },

    _initializeStartDateData: function() {
        this.setData("startDate", {
            selectedDate: new Date()
        });
    },

    _initializeDeregulationData: function() {
        this.setData("deregulation", {
            meterNumber: "",
            externalPOD: ""
        });
    },

    _initializeCurrentSupplierData: function() {
        this.setData("currentSupplier", {
            isChecked: false,
            suppliers: [],
            selectionID: "0"
        });

        this.getDataProvider().loadSuppliers(this);
    },

    onSuppliersLoaded: function(aSuppliers) {
        this.getView().getModel("currentSupplier").setProperty("/suppliers", aSuppliers);
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

        this.getDataProvider().loadBillingAddresses(sap.umc.mobile.CONSTANTS.CHANGE_SERVICE_CONTEXT.START_SERVICE, this);
    },

    onBillingAddressesLoaded: function(aAddresses) {
        this.getView().getModel("billingAddress").setProperty("/addresses", aAddresses);
    },

    _initializeCountryData: function() {
        this.getView().getModel("country").setSizeLimit(300);
        this.setData("country", {
            countries: [],
            premiseSelectionID: "0",
            billingSelectionID: "0"
        });

        this.getDataProvider().loadCountries(this);
    },

    onCountriesLoaded: function(aCountries) {
        this.getView().getModel("country").setProperty("/countries", aCountries);
    },

    _initializeProductData: function() {
        this.setData("product", {
            products: [],
            divisions: [],
            productFilters: {
                divisionID: "01",
                consumption: "10,000 KWh"
            },
            _divisionEnabled: true,
            _selectedProductPath: ""
        });

        this.getDataProvider().loadProducts("01", "10000", this);
        this.getDataProvider().loadDivisions(this);
    },

    onProductsLoaded: function(aProducts) {
        this.getView().getModel("product").setProperty("/products", aProducts);
    },

    onDivisionsLoaded: function(aDivisions) {
        this.getView().getModel("product").setProperty("/divisions", aDivisions);
    },

    _initializeCombinedPaymentInfo: function() {
        this.setData("combinedPaymentInfo", {
            accounts: [],
            cardAccountTypes: [],
            bankAccountTypes: [],
            months: this.getApp().getUtils().getMonths(),
            years: this.getApp().getUtils().getYears(),
            selection: {},
            _isEntered: false,
            _isBankAccount: false,
            _isCardAccount: false,
            _isNewAccount: true
        });

        this.getDataProvider().loadBankAccounts(this);
        this.getDataProvider().loadCardAccounts(this);
        this.getDataProvider().loadCardAccountTypes(this);
    },

    onBankAccountsLoaded: function(aBankAccounts) {
        //Get the existing payment accounts - may be empty if this call returns before loadCardAccounts
        var aAccounts = this.getView().getModel("combinedPaymentInfo").getProperty("/accounts");
        aAccounts = aAccounts.concat(aBankAccounts);

        var oEmptyBankAccount = this.utils.getEmptyBankAccount();
        oEmptyBankAccount._displayName = this.getText("CHANGE_SERVICE.DEFAULT_BANK_NAME");

        aAccounts.unshift(oEmptyBankAccount);
        var i;
        for (i = 0; i < aAccounts.length; i++) {
            //Make sure _ID has two characters to ensure proper sorting with > 10 accounts
            aAccounts[i]._ID = (aAccounts[i]._ID < 10) ? ("0" + i.toString()) : i.toString();
        }

        this.getView().getModel("combinedPaymentInfo").setProperty("/accounts", aAccounts);
        this.getView().getModel("combinedPaymentInfo").setProperty("/selection", oEmptyBankAccount);
        this.getView().getModel("combinedPaymentInfo").setProperty("/_isCardAccount", false);
        this.getView().getModel("combinedPaymentInfo").setProperty("/_isBankAccount", true);
    },

    onCardAccountsLoaded: function(aCardAccounts) {
        //Get the existing payment accounts - may be empty if this call returns before loadBankAccounts
        var aAccounts = this.getView().getModel("combinedPaymentInfo").getProperty("/accounts");
        aAccounts = aAccounts.concat(aCardAccounts);

        var oEmptyCardAccount = this.utils.getEmptyCardAccount();
        oEmptyCardAccount._displayName = this.getText("CHANGE_SERVICE.DEFAULT_CARD_NAME");

        aAccounts.unshift(oEmptyCardAccount);
        var i;
        for (i = 0; i < aAccounts.length; i++) {
            //Make sure _ID has two characters to ensure proper sorting with > 10 accounts
            aAccounts[i]._ID = (aAccounts[i]._ID < 10) ? ("0" + i.toString()) : i.toString();
        }

        this.getView().getModel("combinedPaymentInfo").setProperty("/accounts", aAccounts);
        this.getView().getModel("combinedPaymentInfo").setProperty("/selection", oEmptyCardAccount);
        this.getView().getModel("combinedPaymentInfo").setProperty("/_isCardAccount", true);
        this.getView().getModel("combinedPaymentInfo").setProperty("/_isBankAccount", false);
    },

    onCardAccountsTypesLoaded: function(aCardAccountTypes) {
        this.getView().getModel("combinedPaymentInfo").setProperty("/cardAccountTypes", aCardAccountTypes);
    },

    _initializeConfirmationInfo: function() {
        this.setData("confirmation", {
            isChecked: false,
            date: "",
            service: "",
            product: "",
            billing: "",
            payment: ""
        });
    },

    _initializeBusinessAgreementData: function() {
        this.setData("businessAgreement", {
            selection: {},
            buags: []
        });
    },

    onPressNext: function() {
        var oIconTabBar = this.getView().byId("startServiceIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iNextStep = iCurrentStep + 1;

        oIconTabBar.setSelectedKey(iNextStep.toString());
        this.setProperty("startServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.START_SERVICE_STEP" + iNextStep.toString() + "_DESC"));

        if (iNextStep === 2) {
            this.setProperty("startServiceSettings", "/backButtonVisible", true);
        } else if (iNextStep === 4) {
            sap.ui.getCore().getEventBus().publish("changeService", "updateBillingAddressView");
        } else if (iNextStep === 6) {
            this.setProperty("startServiceSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("startService", "updateConfirmationView");
        }
    },

    onPressBack: function() {
        var oIconTabBar = this.getView().byId("startServiceIconTabBar");
        var iCurrentStep = parseInt(oIconTabBar.getSelectedKey(), 10);
        var iBackStep = iCurrentStep - 1;

        oIconTabBar.setSelectedKey(iBackStep.toString());
        this.setProperty("startServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.START_SERVICE_STEP" + iBackStep.toString() + "_DESC"));

        if (iBackStep === 1) {
            this.setProperty("startServiceSettings", "/backButtonVisible", false);
        } else if (iBackStep === 4) {
            sap.ui.getCore().getEventBus().publish("changeService", "updateBillingAddressView");
        } else if (iBackStep === 5) {
            this.setProperty("startServiceSettings", "/nextButtonVisible", true);
        }
    },

    onIconTabBarSelect: function(item) {
        var iSelectedStep = parseInt(item.getParameter("key"), 10);

        this.setProperty("startServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.START_SERVICE_STEP" + iSelectedStep.toString() + "_DESC"));

        if (iSelectedStep === 1) {
            this.setProperty("startServiceSettings", "/backButtonVisible", false);
        } else {
            this.setProperty("startServiceSettings", "/backButtonVisible", true);
        }

        if (iSelectedStep === 4) {
            sap.ui.getCore().getEventBus().publish("changeService", "updateBillingAddressView");
        }

        if (iSelectedStep === 6) {
            this.setProperty("startServiceSettings", "/nextButtonVisible", false);
            sap.ui.getCore().getEventBus().publish("startService", "updateConfirmationView");
        } else {
            this.setProperty("startServiceSettings", "/nextButtonVisible", true);
        }
    },

    /******************  Submit functions begin  ******************/

    onPressSubmit: function() {
        //Validate the user's input information first
        var sInvalidDataString = this._getInvalidDataString();
        if (sInvalidDataString) {
            this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sInvalidDataString);
            return;
        }

        this._onPressSubmitStep1();
    },

    _onPressSubmitStep1: function() {
        //Create payment card or bank account if new
        if (this.getProperty("combinedPaymentInfo", "/_isEntered")) {
            if (this.getProperty("combinedPaymentInfo", "/_isNewAccount") && this.getProperty("combinedPaymentInfo", "/_isCardAccount")) {
                var oPaymentCardData = this.getApp().getUtils().copyObjectProperties(this.getProperty("combinedPaymentInfo", "/selection"));
                this.getDataProvider().createPaymentCard(oPaymentCardData, this);
                //Callback function calls the next step
                return;
            } else if (this.getProperty("combinedPaymentInfo", "/_isNewAccount") && this.getProperty("combinedPaymentInfo", "/_isBankAccount")) {
                var oBankAccountData = this.getApp().getUtils().copyObjectProperties(this.getProperty("combinedPaymentInfo", "/selection"));
                this.getDataProvider().createBankAccount(oBankAccountData, this);
                //Callback function calls the next step
                return;
            }
        }

        this._onPressSubmitStep2();
    },

    onPaymentCardCreated: function(oNewPaymentCard) {
        //Prepare and add the new payment card to the model. Set the flags in case user needs to submit again
        var aExistingAccounts = this.getProperty("combinedPaymentInfo", "/accounts");

        oNewPaymentCard._expiry = {
            month: (oNewPaymentCard.ValidTo.getMonth() + 1).toString(),
            year: (oNewPaymentCard.ValidTo.getFullYear()).toString()
        };
        oNewPaymentCard._displayName = oNewPaymentCard.CardNumber;
        oNewPaymentCard._ID = aExistingAccounts.length < 10 ? ("0" + aExistingAccounts.length.toString()) : (aExistingAccounts.length.toString());

        aExistingAccounts.push(oNewPaymentCard);
        this.setProperty("combinedPaymentInfo", "/accounts", aExistingAccounts);
        this.setProperty("combinedPaymentInfo", "/_selectionID", oNewPaymentCard._ID);
        this.setProperty("combinedPaymentInfo", "/selection", oNewPaymentCard);
        this.setProperty("combinedPaymentInfo", "/_isBankAccount", false);
        this.setProperty("combinedPaymentInfo", "/_isCardAccount", true);
        this.setProperty("combinedPaymentInfo", "/_isNewAccount", false);
        //Continue with start service process
        this._onPressSubmitStep2();
    },

    onBankAccountCreated: function(oNewBankAccount) {
        //Prepare and add the new bank card to the model. Set the flags in case user needs to submit again
        var aExistingAccounts = this.getProperty("combinedPaymentInfo", "/accounts");

        oNewBankAccount._displayName = oNewBankAccount.BankAccountNo;
        oNewBankAccount._ID = aExistingAccounts.length < 10 ? ("0" + aExistingAccounts.length.toString()) : (aExistingAccounts.length.toString());

        aExistingAccounts.push(oNewBankAccount);
        this.setProperty("combinedPaymentInfo", "/accounts", aExistingAccounts);
        this.setProperty("combinedPaymentInfo", "/_selectionID", oNewBankAccount._ID);
        this.setProperty("combinedPaymentInfo", "/selection", oNewBankAccount);
        this.setProperty("combinedPaymentInfo", "/_isBankAccount", true);
        this.setProperty("combinedPaymentInfo", "/_isCardAccount", false);
        this.setProperty("combinedPaymentInfo", "/_isNewAccount", false);

        //Continue with start service process
        this._onPressSubmitStep2();
    },

    _onPressSubmitStep2: function() {
        //Create billing address if new
        if (this.getProperty("billingAddress", "/_isNewAddress")) {
            var oAddressData = this.getProperty("billingAddress", "/selection");
            this.getDataProvider().createBillingAddress(oAddressData, this);
            return;
        }

        this._onPressSubmitStep3();
    },

    onBillingAddressCreated: function(oNewAddress) {
        this.setProperty("billingAddress", "/selection", oNewAddress);
        this.setProperty("billingAddress", "/_isNewAddress", false);

        this._onPressSubmitStep3();
    },

    _onPressSubmitStep3: function() {
        this.getDataProvider().loadBusinessAgreements(this);
        //Callback function calls the next step
    },

    onBusinessAgreementsLoaded: function(aBuags) {
        this.setProperty("businessAgreement", "/buags", aBuags);

        var sPremiseID = this.getProperty("premiseAddress", "/selection/PremiseID");
        var oSamePremiseBuag, oNoContractBuag;

        //Find a buag with contracts under the same premise
        //Otherwise find a buag with no contracts
        var i, aContracts;
        for (i = 0; i < aBuags.length; i++) {
            //In case no contractItem object exists for buag - shouldn't happen? 
            aContracts = aBuags[i].ContractItems ? aBuags[i].ContractItems.results : [];
            if (aContracts.length === 0) {
                oNoContractBuag = aBuags[i];
            } else if (aContracts[0].PremiseID === sPremiseID) {
                oSamePremiseBuag = aBuags[i];
                break;
            }
        }

        //Call the next step with the same premise buag (best case) or the no contract buag
        //If neither a same premise or empty buag exist, create a new buag
        if (oSamePremiseBuag) {
            this.setProperty("businessAgreement", "/selection", oSamePremiseBuag);
            this._onPressSubmitStep4();
        } else if (oNoContractBuag) {
            this.setProperty("businessAgreement", "/selection", oNoContractBuag);
            this._onPressSubmitStep4();
        } else {
            var oCombinedPaymentInfo = this.getData("combinedPaymentInfo");
            this.getDataProvider().createNewBuag(oCombinedPaymentInfo, this);
        }
    },

    onNewBuagCreated: function(oNewBuag) {
        this.setProperty("businessAgreement", "/selection", oNewBuag);
        this._onPressSubmitStep4();
    },

    _onPressSubmitStep4: function() {
        //This step will result in a contract being created if a premise and POD already exists, 
        //      or the requried technical objects being created and then a quotation created instead
        if (this.getProperty("premiseAddress", "/_isNewAddress")) {
            var oAddressInfo = this.getProperty("premiseAddress", "/selection/AddressInfo");
            this.getDataProvider().findPremiseByAddress(oAddressInfo, this);
        } else {
            var sPremiseID = this.getProperty("premiseAddress", "/selection/PremiseID");
            var sProductPath = this.getProperty("product", "/_selectedProductPath");
            var sDivisionID = this.getProperty("product", sProductPath + "/DivisionID");

            this.getDataProvider().checkPODExists(sPremiseID, sDivisionID, this);
        }
    },

    onFoundPremiseByAddress: function(oData) {
        var sErrorText = "";

        var sProductPath, sDivisionID, oPremise, sExternalID;
        if (oData.results.length === 0) {
            //Create deep PoD (Premise & PoD technical objects)
            oPremise = this.getProperty("premiseAddress", "/selection");
            sProductPath = this.getProperty("product", "/_selectedProductPath");
            sDivisionID = this.getProperty("product", sProductPath + "/DivisionID");
            sExternalID = this.getProperty("deregulation", "/externalPOD");

            this.getDataProvider().createPremisePOD(true, oPremise, sDivisionID, sExternalID, this);

        } else if (oData.results.length === 1) {
            //Check PoD exists for premise and division (create if not)
            this.setProperty("premiseAddress", "/selection/PremiseID", oData.results[0].PremiseID);
            sProductPath = this.getProperty("product", "/_selectedProductPath");
            sDivisionID = this.getProperty("product", sProductPath + "/DivisionID");

            this.getDataProvider().checkPODExists(oData.results[0].PremiseID, sDivisionID, this);

        } else {
            sErrorText = this.getText("CHANGE_SERVICE.ERROR_TOO_MANY_PREMISE");
            sap.umc.mobile.app.js.utils.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sErrorText);

            var errorStep = "step2IconTabFilter";
            this.getView().byId(errorStep).setIconColor("Negative");
        }
    },

    onCheckedPODExists: function(oData) {
        var sProductPath = this.getProperty("product", "/_selectedProductPath");

        if (oData.results.length === 0) {
            //If not exists create (shallow) PoD and then a quotation
            var oPremise = this.getProperty("premiseAddress", "/selection");
            var sDivisionID = this.getProperty("product", sProductPath + "/DivisionID");
            var sExternalID = this.getProperty("deregulation", "/externalPOD");

            this.getDataProvider().createPremisePOD(false, oPremise, sDivisionID, sExternalID, this);

        } else {
            var oBundledData = {
                aPOD: oData.results,
                oProduct: this.getProperty("product", sProductPath),
                combinedPaymentInfo: this.getData("combinedPaymentInfo"),
                businessAgreement: this.getData("businessAgreement"),
                billingAddress: this.getData("billingAddress"),
                premiseAddress: this.getData("premiseAddress"),
                startDate: this.getData("startDate"), 
                product: this.getData("product"),
                currentSupplier: this.getData("currentSupplier"),
                deregulation: this.getData("deregulation")
            };
    		//neutralize the UTC conversion
            if (oBundledData.startDate.selectedDate.getTimezoneOffset() < 0) {
            	oBundledData.startDate.selectedDate.setHours(23);
            }

            if (this.getProperty("deregulation", "/externalPOD") !== "") {

                //External POD entered, check that one of the POD's returned has the same external ID
                var i;
                for (i = 0; i < oData.results.length; i++) {
                    if (oData.results[i].ExternalID === this.getProperty("deregulation", "/externalPOD")) {
                        oBundledData.aPOD = [oData.results[i]];
                        this.getDataProvider().startService(true, oBundledData, this);
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
            this.getDataProvider().startService(true, oBundledData, this);

        }
    },

    onPremisePODCreated: function(oData) {
        this.setProperty("premiseAddress", "/selection/PremiseID", oData.PremiseID);

        var sProductPath = this.getProperty("product", "/_selectedProductPath");

        var oBundledData = {
            aPOD: [oData],
            oProduct: this.getProperty("product", sProductPath),
            combinedPaymentInfo: this.getData("combinedPaymentInfo"),
            businessAgreement: this.getData("businessAgreement"),
            billingAddress: this.getData("billingAddress"),
            premiseAddress: this.getData("premiseAddress"),
            startDate: this.getData("startDate"),
            product: this.getData("product"),
            currentSupplier: this.getData("currentSupplier"),
            deregulation: this.getData("deregulation")
        };
		//neutralize the UTC conversion        
        if (oBundledData.startDate.selectedDate.getTimezoneOffset() < 0) {
        	oBundledData.startDate.selectedDate.setHours(23);
        }

        this.getDataProvider().startService(false, oBundledData, this);
    },

    onStartServiceSuccess: function(oData) {
        this.oComponent.setDetailViewsDirty();

        //Set first step as selected - in case user comes back to this component
        var oIconTabBar = this.getView().byId("startServiceIconTabBar");
        oIconTabBar.setSelectedKey("1");
        this.setProperty("startServiceSettings", "/titleSubtext", this.getText("CHANGE_SERVICE.START_SERVICE_STEP1_DESC"));
        this.setProperty("startServiceSettings", "/backButtonVisible", false);
        this.setProperty("startServiceSettings", "/nextButtonVisible", true);

        //Display success message and navigate to home
        var sSuccessText = this.getText("CHANGE_SERVICE.CREATE_CONTRACT_SUCCESS");
        this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sSuccessText);
        this._backToHome();
    },

    /******************  Submit functions end  ******************/

    /******************  Validation functions begin  ******************/

    _getInvalidDataString: function() {
        var sMessage = "";

        sMessage += this._validateGeneralInfo();
        sMessage += this._validateAddress("premiseAddress");
        sMessage += this._validateSelectProduct();
        sMessage += this._validateAddress("billingAddress");
        sMessage += this._validatePaymentInfo();
        sMessage += this._validateConfirmation();

        return sMessage;
    },

    _validateGeneralInfo: function() {
        var sMessage = "";

        var oSelectedDate = this.getProperty("startDate", "/selectedDate");
        if (oSelectedDate < new Date().setHours(0, 0, 0, 0)) { //Using "setHours" changes the time to midnight
            sMessage += this.getText("CHANGE_SERVICE.ERROR_START_DATE_PAST") + "\n";
        }

        if (this.getProperty("currentSupplier", "/isChecked") && this.getProperty("currentSupplier", "/selectionID") === "0") {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_SUPPLIER_NOT_SELECTED") + "\n";
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
                    sMessage += this.getText("CHANGE_SERVICE.ERROR_SERVICE_ADDRESS") + "\n";
                    this.getView().byId("step2IconTabFilter").setIconColor("Negative");
                } else if (sModel === "billingAddress") {
                    sMessage += this.getText("CHANGE_SERVICE.ERROR_BILLING_ADDRESS") + "\n";
                    this.getView().byId("step4IconTabFilter").setIconColor("Negative");
                }
            } else {
                if (sModel === "premiseAddress") {
                    this.getView().byId("step2IconTabFilter").setIconColor("Default");
                } else if (sModel === "billingAddress") {
                    this.getView().byId("step4IconTabFilter").setIconColor("Default");
                }
            }

            return sMessage;
        }

        if (sModel === "premiseAddress") {
            this.getView().byId("step2IconTabFilter").setIconColor("Default");
        } else if (sModel === "billingAddress") {
            this.getView().byId("step4IconTabFilter").setIconColor("Default");
        }
        return "";
    },

    _validateSelectProduct: function() {
        var sMessage = "";

        var sProductPath = this.getProperty("product", "/_selectedProductPath");
        var oSelectedProduct = this.getProperty("product", sProductPath);

        if (!oSelectedProduct) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_PRODUCT") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step3IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    },

    _validatePaymentInfo: function() {
        var sMessage = "";

        if (!this.getProperty("combinedPaymentInfo", "/_isEntered")) {
            //Payment info was optional, user didn't enter any, just return
            return sMessage;
        }

        if (this.getProperty("combinedPaymentInfo", "/_isNewAccount")) {
            var oEnteredAccount = this.getProperty("combinedPaymentInfo", "/selection");
            var bIsDataValid = false;
            var bIsCardExpired = false;

            if (this.getProperty("combinedPaymentInfo", "/_isBankAccount")) {
                //Bank Account
                bIsDataValid = !(oEnteredAccount.CountryID === "-1" ||
                    oEnteredAccount.BankID === "-1" ||
                    oEnteredAccount.BankID === "" ||
                    (oEnteredAccount.BankAccountNo === "" && oEnteredAccount.IBAN === ""));
            } else {
                //Card Account
                bIsDataValid = !(oEnteredAccount.CardNumber === "" ||
                    oEnteredAccount.Cardholder === "");

                //check card expiry
                var oExpiry = oEnteredAccount._expiry;
                if (new Date(oExpiry.year, oExpiry.month) < new Date()) {
                    bIsCardExpired = true;
                }
            }

            if (!bIsDataValid) {
                sMessage += this.getText("CHANGE_SERVICE.ERROR_PAYMENT") + "\n";
            }
            if (bIsCardExpired) {
                sMessage += this.getText("CHANGE_SERVICE.ERROR_CARD_EXPIRED") + "\n";
            }

        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step5IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    },

    _validateConfirmation: function() {
        var sMessage = "";

        if (!this.getProperty("confirmation", "/isChecked")) {
            sMessage += this.getText("CHANGE_SERVICE.ERROR_CONFIRMATION") + "\n";
        }

        var sIconColor = sMessage ? "Negative" : "Default";
        this.getView().byId("step6IconTabFilter").setIconColor(sIconColor);

        return sMessage;
    }

    /******************  Validation functions end  ******************/

});
