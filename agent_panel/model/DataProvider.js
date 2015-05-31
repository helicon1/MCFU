jQuery.sap.declare("sap.umc.mobile.agent_panel.model.DataProvider");

sap.umc.mobile.agent_panel.model.DataProvider =  {
	searchAccounts: function(oDelegate, oSearchParameters) {
		this._searchAccounts(oDelegate, oSearchParameters);
	},
	loadCountries: function(oDelegate){
		var fnSuccess = function(aData){
			oDelegate.onCountriesLoaded(aData.results);
		};
		this._readCountries(fnSuccess);
	},
	loadRegions: function(oDelegate, sCountryID){
		var fnSuccess = function(aData){
			oDelegate.onReagionsLoaded(aData);
		};		
		this._readCountries(sCountryID, fnSuccess);
	}
};




