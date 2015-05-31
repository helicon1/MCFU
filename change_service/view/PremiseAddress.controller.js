sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.PremiseAddress", {

    onInit: function() {

    },

    onPremiseAddressSelected: function() {
        var sSelectionID = this.getProperty("premiseAddress", "/selectionID");
        var oSelectedPremise = this.getProperty("premiseAddress", "/addresses/" + sSelectionID);
        //Store region in temporary property of model - Strange rewriting issues occur when regions reload
        this.setProperty("premiseAddress", "/_tempRegion", oSelectedPremise.AddressInfo.Region);

        if (oSelectedPremise.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.DEFAULT_PREMISE_NAME")) { //Enter new address case
            this.setProperty("premiseAddress", "/_isNewAddress", true);
            var sSelectedCountry = oSelectedPremise.AddressInfo.CountryID;
            if (sSelectedCountry) {
                this.onCountrySelected(undefined, sSelectedCountry);
            }
        } else {
            this.setProperty("premiseAddress", "/_isNewAddress", false);
            this.onCountrySelected(undefined, oSelectedPremise.AddressInfo.CountryID);
        }

        this.setProperty("premiseAddress", "/selection", oSelectedPremise);
    },

    onCountrySelected: function(selectedItem, sCountryIDFromAddress) {
        var oDataProvider = sap.umc.mobile.change_service.model.DataProvider;
        var sCountryID;

        //If called from country control, selectedItem exists and we can get the country from there
        //If called from onPremiseAddressSelected method, sCountryIDFromAddress exists and we can get the country from there
        sCountryID = selectedItem ? selectedItem.getSource().getSelectedKey() : sCountryIDFromAddress;

        //Regions only displayed in NA region, do not load if EMEA
        if (sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica")) {
            oDataProvider.loadRegions(sCountryID, this);
        }
    },

    onRegionsLoaded: function(aRegions) {
        this.getView().getModel("premiseAddress").setProperty("/regions", aRegions);

        //Put the stored region back in the selected premise
        var tempRegion = this.getView().getModel("premiseAddress").getProperty("/_tempRegion");
        this.getView().getModel("premiseAddress").setProperty("/selection/AddressInfo/Region", tempRegion);
    }

});
