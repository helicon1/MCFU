jQuery.sap.declare("sap.umc.mobile.home.model.OfflineDataProvider");

sap.umc.mobile.home.model.OfflineDataProvider = {
	_readHomeData: function(fnCallback){
		this.oPremises = new sap.ui.model.json.JSONModel();
		this.oContractAccounts = new sap.ui.model.json.JSONModel();
		this.oContracts = new sap.ui.model.json.JSONModel();
		this.iCriticalAlertCount = 1; // new sap.ui.model.json.JSONModel();
		this._readPremises(fnCallback);
		this.getAccount();
		//fnCallback(oPremises, iCriticalAlertCount, oContractAccounts, oContracts);
//		fnCallback(oPremises, iCriticalAlertCount, oContractAccounts, oContracts);
	},	
	_readPremises: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("app/model/mockdata/erp/premises.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oPremises.setData(oFakeJsonModel.getData().d);
			this._readContractAccounts(fnCallback);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
		
		//this.sAccountId = oFakeJsonModel.getData().d.results[0].AccountID;
	},
	_readContractAccounts: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("app/model/mockdata/erp/contractAccounts.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oContractAccounts.setData(oFakeJsonModel.getData().d);
			this._readContracts(fnCallback);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
		
		//this.sAccountId = oFakeJsonModel.getData().d.results[0].AccountID;
	},
	_readContracts: function(fnCallback) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("app/model/mockdata/erp/contracts.json");
		var fnCompleted = jQuery.proxy(function() {
			this.oContracts.setData(oFakeJsonModel.getData().d.results);
			this.oPremises.setData(this.oPremises.getData().results);
			fnCallback(this.oPremises, this.iCriticalAlertCount, this.oContractAccounts.getData().results, this.oContracts);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
		
		//this.sAccountId = oFakeJsonModel.getData().d.results[0].AccountID;
	}
	
};