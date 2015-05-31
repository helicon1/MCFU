/*global window */
sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.ContactInformation", {
	_NORTH_AMERICA_FRAGMENT_ID:"MainAddressNA_Fragment",
	_NORTH_AMERICA_FRAGMENT_NAME:"sap.umc.mobile.user_profile.view.MainAddressNA",
	_EMEA_FRAGMENT_ID:"MainAddressEMEA_Fragment",
	_EMEA_FRAGMENT_NAME:"sap.umc.mobile.user_profile.view.MainAddressEMEA",
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._attachMainAddressFragment();
		this._handleRouting();
	},
	_attachMainAddressFragment: function(sObjectHeaderInsertionPointId){
		var sInsertionPointId = "MainAddress_Fragment";
		var oMainAddressFragment = new sap.ui.xmlfragment(this._getMainAddressFragmentId(), this._getMainAddressFragmentName(), this);
		this.getView().byId(sInsertionPointId).addContent(oMainAddressFragment);	
	},
	getDataProvider: function() {
		return sap.umc.mobile.user_profile.model.DataProvider;
	},

	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "contactInfo") {
				this._initializeViewModel();
				this._initializeContactAddressModel();
				this._initializeContactPhonesAndEmailsModelsForUpdate("email");
				this._initializeContactPhonesAndEmailsModelsForUpdate("homePhone");
				this._initializeContactPhonesAndEmailsModelsForUpdate("mobilePhone");
				this._initializeContactPhonesAndEmailsModels();
				var sSelectedTabKey = this.getView().byId("ContactDetailsTab").getSelectedKey();
				if (sSelectedTabKey != "0") {
					this.getView().byId("ContactDetailsTab").setSelectedKey("0");
				}
				this.iNewItemsCounter = 0;
			}
		}, this);
	},
	isDirty: function(){
		sap.ui.getCore().getEventBus().subscribe("navigation_confirmation", "ok", jQuery.proxy(function(sChannelId, sEventId, oData){
    		if(oData.sViewGUID !== this._GUID){
				return false;
			}
    		this.getView().getModel("viewModel").setProperty("/AddressModified", false);
			this.getView().getModel("viewModel").setProperty("/PhonesAndEmailsModified", false);
		}, this), this);
        return this.getView().getModel("viewModel").getProperty("/AddressModified") || this.getView().getModel("viewModel").getProperty("/PhonesAndEmailsModified");
	},
	_initializeViewModel: function() {
		var oData = {
				sCurrentTab: "0",
				bEditMode: false,
				bPhonesEditMode: false
		};

		var oViewModel = new sap.ui.model.json.JSONModel();
		oViewModel.setData(oData);

		this.getView().setModel(oViewModel, "viewModel");
	},
	
	onAddressEditButtonPress: function() {
		this.getView().getModel("viewModel").setProperty("/bEditMode", true);
	},
	
	onPhonesEditButtonPress: function() {
		this.getView().getModel("viewModel").setProperty("/bPhonesEditMode", true);
	},	

	onAddressInformationModified: function(oEvent) {
		this.getView().getModel("viewModel").setProperty("/AddressModified", true);
	},

	onPhonesAndEmailsInformationModified: function(oEvent) {
		this.getView().getModel("viewModel").setProperty("/PhonesAndEmailsModified", true);
	},
	
	onAddressSaveButtonPress: function() {
		var oContactAddress = this.getView().getModel("contactAddressModel").getData();
		oContactAddress.AddressInfo.CountryID = this._getCountriesDropDown().getSelectedKey();

		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		if(bIsNorthAmerica){
			oContactAddress.AddressInfo.Region = this._getReionsDropDwon().getSelectedKey();
		}

		if(this._isAddressValid(oContactAddress.AddressInfo)) {
			this.getDataProvider().updateContactAddress(this, oContactAddress);		
		} else {
			var sErrorText = this.getText("USER_PROFILE.ERROR_CONTACT_ADDRESS");
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sErrorText);
		}
	},

	_isAddressValid: function(oAddressInfo) {
		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		var bIsAddressValid = true;

		bIsAddressValid = oAddressInfo.HouseNo !== "";
		bIsAddressValid = bIsAddressValid && oAddressInfo.Street !== "";
		bIsAddressValid = bIsAddressValid && oAddressInfo.City !== "";
		bIsAddressValid = bIsAddressValid && oAddressInfo.PostalCode !== "";
		bIsAddressValid = bIsAddressValid && oAddressInfo.CountryID !== "";

		if(bIsNorthAmerica) {
			bIsAddressValid = bIsAddressValid && oAddressInfo.Region !== "";
		}

		return bIsAddressValid;
	},

	onPhonesSaveButtonPress: function() {
		var oContactPhonesAndEmailsForUpdate = {
				emails: {
					change: [],
					add: [],
					remove: []
				},
				homePhones: {
					change: [],
					add: [],
					remove: []
				},
				mobilePhones: {
					change: [],
					add: [],
					remove: []
				}
		};

		oContactPhonesAndEmailsForUpdate = this._prepareContactPhonesAndEmailsForUpdate("email", oContactPhonesAndEmailsForUpdate);
		oContactPhonesAndEmailsForUpdate = this._prepareContactPhonesAndEmailsForUpdate("homePhone", oContactPhonesAndEmailsForUpdate);
		oContactPhonesAndEmailsForUpdate = this._prepareContactPhonesAndEmailsForUpdate("mobilePhone", oContactPhonesAndEmailsForUpdate);

		this.getDataProvider().updateContactPhonesAndEmails(this, oContactPhonesAndEmailsForUpdate);	
	},	
	
	onContactDetailsSelected: function() {
//		this.getView().getModel("viewModel").setProperty("/bPhonesEditMode", false);
//		this.getView().getModel("viewModel").setProperty("/bEditMode", false);
		
		var sSelectedTabKey = this.getView().byId("ContactDetailsTab").getSelectedKey();
		this.getView().getModel("viewModel").setProperty("/sCurrentTab", sSelectedTabKey);
	},

	//Contact Phones&Emails Logic
	_initializeContactPhonesAndEmailsModelsForUpdate: function(sContactType) {
		var sModelName = "";

		switch (sContactType) {
		case "email":
			sModelName = "emailsForUpdate";
			break;
		case "homePhone":
			sModelName = "homePhonesForUpdate";
			break;
		case "mobilePhone":
			sModelName = "mobilePhonesForUpdate";
			break;
		}

		var oDataForUpdate = {
				change: [],
				add: [],
				remove: []
		};
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oDataForUpdate);

		this.getView().setModel(oModel, sModelName);
	},

	_initializeContactPhonesAndEmailsModels: function() {
		this.getDataProvider().loadContactPhonesAndEmails(this);
	},

	_prepareBindingForContactPhonesAndEmails: function(oVL, sContactType, fnFormatter) {
		var sRelevantSourceModel = "";
		var sRelevantArrayInSourceModel = "";
		var sPropertyName = "";
		switch (sContactType) {
		case "email":
			sRelevantSourceModel = "contactEmails";
			sRelevantArrayInSourceModel = "emails";
			sPropertyName = "Email";
			break;
		case "homePhone":
			sRelevantSourceModel = "contactHomePhones";
			sRelevantArrayInSourceModel = "homePhones";
			sPropertyName = "PhoneNo";
			break;
		case "mobilePhone":
			sRelevantSourceModel = "contactMobilePhones";
			sRelevantArrayInSourceModel = "mobilePhones";
			sPropertyName = "PhoneNo";
			break;
		}

		// var fnInputFieldFormatter = this._displayInputFieldFormatter;

		oVL.bindAggregation("content", sRelevantSourceModel + ">/" + sRelevantArrayInSourceModel, new sap.m.FlexBox({
			items: [
			        new sap.ui.core.Icon({
						src: "sap-icon://sys-minus",
						layoutData: new sap.m.FlexItemData({
							growFactor: 1
						}),
						customData: [{
							key: "contactType",
							value: sContactType
						}, {
							key: "sequenceNo",
							value: "{" + sRelevantSourceModel + ">SequenceNo}"
						}],
						press: $.proxy(this.onMinusPress, this),
						visible: "{viewModel>/bPhonesEditMode}"
			        }).addStyleClass("sapUmcHorizontalAfterSpacingX1_5").addStyleClass("sapUmcVerticalBeforeSpacingX2").addStyleClass("sapUmcRedTextColor"),
			        new sap.m.Input({
						value: "{" + sRelevantSourceModel + ">" + sPropertyName + "}",
						customData: [{
							key: "contactType",
							value: sContactType
						}, {
							key: "sequenceNo",
							value: "{" + sRelevantSourceModel + ">SequenceNo}"
						}],
						layoutData: new sap.m.FlexItemData({
							growFactor: 500
						}),
						liveChange: $.proxy(this.onContactPhonesAndEmailsChange, this),
						enabled: "{viewModel>/bPhonesEditMode}"
						// visible: {
						//     path: sRelevantSourceModel + ">" + sPropertyName,
						//     //parts: [sRelevantSourceModel + ">" + sPropertyName, "viewModel>/bEditMode"],
						//     formatter: $.proxy(fnInputFieldFormatter, this)
						// }
			        }),
			        new sap.ui.core.Icon({
						src: "sap-icon://sys-add",
						layoutData: new sap.m.FlexItemData({
							growFactor: 1
						}),
						customData: [{
							key: "contactType",
							value: sContactType
						}, {
							key: "sequenceNo",
							value: "{" + sRelevantSourceModel + ">SequenceNo}"
						}],
						press: $.proxy(this.onPlusPress, this),
						visible: {
							parts: [sRelevantSourceModel + ">SequenceNo", "viewModel>/bPhonesEditMode"],
							formatter: $.proxy(fnFormatter, this)
						}
			        }).addStyleClass("sapUmcHorizontalBeforeSpacingX1_5").addStyleClass("sapUmcVerticalBeforeSpacingX2").addStyleClass("sapUmcGreenTextColor"),
			        new sap.m.RadioButton({
						groupName: sContactType,
						selected: "{" + sRelevantSourceModel + ">StandardFlag}",
						layoutData: new sap.m.FlexItemData({
							growFactor: 1
						}),
						customData: [{
							key: "contactType",
							value: sContactType
						}, {
							key: "sequenceNo",
							value: "{" + sRelevantSourceModel + ">SequenceNo}"
						}],
						enabled: "{viewModel>/bPhonesEditMode}",
						select: $.proxy(this.onContactPhonesAndEmailsChange, this)
					}).addStyleClass("sapUmcHorizontalBeforeSpacingX4 sapUmcHorizontalAfterSpacingX2")
					],
					justifyContent: "Center",
					width: "100%"
		}));//
	},

	onContactPhonesAndEmailsLoaded: function(oData) {
		var oHomePhones = {
				homePhones: []
		};
		var oMobilePhones = {
				mobilePhones: []
		};
		var oEmails = {
				emails: []
		};
		var i;
		for (i = 0; i < oData.AccountAddressDependentPhones.results.length; i++) {
			if (oData.AccountAddressDependentPhones.results[i].PhoneType === "1") {
				oData.AccountAddressDependentPhones.results[i].StandardFlag = true;
			}
			oHomePhones.homePhones.push(oData.AccountAddressDependentPhones.results[i]);
		}

		var oHomePhonesModel = new sap.ui.model.json.JSONModel();
		oHomePhonesModel.setData(oHomePhones);
		this.getView().setModel(oHomePhonesModel, "contactHomePhones");

		if (oHomePhones.homePhones.length === 0) {
			this.addEmptyLine("homePhone", true);
		}
		var i;
		for (i = 0; i < oData.AccountAddressDependentMobilePhones.results.length; i++) {
			if (oData.AccountAddressDependentMobilePhones.results[i].PhoneType === "3") {
				oData.AccountAddressDependentMobilePhones.results[i].StandardFlag = true;
			}
			oMobilePhones.mobilePhones.push(oData.AccountAddressDependentMobilePhones.results[i]);
		}

		var oMobilePhonesModel = new sap.ui.model.json.JSONModel();
		oMobilePhonesModel.setData(oMobilePhones);
		this.getView().setModel(oMobilePhonesModel, "contactMobilePhones");

		if (oMobilePhones.mobilePhones.length === 0) {
			this.addEmptyLine("mobilePhone", true);
		}
		var i;
		for (i = 0; i < oData.AccountAddressDependentEmails.results.length; i++) {
			oEmails.emails.push(oData.AccountAddressDependentEmails.results[i]);
		}

		var oEmailsModel = new sap.ui.model.json.JSONModel();
		oEmailsModel.setData(oEmails);
		this.getView().setModel(oEmailsModel, "contactEmails");

		if (oEmails.emails.length === 0) {
			this.addEmptyLine("email", true);
		}

		var oVL = this.getView().byId("ContactEmails");
		this._prepareBindingForContactPhonesAndEmails(oVL, "email", this._displayPlusForEmailsFormatter);

		oVL = this.getView().byId("ContactHomePhones");
		this._prepareBindingForContactPhonesAndEmails(oVL, "homePhone", this._displayPlusForHomePhonesFormatter);

		oVL = this.getView().byId("ContactMobilePhones");
		this._prepareBindingForContactPhonesAndEmails(oVL, "mobilePhone", this._displayPlusForMobilePhonesFormatter);

		this.getView().getModel("viewModel").setProperty("/bPhonesEditMode", false);
	},

	onPlusPress: function(oEvent) {
		this.addEmptyLine(oEvent.oSource.getCustomData()[0].mProperties.value, false);
	},

	addEmptyLine: function(sContactType, bPreferred) {
		var oData = {};
		var sRelevantSourceModel = "";
		var sRelevantArrayInSourceModel = "";
		var sPropertyName = "";

		switch (sContactType) {
		case "email":
			sRelevantSourceModel = "contactEmails";
			sRelevantArrayInSourceModel = "emails";
			sPropertyName = "Email";
			break;
		case "homePhone":
			sRelevantSourceModel = "contactHomePhones";
			sRelevantArrayInSourceModel = "homePhones";
			sPropertyName = "PhoneNo";
			break;
		case "mobilePhone":
			sRelevantSourceModel = "contactMobilePhones";
			sRelevantArrayInSourceModel = "mobilePhones";
			sPropertyName = "PhoneNo";
			break;
		}

		oData = this.getView().getModel(sRelevantSourceModel).getData();
		oData[sRelevantArrayInSourceModel].push({
			SequenceNo: "newItem_" + this.iNewItemsCounter,
			StandardFlag: bPreferred,
			AccountID: this.AccountID,
			AddressID: this.AddressID
		});
		oData[sPropertyName] = "";

		this.iNewItemsCounter++;
		this.getView().getModel(sRelevantSourceModel).setData(oData);
	},

	onMinusPress: function(oEvent) {
		var sRelevantSourceModel = "";
		var sRelevantArrayInSourceModel = "";
		var sRelevantModelForUpdate = "";
		var sPropertyName = "";
		var oData = {};
		var bSwitchPreferred = false;

		switch (oEvent.oSource.getCustomData()[0].mProperties.value) {
		case "email":
			sRelevantSourceModel = "contactEmails";
			sRelevantArrayInSourceModel = "emails";
			sPropertyName = "Email";
			sRelevantModelForUpdate = "emailsForUpdate";
				break;
		case "homePhone":
			sRelevantSourceModel = "contactHomePhones";
			sRelevantArrayInSourceModel = "homePhones";
			sPropertyName = "PhoneNo";
			sRelevantModelForUpdate = "homePhonesForUpdate";
				break;
		case "mobilePhone":
			sRelevantSourceModel = "contactMobilePhones";
			sRelevantArrayInSourceModel = "mobilePhones";
			sPropertyName = "PhoneNo";
			sRelevantModelForUpdate = "mobilePhonesForUpdate";
				break;
		}

		var oViewModelData = this.getView().getModel(sRelevantSourceModel).getData();

		if (oEvent.oSource.getCustomData()[1].mProperties.value.indexOf("new") >= 0) {
			var oData = this.getView().getModel(sRelevantModelForUpdate).getData();
			var i;
			for (i = 0; i < oData.add.length; i++) {
				if (oData.add.SequenceNo === oEvent.oSource.getCustomData()[1].mProperties.value) {
					oData.add.splice(i, 1);
					break;
				}
			}
			this.getView().getModel(sRelevantModelForUpdate).setData(oData);

		} else {
			oData = this.getView().getModel(sRelevantModelForUpdate).getData();
			oData.remove.push({
				SequenceNo: oEvent.oSource.getCustomData()[1].mProperties.value,
				AccountID: this.AccountID,
				AddressID: this.AddressID,
			});
			this.getView().getModel(sRelevantModelForUpdate).setData(oData);
			this.onPhonesAndEmailsInformationModified();
		}
		var i;
		for (i = 0; i < oViewModelData[sRelevantArrayInSourceModel].length; i++) {
			if (oViewModelData[sRelevantArrayInSourceModel][i].SequenceNo === oEvent.oSource.getCustomData()[1].mProperties.value) {
				if (oViewModelData[sRelevantArrayInSourceModel].length > 1) {
					if (oViewModelData[sRelevantArrayInSourceModel][i].StandardFlag) {
						bSwitchPreferred = true;
					}
					oViewModelData[sRelevantArrayInSourceModel].splice(i, 1);
					if (bSwitchPreferred) {
						oViewModelData[sRelevantArrayInSourceModel][0].StandardFlag = true;
					}
					break;
				} else {
					oViewModelData[sRelevantArrayInSourceModel].splice(i, 1);
					this.addEmptyLine(oEvent.oSource.getCustomData()[0].mProperties.value, true);
					break;
				}
			}
		}

		this.getView().getModel(sRelevantSourceModel).setData(oViewModelData);
	},

	_checkIfLastItem: function(sSequenceNo, sType) {
		var sRelevantSourceModel = "";
		var sRelevantArrayInSourceModel = "";

		var bReturnValue = false;
		switch (sType) {
		case "email":
			sRelevantSourceModel = "contactEmails";
			sRelevantArrayInSourceModel = "emails";
			break;
		case "homePhone":
			sRelevantSourceModel = "contactHomePhones";
			sRelevantArrayInSourceModel = "homePhones";
			break;
		case "mobilePhone":
			sRelevantSourceModel = "contactMobilePhones";
			sRelevantArrayInSourceModel = "mobilePhones";
			break;
		}

		var aSourceItems = this.getView().getModel(sRelevantSourceModel).getData()[sRelevantArrayInSourceModel];
		var i;
		for (i = 0; i < aSourceItems.length; i++) {
			if (aSourceItems[i].SequenceNo === sSequenceNo) {
				if (i === (aSourceItems.length - 1)) {
					bReturnValue = true;
				}
				break;
			}
		}
		return bReturnValue;
	},

	_displayPlusForEmailsFormatter: function(sSequenceNo, bEditMode) {
		var bDisplayPlus = false;
		if (bEditMode) {
			bDisplayPlus = this._checkIfLastItem(sSequenceNo, "email");
		}
		return bDisplayPlus;
	},

	_displayPlusForHomePhonesFormatter: function(sSequenceNo, bEditMode) {
		var bDisplayPlus = false;
		if (bEditMode) {
			bDisplayPlus = this._checkIfLastItem(sSequenceNo, "homePhone");
		}
		return bDisplayPlus;
	},

	_displayPlusForMobilePhonesFormatter: function(sSequenceNo, bEditMode) {
		var bDisplayPlus = false;
		if (bEditMode) {
			bDisplayPlus = this._checkIfLastItem(sSequenceNo, "mobilePhone");
		}
		return bDisplayPlus;
	},
	onContactPhonesAndEmailsChange: function(oEvent) {
		this.onPhonesAndEmailsInformationModified();

		switch (oEvent.oSource.getCustomData()[0].mProperties.value) {
		case "email":
			this._prepareDataForChange("email", oEvent.oSource.getCustomData()[1].mProperties.value);
			break;
		case "homePhone":
			this._prepareDataForChange("homePhone", oEvent.oSource.getCustomData()[1].mProperties.value);
			break;
		case "mobilePhone":
			this._prepareDataForChange("mobilePhone", oEvent.oSource.getCustomData()[1].mProperties.value);
			break;
		}
	},

	_prepareDataForChange: function(sContactType, sSequenceNo) {
		var sRelevantModel = "";
		var sRelevantArrayInModel = "";
		var sRelevantUpdateModel = "";
		var bAlreadyMarkedForChange = false;
		var sOperation = "";

		switch (sContactType) {
		case "email":
			sRelevantModel = "contactEmails";
			sRelevantArrayInModel = "emails";
			sRelevantUpdateModel = "emailsForUpdate";
			break;
		case "homePhone":
			sRelevantModel = "contactHomePhones";
			sRelevantArrayInModel = "homePhones";
			sRelevantUpdateModel = "homePhonesForUpdate";
			break;
		case "mobilePhone":
			sRelevantModel = "contactMobilePhones";
			sRelevantArrayInModel = "mobilePhones";
			sRelevantUpdateModel = "mobilePhonesForUpdate";
			break;
		}

		var oContactData = {};
		var oItemsToUpdateData = this.getView().getModel(sRelevantUpdateModel).getData();
		var aSourceItems = this.getView().getModel(sRelevantModel).getData()[sRelevantArrayInModel];
		var i;
		for (i = 0; i < aSourceItems.length; i++) {
			if (aSourceItems[i].SequenceNo === sSequenceNo) {
				oContactData = aSourceItems[i];
				break;
			}
		}

		if (sSequenceNo.indexOf("new") >= 0 && sSequenceNo !== "") {
			sOperation = "add";
		} else {
			sOperation = "change";
		}
		var i;
		for (i = 0; i < oItemsToUpdateData[sOperation].length; i++) {
			if (oItemsToUpdateData[sOperation][i].SequenceNo === sSequenceNo) {
				bAlreadyMarkedForChange = true;
				break;
			}
		}

		if (!bAlreadyMarkedForChange) {
			var oData = this.getView().getModel(sRelevantUpdateModel).getData();
			oData[sOperation].push({
				SequenceNo: sSequenceNo
			});

			this.getView().getModel(sRelevantUpdateModel).setData(oData);
		}
	},

	_prepareContactPhonesAndEmailsForUpdate: function(sContactType, oContactPhonesAndEmailsForUpdate) {
		var sRelevantSourceModel = "";
		var sRelevantArrayInSourceModel = "";
		var sModelWithDataForUpdate = "";

			switch (sContactType) {
			case "email":
				sRelevantSourceModel = "contactEmails";
				sRelevantArrayInSourceModel = "emails";
				sModelWithDataForUpdate = "emailsForUpdate";
				break;
			case "homePhone":
				sRelevantSourceModel = "contactHomePhones";
				sRelevantArrayInSourceModel = "homePhones";
				sModelWithDataForUpdate = "homePhonesForUpdate";
				break;
			case "mobilePhone":
				sRelevantSourceModel = "contactMobilePhones";
				sRelevantArrayInSourceModel = "mobilePhones";
				sModelWithDataForUpdate = "mobilePhonesForUpdate";
				break;
			}

		var aItemsToUpdate = this.getView().getModel(sModelWithDataForUpdate).getData()["change"];
		var aSourceItems = this.getView().getModel(sRelevantSourceModel).getData()[sRelevantArrayInSourceModel];
		var i;
		for (i = 0; i < aItemsToUpdate.length; i++) {
			for (var j = 0; j < aSourceItems.length; j++) {
				if (aItemsToUpdate[i].SequenceNo === aSourceItems[j].SequenceNo) {
					oContactPhonesAndEmailsForUpdate[sRelevantArrayInSourceModel]["change"].push(aSourceItems[j]);
					break;
				}
			}
		}

		aItemsToUpdate = this.getView().getModel(sModelWithDataForUpdate).getData()["add"];

		for (i = 0; i < aItemsToUpdate.length; i++) {
			for (var j = 0; j < aSourceItems.length; j++) {
				if (aItemsToUpdate[i].SequenceNo === aSourceItems[j].SequenceNo) {
					oContactPhonesAndEmailsForUpdate[sRelevantArrayInSourceModel]["add"].push(aSourceItems[j]);
					break;
				}
			}
		}

		aItemsToUpdate = this.getView().getModel(sModelWithDataForUpdate).getData()["remove"];
		var i;
		for (i = 0; i < aItemsToUpdate.length; i++) {
			oContactPhonesAndEmailsForUpdate[sRelevantArrayInSourceModel]["remove"].push(aItemsToUpdate[i]);
		}
		return oContactPhonesAndEmailsForUpdate;
	},

	onContactPhonesAndEmailsUpdated: function() {
		this._initializeContactPhonesAndEmailsModelsForUpdate("email");
		this._initializeContactPhonesAndEmailsModelsForUpdate("homePhone");
		this._initializeContactPhonesAndEmailsModelsForUpdate("mobilePhone");
		this._initializeContactPhonesAndEmailsModels();
		this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.CHANGE_CONTACT_INFO_SUCCESS"));
		this.getView().getModel("viewModel").setProperty("/PhonesAndEmailsModified", false);
	},

	//Contact Address Logic
	_initializeContactAddressModel: function() {
		this.getDataProvider().loadContactAddress(this);
	},

	_setRegionsModel: function(sCountryID) {
		this.getDataProvider().loadContactAddressRegions(this, sCountryID);
	},

	_setCountryDropDownInitialValue: function(sCountryID) {
		var oCountryDropDown = this._getCountriesDropDown();
		oCountryDropDown.setSelectedKey(sCountryID);
		this._setRegionsModel(sCountryID);
	},

	_setRegionDropDownInitialValue: function(sRegion) {
		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		if(bIsNorthAmerica){
			var oRegionDropDown = this._getReionsDropDwon();
			oRegionDropDown.setSelectedKey(sRegion);
		}
	},

	_initializeCountriesModel: function() {
		if (!this.getDataProvider().oCountries) {
			this.getDataProvider().loadCountryList(this);
		} else {
			this.getView().setModel(this.getDataProvider().oCountries, "countries");
			var oAddressData = this.getView().getModel("contactAddressModel").getData();
			this._setCountryDropDownInitialValue(oAddressData.AddressInfo.CountryID);
		}
	},

	onContactAddressLoaded: function(oData) {
		var oContactAddressModel = new sap.ui.model.json.JSONModel();
		oContactAddressModel.setData(oData);
		this.AccountID = oData.AccountID;
		this.AddressID = oData.AddressID;
		this.getView().setModel(oContactAddressModel, "contactAddressModel");
		this._initializeCountriesModel();
	},

	onRegionsLoaded: function(oData) {
		var oRegionsModel = new sap.ui.model.json.JSONModel();
		oRegionsModel.setData(oData);
		this.getView().setModel(oRegionsModel, "regions");
		this._setRegionDropDownInitialValue(this.getView().getModel("contactAddressModel").getData().AddressInfo.Region);
	},

	onLoadCountryListSuccess: function(oModel) {
		this.getView().setModel(oModel, "countries");
		this._setCountryDropDownInitialValue(this.getView().getModel("contactAddressModel").getData().AddressInfo.CountryID);
	},

	onCountryChange: function(oEvent) {
		this._setRegionDropDownInitialValue(this.getView().getModel("contactAddressModel").setProperty("/AddressInfo/Region", ""));
		this._setRegionsModel(oEvent.getSource().getSelectedKey());
		this.onAddressInformationModified();
	},

	onSaveContactAddressSuccess: function() {
		this.getApp().getUtils().displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty("USER_PROFILE.CHANGE_CONTACT_INFO_SUCCESS"));
		this.getView().getModel("viewModel").setProperty("/bEditMode", false);
		this.getView().getModel("viewModel").setProperty("/AddressModified", false);
//		this.getDataProvider()._initializeAgentUserGroup();
	},
	_getMainAddressFragmentId: function(){
		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		if(bIsNorthAmerica){
			return this._NORTH_AMERICA_FRAGMENT_ID;
		}else{
			return this._EMEA_FRAGMENT_ID;
		}
	},
	_getMainAddressFragmentName: function(){
		var bIsNorthAmerica = sap.ui.getCore().getModel("settings").getProperty("/isNorthAmerica");
		if(bIsNorthAmerica){
			return this._NORTH_AMERICA_FRAGMENT_NAME;
		}else{
			return this._EMEA_FRAGMENT_NAME;
		}
	},
	_getReionsDropDwon: function(){
		return sap.ui.core.Fragment.byId(this._getMainAddressFragmentId(), "RegionsDropDown");
	},
	_getCountriesDropDown: function(){
		return sap.ui.core.Fragment.byId(this._getMainAddressFragmentId(), "CountriesDropDown");
	}
});