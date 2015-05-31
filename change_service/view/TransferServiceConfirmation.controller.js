sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.TransferServiceConfirmation", {

    onInit: function() {
        sap.ui.getCore().getEventBus().subscribe("transferService", "updateConfirmationView", $.proxy(function() {
            this._refreshConfirmationData();
        }, this));
    },

    _refreshConfirmationData: function() {
        var isChecked, startDate, oldAddress, endDate, newAddress, services, billingAddress;
        //Retain setting for isChecked
        isChecked = this.getProperty("confirmation", "/isChecked");

        startDate = this._getStartDateString();
        oldAddress = this._getOldAddressString();
        endDate = this._getEndDateString();
        newAddress = this._getNewAddressString();
        services = this._getServicesString();
        billingAddress = this._getBillingAddressString();

        this.setData("confirmation", {
            isChecked: isChecked,
            startDate: startDate,
            oldAddress: oldAddress,
            endDate: endDate,
            newAddress: newAddress,
            services: services,
            billingAddress: billingAddress
        });
    },

    _getStartDateString: function() {
        var oDate = this.getProperty("date", "/startDate");
        return oDate.toLocaleDateString();
    },

    _getOldAddressString: function() {
        return this.getProperty("premise", "/selection/AddressInfo/ShortForm");
    },

    _getEndDateString: function() {
        var oDate = this.getProperty("date", "/endDate");
        return oDate.toLocaleDateString();
    },

    _getNewAddressString: function() {
        var oSelectedPremise = this.getProperty("premiseAddress", "/selection");

        //Pre-existing address, use short form
        if (oSelectedPremise.AddressInfo.ShortForm !== this.getText("CHANGE_SERVICE.DEFAULT_PREMISE_NAME")) {
            return oSelectedPremise.AddressInfo.ShortForm;
        }
        //Otherwise construct from entered data
        else {
            return sap.umc.mobile.change_service.js.utils.getAddressShortForm(oSelectedPremise);
        }
    },

    _getServicesString: function() {
        var sServices = "";
        var aContracts = this.getProperty("premise", "/selection/ContractItems");
        var i;
        for (i = 0; i < aContracts.length; i++) {
            sServices += aContracts[i].Division.Description + " - " + aContracts[i].Product.Description + "\n";
        }

        //Remove trailing "\n"
        sServices = sServices.slice(0, -1);

        //Set number of lines in textarea
        var iRows = aContracts.length === 0 ? 1 : aContracts.length;
        this.getView().byId("TransferServiceServiceList").setRows(iRows);

        return sServices;
    },

    _getBillingAddressString: function() {
        var oSelectedBilling = this.getProperty("billingAddress", "/selection");

        //Same as service address - get that string 
        if (oSelectedBilling.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.BILLING_SAME_ADDRESS")) {
            return this._getNewAddressString();
        }
        //Pre-existing address, use short form
        else if (oSelectedBilling.AddressInfo.ShortForm !== this.getText("CHANGE_SERVICE.DEFAULT_PREMISE_NAME")) {
            return oSelectedBilling.AddressInfo.ShortForm;
        }
        //Otherwise construct from entered data
        else {
            return sap.umc.mobile.change_service.js.utils.getAddressShortForm(oSelectedBilling);
        }
    }

});
