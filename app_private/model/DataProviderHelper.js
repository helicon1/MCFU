jQuery.sap.declare("sap.umc.mobile.app.model.DataProviderHelper");

sap.umc.mobile.app.model.DataProviderHelper = jQuery.extend(sap.umc.mobile.base.model.DataProviderHelper, {
	getContractAccountName: function(oService){
		var sService = "";
		if(oService.getName() === sap.umc.mobile.CONSTANTS.ODATA_SERVICE_CRM){
			sService =  "BusinessAgreements";
		}else if(oService.getName() === sap.umc.mobile.CONSTANTS.ODATA_SERVICE_ERP){
			sService =  "ContractAccounts";
		}
		return sService;
	},
	getContractName: function(oService){
		var sService = "";
		if(oService.getName() === sap.umc.mobile.CONSTANTS.ODATA_SERVICE_CRM){
			sService =  "ContractItems";
		}else if(oService.getName() === sap.umc.mobile.CONSTANTS.ODATA_SERVICE_ERP){
			sService =  "Contracts";
		}
		return sService;
	}
});
