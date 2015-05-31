sap.umc.mobile.app.view.MasterBaseController.extend("sap.umc.mobile.services.view.Services", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "servicesMaster") {
				this.getDataProvider().loadServices(this);
			}
		}, this);
	},

	onPremisesLoaded: function(oPremiseModel) {
		this.getView().setModel(oPremiseModel, "premises");
		var oPremisesDropDown = this.getView().byId("PremisesDropDown");
		var oServiceList = this.getView().byId("ServicesList");
		var aPremises = oPremiseModel.getProperty("/");
		if(aPremises && aPremises.length){
			oPremisesDropDown.setSelectedKey(aPremises[0].PremiseID);	
			var aContracts = aPremises[0]._contracts;
			this.getView().setModel(new sap.ui.model.json.JSONModel(aContracts), "contracts");
			if(!sap.ui.Device.system.phone){
				var oFirstItem = oServiceList.getItems()[0];
				if (oFirstItem != null){
					oServiceList.setSelectedItem(oFirstItem, true);
					var oContext = oFirstItem.getBindingContext("contracts");
					var oSelectedContract = oContext.getProperty(oContext.getPath());
					this._showDetail(oSelectedContract);
				}
			}
		}
	},
	_showDetail: function(oContract){
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("serviceDetail", oContract, bReplace);
	},
	onPremiseChange: function(oEvent) {
		var sPremiseID = oEvent.getSource().getSelectedKey();
		var aPremises = this.getView().getModel("premises").getProperty("/");
		for ( var i = 0; i < aPremises.length; i++) {
			if (aPremises[i].PremiseID == sPremiseID) {
				var aContracts = aPremises[i]._contracts;
				this.getView().setModel(new sap.ui.model.json.JSONModel(), "contracts");
				this.getView().getModel("contracts").setData(aContracts);
				if(aContracts.length){
					var oServiceList = this.getView().byId("ServicesList");
					var oFirstItem = oServiceList.getItems()[0];
					if (oFirstItem != null){
						oServiceList.setSelectedItem(oFirstItem, true);
					}
					if(!jQuery.device.is.phone) {
						this._showDetail(aContracts[0]);
					}
				}
				break;
			}
		}
	},
	onContractSelected: function(oEvent) {
		//on phone
		var aContracts = this.getView().getModel("contracts").getProperty("/");
		var sContractID = oEvent.getSource().data("Contract");
		var oContract = {};
		for ( var i = 0; i < aContracts.length; i++) {
			if (sContractID === aContracts[i].ContractID) {
				oContract = aContracts[i];
				break;
			}
		}
		this._showDetail(oContract);
	},
	handleListItemPress: function(oEvent){
		//on Desktop or Tablet
		var oContext = oEvent.getParameter("listItem").getBindingContext("contracts");
		var oSelectedContract = oContext.getProperty(oContext.getPath());
		this._showDetail(oSelectedContract);
	}
});