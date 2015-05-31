jQuery.sap.declare("sap.umc.mobile.message_center.model.DataProvider");


sap.umc.mobile.message_center.model.DataProvider = {
	onAccountChange: function(sChannelId, sEventId, oContext){
		this._cleanCache();
	},	
	_cleanCache: function(){
		delete this.oMessages;
		delete this.oPremises;
		delete this.oContactAdditionalInfos;
		delete this.oIRDocumentStatuses;
		delete this.oIRReasons;
	},
	loadMessages: function(fnCallback) {
		var lFnCallback = jQuery.proxy(function() {
			fnCallback(this.oMessages, this._getSelectionModel());
		}, this);		
		if (!this.oMessages){
			this._reloadMessages(lFnCallback);
		} else {
			fnCallback(this.oMessages, this._getSelectionModel());
		}
	}, 
	_setUpModels: function(){
		this.oMessages = new sap.ui.model.json.JSONModel();
		this.oPremises = new sap.ui.model.json.JSONModel();
		this.oIRReasons = new sap.ui.model.json.JSONModel();
		this.oIRDocumentStatuses = new sap.ui.model.json.JSONModel();
		this.oContactAdditionalInfos = new sap.ui.model.json.JSONModel();
	},
	_reloadMessages: function(fnCallback) {
		this._setUpModels();
		this._readMessages(fnCallback);
	},
	loadPremises: function(oDelegate) {
		oDelegate.onPremisesLoaded(this.oPremises);
	},
	loadIRReasons: function(oDelegate) {
		oDelegate.onIRReasonsLoaded(this.oIRReasons);		
	},
	getNewMessageTypes: function(){
		if (!this.oNewMessageTypes){
			this.oNewMessageTypes = new sap.ui.model.json.JSONModel();
			var types ={ results:[{Type: sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE, Description: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.OUTAGE"), Icon:"sap-icon://up" },
			                      {Type:sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.SERVICE_NOTIFICATION, Description: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.PROBLEM"), Icon:"sap-icon://wrench"},
			                      {Type: sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.INTERACTION_RECORD, Description: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.MAKE_AN_INQUIRY"), Icon:"sap-icon://incident" }]};
			this.oNewMessageTypes.setData(types);			 
		}
		return this.oNewMessageTypes;
	},
	loadMessage: function(messageType, messageID, fnCallback){
		var lFnCallback = jQuery.proxy(function() {
			if (messageID == "-1"){
				fnCallback(this._getNewMessageModel(messageType));
			} else {
				var message = jQuery.grep(this.oMessages.getData().results, function(e){ return (e.ID == messageID)&&(e.Type == messageType); });		
				var oMessageModel = new sap.ui.model.json.JSONModel();
				oMessageModel.setData(message[0]);		
				fnCallback(oMessageModel);
			}
		}, this);		
		if (!this.oMessages){
			this._reloadMessages(lFnCallback);
		} else {
			lFnCallback.apply();
		}
	},
	_getNewMessageModel: function(messageType){
		var oMessageModel = new sap.ui.model.json.JSONModel();
		var oMessage = {ID: "-1"};		
		oMessage.Type = messageType;
		oMessage.DetailTitle = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.NEW_MESSAGE");
		switch (messageType){
		case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE:			
			oMessage.Outage = this._getOutageTemplate();
			break;
		case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.INTERACTION_RECORD:
			oMessage.InteractionRecord = this._getIRTemplate();
			break;
		case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.SERVICE_NOTIFICATION:
			oMessage.ServiceNotification = this._getServiceNotificationTemplate();
			break;
		default: 
			return;
		}
		oMessageModel.setData(oMessage);
		return oMessageModel;
	},
	_getOutageTemplate: function(){
		var oTemplate = {};		
		oTemplate.PremiseID = "";
		oTemplate.Note = "";
		oTemplate.Reason = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.REPORT_AN_OUTAGE");
		return oTemplate;
	},
	_getIRTemplate: function(){
		var oTemplate = {};
		oTemplate.AccountID = this.getAccountId();
		oTemplate.InteractionRecordReasonID = "";
		oTemplate.PremiseID = "";
		oTemplate.Description = "";
		oTemplate.Note = "";		
		return oTemplate;
	}, 
	_getServiceNotificationTemplate: function(){
		var oTemplate = {};
		oTemplate.AccountID = this.getAccountId();
		oTemplate.Description = "";
		oTemplate.Note = "";
		oTemplate.Reason = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.REPORT_A_PROBLEM");
		return oTemplate;
	},
	createMessage: function(oDelegate, oMessage){		
		if(this.isMock){
			oDelegate.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, oDelegate.getText("MESSAGE_CENTER.SENT_SUCCESS"));
		}else{
			this._createMessageEntity(oDelegate, oMessage);
		}
	},
	loadAttachments: function(sEntityName, sMessageId, fnCallback) {
		if(sMessageId === "-1" || sEntityName === "Alerts"){
			return;
		}
		this._loadAttachments(sEntityName, sMessageId, fnCallback);
	}
}
