jQuery.sap.declare("sap.umc.mobile.change_service.js.utils");


sap.umc.mobile.change_service.js.utils = jQuery.extend(sap.umc.mobile.app.js.utils, {

    refreshProductPrices: function(aProducts, sConsumption) {
        var iConsumption = parseInt(this.getPlainConsumption(sConsumption), 10);

        if (aProducts && aProducts.length) {
            var oResult;
            var i;
            for (i = 0; i < aProducts.length; i++) {
                aProducts[i]._EstimatedCost = this._calculateProductPrice(aProducts[i], iConsumption);

                //If IconURL is not a sap-icon, change to default dependant on division
                if (aProducts[i].IconURL.indexOf("sap-icon://") === -1) {
                    switch (aProducts[i].DivisionID) {
                        case sap.umc.mobile.CONSTANTS.DIVISIONS.ELECTRICITY:
                            aProducts[i].IconURL = "sap-icon://lightbulb";
                            break;
                        case sap.umc.mobile.CONSTANTS.DIVISIONS.GAS:
                            aProducts[i].IconURL = "sap-icon://heating-cooling";
                            break;
                        case sap.umc.mobile.CONSTANTS.DIVISIONS.WATER:
                            aProducts[i].IconURL = "sap-icon://pool";
                            break;
                        default:
                            aProducts[i].IconURL = "sap-icon://product";
                    }
                }
            }
        }

        return aProducts;
    },

    _calculateProductPrice: function(oProduct, iConsumption) {
        var dBase, dUnitRate, dCurrency, dEstimatedCost, dQuantity;

        // Estimated Cost = (Base Amount x 12) + (Unit Rate x Consumption)
        if (oProduct.UtilitiesProductPrices.results.length >= 1) {
            if (oProduct.UtilitiesProductPrices.results[0]) {
                dBase = parseFloat(oProduct.UtilitiesProductPrices.results[0].Price);
                dCurrency = oProduct.UtilitiesProductPrices.results[0].Currency;
            }
            if (oProduct.UtilitiesProductPrices.results[1]) {
                dUnitRate = parseFloat(oProduct.UtilitiesProductPrices.results[1].Price);
                dQuantity = parseFloat(oProduct.UtilitiesProductPrices.results[1].Quantity); // Minimum
            }

            if (dBase !== undefined && dUnitRate !== undefined) {
                dEstimatedCost = (dBase * 12) + (dUnitRate / dQuantity * iConsumption);
            } else if (dBase !== undefined) {
                dEstimatedCost = (dBase * 12);
            }

            dEstimatedCost = sap.umc.mobile.app.js.formatters.amountWithCurrencyFormatter(dEstimatedCost, dCurrency) + "/" + sap.ui.getCore().getModel("i18n").getProperty("APP.YEAR");
        } else {
            dEstimatedCost = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.PRODUCT_PRICE_NOT_AVAILABLE");
        }

        return sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.ESTIMATED_COST") + " " + dEstimatedCost;
    },

    getPlainConsumption: function(sFormattedConsumption) {
        var sConsumption = sFormattedConsumption.replace(/^(0+)/i, ''); //Remove Leading zeroes
        sConsumption = sConsumption.replace(/(m3|\D)/gi, ''); //Remove Non-digit characters and digits in units (m3)

        return sConsumption !== "" ? sConsumption : "0";
    },

    getSameAsServiceAddressText: function(sContext) {
        //Text for "Same as service address" is different depending if the user is in start service or transfer service view
        var sSameAddressText = "";
        if (sContext === sap.umc.mobile.CONSTANTS.CHANGE_SERVICE_CONTEXT.START_SERVICE) {
            sSameAddressText = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.BILLING_SAME_ADDRESS");
        } else if (sContext === sap.umc.mobile.CONSTANTS.CHANGE_SERVICE_CONTEXT.TRANSFER_SERVICE) {
            sSameAddressText = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.BILLING_SAME_NEW_ADDRESS");
        }

        return sSameAddressText;
    },

    getEmptyAddress: function() {
        var oEmptyAddress = {
            PremiseID: "",
            AddressInfo: {
                ShortForm: "",
                HouseNo: "",
                Street: "",
                RoomNo: "",
                City: "",
                CountryID: "-1",
                Region: "",
                PostalCode: ""
            }
        };

        if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
            oEmptyAddress.Region = "-1";
        }

        return oEmptyAddress;
    },

    getEmptyCountry: function() {
        return {
            CountryID: "-1",
            Name: ""
        };
    },

    getEmptyRegion: function() {
        var oEmptyRegion = {
            RegionID: "",
            Name: ""
        };

        if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
            oEmptyRegion.RegionID = "-1";
        }

        return oEmptyRegion;
    },

    getEmptyBankAccount: function() {
        return {
            AccountHolder: "",
            BankAccountName: "",
            BankAccountID: "-1",
            BankID: "-1",
            BankAccountNo: "",
            CountryID: "-1",
            _displayName: ""
        };
    },

    getEmptyCardAccount: function() {
        return {
            CardNumber: "",
            Cardholder: "",
            PaymentCardID: "-1",
            PaymentCardTypeID: "0001",
            Description: "",
            _expiry: {
                month: "01",
                year: new Date().getFullYear().toString()
            },
            _displayName: ""
        };
    },

    getEmptyPremiseWithContract: function() {
        return {
            ContractItems: [{
                Product: {
                    Description: ""
                }
            }],
            AddressInfo: {
                ShortForm: ""
            },
            _ID: ""
        };
    },

    getDefaultRegionArray: function() {
        if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
            return [{
                RegionID: "-1",
                Name: sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.DEFAULT_REGION_NAME")
            }];
        } else {
            return [];
        }
    },

    getSelectedContract: function(aContracts, sSelectedContractID) {
        var oSelectedContract;

        if (sSelectedContractID === "") {
            //Default selection of the first contract
            oSelectedContract = aContracts[0];
        } else {
            var i;
            for (i = 0; i < aContracts.length; i++) {
                if (aContracts[i].ContractID === sSelectedContractID) {
                    oSelectedContract = aContracts[i];
                    break;
                }
            }
        }

        return oSelectedContract;
    },

    getAddressShortForm: function(oAddress) {
        var sAddressShortForm = "";

        if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
            // North America format
            sAddressShortForm += oAddress.AddressInfo.RoomNo;
            if (sAddressShortForm !== "") {
                sAddressShortForm += "-";
            }
            sAddressShortForm += oAddress.AddressInfo.HouseNo;
            sAddressShortForm += " ";
            sAddressShortForm += oAddress.AddressInfo.Street;
            sAddressShortForm += " / ";
            sAddressShortForm += oAddress.AddressInfo.City;
            sAddressShortForm += " ";
            sAddressShortForm += oAddress.AddressInfo.PostalCode;
        } else {
            //Europe Format
            sAddressShortForm += oAddress.AddressInfo.Street;
            sAddressShortForm += " ";
            sAddressShortForm += oAddress.AddressInfo.HouseNo;
            sAddressShortForm += " / ";
            sAddressShortForm += oAddress.AddressInfo.PostalCode;
            sAddressShortForm += " ";
            sAddressShortForm += oAddress.AddressInfo.City;
        }

        return sAddressShortForm;
    }

});
