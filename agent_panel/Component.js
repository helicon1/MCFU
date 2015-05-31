jQuery.sap.declare("sap.umc.mobile.agent_panel.Component");


sap.ui.core.UIComponent.extend("sap.umc.mobile.agent_panel.Component", {

	metadata: {
		"name": "agent_panel",
		"version": "1.0.0",
		"description": "UMC Agent Role",
		"includes": ["js/utils.js", "model/DataProvider.js"],
		"initOnBeforeRender": false,
		"dependencies": {
			"components": []
		},
		"routing": {
			"config": {
				routerClass: sap.umc.mobile.Router,				
				"viewType": "XML",
				"viewPath": "sap.umc.mobile.agent_panel.view",
				"targetControl": "fullScreenWithoutShellContainer",
				"targetAggregation": "pages",
				"viewLevel": undefined,
				"clearTarget": false
			},
			"routes": {
				"bpSearch": {
					"pattern": "BPSearch",
					"viewPath": "sap.umc.mobile.agent_panel.view",
					"view": "BpSearch",
					"targetControl": "fullScreenWithoutShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1, 
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithoutShell(); 
						oTargetControl.to(oView.getId());
					}
				}
			}
		}
	},
	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, []);
		this._initializeRouter();
		sap.umc.mobile.app.model.DataProviderFactory.generate("agent_panel");
	},
	_initializeRouter: function() {
		var oRouter = this.getRouter();
		oRouter.register("agent_panelRouter");
		oRouter.initialize();
	},
	getDataProvider: function() {
		return sap.umc.mobile.agent_panel.model.DataProvider;
	}
});