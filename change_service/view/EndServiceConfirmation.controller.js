sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.EndServiceConfirmation", {

    onInit: function() {
        sap.ui.getCore().getEventBus().subscribe("endService", "updateConfirmationView", $.proxy(function() {
            this._refreshConfirmationData();
        }, this));
    },

    _refreshConfirmationData: function() {
        var isChecked, date, address, services;

        //Retain setting for isChecked
        isChecked = this.getProperty("confirmation", "/isChecked");

        date = this._getDateString();
        address = this._getAddressString();
        services = this._getServicesString();

        this.setData("confirmation", {
            isChecked: isChecked,
            date: date,
            address: address,
            services: services
        });
    },

    _getDateString: function() {
        var oDate = this.getProperty("endDate", "/selectedDate");
        return oDate.toLocaleDateString();
    },

    _getAddressString: function() {
        return this.getProperty("premise", "/selection/AddressInfo/ShortForm");
    },

    _getServicesString: function() {
        var sServices = "";
        var aContracts = this.getProperty("premise", "/selection/ContractItems");
        var iRows = 0;
        var i;
        for (i = 0; i < aContracts.length; i++) {
            if(aContracts[i]._isChecked){
                //If the contract was chosen add it to the string
                sServices += aContracts[i].Division.Description + " - " + aContracts[i].Product.Description + "\n";
                iRows++;
            }
        }

        //Remove trailing "\n"
        sServices = sServices.slice(0, -1);

        //Set number of lines in textarea
        iRows = iRows === 0 ? 1 : iRows;
        this.getView().byId("endServiceServiceList").setRows(iRows);

        return sServices;
    }

});
