jQuery.sap.declare("sap.umc.mobile.invoice.Component");

sap.ui.core.UIComponent.extend("sap.umc.mobile.invoice.Component", {

	metadata : {
		"name": "invoice",
		"version": "1.0.0",
		"description": "UMC User Management",
		"includes" : ["js/utils.js", "model/DataProvider.js"],
		"initOnBeforeRender": false,
		"dependencies": {
			"components" : []
		},
		"routing":{
			"config" : {
				routerClass: sap.umc.mobile.Router,
				"viewType" : "XML",
				"viewPath" : "sap.umc.mobile.invoice.view",
				"viewLevel" : undefined,
				"clearTarget" : false
			},
			"routes" : {
				"balance" : { // master is the name of the route
					"pattern" : "Balance", // will be the url and from has to be provided in the data
					"view" : "Balance",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation" : "pages",
					"viewLevel" : 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView){
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell(); 
						oTargetControl.to(oView.getId());
					}
				},
				"invoiceDetail" : {
					"pattern" : "Invoice/{InvoiceID}",
					"view" : "InvoiceDetail",
					"targetControl" : "splitScreenWithShellContainer",
					"targetAggregation" : "detailPages",
					"viewLevel" : 3,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView){
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if(jQuery.device.is.phone){
							oTargetControl.toMaster(oView.getId());
						}else{
							oTargetControl.toDetail(oView.getId());
						}
						sap.umc.mobile.Logger.info("Invoice detail route catched");
					}
				},
				"invoiceList" : { // master is the name of the route
					"pattern" : "InvoiceList", // will be the url and from has to be provided in the data
					"view" : "InvoiceList",
					"targetControl" : "splitScreenWithShellContainer",
					"targetAggregation" : "masterPages",
					"viewLevel" : 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView){
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if(!jQuery.device.is.phone){
							oTargetControl.backToTopDetail();
						}
						oTargetControl.toMaster(oView.getId());
						sap.umc.mobile.Logger.info("Invoices List route catched");
					}
				},
				"paymentHistory" : { // master is the name of the route
					"pattern" : "PaymentHistory", // will be the url and from has to be provided in the data
					"view" : "PaymentHistory",
					"targetControl" : "fullScreenWithShellContainer",
					"targetAggregation" : "pages",
					"viewLevel" : 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView){
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell(); 
						oTargetControl.to(oView.getId());
					}				
				},
				"addedbalancepayment" : { // master is the name of the route
					"pattern" : "AddedPayment/{PaymentID}", // will be the url and from has to be provided in the data
					"view" : "Balance",
					"targetControl": "fullScreenWithShellContainer",
					"targetAggregation" : "pages",
					"viewLevel" : 1,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView){
						sap.ui.getCore().getComponent("AppComponent").toFullScreenWithShell(); 
						oTargetControl.to(oView.getId());
					}
				},	
				"invoiceDetailPayment" : {
					"pattern" : "InvoicePayment/{InvoiceID}/{PaymentID}",
					"view" : "InvoiceDetail",
					"targetControl" : "splitScreenWithShellContainer",
					"targetAggregation" : "detailPages",
					"viewLevel" : 3,
					"callback": function(oEvent, oParams, oConfigs, oTargetControl, oView){
						sap.ui.getCore().getComponent("AppComponent").toSplitScreenWithShell();
						if(jQuery.device.is.phone){
							oTargetControl.toMaster(oView.getId());
						}else{
							oTargetControl.toDetail(oView.getId());
						}
						sap.umc.mobile.Logger.info("Invoice Payment detail route catched");
					}
				}	
			}	
		}

	},
	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, []);
		sap.umc.mobile.app.model.DataProviderFactory.generate("invoice");
		this._initializeRouter();
	},
	_initializeLocale: function(){
		var i18n = new sap.ui.model.resource.ResourceModel({
			"bundleUrl" : jQuery.sap.getModulePath("sap.umc.mobile") + "/invoice/i18n/i18n.properties"
		});
		sap.ui.getCore().setModel(i18n, "i18n_invoices");
	},
	_initializeRouter: function(){
		var oRouter = this.getRouter();
		oRouter.register("invoicesRouter");
		oRouter.initialize();
	},
	getDataProvider: function(){
		return sap.umc.mobile.invoice.model.DataProvider;
	}
});
