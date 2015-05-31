jQuery.sap.declare("sap.umc.mobile.services.js.utils");

sap.umc.mobile.services.js.utils = jQuery.extend(sap.umc.mobile.app.js.utils, {
	dateOfNextBillingCycle: function() {
		var dCurrent = new Date();
		var dDate;
		if (dCurrent.getMonth() == 11) {
			dDate = new Date(dCurrent.getFullYear() + 1, 0, 1);
		} else {
			dDate = new Date(dCurrent.getFullYear(), dCurrent.getMonth() + 1, 1);
		}
		return dDate;
	},
	getMonthNameById: function(sMonthID) {
		var aMonths = sap.umc.mobile.app.js.utils.getMonths();
		for ( var i = 0; i < aMonths.length; i++) {
			if (aMonths[i].MonthID == sMonthID) {
				return aMonths[i].Month;
			}
		}
	},
	getMonthIdByName: function(sMonth) {
		var aMonths = sap.umc.mobile.app.js.utils.getMonths();
		for ( var i = 0; i < aMonths.length; i++) {
			if (aMonths[i].Month == sMonth) {
				return aMonths[i].MonthID;
			}
		}
	},
	productFormatter: function(sProduct, sDescription) {
		return sProduct + "-" + sDescription;
	},
	contractDateFormatter: function(sStartDate, sEndDate) {
		var dStartDate = new Date(sStartDate);
		var dUTCStartDate = new Date(dStartDate.getUTCFullYear(), dStartDate.getUTCMonth(), dStartDate.getUTCDate());
		var dEndDate = new Date(sEndDate);
		var dUTCEndDate = new Date(dEndDate.getUTCFullYear(), dEndDate.getUTCMonth(), dEndDate.getUTCDate());
		var dCurrentDate = new Date();

		if (Date.parse(dEndDate) < Date.parse(dCurrentDate)) {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.ENDS_ON") + " " + sap.umc.mobile.app.js.formatters.dateFormatter(dUTCEndDate);
		} else {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.ACTIVE_SINCE") + " " + sap.umc.mobile.app.js.formatters.dateFormatter(dUTCStartDate);
		}
	},
	getUpdatedConsumptionModel: function(oConsumpionModel, oControlModel, dCurrentDate) {
		var dDate = new Date(dCurrentDate);
		var dStandardDate = new Date(dDate.getFullYear() - 1, dDate.getMonth(), 15, 15, 33, 33, 0);
		var iStandardTime = Date.parse(dStandardDate);
		for ( var i = 0; i < oConsumpionModel.getData().results.length; i++) {
			dDate = new Date(parseInt(oConsumpionModel.getData().results[i].BillingPeriodYear, 10), parseInt(
					oConsumpionModel.getData().results[i].BillingPeriodMonth, 10) - 1, 10, 15, 33, 33, 0);
			oConsumpionModel.getData().results[i].YearCatogory = this._getYearCatogory(iStandardTime, Date.parse(dDate));
			oConsumpionModel.getData().results[i].DisplayPeriod = this._getDisplayPeriod(oConsumpionModel.getData().results[i].YearCatogory, dDate);
			if (oControlModel.IsConsumption) {
				oConsumpionModel.getData().results[i].DisplayValue = oConsumpionModel.getData().results[i].ConsumptionValue;
				oConsumpionModel.getData().results[i].DisplayUnit = oConsumpionModel.getData().results[i].ConsumptionUnit;
			} else {
				oConsumpionModel.getData().results[i].DisplayValue = oConsumpionModel.getData().results[i].BilledAmount;
				oConsumpionModel.getData().results[i].DisplayUnit = oConsumpionModel.getData().results[i].Currency;
			}
		}
		this._checkNumberOfYears(oControlModel.IsLess, oConsumpionModel, dCurrentDate);				
		return oConsumpionModel;
	},
	getUpdatedConsumptionAverage: function(oConsumpionModel, iAverageValue) {
		for ( var i = 0; i < oConsumpionModel.getData().results.length; i++) {
			oConsumpionModel.getData().results[i].AverageValue = iAverageValue;
		}
		return oConsumpionModel;
	},
	_checkNumberOfYears: function(bIsLess, oConsumpionModel, dCurrentDate) {
		var aCurrentYear = [];
		if (bIsLess) {
			for ( var i = 0; i < oConsumpionModel.getData().results.length; i++) {
				if (oConsumpionModel.getData().results[i].YearCatogory === sap.ui.getCore().getModel("i18n").getProperty("SERVICES.CURRENT_PERIOD")) {
					aCurrentYear.push(oConsumpionModel.getData().results[i]);
				}
			}
			oConsumpionModel.setData({
				results: aCurrentYear
			});
		} else {
			var dDate = new Date(dCurrentDate);
			var iMonth = parseInt(dDate.getMonth(), 10) + 1;
			for ( var i = iMonth; i < 12; i++) {
				for ( var j = 0; j < oConsumpionModel.getData().results.length; j++) {
					if (parseInt(oConsumpionModel.getData().results[j].BillingPeriodMonth, 10) === i + 1) {
						aCurrentYear.push(oConsumpionModel.getData().results[j]);
					}
				}
			}
			for ( var i = 0; i < iMonth; i++) {
				for ( var j = 0; j < oConsumpionModel.getData().results.length; j++) {
					if (parseInt(oConsumpionModel.getData().results[j].BillingPeriodMonth, 10) === i + 1) {
						aCurrentYear.push(oConsumpionModel.getData().results[j]);
					}
				}
			}
			oConsumpionModel.setData({
				results: aCurrentYear
			});
		}
	},
	_getDisplayPeriod: function(sYearCatogory, dDate) {
		if (sYearCatogory === sap.ui.getCore().getModel("i18n").getProperty("SERVICES.PREVIOUS_PERIOD")) {
			dDate = new Date(parseInt(dDate.getFullYear(), 10) + 1, parseInt(dDate.getMonth(), 10), 10, 15, 33, 33, 0);
		}
		return this._getFormattedDate(dDate);
	},
	_getFormattedDate: function(value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MMM"
			});
			return oDateFormat.format(value);
		} else {
			return value;
		}
	},
	_getYearCatogory: function(iStandard, iPeriod) {
		if (iStandard < iPeriod) {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.CURRENT_PERIOD");
		} else {
			// " " space added for bar order issue
			return " " + sap.ui.getCore().getModel("i18n").getProperty("SERVICES.PREVIOUS_PERIOD");
		}
	},
	toggleEnable: function(sConsumption) {
		if (sConsumption === "NoData") {
			return false;
		} else if(sConsumption === "OneYear"){
			return false;
		} else {
			return true;
		}
	},
	graphVisible: function(sConsumption) {
		if (sConsumption === "NoData") {
			return false;
		} else {
			return true;
		}
	},
	labelVisible: function(sConsumption) {
		if (sConsumption === "NoData") {
			return true;
		} else {
			return false;
		}
	},
	toggleUnitText: function(sConsumption) {
		if (sConsumption) {
			return sConsumption;
			//sap.ui.getCore().getModel("i18n").getProperty("SERVICES.COST");
		} else {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.UNIT");
		}
	},
	toggleCostText: function(sCost) {
		if (sCost) {
			return sCost;			
		} else {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.COST");
		}
	},
	toggleYearText: function(bYear) {
		if (bYear) {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.MORE");
		} else {
			return sap.ui.getCore().getModel("i18n").getProperty("SERVICES.LESS");
		}
	},
	getDateLocaleTimezone: function(oDate) {
        //Converts a given UTC date to the current timezone
        return new Date(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(), oDate.getUTCHours(), oDate.getUTCMinutes(), oDate.getUTCSeconds());
    }

});