jQuery.sap.declare("sap.umc.mobile.services.model.OfflineDataProvider");
sap.umc.mobile.services.model.OfflineDataProvider = {

	_readServices: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("services/model/mockdata/ContractItems.json");
		var fnCompleted = jQuery.proxy(function() {		
			for ( var i = 0; i < oFakeJsonModel.getData().d.results.length; i++) {
				var sContractStartDate = oFakeJsonModel.getData().d.results[i].ContractStartDate;
				var sContractEndDate = oFakeJsonModel.getData().d.results[i].ContractEndDate;
				sContractStartDate = sContractStartDate.slice(sContractStartDate.indexOf("(") + 1, sContractStartDate.indexOf(")") + 1);
				sContractEndDate = sContractEndDate.slice(sContractEndDate.indexOf("(") + 1, sContractEndDate.indexOf(")") + 1);
				oFakeJsonModel.getData().d.results[i].ContractStartDate = new Date(parseInt(sContractStartDate, 10));
				oFakeJsonModel.getData().d.results[i].ContractEndDate  = new Date(parseInt(sContractEndDate, 10));
			}		
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readContractAccounts: function(sBuagID, fnCallback){
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if(sBuagID === "1037437"){
			oFakeJsonModel.loadData("services/model/mockdata/ContractAccounts.json");
		}else{
			oFakeJsonModel.loadData("services/model/mockdata/ContractAccounts2.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnCallback(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBudgetBillingPlan: function(sContractID, fnSuccess, fnError) {
	/*	this.ERP.read("Contracts" + "('" + sContractID + "')", ["$format=json", "$expand=ActiveBudgetBillingPlan/BudgetBillingCycle"], true, {
			fnSuccess: jQuery.proxy(function(oData) {
				if (oData.ActiveBudgetBillingPlan.BudgetBillingPlanID !== "") {
					fnSuccess(oData);
				} else {
					fnError();
				}
			}, this),
			fnError: fnError
		});*/
	},
	_readPaymentPlan: function(sContractID, fnSuccess, fnError) {	
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if(sContractID === "900009059"){
			oFakeJsonModel.loadData("services/model/mockdata/ActivePaymentPlan.json");
		}else{
			oFakeJsonModel.loadData("services/model/mockdata/ActivePaymentPlan2.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnSuccess(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readDevices: function(sContractID, fnSuccess) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if(sContractID === "900009070"){
			oFakeJsonModel.loadData("services/model/mockdata/Devices.json");
		}else{
			oFakeJsonModel.loadData("services/model/mockdata/Devices2.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnSuccess(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readRegisters: function(sDeviceID, fnSuccess) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if(sDeviceID === "10034244"){
			oFakeJsonModel.loadData("services/model/mockdata/RegistersToRead.json");
		}else{
			oFakeJsonModel.loadData("services/model/mockdata/RegistersToRead2.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnSuccess(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readMeterReadingNotes: function(fnSuccess) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("services/model/mockdata/MeterReadingNotes.json");
		var fnCompleted = jQuery.proxy(function() {
			fnSuccess(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readMeterReadingHistory: function(sDeviceID, fnSuccess) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if(sDeviceID === "10034244"){ 
			oFakeJsonModel.loadData("services/model/mockdata/MeterReadingResults.json");
		}else{
			oFakeJsonModel.loadData("services/model/mockdata/MeterReadingResults2.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			fnSuccess(oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readConsumptionData: function(sContractID, oDelegate) {		
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		if(sContractID === "900009070"){
			oFakeJsonModel.loadData("services/model/mockdata/ContractConsumptionValues2.json");
		}else{
			oFakeJsonModel.loadData("services/model/mockdata/ContractConsumptionValues.json");
		}
		var fnCompleted = jQuery.proxy(function() {
			this.oConsumption.setData(oFakeJsonModel.getData().d);
			oDelegate.onConsumptionLoaded(this.oConsumption);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_readBanks: function(oDelegate, sCountryID) {
/*		this.ERP.read("Banks", ["$filter=CountryID eq '" + sCountryID + "'", "$format=json"], true, {
			fnSuccess: $.proxy(function(oData) {
				this.oBanks.setSizeLimit(oData.results && oData.results.length);
				this.oBanks.setData(oData);
				oDelegate.onLoadBankListSuccess(this.oBanks);
			}, this)
		});*/
	}
		
};
