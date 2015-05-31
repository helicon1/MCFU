jQuery.sap.declare("sap.umc.mobile.services.model.OnlineDataProvider");
sap.umc.mobile.services.model.OnlineDataProvider = {

	_readServices: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "ContractItems", ["$format=json", "$expand=Premise,Division,Product,BusinessAgreement"], true, {
			fnSuccess: fnCallback
		});
	},
	_readBudgetBillingPlan: function(sContractID, fnSuccess, fnError) {
		this.ERP.read("Contracts" + "('" + sContractID + "')", ["$format=json", "$expand=ActiveBudgetBillingPlan/BudgetBillingCycle"], true, {
			fnSuccess: jQuery.proxy(function(oData) {
				if (oData.ActiveBudgetBillingPlan.BudgetBillingPlanID !== "") {
					fnSuccess(oData);
				} else {
					fnError();
				}
			}, this),
			fnError: fnError
		});
	},
	_readPaymentPlan: function(sContractID, fnSuccess, fnError) {
		this.ERP.read("Contracts" + "('" + sContractID + "')", ["$format=json", "$expand=ActivePaymentPlan/BudgetBillingCycle"], true, {
			fnSuccess: jQuery.proxy(function(oData) {
				fnSuccess(oData);
			}, this),
			fnError: fnError
		});
	},
	_updateBudgetBillingPlan: function(oPlan, fnSuccess) {
		var oData = $.extend(true, {}, oPlan);
		oData.Amount = oPlan.NewAmount;
		oData.ChangeFromDate = oPlan.EffectiveDate;
		delete oData.EffectiveDate;
		delete oData.NewAmount;
		delete oData.BudgetBillingCycle;
		var sPath = "BudgetBillingPlans(ContractID='" + oData.ContractID + "',BudgetBillingPlanID='" + oData.BudgetBillingPlanID + "')";
		this.ERP.updateEntity(sPath, [], oData, {
			fnSuccess: fnSuccess
		});
	},

	_simulatePaymentPlan: function(sContractID, sMonth, sYear, fnSuccess, oDelegate) {
		this.ERP.functionImport("SimulatePaymentPlan", sap.umc.mobile.CONSTANTS.HTTP_GET, {
			ContractID: sContractID,
			StartingMonth: sMonth,
			Year: sYear
		}, true, {
			fnSuccess: jQuery.proxy(function(oData) {
				this.ERP.read("BudgetBillingCycles(BudgetBillingCycleID='" + oData.PaymentPlanCycleID + "')", [], true, {
					fnSuccess: $.proxy(function(oPlanCycle) {
						fnSuccess(oData, oPlanCycle);
					}, this)
				}, this);
			}, this),
			fnError: jQuery.proxy(function() {
				oDelegate._onSimulatePPlanWithError();
			}, this)
		});
	},
	_createPaymentPlan: function(sContractID, sMonth, sYear, fnSuccess) {
		var oPaymentPlan = {};
		oPaymentPlan.ContractID = sContractID;
		oPaymentPlan.StartingMonth = sMonth;
		oPaymentPlan.Year = sYear;
		this.ERP.createEntity("PaymentPlans", oPaymentPlan, {
			fnSuccess: fnSuccess
		});
	},
	_removePaymentPlan: function(sPaymentPlanID, sContractID, fnSuccess) {
		this.ERP.removeEntity("/PaymentPlans", ["ContractID='" + sContractID + "',PaymentPlanID='" + sPaymentPlanID + "'"], {
			fnSuccess: fnSuccess
		});
	},

	_readDevices: function(sContractID, fnSuccess, fnError) {
		this.ERP.read("Contracts" + "('" + sContractID + "')/Devices", ["$format=json", "$expand=IntervalRegistersToRead"], true, {
			fnSuccess: fnSuccess,
			fnError: fnError
		});
	},

	_readRegisters: function(sDeviceID, fnSuccess) {
		this.ERP.read("Devices" + "('" + sDeviceID + "')/RegistersToRead", ["$format=json",
				"$expand=RegisterType,MeterReadingReason,MeterReadingCategory"], true, {
			fnSuccess: fnSuccess
		});
	},

	_createMeterReading: function(sDeviceID, oDataForInsert, fnSuccess, fnError, oDelegate) {
		this.ERP.createEntity("Devices('" + sDeviceID + "')/MeterReadingResults", oDataForInsert, {
			fnSuccess: fnSuccess,
			fnError: fnError
		});
	},

	_readMeterReadingNotes: function(fnSuccess) {
		this.ERP.read("MeterReadingNotes", ["$format=json"], true, {
			fnSuccess: fnSuccess
		});
	},

	_readMeterReadingHistory: function(sDeviceID, fnSuccess) {
		this.ERP.read("Devices" + "('" + sDeviceID + "')/MeterReadingResults", ["$format=json",
				"$expand=MeterReadingStatus,MeterReadingCategory,MeterReadingReason"], true, {
			fnSuccess: fnSuccess
		});
	},

	_readConsumptionData: function(sContractID, oDelegate) {
		this.ERP.read("GetCurrentBillingPeriod", ["ContractID='" + sContractID + "'", "$format=json"], true, {
			fnSuccess: jQuery.proxy(function(oData) {
				if (oData.GetCurrentBillingPeriod && oData.GetCurrentBillingPeriod.StartDate) {
					var dCurrentDate = new Date(oData.GetCurrentBillingPeriod.StartDate);
					this.dCurrentDate = dCurrentDate;
					var dDatetime = (dCurrentDate.getFullYear() - 2) + "-" + (dCurrentDate.getMonth() + 1) + "-" + dCurrentDate.getDate() + "T15:15:00";
					var sPath = "Contracts('" + sContractID + "')/" + "ContractConsumptionValues";
					var sFilterOptions = "$filter=StartDate ge datetime'" + dDatetime + "' and ConsumptionPeriodTypeID eq 'BC'"
							+ "&$expand=MeterReadingCategory";
					this.ERP.read(sPath, [sFilterOptions, "$format=json"], true, {
						fnSuccess: jQuery.proxy(function(oData) {
							if (oData.results) {
								this.oConsumption.setSizeLimit(oData.results && oData.results.length);
								this.oConsumption.setData(oData);
								oDelegate.onConsumptionLoaded(this.oConsumption, dCurrentDate);
							} else {
								oDelegate.onConsumptionLoadFailed();
							}
						}, this),
						fnError: jQuery.proxy(function(oData) {
							oDelegate.onConsumptionLoadFailed();
						}, this)
					});
				}
			}, this)
		});
	},
	_readContractAccounts: function(sBuagID, fnCallback) {
		this.ERP.read(this.getAccountPath() + "ContractAccounts" + "('" + sBuagID + "')", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readSmartMeterConsumption: function(oConsumptionParams, fnSuccess) {
		var aBatchOperations = [];

		// Get read operations for each meter
		var aDevices = oConsumptionParams.aDevices;
		var i, j, aRegisters, oBatchOperation, sDeviceID, sRegisterID;
		for (i = 0; i < aDevices.length; i++) {
			// Get operation for each register under this meter
			aRegisters = aDevices[i].IntervalRegistersToRead.results;
			for (j = 0; j < aRegisters.length; j++) {
				sDeviceID = aRegisters[i].DeviceID;
				sRegisterID = aRegisters[i].RegisterID;

				oBatchOperation = this._getReadSmartMeterOperation(sDeviceID, sRegisterID, oConsumptionParams.sDateFrom, oConsumptionParams.sDateTo,
						oConsumptionParams.sOutputInterval);

				aBatchOperations.push(oBatchOperation);
			}
		}

		this.ERP.clearBatch();
		this.ERP.addBatchReadOperations(aBatchOperations);
		this.ERP.submitBatch({
			fnSuccess: fnSuccess
		}, true);

	},

	_getReadSmartMeterOperation: function(sDeviceID, sRegisterID, sDateFrom, sDateTo, sOutputInterval) {
		var sUrl = "RegistersToRead(DeviceID='" + sDeviceID + "',RegisterID='" + sRegisterID + "')/ProfileValues";

		var sFilter = "?$filter=Timestamp+ge+datetime'" + sDateFrom + "'+and+Timestamp+le+datetime'" + sDateTo + "'+and+OutputInterval+eq+'"
				+ sOutputInterval + "'";

		var sExpand = "&$expand=ProfileValueType";

		return this.ERP.createBatchOperation(sUrl + sFilter + sExpand, sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},

	_readBillingPeriod: function(sContractID, fnCallback) {
		this.ERP.read("GetCurrentBillingPeriod", ["ContractID='" + sContractID + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readConsumptionDownloadKey: function(oConsumptionParams, fnCallback) {
		var sFilter = "$filter=Timestamp+ge+datetime'" + oConsumptionParams.sDateFrom + "'+and+Timestamp+le+datetime'" + oConsumptionParams.sDateTo
				+ "'+and+OutputInterval+eq+'" + oConsumptionParams.sOutputInterval + "'";

		this.ERP.read("Contracts('" + oConsumptionParams.sContractID + "')/ProfileValuesFiles", [sFilter, "$format=json"], true, {
			fnSuccess: fnCallback
		});
	}
};
