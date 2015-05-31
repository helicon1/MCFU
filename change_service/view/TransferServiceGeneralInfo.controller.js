sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.TransferServiceGeneralInfo", {

    onInit: function() {

    },

    onPremiseSelected: function() {
        var sSelectionID = this.getProperty("premise", "/selectionID");
        var oSelectedPremise = this.getProperty("premise", "/premises/" + sSelectionID);

        this.setProperty("premise", "/selection", oSelectedPremise);
    }

});
