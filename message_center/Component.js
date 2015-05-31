jQuery.sap.declare("sap.umc.mobile.message_center.Component");

sap.ui.core.UIComponent.extend("sap.umc.mobile.message_center.Component", {

	metadata: {
		"name": "message_center",
		"version": "1.0.0",
		"description": "UMC Message Center",
		"includes": ["js/utils.js", "model/DataProvider.js"],
		"initOnBeforeRender": false,
		"dependencies": {
			"components": []
		},
		"routing": {
			"config": {
				routerClass: sap.umc.mobile.Router,
				"viewType": "XML",
				"viewPath": "sap.umc.mobile.message_center.view",
				"viewLevel": undefined,
				"clearTarget": false
			},
			"routes": {
				"messageCenter": { // master is the name of the route
					"pattern": "messages/{Type}", // will be the url and from has to be provided in the data
					"view": "MessageCenter",
					"targetControl": "splitScreenWithShellContainer",
					"targetAggregation": "masterPages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if (!jQuery.device.is.phone) {
							oTargetControl.backToTopDetail();
						}
						oTargetControl.toMaster(oView.getId());
						sap.umc.mobile.Logger.info("MessageCenter route catched");
					}
				},
				"messageDetail": {
					"pattern": "messages/{Type}/{ID}",
					"view": "MessageDetail",
					"targetControl": "splitScreenWithShellContainer",
					"targetAggregation": "detailPages",
					"viewLevel": 3,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if (jQuery.device.is.phone) {
							oTargetControl.toMaster(oView.getId());
						} else {
							oTargetControl.toDetail(oView.getId());
						}
						sap.umc.mobile.Logger.info("Message Detail route catched");
					}
				},
				"addMessage": {
					"pattern": "AddMessage/{Type}",
					"view": "AddMessage",
					"targetControl": "splitScreenWithShellContainer",
					"targetAggregation": "masterPages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if (!jQuery.device.is.phone) {
							oTargetControl.backToTopDetail();
						}
						oTargetControl.toMaster(oView.getId());
						sap.umc.mobile.Logger.info("Add message route catched");
					}
				},
				"contactUsPrivate": {
					"pattern": "ContactUsPrivate",
					"view": "ContactUs",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
						sap.umc.mobile.Logger.info("Contact Us route catched");
					}
				},
				"attachments":{
					"pattern": "messages/{Type}/{ID}/attachments",
					"view": "Attachments",
					"targetControl": "splitScreenWithShellContainer",
					"targetAggregation": "detailPages",
					"viewLevel": 3,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if (jQuery.device.is.phone) {
							oTargetControl.toMaster(oView.getId());
						} else {
							oTargetControl.toDetail(oView.getId());
						}
						sap.umc.mobile.Logger.info("Attachments route catched");
					}
				}
			}
		}
	},
	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, []);
		sap.umc.mobile.app.model.DataProviderFactory.generate("message_center");
		this._initializeRouter();
	},
	_initializeRouter: function() {
		var oRouter = this.getRouter();
		oRouter.register("message_centerRouter");
		oRouter.initialize();
	},
	getUtils: function() {
        return sap.umc.mobile.message_center.js.utils;
    },
	getDataProvider: function(){
		return sap.umc.mobile.message_center.model.DataProvider;
	}
});