jQuery.sap.require("sap.umc.mobile.services.view.PaymentPlanController");
jQuery.sap.require("sap.umc.mobile.services.view.BudgetBillingController");

sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.services.view.ServiceDetail", {
	onInit: function() {
		sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);

		this._initializeMeterReadingModel();
		this._initializeMonthsModel();
		this._initializeYearsModel();
		this._initializeBudgetBillingModel();
		this._initializePaymentPlanModel();
		this._initializeBudgetBillingFragment();
		this._initializePaymentPlanFragment();
		this._handleRouting();
		this._setInitialVisibleTabs();
		this._initializeSwitchControl();
	},
	isDirty: function(){
		sap.ui.getCore().getEventBus().subscribe("navigation_confirmation", "ok", jQuery.proxy(function(sChannelId, sEventId, oData){
			if(oData.sViewGUID !== this._GUID){
				return false;
			}
			this.getView().getModel("paymentplan").setProperty("/paymentPlanModified", false);
		}, this));
		return this.getView().getModel("paymentplan").getProperty("/paymentPlanModified");
	},	
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "serviceDetail") {
				this._initializeViewModel();
				var sContractID = oEvent.getParameter("arguments").ContractID;
				this._sContractID = sContractID;
				this._initializeContractModel(sContractID);
				this.getDataProvider().loadMeterReadingNotes(this);
				this.getDataProvider().loadDevices(sContractID, this);
				this.getDataProvider().loadConsumption(sContractID, this);
				this._setInitialSelectedTab();
			}
		}, this);
	},
	_initializeViewModel: function() {
		var oData = {
			sSelectedTabKey: "0",
			bShowSubmitButton: false,
			currentDevice: "",
			bShowMeterReadingNotes: false,
			sCurrentMeterReadingNote: "",
			bShowConsumptionDownloadButton: false
		};

		var oViewModel = new sap.ui.model.json.JSONModel();
		oViewModel.setData(oData);

		this.getView().setModel(oViewModel, "viewModel");
	},

	_initializeMeterReadingModel: function() {
		var oData = {
			date: new Date(),
			reading: 0
		};
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "meterReading");
	},

	_initializePaymentPlanModel: function() {
		var oData = {
			StartingMonth: 0
		};
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "paymentplan");
	},

	_initializeBudgetBillingModel: function() {
		var oData = {
			BudgetBillingPlanID: null
		};
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "budgetbilling");
	},

	_initializeContractModel: function(sContractID) {
		var oContract = this.getDataProvider().getContractByID(sContractID);
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oContract);
		this.getView().setModel(oModel, "contract");
		if (oContract) {
			this.getDataProvider().loadBudgetBillingProcedure(oContract.contract.BusinessAgreementID, jQuery.proxy(this._intializeVisibleTabs, this));
		}
	},

	_initializeMonthsModel: function() {
		var oMonthsModel = new sap.ui.model.json.JSONModel();
		oMonthsModel.setData(this.getApp().getUtils().getMonths());
		this.getView().setModel(oMonthsModel, "months");
	},

	_initializeYearsModel: function() {
		var oYearsModel = new sap.ui.model.json.JSONModel();
		oYearsModel.setData(this.getApp().getUtils().getYears());
		this.getView().setModel(oYearsModel, "years");
	},
	_setInitialSelectedTab: function() {
		var oModel = this.getView().getModel("viewModel");
		var oData = oModel.getData();
		var oTabs = this.getView().byId("ServicesTab");
		var oServiceComponent = this.getApp().getComponents().getService();
		var oI18n = sap.ui.getCore().getModel("i18n");
		if (oServiceComponent.sSourceTileTitle === oI18n.getProperty("HOME.TILE_METER_READING_TITLE")) {
			if (oTabs.getSelectedKey() !== "1") {
				oTabs.setSelectedKey("1");
			}
			oData.bShowSubmitButton = true;
		} else if (oServiceComponent.sSourceTileTitle === oI18n.getProperty("HOME.CONSUMPTION_TITLE")){		
			if (oTabs.getSelectedKey() !== "0") {
				oTabs.setSelectedKey("0");
			}
		} else {
			//if (oTabs.getSelectedKey() !== "0") {
				oTabs.setSelectedKey("1");//workaround for the sapui5 issue;
				oTabs.setSelectedKey("0");
			//}
		}
		oTabs.setExpanded(true);
		oModel.setData(oData);
	},
	_setInitialVisibleTabs: function() {
		var oTabs = this.getView().byId("ServicesTab");
		oTabs.getItems()[3].setVisible(false);
		oTabs.getItems()[4].setVisible(false);
	},
	_intializeVisibleTabs: function(oBudgetBillingProcedureID) {
		var oTabs = this.getView().byId("ServicesTab");
		// budget billing visible
		var CONSTANTS = sap.umc.mobile.CONSTANTS.BUDGETBILLINGPROCEDURE;
		if (oBudgetBillingProcedureID === CONSTANTS.BUDGETBILLING_STATISTICAL || oBudgetBillingProcedureID === CONSTANTS.BUDGETBILLING_STATISTICAL) {
			oTabs.getItems()[3].setVisible(true);
		} else {
			oTabs.getItems()[3].setVisible(false);
		}
		// payment plan visible
		if (oBudgetBillingProcedureID === CONSTANTS.PAYMENTPLAN) {
			oTabs.getItems()[4].setVisible(true);
		} else {
			oTabs.getItems()[4].setVisible(false);
		}
	},

	_initializePaymentPlanFragment: function() {
		if (!this._paymentPlanFragment) {
			this.oPaymentPlanController = sap.umc.mobile.services.view.PaymentPlanController;
			this._paymentPlanFragment = sap.ui.xmlfragment("sap.umc.mobile.services.view.PaymentPlan", this.oPaymentPlanController);
			this.oPaymentPlanController.setView(this.getView());
		}
		var oFragmentWrapper = this.getView().byId("paymentPlanContent");
		oFragmentWrapper.addContent(this._paymentPlanFragment);
	},

	_initializeBudgetBillingFragment: function() {
		if (!this._budgetbillingFragment) {
			this.oBudgetBillingController = sap.umc.mobile.services.view.BudgetBillingController;
			this._budgetbillingFragment = sap.ui.xmlfragment("sap.umc.mobile.services.view.BudgetBillingPlan", this.oBudgetBillingController);
			this.oBudgetBillingController.setView(this.getView());
		}
		var oFragmentWrapper = this.getView().byId("budgetBillingContent");
		oFragmentWrapper.addContent(this._budgetbillingFragment);
	},

	onSubmitButtonPress: function() {
		var sDeviceID = this.getView().getModel("viewModel").getData().currentDevice;

		switch (this.getView().byId("ServicesTab").getSelectedKey()) {
			case "0":
				break;
			case "1":
				this.onSubmitMeterReading(sDeviceID);
				break;
			case "2":
				this.oBudgetBillingController.onUpdateBudgetBillingPlan();
				break;
			case "3":
				this.oPaymentPlanController.onUpdatePaymentPlan();
				break;
		}
	},

	_addContentView: function(oFragment) {
		var oView = this.getView().byId("ServicesContent");
		oView.addContent(oFragment);
	},

	_removeContentView: function() {
		var oView = this.getView().byId("ServicesContent");
		oView.removeAllContent();
	},

	onRegistersLoaded: function(aRegisters) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(aRegisters);
		this.getView().setModel(oModel, "registers");

		this.getView().byId("meterReadingRegisters").removeAllContent();
		for ( var i = 0; i < aRegisters.length; i++) {
			var oLabel = new sap.m.Label();
			oLabel.setText(sap.ui.getCore().getModel("i18n").getProperty("SERVICES.READING") + " (" + aRegisters[i].RegisterID + ")");
			oLabel.addStyleClass("sapUmcHorizontalBeforeSpacingX1_5 sapUmcVerticalBeforeSpacingX2");
			var sBindingPath = "{registers>/" + i + "/registerValue}";
			var oRegisterInputField = new sap.m.Input({
				value: sBindingPath,
				change: jQuery.proxy(this.onReadingChange, this)
			});

			oRegisterInputField.setValue((sBindingPath));
			this.getView().byId("meterReadingRegisters").addContent(oLabel);
			this.getView().byId("meterReadingRegisters").addContent(oRegisterInputField);
		}
	},

	onReadingChange: function() {
		this.getView().getModel("viewModel").setProperty("/bDataModified", true);
	},

	onMeterReadingNotesLoaded: function(oModel) {
		this.getView().setModel(oModel, "meterReadingNotes");
	},

	onMeterReadingCreationFinishedWithError: function(bPlausibleWarning) {
		var oData = this.getView().getModel("viewModel").getData();
		oData.bShowMeterReadingNotes = bPlausibleWarning;
		this.getView().getModel("viewModel").setData(oData);
	},

	onMeterReadingCreationFinishedWithSuccess: function() {
		var oData = this.getView().getModel("viewModel").getData();
		oData.bShowMeterReadingNotes = false;
		this.getView().getModel("viewModel").setData(oData);
		this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS,
				sap.ui.getCore().getModel("i18n").getProperty("SERVICES.ENTER_METER_READING_SUCCESS"));

		oData = this.getView().getModel("devices").getData();
		var sDeviceID = '';
		for ( var i = 0; i < oData.length; i++) {
			if (oData[i].SerialNumber === this.getView().byId("MeterNumberDropDown").getSelectedKey()) {
				sDeviceID = oData[i].DeviceID;
			}
		}
		this.getDataProvider().loadMeterReadingHistory(sDeviceID, this);
		this.getView().getModel("viewModel").setProperty("/bDataModified", false);
		this._initializeMeterReadingModel();
		this.getDataProvider().loadDevices(this._sContractID, this);		
	},

	onDevicesLoaded: function(oModel) {
		this.getView().setModel(oModel, "devices");
		if (oModel.getData().length) {
			this.getDataProvider().loadRegisters(oModel.getData()[0].DeviceID, this);
			this.getDataProvider().loadMeterReadingHistory(oModel.getData()[0].DeviceID, this);
			var oData = this.getView().getModel("viewModel").getData();
			oData.currentDevice = oModel.getData()[0].DeviceID;
			this.getView().getModel("viewModel").setData(oData);
		}

		//Tell the smartmeter controller the device information is available
		sap.ui.getCore().getEventBus().publish("smartMeter", "onDevicesLoaded");
	},

	onDevicesLoadedError: function() {
		//Need to handle any errors in retreiving devices by hiding the consumption tab
		//since it can't obtain any data
		var oServiceDetailView = sap.ui.getCore().getComponent("ServicesComponent").getRouter().getView("sap.umc.mobile.services.view.ServiceDetail");
		oServiceDetailView.byId("smartMeterTab").setVisible(false);
		oServiceDetailView.byId("meterReadingTab").setVisible(true);
	},

	onSubmitMeterReading: function(sDeviceID) {
		var aRegisters = this.getView().getModel("registers").getData();
		var oMeterReadingData = this.getView().getModel("meterReading").getData();
		var oViewData = this.getView().getModel("viewModel").getData();

		var oDataForInsert = {
			DependentMeterReadingResults: []
		};

		var sMeterReaderNoteID = '';
		if (oViewData.bShowMeterReadingNotes) {
			sMeterReaderNoteID = this.getView().byId("MeterReaderNotes").getSelectedKey();
		}

		for ( var i = 0; i < aRegisters.length; i++) {
			if (i === 0) {
				oDataForInsert.DeviceID = aRegisters[i].DeviceID;
				oDataForInsert.RegisterID = aRegisters[i].RegisterID;
				oDataForInsert.ReadingResult = sap.umc.mobile.base.js.formatters.parseFormattedAmount(aRegisters[i].registerValue).toString();
				oDataForInsert.ReadingDateTime = oMeterReadingData.date;
				oDataForInsert.MeterReadingNoteID = sMeterReaderNoteID;
			} else {
				var nextReadingResults = {};
				nextReadingResults.DeviceID = aRegisters[i].DeviceID;
				nextReadingResults.RegisterID = aRegisters[i].RegisterID;
				nextReadingResults.ReadingResult = sap.umc.mobile.base.js.formatters.parseFormattedAmount(aRegisters[i].registerValue).toString();
				nextReadingResults.ReadingDateTime = oMeterReadingData.date;
				nextReadingResults.MeterReadingNoteID = sMeterReaderNoteID;
				oDataForInsert.DependentMeterReadingResults.push(nextReadingResults);
			}
		}
		this.getDataProvider().createMeterReading(sDeviceID, oDataForInsert, this);
	},

	onMeterNumberChanged: function(oEvent) {
		var sDeviceID = oEvent.getSource().getSelectedKey();
		this.getDataProvider().loadRegisters(sDeviceID, this);
		this.getDataProvider().loadMeterReadingHistory(sDeviceID, this);

		var oData = this.getView().getModel("viewModel").getData();
		oData.currentDevice = sDeviceID;
		this.getView().getModel("viewModel").setData(oData);
	},

	onMeterReadingHistoryLoaded: function(oModel) {
		this.getView().setModel(oModel, "meterReadingHistory");
	},

	onConsumptionLoaded: function(oModel, dCurrentDate) {
		var oConsumpionModel = new sap.ui.model.json.JSONModel();
		oConsumpionModel.setData(oModel.getData());
		this.getView().setModel(
				sap.umc.mobile.services.js.utils.getUpdatedConsumptionModel(oConsumpionModel, this.getView().getModel("switchControl").getData(),
						dCurrentDate), "consumption");
		this.getView().getModel("consumption").setProperty("/DisplayType", this._getDisplayType());
		this.getView().getModel("consumption").setProperty("/Visible", "HasData");
		this.getView().getModel("consumption").setProperty("/Switch", "HasData");
		if(this.getView().getModel("consumption").getData().results[0]){
			this.getView().getModel("consumption").setProperty("/UnitButton", this.getView().getModel("consumption").getData().results[0].ConsumptionUnit);
			this.getView().getModel("consumption").setProperty("/CostButton", this.getView().getModel("consumption").getData().results[0].Currency);	
		}			
		this._setPeriodText(dCurrentDate);
		this._checkCurrentYearData();
		if (!this.getView().getModel("consumption").getProperty("/Color")) {
			var color = ['rgb(1,198,240)', 'rgb(8,76,139)'];
			this.getView().getModel("consumption").setProperty("/Color", color);
		}
		var iAverageValue = this._getConsumptionAverage(oConsumpionModel);
		if (this.getView().getModel("consumption").getData().results.length) {
			this.getView().setModel(sap.umc.mobile.services.js.utils.getUpdatedConsumptionAverage(oConsumpionModel, iAverageValue), "consumption2");
			this.getView().getModel("consumption").setProperty("/Average",
					this.getView().getModel("consumption").getData().results[0].DisplayUnit + " " + iAverageValue);
			var oAverageLineModel = new sap.ui.model.json.JSONModel();
			oAverageLineModel.setData({
				results: this._AddAverageLine(iAverageValue)
			});
			this.getView().setModel(oAverageLineModel, "consumption_average");
		}
		// provide a workaround for column binding
		this.getView().byId("graph_chart_column_average").setName(this.getText("SERVICES.AVERAGE"));
	},
	_setPeriodText: function(dCurrentDate) {
		var dFirstYear = new Date(dCurrentDate);
		dFirstYear.setFullYear(dCurrentDate.getFullYear() - 2);
		var sFirstYear = dFirstYear.toLocaleDateString();
		this.getView().getModel("consumption").setProperty("/FirstYear", sFirstYear);		
		var dSecondYear = new Date(dCurrentDate);
		dSecondYear.setFullYear(dCurrentDate.getFullYear() - 1);
		var sSecondYear = dSecondYear.toLocaleDateString();
		this.getView().getModel("consumption").setProperty("/SecondYear", sSecondYear);
		var sCurrentDate = dCurrentDate.toLocaleDateString();
		this.getView().getModel("consumption").setProperty("/CurrentDate", sCurrentDate);	
	},
	
	_AddAverageLine: function(iAverageValue) {
		var oData = this.getView().getModel("consumption").getData();
		var aData = [];
		for ( var i = 0; i < oData.results.length; i++) {
			aData.push(oData.results[i].DisplayPeriod);
		}
		var aPeriods = [];
		$.each(aData, function(i, el) {
			if ($.inArray(el, aPeriods) === -1) {
				aPeriods.push(el);
			}
		});
		var oFakeData = [];
		for ( var j = 0; j < aPeriods.length; j++) {
			oFakeData.push({
				AverageValue: iAverageValue,
				DisplayPeriod: aPeriods[j]
			});
		}
		return oFakeData;
	},
	_getConsumptionAverage: function(oConsumpionModel) {
		var iTotal = 0;
		for ( var i = 0; i < oConsumpionModel.getData().results.length; i++) {
			iTotal += parseFloat(oConsumpionModel.getData().results[i].DisplayValue);
		}
		if (i > 0) {
			return parseFloat(iTotal / i).toFixed(2);
		}
	},
	_checkCurrentYearData: function() {
		if (this.getView().getModel("consumption").getData().results.length === 0) {
			this.getView().getModel("consumption").setProperty("/DisplayType", this.getText("SERVICES.NO_DATA2"));
			if (this.getView().getModel("switchControl").getData().IsLess) {
				this.getView().getModel("consumption").setProperty("/Message", this.getText("SERVICES.NO_CURRENTDATA2"));
				this.getView().getModel("consumption").setProperty("/Switch", "OneYear");
			} else {
				this.getView().getModel("consumption").setProperty("/Message", this.getText("SERVICES.NO_CURRENTDATA"));
				this.getView().getModel("consumption").setProperty("/Switch", "NoData");
			}
			this.getView().getModel("consumption").setProperty("/Visible", "NoData");
		}
	},
	_getDisplayType: function() {
		if (!this.getView().getModel("consumption").getData().results[0]) {
			return "";
		}
		if (this.getView().getModel("switchControl").getData().IsConsumption) {
			return this.getText("SERVICES.CONSUMPTION") + " (" + this.getView().getModel("consumption").getData().results[0].DisplayUnit + ")";
		} else {
			return this.getText("SERVICES.COST") + " (" + this.getView().getModel("consumption").getData().results[0].DisplayUnit + ")";
		}
	},
	// refresh consumption model
	_handleRefreshConsumptionModel: function() {
		this.getDataProvider().reloadConsumption(this);
	},
	_initializeSwitchControl: function() {
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			IsConsumption: true,
			IsCost: false,
			IsLess: false
		}), "switchControl");
	},
	handleIsLessSwitched: function(oEvent) {
		this.getView().getModel("switchControl").getData().IsLess = oEvent.getParameters().pressed;
		this._handleRefreshConsumptionModel();
	},
	handleIsConsumptionSwitched: function(oEvent) {
		this.getView().getModel("switchControl").getData().IsConsumption = oEvent.getParameters().pressed;
		this.getView().byId("Cost").setPressed(!this.getView().getModel("switchControl").getData().IsConsumption);		
		this._handleRefreshConsumptionModel();
	},
	handleIsCostSwitched: function(oEvent) {
		this.getView().getModel("switchControl").getData().IsCost = oEvent.getParameters().pressed;
		this.getView().byId("Consumption").setPressed(!this.getView().getModel("switchControl").getData().IsCost);
		this._handleRefreshConsumptionModel();
	},
	onConsumptionLoadFailed: function() {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({ results : [] });
		this.onConsumptionLoaded(oModel);
		this.getView().getModel("consumption").setProperty("/Message", this.getText("SERVICES.NO_DATA"));
		this.getView().getModel("consumption").setProperty("/Switch", "NoData");
	},
	onBudgetBillingLoaded: function(oModel) {
		if (oModel.getProperty("/BudgetBillingPlanID")) {
			this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", true);
		}
		this.getView().setModel(oModel, "budgetbilling");
	},

	onPaymentPlanLoaded: function(oModel) {
		this.getView().setModel(oModel, "paymentplan");
	},

	onServiceSelected: function(oEvent) {
		var iKey = parseInt(oEvent.getSource().getSelectedKey(), 10);
		this._removeContentView();
		switch (iKey) {
			case 0: // consumption
				// this.getDataProvider().loadConsumption(this);
				this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", false);
				this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", false);
				break;
			case 1: // meter reading
				this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", true);
				this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", false);
				break;
			case 2: // budgetbilling plan
				this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", false);
				this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", false);
				this.getDataProvider().loadBudgetBilling(this);
				break;
			case 3: // paymentplan
				this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", false);
				this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", false);
				this.getDataProvider().loadPaymentPlan(this);
				break;
			case 4: // smart meter
				this.getView().getModel("viewModel").setProperty("/bShowSubmitButton", false);
				this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", true);
				break;
		}
	},

	onConsumptionDownloadPressed: function() {
        //The smartmeter controller will handle the smart meter consumption download request
		sap.ui.getCore().getEventBus().publish("smartMeter", "onConsumptionDownloadPressed");
    }
});