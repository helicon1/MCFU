/*global window */
sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.user_profile.view.CardDetail",{
	onInit: function() {
		sap.umc.mobile.app.view.FullBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "cardDetail") {
				var sPaymentCardID = oEvent.getParameter("arguments").PaymentCardID;
				if (sPaymentCardID !== "-1") {
					this._handleCardDetail(sPaymentCardID);
					this._initializeExpiryDate();
				} else {
					this._handleAddCard();
					this._loadPaymentCardTypes();
					this._initializeExpiryDate();
					this._setDefaultExpiryDate();
				}
			}
		}, this);
	},
	_handleCardDetail: function(sPaymentCardID) {
		var oModel = this.getDataProvider().getPaymentCardById(sPaymentCardID);
		var dData = new Date(oModel.oData.ValidTo);
		oModel.oData.Year = dData.getFullYear();
		oModel.oData.Month = dData.getMonth() + 1;
		this.getView().setModel(oModel, "cardDetail");
		this.getView().getModel("cardDetail").setProperty("/Title", this.getText("USER_PROFILE.CARD_DETAIL"));
		this.getView().getModel("cardDetail").setProperty("/DisplayInfo", false);
		this.getView().getModel("cardDetail").setProperty("/EditInfo", true);
		this.getView().getModel("cardDetail").setProperty("/AddCard", false);
		this.getView().getModel("cardDetail").setProperty("/ShowCard", true);
		this.getView().getModel("cardDetail").setProperty("/seletedMonth", parseInt(dData.getMonth(), 10));
		var dCurrentDate = new Date();
		this.getView().getModel("cardDetail").setProperty("/seletedYear", parseInt(dData.getFullYear() - dCurrentDate.getFullYear(), 10));
	},
	_handleAddCard: function() {
		var oData = {
				AccountID: this.getDataProvider().getAccount().getData().AccountID,
				CardNumber: "",
				Cardholder: "",
				PaymentCardTypeID: "",
				StandardFlag: false,
				ValidTo: ""
		};
		this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "cardDetail");
		this.getView().getModel("cardDetail").setProperty("/Title", this.getText("USER_PROFILE.ADD_CARD"));
		this.getView().getModel("cardDetail").setProperty("/DisplayInfo", true);
		this.getView().getModel("cardDetail").setProperty("/EditInfo", false);
		this.getView().getModel("cardDetail").setProperty("/AddCard", true);
		this.getView().getModel("cardDetail").setProperty("/ShowCard", false);
	},
	_loadPaymentCardTypes: function() {
		this.getDataProvider().loadPaymentCardTypes(this);
	},
	_initializeExpiryDate: function() {
		this._initializeYearsModel();
		this._initializeMonthsModel();
	},
	_setDefaultExpiryDate: function() {
		var dData = new Date();
		this.getView().getModel("cardDetail").getData().Year = dData.getFullYear();
		this.getView().getModel("cardDetail").getData().Month = dData.getMonth() + 1;
	},
	onReadPaymentCardSuccess: function(oModel) {
		this.getView().setModel(oModel, "cardTypes");
		this.getView().getModel("cardDetail").getData().PaymentCardTypeID = this.getView().getModel("cardTypes").getData().results[0].PaymentCardTypeID;
		this.getView().getModel("cardDetail").setProperty("/seletedCardID", "-1");
	},
	_initializeMonthsModel: function() {
		var oMonthsModel = new sap.ui.model.json.JSONModel();
		oMonthsModel.setData({
			results: this.getApp().getUtils().initializeMonths()
		});
		this.getView().setModel(oMonthsModel, "months");
		this.getView().getModel("cardDetail").setProperty("/seletedMonth",
				parseInt(this.getView().getModel("cardDetail").getData().Month - 1, 10));
	},
	_initializeYearsModel: function() {
		var oYearsModel = new sap.ui.model.json.JSONModel();
		oYearsModel.setData({
			results: this.getApp().getUtils().getYears()
		});
		this.getView().setModel(oYearsModel, "years");
		var dCurrentDate = new Date();
		this.getView().getModel("cardDetail").setProperty("/seletedYear",
				parseInt(this.getView().getModel("cardDetail").getData().Year - dCurrentDate.getFullYear(), 10));
	},			
	onCardTypeSelect: function(oEvent) {
		var sCardType = oEvent.getParameters().selectedItem.mProperties.key;
		this.getView().getModel("cardDetail").getData().PaymentCardTypeID = sCardType;
		this.onInformationModified();
	},
	onMonthSelect: function(oEvent) {
		var iMonth = parseInt(oEvent.getParameters().selectedItem.mProperties.key, 10) + 1;
		this.getView().getModel("cardDetail").getData().Month = iMonth;
		this.onInformationModified();
	},
	onYearSelect: function(oEvent) {
		var date = new Date();
		var icurrentYear = parseInt(date.getFullYear(), 10);
		var iYear = parseInt(oEvent.getParameters().selectedItem.mProperties.key, 10) + icurrentYear;
		this.getView().getModel("cardDetail").getData().Year = iYear;
		this.onInformationModified();
	},	
	onInformationModified: function(oEvent) {
		this.getView().getModel("cardDetail").setProperty("/Modified", true);
	},
	handleEditButton: function(oEvent) {
		this.getView().getModel("cardDetail").setProperty("/DisplayInfo", true);
		this.getView().getModel("cardDetail").setProperty("/EditInfo", false);
	},
	handleDeleteButton: function(oEvent) {
		var oPaymentCard = this.getView().getModel("cardDetail").getData();
		var oCopyPaymentCard = this.getApp().getUtils().copyObject(oPaymentCard);
		this._cleanUpCardDetail(oCopyPaymentCard);
		var obj = {
				title: this.getText("APP.CONFIRM"),
				actions: [sap.ui.getCore().getModel("i18n").getProperty("APP.OK"), sap.ui.getCore().getModel("i18n").getProperty("APP.CANCEL")],
				onClose: $.proxy(function(oAction) {
					if (oAction === "OK") {
						this.getDataProvider().removePaymentCard(this, oCopyPaymentCard);
					}
				}, this)
		};
		sap.m.MessageBox.show(this.getText("USER_PROFILE.CONFIRMCARD_DELETE"), obj);
	},
	handleSaveButton: function(oEvent) {		
		if(this._validateExpiryDate()){
			return false;
		}
		var oPaymentCard = this.getView().getModel("cardDetail").getData();
		var oCopyPaymentCard = this.getApp().getUtils().copyObject(oPaymentCard);
		if (this.getView().getModel("cardDetail").getProperty("/Title") === this.getText("USER_PROFILE.CARD_DETAIL")) {
			this._cleanUpCardDetail(oCopyPaymentCard);
			var bIsModelModified = this.getView().getModel("cardDetail").getProperty("/Modified");
			if (!bIsModelModified) {
				this.onSavePaymentCardSuccess();
			} else {
				oCopyPaymentCard.IssueDate = oPaymentCard.IssueDate;
				oCopyPaymentCard.ValidTo = new Date(oPaymentCard.Year, oPaymentCard.Month - 1, 15, 0, 0, 0, 0);
				this.getDataProvider().savePaymentCard(this, oCopyPaymentCard);
			}
		} else {
			this.getView().getModel("cardDetail").getData().CardNumber = this.getView().getModel('cardDetail').getProperty('/CardNumber');
			this.getView().getModel("cardDetail").getData().Cardholder = this.getView().getModel('cardDetail').getProperty('/Cardholder');
			this.getView().getModel("cardDetail").getData().AccountID = this.getDataProvider().getAccountId();
			this._cleanUpCardDetail(oCopyPaymentCard);
			oCopyPaymentCard.ValidTo = new Date(oPaymentCard.Year, oPaymentCard.Month - 1, 15, 0, 0, 0, 0);
			delete oCopyPaymentCard.Description;			
			this.getDataProvider().createNewCreditCard(this, oCopyPaymentCard);
		}
	},	
	_validateExpiryDate: function() {	
		if( this.getView().getModel("cardDetail").getProperty("/seletedMonth") === "0" && this.getView().getModel("cardDetail").getProperty("/seletedYear") === "0"){
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"USER_PROFILE.INVALID_DATE"));
			return true;
		} else if( !this.getView().getModel("cardDetail").getProperty("/seletedMonth") || !this.getView().getModel("cardDetail").getProperty("/seletedYear")){
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"USER_PROFILE.SELECT_DATE"));
			return true;
		}		
		var dData = new Date();		
		if(parseInt(dData.getFullYear(), 10) === this.getView().getModel("cardDetail").getData().Year && (dData.getMonth()+1) >= this.getView().getModel("cardDetail").getData().Month){
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, sap.ui.getCore().getModel("i18n").getProperty(
			"USER_PROFILE.INVALID_DATE"));
			return true;
		}
		return false;
	},	
	onCreatePaymentCardSuccess: function(oCard) {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sLastPage = oHistory.aHistory[oHistory.iHistoryPosition - 1];
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty(
		"USER_PROFILE.CREATECARD_SUSSCESS"));
		var oInvoice = {};
		oInvoice.PaymentID = oCard.PaymentCardID + "card";
		if(sLastPage === "Balance" || sLastPage === "AddedPayment"){
			var oInvoiceComponent = this.getApp().getComponents().getInvoice();
			oInvoiceComponent.getRouter().myNavTo("addedbalancepayment", oInvoice, false);
		}else if(sLastPage.indexOf("Invoice") > -1){
			var bReplace = !jQuery.device.is.phone;
			oInvoice.InvoiceID = sLastPage.split('/')[1];
			var oInvoiceComponent = this.getApp().getComponents().getInvoice();
			oInvoiceComponent.getRouter().myNavTo("invoiceDetailPayment", oInvoice, bReplace);
		}
		else{
			this.getRouter().myNavTo("paymentAccounts");
		}
	},
	onSavePaymentCardSuccess: function() {
		var bIsModelModified = this.getView().getModel("cardDetail").getProperty("/Modified");
		if (!bIsModelModified) {
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_ERROR, this.getText("USER_PROFILE.SAVE_SUSSCESS_NO_CHANGE"));
			return;
		} else {		
			this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty(
		"USER_PROFILE.SAVECARD_SUSSCESS"));
		}
		this.getView().getModel("cardDetail").setProperty("/DisplayInfo", false);
		this.getView().getModel("cardDetail").setProperty("/EditInfo", true);
		this.getView().getModel("cardDetail").setProperty("/Modified", false);
	},
	onDeletePaymentCardSuccess: function() {
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty(
		"USER_PROFILE.DELETECARD_SUSSCESS"));
		this.getRouter().myNavTo("paymentAccounts");
	},
	_cleanUpCardDetail: function(oCopyPaymentCard) {
		delete oCopyPaymentCard.AddCard;
		delete oCopyPaymentCard.CardType;
		delete oCopyPaymentCard.DisplayInfo;
		delete oCopyPaymentCard.EditInfo;
		delete oCopyPaymentCard.Year;
		delete oCopyPaymentCard.ShowCard;
		delete oCopyPaymentCard.Month;
		delete oCopyPaymentCard.seletedCardID;
		delete oCopyPaymentCard.Title;
		delete oCopyPaymentCard.PaymentCardType;
		delete oCopyPaymentCard.seletedMonth;
		delete oCopyPaymentCard.seletedYear;
		delete oCopyPaymentCard.Modified;
	},
	refreshCardAccounts: function() {
		this.getDataProvider().reloadPaymentCards();
	},
	isDirty: function(){
		return this.getView().getModel("cardDetail").getProperty("/Modified");
	}
});