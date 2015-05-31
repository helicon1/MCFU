sap.umc.mobile.app.view.MasterBaseController.extend("sap.umc.mobile.message_center.view.MessageCenter", {
	onInit: function() {
		sap.umc.mobile.app.view.MasterBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "messageCenter") {
				this.Type = oEvent.getParameters().arguments.Type;
				var fnCallback = jQuery.proxy(function(oMessages, oSelection) {
					this.onMessagesLoaded(oMessages, oSelection);
				}, this);
				this.getDataProvider().loadMessages(fnCallback);
			}
		}, this);
	},
	showDetail: function(oSelectedMessage) {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("messageDetail", oSelectedMessage, bReplace);
	},
	onMessagesLoaded: function(oMessages, oSelection) {
		this.oAllMessages = new sap.ui.model.json.JSONModel();
		this.oAllMessages.setData(this.getApp().getUtils().copyObject(oMessages.getData()));
		this.oMessages = new sap.ui.model.json.JSONModel();
		this.oMessages.setData(this.getApp().getUtils().copyObject(oMessages.getData()));
		this.getView().setModel(this.oMessages, "Messages");
		this.getView().setModel(oSelection, "filterOption");
		this.getView().getModel("filterOption").setProperty("/DefaultSelection", oSelection.getData().results[0].FilterID);
		if (this.Type === "Al") {
			this._preFilterMessageList(this.Type);
		} else {
			this._preFilterMessageList("");
		}
		if (sap.ui.getCore().getModel("device").getProperty("/isNoPhone")) {
			this._setDefaultItemSelection();
		}
	},
	_setDefaultItemSelection: function() {
		var oList = this.getView().byId("idList");
		var oFirstItem = oList.getItems()[0];
		if (oFirstItem != undefined) {
			oList.setSelectedItem(oFirstItem, true);
			var oContext = oFirstItem.getBindingContext("Messages");
			var oSelectedMessage = oContext.getProperty(oContext.getPath());
			this.showDetail(oSelectedMessage);
		}
	},
	handleNewMessage: function() {
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("addMessage", {
			Type: "center"
		}, bReplace);
	},
	handleListItemPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("Messages");
		var oSelectedMessage = oContext.getProperty(oContext.getPath());
		this.showDetail(oSelectedMessage);
	},
	handleListItemSelect: function(oEvent) {
		var oContext = oEvent.getParameter("listItem").getBindingContext("Messages");
		var oSelectedMessage = oContext.getProperty(oContext.getPath());
		this.showDetail(oSelectedMessage);
	},
	handleSearch: function(oEvt, bPostSearch) {
		var aFilters = [];
		if (!this.sSearchQuery) {
			this.sSearchQuery = "";
		}
		if (!bPostSearch) {
			var sQuery = oEvt.getSource().getValue();
			this.sSearchQuery = sQuery;
		}
		var oFilterOptions, bFilter, oFilter = null, oFilter2 = null;
		oFilter = new sap.ui.model.Filter("MessageTypeDescription", sap.ui.model.FilterOperator.Contains, this.sSearchQuery);
		oFilter2 = new sap.ui.model.Filter("Subject", sap.ui.model.FilterOperator.Contains, this.sSearchQuery);
		bFilter = false;
		aFilters.push(oFilter);
		aFilters.push(oFilter2);
		oFilterOptions = new sap.ui.model.Filter(aFilters, bFilter);
		this._updateMessageList(oFilterOptions);
	},
	handleFilterSelect: function(oEvt) {
		var aFilters = [];
		var sQuery = oEvt.getSource().mProperties.selectedKey;
		this.sSelectQuery = sQuery;
		if (sQuery === this.getText("MESSAGE_CENTER.ALL")) {
			sQuery = "";
			this.getView().getModel("Messages").setData(this.oAllMessages.getData());
		} else {
			this._filterMessageModel(sQuery);
		}
		if (this.sSearchQuery && this.sSearchQuery !== "") {
			var oFilter = new sap.ui.model.Filter("MessageTypeDescription", sap.ui.model.FilterOperator.Contains, this.sSearchQuery);
			var oFilter2 = new sap.ui.model.Filter("Subject", sap.ui.model.FilterOperator.Contains, this.sSearchQuery);
			aFilters.push(oFilter);
			aFilters.push(oFilter2);
			var oFilterOptions = new sap.ui.model.Filter(aFilters, false);
			this._updateMessageList(oFilterOptions);
			this._updateMessageList(aFilters);
		}
		this.handleSearch("", true);
	},
	_filterMessageModel: function(sQuery) {
		var aFilteredMessages = [];
		for ( var i = 0; i < this.oAllMessages.getData().results.length; i++) {
			if (this.oAllMessages.getData().results[i].Direction === sQuery) {
				aFilteredMessages.push(this.oAllMessages.getData().results[i]);
			}
		}
		this.getView().getModel("Messages").setData({
			results: aFilteredMessages
		});
	},
	_updateMessageList: function(oFilterOptions) {
		var list = this.getView().byId("idList");
		var binding = list.getBinding("items");
		binding.filter(oFilterOptions, sap.ui.model.FilterType.Application);
	},
	_preFilterMessageList: function(sType) {
		var _sType = (sType === "AL")?"Alert":sType;
		this.getView().byId("search").setValue(_sType);
		var aFilters = [];
		this.sSearchQuery = _sType;
		var filter = new sap.ui.model.Filter("MessageTypeDescription", sap.ui.model.FilterOperator.Contains, sType);
		aFilters.push(filter);
		this._updateMessageList(aFilters);
	}

});