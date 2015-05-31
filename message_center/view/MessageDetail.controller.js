sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.message_center.view.MessageDetail", {
	onInit: function() {
		sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "messageDetail") {
				if (oEvent.getParameter("arguments").ID === "-1") {
					this.getView().setModel(new sap.ui.model.json.JSONModel({
						newMessage: true,
						displayMessage: false,
						AlertVisible: false,
						InertactionRecordVisible: false,
						OutageVisible: false,
						ServiceNotificationVisible: false,
						Modified: false, 
						hasAttachment : false
					}), "displayControl");
				} else {
					this.getView().setModel(new sap.ui.model.json.JSONModel({
						newMessage: false,
						displayMessage: true,
						AlertVisible: false,
						InertactionRecordVisible: false,
						OutageVisible: false,
						ServiceNotificationVisible: false,
						Modified: false,
						hasAttachment : false
					}), "displayControl");
				}
				var fnCallback = jQuery.proxy(function(oMessage) {
					this.getView().setModel(oMessage, "Message");
					this._loadSelectItems(oMessage.getData().Type);
					this._setPannelVisibility(oMessage.getData().Type);
					this._getBoundFileUploader().clear();
				}, this);
				this.getDataProvider().loadMessage(oEvent.getParameter("arguments").Type, oEvent.getParameter("arguments").ID, fnCallback);
			}
		}, this);
	},
	_getMessage: function(){
		return this.getView().getModel("Message");
	},
	_getMessageType: function(){
		return this._getMessage().getData().Type;
	},
	_getMessageId: function(){
		return this._getMessage().getProperty("/ID");
	},
	_setMessageId: function(oData){
		var sMessageId;
		switch (this._getMessageType()) {
			case "IR":
				sMessageId = oData.InteractionRecordID;
				break;
			case "OT":
				sMessageId = oData.OutageID;
				break;
			case "NT":
				sMessageId = oData.ServiceNotificationID;
				break;
		}
		this.getView().getModel("Message").setProperty("/ID", sMessageId);
	},
	_loadSelectItems: function(sType) {
		switch (sType) {
			case "IR":
			case "OT":
			case "NT":
				this.getDataProvider().loadAttachments(this._getEntityName(true),this._getMessageId(), jQuery.proxy(this.onAttachmentsLoaded, this));
				this.getDataProvider().loadPremises(this);
				this.getDataProvider().loadIRReasons(this);
				break;
			case "IR":
				this.getDataProvider().loadPremises(this);
				this.getDataProvider().loadIRReasons(this);
				break;
			case "OT":
				this.getDataProvider().loadPremises(this);
				break;
		}
	},
	onPremisesLoaded: function(oPremises) {
		this.getView().setModel(oPremises, "Premises");
		if (oPremises.getData().length > 0) {
			if (this.getView().getModel('displayControl').getProperty('/newMessage')) {
				this.getView().getModel("Message").getData()[this._getMessageDetailBindingContext(this.getView().getModel("Message").getData().Type)].PremiseID = oPremises.getData()[0].PremiseID;
			}
		}
	},
	onIRReasonsLoaded: function(oIRReasons) {
		this.getView().setModel(oIRReasons, "IRReasons");
		if (oIRReasons.getData().length > 0) {
			if (this.getView().getModel('displayControl').getProperty('/newMessage')) {
				this.getView().getModel("Message").getData()[this._getMessageDetailBindingContext(this.getView().getModel("Message").getData().Type)].InteractionRecordReasonID = oIRReasons.getData()[0].InteractionRecordReasonID;

			}
		}
	},
	onAttachmentsLoaded: function(oAttachments, oResponse) {
		if (!oAttachments || !oAttachments.results) {
			//New message, neither image or icon is available, and reset file uploader
			this._clearAttachmentPreview();
			this._getBoundFileUploader().clear();
			return;

		} else if (oAttachments.results.length > 0) {
			
			var sMimeType = oAttachments.results[0].MimeType;
			//Attachment exists, check if image or other known file
			//Attachment ID must be encoded to format the URL properly because of the backslashes in the ID
			this.getView().getModel("displayControl").setProperty("/IsAttachmentImage", this.getUtils().isContentTypeImage(sMimeType));
			this.getView().getModel("displayControl").setProperty("/hasAttachment", true);
			var sFileURL = this._getAttachmentUrl(oAttachments.results[0].AttachmentID);
			this.getView().getModel("Message").setProperty("/_attachmentDescription", oAttachments.results[0].FileName);
			this.getView().getModel("Message").setProperty("/_attachmentFileURL", sFileURL);
			var sDisplayUrl = (this.getUtils().isContentTypeImage(sMimeType))?sFileURL:this.getUtils().getIconUrlByMimeType(sMimeType); 
			this.getView().getModel("Message").setProperty("/_attachmentDisplayURL", sDisplayUrl);
		}
	},
	onAttachmentChange: function(oEvent) {
		//Clear exisitng attachment preview
		this._clearAttachmentPreview();

		//Check if a file was not just added to the file uploader control (might have been removed)
		if (!oEvent.oSource.oFileUpload.files[0]) {
			return;
		}

		var oFile = oEvent.oSource.oFileUpload.files[0];

		//Determine if file is an image
		if (oFile.type.match(/image.*/)) {
			//Check that browser supports fileReader
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				//HTML5 file API not supported
				return;
			}

			//Read image
			var oReader = new FileReader();
			oReader.onload = $.proxy(function(e) {
				//Set display image source and visibility properties
				this.getView().getModel("Message").setProperty("/_attachmentDisplayURL", e.target.result);
				this.getView().getModel("displayControl").setProperty("/_attachmentImageVisible", true);
				this.getView().getModel("Message").setProperty("/_attachmentDescription", oFile.name);
			}, this);
			oReader.readAsDataURL(oFile);

		} else {
			//File is not an image, display icon
			var sIconUrl = this._getAttachmentDisplayURL(oFile.type);

			this.getView().getModel("Message").setProperty("/_attachmentDisplayURL", sIconUrl);
			this.getView().getModel("displayControl").setProperty("/_attachmentIconVisible", true);
			this.getView().getModel("Message").setProperty("/_attachmentDescription", oFile.name);
		}

		this.onInformationModified();
	},
	_clearAttachmentPreview: function() {
		this.getView().getModel("Message").setProperty("/_attachmentDisplayURL", "");
		this.getView().getModel("Message").setProperty("/_attachmentFileURL", "");
		this.getView().getModel("Message").setProperty("/_attachmentDescription", "");
		this.getView().getModel("displayControl").setProperty("/IsAttachmentImage", false);
	},
	onAttachmentPress: function() {
		//If in a new message state and the attachment is pressed, nothing should happen
		if (this.getView().getModel("Message").getProperty("/ID") === "-1") {
			return;
		}
		//Otherwise open attachment in a new window
		var sAttachmentURL = this.getView().getModel("Message").getProperty("/_attachmentFileURL");
		window.open(sAttachmentURL);
	},
	onPremiseChanged: function(oEvent) {
		this.getView().getModel("Message").getData()[this._getMessageDetailBindingContext(this.getView().getModel("Message").getData().Type)].PremiseID = oEvent.oSource.getSelectedKey();
		this.onInformationModified();
	},
	onReasonChanged: function(oEvent) {
		this.getView().getModel("Message").getData()[this._getMessageDetailBindingContext(this.getView().getModel("Message").getData().Type)].InteractionRecordReasonID = oEvent.oSource.getSelectedKey();
		this.onInformationModified();
	},
	handleSubmitButton: function(oEvent) {
		if(this._validateNewMessage()){
			this.getDataProvider().createMessage(this, this.getView().getModel("Message").getData());
		}		
	},
	_validateNewMessage: function() {
		var oNewMessage = this.getView().getModel("Message").getData();
		if(oNewMessage.Outage){
			if(oNewMessage.Outage.Note === ""){
				this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("MESSAGE_CENTER.NO_MESSAGE"));
				return false;
			}		
		}else if(oNewMessage.ServiceNotification) {
			if(oNewMessage.ServiceNotification.Description === ""){
				this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("MESSAGE_CENTER.NO_SUBJECT"));
				return false;
			}else if(oNewMessage.ServiceNotification.Note === ""){
				this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("MESSAGE_CENTER.NO_MESSAGE"));
				return false;
			}		
		}else if(oNewMessage.InteractionRecord) {
			if(oNewMessage.InteractionRecord.Description === ""){
				this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("MESSAGE_CENTER.NO_SUBJECT"));
				return false;
			}else if(oNewMessage.InteractionRecord.Note === ""){
				this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("MESSAGE_CENTER.NO_MESSAGE"));
				return false;
			}			
		}
		return true;
	},
	onMessageSentSuccess: function(oData, oResponse) {
		this._setMessageId(oData);
		
		if (this._messageHasAttachment()) {
			this._uploadAttachment(this._getMessageId());
		} else {
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("MESSAGE_CENTER.SENT_SUCCESS"));
			this.getRouter().myNavTo("messageDetail", {
				ID: this._getMessageId(),
				Type: this._getMessageType()
			}, true);
		}
	},
	_messageHasAttachment: function(){
		var oFileUploader = this._getBoundFileUploader();
		if (oFileUploader && oFileUploader.getValue() !== "") {
			return true;
		}
		return false;
	},
	_uploadAttachment: function(sMessageId) {
		var oFileUploader = this._getBoundFileUploader().addParamters( this._getEntityName(), this._getMessageType(), sMessageId);
		var sUploadURL = this._getAttachmentUploadUrl(sMessageId);
		oFileUploader.setUploadUrl(sUploadURL);
		oFileUploader.upload();
	},
	onAttachmentUploadComplete: function(oEvent) {
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, this.getText("MESSAGE_CENTER.SENT_SUCCESS"));
		this.getRouter().myNavTo("messageDetail", {
			ID: this._getMessageId(),
			Type: this._getMessageType()
		}, true);
	},
	_getMessageDetailBindingContext: function(sMessageType) {
		switch (sMessageType) {
			case "IR":
				return "InteractionRecord";
			case "OT":
				return "Outage";
			case "NT":
				return "ServiceNotification";
			case "AL":
				return "Alert";
		}
	},
	_setPannelVisibility: function(messageType) {
		this.getView().getModel("displayControl").setProperty("/AlertVisible", this.getUtils().isAlert(messageType));
		this.getView().getModel("displayControl").setProperty("/OutageVisible", this.getUtils().isOutage(messageType));
		this.getView().getModel("displayControl").setProperty("/InteractionRecordVisible", this.getUtils().isInteractionRecord(messageType));
		this.getView().getModel("displayControl").setProperty("/ServiceNotificationVisible", this.getUtils().isServiceNotification(messageType));
	},
	onInformationModified: function(oEvent) {
		this.getView().getModel("displayControl").setProperty("/Modified", true);
	},
	isDirty: function() {
		var bIsDirty = this.getView().getModel("displayControl").getProperty("/Modified");
		this.getView().getModel("displayControl").setProperty("/Modified", false);
		return bIsDirty;
	},
/*	attachmentPressed: function(oEvent){
		var _messageId = this._getMessageId();
		var _messageType = this._getMessageType();
		this.getRouter().myNavTo("attachments", {
			ID: _messageId,
			Type: _messageType
		}, false);
	},*/
	_getEntityName: function(isEntitySet){
		var sValue = "";
		switch (this._getMessageType()) {
			case "IR":
				sValue = (isEntitySet)?"InteractionRecords":"InteractionRecord";
				break;
			case "OT":
				sValue = (isEntitySet)?"Outages":"Outage";
				break;
			case "NT":
				sValue = (isEntitySet)?"ServiceNotifications":"ServiceNotification";
				break;
			case "AL":
				sValue = (isEntitySet)?"Alerts":"Alert";
				break;
		}
		return sValue;
	},
	_getBoundFileUploader: function(){
		var oFileUploader;
		switch (this._getMessageType()) {
			case "IR":
				oFileUploader = this.getView().byId("IRFileUploader");
				break;
			case "OT":
				oFileUploader = this.getView().byId("OTFileUploader");
				break;
			case "NT":
				oFileUploader = this.getView().byId("NTFileUploader");
				break;
		}
		var oDataProvider = this.getDataProvider();
		oFileUploader.addParamters = jQuery.proxy(function(sEntityName, sMessageType, sMessageId){
			this.removeAllHeaderParameters();
			var csrfToken;
			switch (sMessageType) {
				case "IR":
					csrfToken = oDataProvider.CRM.oServiceModel.oHeaders["x-csrf-token"];
					break;
				case "OT":
				case "NT":
					csrfToken = oDataProvider.SERVICE.oServiceModel.oHeaders["x-csrf-token"];
					break;
			}
			
			var oFileUploaderCSRFParameter = new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: csrfToken
			});
			this.addHeaderParameter(oFileUploaderCSRFParameter);
			var sSlug = "FileName=" + this.getValue() + ";EntityName=" + sEntityName + ";EntityID=" + sMessageId;
			var oFileUploaderSlugParameter = new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: sSlug
			});
			this.addHeaderParameter(oFileUploaderSlugParameter);
			return this;
		}, oFileUploader);	
		return oFileUploader;
	},
	_getAttachmentUploadUrl: function(sMessageId){
		var sUrl = "";
		switch (this._getMessageType()) {
			case "IR":
				sUrl = this.getDataProvider().CRM.oServiceModel.sServiceUrl + "/Attachments";
				break;
			case "OT":
			case "NT":
				sUrl = this.getDataProvider().SERVICE.getServiceUrl() + "/" + this._getEntityName(true) + "('" + sMessageId + "')/Attachments";
				//sUrl = this.getDataProvider().SERVICE.getServiceUrl() + "/Attachments";
				break;
		}
		return sUrl;
	},
	_getAttachmentUrl: function(sAttachmentId){
		var sUrl = "";
		var sEncodedAttachmentID = encodeURIComponent(sAttachmentId);
		switch (this._getMessageType()) {
			case "IR":
				sUrl = this.getDataProvider().CRM.oServiceModel.sServiceUrl + "/Attachments('" + sEncodedAttachmentID + "')/$value";
				break;
			case "OT":
			case "NT":
				sUrl = this.getDataProvider().SERVICE.getServiceUrl() + "/Attachments('" + sEncodedAttachmentID + "')/$value";
				//sUrl = this.getDataProvider().SERVICE.getServiceUrl() + "/Attachments";
				break;
		}
		return sUrl;
		
	},
   handleViewBalanceButton: function(oEvent) {
      var oInvoiceComponent = this.getApp().getComponents().getInvoice();
      oInvoiceComponent.getRouter().myNavTo("balance", {}, false);
   }
});
