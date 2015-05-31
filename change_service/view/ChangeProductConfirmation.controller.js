sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.ChangeProductConfirmation", {

    onInit: function() {
        this.utils = sap.umc.mobile.change_service.js.utils;

        sap.ui.getCore().getEventBus().subscribe("changeProduct", "updateConfirmationView", $.proxy(function() {
            this._refreshConfirmationData();
        }, this));
    },

    _refreshConfirmationData: function() {
        var date, address, service, oldProduct, newProduct, isChecked;

        //Retain setting for isChecked
        isChecked = this.getProperty("confirmation", "/isChecked");

        date = this._getDateString();
        address = this._getAddressString();
        service = this._getServiceString();
        oldProduct = this._getOldProductString();
        newProduct = this._getNewProductString();

        this.setData("confirmation", {
            isChecked: isChecked,
            date: date,
            address: address,
            service: service,
            oldProduct: oldProduct,
            newProduct: newProduct
        });
    },

    _getDateString: function() {
        var oDate = this.getProperty("date", "/selectedDate");
        return oDate.toLocaleDateString();
    },

    _getAddressString: function() {
        return this.getProperty("premise", "/selection/AddressInfo/ShortForm");
    },

    _getServiceString: function() {
        var aContracts = this.getProperty("premise", "/selection/ContractItems");
        var sSelectedContractID = this.getProperty("premise", "/selectedContractID");
        var oSelectedContract = this.utils.getSelectedContract(aContracts, sSelectedContractID);

        if (oSelectedContract.Division) {
            return oSelectedContract.Division.Description;
        } else {
            //Contract not found
            return "";
        }
    },

    _getOldProductString: function() {
        var aContracts = this.getProperty("premise", "/selection/ContractItems");
        var sSelectedContractID = this.getProperty("premise", "/selectedContractID");
        var oSelectedContract = this.utils.getSelectedContract(aContracts, sSelectedContractID);

        if (oSelectedContract.Product) {
            return oSelectedContract.Product.Description;
        } else {
            //Contract not found
            return "";
        }
    },

    _getNewProductString: function() {
        var sSelectedProductPath = this.getProperty("product", "/_selectedProductPath");
        var oSelectedProduct = this.getProperty("product", sSelectedProductPath);

        if (oSelectedProduct) {
            return oSelectedProduct.Description;
        } else {
            return "";
        }
    }

});
