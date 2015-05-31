sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.UserProfile", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "userProfile") {
				this.getDataProvider().readPersonalData(this);
				var fnCallback = jQuery.proxy(function(oContractAccounts) {
					this.getView().setModel(oContractAccounts, "ContractAccounts");
				}, this);
				this.getDataProvider().loadContractAccounts(fnCallback);
				var oAccountAddress = new sap.ui.model.json.JSONModel();
				oAccountAddress.setData({
					hasAddress: false
				});
				this.getView().setModel(oAccountAddress, "AccountAddress");
				var fnCallback = jQuery.proxy(function(oData, oResponse) {
					if (oData.results && oData.results.length) {
						this.getView().getModel("AccountAddress").setProperty("/hasAddress", true);
					}
				}, this);
				this.getDataProvider().readAccountAddress(fnCallback);
			}
		}, this);
	},
	onRefreshPersonalInfoSuccess: function(oPersonalInfo, sTitle) {
		this.getView().setModel(oPersonalInfo, "personalInfo");
		this.getView().getModel("personalInfo").setProperty("/Title", sTitle);
	},
	handlePaymentInformationPress: function() {
		this.getRouter().myNavTo("paymentAccounts");
	},
	handleAutoPayPress: function() {
		this.getRouter().myNavTo("autoPay");
	},
	handleContactAccountPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("ContractAccounts");
		var oSelectedItem = oContext.getProperty(oContext.getPath());
		this.getRouter().myNavTo("agreementDetail", oSelectedItem, false);
	},
	handleCommunicationPress: function(oEvent) {
		this.getRouter().myNavTo("communicationPref");
	},
	handleContactInfoPress: function(oEvent) {
		this.getRouter().myNavTo("contactInfo");
	},
	handleNameChangePress: function(oEvent) {
		this.getRouter().myNavTo("changeName");
	}

});
