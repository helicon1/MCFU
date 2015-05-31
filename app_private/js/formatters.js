jQuery.sap.declare("sap.umc.mobile.app.js.formatters");


sap.umc.mobile.app.js.formatters = jQuery.extend(sap.umc.mobile.base.js.formatters, {
	servicesIconFormatter: function(oContract) {
		if (oContract) {
			if(oContract.DivisionID === "92"){
				return "services/img/product_gas_32.png";
			}
			else if(oContract.DivisionID === "03"){
				return "services/img/product_water_32.png";
			}
			else if(oContract.DivisionID === "01"){
				return "sap-icon://lightbulb";	
			}
			else{
				return "sap-icon://lightbulb";	
			}
		}
	},

	budgetBillingRangeFormatter: function(oBBP) {
        if (oBBP) {
            var l = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oBBP.LowerLimitAmount, oBBP.Currency);
            var u = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oBBP.UpperLimitAmount, oBBP.Currency);
            return jQuery.sap.formatMessage(sap.umc.mobile.app.js.utils.getText("SERVICES.AMOUNT_RANGE"), [l, u]);
        }
    }
});