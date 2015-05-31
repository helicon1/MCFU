jQuery.sap.declare("sap.umc.mobile.outages.model.DataProvider");

sap.umc.mobile.outages.model.DataProvider = {
	loadOutages: function(oDelegate) {
		if (!this.oOutages) {
			this.oOutages = new sap.ui.model.json.JSONModel();
			this._readMapData(oDelegate);
		}
	}
}
