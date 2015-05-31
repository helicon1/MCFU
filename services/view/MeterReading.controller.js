sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.services.view.MeterReading", {
	onInit: function() {

	}, 

	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "serviceDetail") {
				var sContractID = oEvent.getParameter("arguments").ContractID;
				//this._initializeContractModel(sContractID);
				this.getDataProvider().loadMeterReadingNotes(this);
				this.getDataProvider().loadDevices(sContractID, this);
				//this.getDataProvider().loadConsumption(sContractID, this);
				//this._setInitialSelectedTab();
			}
		}, this);
	},    

	onRegistersLoaded: function(aRegisters) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(aRegisters);
		this.getView().setModel(oModel, "registers");

		this.getView().byId("meterReadingRegisters").removeAllContent();
		var i;
		for (i = 0; i < aRegisters.length; i++) {
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
		var i;
		for (i = 0; i < oData.length; i++) {
			if (oData[i].SerialNumber === this.getView().byId("MeterNumberDropDown").getSelectedKey()) {
				sDeviceID = oData[i].DeviceID;
			}
		}
		this.getDataProvider().loadMeterReadingHistory(sDeviceID, this);
		this.getView().getModel("viewModel").setProperty("/bDataModified", false);
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
		var i;
		for (var i = 0; i < aRegisters.length; i++) {
			if (isNaN(aRegisters[i].registerValue)) {
				for (var j = 0; j < aRegisters.length; j++) {
					aRegisters[j].registerValue = "0";
				}
				this.onRegistersLoaded(aRegisters);
				return;
			}

			if (i === 0) {
				oDataForInsert.DeviceID = aRegisters[i].DeviceID;
				oDataForInsert.RegisterID = aRegisters[i].RegisterID;
				oDataForInsert.ReadingResult = aRegisters[i].registerValue;
				oDataForInsert.ReadingDateTime = oMeterReadingData.date;
				oDataForInsert.MeterReadingNoteID = sMeterReaderNoteID;
			} else {
				var nextReadingResults = {};
				nextReadingResults.DeviceID = aRegisters[i].DeviceID;
				nextReadingResults.RegisterID = aRegisters[i].RegisterID;
				nextReadingResults.ReadingResult = aRegisters[i].registerValue;
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
	}
});  