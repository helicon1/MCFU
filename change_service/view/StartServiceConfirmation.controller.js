sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.StartServiceConfirmation", {

    onInit: function() {
        sap.ui.getCore().getEventBus().subscribe("startService", "updateConfirmationView", $.proxy(function() {
            this._refreshConfirmationData();
        }, this));
    },

    _refreshConfirmationData: function() {
        var isChecked, date, service, product, billing, payment;

        //Retain setting for isChecked
        isChecked = this.getProperty("confirmation", "/isChecked");

        date = this._getDateString();
        service = this._getServiceString();
        product = this._getProductString();
        billing = this._getBillingString();
        payment = this._getPaymentString();

        this.setData("confirmation", {
            isChecked: isChecked,
            date: date,
            service: service,
            product: product,
            billing: billing,
            payment: payment
        });
    },

    _getDateString: function() {
        var oDate = this.getProperty("startDate", "/selectedDate");
        return oDate.toLocaleDateString();
    },

    _getServiceString: function() {
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

    _getProductString: function() {
        var sProductPath = this.getProperty("product", "/_selectedProductPath");
        var oSelectedProduct = this.getProperty("product", sProductPath);

        return oSelectedProduct ? oSelectedProduct.Description : "";
    },

    _getBillingString: function() {
        var oSelectedBilling = this.getProperty("billingAddress", "/selection");

        //Same as service address - get that string 
        if (oSelectedBilling.AddressInfo.ShortForm === this.getText("CHANGE_SERVICE.BILLING_SAME_ADDRESS")) {
            return this._getServiceString();
        }
        //Pre-existing address, use short form
        else if (oSelectedBilling.AddressInfo.ShortForm !== this.getText("CHANGE_SERVICE.DEFAULT_PREMISE_NAME")) {
            return oSelectedBilling.AddressInfo.ShortForm;
        }
        //Otherwise construct from entered data
        else {
            return sap.umc.mobile.change_service.js.utils.getAddressShortForm(oSelectedBilling);
        }
    },

    _getPaymentString: function() {
        var bIsNewAccount = this.getProperty("combinedPaymentInfo", "/_isNewAccount");
        var oSelectedPayment = this.getProperty("combinedPaymentInfo", "/selection");
        var sPayment = "";

        if(!this.getProperty("combinedPaymentInfo", "/_isEntered")){
            //User didn't choose to enter payment info
            return "";
        }

        if (!bIsNewAccount) {
            //If account already exists, it has a display name. Use this for the confirmation screen
            sPayment = oSelectedPayment._displayName;
        } else {
            //New account, construct either bank or card account string
            var bIsBankAccount = this.getProperty("combinedPaymentInfo", "/_isBankAccount");
            if (bIsBankAccount) {
                var sBankName = this._findBankNameByID(oSelectedPayment.BankID);
                sPayment = oSelectedPayment.BankAccountNo + " - " + sBankName;
            } else {
                var sCardName = this._findCardNameByID(oSelectedPayment.PaymentCardTypeID);
                sPayment = oSelectedPayment.CardNumber + " - " + sCardName;
            }
        }

        return sPayment;
    },

    _findBankNameByID: function(sBankID) {
        var aBankAccountTypes = this.getProperty("combinedPaymentInfo", "/bankAccountTypes");
        var i;
        for (i = 0; i < aBankAccountTypes.length; i++) {
            if (aBankAccountTypes[i].BankID === sBankID) {
                return aBankAccountTypes[i].Name;
            }
        }
        return "";
    },

    _findCardNameByID: function(sCardID) {
        var aCardAccountTypes = this.getProperty("combinedPaymentInfo", "/cardAccountTypes");
        var i;
        for (i = 0; i < aCardAccountTypes.length; i++) {
            if (aCardAccountTypes[i].PaymentCardTypeID === sCardID) {
                return aCardAccountTypes[i].Description;
            }
        }
        return "";
    }

});
