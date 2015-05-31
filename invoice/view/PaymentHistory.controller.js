
sap.umc.mobile.app.view.FullBaseController.extend("sap.umc.mobile.invoice.view.PaymentHistory", {
	onInit : function() {
		sap.umc.mobile.app.view.MasterBaseController.prototype.onInit.call(this);
		this._initSetting();
		this._handleRouting();
	},
	_handleRouting: function(){
		this.getRouter().attachRouteMatched(
			function(oEvent) {
				var sNavigationName = oEvent.getParameter("name");
				if (sNavigationName === "paymentHistory") {
					this.getDataProvider().loadPaymentHistory(this);
				}
			}, this);
	},
	showDetail: function(oInvoice){
		var bReplace = !jQuery.device.is.phone;
		this.getRouter().myNavTo("invoiceDetail", oInvoice, bReplace);
	},
	onPaymentHistoryLoaded: function(oInProcessPayments, oProcessedPayments){		
		this.getView().setModel(oInProcessPayments, "InProcessPayments");
		this.getView().setModel(oProcessedPayments, "ProcessedPayments");
	},

	handleListItemPress : function(oEvent) {
		sap.umc.mobile.Logger.info("Info: controller Invoices.controller is called.");
		var oContext = oEvent.getSource().getBindingContext("Invoices");
		var oSelectedInvoice = oContext.getProperty(oContext.getPath());
		this.showDetail(oSelectedInvoice);
	},
	handleListSelect : function(oEvent){
		var oContext = oEvent.getParameter("listItem").getBindingContext("InProcessPayments");
		var oSelectedPayment = oContext.getProperty(oContext.getPath());
		this.getView().getModel("PaymentHistorySetting").setProperty("/SelectedPayment", oSelectedPayment);
		this._setCancelPaymentVisible(true);
	},
	handleCancelPayment: function(oEvent){
		var obj = {
				title: sap.ui.getCore().getModel("i18n").getProperty("INVOICE.CONFIRMATION"),
				actions: [sap.ui.getCore().getModel("i18n").getProperty("APP.OK"), sap.ui.getCore().getModel("i18n").getProperty("APP.CANCEL")],
				onClose: $.proxy(function(oAction) { 
					if(oAction==="OK"){	      
						this.getDataProvider().cancelPayment(this, this.getView().getModel("PaymentHistorySetting").getProperty("/SelectedPayment"));
					}
				}, this)
		};
		sap.m.MessageBox.show(sap.ui.getCore().getModel("i18n").getProperty("INVOICE.CANCEL_PAYMENT_CONFIRM"), obj);	

	},
	_initSetting: function(){
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setProperty("/CancelPaymentVisible", false);
		this.getView().setModel(oModel, "PaymentHistorySetting");		
	},
	_isCancelPaymentVisible: function(){
		return this.getView().getModel("PaymentHistorySetting").getProperty("/CancelPaymentVisible");
	},
	_setCancelPaymentVisible: function(visible){
		this.getView().getModel("PaymentHistorySetting").setProperty("/CancelPaymentVisible", visible);
	},
	_cancelPayment: function(paymentDocumentID){
		this.getDataProvider().CancelPayment(this, paymentDocumentID);
	},
	onCancelPaymentSuccess: function() {
		this.displayMessageDialog(sap.umc.mobile.CONSTANTS.MESSAGE_SUCCESS, sap.ui.getCore().getModel("i18n").getProperty("INVOICE.CANCEL_PAYMENT_SUCCESS"));		 
		this.getDataProvider().loadInvoices(null, true);
		this.getDataProvider().loadPaymentHistory(this);
		this._setCancelPaymentVisible(false);
	}
});