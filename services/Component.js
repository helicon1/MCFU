jQuery.sap.declare("sap.umc.mobile.services.Component");

sap.ui.core.UIComponent.extend("sap.umc.mobile.services.Component", {

	metadata: {
		"name": "services",
		"version": "1.0.0",
		"description": "Services",
		"includes": ["js/utils.js", "model/DataProvider.js"],
		"initOnBeforeRender": false,
		"dependencies": {
			"components": []
		},
		"routing": {
			"config": {
				routerClass: sap.umc.mobile.Router,
				"viewType": "XML",
				"viewPath": "sap.umc.mobile.services.view",
				"targetControl": "fullScreenWithoutShellContainer",
				"viewLevel": undefined,
				"clearTarget": false
			},
			"routes": {
				"servicesMaster": { // master is the name of the route
					"pattern": "Services", // will be the url and from has to be provided in the data
					"view": "Services",
					"targetControl": "splitScreenWithShellContainer",
					"targetAggregation": "masterPages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if (!jQuery.device.is.phone) {
							oTargetControl.backToTopDetail();
						}
						oTargetControl.toMaster(oView.getId());
					},
					"subroutes": {
						"noServices": {
							"pattern": "noData/{viewTitle}/{languageKey}",
							"view": "empty",
							"viewLevel": 2
						}
					}
				},
				"serviceDetail": {
					"pattern": "Services/{ContractID}",
					"view": "ServiceDetail",
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
					}
				}
			}
		}

	},
	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, []);
		sap.umc.mobile.app.model.DataProviderFactory.generate("services");
		this._initializeRouter();
	},
	_initializeRouter: function() {
		var oRouter = this.getRouter();
		oRouter.register("servicesRouter");
		oRouter.initialize();
	},
	getDataProvider: function(){
		return sap.umc.mobile.services.model.DataProvider;
	}
});
