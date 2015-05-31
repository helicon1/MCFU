sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.outages.view.Outages", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this.CONSTANTS = sap.umc.mobile.CONSTANTS.OUTAGES;
		this._handleRouting();
	},
	_handleRouting: function() {		
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "outage") {
				this.getDataProvider().loadOutages(this);
				this._initializeMapViewport();
			}
		}, this);
	},
	_getMap: function() {
		return this.getView().byId("OutageMap");
	},
	_initializeMapViewport: function() {
		var oMap = this._getMap();
		if (sap.ui.Device.system.tablet) {
			oMap.setWidth("92%");
			oMap.setHeight("70%");
		} else if (sap.ui.Device.system.phone) {
			oMap.setWidth("90%");
			oMap.setHeight("80%");
		}
	},
	onMapConfigReady: function(oConfig) {
		this.oMapBuilder = sap.umc.mobile.outages.js.vbmap;
		this.oMapConfig = this.oMapBuilder.buildMap();
		this._getMap().attachSubmit(jQuery.proxy(this.onClickMapRegion, this));
		this._getMap().attachOpenWindow(jQuery.proxy(this.onOpenDetailWindow, this));
		this.oMapBuilder.setServiceConfig(jQuery.parseJSON(oConfig.ProjectJSON));
		this._refreshMap();
	},
	onOutagesLoaded: function(oModel) {
		this.getView().setModel(oModel, "outages");
		var oOutageData = this._getBroadcastedOutage();
		this.oMapBuilder.addOutageRegion(oOutageData.Note);
		this._refreshMap();
	},
	onCoordinateLoaded: function(oCoordinate, oPremise) {
		this.oMapBuilder.addPoint(oCoordinate.Xpos, oCoordinate.Ypos, oCoordinate.Zpos, oPremise);
		this._refreshMap();
	},
	onUpdateZoomLevel: function(oCoordinate) {
		this.oMapBuilder.setZoomLevel(oCoordinate, 12);
		this._refreshMap();
	},
	_refreshMap: function() {
		this._getMap().setConfig(this.oMapConfig);
	},
	onReportOutage: function(oEvent) {
		var oMessageCenter = this.getApp().getComponents().getMessageCenter();
		oMessageCenter.getRouter().myNavTo("addMessage", { Type: "outage" }, false);
		oMessageCenter.getRouter().myNavTo("messageDetail", {
			ID: "-1",
			Type: sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE
		}, false);
	},
	onClickMapRegion: function(oEvent) {
		var sMapData = oEvent.getParameters().data;
		var oMapData = jQuery.parseJSON(sMapData);
		switch (oMapData.Action.name) {
		case "CLICK_OUTAGE":
			var oOutageData = this._getBroadcastedOutage();
			this._getMap().load(this.oMapBuilder.getOutageWindow(oOutageData));
			break;
		case "CLICK_PREMISE":
			var iPremiseIndex = parseInt(oMapData.Action.instance.substr(oMapData.Action.instance.indexOf(".") + 1), 10) - 1;
			this._getMap().load(this.oMapBuilder.getPremiseWindow(iPremiseIndex));
			break;
		}
	},
	_getBroadcastedOutage: function() {
		var oData = this.getView().getModel("outages").getData();
		for ( var i = 0; i < oData.length; i++) {
			if (oData[i].ContactAdditionalInfoID === this.CONSTANTS.BROADCAST) {
				return oData[i];
			}
		}
	},
	_getReportedOutage: function() {
		var oData = this.getView().getModel("outages").getData();
		for ( var i = 0; i < oData.length; i++) {
			if (oData[i].ContactAdditionalInfoID !== this.CONSTANTS.BROADCAST) {
				return oData[i];
			}
		}
	},
	onOpenDetailWindow: function(oEvent) {
		// this function needs to be here to invoke a detailed window
	}
});