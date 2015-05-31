sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.SelectService", {

    onInit: function() {
        sap.ui.getCore().getEventBus().subscribe("endService", "updateSelectServiceView", $.proxy(function() {
            this._refreshSelectServiceData();
        }, this));
    },

    _refreshSelectServiceData: function() {
        var oSelectServiceVL = this.getView().byId("selectServiceVerticalLayout");

        oSelectServiceVL.removeAllContent();

        var oSelectedPremise = this.getProperty("premise", "/selection");
        var oCurrentContract, oSwitch, oLabel;
        var i;
        for (i = 0; i < oSelectedPremise.ContractItems.length; i++) {

            oCurrentContract = oSelectedPremise.ContractItems[i];

            if (oCurrentContract === undefined || oCurrentContract.Product.Description === this.getText("CHANGE_SERVICE.SELECT_SERVICE")) {
            	continue;
            }
            
            oLabel = new sap.m.Label({
                text: "{premise>/selection/ContractItems/" + i.toString() + "/Division/Description} - {premise>/selection/ContractItems/" + i.toString() + "/Product/Description}"
            }).addStyleClass("sapUmcHorizontalBeforeSpacingX1_5").addStyleClass("sapUmcMLabelBold");
            if(i === 0) {
                oLabel.addStyleClass("sapUmcVerticalBeforeSpacingX2");
            }

            oSwitch = new sap.m.Switch({
                state: "{premise>/selection/ContractItems/" + i.toString() + "/_isChecked}",
                customTextOff: "{i18n>CHANGE_SERVICE.NO}",
                customTextOn: "{i18n>CHANGE_SERVICE.YES}"
            }).addStyleClass("sapUmcVerticalAfterSpacingX2");

            oSelectServiceVL.addContent(oLabel);
            oSelectServiceVL.addContent(oSwitch);
        }

    }


});
