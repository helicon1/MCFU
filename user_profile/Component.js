jQuery.sap.declare("sap.umc.mobile.user_profile.Component");

sap.ui.core.UIComponent.extend("sap.umc.mobile.user_profile.Component", {
	metadata: {
		"name": "sap.umc.mobile.user_profile.Component",
		"version": "1.0.0",
		"description": "UMC User Profile Management",
		"includes": ["js/utils.js", "model/DataProvider.js"],
		"initOnBeforeRender": false,
		"dependencies": {
			"components": []
		},
		"routing": {
			"config": {
				routerClass: sap.umc.mobile.Router,
				"viewType": "XML",
				"viewPath": "sap.umc.mobile.user_profile.view",
				"viewLevel": undefined,
				"clearTarget": false
			},
			"routes": {
				"userProfile": { // master is the name of the route
					"pattern": "UserProfile", // will be the url and from has to be provided in the data
					"view": "UserProfile",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
					}
				},
				"agreementDetail": { // master is the name of the route
					"pattern": "AgreementDetail/{ContractAccountID}", // will be the url and from has to be provided in the
					// data
					"view": "AgreementDetail",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
					}
				},
				"bankDetail": {
					"pattern": "bankAccounts/{BankAccountID}",
					"view": "BankDetail",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
						sap.umc.mobile.Logger.info("Bank detail route catched");
					}
				},
				"cardDetail": {
					"pattern": "cardAccounts/{PaymentCardID}",
					"view": "CardDetail",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
						sap.umc.mobile.Logger.info("Card detail route catched");
					}
				},
				"autoPay": {
					"pattern": "AutoPay",
					"view": "AutoPay",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
						sap.umc.mobile.Logger.info("Auto Pay route catched");
					}
				},
				"billingAddress": {
					"pattern": "BillingAddress/{AgreementNumber}",
					"view": "BillingAddress",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
						sap.umc.mobile.Logger.info("Billing Address route catched");
					}
				},
				"paymentAccounts": { // master is the name of the route
					"pattern": "PaymentAccounts", // will be the url and from has to be provided in the data
					"view": "PaymentAccounts",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
						sap.umc.mobile.Logger.info("Payment Accounts route catched");
					}
				},
				"communicationPref": { // master is the name of the route
					"pattern": "ComPref", // will be the url and from has to be provided in the data
					"view": "CommunicationPreferences",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
					}
				},
				"contactInfo": { // master is the name of the route
					"pattern": "ContactInfo", // will be the url and from has to be provided in the data
					"view": "ContactInformation",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation": "pages",
					"viewLevel": 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView) {
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell();
						oTargetControl.to(oView.getId());
					}
				},
				"changeName": { // master is the name of the route
					"pattern": "ChangeName", // will be the url and from has to be provided in the data
					"view": "ChangeName",
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
		sap.umc.mobile.app.model.DataProviderFactory.generate("user_profile");
		this._initializeRouter();
	},
	_initializeRouter: function() {
		var oRouter = this.getRouter();
		oRouter.register("userProfileRouter");
		oRouter.initialize();
	},
	getDataProvider: function() {
		return sap.umc.mobile.user_profile.model.DataProvider;
	}
});
