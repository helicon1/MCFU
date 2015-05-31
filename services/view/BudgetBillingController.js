jQuery.sap.declare("sap.umc.mobile.services.view.BudgetBillingController");

sap.umc.mobile.services.view.BudgetBillingController = {
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
	getDataProvider: function() {
		return sap.umc.mobile.services.model.DataProvider;
	},
	onBudgetBillingLoaded: function(oModel) {
		var sCurrentAmount = oModel.getProperty("/Amount");
		this.getView().getModel("budgetbilling").setProperty("/Amount", sCurrentAmount);
	},
	onUpdateBudgetBillingPlan: function() {
		var sAmountEntered = this.getView().getModel("budgetbilling").getProperty("/NewAmount");
		var sCurrentAmount = this.getView().getModel("budgetbilling").getProperty("/Amount");
		if (sAmountEntered && (sAmountEntered !== sCurrentAmount)) {
			this.getDataProvider().updateBudgetBillingPlan(this.getView().getModel("budgetbilling").getProperty("/"),
					jQuery.proxy(this.displaySuccessMessage, this));
		}
		if (!sAmountEntered || sAmountEntered === "") {
			this.getController().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("SERVICES.NO_VALUE"));
		}
	},
	displaySuccessMessage: function(oData, oResponse) {
		if (oResponse.headers["sap-message"]) {
			this.getController().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, jQuery.parseJSON(oResponse.headers["sap-message"]).message);
			return;
		}
		this.getController().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getController().getFormattedText(this.getText("SERVICES.BBP_SUCCESS"), [this.getView().getModel("budgetbilling").getProperty("/EffectiveDate")]));
		this.getDataProvider().loadBudgetBilling(this);
	}
};