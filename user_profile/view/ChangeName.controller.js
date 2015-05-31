sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.ChangeName", {

    onInit: function() {
        sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);

        this._initializePersonalInfo();
        this._initializeChangeNameSettings();
        this._handleRouting();
    },

    getDataProvider: function() {
        return sap.umc.mobile.user_profile.model.DataProvider;
    },

    _handleRouting: function() {
        this.getRouter().attachRouteMatched(function(oEvent) {
            var sNavigationName = oEvent.getParameter("name");
            if (sNavigationName === "changeName") {
                this.getDataProvider().reloadPersonalData(this);
                this._initializeChangeNameSettings();
            }
        }, this);
    },
    isDirty: function() {
        sap.ui.getCore().getEventBus().subscribe("navigation_confirmation", "ok", jQuery.proxy(function(sChannelId, sEventId, oData) {
            if (oData.sViewGUID !== this._GUID) {
                return false;
            }
            this.setProperty("changeNameSettings", "/editMode", false);
        }, this));
        sap.ui.getCore().getEventBus().subscribe("navigation_confirmation", "cancel", jQuery.proxy(function(sChannelId, sEventId, oData) {
            if (oData.sViewGUID !== this._GUID) {
                return false;
            }
        }, this));

        var oPersonalInfo = this.getData("personalInfo");
        return (oPersonalInfo.firstName !== oPersonalInfo.oldFirstName) || (oPersonalInfo.lastName !== oPersonalInfo.oldLastName);
    },
    _initializePersonalInfo: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "personalInfo");
    },

    _initializeChangeNameSettings: function() {
        this.getView().setModel(new sap.ui.model.json.JSONModel(), "changeNameSettings");
        this.setData("changeNameSettings", {
            editMode: false
        });
    },

    onRefreshPersonalInfoSuccess: function(oPersonalInfo) {
        this.setData("personalInfo", {
            firstName: oPersonalInfo.oData.FirstName,
            lastName: oPersonalInfo.oData.LastName,
            oldFirstName: oPersonalInfo.oData.FirstName,
            oldLastName: oPersonalInfo.oData.LastName
        });
    },

    onEditChangeName: function() {
        this.setProperty("changeNameSettings", "/editMode", true);
    },

    onSubmitChangeName: function() {
        var oPersonalInfo = this.getData("personalInfo");

        //Check if names have changed. If they have submit ISR
        if (oPersonalInfo.firstName !== oPersonalInfo.oldFirstName || oPersonalInfo.lastName !== oPersonalInfo.oldLastName) {
            sap.m.MessageBox.show(this.getText("USER_PROFILE.CHANGE_NAME_CONFIRM"), "sap-icon://hint", this.getText("APP.CONFIRM"), [sap.ui.getCore().getModel("i18n").getProperty("APP.OK"), sap.ui.getCore().getModel("i18n").getProperty("APP.CANCEL")],
                jQuery.proxy(function(sResult) {
                    if (sResult === sap.ui.getCore().getModel("i18n").getProperty("APP.OK")) {
                        this._submitChangeName();
                        return;
                    } else {
                        return;
                    }
                }, this));
        } else {
            this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("USER_PROFILE.ERROR_NAMES_NOT_CHANGED"));
        }
    },

    _submitChangeName: function() {
        var oPersonalInfo = this.getData("personalInfo");
        this.getDataProvider().sendChangeNameRequest(this, oPersonalInfo);
    },

    onChangeNameSuccess: function() {
        this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("USER_PROFILE.SUCCESS_NAME_CHANGE"));
        this.setProperty("changeNameSettings", "/editMode", false);

        this.setProperty("personalInfo", "/firstName", this.getProperty("personalInfo", "/oldFirstName"));
        this.setProperty("personalInfo", "/lastName", this.getProperty("personalInfo", "/oldLastName"));
    }

});
