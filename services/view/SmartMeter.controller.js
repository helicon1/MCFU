sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.services.view.SmartMeter", {

    //Override inherited function to get data provider, cannot be called succesfully from this controller since it is a sub-view
    getDataProvider: function() {
        return sap.umc.mobile.services.model.DataProvider;
    },

    getUtils: function() {
        return sap.umc.mobile.services.js.utils;
    },

    onInit: function(oEvent) {
        this._initializeSmartGraphModel();
        this._initializeSmartGraphData();

        this._initializeSmartDevicesModel();
        this._initializeSmartDevicesData();

        this._initializeSmartMeterViewModel();
        this._initializeSmartMeterViewData();

        sap.ui.getCore().getEventBus().subscribe("smartMeter", "onDevicesLoaded", $.proxy(this.onDevicesLoaded, this));
        sap.ui.getCore().getEventBus().subscribe("smartMeter", "onConsumptionDownloadPressed", $.proxy(this.onConsumptionDownloadPressed, this));
    },

    _initializeSmartGraphModel: function() {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setSizeLimit(300); //Arbitrarily large limit
        this.getView().setModel(oModel, "smartGraph");
    },

    _initializeSmartGraphData: function() {
        this.getView().getModel("smartGraph").setData({
            color: ["#064E8D", "#77B7DD"],
            consumption: []
        });
    },

    _initializeSmartDevicesModel: function() {
        var oModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oModel, "smartDevices");
    },

    _initializeSmartDevicesData: function() {
        this.getView().getModel("smartDevices").setData({
            devices: []
        });
    },

    _initializeSmartMeterViewModel: function() {
        var oModel = new sap.ui.model.json.JSONModel();
        //Must set the property corresponding to the progress bar percentage, otherwise a javascript exception is thrown
        oModel.setProperty("/progressBarPercentValue", 0);
        this.getView().setModel(oModel, "smartMeterViewModel");
    },

    _initializeSmartMeterViewData: function() {
        this.getView().getModel("smartMeterViewModel").setData({
            zoomInButtonEnabled: true,
            zoomOutButtonEnabled: false,
            selectedTimePeriod: sap.umc.mobile.CONSTANTS.TIMEPERIOD.MONTH,
            smartMeterChartLabel: "",
            progressBarPercentValue: 0,
            progressBarDisplayValue: "",
            projectedConsumptonTotal: "",
            progressBarDateFrom: "",
            progressBarDateTo: "",
            monthlyViewDisabled: false,
            selectedButton: "",
            unitButtonText: "",
            currencyButtonText: "",
            billingPeriodStartDate: new Date(),
            billingPeriodEndDate: new Date(),
            graphStartDate: new Date(),
            graphEndDate: new Date()
        });
    },

    onDevicesLoaded: function() {
        var aDevices = this.getView().getModel("devices").getData();
        var aSmartDevices = [];

        //Only interested in devices with smart meters, save only their information
        for (var i = 0; i < aDevices.length; i++) {
            if (aDevices[i].IntervalRegistersToRead.results.length > 0) {
                //Smart Meter exists for this device if there is something in IntervalRegistersToRead
                aSmartDevices.push(aDevices[i]);
            }
        }

        this.getView().getModel("smartDevices").setProperty("/devices", aSmartDevices);

        var oServiceDetailView = sap.ui.getCore().getComponent("ServicesComponent").getRouter().getView("sap.umc.mobile.services.view.ServiceDetail");
        if (aSmartDevices.length > 0) {
            //Make sure tab icon is visible
            oServiceDetailView.byId("smartMeterTab").setVisible(true);
            oServiceDetailView.byId("meterReadingTab").setVisible(false);
            
            //Get the default billing period
            this.getDataProvider().loadBillingPeriod(aSmartDevices[0].ContractID, this);
        } else {
            //No smart meters, hide smart meter tab
            oServiceDetailView.byId("smartMeterTab").setVisible(false);
            oServiceDetailView.byId("meterReadingTab").setVisible(true);
        }
    },

    onLoadBillingPeriodSuccess: function(oData, oResponse) {
        var oStartDate = oData.GetCurrentBillingPeriod.StartDate;
        var oEndDate = oData.GetCurrentBillingPeriod.EndDate;

        this.getView().getModel("smartMeterViewModel").setProperty("/billingPeriodStartDate", oStartDate);
        this.getView().getModel("smartMeterViewModel").setProperty("/billingPeriodEndDate", oEndDate);

        var iOneDay = 1000 * 60 * 60 * 24; //1000ms/s * 60 s/min * 60 min/hr * 24 hr/day 
        var iMillisecondDifference = oEndDate.getTime() - oStartDate.getTime();
        var iNumDays = iMillisecondDifference / iOneDay;

        this._getDefaultGraphData(iNumDays);
    },

    _getDefaultGraphData: function(iBillingPeriodLength) {
        //Check billing cycle and get the appropriate consumption period
        if (iBillingPeriodLength < 31) {
            //By requirements, if the billing period is less than one month (31 days), the monthly view will not be available
            this.getView().getModel("smartMeterViewModel").setProperty("/selectedTimePeriod", sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY);
            this.getView().getModel("smartMeterViewModel").setProperty("/monthlyViewDisabled", true);
            this._getDailyConsumption(new Date());
        } else {
            //Billing period more than a month, show monthly view by default
            this._getMonthlyConsumption();
        }
    },

    _getMonthlyConsumption: function(oDate) {
        //When retrieving monthly data, we should only ever at most retrieve data for the current billing period
        var oStartDate = this.getView().getModel("smartMeterViewModel").getProperty("/billingPeriodStartDate");
        var oEndDate = this.getView().getModel("smartMeterViewModel").getProperty("/billingPeriodEndDate");

        this.getView().getModel("smartMeterViewModel").setProperty("/graphStartDate", oStartDate);
        this.getView().getModel("smartMeterViewModel").setProperty("/graphEndDate", oEndDate);

        //Retreive the consumption for all smart meters and all registers under those meters for this contract
        var oConsumptionParams = {
            aDevices: this.getView().getModel("smartDevices").getProperty("/devices"),
            sDateFrom: oStartDate.toJSON().substring(0, 19),
            sDateTo: oEndDate.toJSON().substring(0, 19)
        };

        this.getDataProvider().loadSmartMeterMonthlyConsumption(oConsumptionParams, this);
    },

    _getDailyConsumption: function(oDate) {
        var oStartDate;
        var oEndDate;
        if (this.getView().getModel("smartMeterViewModel").getProperty("/monthlyViewDisabled") === true) {
            //If monthly view is disabled, this means the billing period is < 31 days
            //In this case only get data for the current billing period
            oStartDate = this.getView().getModel("smartMeterViewModel").getProperty("/billingPeriodStartDate");
            oEndDate = this.getView().getModel("smartMeterViewModel").getProperty("/billingPeriodEndDate");
        } else {
            var iYear = oDate.getUTCFullYear();
            var iMonth = oDate.getUTCMonth();
            oStartDate = new Date(new Date(iYear, iMonth).setUTCHours(0, 0, 0, 0)); //UTC midnight first day of month
            oEndDate = new Date(new Date(iYear, iMonth + 1, 0).setUTCHours(23, 59, 59, 0)); //UTC One second before end of month
        }

        this.getView().getModel("smartMeterViewModel").setProperty("/graphStartDate", oStartDate);
        this.getView().getModel("smartMeterViewModel").setProperty("/graphEndDate", oEndDate);

        //Retreive the consumption for all smart meters and all registers under those meters for this contract
        var oConsumptionParams = {
            aDevices: this.getView().getModel("smartDevices").getProperty("/devices"),
            sDateFrom: oStartDate.toJSON().substring(0, 19),
            sDateTo: oEndDate.toJSON().substring(0, 19)
        };

        this.getDataProvider().loadSmartMeterDailyConsumption(oConsumptionParams, this);
    },

    _getHourlyConsumption: function(oDate) {
        var iYear = oDate.getUTCFullYear();
        var iMonth = oDate.getUTCMonth();
        var iDay = oDate.getUTCDate();

        var oBeginningOfDay = new Date(new Date(iYear, iMonth, iDay).setUTCHours(0, 0, 0, 0)); //UTC midnight of given day
        var oEndOfDay = new Date(new Date(iYear, iMonth, iDay).setUTCHours(23, 59, 59, 0)); //UTC One second before end of day

        this.getView().getModel("smartMeterViewModel").setProperty("/graphStartDate", oBeginningOfDay);
        this.getView().getModel("smartMeterViewModel").setProperty("/graphEndDate", oEndOfDay);

        //Retreive the consumption for all smart meters and all registers under those meters for this contract
        var oConsumptionParams = {
            aDevices: this.getView().getModel("smartDevices").getProperty("/devices"),
            sDateFrom: oBeginningOfDay.toJSON().substring(0, 19),
            sDateTo: oEndOfDay.toJSON().substring(0, 19)
        };

        this.getDataProvider().loadSmartMeterHourlyConsumption(oConsumptionParams, this);
    },

    onLoadConsumptionSuccess: function(oResponse) {
        //Parse the array of register data to be organized by meter and register
        var aMeters = this._prepareMeterData(oResponse.__batchResponses);

        //Get formatted data then assign to the model for the graph (returns object with two arrays for currency and unit representations)
        var oConsumptionFormats = this._formatSmartMeterGraphData(aMeters);
        this.getView().getModel("smartMeterViewModel").setProperty("/consumptionFormats", oConsumptionFormats);
        this.getView().getModel("smartGraph").setProperty("/consumption", oConsumptionFormats.unit);

        //Get previously selected button (unit view by default if no previous selection)
        var sSelectedButton = this.getView().getModel("smartMeterViewModel").getProperty("/selectedButton");
        var aConsumption;
        if (sSelectedButton === sap.umc.mobile.CONSTANTS.SMARTMETER_DISPLAY_TYPE.CURRENCY) {
            //Currency display
            aConsumption = oConsumptionFormats.currency;
        } else {
            //Unit display
            aConsumption = oConsumptionFormats.unit;
        }

        //Set unit/currency button texts
        this._setUnitCurrencyButtonText(oConsumptionFormats);

        //Label will be set according the the current time being displayed, and what range of time is visible (zoom level)
        this._setSmartMeterChartLabel();

        //Handle the graph colours, depends on the number of meters, and if the data contains Historical values, actual values, or both
        this._setSmartMeterChartColours(aMeters, aConsumption);

        //Set the consumption progress bar from the total historical and forecast consumption values
        this._setConsumptionProgressBar(aConsumption);

        //Set the number of visible columns to the total number of columns in this view
        this.byId("smartMeterChart").setNumberOfVisibleCategories(aConsumption.length);
    },

    _prepareMeterData: function(aBatchResponses) {
        //The batch response may contain multiple meters and multiple registers, sort through the data
        //Want to end up with, aMeters = [meter1, meter2, ...], where meter1={DeviceID, [register1, register2, ...]}, and register1=[values...]

        var aMeters = [];

        if (aBatchResponses[0].data.results.length === 0) {
            //No data returned - smart meter tab should be hidden
            this.getView().getParent().getParent().getParent().getItems()[1].setVisible(false);
            return;
        }

        var i, j, sDeviceID, iMeterIndex, oNewMeter, oNewRegister;
        for (i = 0; i < aBatchResponses.length; i++) {
            //Check if the next batch response already has its device number in the array of meters already processed, look in first element of returned data
            iMeterIndex = -1;
            sDeviceID = aBatchResponses[i].data.results[0].DeviceID;
            for (j = 0; j < aMeters.length; j++) {
                if (sDeviceID === aMeters[i].sDeviceID) {
                    //This must be an additional register for the already found meter
                    iMeterIndex = j;
                    break;
                }
            }

            //If the meter was found to already exist, add this register to its array. Otherwise add new entry for the meter
            if (iMeterIndex !== -1) {
                oNewRegister = {
                    sRegisterID: aBatchResponses[i].data.results[0].RegisterID,
                    aResults: aBatchResponses[i].data.results
                };

                aMeters[iMeterIndex].aRegisters.push(oNewRegister);
            } else {
                oNewMeter = {
                    sDeviceID: sDeviceID,
                    aRegisters: [{
                        sRegisterID: aBatchResponses[i].data.results[0].RegisterID,
                        aResults: aBatchResponses[i].data.results
                    }]
                };

                aMeters.push(oNewMeter);
            }
        }

        return aMeters;
    },

    _formatSmartMeterGraphData: function(aMeters) {
        //Each meter will be displayed as one of the stacked bars in the graph, each meter must account for the sum of its registers' consumption.
        //Assume the data for each register is complete and returns for the full time period requested

        var aFormattedUnitConsumption = [];
        var aFormattedCurrencyConsumption = [];
        var i, j, k, iNumTimeSlices, iNumRegisters, iValue, sTimePeriod, sType, oTimestamp;

        //For each meter
        for (i = 0; i < aMeters.length; i++) {
            iNumTimeSlices = aMeters[i].aRegisters[0].aResults.length;

            //For each time slice
            for (j = 0; j < iNumTimeSlices; j++) {
                iNumRegisters = aMeters[i].aRegisters.length;

                oTimestamp = aMeters[i].aRegisters[0].aResults[j].Timestamp;
                sType = aMeters[i].aRegisters[0].aResults[j].ProfileValueType.Description;
                sTimePeriod = this._getTimePeriodDisplayText(this.getView().getModel("smartMeterViewModel").getProperty("/selectedTimePeriod"), oTimestamp);

                //Add the consumption of each register
                iValue = 0;
                for (k = 0; k < iNumRegisters; k++) {
                    iValue += parseFloat(aMeters[i].aRegisters[k].aResults[j].Value);
                }

                //Depending on the type of measurement (unit/currency) add it to the appropriate array
                if (aMeters[i].aRegisters[0].aResults[j].UnitOfMeasure !== "") {
                    aFormattedUnitConsumption.push({
                        type: sType,
                        typeID: aMeters[i].aRegisters[0].aResults[j].ProfileValueTypeID,
                        timePeriod: sTimePeriod,
                        timestamp: oTimestamp,
                        value: iValue,
                        unit: aMeters[i].aRegisters[0].aResults[j].UnitOfMeasure
                    });
                } else if (aMeters[i].aRegisters[0].aResults[j].Currency !== "") {
                    aFormattedCurrencyConsumption.push({
                        type: sType,
                        typeID: aMeters[i].aRegisters[0].aResults[j].ProfileValueTypeID,
                        timePeriod: sTimePeriod,
                        timestamp: oTimestamp,
                        value: iValue,
                        unit: aMeters[i].aRegisters[0].aResults[j].Currency
                    });
                }
            }
        }

        return {
            unit: aFormattedUnitConsumption,
            currency: aFormattedCurrencyConsumption
        };
    },

    _getTimePeriodDisplayText: function(sTimePeriod, oTimestamp) {
        switch (sTimePeriod) {
            case sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY:
                var oMonthDayFormat = sap.ca.ui.model.format.DateFormat.getDateInstance({
                    pattern: "MMM dd"
                });
                return oMonthDayFormat.format(this.getUtils().getDateLocaleTimezone(oTimestamp));

            case sap.umc.mobile.CONSTANTS.TIMEPERIOD.HOUR:
                //Get hour string
                var sTimeString = oTimestamp.toUTCString();
                sTimeString = sTimeString.substring(sTimeString.length - 12, sTimeString.length - 7);
                return sTimeString;

            case sap.umc.mobile.CONSTANTS.TIMEPERIOD.MONTH:
                var oMonthFormat = sap.ca.ui.model.format.DateFormat.getDateInstance({
                    pattern: "MMM yyyy"
                });
                return oMonthFormat.format(this.getUtils().getDateLocaleTimezone(oTimestamp));
        }
    },

    _setUnitCurrencyButtonText: function(oConsumptionFormats) {
        var sUnit = oConsumptionFormats.unit[0].unit;
        var sCurrency = oConsumptionFormats.currency[0].unit;

        this.getView().getModel("smartMeterViewModel").setProperty("/unitButtonText", sUnit);
        this.getView().getModel("smartMeterViewModel").setProperty("/currencyButtonText", sCurrency);
    },

    _setSmartMeterChartLabel: function() {
        //Return the appropriate text for the graph label
        //Ex. "November 2014" for daily view, or "November 27, 2014" for hourly view

        var sTimePeriod = this.getView().getModel("smartMeterViewModel").getProperty("/selectedTimePeriod");

        //Get the timestamp of the first consumption object in the graph array, and convert to local timezone
        var oTimestamp = this.getView().getModel("smartGraph").getProperty("/consumption/0/timestamp");
        var oLocaleTimestamp = this.getUtils().getDateLocaleTimezone(oTimestamp);

        var sLabelText = "";
        switch (sTimePeriod) {
            case sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY:
                var oMonthYearFormat = sap.ca.ui.model.format.DateFormat.getDateInstance({
                    pattern: "MMMM yyyy"
                });
                sLabelText = oMonthYearFormat.format(oLocaleTimestamp);
                break;

            case sap.umc.mobile.CONSTANTS.TIMEPERIOD.HOUR:
                sLabelText = sap.umc.mobile.base.js.formatters.dateFormatter(oLocaleTimestamp);
                break;

            case sap.umc.mobile.CONSTANTS.TIMEPERIOD.MONTH:
                sLabelText = "";
                break;
        }

        this.getView().getModel("smartMeterViewModel").setProperty("/smartMeterChartLabel", sLabelText);
    },

    _setSmartMeterChartColours: function(aMeters, aConsumption) {
        var aChartColours = [];

        var bHistoricalExists = false;
        var bForecastExists = false;
        for (var i = 0; i < aConsumption.length; i++) {
            if (aConsumption[i].typeID === sap.umc.mobile.CONSTANTS.CONSUMPTION_TYPE.HISTORICAL) {
                bHistoricalExists = true;
            } else {
                //Must be forecast
                bForecastExists = true;
            }
        }

        //Decide which colours to include in the array, they must be in the correct order to work with the graph,
        //      order is dependant on number of meters and if there is only historical data, only forecast data, or both
        for (var j = 0; j < aMeters.length; j++) {
            if (bForecastExists) {
                aChartColours.push(this._getHexColour(j, false));
            }
            if (bHistoricalExists) {
                aChartColours.push(this._getHexColour(j, true));
            }
        }

        this.byId("smartMeterChart").setPrimaryColorPalette(aChartColours);
    },

    _getHexColour: function(iIndex, bIsHistoricalColour) {
        //Return a hex colour code for the current index
        //Start with a base value and shift colours towards green for each increase in the index
        //If a forecast colour is to be returned (bIsHistoricalColour false), return a faded colour

        var iBaseRed = 6;
        var iBaseGreen = 78;
        var iBaseBlue = 141;
        var iFadePercentage = 0.5;

        var iRed, iGreen, iBlue;
        if (bIsHistoricalColour) {
            iRed = iBaseRed;
            iGreen = iBaseGreen + (iIndex * 30);
            iBlue = iBaseBlue;
        } else {
            iRed = parseInt(iBaseRed + ((255 - iBaseRed) * iFadePercentage), 10);
            iGreen = parseInt(iBaseGreen + (iIndex * 30) + ((255 - iBaseGreen) * iFadePercentage), 10);
            iBlue = parseInt(iBaseBlue + ((255 - iBaseBlue) * iFadePercentage), 10);
        }

        var sRed = iRed.toString(16);
        var sGreen = iGreen.toString(16);
        var sBlue = iBlue.toString(16);

        //Length of strings in base 16 might be 1 or 2, must be padded to be of length 2
        if (sRed.length === 1) {
            sRed = "0" + sRed;
        }
        if (sGreen.length === 1) {
            sGreen = "0" + sGreen;
        }
        if (sBlue.length === 1) {
            sBlue = "0" + sBlue;
        }


        return "#" + sRed + sGreen + sBlue;
    },

    _setConsumptionProgressBar: function(aConsumption) {
        var iTotalHistorical = 0;
        var iTotalForecast = 0;
        var iPercentageValue, sDisplayValue, iProjectedTotal, sProjectedTotalDisplay, sDateFrom, sDateTo;

        if (aConsumption.length === 0) {
            return;
        }

        for (var i = 0; i < aConsumption.length; i++) {
            if (aConsumption[i].typeID === sap.umc.mobile.CONSTANTS.CONSUMPTION_TYPE.HISTORICAL) {
                //Historical
                iTotalHistorical += aConsumption[i].value;
            } else {
                //Forecast
                iTotalForecast += aConsumption[i].value;
            }
        }

        iProjectedTotal = iTotalHistorical + iTotalForecast;
        iPercentageValue = 100 * (iTotalHistorical / iProjectedTotal);
        sDateFrom = aConsumption[0].timePeriod;
        sDateTo = aConsumption[aConsumption.length - 1].timePeriod;
        sCurrency = aConsumption[0].currency;

        if (this.getView().getModel("smartMeterViewModel").getProperty("/selectedButton") === sap.umc.mobile.CONSTANTS.SMARTMETER_DISPLAY_TYPE.CURRENCY) {
            //Currency selected
            sDisplayValue = sap.umc.mobile.base.js.formatters.amountWithCurrencyFormatter(iTotalHistorical, sCurrency);
            sProjectedTotalDisplay = this.getText("SERVICES.PROJECTED") + ": " + sap.umc.mobile.base.js.formatters.amountWithCurrencyFormatter(iProjectedTotal, sCurrency);
        } else {
            //Unit selected (default if no selection)
            sDisplayValue = sap.umc.mobile.base.js.formatters.amountWithoutCurrencyFormatter(iTotalHistorical) + " " + aConsumption[0].unit;
            sProjectedTotalDisplay = this.getText("SERVICES.PROJECTED") + ": " + sap.umc.mobile.base.js.formatters.amountWithoutCurrencyFormatter(iProjectedTotal) + " " + aConsumption[0].unit;
        }

        this.getView().getModel("smartMeterViewModel").setProperty("/progressBarPercentValue", iPercentageValue);
        this.getView().getModel("smartMeterViewModel").setProperty("/progressBarDisplayValue", sDisplayValue);
        this.getView().getModel("smartMeterViewModel").setProperty("/projectedConsumptonTotal", sProjectedTotalDisplay);
        this.getView().getModel("smartMeterViewModel").setProperty("/progressBarDateFrom", sDateFrom);
        this.getView().getModel("smartMeterViewModel").setProperty("/progressBarDateTo", sDateTo);
    },

    onPressZoomIn: function(oEvent) {
        //Find the selected time slice corresponding to the selected column
        var oTimestamp = this._getSelectedTimeSlice();

        //Decide which time period to zoom in to, and use the timestamp to determine the time range to get
        var sCurrentTimePeriod = this.getView().getModel("smartMeterViewModel").getProperty("/selectedTimePeriod");
        if (sCurrentTimePeriod === sap.umc.mobile.CONSTANTS.TIMEPERIOD.MONTH) {
            //Zoom in to daily view
            this.getView().getModel("smartMeterViewModel").setProperty("/selectedTimePeriod", sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomInButtonEnabled", true);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomOutButtonEnabled", true);
            this._getDailyConsumption(oTimestamp);

        } else if (sCurrentTimePeriod === sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY) {
            //Zoom in to hourly view
            this.getView().getModel("smartMeterViewModel").setProperty("/selectedTimePeriod", sap.umc.mobile.CONSTANTS.TIMEPERIOD.HOUR);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomInButtonEnabled", false);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomOutButtonEnabled", true);
            this._getHourlyConsumption(oTimestamp);

        }
    },

    onPressZoomOut: function(oEvent) {
        //Find the selected time slice corresponding to the selected column
        var oTimestamp = this._getSelectedTimeSlice();

        //Decide which time period to zoom out to, and use the timestamp to determine the time range to get
        var sCurrentTimePeriod = this.getView().getModel("smartMeterViewModel").getProperty("/selectedTimePeriod");
        if (sCurrentTimePeriod === sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY) {
            //Zoom out to monthly view
            this.getView().getModel("smartMeterViewModel").setProperty("/selectedTimePeriod", sap.umc.mobile.CONSTANTS.TIMEPERIOD.MONTH);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomInButtonEnabled", true);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomOutButtonEnabled", false);
            this._getMonthlyConsumption();

        } else if (sCurrentTimePeriod === sap.umc.mobile.CONSTANTS.TIMEPERIOD.HOUR) {
            //Zoom out to daily view

            //If monthly view is disabled, make sure the zoom out button is disabled
            var bMonthlyViewDisabled = this.getView().getModel("smartMeterViewModel").getProperty("/monthlyViewDisabled");

            this.getView().getModel("smartMeterViewModel").setProperty("/selectedTimePeriod", sap.umc.mobile.CONSTANTS.TIMEPERIOD.DAY);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomInButtonEnabled", true);
            this.getView().getModel("smartMeterViewModel").setProperty("/zoomOutButtonEnabled", !bMonthlyViewDisabled);
            this._getDailyConsumption(oTimestamp);

        }
    },

    _getSelectedTimeSlice: function() {
        //Find the selected column index and get the consumption object for a meter in that column
        var iSelectedCategoryIndex = this.byId("smartMeterChart")._selectedCatIdx;
        var oConsumption = this.getView().getModel("smartGraph").getProperty("/consumption/" + iSelectedCategoryIndex);

        if (oConsumption === undefined) {
            //If oConsumption undefined, index must be out of bounds (may happen in case of zoom out where selection has not changed since zooming in, 
            //      the old index is still "selected" and invalid) get the highest available timeslice instead
            var iConsumptionLength = this.getView().getModel("smartGraph").getProperty("/consumption").length;
            oConsumption = this.getView().getModel("smartGraph").getProperty("/consumption/" + (iConsumptionLength - 1));
        }

        return oConsumption.timestamp;
    },

    onCurrencyUnitSwitchPressed: function(oButton, sID) {
        var sSelectedButton = oButton.getParameter("button").getProperty("text");

        var aConsumption;
        if (sSelectedButton === this.getView().getModel("smartMeterViewModel").getProperty("/unitButtonText")) {
            //Unit selected
            aConsumption = this.getView().getModel("smartMeterViewModel").getProperty("/consumptionFormats/unit");
            this.getView().getModel("smartMeterViewModel").setProperty("/selectedButton", sap.umc.mobile.CONSTANTS.SMARTMETER_DISPLAY_TYPE.UNIT);
            this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", true);
        } else {
            //Currency selected
            aConsumption = this.getView().getModel("smartMeterViewModel").getProperty("/consumptionFormats/currency");
            this.getView().getModel("smartMeterViewModel").setProperty("/selectedButton", sap.umc.mobile.CONSTANTS.SMARTMETER_DISPLAY_TYPE.CURRENCY);
            this.getView().getModel("viewModel").setProperty("/bShowConsumptionDownloadButton", false);
        }

        this.getView().getModel("smartGraph").setProperty("/consumption", aConsumption);

        //Set the consumption progress bar from the total historical and forecast consumption values
        this._setConsumptionProgressBar(aConsumption);

        //Set the number of visible columns to the total number of columns in this view
        this.byId("smartMeterChart").setNumberOfVisibleCategories(aConsumption.length);
    },

    onConsumptionDownloadPressed: function() {
        //The process to download consumption data has two steps:
        //  1) First retrieve the key by retreiving the entity set for ProfileValuesFiles
        //  2) Use the key to retreive the file 

        var oConsumptionParams = {
            sContractID: this.getView().getModel("smartDevices").getProperty("/devices/0/ContractID"),
            sOutputInterval: this.getView().getModel("smartMeterViewModel").getProperty("/selectedTimePeriod"),
            sDateFrom: this.getView().getModel("smartMeterViewModel").getProperty("/graphStartDate").toJSON().substring(0, 19),
            sDateTo: this.getView().getModel("smartMeterViewModel").getProperty("/graphEndDate").toJSON().substring(0, 19)
        };

        //Open a popup in this click handler to avoid browsers blocking it as a popup when opened in the oData callback
        this.oConsumptionDownloadWindow = window.open();

        this.getDataProvider().loadConsumptionDownloadKey(oConsumptionParams, this);
    },

    loadConsumptionDownloadKeySuccess: function(oData) {
        //With the key we can download the file containing consumption data
        var sConsumptionDownloadKey = oData.results[0].ProfileValuesFileID;

        var sFileURL = this.getDataProvider().ERP.oServiceModel.sServiceUrl + "/ProfileValuesFiles('" + sConsumptionDownloadKey + "')/$value";

        this.oConsumptionDownloadWindow.location = sFileURL;
    }

});
