jQuery.sap.declare("sap.umc.mobile.home.model.DataProvider");

sap.umc.mobile.home.model.DataProvider = {
	loadTiles: function(fnCallback){
		this.oTiles = sap.umc.mobile.home.model.Tiles.getTiles();
		fnCallback(this.oTiles);
	},
	loadHomeData: function(fnCallback){
		var _fnCallback = function(oPremises, iCriticalAlertCount, oContractAccounts, oContracts){
			fnCallback(oPremises, iCriticalAlertCount, oContractAccounts, oContracts);
		};
		this._readHomeData(_fnCallback);
	}
};
