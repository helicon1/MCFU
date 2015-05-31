jQuery.sap.declare("sap.umc.mobile.change_service.model.OnlineDataProvider");
sap.umc.mobile.change_service.model.OnlineDataProvider = {
	_readQuotations: function(fnCallback) {
		this.CRM.read("QuotationItems", ["$expand=Premise,Product/Division,DocumentStatus,Product/UtilitiesProductPrices/PriceConditionType", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},
	_readPendingContracts: function(fnCallback) {
		var dDateFrom = new Date();
		var sDateFrom = dDateFrom.getFullYear() + "-" + (dDateFrom.getMonth() + 1) + "-" + dDateFrom.getDate() + "T00:00:00";
		this.CRM.read("ContractItemTimeSlices", ["$expand=Product/Division,ContractItem/Premise,DocumentStatus,Product/UtilitiesProductPrices/PriceConditionType",
				"$filter=(StartDate gt datetime'" + sDateFrom + "')", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readSuppliers: function(fnCallback) {
		//Need to verify how to get the division for suppliers
		var sDivision = "01";

		this.ERP.read("ServiceProviders", ["$filter=(DivisionID eq '" + sDivision + "' and ServiceCategoryID eq '02' and OwnSystemFlag ne true)"],
				true, {
					fnSuccess: fnCallback
				});
	},

	_readPremiseAddresses: function(fnCallback) {
		this.CRM.read("GetPremisesForAccountAddresses", ["AccountID='" + this.getAccountId() + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readBillingAddresses: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "AccountAddresses", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readCountries: function(fnCallback) {
		this.CRM.read("Countries", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readRegions: function(sCountryID, fnCallback) {
		this.CRM.read("Regions", ["$filter=CountryID eq '" + sCountryID + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readProducts: function(sDivisionID, sConsumption, fnCallback) {
		var sFilter = "$filter=DivisionID eq '" + sDivisionID + "' and (ConsumptionMin le '" + sConsumption + "' and ConsumptionMax ge '"
				+ sConsumption + "')";
		var sExpand = "$expand=UtilitiesProductPrices,PremiseType";

		this.CRM.read("Products", [sFilter, sExpand], true, {
			fnSuccess: fnCallback
		});
	},

	_readDivisions: function(fnCallback) {
		this.CRM.read("Divisions", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readBankAccounts: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "BankAccounts", ["$expand=Bank", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readCardAccounts: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "PaymentCards", ["$expand=PaymentCardType", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readCardAccountTypes: function(fnCallback) {
		this.CRM.read("PaymentCardTypes", ["$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readBankAccountTypes: function(sCountryID, fnCallback) {
		this.CRM.read("Banks", ["$filter=CountryID eq '" + sCountryID + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_readContracts: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "ContractItems", ["$expand=Division,BusinessAgreement,Premise,Product", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_createPaymentCard: function(oPaymentCardData, fnCallback) {
		this.CRM.createEntity("PaymentCards", oPaymentCardData, {
			fnSuccess: fnCallback
		});
	},

	_createBankAccount: function(oBankAccountData, fnCallback) {
		this.CRM.createEntity("BankAccounts", oBankAccountData, {
			fnSuccess: fnCallback
		});
	},

	_createAddress: function(oAddressData, fnCallback) {
		this.CRM.createEntity(this.getAccountPath() + "AccountAddresses", oAddressData, {
			fnSuccess: fnCallback
		});
	},

	_findPremiseByAddress: function(aParameters, fnCallback) {
		aParameters.push("$format=json");

		this.CRM.read("GetPremisesByAddress", aParameters, true, {
			fnSuccess: fnCallback
		});
	},

	_readBusinessAgreements: function(fnCallback) {
		this.CRM.read(this.getAccountPath() + "BusinessAgreements", ["$expand=ContractItems", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_createBusinessAgreement: function(oBuagData, fnCallback) {
		this.CRM.createEntity("BusinessAgreements", oBuagData, {
			fnSuccess: fnCallback
		});
	},

	_createContractInBatch: function(aBatchOperations, fnCallback) {
		this.CRM.clearBatch();
		this.CRM.addBatchChangeOperations(aBatchOperations, true);
		this.CRM.submitChangeBatch({
			fnSuccess: fnCallback
		});
	},

	_endContractsInBatch: function(aBatchOperations, fnCallback) {
		this.CRM.clearBatch();
		this.CRM.addBatchChangeOperations(aBatchOperations, true);
		this.CRM.submitChangeBatch({
			fnSuccess: fnCallback
		});
	},

	_transferContractsInBatch: function(aBatchOperations, fnCallback) {
		this.CRM.clearBatch();
		this.CRM.addBatchChangeOperations(aBatchOperations, true);
		this.CRM.submitChangeBatch({
			fnSuccess: fnCallback
		});
	},

	_readContractEndable: function(sContractID, fnCallback) {
		this.CRM.read("CheckMoveOut", ["ContractID='" + sContractID + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_createPOD: function(oPODData, fnCallback) {
		this.CRM.createEntity("PointOfDeliveries", oPODData, {
			fnSuccess: fnCallback
		});
	},

	_checkPODExistsForPremise: function(sPremiseID, sDivisionID, fnCallback) {
		this.CRM.read("Premises('" + sPremiseID + "')/PointOfDeliveries", ["$filter=DivisionID eq '" + sDivisionID + "'", "$format=json"], true, {
			fnSuccess: fnCallback
		});
	},

	_changeProductInBatch: function(aBatchOperations, fnCallback) {
		this.CRM.clearBatch();
		this.CRM.addBatchChangeOperations(aBatchOperations, true);
		this.CRM.submitChangeBatch({
			fnSuccess: fnCallback
		});
	},
	_mapToRequestedServices: function(requestedServiceType, aServices) {
		var requestedServices = [];
		for ( var i = 0; i < aServices.length; i++) {
			var a = {};
			a.Type = requestedServiceType;
			if (requestedServiceType == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.PENDING_SERVICE) {
				a.ID = aServices[i].ContractID;
				a.StartDate = sap.umc.mobile.app.js.utils.formatDate(aServices[i].StartDate);
				a.StartDateDescription = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.SERVICE_STARTS_FROM") + ' '
						+ sap.umc.mobile.app.js.formatters.dateFormatter(a.StartDate);
				a.ShortDescription = a.StartDateDescription;
				a.DetailsHeaderLabel = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_DETAILS");
				a.IDLabel = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_ID");
				a.StatusLabel = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.CONTRACT_STATUS");
				a.Address = aServices[i].ContractItem.Premise.AddressInfo.ShortForm;
				a.StatusState = this._mapContractStatusToState(aServices[i].DocumentStatusID);
				a.IsContract = true;
				a.IsQuotation = false;

			} else if (requestedServiceType == sap.umc.mobile.CONSTANTS.REQUESTED_SERVICE_TYPE.QUOTATION) {
				a.ID = aServices[i].QuotationHeaderID + "-" + Number(aServices[i].QuotationItemPosition);
				a.StartDate = sap.umc.mobile.app.js.utils.formatDate(aServices[i].QuotationStartDate);
				a.StartDateDescription = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.SERVICE_STARTS_FROM") + ' '
						+ sap.umc.mobile.app.js.formatters.dateFormatter(a.StartDate);
				a.DetailsHeaderLabel = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.QUOTATION_DETAILS");
				a.IDLabel = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.QUOTATION_ID");
				a.StatusLabel = sap.ui.getCore().getModel("i18n").getProperty("CHANGE_SERVICE.QUOTATION_STATUS");
				a.Address = aServices[i].Premise.AddressInfo.ShortForm;
				a.StatusState = this._mapQuotationStatusToState(aServices[i].DocumentStatusID);
				a.IsContract = false;
				a.IsQuotation = true;
			}

			a.DivisionDescription = aServices[i].Product.Division.Description;
			a.ProductDescription = aServices[i].Product.Description;
			a.ServiceDescription = aServices[i].Product.Division.Description + ' - ' + aServices[i].Product.Description;
			a.StatusDescription = aServices[i].DocumentStatus.Description;
			a.Prices = this._getUtilitiesProductPrices(aServices[i].Product.UtilitiesProductPrices);
			a.Details = aServices[i];
			requestedServices.push(a);
		}
		return requestedServices;
	},
	_getUtilitiesProductPrices: function(oPrices){
		var aPrices=[];
		for(var i=0; i<oPrices.results.length;i++){
			var oPrice = {};
			oPrice.ConditionType = oPrices.results[i].PriceConditionType.Description;
			oPrice.Description = oPrices.results[i].Currency + " " + oPrices.results[i].Price +  "/" + oPrices.results[i].QuantityUnit ;
			aPrices.push(oPrice);
		}
		return aPrices;		
	},
	_mapContractStatusToState: function(statusCode) {
		var state;
		switch (statusCode) {
			case "I2403": //Activation accepted
				state = "Success";
				break;
			case "I1006":// Distributed
				state = "Success";
				break;
			case "I1030": //Contains errors
				state = "Error";
				break;
			case "I1002": //open
				state = "None";
				break;
			case "I1003": //In Process
				state = "None";
				break;
			case "I1004":// Released
				state = "None";
				break;
			case "I1005":// Completed
				state = "None";
				break;
			case "I1055"://Quotation
				state = "None";
				break;
			case "I1400"://Started due to product change
				state = "None";
				break;
			default:
				state = 'None';
				break;
		}
		return state;
	},
	_mapQuotationStatusToState: function(statusCode) {
		var state;
		switch (statusCode) {
			case "I1030": //Contains errors
				state = "Error";
				break;
			default:
				state = 'None';
				break;
		}
		return state;
	}
};
