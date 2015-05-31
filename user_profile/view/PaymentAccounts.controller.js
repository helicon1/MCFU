jQuery.sap.require("sap.umc.mobile.user_profile.view.ActionSheetController");

sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.PaymentAccounts", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "paymentAccounts") {
				this.getDataProvider().loadPaymentAccounts(this);
				if(!this.getDataProvider().oCountries){
					this.getDataProvider().loadCountries();
				}				
			}
		}, this);
	},
	showBankDetail: function(oSelectedPaymentMethod) {
		this.getRouter().myNavTo("bankDetail", oSelectedPaymentMethod, false);
	},
	showCardDetail: function(oSelectedPaymentMethod) {
		this.getRouter().myNavTo("cardDetail", oSelectedPaymentMethod, false);
	},
	onBankAccountsLoaded: function(oBankAccounts) {		
		// work around for Bank accounts without description
		if(oBankAccounts.getData().results){			
			for(var i = 0; i < oBankAccounts.getData().results.length; i++){
				if(oBankAccounts.getData().results[i].BankAccountName === ""){
					oBankAccounts.getData().results[i].BankAccountName = "          ";	
				}			
			}
		}
		this.getView().setModel(oBankAccounts, "bankAccounts");
	},
	onCardAccountsLoaded: function(oCardAccounts) {
		this.getView().setModel(oCardAccounts, "cardAccounts");
	},
	// on phone
	handleBankListItemPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("bankAccounts");
		var oSelectedPaymentMethod = oContext.getProperty(oContext.getPath());
		this.showBankDetail(oSelectedPaymentMethod);

	},
	handleCardListItemPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("cardAccounts");
		var oSelectedPaymentMethod = oContext.getProperty(oContext.getPath());
		this.showCardDetail(oSelectedPaymentMethod);
	},
	// on Desktop or Tablet
	handleListItemSelect: function(oEvent) {
		var oContext;
		var oSelectedPaymentMethod;
		if (oEvent.getParameter("listItem").getBindingContext("bankAccounts")) {
			oContext = oEvent.getParameter("listItem").getBindingContext("bankAccounts");
			oSelectedPaymentMethod = oContext.getProperty(oContext.getPath());
			this.showBankDetail(oSelectedPaymentMethod);
		} else if (oEvent.getParameter("listItem").getBindingContext("cardAccounts")) {
			oContext = oEvent.getParameter("listItem").getBindingContext("cardAccounts");
			oSelectedPaymentMethod = oContext.getProperty(oContext.getPath());
			this.showCardDetail(oSelectedPaymentMethod);
		}
	},
	handleOpen: function(oEvent) {
		var oButton = oEvent.getSource();
		if (!this._addActionSheet) {
			var oActionSheetController = sap.umc.mobile.user_profile.view.ActionSheetController;
			this._addActionSheet = sap.ui.xmlfragment("sap.umc.mobile.user_profile.view.ActionSheet", oActionSheetController);
			this.getView().addDependent(this._actionSheet);
		}
		jQuery.sap.delayedCall(0, this, function() {
			this._addActionSheet.openBy(oButton);
		});
	}

});