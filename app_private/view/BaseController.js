jQuery.sap.declare("sap.umc.mobile.app.view.BaseController");


var fnBaseProxy = function(oExtendedBaseController){
	oExtendedBaseController.extend("sap.umc.mobile.app.view.BaseController", {
		onInit: function() {
			oExtendedBaseController.prototype.onInit.call(this);
		},
		_initHeader: function(){	
			oExtendedBaseController.prototype._initHeader.call(this);
		},
		_initFooter: function(){
			oExtendedBaseController.prototype._initFooter.call(this);
		},
		isMessageCenter: function(){
			return 	(sap.umc.mobile.message_center && sap.umc.mobile.message_center.view.MessageCenter && this instanceof sap.umc.mobile.message_center.view.MessageCenter) || 
					(sap.umc.mobile.message_center && sap.umc.mobile.message_center.view.AddMessage && this instanceof sap.umc.mobile.message_center.view.AddMessage);
		},
		isHome: function(){
			if(sap.umc.mobile.home && sap.umc.mobile.home.view && sap.umc.mobile.home.view.Home){
				return (this instanceof sap.umc.mobile.home.view.Home);	
			}
			else{
				return false;
			}
		},
		isAgentPanel: function(){
			if(sap.umc.mobile.agent_panel){
				return (this instanceof sap.umc.mobile.agent_panel.view.BpSearch);	
			}else{
				return false;
			}
		},
		isUserProfile: function(){
			if(sap.umc.mobile.user_profile){
				return (this.getComponent() instanceof sap.umc.mobile.user_profile.Component);
			} else{
				return false;
			}

		},
		handleHomePressed: function(){
			this._backToHome();
		},
		handleAgentSearchPressed: function(){
			this._backToBPSearch();
		},
		handleUserProfilePressed : function() {
			var oUserProfileComponent = sap.ui.getCore().getComponent("AppComponent").getComponents().getUserProfile();
			oUserProfileComponent.getRouter().myNavTo("userProfile",{}, false);
		}
	});
};
