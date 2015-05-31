jQuery.sap.declare("sap.umc.mobile.user_profile.view.ActionSheetController");

sap.umc.mobile.user_profile.view.ActionSheetController = {
	setView: function(oView) {
		this._oView = oView;
	},
	getView: function() {
		return this._oView;
	},
	onClickAddBankAccount: function(oEvent) {
		sap.ui.getCore().getComponent("AppComponent").getComponents().getUserProfile().getRouter().myNavTo("bankDetail", {BankAccountID: "-1"}, false);
	},
	onClickAddCreditCard: function(oEvent) {
		sap.ui.getCore().getComponent("AppComponent").getComponents().getUserProfile().getRouter().myNavTo("cardDetail", {PaymentCardID: "-1"}, false);
	}
};