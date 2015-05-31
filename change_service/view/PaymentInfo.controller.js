sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.change_service.view.PaymentInfo", {

    onInit: function() {

    },

    onPaymentInfoSelected: function(selectedItem) {
        var sAccountID = parseInt(selectedItem.getSource().getSelectedKey(), 10);
        var oSelectedAccount = this.getProperty("combinedPaymentInfo", "/accounts/" + sAccountID);
        var sCountryID = oSelectedAccount.CountryID;

        var isBankAccount = oSelectedAccount.BankAccountID ? true : false;
        var isCardAccount = oSelectedAccount.PaymentCardID ? true : false;
        var isNewAccount = false;
        if (oSelectedAccount.BankAccountID === "-1" || oSelectedAccount.PaymentCardID === "-1") {
            isNewAccount = true;
        }

        this.setProperty("combinedPaymentInfo", "/_isBankAccount", isBankAccount);
        this.setProperty("combinedPaymentInfo", "/_isCardAccount", isCardAccount);
        this.setProperty("combinedPaymentInfo", "/_isNewAccount", isNewAccount);

        this.setProperty("combinedPaymentInfo", "/selection", oSelectedAccount);
        this.onCountrySelected(undefined, sCountryID);
    },

    onCountrySelected: function(selectedItem, sCountryIDFromAccount) {
        //Only process when bank account selected - not for card accounts
        if (!this.getProperty("combinedPaymentInfo", "/selection/BankAccountID")) {
            return;
        }
        var oDataProvider = sap.umc.mobile.change_service.model.DataProvider;
        var sCountryID;
        if (selectedItem) {
            sCountryID = selectedItem.getSource().getSelectedKey();
        } else if (sCountryIDFromAccount) {
            sCountryID = sCountryIDFromAccount;
        } else {
            //If we can't get the country ID, make sure the oData call doesn't occur and empty the card types. Otherwise error occurs
            this.setProperty("combinedPaymentInfo", "/bankAccountTypes", []);
            return;
        }

        oDataProvider.loadBankAccountTypes(sCountryID, this);
    },

    onBankAccountTypesLoaded: function(aBankAccountTypes) {
        this.getView().getModel("combinedPaymentInfo").setProperty("/bankAccountTypes", aBankAccountTypes);
    }

});
