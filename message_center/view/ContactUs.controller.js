sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.message_center.view.ContactUs", {
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._setListData();
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "contactUs") {

			}
		}, this);
	},
	_setListData: function(oEvent) {
		var oFakeData = {
			results: [{
				Icon: "sap-icon://email",
				Description: this.getText("MESSAGE_CENTER.SEND_MESSAGE"),
				Type: "Navigation"
			}, {
				Icon: "sap-icon://incoming-call",
				Description: this.getText("MESSAGE_CENTER.PHONE"),
				Type: "Navigation"
			}, {
				Icon: "sap-icon://addresses",
				Description: this.getText("MESSAGE_CENTER.MAILING_ADDRESS")
			}]
		};
		var oFakeModel = new sap.ui.model.json.JSONModel(oFakeData);
		this.getView().setModel(oFakeModel, "ContactTypes");
	},
	handleListItemPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("ContactTypes");
		var oSelectedMessageType = oContext.getProperty(oContext.getPath());
		this._handleContactMethod(oSelectedMessageType);
	},
	handleListItemSelect: function(oEvent) {
		var oContext = oEvent.getParameter("listItem").getBindingContext("ContactTypes");
		var oSelectedMessageType = oContext.getProperty(oContext.getPath());
		this._handleContactMethod(oSelectedMessageType);
	},
	_handleContactMethod: function(oSelectedMessageType) {
		if (oSelectedMessageType.Icon == "sap-icon://email") {
			this._handleAddMessage();
		} else if (oSelectedMessageType.Icon == "sap-icon://incoming-call") {
			this._handleMakeCall();
		}
	},
	_handleMakeCall: function() {
		sap.m.URLHelper.triggerTel("1-800-337-5454");
	},
	_handleAddMessage: function() {
		var oMessageCenterComponent = this.getApp().getComponents().getMessageCenter();
		oMessageCenterComponent.getRouter().myNavTo("addMessage", {Type: "contact"}, false);
	},
});