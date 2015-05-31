sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.ChangeProductGeneralInfo", {

    onInit: function() {
        this.utils = sap.umc.mobile.change_service.js.utils;
    },

    onPremiseSelected: function() {
        var sSelectionID = this.getProperty("premise", "/selectionID");
        var oSelectedPremise = this.getProperty("premise", "/premises/" + sSelectionID);

        this.setProperty("premise", "/selection", oSelectedPremise);

        //select the first service for new premise, then trigger the selection event
        this.setProperty("premise", "/selectedContractID", "");
        this.onServiceSelected();
    },

    onServiceSelected: function() {
        var sSelectedContractID = this.getProperty("premise", "/selectedContractID");
        var aContracts = this.getProperty("premise", "/selection/ContractItems");
        var oSelectedContract = this.utils.getSelectedContract(aContracts, sSelectedContractID);

        //Check for default contract having been selected
        if (oSelectedContract.Product.Description !== this.getText("CHANGE_SERVICE.SELECT_SERVICE")) {
            var sDivisionID = oSelectedContract.DivisionID;
            var sConsumption = oSelectedContract.Product.ConsumptionMin;

            this.setProperty("product", "/productFilters/divisionID", sDivisionID);
            this.setProperty("product", "/productFilters/consumption", sConsumption);
            sap.ui.getCore().getEventBus().publish("changeService", "updateSelectProduct");
        }
    }

});
