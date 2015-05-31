jQuery.sap.declare("sap.umc.mobile.change_service.Component");

sap.ui.core.UIComponent.extend("sap.umc.mobile.change_service.Component", {

    metadata: {
        "name": "sap.umc.mobile.change_service.Component",
        "version": "1.0.0",
        "description": "Change Service",
        "includes": ["js/utils.js", "model/DataProvider.js"],
        "initOnBeforeRender": false,
        "dependencies": {
            "components": []
        },
        "routing": {
            "config": {
            	routerClass: sap.umc.mobile.Router,
                "viewType": "XML",
                "viewPath": "sap.umc.mobile.change_service.view",
                "viewLevel": undefined,
                "clearTarget": false
            },
            "routes": {
                "changeServiceMaster": { // master is the name of the route
                    "pattern": "ChangeService", // will be the url and from has to be provided in the data
                    "view": "ChangeService",
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
                        "noData": {
                            "pattern": "noData/{viewTitle}/{languageKey}",
                            "view": "empty",
                            "viewLevel": 2
                        }
                    }
                },
                "startService": {
                    "pattern": "ChangeService/StartService",
                    "view": "StartService",
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
                },
                "endService": {
                    "pattern": "ChangeService/EndService",
                    "view": "EndService",
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
                },
                "transferService": {
                    "pattern": "ChangeService/TransferService",
                    "view": "TransferService",
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
                },
                "changeProduct": {
                    "pattern": "ChangeService/ChangeProduct",
                    "view": "ChangeProduct",
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
                },
                "requestedService": {
                    "pattern": "RequestedService/{RequestedServiceType}",
                    "view": "RequestedService",
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
                },
                "requestedServiceDetails": {
                    "pattern": "RequestedServiceDetails/{Type}/{ID}",
                    "view": "RequestedServiceDetails",
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
                },       
            }
        }

    },
    init: function() {
        sap.ui.core.UIComponent.prototype.init.apply(this, []);
        sap.umc.mobile.app.model.DataProviderFactory.generate("change_service");
        this._initializeRouter();
        this.bStartServiceDirty = false;
        this.bEndServiceDirty = false;
        this.bTransferServiceDirty = false;
        this.bChangeProductDirty = false;
    },
    _initializeRouter: function() {
        var oRouter = this.getRouter();
        oRouter.register("changeServiceRouter");
        oRouter.initialize();
    },
    getDataProvider: function() {
        return sap.umc.mobile.change_service.model.DataProvider;
    },
    getUtils: function() {
        return sap.umc.mobile.change_service.js.utils;
    },
    setDetailViewsDirty: function() {
        this.bStartServiceDirty = true;
        this.bEndServiceDirty = true;
        this.bTransferServiceDirty = true;
        this.bChangeProductDirty = true;
    }
});
