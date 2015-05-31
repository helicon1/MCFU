jQuery.sap.declare("sap.umc.mobile.agent_panel.model.OnlineDataProvider");
sap.umc.mobile.agent_panel.model.OnlineDataProvider = {
	_searchAccounts: function(oDelegate, oSearchParameters) {
		var oParameters = {
			AccountID: "",
			UserName: "",
			ContractAccountID: "",
			FirstName: "",
			LastName: "",
			HouseNo: "",
			Street: "",
			City: "",
			Country: "",
			Region: "",
			PostalCode: "",
			Phone: "",
			Email: ""
		};
		if (oSearchParameters.bAddressBasedSearch) {
			oParameters.FirstName = oSearchParameters.oSearchParameters.FirstName;
			oParameters.LastName = oSearchParameters.oSearchParameters.LastName;
			oParameters.HouseNo = oSearchParameters.oSearchParameters.House;
			oParameters.Street = oSearchParameters.oSearchParameters.Street;
			oParameters.City = oSearchParameters.oSearchParameters.City;
			oParameters.Country = oSearchParameters.oSearchParameters.Country;
			oParameters.Region = oSearchParameters.oSearchParameters.Region;
			oParameters.PostalCode = oSearchParameters.oSearchParameters.PostalCode;
			oParameters.Phone = oSearchParameters.oSearchParameters.Phone;
			oParameters.Email = oSearchParameters.oSearchParameters.Email;
		}

		if (oSearchParameters.bUserNameBasedSearch) {
			oParameters.UserName = oSearchParameters.oSearchParameters.UserName;
		}

		if (oSearchParameters.bBpNumberBasedSearch) {
			oParameters.AccountID = oSearchParameters.oSearchParameters.AccountID;
		}		

		if (oSearchParameters.bContractAccountBasedSearch) {
			oParameters.ContractAccountID = oSearchParameters.oSearchParameters.ContractAccountID;
		}		

		this.ERP.functionImport("GetAccounts", sap.umc.mobile.CONSTANTS.HTTP_GET, oParameters, true, {
			fnSuccess: jQuery.proxy(function(oData) {
				var aBatchOperations = [];
				var oService = this.SERVICE;
				for (var i = 0; i < oData.results.length; i++) {
					var sEntityPath = "";
					sEntityPath = "Accounts('" + oData.results[i].AccountID + "')?$expand=StandardAccountAddress,ContractAccounts,StandardAccountAddress/AccountAddressDependentEmails,StandardAccountAddress/AccountAddressDependentPhones&$format=json";
					var oBatchOperation = oService.createBatchOperation(sEntityPath, "GET");

					oBatchOperation.query = {
						entity: "Accounts",
						returnCount: true,
						returnSingleEntity: true
					};
					aBatchOperations.push(oBatchOperation);
				}

				if (aBatchOperations.length) {
					oService.addBatchReadOperations(aBatchOperations);
					var oCallbacks = {
						fnSuccess: jQuery.proxy(function(oData, oResponse, oContext) {
							var aData = [];
							for (var i = 0; i < oData.__batchResponses.length; i++) {
								//Full Address
								oData.__batchResponses[i].data.FullAddress = "";
								var sHouseNo = oData.__batchResponses[i].data.StandardAccountAddress.AddressInfo.HouseNo;
								if (sHouseNo) {
									oData.__batchResponses[i].data.FullAddress = sHouseNo + " ";
								}
								var sStreet = oData.__batchResponses[i].data.StandardAccountAddress.AddressInfo.Street;
								if (sStreet) {
									oData.__batchResponses[i].data.FullAddress = oData.__batchResponses[i].data.FullAddress + sStreet + " ";
								}
								var sCity = oData.__batchResponses[i].data.StandardAccountAddress.AddressInfo.City;
								if (sCity) {
									oData.__batchResponses[i].data.FullAddress = oData.__batchResponses[i].data.FullAddress + sCity + ", ";
								}

								var sRegion = oData.__batchResponses[i].data.StandardAccountAddress.AddressInfo.RegionName;
								if (sRegion) {
									oData.__batchResponses[i].data.FullAddress = oData.__batchResponses[i].data.FullAddress + sRegion + " " ;
								}

								var sPostalCode = oData.__batchResponses[i].data.StandardAccountAddress.AddressInfo.PostalCode;
								if (sPostalCode) {
									oData.__batchResponses[i].data.FullAddress = oData.__batchResponses[i].data.FullAddress + sPostalCode + " ";
								}

								//ContractAccounts
								oData.__batchResponses[i].data.ContractAccountIDs = "";
								for (var j = 0; j < oData.__batchResponses[i].data.ContractAccounts.results.length; j++) {
									oData.__batchResponses[i].data.ContractAccountIDs = oData.__batchResponses[i].data.ContractAccountIDs + oData.__batchResponses[i].data.ContractAccounts.results[j].ContractAccountID;
									if (j !== oData.__batchResponses[i].data.ContractAccounts.results.length - 1) {
										oData.__batchResponses[i].data.ContractAccountIDs = oData.__batchResponses[i].data.ContractAccountIDs + ', ';
									}
								}
								//Email
								oData.__batchResponses[i].data.DefaultEmail = "";
								for (var j = 0; j < oData.__batchResponses[i].data.StandardAccountAddress.AccountAddressDependentEmails.results.length; j++) {
									if (oData.__batchResponses[i].data.StandardAccountAddress.AccountAddressDependentEmails.results[j].StandardFlag) {
										oData.__batchResponses[i].data.DefaultEmail = oData.__batchResponses[i].data.StandardAccountAddress.AccountAddressDependentEmails.results[j].Email;
									}
								}
								//Phone
								oData.__batchResponses[i].data.DefaultPhone = "";
								for (var j = 0; j < oData.__batchResponses[i].data.StandardAccountAddress.AccountAddressDependentPhones.results.length; j++) {
									if (oData.__batchResponses[i].data.StandardAccountAddress.AccountAddressDependentPhones.results[j].PhoneType === "1") {
										oData.__batchResponses[i].data.DefaultPhone = oData.__batchResponses[i].data.StandardAccountAddress.AccountAddressDependentPhones.results[j].PhoneNo;
									}
								}
								aData.push(oData.__batchResponses[i].data);
							};
							oDelegate.onSearchSuccess(aData);
						}, this),
						fnError: jQuery.proxy(function(oData, oResponse, oContext) {}, this)
					};
					oService.submitBatch_NEW(oCallbacks, aBatchOperations);
				} else {
					oDelegate.onSearchSuccess([]);
				}

			}, this),
			fnError: jQuery.proxy(function() {}, this)
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
	}
};