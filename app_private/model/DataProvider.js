jQuery.sap.declare("sap.umc.mobile.app.model.DataProvider");

sap.umc.mobile.app.model.DataProvider = jQuery.extend(sap.umc.mobile.base.model.DataProvider, {
	init: function() {
		this.oHelper = sap.umc.mobile.app.model.DataProviderHelper;
		this._prepareData();
		
		return this;
	},
	_prepareData: function(){
		var oDeferredERP = jQuery.Deferred();
		this.ERP = this._initService(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_ERP, true, oDeferredERP);
		this.CRM = this._initService(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_CRM, true);
		this.USERMANAGEMENT = this._initService(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_USERMANAGEMENT, true);
		this.GEOCODER = this._initService(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_GEO, true);
		this.VBI = this._initService(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_VBI, true);
		this.CRMURM = this._initService(sap.umc.mobile.CONSTANTS.ODATA_SERVICE_CRM_URM, true);
		this._SERVICE();
		var oDeferredReadAccounts = jQuery.Deferred();
		this._readAccounts(oDeferredReadAccounts);
		
		var oDeferredAgent = jQuery.Deferred();
		jQuery.when(oDeferredERP).done(jQuery.proxy(function(){
			this._decideAgentThenLoad(oDeferredAgent);
		}, this));
		
		
		
		jQuery.when(oDeferredERP, oDeferredReadAccounts, oDeferredAgent).done(jQuery.proxy(function(){
			// public device is ready 
			sap.ui.getCore().getEventBus().publish("App", "dataReady");
		}, this));
	},
	
	_initService: function(sServiceName, bToken, oDeferred){
		return sap.umc.mobile.app.model.ServiceWrapper().init(sServiceName, bToken, oDeferred);
	},
	_SERVICE: function() {
		if (false) {
			this.SERVICE = this.CRM;
		} else {
			this.SERVICE = this.ERP;
		}
		return this.SERVICE;
	},
	_readAccounts: function(oDeferred){
		if (this.isMock) {
			
			return; 
		} 
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData.results && oData.results.length) {
				sap.ui.getCore().getModel("settings").setProperty("/bIsMultipleAccounts", (oData.results.length > 1));
				this._oAccounts = new sap.ui.model.json.JSONModel();
				this._oAccounts.setData(oData.results);
				this._oContextAccount = new sap.ui.model.json.JSONModel();
				this._oContextAccount.setData(oData.results[0]);
			}
			oDeferred.resolve();
		}, this);
		
		this.SERVICE.read("/Accounts", ["$format=json"], false, {
			fnSuccess: fnSuccess
		});
	},
	_readAccount: function(sAccountId) {
		var oAccount;
		if (this.isMock) {
			
			return;
		} 
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData) {
				oAccount = new sap.ui.model.json.JSONModel();
				oAccount.setData(oData);
			}
		}, this);
		this.SERVICE.read("/Accounts('" + sAccountId + "')", ["$format=json"], false, {
			fnSuccess: fnSuccess
		});
		return oAccount;
	},
	getAccountId: function() {
		return this.getContextAccountId();
	},
	getContextAccountId: function(){
		return this.getContextAccount().getData().AccountID;
	},
	getAccount: function() {
		return this._oContextAccount;
	},
	getAccountById: function(sAccountId) {
		var oAccount;
		
		if(this._oAccounts){
			var oAccounts = this._oAccounts.getData().results;
			
			var x;
			for (x in oAccounts) {
				if(oAccounts[x].AccountID == sAccountId){
					oAccount = new sap.ui.model.json.JSONModel();
					oAccount.setData(oData);
				}
			}
		}
		
		if(!oAccount){
			oAccount = this._readAccount(sAccountId);
		}
		return oAccount;
	},
	getAccounts: function() {
		return this._oAccounts;
	},
	getContextAccount: function(){
		return this._oContextAccount;
	},
	clearContextAccount: function(){
		this._oContextAccount
	},
	changeContextAccount: function(sAccountId) {
		this._oContextAccount = this.getAccountById(sAccountId);
		sap.ui.getCore().getEventBus().publish("accountNotification", "accountChange");
		sap.ui.getCore().getEventBus().publish("App", "contextAccountChanged", this);
	},
	getContextAccountPath: function(){
		return sAccountPath = "/Accounts('" + this.getContextAccountId() + "')/";
	},
	getAccountPath: function() {
		return this.getContextAccountPath();
	},
	_decideAgentThenLoad: function(oDeferred){
		var getAgentData= jQuery.proxy(function() {
			var	fnSecondSuccess = jQuery.proxy(function(oData, oResponse) {
				var sAgentUserGroup = sap.ui.getCore().getModel("settings").getProperty("/sAgentUserGroup");
				var bIsAgent = (sAgentUserGroup && (sAgentUserGroup === oData.UserProfile.UserGroup));
				sap.ui.getCore().getModel("settings").setProperty("/bIsAgent", bIsAgent);
				sap.ui.getCore().getModel("settings").setProperty("/bIsNotAgent", !bIsAgent);
				oDeferred.resolve();
			}, this);
			var fnFirstSuccess = jQuery.proxy(function(oData, oResponse) {
				this.USERMANAGEMENT.read("/UserCollection('" + oData.CurrentUser.UserName + "')", ["$format=json"], false, {
					fnSuccess: fnSecondSuccess
				});
			}, this);
			this.USERMANAGEMENT.read("/CurrentUser", ["$format=json"], false, {
				fnSuccess: fnFirstSuccess
			});
		}, this);
		var oCallback = {
			fnSuccess: function(oData) {
				sap.ui.getCore().getModel("settings").setProperty("/sAgentUserGroup", oData.GetAgentUserGroup.UserGroup);
				getAgentData();
			}
		};
		this.ERP.functionImport("GetAgentUserGroup", sap.umc.mobile.CONSTANTS.HTTP_GET, {}, true, oCallback);
	},		
});