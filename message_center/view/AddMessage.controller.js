sap.umc.mobile.app.view.MasterBaseController.extend("sap.umc.mobile.message_center.view.AddMessage", {
	onInit: function() {
		sap.umc.mobile.app.view.MasterBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "addMessage") {
				this.Type = oEvent.getParameter("arguments").Type;
				this.getView().setModel(this.getDataProvider().getNewMessageTypes(), "MessageTypes");
				if(oEvent.getParameter("arguments").Type === "contact" && !jQuery.device.is.phone){
					var bReplace = !jQuery.device.is.phone;
					this.getRouter().myNavTo("messageDetail", {
						ID: "-1",
						Type: "OT"
					}, bReplace);
				}
			}
		}, this);
	},
	handleListItemPress: function(oEvent) {
		var oContext = oEvent.getSource().getBindingContext("MessageTypes");
		var oSelectedMessageType = oContext.getProperty(oContext.getPath());
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("messageDetail", {
			ID: "-1",
			Type: oSelectedMessageType.Type
		}, bReplace);
	},
	handleListItemSelect: function(oEvent) {
		var oContext = oEvent.getParameter("listItem").getBindingContext("MessageTypes");
		var oSelectedMessageType = oContext.getProperty(oContext.getPath());
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("messageDetail", {
			ID: "-1",
			Type: oSelectedMessageType.Type
		}, bReplace);
	}
});