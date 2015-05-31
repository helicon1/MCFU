jQuery.sap.declare("sap.umc.mobile.services.view.PaymentPlanController");

sap.umc.mobile.services.view.PaymentPlanController = {
	setView: function(oView) {
		this._oView = oView;
	},
	getView: function() {
		return this._oView;
	},
	getController: function() {
		return this.getView().getController();
	},
	getText: function(sProperty) {
		return this.getController().getText(sProperty);
	},
	_setOptIn: function(bOptIn) {
		this._bOptIn = bOptIn;
	},
	_getOptIn: function() {
		if (this._bOptIn == null) {
			this._bOptIn = !this.getView().getModel("paymentplan").getProperty("/OptedIn");
		}
		return this._bOptIn;
	},
	getDataProvider: function() {
		return sap.umc.mobile.services.model.DataProvider;
	},
	onUpdatePaymentPlan: function() {
		var bOptIn = this._getOptIn();
		var oPaymentPlan = this.getView().getModel("paymentplan").getProperty("/");
		var fnSuccess;
		if (bOptIn) {
			if (oPaymentPlan.PaymentPlanID) {
				fnSuccess = jQuery.proxy(this._onRemoveSuccess, this);
			} else {
				this.getController().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("SERVICES.NO_PP"));
				return;
			}
		} else {
			fnSuccess = jQuery.proxy(this._onUpdateSuccess, this);
		}
		this.getDataProvider().updatePaymentPlan(oPaymentPlan, bOptIn, fnSuccess);
	},
	onSimulatePlan: function(oEvent) {
		// trigger when either month or year dd changes
		var bOptedIn = this.getView().getModel("paymentplan").getProperty("/OptedIn");
		var sMonth = this.getView().getModel("paymentplan").getProperty("/Months");
		var sYear = this.getView().getModel("paymentplan").getProperty("/Years");
		if (!bOptedIn && !this._getOptIn() && sYear && sMonth) {
			this._simulatePlan();
		}
	},
	onPlanChange: function(oEvent) {
		// triggered on the change of the switch if a user already has a payment plan simulation wont be done
		this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", true);
		this._setOptIn(!oEvent.getSource().getState());
		var bOptedIn = this.getView().getModel("paymentplan").getProperty("/OptedIn");
		if (!this._getOptIn() && !bOptedIn) {
			this._simulatePlan();
		}
		this.getView().getModel("paymentplan").setProperty("/paymentPlanModified", true);		
	},
	
	_onSimulatePPlanWithError: function(){
		this.getView().getModel("paymentplan").setProperty("/_bSwitch", false);
	},
	
	_simulatePlan: function() {
		var oPaymentPlan = this.getView().getModel("paymentplan").getProperty("/");
		this.getDataProvider().simulatePaymentPlan(oPaymentPlan.Months, oPaymentPlan.Years, this);
	},
	_onUpdateSuccess: function() {
		var sMonth = this.getView().getModel("paymentplan").getProperty("/Months");
		var sYear = this.getView().getModel("paymentplan").getProperty("/Years");
		this.getController().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS,
				this.getController().getFormattedText("SERVICES.PP_SUCCESS", [sMonth, sYear]));
		this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", false);		
	},
	_onRemoveSuccess: function() {
		this.getController().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("SERVICES.PP_REMOVED"));
		this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", false);		
	}
};