jQuery.sap.declare("sap.umc.mobile.services.model.DataProvider");

sap.umc.mobile.services.model.DataProvider = {
	loadServices: function(oDelegate) {
		this.oPremises = new sap.ui.model.json.JSONModel();
		var fnCallBack = jQuery.proxy(function(oData) {
			if (oData && oData.results) {
				var i, j, iPremiseIndex, bPremiseFound, aContracts, oContractForPremise, oPremiseWithContracts;
				aContracts = oData.results;
				var aPremises = [];
				iPremiseIndex = 0;
				for (i = 0; i < aContracts.length; i++) {
					bPremiseFound = false;
					for (j = 0; j < aPremises.length; j++) {
						if (aPremises[j].PremiseID === aContracts[i].Premise.PremiseID) {
							oContractForPremise = sap.umc.mobile.app.js.utils.copyObjectProperties(sap.umc.mobile.app.js.utils
									.deleteLocalProperties(aContracts[i]));
							delete oContractForPremise.Premise;
							aPremises[j]._contracts.push(oContractForPremise);
							bPremiseFound = true;
							break;
						}
					}
					if (bPremiseFound === false) {
						oPremiseWithContracts = aContracts[i].Premise;
						oContractForPremise = sap.umc.mobile.app.js.utils.copyObjectProperties(sap.umc.mobile.app.js.utils
								.deleteLocalProperties(aContracts[i]));
						delete oContractForPremise.Premise;
						oPremiseWithContracts._contracts = [oContractForPremise];
						oPremiseWithContracts._ID = iPremiseIndex;
						iPremiseIndex++;
						aPremises.push(oPremiseWithContracts);
					}
				}
				for(var k = 0; k < aPremises.length; k++){
					aPremises[k]._contracts.reverse();
				}				
				// fix default premise with home tiles
				aPremises.reverse();
				this.oPremises.setData(aPremises);
				oDelegate.onPremisesLoaded(this.oPremises);
			}
			
		}, this);
		this._readServices(fnCallBack);
	},
	getContractByID: function(sContractID) {
		var aPremises = this.oPremises.getProperty("/");
		this.oContract = {};
		for ( var i = 0; i < aPremises.length; i++) {
			for ( var j = 0; j < aPremises[i]._contracts.length; j++) {
				if (aPremises[i]._contracts[j].ContractID === sContractID) {
					this.oContract = {
							address: aPremises[i].AddressInfo.ShortForm,
							contract: aPremises[i]._contracts[j],
							division: aPremises[i]._contracts[j].Division.Description,

							devices: aPremises[i]._contracts[j].aDivices

					};
					return this.oContract;
				}
			}
		}
	},
	loadConsumption: function(sContractID, oDelegate) {
		if (!this.oConsumption) {
			this.oConsumption = new sap.ui.model.json.JSONModel();
		}
		this._readConsumptionData(sContractID, oDelegate);
	},
	reloadConsumption: function(oDelegate) {
		if (this.oConsumption && this.oConsumption.getData().results) {
			oDelegate.onConsumptionLoaded(this.oConsumption, this.dCurrentDate);
		}
	},
	loadMeterReading: function(oDelegate) {
	},
	loadBudgetBilling: function(oDelegate) {
		this.oBBPModel = new sap.ui.model.json.JSONModel();
		var fnSuccess = jQuery.proxy(function(oData) {
			oData.ActiveBudgetBillingPlan.EffectiveDate = sap.umc.mobile.services.js.utils.dateOfNextBillingCycle();
			oData._bHasBB = true;
			this.oBBPModel.setData(oData.ActiveBudgetBillingPlan);
			oDelegate.onBudgetBillingLoaded(this.oBBPModel);
		}, this);
		var fnError = jQuery.proxy(function(oError) {
			this.oBBPModel.setData({
				Amount: "0",
				_bHasBB: false
			});
			oDelegate.onBudgetBillingLoaded(this.oBBPModel);
		}, this);
		this._readBudgetBillingPlan(this.oContract.contract.ContractID, fnSuccess, fnError);
	},
	loadPaymentPlan: function(oDelegate) {
		this.oPPModel = new sap.ui.model.json.JSONModel();
		var fnSuccess = jQuery.proxy(function(oData) {
			if (oData.ActivePaymentPlan.PaymentPlanID !== "") { // if user has a payment plan already
				oData.ActivePaymentPlan.OptedIn = true;
				oData.ActivePaymentPlan.Months = sap.umc.mobile.services.js.utils.getMonthNameById(oData.ActivePaymentPlan.StartingMonth);
				oData.ActivePaymentPlan.Years = oData.ActivePaymentPlan.Year;
				oData.ActivePaymentPlan._bHasPP = true;
				oData.ActivePaymentPlan._bNotOptedIn = !oData.ActivePaymentPlan.OptedIn;
				oData.ActivePaymentPlan._bSwitch = oData.ActivePaymentPlan.OptedIn;
				this.oPPModel.setData(oData.ActivePaymentPlan);
			} else { // user doesn't have a payment plan but is ellgible
				oData.OptedIn = false;
				oData._bHasPP = true;
				oData._bNotOptedIn = !oData.OptedIn;
				oData._bSwitch = oData.OptedIn;
				this.oPPModel.setData(oData);
			}
			oDelegate.onPaymentPlanLoaded(this.oPPModel);
		}, this);
		var fnError = jQuery.proxy(function(oError) {
			this.oPPModel.setData({
				_bHasPP: false,
				_bNotOptedIn: false
			});
			oDelegate.onPaymentPlanLoaded(this.oPPModel);
		}, this);

		this._readPaymentPlan(this.oContract.contract.ContractID, fnSuccess, fnError);
	},
	updateBudgetBillingPlan: function(oPlan, fnSuccess) {
		this._updateBudgetBillingPlan(oPlan, fnSuccess);
	},
	updatePaymentPlan: function(oPlan, bOptIn, fnSuccess) {
		if (!bOptIn) {
			var sMonth = sap.umc.mobile.services.js.utils.getMonthIdByName(oPlan.Months);
			var sYear = oPlan.Years;
			var fnSuccessCallback = jQuery.proxy(function(oData) {
				this.oPPModel.setProperty("/PaymentPlanID", oData.PaymentPlanID);
				this.oPPModel.setProperty("/OptedIn", true);
				this.oPPModel.setProperty("/_bNotOptedIn", false);
				fnSuccess();
			}, this);
			this._createPaymentPlan(this.oContract.contract.ContractID, sMonth, sYear, fnSuccessCallback);
		} else {
			if (oPlan.PaymentPlanID) {
				var fnRemoveCallback = jQuery.proxy(function() {
					this.oPPModel.setProperty("/Amount", "0");
					this.oPPModel.setProperty("/Months", "");
					this.oPPModel.setProperty("/Years", "");
					this.oPPModel.setProperty("/BudgetBillingCycle", null);
					this.oPPModel.setProperty("/OptedIn", false);
					this.oPPModel.setProperty("/PaymentPlanID", "");
					this.oPPModel.setProperty("/_bNotOptedIn", true);
					fnSuccess();
				}, this);
				this._removePaymentPlan(oPlan.PaymentPlanID, this.oContract.contract.ContractID, fnRemoveCallback);
			}
		}
	},
	simulatePaymentPlan: function(sMonth, sYear, oDelegate) {
		if (!sMonth) {
			sMonth = (sap.umc.mobile.services.js.utils.dateOfNextBillingCycle().getMonth() + 1).toString();
		} else {
			sMonth = sap.umc.mobile.services.js.utils.getMonthIdByName(sMonth);
		}
		if (!sYear) {
			sYear = sap.umc.mobile.services.js.utils.dateOfNextBillingCycle().getFullYear().toString();
		}
		var fnSuccess = jQuery.proxy(function(oData, oCycle) {
			this.oPPModel.setProperty("/Months", sap.umc.mobile.services.js.utils.getMonthNameById(oData.StartingMonth));
			this.oPPModel.setProperty("/Years", oData.Year);
			this.oPPModel.setProperty("/BudgetBillingCycle", oCycle);
			this.oPPModel.setProperty("/Amount", oData.Amount);
			this.oPPModel.setProperty("/Currency", oData.Currency);
		}, this);
		
		this._simulatePaymentPlan(this.oContract.contract.ContractID, sMonth, sYear, fnSuccess, oDelegate);
	},

	loadRegisters: function(sDeviceID, oDelegate) {
		this.oRegisters = new sap.ui.model.json.JSONModel();
		var fnCallBack = jQuery.proxy(function(oData) {
			var aRegisters = [];
			if (oData && oData.results) {
				aRegisters = oData.results;

				for ( var i = 0; i < aRegisters.length; i++) {
					aRegisters[i].registerValue = "0";
				}
			}
			this.oRegisters.setData(aRegisters);
			oDelegate.onRegistersLoaded(aRegisters);
		}, this);

		this._readRegisters(sDeviceID, fnCallBack);
	},

	loadDevices: function(sContractID, oDelegate) {
		this.oDevices = new sap.ui.model.json.JSONModel();
		var fnSuccess = jQuery.proxy(function(oData) {
			var aDevices = [];
			if (oData && oData.results) {
				aDevices = oData.results;
			}
			this.oDevices.setData(aDevices);
			oDelegate.onDevicesLoaded(this.oDevices);
		}, this);

		var fnError = jQuery.proxy(oDelegate.onDevicesLoadedError, oDelegate);

		this._readDevices(sContractID, fnSuccess, fnError);
	},

	loadMeterReadingNotes: function(oDelegate) {
		this.oMeterReadingNotes = new sap.ui.model.json.JSONModel();
		var fnCallBack = jQuery.proxy(function(oData) {
			var aMeterReadingNotes = [];
			if (oData && oData.results) {
				aMeterReadingNotes = oData.results;
			}
			this.oMeterReadingNotes.setData(aMeterReadingNotes);
			oDelegate.onMeterReadingNotesLoaded(this.oMeterReadingNotes);

		}, this);

		this._readMeterReadingNotes(fnCallBack);
	},

	loadMeterReadingHistory: function(sDeviceID, oDelegate) {
		this.oMeterReadingHistory = new sap.ui.model.json.JSONModel();
		var fnCallBack = jQuery.proxy(function(oData) {
			var aMeterReadingHistory = [];
			if (oData && oData.results) {
				aMeterReadingHistory = oData.results;
			}
			this.oMeterReadingHistory.setData(aMeterReadingHistory);
			oDelegate.onMeterReadingHistoryLoaded(this.oMeterReadingHistory);
		}, this);

		this._readMeterReadingHistory(sDeviceID, fnCallBack);
	},
	
	loadBudgetBillingProcedure: function(sBuagID, fnCallback){
		var fnSuccess = function(oData){
			if(oData){
				fnCallback(oData.BudgetBillingProcedure);
			}
		};
		this._readContractAccounts(sBuagID, fnSuccess);
	},

	createMeterReading: function(sDeviceID, oDataForInsert, oDelegate) {
		var fnError = jQuery.proxy(function(oError) {
			var jsonObj = JSON.parse(oError.response.body);
			var plausibleWarning = false;
			if (jsonObj.error.innererror) {

				for ( var i = 0; i < jsonObj.error.innererror.errordetails.length - 1; i++) {
					if (jsonObj.error.innererror.errordetails[i].severity === "warning") {
						var code = jsonObj.error.innererror.errordetails[i].code;
						if (code === "PLAUSIBILITY_ERROR") {
							plausibleWarning = true;
						} else {
						}
					}
				}
			}

			oDelegate.onMeterReadingCreationFinishedWithError(plausibleWarning);
		}, this);

		var fnSuccess = jQuery.proxy(function() {
			oDelegate.onMeterReadingCreationFinishedWithSuccess();
		});

		if(this.isMock){
			oDelegate.onMeterReadingCreationFinishedWithSuccess();
		}else{
			this._createMeterReading(sDeviceID, oDataForInsert, fnSuccess, fnError);
		}
	},

	loadSmartMeterDailyConsumption: function(oConsumptionParams, oDelegate) {
		var fnSuccess = jQuery.proxy(oDelegate.onLoadConsumptionSuccess, oDelegate);

		oConsumptionParams.sOutputInterval = "DAY";
		this._readSmartMeterConsumption(oConsumptionParams, fnSuccess);
	},
	
	loadSmartMeterHourlyConsumption: function(oConsumptionParams, oDelegate) {
		var fnSuccess = jQuery.proxy(oDelegate.onLoadConsumptionSuccess, oDelegate);

		oConsumptionParams.sOutputInterval = "60";
		this._readSmartMeterConsumption(oConsumptionParams, fnSuccess);
	},

	loadSmartMeterMonthlyConsumption: function(oConsumptionParams, oDelegate) {
		var fnSuccess = jQuery.proxy(oDelegate.onLoadConsumptionSuccess, oDelegate);

		oConsumptionParams.sOutputInterval = "MON";
		this._readSmartMeterConsumption(oConsumptionParams, fnSuccess);
	},

	loadBillingPeriod: function(sContractID, oDelegate) {
		var fnSuccess = jQuery.proxy(oDelegate.onLoadBillingPeriodSuccess, oDelegate);

		this._readBillingPeriod(sContractID, fnSuccess);
	},

	loadConsumptionDownloadKey: function(oConsumptionParams, oDelegate) {
		var fnSuccess = jQuery.proxy(oDelegate.loadConsumptionDownloadKeySuccess, oDelegate);

		this._readConsumptionDownloadKey(oConsumptionParams, fnSuccess);
	}
};