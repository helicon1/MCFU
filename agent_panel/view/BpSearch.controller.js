sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.agent_panel.view.BpSearch", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
		this._initializeSearchParametersModel();
		this._initializeAccountsModel();
		this._intializeCurrentSearchCriteriaGroup();		
		var arInputFieldIds = ["BpSearchInpunt",
		                     "ContractAccountIdSearchInpunt",
		                     "UserNameSearchInput",
		                     "FirstNameSearchInput",
		                     "HouseSearchInput",
		                     "LastNameSearchInput",
		                     "StreetSearchInput",
		                     "PhoneSearchInput",
		                     "CitySearchInput",
		                     "EmailSearchInput",
		                     "PostalCodeSearchInput"
		                   ];
		var sInputFieldId;
		var oInputField;
		for (var i in arInputFieldIds) {
			sInputFieldId = arInputFieldIds[i];
			oInputField = this.getView().byId(sInputFieldId);
			oInputField.addEventDelegate({
				onkeypress: jQuery.proxy(this.onKeyPressed, this)
			});		
		}
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "bpSearch") {
				
			}
		}, this);
	},
	_initializeSearchParametersModel: function(){
		this.oInitialSearchCriteria = {
			FirstName: "",
			LastName: "",
			House: "",
			Street: "",
			AccountID: "",
			ContractAccountID: "",
			City: "",
			Country: "",
			Region: "",
			PostalCode: "",
			Phone: "",
			Email: "",
			UserName: "",
		};

		var oData = {};
		jQuery.extend(oData, this.oInitialSearchCriteria);
		var oSearchParametersModel = this.getView().getModel("SearchParameters");
		if(oSearchParametersModel){
			oSearchParametersModel.setProperty("/oSearchParameters", oData);
		}else{
			oSearchParametersModel = new sap.ui.model.json.JSONModel();
			oSearchParametersModel.setProperty("/oSearchParameters", oData);
			this.getView().setModel(oSearchParametersModel, "SearchParameters")
		}
	},

	_intializeCurrentSearchCriteriaGroup: function(){
		this.getView().getModel("SearchParameters").setProperty("/bAddressBasedSearch", true);
		this.getView().getModel("SearchParameters").setProperty("/bUserNameBasedSearch", false);
		this.getView().getModel("SearchParameters").setProperty("/bBpNumberBasedSearch", false);
		this.getView().getModel("SearchParameters").setProperty("/bContractAccountBasedSearch", false);
	},

	_initializeAccountsModel: function(){
		var aData = [];
		this.getView().setModel(new sap.ui.model.json.JSONModel(aData), "Accounts");
	},

	onReset: function(){
		this._initializeSearchParametersModel();
		this._initializeAccountsModel();
	},

	onSearch: function(){
		var oData = this.getView().getModel("SearchParameters").getData();
		if(JSON.stringify(oData.oSearchParameters) === JSON.stringify(this.oInitialSearchCriteria)){
			sMessage = this.getText("AGENT_PANEL.EMPTY_SEARCH_CRITERIA");
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sMessage);
			return;
		}

		this.getDataProvider().searchAccounts(this, oData);
	},

	onKeyPressed: function(oEvent){
		if (oEvent.keyCode === 13) {
			this.onSearch();
		}
	},

	onTableItemSelection: function(oEvent){
		var sAccountID = oEvent.mParameters.listItem.mAggregations.cells[0].mProperties.text;
		this.oApp.getDataProvider().changeContextAccount(sAccountID);	
		this.oApp.navToHome();
	},

	onSearchSuccess: function(aData){
		this.getView().getModel("Accounts").setData(aData);
	},
});