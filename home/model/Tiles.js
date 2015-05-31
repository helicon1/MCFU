jQuery.sap.declare("sap.umc.mobile.home.model.Tiles");

sap.umc.mobile.home.model.Tiles = {
	getTiles : function() {
		if(!this.oTiles){
			this.oTiles = this._buildTiles();
		}
		return this.oTiles;
	},

	_buildTiles: function(){
		var oTiles = {"TileCollection": []};
		(function(){
			this.addServices = (function(){
				var oTile = {
						"number": "",
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber sapUmcGreyTextColor",
						"numberUnitClass": "sapUmcTileNumberUnit sapUmcGreyTextColor",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.PROPERTIES"),
						"icon": "sap-icon://home",
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.SERVICES")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			this.addAlerts = (function(){
				var oTile = {
						"number": "0",
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber ",
						"numberUnitClass": "sapUmcTileNumberUnit ",
						"icon": "sap-icon://alert",
						"iconClass": "",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.ALERT_TITLE"),
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.ALERT_TITLE")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			this.addBalance = (function(){
				var oTile = {
						"number": 0,
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber ",
						"numberUnitClass": "sapUmcTileNumberUnit ",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.CURRENT_BALANCE"),
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.BILL_TITLE")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			this.addOutages = (function(){
				var oTile = {
						"number": "",
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber sapUmcGreyTextColor",
						"numberUnitClass": "sapUmcTileNumberUnit sapUmcGreyTextColor",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.OUTAGES_INFO"),
						"icon": "sap-icon://map-2",
//							"icon": jQuery.sap.getModulePath("sap.umc.mobile.home") + "/img/outage-icon_blue.png",
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.OUTAGES")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			
			this.addProfile = (function(){
				var oTile = {
						"icon": "sap-icon://person-placeholder",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.UPDATE_PERSONAL_DATA"),
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.MY_PROFILE")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			
			
			
			this.addComsumption = (function(){
				var oTile = {
						"number": "0",
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber ",
						"numberUnitClass": "sapUmcTileNumberUnit ",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.LAST_CONSUMPTION_INFO"),
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.CONSUMPTION_TITLE")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			this.addMeterReading = (function(){
				var oTile = {
						"number": 0,
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber sapUmcGreyTextColor",
						"numberUnitClass": "sapUmcTileNumberUnit sapUmcGreyTextColor",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.READING_UNAVAILABLE"),
						"icon": "sap-icon://performance",
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.TILE_METER_READING_TITLE")
				};
				this.TileCollection.push(oTile);
			}).call(this);
			this.addManageService = (function(){
				var oTile = {
						"number": "",
						"numberUnit": "",
						"numberClass": "sapUmcTileNumber sapUmcGreyTextColor",
						"numberUnitClass": "sapUmcTileNumberUnit sapUmcGreyTextColor",
						"info": sap.ui.getCore().getModel("i18n").getProperty("HOME.CHANGE_SERVICE_INFO"),
						"icon": "sap-icon://settings",
						"title": sap.ui.getCore().getModel("i18n").getProperty("HOME.MANAGE_SERVICE")
				};
				this.TileCollection.push(oTile);
			}).call(this);
		}).call(oTiles);
		return {"TileCollection" : oTiles.TileCollection};	
	}
};