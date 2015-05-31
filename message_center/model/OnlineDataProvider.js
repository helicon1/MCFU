jQuery.sap.declare("sap.umc.mobile.message_center.model.OnlineDataProvider");
sap.umc.mobile.message_center.model.OnlineDataProvider = {

	_readMessages: function(fnCallback) {
		var oDeferredERP = jQuery.Deferred();
		var oDeferredCRM = jQuery.Deferred();
		var oDataProvider = this;
		jQuery.when(oDeferredERP, oDeferredCRM).done(function() {
			fnCallback();
		});
		this._performERPBatch(oDeferredERP);
		this._performCRMBatch(oDeferredCRM);
	},
	_performERPBatch: function(oDeferred) {
		var aERP = [];
		aERP.push(this._getReadOutagesOperation());
		aERP.push(this._getReadServiceNotificationsOperation());
		aERP.push(this._getReadAlertsOperation());
		aERP.push(this._getReadContactAdditionalInfosOperation());
		this.SERVICE.clearBatch();
		this.SERVICE.addBatchReadOperations(aERP);
		var oCallbacks = {
			fnSuccess: jQuery.proxy(function(oData, oResponse, oContext) {
				this._setContactAdditionalInfosModel(oData.__batchResponses[3].data);
				this._setMessageModels("OT", oData.__batchResponses[0].data);
				this._setMessageModels("NT", oData.__batchResponses[1].data);
				this._setMessageModels("AL", oData.__batchResponses[2].data);
				oDeferred.resolve();
			}, this),
			fnError: jQuery.proxy(function(oData, oResponse, oContext) {
			}, this)
		};
		this.SERVICE.submitBatch(oCallbacks, true);
	},
	_performCRMBatch: function(oDeferred) {
		var aCRM = [];
		aCRM.push(this._getReadInteractionRecordReasonsOperation());
		aCRM.push(this._getReadPremisesOperation());
		aCRM.push(this._getReadInteractionRecordsOperation());
		aCRM.push(this._getReadIRDocumentStatusesOperation());
		this.CRM.clearBatch();
		this.CRM.addBatchReadOperations(aCRM);
		var oCallbacks = {
			fnSuccess: jQuery.proxy(function(oData, oResponse, oContext) {
				this._setIRDocumentStatusesModel(oData.__batchResponses[3].data);
				this._setIRReasonsModel(oData.__batchResponses[0].data);
				this._setPremisesModel(oData.__batchResponses[1].data);
				this._setMessageModels("IR", oData.__batchResponses[2].data);
				oDeferred.resolve();
			}, this),
			fnError: jQuery.proxy(function(oData, oResponse, oContext) {
			}, this)
		};
		this.CRM.submitBatch(oCallbacks, true);
	},
	_getReadOutagesOperation: function() {
		return this.SERVICE.createBatchOperation("Outages?$expand=ContactAdditionalInfo,Premise", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getReadServiceNotificationsOperation: function() {
		return this.SERVICE.createBatchOperation(this.getAccountPath() + "ServiceNotifications", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getReadAlertsOperation: function() {
		return this.SERVICE.createBatchOperation(this.getAccountPath() + "AccountAlerts", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getReadContactAdditionalInfosOperation: function() {
		return this.SERVICE.createBatchOperation("ContactAdditionalInfos", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getReadPremisesOperation: function() {
		return this.CRM.createBatchOperation(this.getAccountPath() + "ContractItems?$expand=Premise", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getReadInteractionRecordsOperation: function() {
		return this.CRM.createBatchOperation(this.getAccountPath() + "InteractionRecords?$expand=DocumentStatus", sap.umc.mobile.CONSTANTS.HTTP_GET,
				null, []);
	},
	_getReadIRDocumentStatusesOperation: function() {
		return this.CRM.createBatchOperation("GetAllStatusesOfEntity?EntityName='InteractionRecord'", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getReadInteractionRecordReasonsOperation: function() {
		return this.CRM.createBatchOperation("InteractionRecordReasons", sap.umc.mobile.CONSTANTS.HTTP_GET, null, []);
	},
	_getSelectionModel: function() {
		var oSelection = {
			results: [{
				Filter: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.ALL"),
				FilterID: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.ALL")
			}, {
				Filter: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.RECEIVED"),
				FilterID: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.RECEIVED")
			}, {
				Filter: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.SENT"),
				FilterID: sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.SENT")
			}]
		};
		return new sap.ui.model.json.JSONModel(oSelection);
	},
	_setMessageModels: function(messageType, oData) {
		switch (messageType) {
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.ALERT:
				this._appendToMessageModel(this._mapAlertsToMessages(oData));
				break;
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.SERVICE_NOTIFICATION:
				this._appendToMessageModel(this._mapNotificationsToMessages(oData));
				break;
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE:
				this._appendToMessageModel(this._mapOutagesToMessages(oData));
				break;
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.INTERACTION_RECORD:
				this._appendToMessageModel(this._mapIRsToMessages(oData));
				break;
		}
	},
	_appendToMessageModel: function(oData) {
		if (oData.results) {
			var oMergedData = {};
			if (this.oMessages.getData().results && this.oMessages.getData().results.length) {
				oMergedData.results = oData.results.concat(this.oMessages.getData().results);
			} else {
				oMergedData.results = oData.results;
			}
			// oMergedData.results.sort(function(a,b){return ((a.Date > b.Date) ? -1 : ((a.Date < b.Date) ? 1 : 0));});
			this.oMessages.setSizeLimit(oMergedData && oMergedData.results.length);
			this.oMessages.setData(oMergedData);
		}
	},
	_mapAlertsToMessages: function(oData) {
		var oMessages = {
			results: []
		};
		for ( var i = 0; i < oData.results.length; i++) {
			var oMessage = {};
			oMessage.Alert = oData.results[i];
			oMessage.Type = sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.ALERT;
			oMessage.MessageTypeDescription = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.ALERT");
			oMessage.DetailTitle = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.ALERT_DETAILS");
			oMessage.ID = oData.results[i].AlertID;
			oMessage.Direction = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.RECEIVED");
			oMessage.Date = (new Date()).toDateString();
			oMessage.Status = this._getAlertSeverityDescription(oData.results[i].AlertSeverityID);
			oMessage.Subject = oData.results[i].Subject;
			oMessage.ChannelIcon = 'sap-icon://alert';
			oMessage.State = this._getMessageState(oData.results[i].AlertSeverityID);
			oMessage._attachmentDisplayURL = "";
			oMessage._attachmentFileURL = "";
			oMessage._attachmentImageVisible = false;
			oMessage._attachmentIconVisible = false;
			oMessage._attachmentDescription = "";
			// sort
			oMessage.DateSorter = Date.parse(oMessage.Date);
			oMessages.results.push(oMessage);
		}
		return oMessages;
	},
	_mapIRsToMessages: function(oData) {
		var oMessages = {
			results: []
		};
		for ( var i = 0; i < oData.results.length; i++) {
			var oMessage = {};
			oMessage.InteractionRecord = oData.results[i];
			oMessage.Type = sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.INTERACTION_RECORD;
			oMessage.MessageTypeDescription = this._getIRReasonDescription(oData.results[i].InteractionRecordReasonID);
			oMessage.DetailTitle = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.MESSAGE_DETAILS");
			oMessage.ID = oData.results[i].InteractionRecordID;
			oMessage.Direction = oData.results[i].IncomingFlag ? sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.SENT") : sap.ui.getCore()
					.getModel("i18n").getProperty("MESSAGE_CENTER.RECEIVED");
			var dUtcDate = oData.results[i].DateFrom;
			oMessage.Date = new Date(dUtcDate.getUTCFullYear(), dUtcDate.getUTCMonth(), dUtcDate.getUTCDate(), dUtcDate.getUTCHours(), dUtcDate
					.getUTCMinutes(), dUtcDate.getUTCSeconds());
			oMessage.Subject = oData.results[i].Description;
			oMessage.ChannelIcon = this._getChannelIcon(oData.results[i].ChannelID);
			oMessage.State = this._getMessageState(oData.results[i].DocumentStatusID);
			oMessage._attachmentDisplayURL = "";
			oMessage._attachmentFileURL = "";
			oMessage._attachmentImageVisible = false;
			oMessage._attachmentIconVisible = false;
			oMessage._attachmentDescription = "";
			// for just created IR, get the Status property oData.results[i].DocumentStatus is deferred
			if (!oData.results[i].DocumentStatus.DocumentStatusID) {
				oMessage.InteractionRecord.DocumentStatus = this._getIRStatusDescription(oData.results[i].DocumentStatusID);
			}
			oMessage.Status = oMessage.InteractionRecord.DocumentStatus.Description;
			oMessage.InteractionRecord.Premise = this._getPremiseDetails(oData.results[i].PremiseID);
			// sort
			oMessage.DateSorter = Date.parse(oMessage.Date);
			oMessages.results.push(oMessage);
		}
		return oMessages;
	},
	_mapOutagesToMessages: function(oData) {
		var oMessages = {
			results: []
		};
		for ( var i = 0; i < oData.results.length; i++) {
			if (oData.results[i].ContactAdditionalInfoID != 7) {
				var oMessage = {};
				oMessage.Outage = oData.results[i];
				oMessage.Type = sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE;
				oMessage.MessageTypeDescription = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.OUTAGE");
				oMessage.DetailTitle = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.MESSAGE_DETAILS");
				oMessage.ID = oData.results[i].OutageID;
				oMessage.Direction = oData.results[i].IncomingFlag ? sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.SENT") : sap.ui
						.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.RECEIVED");
				oMessage.Subject = oData.results[i].Note;
				var dUtcDate = oData.results[i].DateTime;
				oMessage.Date = new Date(dUtcDate.getUTCFullYear(), dUtcDate.getUTCMonth(), dUtcDate.getUTCDate(), dUtcDate.getUTCHours(), dUtcDate
						.getUTCMinutes(), dUtcDate.getUTCSeconds());
				if (!oData.results[i].ContactAdditionalInfo || !oData.results[i].ContactAdditionalInfo.ContactAdditionalInfoID) {
					oMessage.Outage.ContactAdditionalInfo = this._getContactAdditionalInfoDetails(oData.results[i].ContactAdditionalInfoID);
				}
				if (oData.results[i].ContactAdditionalInfo && oData.results[i].ContactAdditionalInfo.Description) {
					oMessage.Status = oData.results[i].ContactAdditionalInfo.Description;
				}
				// oMessage.Status = oData.results[i].ContactAdditionalInfo.Description;
				oMessage.ChannelIcon = this._getChannelIcon(oData.results[i].ContactTypeID);
				oMessage.State = this._getMessageState(oData.results[i].ContactAdditionalInfoID);
				oMessage.Outage.Reason = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.REPORT_AN_OUTAGE");
				if ((!oMessage.Outage.Premise || !oMessage.Outage.Premise.PremiseID) && oData.results[i].PremiseID) {
					oMessage.Outage.Premise = this._getPremiseDetails(oData.results[i].PremiseID);
				}
				oMessage._attachmentDisplayURL = "";
				oMessage._attachmentFileURL = "";
				oMessage._attachmentImageVisible = false;
				oMessage._attachmentIconVisible = false;
				oMessage._attachmentDescription = "";
				// sort
				oMessage.DateSorter = Date.parse(oMessage.Date);
				oMessages.results.push(oMessage);
			}
		}
		return oMessages;
	},
	_mapNotificationsToMessages: function(oData) {
		var oMessages = {
			results: []
		};
		for ( var i = 0; i < oData.results.length; i++) {
			var oMessage = {};
			oMessage.ServiceNotification = oData.results[i];
			oMessage.Type = sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.SERVICE_NOTIFICATION;
			oMessage.MessageTypeDescription = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.PROBLEM");
			oMessage.DetailTitle = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.MESSAGE_DETAILS");
			oMessage.ID = oData.results[i].ServiceNotificationID;
			oMessage.Direction = oData.results[i].CreatedBy == this.getAccountId() ? sap.ui.getCore().getModel("i18n").getProperty(
					"MESSAGE_CENTER.RECEIVED") : sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.SENT");
			oMessage.Subject = oData.results[i].Description;
			var dUtcDate = oData.results[i].ChangedOn;
			oMessage.Date = new Date(dUtcDate.getUTCFullYear(), dUtcDate.getUTCMonth(), dUtcDate.getUTCDate(), dUtcDate.getUTCHours(), dUtcDate
					.getUTCMinutes(), dUtcDate.getUTCSeconds());
			oMessage.Status = oData.results[i].Status;
			oMessage.ChannelIcon = 'sap-icon://laptop';
			oMessage.State = this._getMessageState(oData.results[i].SystemStatus);
			oMessage.ServiceNotification.Reason = sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.REPORT_A_PROBLEM");
			oMessage._attachmentDisplayURL = "";
			oMessage._attachmentFileURL = "";
			oMessage._attachmentImageVisible = false;
			oMessage._attachmentIconVisible = false;
			oMessage._attachmentDescription = "";

			// sort
			oMessage.DateSorter = Date.parse(oMessage.Date);

			oMessages.results.push(oMessage);
		}
		return oMessages;
	},
	_getIRReasonDescription: function(reasonID) {
		var description;
		var oReason;
		if (this.oIRReasons && reasonID) {
			oReason = jQuery.grep(this.oIRReasons.getData(), function(e) {
				return e.InteractionRecordReasonID == reasonID;
			})[0];
		}
		if (!oReason) {
			description = reasonID;
		} else {
			description = oReason.Description;
		}
		return description;
	},
	_getAlertSeverityDescription: function(alertSeverityID) {
		switch (alertSeverityID) {
			case sap.umc.mobile.CONSTANTS.ALERT_SEVERITY.ERROR:
				return sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.ERROR");
			case sap.umc.mobile.CONSTANTS.ALERT_SEVERITY.INFO:
				return sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.INFO");
			case sap.umc.mobile.CONSTANTS.ALERT_SEVERITY.SUCCESS:
				return sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.SUCCESS");
			case sap.umc.mobile.CONSTANTS.ALERT_SEVERITY.WARNING:
				return sap.ui.getCore().getModel("i18n").getProperty("MESSAGE_CENTER.WARNING");
			default:
				return alertSeverityID;
		}
	},
	_getMessageState: function(status) {
		switch (status) {
			// Alert
			case 'E':
			case 'C':
				return 'Error';
			case 'I':
			case 'W':
				return 'Warning';
			case 'S':
				return 'Sucess';
				// Outage
			case '8':
				return 'None';
			case '9':
			case '10':
				return 'Warning';
			case '11':
				return 'Success';
				// IR
			case 'E0001':
				return 'None';
			case 'E0002':
				return 'Warning';
			case 'E0003':
				return 'Success';
			case 'E0007':
				return 'Error';
				// ServiceNotification
			case 'OSNO':
				return 'None';
			case 'NOPR':
			case 'OSTS':
			case 'ORAS':
				return 'Warning';
			case 'NOCO':
				return 'Success';
			default:
				return 'Warning';
		}
	},
	_getChannelIcon: function(channel) {
		sap.umc.mobile.Logger.info(channel);
		switch (channel) {
			// IR
			case "UMW":
				return 'sap-icon://laptop';
			case "UMM":
				return 'sap-icon://iphone';
				// Outage(fixed)
			default:
				return 'sap-icon://iphone';
		}
	},
	_createMessageEntity: function(oDelegate, oMessage, oContext) {
		var sPath, oService, oPayload;
		switch (oMessage.Type) {
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.INTERACTION_RECORD:
				sPath = "/InteractionRecords";
				oService = this.CRM;
				oPayload = oMessage.InteractionRecord;
				break;
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.SERVICE_NOTIFICATION:
				sPath = "/ServiceNotifications";
				oService = this.SERVICE;
				oPayload = oMessage.ServiceNotification;
				delete oPayload.Reason;
				delete oPayload.PremiseID;
				delete oPayload.InteractionRecordReasonID;
				break;
			case sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.OUTAGE:
				sPath = "/Outages";
				oService = this.SERVICE;
				oPayload = oMessage.Outage;
				delete oPayload.Reason;
				delete oPayload.InteractionRecordReasonID;
				break;
			default:
				return;
		}
		var fnSuccess = jQuery.proxy(function(oData, oResponse, oContext) {
			this._setMessageModels(oContext, {
				results: [oData]
			});
			oDelegate.onMessageSentSuccess(oData, oResponse);
		}, this);
		oService.createEntity(sPath, oPayload, {
			fnSuccess: fnSuccess
		}, oMessage.Type);
	},
	_setPremisesModel: function(oData) {
		var premises = [];
		var results = [];
		for ( var i = 0; i < oData.results.length; i++) {
			premises.push(oData.results[i].Premise);
		}
		function compare(a, b) {
			if (a.PremiseID < b.PremiseID) {
				return -1;
			}
			if (a.PremiseID > b.PremiseID) {
				return 1;
			}
			return 0;
		}
		premises.sort(compare);
		var premiseID = "";
		for ( var j = 0; j < premises.length; j++) {
			if (premiseID != premises[j].PremiseID) {
				premiseID = premises[j].PremiseID;
				results.push(premises[j]);
			}
		}
		this.oPremises.setData(results);
	},
	_setIRReasonsModel: function(oData) {
		this.oIRReasons.setData(oData.results);
	},
	_setIRDocumentStatusesModel: function(oData) {
		this.oIRDocumentStatuses.setData(oData.results);
	},
	_setContactAdditionalInfosModel: function(oData) {
		this.oContactAdditionalInfos.setData(oData.results);
	},
	_getPremiseDetails: function(premiseID) {
		if (this.oPremises && premiseID) {
			return jQuery.grep(this.oPremises.getData(), function(e) {
				return e.PremiseID == premiseID;
			})[0];
		}
	},
	_getIRStatusDescription: function(statusID) {
		var statuses = this.oIRDocumentStatuses.getData();
		var oStatus;
		if (statusID) {
			oStatus = jQuery.grep(statuses, function(e) {
				return e.DocumentStatusID == statusID || e.InternalID == statusID;
			})[0];
		}
		if (!oStatus) {
			oStatus = {
				Status: statusID,
				Description: statusID
			};
		}
		return oStatus;
	},
	_getContactAdditionalInfoDetails: function(contactAdditionalInfoID) {
		if (this.oContactAdditionalInfos && contactAdditionalInfoID) {
			return jQuery.grep(this.oContactAdditionalInfos.getData(), function(e) {
				return e.ContactAdditionalInfoID == contactAdditionalInfoID;
			})[0];
		}
	},

	_loadAttachments: function(sEntityName, sEntityId, fnCallback){
		var oService;
		if(sEntityName === "InteractionRecords"){
			oService = this.CRM;
		}else{
			oService = this.ERP;
		}
		oService.read(sEntityName + "('" + sEntityId + "')/Attachments", ["$format=json"], true, {
            fnSuccess: fnCallback
        });
	}
};