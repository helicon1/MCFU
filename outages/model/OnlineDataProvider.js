jQuery.sap.declare("sap.umc.mobile.outage.model.OnlineDataProvider");
sap.umc.mobile.outages.model.OnlineDataProvider = {
	_readMapData: function(oDelegate) {
		this.aCorrespondingPremises = [];
		this.sAppID = sap.umc.mobile.CONSTANTS.OUTAGES.APP_ID;
		var fnSuccess = jQuery.proxy(function(oData, oResponse) {
			if (oData.results && oData.results.length) {
				this.oOutages.setData(oData.results);
				oDelegate.onOutagesLoaded(this.oOutages);
				this._convertPremisesToGeoCordinates(oDelegate);
			}
		}, this);
		this.VBI.read("VBIApplicationSet('" + this.sAppID + "')", ["$format=json"], true, {
			fnSuccess: jQuery.proxy(function(oConfig) {
				oDelegate.onMapConfigReady(oConfig);
				this._getOutages(fnSuccess);
			}, this)
		});
	},
	_getOutages: function(fnSuccess){
		this.SERVICE.read("Outages", ["$format=json", "$expand=Premise,ContactType,ContactPriority,ContactAdditionalInfo"], true, {
			fnSuccess: fnSuccess
		});
	},
	_convertPremisesToGeoCordinates: function(oDelegate) {
		this.CRM.read(this.getAccountPath() + "ContractItems", ["$format=json", "$expand=Premise"], true, {
			fnSuccess: jQuery.proxy(function(oData) {
				if (oData.results) {
					var aPositions = [];
					// city zoom level
					aPositions.push(this.GEOCODER.createBatchOperation("GetGeoLocation?AppID='" + this.sAppID + "'&SearchString='"
							+ encodeURIComponent(oData.results[0].Premise.AddressInfo.City) + "'", sap.umc.mobile.CONSTANTS.HTTP_GET, null));
					for ( var i = 0; i < oData.results.length; i++) {
						this.aCorrespondingPremises.push(oData.results[i].Premise);
						aPositions.push(this.GEOCODER.createBatchOperation("GetGeoLocation?AppID='" + this.sAppID + "'&SearchString='"
								+ encodeURIComponent(oData.results[i].Premise.AddressInfo.ShortForm) + "'", sap.umc.mobile.CONSTANTS.HTTP_GET, null));
					}
					this.GEOCODER.getODataModel().setHeaders({
						"X-REQUESTED-WITH": "XMLHttpRequest"
					});
					this.GEOCODER.clearBatch();
					this.GEOCODER.addBatchReadOperations(aPositions);
					this.GEOCODER.submitBatch({
						fnSuccess: jQuery.proxy(function(oData) {
							if (oData.__batchResponses[0].data.results && oData.__batchResponses[0].data.results.length) {
								oDelegate.onUpdateZoomLevel(oData.__batchResponses[0].data.results[0]);
							}
							//start for 1 to compensate the premises to the batch response
							for ( var j = 1; j < oData.__batchResponses.length; j++) {
								if (oData.__batchResponses[j].data.results && oData.__batchResponses[j].data.results.length) {
									oDelegate.onCoordinateLoaded(oData.__batchResponses[j].data.results[0], this.aCorrespondingPremises[j - 1]);
								}
							}
						}, this)
					}, true);
				}
			}, this)
		});
	}
};