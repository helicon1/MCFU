sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.home.view.Home",{
	_TILES_MODEL_NAME: "tiles",
	onInit: function() {
		var sThemeId = sap.umc.mobile.base.js.utils.getCookie("theme");
		if (sThemeId) {
			sap.ui.getCore().applyTheme(sThemeId);
		}
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this.getDataProvider().loadTiles(jQuery.proxy(this.onTilesLoaded, this));
		this._handleCarousel();
		this._decideMultipleAccounts(); 
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "home") {
				this._loadHomeData();
			}
		}, this);
	},
	_loadHomeData: function(){
		var fnCallback = jQuery.proxy(this.onHomeDataLoaded, this);
		this.getDataProvider().loadHomeData(fnCallback);
	},
	_decideMultipleAccounts: function() {
		if(sap.ui.getCore().getModel("settings").getProperty("/bIsMultipleAccounts") && !(sap.ui.getCore().getModel("settings").getProperty("/bIsAgent"))){
			var oAccounts = this.oApp.getDataProvider().getAccounts();
			this.getView().setModel(new sap.ui.model.json.JSONModel(oAccounts.getData()), "Accounts");
			this._oAccountActionSheet = new sap.ui.xmlfragment("sap.umc.mobile.home.view.AccountSelectActionSheet", this);
			var aAccounts = this.getView().getModel("Accounts").getData();
			for ( var i = 0; i < aAccounts.length; i++) {

				var oButton = new sap.m.Button({
					text: aAccounts[i].FullName,
				})
				var fnExecute = jQuery.proxy(function(oEvent, oAccount){
					var oContextAccount = this.oApp.getDataProvider().getContextAccount()
					if(oContextAccount.getData().AccountID != oAccount.AccountID){
						this.oApp.getDataProvider().changeContextAccount(oAccount.AccountID);	
						this._loadHomeData();
					}
					
				}, this);
				oButton.attachPress(aAccounts[i], fnExecute);
				this._oAccountActionSheet.addButton(oButton);
			}
			
			this.getView().addDependent(this._oAccountActionSheet);
		}		
	},
	onTilesLoaded: function(oTiles) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oTiles);
		this.getView().setModel(oModel, this._TILES_MODEL_NAME);
		this._refreshTiles();
	},
    onPremisesLoaded: function(oContractAccountsModel) {
        var oServiceTileData = this._getTileData(this._getTileTitles()._SERVICES);
        var oData = oContractAccountsModel.getProperty("/");
		if (oData) {
			var i, j;
			var aPremises = [];
			var aContracts=[];
			// Find distinct premises by contracts
			for (i = 0; i < oData.length; i++) {
				aContracts = oData[i].Contracts.results;
				for (j = 0; j < aContracts.length; j++) {
					aPremises.push(aContracts[j].Premise.PremiseID);
				}
			}
			//Get rid of duplicate premises
			aPremises = aPremises.filter(function(item, pos, arr) {
			    return arr.indexOf(item) === pos;
			});
			
	        oServiceTileData.number = aPremises.length;
	    }
    },
	onCriticalAlertCountLoaded: function(iCriticalAlertCount) {
		var oAlertTileData = this._getTileData(this._getTileTitles()._ALERTS);
		oAlertTileData.number = iCriticalAlertCount;
		if (iCriticalAlertCount > 0) {
			oAlertTileData.numberClass = "sapUmcTileNumber sapUmcRedTextColor";
			oAlertTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcRedTextColor";
			oAlertTileData.iconClass = "sapUmcIconRed";
		} else {
			oAlertTileData.numberClass = "sapUmcTileNumber sapUmcGreyTextColor";
			oAlertTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcGreyTextColor";
		}

	},
	onContractAccountsLoaded: function(oContractAccounts) {
		var oBillTileData = this._getTileData(this._getTileTitles()._BILLS);
		var dTotalAccountBalance = parseFloat(0);
		//to use currency formatter
		if (oContractAccounts instanceof Array) {
			if (oContractAccounts.length > 0) {
				oBillTileData.numberUnit = oContractAccounts[0].ContractAccountBalance.Currency;
				for ( var i = 0; i < oContractAccounts.length; i++) {
					dTotalAccountBalance += parseFloat(oContractAccounts[i].ContractAccountBalance.CurrentBalance);
				}
			}
		} else {
			oBillTileData.numberUnit = oContractAccounts.ContractAccountBalance.Currency;
			dTotalAccountBalance = parseFloat(oContractAccounts.ContractAccountBalance.CurrentBalance);
		}
		//Get proper number with decimal places according to currency (2 for USD, EUR. 0 for JPY etc), this returns a string without currency attached
		oBillTileData.number = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(dTotalAccountBalance,
				oBillTileData.numberUnit);

		if (dTotalAccountBalance > 0) {
			oBillTileData.numberClass = "sapUmcTileNumber sapUmcRedTextColor";
			oBillTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcRedTextColor";
		} else {
			oBillTileData.numberClass = "sapUmcTileNumber sapUmcGreenTextColor";
			oBillTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcGreenTextColor";
		}
	},
	onContactsLoaded: function(oContracts) {
		var oMeterReadingTileData = this._getTileData(this._getTileTitles()._METER_READING);
		var oDevices;
		if (oContracts.getData()[0]) {
			if (oContracts.getData()[0].Contracts.results.length > 0) {
				oDevices = oContracts.getData()[0].Contracts.results[0].Devices;
			}
		}
		var oLastReading;
		var oIteratedLastReading;
		if (oDevices) {
			for ( var i = 0; i < oDevices.results.length; i++) {
				oIteratedLastReading = oDevices.results[0].MeterReadingResults.results[oDevices.results[0].MeterReadingResults.results.length - 1];
				if (i === 0) {
					oLastReading = oIteratedLastReading;
					continue;
				}
				if (oLastReading.ReadingDateTime < oIteratedLastReading.ReadingDateTime) {
					oLastReading = oIteratedLastReading;
				}
			}
		}
		if (oLastReading && oLastReading.ReadingResult) {
			oMeterReadingTileData.number = sap.umc.mobile.app.js.formatters.amountFormatter(oLastReading.ReadingResult, 2);
			oMeterReadingTileData.numberUnit = oLastReading.ReadingUnit;
		} else {
			oMeterReadingTileData.number = sap.umc.mobile.app.js.formatters.amountFormatter("0", 2);
			oMeterReadingTileData.numberUnit = " ";
		}
		oMeterReadingTileData.info = sap.ui.getCore().getModel("i18n").getProperty("HOME.LAST_READING");

		//Consumption tile
		var oConsumptionTileData = this._getTileData(this._getTileTitles()._CONSUMPTION);
		var oCurrentConsumption, oPreviousConsumption;
		if (oContracts.getData()[0]  && oContracts.getData()[0].Contracts.results[0] && oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results[0]) {						
			if (oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results.length - 2 >= 0) {
				oCurrentConsumption = oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results[oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results.length - 1];
				oPreviousConsumption = oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results[oContracts
						.getData()[0].Contracts.results[0].ContractConsumptionValues.results.length - 2];
			} else {
				oCurrentConsumption = oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results[oContracts.getData()[0].Contracts.results[0].ContractConsumptionValues.results.length - 1];
				oPreviousConsumption = 0;
			}
		}
		if (oCurrentConsumption) {
			oConsumptionTileData.number = sap.umc.mobile.app.js.formatters.amountFormatter(oCurrentConsumption.ConsumptionValue, 2);
			oConsumptionTileData.numberUnit = oCurrentConsumption.ConsumptionUnit;
		}else{
			oConsumptionTileData.number = sap.umc.mobile.app.js.formatters.amountFormatter("0", 2);
			oConsumptionTileData.numberUnit = " ";
		}
		if (oPreviousConsumption) {
			if (oCurrentConsumption.ConsumptionValue > oPreviousConsumption.ConsumptionValue) {
				oConsumptionTileData.numberClass = "sapUmcTileNumber sapUmcRedTextColor";
				oConsumptionTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcRedTextColor";
			} else {
				oConsumptionTileData.numberClass = "sapUmcTileNumber sapUmcGreenTextColor";
				oConsumptionTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcGreenTextColor";
			}
		} else {
			oConsumptionTileData.numberClass = "sapUmcTileNumber sapUmcGreenTextColor";
			oConsumptionTileData.numberUnitClass = "sapUmcTileNumberUnit sapUmcGreenTextColor";
		}

	},
	_refreshTiles: function(){
		this.getView().getModel(this._TILES_MODEL_NAME).refresh();
		var oTilesContainer = this.getView().byId("tileContainer");
		var aTiles = oTilesContainer.getTiles();
		for ( var i = 0; i < aTiles.length; i++) {
			var oCurrentTile = aTiles[i];
			var sCssNumber = oCurrentTile.getCustomData()[0].getValue("Number");
			var sCssNumberUnit = oCurrentTile.getCustomData()[1].getValue("Unit");
			if (oCurrentTile.getCustomData()[2].getValue("Icon")) {
				var oIcon = oCurrentTile.findAggregatedObjects()[0].findAggregatedObjects()[1].findAggregatedObjects()[1]
						.findAggregatedObjects()[1];
				oIcon.addStyleClass(oCurrentTile.getCustomData()[2].getValue("Icon")+"");
			}
			var oVbox = oCurrentTile.findAggregatedObjects()[0];
			var oVbox2 = oVbox.findAggregatedObjects()[1];
			var oHbox = oVbox2.findAggregatedObjects()[1];
			var oHbox2 = oHbox.findAggregatedObjects()[0];
			var oNumber = oHbox2.findAggregatedObjects()[0];
			var oNumberUnit = oHbox2.findAggregatedObjects()[1];
			oNumber.addStyleClass(sCssNumber+"");
			oNumberUnit.addStyleClass(sCssNumberUnit+"");
		}
	},
	onHomeDataLoaded: function(oPremises, iCriticalAlertCount, oContractAccounts, oContracts){
		this.onPremisesLoaded(oPremises);
		this.onCriticalAlertCountLoaded(iCriticalAlertCount);
		this.onContractAccountsLoaded(oContractAccounts);
		this.onContactsLoaded(oContracts);
		this.getView().setModel(this.getDataProvider().getAccount(), "personalInformation");
		this._refreshTiles();
		
	},
	_handleCarousel: function() {
		var oSettings = sap.ui.getCore().getModel("settings").getData();
		var oData = {};
		if (oSettings.language === "en") {
			oData.Private1Url = "home/img/carousel1.jpg";
			oData.Private2Url = "home/img/carousel2.jpg";
		} else if (oSettings.language === "de") {
			oData.Private1Url = "home/img/carousel1de.jpg";
			oData.Private2Url = "home/img/carousel2de.jpg";
		} else {
			oData.Private1Url = "home/img/carousel1.jpg";
			oData.Private2Url = "home/img/carousel2.jpg";
		}
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "Images");
		var oCarousel =this.getView().byId("homeCarousel")
		return setInterval(function() {
			oCarousel.next();
		}, 5000);
	},
	_getTileTitles: function() {
		return {
			_SERVICES: this.getText("HOME.SERVICES"),
			_METER_READING: this.getText("HOME.TILE_METER_READING_TITLE"),
			_MANAGE_SERVICE: this.getText("HOME.MANAGE_SERVICE"),
			_OUTAGES: this.getText("HOME.OUTAGES"),
			_BILLS: this.getText("HOME.BILL_TITLE"),
			_ALERTS: this.getText("HOME.ALERT_TITLE"),
			_CONSUMPTION: this.getText("HOME.CONSUMPTION_TITLE"),
			_PROFILE: this.getText("HOME.MY_PROFILE")
		};
	},
	tilePressed: function(oEvent) {
		var oControl = oEvent.getSource().getContent().getItems()[0];
		switch (oControl.getText()) {
			case this._getTileTitles()._SERVICES:
				var oServiceComponent = this.getApp().getComponents().getService();
				oServiceComponent.sSourceTileTitle = this.getText("HOME.SERVICES");
				oServiceComponent.getRouter().myNavTo("servicesMaster", {}, false);
				break;
			case this._getTileTitles()._METER_READING:
				var oServiceComponent = this.getApp().getComponents().getService();
				oServiceComponent.sSourceTileTitle = this.getText("HOME.TILE_METER_READING_TITLE");
				oServiceComponent.getRouter().myNavTo("servicesMaster", {}, false);
				break;
			case this._getTileTitles()._BILLS:
				var oInvoiceComponent = this.getApp().getComponents().getInvoice();
				oInvoiceComponent.getRouter().myNavTo("balance", {}, false);
				break;
			case this.getText("HOME.CONTRACT_TITLE"):
				var oContractComponent = this.getApp().getComponents().getContract();
				oContractComponent.getRouter().myNavTo("servicesMaster", {}, false);
				break;
			case this._getTileTitles()._CONSUMPTION:
				var oServiceComponent = this.getApp().getComponents().getService();
				oServiceComponent.sSourceTileTitle = this.getText("HOME.CONSUMPTION_TITLE");
				oServiceComponent.getRouter().myNavTo("servicesMaster", {}, false);
				break;
			case this._getTileTitles()._MANAGE_SERVICE:
				var oChangeServiceComponent = this.getApp().getComponents().getChangeService();
				oChangeServiceComponent.getRouter().myNavTo("changeServiceMaster", {}, false);
				break;
			case this._getTileTitles()._OUTAGES:
				var oOutagesComponent = this.getApp().getComponents().getOutage();
				oOutagesComponent.getRouter().myNavTo("outage", {}, false);
				break;
			case this._getTileTitles()._ALERTS:
				var oAlertComponent = this.getApp().getComponents().getMessageCenter();
				oAlertComponent.getRouter().myNavTo("messageCenter", {
					Type: "Al"
				}, false);
				break;
			case this._getTileTitles()._PROFILE:
				var oUserProfileComponent = sap.ui.getCore().getComponent("AppComponent").getComponents().getUserProfile();
				oUserProfileComponent.getRouter().myNavTo("userProfile", {}, false);
				break;
		}
	},
	handleAccountTogglePress: function(oEvent) {
		var oButton = oEvent.getSource();
		jQuery.sap.delayedCall(0, this, function() {
			oButton.setPressed(false);
			this._oAccountActionSheet.openBy(oButton);
		});
	},
	onExit: function() {
		sap.umc.mobile.Logger.info("exit");
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},
	handlePopoverPress: function(oEvent) {
		this.getPopover().openBy(oEvent.getSource());
	},
	_getTile: function(sTileTitle) {
		var oTileContainer = this.getView().byId("tileContainer");
		var aTiles = oTileContainer.getTiles();
		for ( var i = 0; i < aTiles.length; i++) {
			if (aTiles[i].getContent().getItems()[0].getText() === sTileTitle) {
				return aTiles[i];
			}
		}
		return undefined;
	},
	_getTileData: function(sTileTitle) {
		var aTileModels = this.getView().getModel(this._TILES_MODEL_NAME).getData().TileCollection;
		for ( var i in aTileModels) {
			if (aTileModels[i].title === sTileTitle) {
				return aTileModels[i];
			}
		}
	},
	_initHeader: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype._initHeader.call(this);
		var sSrc = jQuery.sap.getModulePath("sap.umc.mobile.home") + "/img/SAPLogo.gif";
		this.oHeaderFooterHelper.addHeaderImage(sSrc, "left", 1);
		
	},
	_initFooter: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype._initFooter.call(this);
		this.oHeaderFooterHelper.addContactusButton();
	}
});
