jQuery.sap.declare("sap.umc.mobile.change_service.model.DataProvider");


sap.umc.mobile.change_service.model.DataProvider = {

    utils: sap.umc.mobile.change_service.js.utils,

    onAccountChange: function(sChannelId, sEventId, oContext) {
        sap.ui.getCore().getComponent("ChangeServiceComponent").setDetailViewsDirty();
    },

    loadRequestedService: function(type, id, oDelegate) {
        if (!type || !id)
            return;
        var aServices = [];
        if (type == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE) {
            aServices = this.oPendingContracts;
        } else if (type == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION) {
            aServices = this.oQuotations;
        }
        var oService = jQuery.grep(aServices, function(e) {
            return e.ID == id;
        })[0];
        oDelegate.onServiceLoaded(oService);
    },

    loadRequestedServices: function(type, oDelegate) {
        if (type == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION) {
            if (this.oQuotations && !this.bQuotationDirty) {
                oDelegate.onRequestedServicesLoaded(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION, this.oQuotations);
                return;
            }

            var fnCallBack = jQuery.proxy(function(oData) {
                var aQuotations = [];
                if (oData && oData.results) {
                    aQuotations = oData.results;
                }
                this.bQuotationDirty = false;
                this.oQuotations = this._mapToRequestedServices(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION, aQuotations);
                oDelegate.onRequestedServicesLoaded(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION, this.oQuotations);
            }, this);

            this._readQuotations(fnCallBack);
        } else if (type == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE) {
            if (this.oPendingContracts && !this.bPendingServiceDirty) {
                oDelegate.onRequestedServicesLoaded(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE, this.oPendingContracts);
                return;
            }

            var fnCallBack = jQuery.proxy(function(oData) {
                var aContracts = [];
                if (oData && oData.results) {
                    aContracts = oData.results;
                }
                this.bPendingServiceDirty = false;
                this.oPendingContracts = this._mapToRequestedServices(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE, aContracts);
                oDelegate.onRequestedServicesLoaded(sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE, this.oPendingContracts);
            }, this);

            this._readPendingContracts(fnCallBack);
        }
    },

    loadSuppliers: function(oDelegate) {
        if (this.oSuppliers) {
            oDelegate.onSuppliersLoaded(this.oSuppliers);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            var aSuppliers = [];
            var oEmptySupplier = {
                Name: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.DEFAULT_SUPPLIER_NAME")
            };

            if (oData && oData.results) {
                var i;
                aSuppliers = oData.results;
                aSuppliers.unshift(oEmptySupplier); //Add empty element to beginning of array
                for (i = 0; i < aSuppliers.length; i++) {
                    aSuppliers[i]._ID = i.toString();
                }
            }

            this.oSuppliers = aSuppliers;
            oDelegate.onSuppliersLoaded(aSuppliers);
        }, this);

        this._readSuppliers(fnCallBack);
    },

    loadPremiseAddresses: function(oDelegate) {
        if (this.oPremiseAddresses && !this.bPremiseAddressesIsDirty) {
            oDelegate.onPremiseAddressesLoaded(this.oPremiseAddresses);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            var aAddresses = [];

            var oEmptyAddress = this.utils.getEmptyAddress();
            oEmptyAddress.PremiseID = "-1";
            oEmptyAddress.AddressInfo.ShortForm = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.DEFAULT_PREMISE_NAME");

            if (oData && oData.results) {
                var i;
                aAddresses = oData.results;
                aAddresses.unshift(oEmptyAddress); //Add empty element to beginning of array
                for (i = 0; i < aAddresses.length; i++) {
                    aAddresses[i]._ID = i.toString();
                }
            }

            this.oPremiseAddresses = aAddresses;
            this.bPremiseAddressesIsDirty = false;

            oDelegate.onPremiseAddressesLoaded(aAddresses);
        }, this);

        this._readPremiseAddresses(fnCallBack);
    },

    loadBillingAddresses: function(sContext, oDelegate) {
        if (this.oBillingAddresses && !this.bBillingAddressesIsDirty) {
            //Set the text for the "same as service address" entry. It is always in the first position of the address array
            this.oBillingAddresses[0].AddressInfo.ShortForm = this.utils.getSameAsServiceAddressText(sContext);
            oDelegate.onBillingAddressesLoaded(this.oBillingAddresses);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            var aAddresses = [];

            var oEmptyAddress = this.utils.getEmptyAddress();
            oEmptyAddress.PremiseID = "-1";
            oEmptyAddress.AddressInfo.ShortForm = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.DEFAULT_PREMISE_NAME");

            //Text for "Same as service address" is different depending if the context is start service or transfer service
            var oSameAddress = this.utils.getEmptyAddress();
            oSameAddress.PremiseID = "-2";
            oSameAddress.AddressInfo.ShortForm = this.utils.getSameAsServiceAddressText(sContext);

            if (oData && oData.results) {
                var i;
                aAddresses = oData.results;
                aAddresses.unshift(oEmptyAddress);
                aAddresses.unshift(oSameAddress);
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

    loadCountries: function(oDelegate) {
        if (this.oCountries) {
            oDelegate.onCountriesLoaded(this.oCountries);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            var aCountries = oData.results;

            var defaultCountry = this.utils.getEmptyCountry();
            defaultCountry.Name = " " + sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.DEFAULT_COUNTRY_NAME");

            aCountries.unshift(defaultCountry);

            //Remove countries with blank names
            var i;
            for (i = 0; i < aCountries.length; i++) {
                if (aCountries[i].Name === "") {
                    aCountries.splice(i, 1);
                    i--;
                }
            }

            this.oCountries = aCountries;
            oDelegate.onCountriesLoaded(aCountries);
        }, this);

        this._readCountries(fnCallBack);
    },

    loadRegions: function(sCountryID, oDelegate) {
        //No caching for regions because it depends on the country

        var fnCallback = jQuery.proxy(function(oData) {
            var aRegions = oData.results;

            var defaultRegion = this.utils.getEmptyRegion();
            defaultRegion.Name = " " + sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.DEFAULT_REGION_NAME");

            aRegions.unshift(defaultRegion);
            oDelegate.onRegionsLoaded(aRegions);
        }, this);

        this._readRegions(sCountryID, fnCallback);
    },

    loadProducts: function(sDivisionID, sConsumption, oDelegate) {
        //No caching for products becasue it depends on consumption

        var fnCallBack = jQuery.proxy(function(oData) {
            var aProducts = oData.results;

            this.utils.refreshProductPrices(aProducts, sConsumption);

            oDelegate.onProductsLoaded(aProducts);
        }, this);

        this._readProducts(sDivisionID, sConsumption, fnCallBack);
    },

    loadDivisions: function(oDelegate) {
        if (this.oDivisions) {
            oDelegate.onDivisionsLoaded(this.oDivisions);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            this.oDivisions = oData.results;

            var aDivisions = oData.results;
            oDelegate.onDivisionsLoaded(aDivisions);
        }, this);

        this._readDivisions(fnCallBack);
    },

    loadBankAccounts: function(oDelegate) {
        if (this.oBankAccounts && !this.bIsDirtyBankAccounts) {
            oDelegate.onBankAccountsLoaded(this.oBankAccounts);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {

            var aBankAccounts = oData.results;
            var i;
            for (i = 0; i < aBankAccounts.length; i++) {
                aBankAccounts[i]._displayName = aBankAccounts[i].BankAccountNo;
                if (aBankAccounts[i].Bank.Name) {
                    aBankAccounts[i]._displayName += " - " + aBankAccounts[i].Bank.Name;
                }
            }

            this.oBankAccounts = aBankAccounts;
            this.bIsDirtyBankAccounts = false;
            oDelegate.onBankAccountsLoaded(aBankAccounts);
        }, this);

        this._readBankAccounts(fnCallBack);
    },

    loadCardAccounts: function(oDelegate) {
        if (this.oCardAccounts && !this.bIsDirtyCardAccounts) {
            oDelegate.onCardAccountsLoaded(this.oCardAccounts);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {

            var aCardAccounts = oData.results;
            var i;
            for (i = 0; i < aCardAccounts.length; i++) {
                aCardAccounts[i]._displayName = aCardAccounts[i].CardNumber;
                if (aCardAccounts[i].PaymentCardType.Description) {
                    aCardAccounts[i]._displayName += " - " + aCardAccounts[i].PaymentCardType.Description;
                }

                //Get expiry month and year from ValidTo date
                var sMonth = (aCardAccounts[i].ValidTo.getMonth() + 1).toString();
                var sYear = aCardAccounts[i].ValidTo.getFullYear().toString();
                if (parseInt(sMonth, 10) < 10) {
                    sMonth = "0" + sMonth;
                }
                aCardAccounts[i]._expiry = {
                    month: sMonth,
                    year: sYear
                };
            }

            this.oCardAccounts = aCardAccounts;
            this.bIsDirtyCardAccounts = false;
            oDelegate.onCardAccountsLoaded(aCardAccounts);
        }, this);

        this._readCardAccounts(fnCallBack);
    },

    loadCardAccountTypes: function(oDelegate) {
        if (this.oCardAccountTypes) {
            oDelegate.onCardAccountsTypesLoaded(this.oCardAccountTypes);
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            this.oCardAccountTypes = oData.results;

            var aCardAccountTypes = oData.results;
            oDelegate.onCardAccountsTypesLoaded(aCardAccountTypes);
        }, this);

        this._readCardAccountTypes(fnCallBack);
    },

    loadBankAccountTypes: function(sCountryID, oDelegate) {
        //No caching for bank account types because it depends on the country

        var fnCallback = jQuery.proxy(function(oData) {
            var aBankAccountTypes = oData.results;

            oDelegate.onBankAccountTypesLoaded(aBankAccountTypes);
        }, this);

        this._readBankAccountTypes(sCountryID, fnCallback);
    },

    loadPremisesWithContracts: function(oDelegate) {
        if (this.oSortedPremisesWithContracts && !this.bIsSortedPremisesDirty) {
            oDelegate.onPremisesWithContractsLoaded(this.oSortedPremisesWithContracts);
        } else {
            this._loadContracts(this._loadPremisesWithContractsStep2, oDelegate);
        }
    },

    _loadPremisesWithContractsStep2: function(aContracts, oDelegate) {
        this.iContractsCount = aContracts.length;
        this.oEndableContracts = [];
        var i;
        for (i = 0; i < this.iContractsCount; i++) {
            //Once the last request for endability returns, the function to sort contracts to their premises will be called
            this._getContractEndable(aContracts[i], oDelegate);
        }
    },

    checkAccountHasContract: function(oDelegate) {
        var fnCallback = jQuery.proxy(function(aContracts) {
            var bHasContract = (aContracts.length > 0) ? true : false;

            oDelegate.onCheckAccountHasContractLoaded(bHasContract);
        }, this);

        this._loadContracts(fnCallback, oDelegate);
    },

    _loadContracts: function(fnNextCallback, oDelegate) {
        if (this.oContracts && !this.bIsContractsDirty) {
            jQuery.proxy(fnNextCallback, this, this.oContracts, oDelegate).call();
            return;
        }

        var fnCallBack = jQuery.proxy(function(oData) {
            this.oContracts = oData.results;
            this.bIsContractsDirty = false;

            jQuery.proxy(fnNextCallback, this, oData.results, oDelegate).call();
        }, this);

        this._readContracts(fnCallBack);
    },

    _getContractEndable: function(oContract, oDelegate) {
        var fnCallBack = jQuery.proxy(function(oResults, oResponse, oContext) {
            var aContracts, aEndableContracts;
            if (oResults.CheckMoveOut.Result === true) {
                //Find which contract was checked
                aContracts = this.oContracts;
                aEndableContracts = this.oEndableContracts;

                var iIndex = oResponse.requestUri.indexOf("ContractID");
                var sContractID = oResponse.requestUri.slice(iIndex + 12);
                //Chop off characters after the contract number and convert back to string
                sContractID = parseInt(sContractID, 10).toString();

                //Find the contract and add it to the array of endable contracts
                var oEndableContract;
                var i;
                for (i = 0; i < aContracts.length; i++) {
                    if (aContracts[i].ContractID === sContractID) {
                        oEndableContract = jQuery.extend(true, {}, aContracts[i]);
                        aEndableContracts.push(oEndableContract);
                        break;
                    }
                }
            }

            this.iContractsCount--;
            if (this.iContractsCount === 0) {
                this._sortContractsToPremises(this.oEndableContracts, oDelegate);
            }
        }, this);

        this._readContractEndable(oContract.ContractID, fnCallBack);
    },

    _sortContractsToPremises: function(aContracts, oDelegate) {
        var i, j, iPremiseIndex, bPremiseFound, aPremises, oContractForPremise, oPremiseWithContracts;

        aPremises = [];
        iPremiseIndex = 1;
        for (i = 0; i < aContracts.length; i++) {
            bPremiseFound = false;
            //Loop through premises already discovered to attach contracts to the corresponding premises
            for (j = 0; j < aPremises.length; j++) {
                //Premise has already been added
                if (aPremises[j].PremiseID === aContracts[i].Premise.PremiseID) {
                    oContractForPremise = jQuery.extend(true, {}, sap.umc.mobile.app.js.utils.deleteLocalProperties(aContracts[i]));
                    oContractForPremise._isChecked = false;
                    delete oContractForPremise.Premise; //Delete the premise from the contract to avoid a circular object

                    aPremises[j].ContractItems.push(oContractForPremise);
                    bPremiseFound = true;
                    break;
                }
            }

            //Premise not added yet, add new premise and attach contract info
            if (bPremiseFound === false) {
                oPremiseWithContracts = aContracts[i].Premise;
                oContractForPremise = jQuery.extend(true, {}, sap.umc.mobile.app.js.utils.deleteLocalProperties(aContracts[i]));
                oContractForPremise._isChecked = false;
                delete oContractForPremise.Premise; //Delete the premise from the contract to avoid a circular object

                oPremiseWithContracts.ContractItems = [oContractForPremise];
                oPremiseWithContracts._ID = iPremiseIndex;
                iPremiseIndex++;
                aPremises.push(oPremiseWithContracts);
            }
        }

        //Add default selection
        var oDefaultPremise = this.utils.getEmptyPremiseWithContract();
        oDefaultPremise._ID = 0;
        oDefaultPremise.AddressInfo.ShortForm = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.SELECT_PREMISE");
        oDefaultPremise.ContractItems[0].Product.Description = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.SELECT_SERVICE");

        aPremises.unshift(oDefaultPremise);

        this.oSortedPremisesWithContracts = aPremises;
        this.bIsSortedPremisesDirty = false;

        oDelegate.onPremisesWithContractsLoaded(aPremises);
    },

    createPaymentCard: function(oPaymentCardData, oDelegate) {
        var fnCallBack = jQuery.proxy(function(oData) {
            this.bIsDirtyCardAccounts = true;

            oDelegate.onPaymentCardCreated(oData);
        }, this);

        oPaymentCardData.ValidTo = "\\/Date(" + Date.UTC(oPaymentCardData._expiry.year, oPaymentCardData._expiry.month) + ")\\/";
        oPaymentCardData = sap.umc.mobile.app.js.utils.deleteLocalProperties(oPaymentCardData);
        delete oPaymentCardData.PaymentCardID;
        delete oPaymentCardData._expiry;

        oPaymentCardData.AccountID = this.getAccountId();
        oPaymentCardData.StandardFlag = true;
        this._createPaymentCard(oPaymentCardData, fnCallBack);
    },

    createBankAccount: function(oBankAccountData, oDelegate) {
        var fnCallBack = jQuery.proxy(function(oData) {
            this.bIsDirtyBankAccounts = true;

            oDelegate.onBankAccountCreated(oData);
        }, this);

        oBankAccountData = sap.umc.mobile.app.js.utils.deleteLocalProperties(oBankAccountData);

        oBankAccountData.AccountID = this.getAccountId();
        delete oBankAccountData.BankAccountID;
        this._createBankAccount(oBankAccountData, fnCallBack);
    },

    findPremiseByAddress: function(oAddressInfo, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            oDelegate.onFoundPremiseByAddress(oData);
        }, this);

        var aParameters = [];
        aParameters.push("CountryID='" + oAddressInfo.CountryID + "'");
        aParameters.push("PostalCode='" + oAddressInfo.PostalCode + "'");
        aParameters.push("Region='" + oAddressInfo.Region + "'");
        aParameters.push("City='" + oAddressInfo.City + "'");
        aParameters.push("HouseNo='" + oAddressInfo.HouseNo + "'");
        aParameters.push("Street='" + oAddressInfo.Street + "'");
        aParameters.push("RoomNo='" + oAddressInfo.RoomNo + "'");

        this._findPremiseByAddress(aParameters, fnCallback);
    },

    checkPODExists: function(sPremiseID, sDivisionID, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            oDelegate.onCheckedPODExists(oData);
        }, this);

        this._checkPODExistsForPremise(sPremiseID, sDivisionID, fnCallback);
    },

    createPremisePOD: function(bIsDeepInsert, oPremise, sDivisionID, sExternalID, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            oDelegate.onPremisePODCreated(oData);
        }, this);

        var oPODData = {};
        oPODData.DivisionID = sDivisionID;
        oPODData.ExternalID = sExternalID ? sExternalID : "";

        if (!bIsDeepInsert) { // already found CO and Premise but not POD - not deep insert
            oPODData.PremiseID = oPremise.PremiseID;
        } else { // no CO, no premise, no POD 
            //or CO found but not Premise and POD
            oPODData.PremiseID = "";
            oPODData.Premise = {
                PremiseID: "",
                PremiseTypeID: "0001",
                AddressInfo: {
                    City: oPremise.AddressInfo.City,
                    PostalCode: oPremise.AddressInfo.PostalCode,
                    Street: oPremise.AddressInfo.Street,
                    HouseNo: oPremise.AddressInfo.HouseNo,
                    RoomNo: oPremise.AddressInfo.RoomNo,
                    CountryID: oPremise.AddressInfo.CountryID,
                    Region: oPremise.AddressInfo.Region,
                    StandardFlag: "",
                    District: "",
                    POBoxPostalCode: "",
                    POBox: "",
                    Building: "",
                    Floor: "",
                    TimeZone: "",
                    TaxJurisdictionCode: "",
                    LanguageID: ""
                }
            };
        }

        this._createPOD(oPODData, fnCallback);
    },

    loadBusinessAgreements: function(oDelegate) {
        if (this.oBusinessAgreements && !this.isDirtyBusinessAgreements) {
            oDelegate.onBusinessAgreementsLoaded(this.oBusinessAgreements);
            return;
        }

        var fnCallback = jQuery.proxy(function(oData) {
            var aBuags = oData.results;
            this.oBusinessAgreements = oData.results;
            this.isDirtyBusinessAgreements = false;

            oDelegate.onBusinessAgreementsLoaded(aBuags);
        }, this);

        this._readBusinessAgreements(fnCallback);
    },

    createNewBuag: function(oCombinedPaymentInfo, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            this.isDirtyBusinessAgreements = true;

            oDelegate.onNewBuagCreated(oData);
        }, this);

        var oNewBuag = {
            AccountID: this.getAccountId(),
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.NEW_BUAG_DESCRIPTION"),
            BillToAccountID: this.getAccountId()
        };

        if (oCombinedPaymentInfo._isEntered && oCombinedPaymentInfo._isCardAccount) {
            oNewBuag.IncomingPaymentPaymentCardID = oCombinedPaymentInfo.selection.PaymentCardID;
            oNewBuag.OutgoingPaymentPaymentCardID = oCombinedPaymentInfo.selection.PaymentCardID;
            oNewBuag.IncomingPaymentMethodID = "K";
            oNewBuag.OutgoingPaymentMethodID1 = "C";
        } else if (oCombinedPaymentInfo._isEntered && oCombinedPaymentInfo._isBankAccount) {
            oNewBuag.IncomingPaymentBankAccountID = oCombinedPaymentInfo.selection.BankAccountID;
            oNewBuag.OutgoingPaymentBankAccountID = oCombinedPaymentInfo.selection.BankAccountID;
            oNewBuag.IncomingPaymentMethodID = "A";
            oNewBuag.OutgoingPaymentMethodID1 = "U";
        }

        this._createBusinessAgreement(oNewBuag, fnCallback);
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

    startService: function(bCreateContract, oBundledData, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            this.bIsContractsDirty = true;
            this.bIsSortedPremisesDirty = true;
            this.bPendingServiceDirty = true;
            this.bQuotationDirty = true;
            sap.ui.getCore().getEventBus().publish("pendingServiceChanged", "changeServiceView");

            if (oBundledData.aPOD.length > 1) {
                //More PODs exist for the premise, create additinal contracts for them under the same header
                var sHeaderGUID = oData.__batchResponses[0].__changeResponses[2].data.ContractHeaderGUID;
                this._startServiceSecondBatch(oBundledData, sHeaderGUID, oDelegate);
            } else {
                oDelegate.onStartServiceSuccess(oData);
            }
        }, this);

        //Create first batch operations
        var aBatchOperations = [];
        aBatchOperations.push(this._createUpdateBuagOperation(oBundledData));
        aBatchOperations.push(this._createNewStartServiceIROperation(oBundledData));

        if (bCreateContract) {
            aBatchOperations.push(this._createNewContractOperation(oBundledData.aPOD[0], oBundledData));
        } else {
            //Premise/POD was just created - quotation instead of contract
            aBatchOperations.push(this._createNewQuotationOperation(oBundledData.aPOD[0], oBundledData));
        }

        //Submit
        this._createContractInBatch(aBatchOperations, fnCallback);
    },

    _startServiceSecondBatch: function(oBundledData, sHeaderGUID, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            oDelegate.onStartServiceSuccess(oData);
        }, this);

        var aBatchOperations = [];
        var i;
        for (i = 1; i < oBundledData.aPOD.length; i++) {
            aBatchOperations.push(this._createNewContractOperation(oBundledData.aPOD[i], oBundledData, sHeaderGUID));
        }

        this._createContractInBatch(aBatchOperations, fnCallback);
    },

    _createUpdateBuagOperation: function(oBundledData) {
        //Update payment and billing address information of the business agreement
        var oBuag = oBundledData.businessAgreement.selection;

        //Delete objects within the business agreement that shouldn't be submitted
        delete oBuag.ContractItems;
        delete oBuag.Country;
        delete oBuag.BillToAccount;
        delete oBuag.OutgoingPaymentCard;
        delete oBuag.OutgoingBankAccount;
        delete oBuag.IncomingPaymentCard;
        delete oBuag.IncomingBankAccount;
        delete oBuag.BillToAccountAddress;
        delete oBuag.IncomingPaymentMethod;
        delete oBuag.OutgoingPaymentMethod1;
        delete oBuag.OutgoingPaymentMethod2;
        delete oBuag.OutgoingPaymentMethod3;
        delete oBuag.OutgoingPaymentMethod4;
        delete oBuag.OutgoingPaymentMethod5;
        delete oBuag.__metadata;

        //Update payment information
        if (oBundledData.combinedPaymentInfo._isEntered) {
            if (oBundledData.combinedPaymentInfo._isCardAccount) {
                //Card account information
                oBuag.IncomingPaymentBankAccountID = "";
                oBuag.OutgoingPaymentBankAccountID = "";
                oBuag.IncomingPaymentPaymentCardID = oBundledData.combinedPaymentInfo.selection.PaymentCardID;
                oBuag.OutgoingPaymentPaymentCardID = oBundledData.combinedPaymentInfo.selection.PaymentCardID;
                oBuag.IncomingPaymentMethodID = "K";
                oBuag.OutgoingPaymentMethodID1 = "C";
            } else {
                //Bank account information 
                oBuag.IncomingPaymentBankAccountID = oBundledData.combinedPaymentInfo.selection.BankAccountID;
                oBuag.OutgoingPaymentBankAccountID = oBundledData.combinedPaymentInfo.selection.BankAccountID;
                oBuag.IncomingPaymentPaymentCardID = "";
                oBuag.OutgoingPaymentPaymentCardID = "";
                oBuag.IncomingPaymentMethodID = "A";
                oBuag.OutgoingPaymentMethodID1 = "U";
            }
        } else {
            //Remove payment information (user did not choose to set up auto pay)
            oBuag.IncomingPaymentBankAccountID = "";
            oBuag.OutgoingPaymentBankAccountID = "";
            oBuag.IncomingPaymentPaymentCardID = "";
            oBuag.OutgoingPaymentPaymentCardID = "";
            oBuag.IncomingPaymentMethodID = "";
            oBuag.OutgoingPaymentMethodID1 = "";
        }

        //Update billing address information
        if (oBundledData.billingAddress._isSameAsPremise) {
            oBuag.AccountAddressID = oBundledData.premiseAddress.selection.AddressID;
        } else {
            oBuag.AccountAddressID = oBundledData.billingAddress.selection.AddressID;
        }

        return this.CRM.createBatchOperation("BusinessAgreements('" + oBuag.BusinessAgreementID + "')", sap.umc.mobile.CONSTANTS.HTTP_PUT, oBuag,
            null);
    },

    _createNewStartServiceIROperation: function(oBundledData) {
        var oIRData = {
            Note: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.NEW_IR_NOTE"),
            DateFrom: oBundledData.startDate.selectedDate.toJSON().substring(0, 10) + "T00:00:00",
            AccountID: this.getAccountId(),
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.NEW_IR_DESCRIPTION"),
            Priority: "5"
        };

        return this.CRM.createBatchOperation("InteractionRecords", sap.umc.mobile.CONSTANTS.HTTP_POST, oIRData, null);
    },

    _createNewContractOperation: function(oPOD, oBundledData, sHeaderGUID) {
        var oContractData = {
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_DESCRIPTION"),
            ContractStartDate: oBundledData.startDate.selectedDate.toJSON().substring(0, 10) + "T00:00:00",
            AccountID: this.getAccountId(),
            BusinessAgreementID: oBundledData.businessAgreement.selection.BusinessAgreementID,
            ProductID: oBundledData.oProduct.ProductID,
            DivisionID: oBundledData.oProduct.DivisionID,
            PremiseID: oPOD.PremiseID,
            PointOfDeliveryGUID: oPOD.PointOfDeliveryID
        };

        if (sHeaderGUID) {
            oContractData.ContractHeaderGUID = sHeaderGUID;
        }

        if (oBundledData.currentSupplier.isChecked) {
            var sSupplierID = oBundledData.currentSupplier.selectionID;
            oContractData.SwitchServiceFlag = "1";
            oContractData.FormerServiceProviderID = oBundledData.currentSupplier.suppliers[sSupplierID].ServiceProviderID;
        }

        if (oBundledData.deregulation.meterNumber !== "") {
            oContractData.MeterNumber = oBundledData.deregulation.meterNumber;
        }

        return this.CRM.createBatchOperation("ContractItems", sap.umc.mobile.CONSTANTS.HTTP_POST, oContractData, null);
    },

    _createNewQuotationOperation: function(oPOD, oBundledData) {
        var oQuotationData = {
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_DESCRIPTION"),
            QuotationStartDate: oBundledData.startDate.selectedDate.toJSON().substring(0, 10) + "T00:00:00",
            AccountID: this.getAccountId(),
            BusinessAgreementID: oBundledData.businessAgreement.selection.BusinessAgreementID,
            ProductID: oBundledData.oProduct.ProductID,
            DivisionID: oBundledData.oProduct.DivisionID,
            PremiseID: oPOD.PremiseID,
            PointOfDeliveryGUID: oPOD.PointOfDeliveryID
        };

        if (oBundledData.currentSupplier.isChecked) {
            var sSupplierID = oBundledData.currentSupplier.selectionID;
            oQuotationData.SwitchServiceFlag = "1";
            oQuotationData.FormerServiceProviderID = oBundledData.currentSupplier.suppliers[sSupplierID].ServiceProviderID;
        }

        if (oBundledData.deregulation.meterNumber !== "") {
            oQuotationData.MeterNumber = oBundledData.deregulation.meterNumber;
        }

        return this.CRM.createBatchOperation("QuotationItems", sap.umc.mobile.CONSTANTS.HTTP_POST, oQuotationData, null);
    },

    endSelectedContracts: function(oBundledData, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            this.bIsSortedPremisesDirty = true;
            this.bIsContractsDirty = true;
            this.bPendingServiceDirty = true;
            this.bQuotationDirty = true;
            sap.ui.getCore().getEventBus().publish("pendingServiceChanged", "changeServiceView");
            oDelegate.onEndContractSuccess(oData);
        }, this);

        var aBatchOperations = [];
        var aContracts = oBundledData.premise.selection.ContractItems;
        var i;
        for (i = 0; i < aContracts.length; i++) {
            if (aContracts[i]._isChecked) {
                aBatchOperations.push(this._createEndContractOperation(aContracts[i], oBundledData.endDate.selectedDate));
            }
        }
        aBatchOperations.push(this._createEndServiceIROperation());

        this._endContractsInBatch(aBatchOperations, fnCallback);
    },

    _createEndContractOperation: function(oContract, oEndDate) {
        var sContractID = oContract.ContractID;
        var sEndDate = oEndDate.toJSON().substring(0, 10) + "T00:00:00";

        var sEndContractPath = "MoveOut?MoveOutDate=datetime'" + sEndDate + "'&ContractID='" + sContractID + "'";

        return this.CRM.createBatchOperation(sEndContractPath, sap.umc.mobile.CONSTANTS.HTTP_POST, null, null);
    },

    _createEndServiceIROperation: function() {
        var oIRData = {
            AccountID: this.getAccountId(),
            Note: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.END_CONTRACT_IR_NOTE"),
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.END_CONTRACT_IR_DESCRIPTION")
        };

        return this.CRM.createBatchOperation("InteractionRecords", sap.umc.mobile.CONSTANTS.HTTP_POST, oIRData, null);
    },

    transferService: function(oBundledData, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            this.bIsSortedPremisesDirty = true;
            this.bIsContractsDirty = true;
            this.bPendingServiceDirty = true;
            this.bQuotationDirty = true;
            sap.ui.getCore().getEventBus().publish("pendingServiceChanged", "changeServiceView");

            oDelegate.onTransferServiceSuccess(oData);
        }, this);

        var aContracts = oBundledData.premise.selection.ContractItems;
        var aProcessedBuags = [];

        var aBatchOperations = [];
        aBatchOperations.push(this._createNewTransferServiceIROperation());
        var i;
        for (i = 0; i < aContracts.length; i++) {
            //End old contract and create new contract at new premise
            aBatchOperations.push(this._createEndContractOperation(aContracts[i], oBundledData.date.endDate));

            if (aContracts[i]._createContract) {
                aBatchOperations.push(this._createTransferContractOperation(aContracts[i], oBundledData));
            } else {
                //Create quotation - if a premise has been newly created (aPOD is returned from creation and is only a single object)
                aBatchOperations.push(this._createTransferQuotationOperation(aContracts[i], oBundledData));
            }

            //If this buag has not been seen yet, update its billing address
            if (aProcessedBuags.indexOf(aContracts[i].BusinessAgreementID) < 0) {
                aBatchOperations.push(this._createUpdateBuagBillingAddressOperation(aContracts[i].BusinessAgreementID, oBundledData));
                aProcessedBuags.push(aContracts[i].BusinessAgreementID);
            }
        }

        this._transferContractsInBatch(aBatchOperations, fnCallback);
    },

    _createUpdateBuagBillingAddressOperation: function(sBuagID, oBundledData) {
        //Find the business agreement
        var aBuags = oBundledData.businessAgreement.buags;
        var oBuag;
        var i;
        for (i = 0; i < aBuags.length; i++) {
            if (aBuags[i].BusinessAgreementID === sBuagID) {
                oBuag = aBuags[i];
                break;
            }
        }

        //Delete objects within the business agreement that shouldn't be submitted
        delete oBuag.ContractItems;
        delete oBuag.BillToAccount;
        delete oBuag.OutgoingPaymentCard;
        delete oBuag.OutgoingBankAccount;
        delete oBuag.IncomingPaymentCard;
        delete oBuag.IncomingBankAccount;
        delete oBuag.BillToAccountAddress;
        delete oBuag.IncomingPaymentMethod;
        delete oBuag.OutgoingPaymentMethod1;
        delete oBuag.OutgoingPaymentMethod2;
        delete oBuag.OutgoingPaymentMethod3;
        delete oBuag.OutgoingPaymentMethod4;
        delete oBuag.OutgoingPaymentMethod5;
        delete oBuag.__metadata;

        //Update billing address information
        var bIsSameAsPremise = oBundledData.billingAddress._isSameAsPremise;
        oBuag.AccountAddressID = bIsSameAsPremise ? oBundledData.premiseAddress.selection.AddressID : oBundledData.billingAddress.selection.AddressID;

        return this.CRM.createBatchOperation("BusinessAgreements('" + oBuag.BusinessAgreementID + "')", sap.umc.mobile.CONSTANTS.HTTP_PUT, oBuag,
            null);
    },

    _createNewTransferServiceIROperation: function() {
        var oIRData = {
            AccountID: this.getAccountId(),
            Note: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.TRANSFER_SERVICE_IR_NOTE"),
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.TRANSFER_SERVICE_IR_DESCRIPTION")
        };

        return this.CRM.createBatchOperation("InteractionRecords", sap.umc.mobile.CONSTANTS.HTTP_POST, oIRData, null);
    },

    _createTransferContractOperation: function(oOldContract, oBundledData) {
        var oContractData = {
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_DESCRIPTION"),
            ContractStartDate: oBundledData.date.startDate.toJSON().substring(0, 10) + "T00:00:00",
            AccountID: this.getAccountId(),
            BusinessAgreementID: oOldContract.BusinessAgreementID,
            ProductID: oOldContract.ProductID,
            PremiseID: oBundledData.premiseAddress.selection.PremiseID,
            DivisionID: oOldContract.DivisionID,
            PointOfDeliveryGUID: oOldContract._pod.PointOfDeliveryID
        };

        if (oBundledData.deregulation.meterNumber !== "") {
            oContractData.MeterNumber = oBundledData.deregulation.meterNumber;
        }

        return this.CRM.createBatchOperation("ContractItems", sap.umc.mobile.CONSTANTS.HTTP_POST, oContractData, null);
    },

    _createTransferQuotationOperation: function(oOldContract, oBundledData) {
        var oQuotationData = {
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_DESCRIPTION"),
            QuotationStartDate: oBundledData.date.startDate.toJSON().substring(0, 10) + "T00:00:00",
            AccountID: this.getAccountId(),
            BusinessAgreementID: oOldContract.BusinessAgreementID,
            ProductID: oOldContract.ProductID,
            DivisionID: oOldContract.DivisionID,
            PremiseID: oBundledData.premiseAddress.selection.PremiseID,
            PointOfDeliveryGUID: oOldContract._pod.PointOfDeliveryID
        };

        if (oBundledData.deregulation.meterNumber !== "") {
            oQuotationData.MeterNumber = oBundledData.deregulation.meterNumber;
        }

        return this.CRM.createBatchOperation("QuotationItems", sap.umc.mobile.CONSTANTS.HTTP_POST, oQuotationData, null);
    },

    changeProduct: function(oBundledData, oDelegate) {
        var fnCallback = jQuery.proxy(function(oData) {
            this.bIsSortedPremisesDirty = true;
            this.bIsContractsDirty = true;
            this.bPendingServiceDirty = true;
            this.bQuotationDirty = true;
            sap.ui.getCore().getEventBus().publish("pendingServiceChanged", "changeServiceView");
            oDelegate.onChangeProductSuccess(oData);
        }, this);

        var aBatchOperations = [];

        aBatchOperations.push(this._createNewChangeProductIROperation());
        aBatchOperations.push(this._createChangeProductOperation(oBundledData));

        this._changeProductInBatch(aBatchOperations, fnCallback);
    },

    _createNewChangeProductIROperation: function() {
        var oIRData = {
            AccountID: this.getAccountId(),
            Note: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CHANGE_PRODUCT_IR_NOTE"),
            Description: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CHANGE_PRODUCT_IR_DESCRIPTION")
        };

        return this.CRM.createBatchOperation("InteractionRecords", sap.umc.mobile.CONSTANTS.HTTP_POST, oIRData, null);
    },

    _createChangeProductOperation: function(oBundledData) {
        var sContractID = oBundledData.premise.selectedContractID;
        var sDate = oBundledData.date.selectedDate.toJSON().substring(0, 10) + "T00:00:00";
        var sNewProductID = oBundledData.product.ProductID;

        var sPath = "ChangeProduct?ContractID='" + sContractID + "'&ChangeProductDate=datetime'" + sDate + "'&NewProductID='" + sNewProductID + "'";

        return this.CRM.createBatchOperation(sPath, sap.umc.mobile.CONSTANTS.HTTP_POST, null, null);
    }

}

