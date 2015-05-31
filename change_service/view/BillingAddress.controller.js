sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.BillingAddress", {

    onInit: function() {
        sap.ui.getCore().getEventBus().subscribe("changeService", "updateBillingAddressView", $.proxy(function() {
            this.onBillingAddressSelected();
        }, this));
    },

    onBillingAddressSelected: function() {
        var sSelectionID = this.getProperty("billingAddress", "/selectionID");
        var oSelectedBilling = this.getProperty("billingAddress", "/addresses/" + sSelectionID);
        //Store region in temporary property of model - Strange rewriting issues sometimes occur when regions reload
        this.setProperty("billingAddress", "/_tempRegion", oSelectedBilling.AddressInfo.Region);

        if (oSelectedBilling.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.DEFAULT_PREMISE_NAME")) { //Enter new address case
            this.setProperty("billingAddress", "/_isNewAddress", true);
            this.setProperty("billingAddress", "/_isSameAsPremise", false);
            var sSelectedCountry = oSelectedBilling.AddressInfo.CountryID;
            if (sSelectedCountry) {
                this.onCountrySelected(undefined, sSelectedCountry);
            }
        } else if (oSelectedBilling.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.BILLING_SAME_ADDRESS") || oSelectedBilling.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.BILLING_SAME_NEW_ADDRESS")) {
            oSelectedBilling = this.getProperty("premiseAddress", "/selection");
            this.setProperty("billingAddress", "/_tempRegion", oSelectedBilling.AddressInfo.Region);

            this.setProperty("billingAddress", "/_isNewAddress", false);
            this.setProperty("billingAddress", "/_isSameAsPremise", true);
            this.onCountrySelected(undefined, oSelectedBilling.AddressInfo.CountryID);
        } else {
            this.setProperty("billingAddress", "/_isNewAddress", false);
            this.setProperty("billingAddress", "/_isSameAsPremise", false);
            this.onCountrySelected(undefined, oSelectedBilling.AddressInfo.CountryID);
        }

        this.setProperty("billingAddress", "/selection", oSelectedBilling);
    },

    onCountrySelected: function(selectedItem, sCountryIDFromAddress) {
        var oDataProvider = sap.umc.mobile.change_service.model.DataProvider;
        var sCountryID;

        //If called from country control, selectedItem exists and we can get the country from there
        //If called from onBillingAddressSelected method, sCountryIDFromAddress exists and we can get the country from there
        sCountryID = selectedItem ? selectedItem.getSource().getSelectedKey() : sCountryIDFromAddress;

        //Regions only displayed in NA region, do not load if EMEA
        if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
            oDataProvider.loadRegions(sCountryID, this);
        }
    },

    onRegionsLoaded: function(aRegions) {
        this.getView().getModel("billingAddress").setProperty("/regions", aRegions);

        //Put the stored region back in the selected premise
        var tempRegion = this.getView().getModel("billingAddress").getProperty("/_tempRegion");
        this.getView().getModel("billingAddress").setProperty("/selection/AddressInfo/Region", tempRegion);
    }

});
