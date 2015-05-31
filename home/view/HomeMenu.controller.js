sap.umc.mobile.app.view.MasterBaseController.extend("sap.umc.mobile.home.view.HomeMenu", {
	onInit: function() {
		this.oApp = sap.ui.getCore().getComponent("AppComponent");
	},

	onPressMakePayment: function() {
		var oInvoiceComponent = this.oApp.getComponents().getInvoice();
		var aTileData = sap.umc.mobile.home.model.Tiles.getTiles().TileCollection;
		var iBillingAmount = 0;

		//Find billing amount
		var i;
		for (i = 0; i < aTileData.length; i++) {
			if(aTileData[i].title === this.getText("HOME.BILL_TITLE")) {
				iBillingAmount = aTileData[i].number;
				break;
			}
		}

		if(iBillingAmount > 0) {
			//Navigate directly to view bills with make a payment button pressed
			oInvoiceComponent.bShowMakeAPayment = true;
		}

		oInvoiceComponent.getRouter().myNavTo("balance", {}, false);
	},

	onPressAutoPay: function() {
		var oUserProfileComponent = this.oApp.getComponents().getUserProfile();
		oUserProfileComponent.getRouter().myNavTo("autoPay", {}, false);
	},

	onPressPaymentHistory: function() {
		var oInvoiceComponent = this.oApp.getComponents().getInvoice();
		oInvoiceComponent.getRouter().myNavTo("paymentHistory", {}, false);
	},

	onPressConsumptionProfile: function() {
		var oServiceComponent = this.oApp.getComponents().getService();
		oServiceComponent.sSourceTileTitle = this.getText("HOME.SERVICES");
		oServiceComponent.getRouter().myNavTo("servicesMaster", {}, false);
	}

});
