jQuery.sap.declare("sap.umc.mobile.outages.Component");

sap.ui.core.UIComponent.extend("sap.umc.mobile.outages.Component", {

	metadata: {
		"name": "outages",
		"version": "1.0.0",
		"description": "UMC User Management",
		"includes": ["js/utils.js", "model/DataProvider.js", "js/vbmap.js"],
		"initOnBeforeRender": true,
		"dependencies": {
			"components": []
		},
		"routing": {
			"config": {
				routerClass: sap.umc.mobile.Router,
				"viewType": "XML",
				"viewPath": "sap.umc.mobile.outages.view",
				"viewLevel": undefined,
				"clearTarget": false
			},
			"routes": {
				"outage": { // master is the name of the route
					"pattern": "Outage", // will be the url and from has to be provided in the data
					"view": "Outages",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
					}
				}
			}
		}
	},
	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, []);
		sap.umc.mobile.app.model.DataProviderFactory.generate("outages");
		this._initializeRouter();
	},
	_initializeRouter: function() {
		var oRouter = this.getRouter();
		oRouter.register("outageRouter");
		oRouter.initialize();
	},
	getDataProvider: function() {
		return sap.umc.mobile.outages.model.DataProvider;
	}
});
