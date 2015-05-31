jQuery.sap.declare("sap.umc.mobile.app.ComponentFactory");
sap.umc.mobile.app.ComponentFactory={
	getHome: function(){
		var oHomeComponent = sap.ui.getCore().getComponent("HomeComponent");
		if (!oHomeComponent) {
			oHomeComponent = sap.ui.getCore().createComponent({
				name : "sap.umc.mobile.home",
				id : "HomeComponent",
				url : "./home"
			});
		}
		return oHomeComponent;
	},
	getService: function(){
		var oServiceComponent = sap.ui.getCore().getComponent("ServicesComponent");
		if(!oServiceComponent){
			oServiceComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.services",
				id: "ServicesComponent",
				url: "./services"
			});		
		}
		return oServiceComponent;
	},
	getChangeService: function(){
		var oChangeServiceComponent = sap.ui.getCore().getComponent("ChangeServiceComponent");
		if(!oChangeServiceComponent){
			oChangeServiceComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.change_service",
				id: "ChangeServiceComponent",
				url: "./change_service"
			});     
		}
		return oChangeServiceComponent;
	},
	getInvoice: function(){
		var oInvoiceComponent = sap.ui.getCore().getComponent("InvoiceComponent");
		if(!oInvoiceComponent){
			oInvoiceComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.invoice",
				id: "InvoiceComponent",
				url: "./invoice"
			});		
		}
		return oInvoiceComponent;
	},
	getMessageCenter: function(){
		var oMessageCenterComponent = sap.ui.getCore().getComponent("MessageCenterComponent");
		if(!oMessageCenterComponent){
			oMessageCenterComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.message_center",
				id: "MessageCenterComponent",
				url: "./message_center"
			});		
		}
		return oMessageCenterComponent;
	},
	getContract: function(){
		var oContractComponent = sap.ui.getCore().getComponent("ContractComponent");
		if(!oContractComponent){
			oContractComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.contract",
				id: "ContractComponent",
				url: "./contract"
			});		
		}
		return oContractComponent;
	},
	getUserProfile: function(){
		var oUserProfileComponent = sap.ui.getCore().getComponent("UserProfileComponent");
		if(!oUserProfileComponent){
			oUserProfileComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.user_profile",
				id: "UserProfileComponent",
				url: "./user_profile"
			});		
		}
		return oUserProfileComponent;
	},
	getOutage: function(){
		var oOutageComponent = sap.ui.getCore().getComponent("OutagesComponent");
		if(!oOutageComponent){
			oOutageComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.outages",
				id: "OutagesComponent",
				url: "./outages"
			});		
		}
		return oOutageComponent;
	},
	getUserManagement: function() {
		var oUserComponent = sap.ui.getCore().getComponent("UserComponent");
		if (!oUserComponent) {
			oUserComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.user_management",
				id: "UserComponent",
				url: jQuery.sap.getModulePath("sap.umc.mobile.public") + "/user_management"
			});
		}
		return oUserComponent;
	},
	getAgentPanel: function(){
		oAgentPanelComponent = sap.ui.getCore().getComponent("AgentPanelComponent");
		if (!oAgentPanelComponent) {
			oAgentPanelComponent = sap.ui.getCore().createComponent({
				name: "sap.umc.mobile.agent_panel",
				id: "AgentPanelComponent",
				url: "./agent_panel"
			});			
		}
		return oAgentPanelComponent;
	}
};