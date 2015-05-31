jQuery.sap.declare("sap.umc.mobile.outages.model.OfflineDataProvider");
sap.umc.mobile.outages.model.OfflineDataProvider = {

	_readMapData: function(oDelegate) {
		this.aCorrespondingPremises = [];
		this.sAppID = sap.umc.mobile.CONSTANTS.OUTAGES.APP_ID;
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData.results) {
				this.oOutages.setData(oData.results);
				oDelegate.onOutagesLoaded(this.oOutages);
				this._convertPremisesToGeoCordinates(oDelegate);
			}
		}, this);
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("outages/model/mockdata/VBIApplicationSet.json");
		var fnCompleted = jQuery.proxy(function() {
			oDelegate.onMapConfigReady(oFakeJsonModel.getData().d);
			this._getOutages(fnSuccess);

		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_getOutages: function(fnSuccess) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("outages/model/mockdata/Outages.json");
		var fnCompleted = jQuery.proxy(function() {
			fnSuccess(oFakeJsonModel.getData().d, oFakeJsonModel.getData().d);
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_convertPremisesToGeoCordinates: function(oDelegate) {
		var oFakeJsonModel = new sap.ui.model.json.JSONModel();
		oFakeJsonModel.loadData("outages/model/mockdata/ContractItems.json");
		var fnCompleted = jQuery.proxy(function() {
			if (oFakeJsonModel.getData().d.results && oFakeJsonModel.getData().d.results.length) {
				var aPositions = [];
				// city zoom level
				aPositions.push(this.GEOCODER
						.createBatchOperation("GetGeoLocation?AppID='" + this.sAppID + "'&SearchString='"
								+ encodeURIComponent(oFakeJsonModel.getData().d.results[0].Premise.AddressInfo.City) + "'",
								sap.umc.mobile.CONSTANTS.HTTP_GET, null));
				for ( var i = 0; i < oFakeJsonModel.getData().d.results.length; i++) {
					this.aCorrespondingPremises.push(oFakeJsonModel.getData().d.results[i].Premise);
					aPositions.push(this.GEOCODER.createBatchOperation("GetGeoLocation?AppID='" + this.sAppID + "'&SearchString='"
							+ encodeURIComponent(oFakeJsonModel.getData().d.results[i].Premise.AddressInfo.ShortForm) + "'",
							sap.umc.mobile.CONSTANTS.HTTP_GET, null));
				}
				this.GEOCODER.getODataModel().setHeaders({
					"X-REQUESTED-WITH": "XMLHttpRequest"
				});
				this.GEOCODER.clearBatch();
				this.GEOCODER.addBatchReadOperations(aPositions);
				this._compensatePremises(oDelegate);
			}
		}, this);
		oFakeJsonModel.attachRequestCompleted(oFakeJsonModel.getData().d, fnCompleted);
	},
	_compensatePremises: function(oDelegate) {
		var oFakeBatchJsonModel = new sap.ui.model.json.JSONModel();
		oFakeBatchJsonModel.loadData("outages/model/mockdata/Batch.json");
		var fnBatchCompleted = jQuery.proxy(function(oDataModel) {
			var oData = oDataModel.getSource().getData().d;
			if (oData.__batchResponses[0].results && oData.__batchResponses[0].results.length) {
				oDelegate.onUpdateZoomLevel(oData.__batchResponses[0].results[0]);
			}
			// start for 1 to compensate the premises to the batch response
			for ( var j = 1; j < oData.__batchResponses.length; j++) {
				if (oData.__batchResponses[j].results && oData.__batchResponses[j].results.length) {
					oDelegate.onCoordinateLoaded(oData.__batchResponses[j].results[0], this.aCorrespondingPremises[j - 1]);
				}
			}
		}, this);
		oFakeBatchJsonModel.attachRequestCompleted(oFakeBatchJsonModel.getData().d, fnBatchCompleted);
	}

};