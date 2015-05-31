jQuery.sap.declare("sap.umc.mobile.home.model.OnlineDataProvider");
sap.umc.mobile.home.model.OnlineDataProvider = {
	_readHomeData: function(fnCallback){
		var oQueries = {
				contracts:{
					entity: "ContractAccounts",
					relativeToAccount: true,
					params:["$format=json", "$expand=Contracts,Contracts/ContractConsumptionValues,Contracts/Division,Contracts/Devices/MeterReadingResults,Contracts/Premise"],
					returnSingleEntity: false
				},
				accountAlertCount:{
					entity: "AccountAlerts",
					relativeToAccount: true,
					params:["$format=json"],
					returnCount: true,
					returnSingleEntity: false
				},
				contractAccounts:{
					entity: "ContractAccounts",
					relativeToAccount: true,
					params:["$format=json", "$expand=ContractAccountBalance"],
					returnSingleEntity: true
				}

		};
		var fnBatcher = (function(oQueries, oDataProvider){
			var aBatchOperations = [];
			var oService = oDataProvider.SERVICE;
			for (var key in oQueries) {
				var oQuery = oQueries[key];
				var sEntityPath = "";
				if(oQuery.relativeToAccount){
					sEntityPath += oDataProvider.getAccountPath();
				}
				sEntityPath += oQuery.entity;
				if(oQuery.returnCount){
					sEntityPath += "/$count";
				}
				else if(oQuery.params){
					sEntityPath += '?' + oQuery.params.join('&');
				}
				var oBatchOperation = oService.createBatchOperation(sEntityPath, "GET");
				oBatchOperation.query = oQuery;
				aBatchOperations.push(oBatchOperation);
			}
			oService.addBatchReadOperations(aBatchOperations);
			var oCallbacks = {
					fnSuccess: jQuery.proxy(function(oData, oResponse, oContext) {
						var oPremises = oService.getBatchOperationByEntity(aBatchOperations, oQueries.contracts.entity).result;
						var iCriticalAlertCount = oService.getBatchOperationByEntity(aBatchOperations, oQueries.accountAlertCount.entity).result;
						var oContracts = oService.getBatchOperationByEntity(aBatchOperations, oQueries.contracts.entity).result;
						var oContractAccounts = oData.__batchResponses[2].data.results;
						fnCallback(oPremises, iCriticalAlertCount, oContractAccounts, oContracts);
					}, this),
					fnError: jQuery.proxy(function(oData, oResponse, oContext) {
					}, this)
			};
			oService.submitBatch_NEW(oCallbacks, aBatchOperations);

		})(oQueries, this);

	}
};
