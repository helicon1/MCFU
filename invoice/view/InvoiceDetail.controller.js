/*global window */ 
jQuery.sap.require("sap.umc.mobile.invoice.view.PaymentsController");

sap.umc.mobile.app.view.DetailBaseController.extend("sap.umc.mobile.invoice.view.InvoiceDetail", {
	onInit: function() {
		sap.umc.mobile.app.view.DetailBaseController.prototype.onInit.call(this);
		this._handleRouting();
	},
	_handleRouting: function() {
		this.getRouter().attachRouteMatched(function(oEvent) {
			var sNavigationName = oEvent.getParameter("name");
			if (sNavigationName === "invoiceDetail") {
				var oInvoiceId = oEvent.getParameter("arguments").InvoiceID;
				var oModel = this.getDataProvider().getInvoiceById(oInvoiceId);
				this.getView().setModel(oModel, "invoice");
				var sStatusID = parseInt(this.getView().getModel("invoice").getProperty("/InvoiceStatusID"), 10);
				this._removeContentView();
				if (sStatusID != sap.umc.mobile.CONSTANTS.PAYMENT_STATUS.OPEN) {
					this.getPayButton().setVisible(false);
				} else {
					this.getPayButton().setVisible(true);
				}
				this.getPaySubmitButton().setVisible(false);
				this.getBillHistoryGraph().setVisible(true);	
				this.getTrendLabel().setVisible(true);
				this._loadBillHistory();
				if (this._paymentsFragment) {
					this._getPaymentMethodsComboBox().setValue("");
				}
			}
			if (sNavigationName === "invoiceDetailPayment") {
				this._removeContentView();
				var oInvoiceId = oEvent.getParameter("arguments").InvoiceID;
				var sPaymentID = oEvent.getParameter("arguments").PaymentID;
				var oModel = this.getDataProvider().getInvoiceById(oInvoiceId);
				this.getView().setModel(oModel, "invoice");
				this.getPayButton().setVisible(false);
				this.getPaySubmitButton().setVisible(true);
				this.getBillHistoryGraph().setVisible(false);
				this.getTrendLabel().setVisible(false);
				if (this._paymentsFragment) {
					this._addContentView(this._paymentsFragment);
					if(sPaymentID){
						this._getPaymentMethodsComboBox().setSelectedKey(sPaymentID);
					}else{
						this._getPaymentMethodsComboBox().setValue("");
					}
				}
				var oParameters = {};
				oParameters.Amount = this.getView().getModel("invoice").getProperty("/AmountRemaining");
				var sCurrency = this.getView().getModel("invoice").getProperty("/Currency");
				oParameters.Amount = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oParameters.Amount, sCurrency);
				oParameters.EnablePaymentAmount = true;
				oParameters.PaymentID = sPaymentID;
				this._hidecvcOnload();
				this.oPaymentsController.read(oParameters);
				this._addContentView(this._paymentsFragment);
			}
			
		}, this);
	},
	isDirty: function(){
		
		sap.ui.getCore().getEventBus().subscribe("navigation_confirmation", "ok", jQuery.proxy(function(sChannelId, sEventId, oData){
    		if(oData.sViewGUID !== this._GUID){
				return false;
			}
    		this._removeContentView();
			this.getPayButton().setVisible(true);
			this.getPaySubmitButton().setVisible(false);
		}, this));
		if(!this.oPaymentsController){
			return false;
		}
		var bIsDirty = this.oPaymentsController.isDirty();
		return (bIsDirty && this.getPaySubmitButton().getVisible());
	},
	_loadBillHistory: function() {
		var oInvoiceHistory = new sap.ui.model.json.JSONModel();
		oInvoiceHistory.setData(this.getApp().getUtils().copyObject(this.getDataProvider().oInvoices.getData()));	
		oInvoiceHistory.setData({
			results: this._getMonthlyTotalAmount(oInvoiceHistory)
		});
		var oFormattedInvoiceHistory = sap.umc.mobile.invoice.js.utils.invoiceBillHistoryFormatter(oInvoiceHistory);
		this.getView().setModel(oFormattedInvoiceHistory.Invoices, "bill");
		var sMonthlyAverage = " - - - " + this.getText("INVOICE.MONTHLY_AVERAGE") + " : " + this.getView().getModel('invoice').getData().Currency + " "
				+ oFormattedInvoiceHistory.Average;
		this.getView().getModel("invoice").setProperty("/Average", sMonthlyAverage);
		this.getView().getModel("invoice").setProperty("/CostCurrency",
				this.getText("INVOICE.COST") + " (" + this.getView().getModel('invoice').getData().Currency + ")");
		// this.getView().getModel("invoice").setProperty("/CostCurrency", "");
		// Supported locales: en, zh, de, fr, es, ru, ja, pt and their more specific variations such as en-CA, es-AR, zh-HK, etc
		this.getView().getModel("invoice").setProperty("/LocaleCurrency", sap.ui.getCore().getModel("settings").getData().language);
		this._setDefaultSelection();
		var oAverage = sap.umc.mobile.invoice.js.utils
				.invoiceBillHistoryFormatter2(oFormattedInvoiceHistory.Invoices, oFormattedInvoiceHistory.Average);
		this.getView().setModel(oAverage, "bill2");
		//provide a workaround for the column binding
		this.getView().byId("graph_chart_column_amount_due").setName(this.getText("INVOICE.AMOUNT_DUE"));
		this.getView().byId("graph_chart_column_average").setName(this.getText("INVOICE.AVERAGE"));
		this.getView().byId("graph_chart_value_amount_due").setExpression(this.getText("INVOICE.AMOUNT_DUE"));
		this.getView().byId("graph_chart_vlaue_average").setExpression(this.getText("INVOICE.AVERAGE"));
		
	},
	_getMonthlyTotalAmount: function(oInvoiceHistory) {
		var afilteredInvoices = [];
		var dDateFrom = new Date(this.getView().getModel("invoice").getData().InvoiceDate);
		dDateFrom.setMonth(dDateFrom.getMonth() - 6);
		//var sDateFrom = dDateFrom.toString();
		var iDateTo = Date.parse(this.getView().getModel("invoice").getData().InvoiceDate);
		var iDate = Date.parse(dDateFrom);
		for ( var i = 0; i < oInvoiceHistory.getData().results.length; i++) {
			var iInvoiceDate = Date.parse(oInvoiceHistory.getData().results[i].InvoiceDate);
			if (iDate < iInvoiceDate && iInvoiceDate <= iDateTo
					&& oInvoiceHistory.getData().results[i].ContractAccountID === this.getView().getModel("invoice").getData().ContractAccountID) {
				if (afilteredInvoices.length === 0) {
					afilteredInvoices.push(oInvoiceHistory.getData().results[i]);
				} else if (afilteredInvoices[afilteredInvoices.length - 1].FormatteInvoiceDate === oInvoiceHistory.getData().results[i].FormatteInvoiceDate) {
					oInvoiceHistory.getData().results[i].AmountDue = parseFloat(oInvoiceHistory.getData().results[i].AmountDue)
							+ parseFloat(afilteredInvoices[afilteredInvoices.length - 1].AmountDue);
					//  Fix decimals issue
					oInvoiceHistory.getData().results[i].AmountDue = parseFloat(parseFloat(oInvoiceHistory.getData().results[i].AmountDue).toFixed(2));
					afilteredInvoices.pop();
					afilteredInvoices.push(oInvoiceHistory.getData().results[i]);
				} else {
					afilteredInvoices.push(oInvoiceHistory.getData().results[i]);
				}

			}
		}		
		if(afilteredInvoices.length > 6){
			afilteredInvoices.pop();
		}
		return afilteredInvoices.reverse();
	},
	_setDefaultSelection: function() {
		var oChart = this.getView().byId("chart_1");
		if (oChart._makitChart) {
			var oData = this.getView().getModel("bill").getData();
			var aData = [];
			for ( var i = 0; i < oData.results.length; i++) {
				aData.push(oData.results[i].FormatteInvoiceDate);
			}
			var aPeriods = [];
			$.each(aData, function(i, element) {
				if ($.inArray(element, aPeriods) === -1) {
					aPeriods.push(element);
				}
			});
			oChart._makitChart.setSelectedCategoryIndex(aPeriods.length - 1);
			return false;
		}
	},
	_getPaymentMethodsComboBox: function() {
		var aControls = this._paymentsFragment.findAggregatedObjects();
		return aControls[4];
	},
	_hidecvcOnload: function() {
		var aControls = this._paymentsFragment.findAggregatedObjects();
		var oCvcLabel = aControls[5];
		var oCvcInput = aControls[6];
		oCvcLabel.setVisible(false);
		oCvcInput.setVisible(false);
	},
	getPayButton: function() {
		return this.getView().byId("PayBill");
	},
	getPaySubmitButton: function() {
		return this.getView().byId("SubmitPay");
	},
	getBillHistoryGraph: function() {
		return this.getView().byId("Graph");
	},
	getTrendLabel: function(){
		return this.getView().byId("TrendLabel");
	},
	handleOpen: function(oEvent) {
		if (!this._invoiceActionSheet) {
			this._invoiceActionSheet = sap.ui.xmlfragment("sap.umc.mobile.invoice.view.ActionSheet", this);
			this.getView().addDependent(this._invoiceActionSheet);
		}
		var oButton = oEvent.getSource();
		jQuery.sap.delayedCall(0, this, function() {
			this._invoiceActionSheet.openBy(oButton);
		});
	},
	handleBillInquiryButton: function(oEvent) {
		var oMessageCenter = this.getApp().getComponents().getMessageCenter();
		oMessageCenter.getRouter().myNavTo("messageDetail", {
			ID: "-1",
			Type: sap.umc.mobile.CONSTANTS.MESSAGE_TYPE.INTERACTION_RECORD
		}, false);
	},
	handleViewPDFButton: function(oEvent) {
		this.getDataProvider().getInvoicePdf(this.getView().getModel("invoice").getProperty("/InvoiceID"));
	},
	handlePayButton: function(oEvent) {
		this.getPayButton().setVisible(false);
		this.getBillHistoryGraph().setVisible(false);
		this.getTrendLabel().setVisible(false);
		this.getPaySubmitButton().setVisible(true);
		if (!this._paymentsFragment) {
			this.oPaymentsController = sap.umc.mobile.invoice.view.PaymentsController;
			this._paymentsFragment = sap.ui.xmlfragment("sap.umc.mobile.invoice.view.Payments", this.oPaymentsController);
			this.oPaymentsController.setView(this.getView());
			this.getPaySubmitButton().attachPress(null, this.oPaymentsController.onSubmitOneTimePayment, this.oPaymentsController);
		}
		var oParameters = {};
		oParameters.Amount = this.getView().getModel("invoice").getProperty("/AmountRemaining");
		var sCurrency = this.getView().getModel("invoice").getProperty("/Currency");
		oParameters.Amount = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oParameters.Amount, sCurrency);
		oParameters.EnablePaymentAmount = true;
		this._hidecvcOnload();
		this.oPaymentsController.read(oParameters);
		this._addContentView(this._paymentsFragment);		
      // fix - scroll to Bottom on phone 
		if(jQuery.device.is.phone){
			this.getView().mAggregations.content[0].scrollTo(500, 1);
		}
	},
	_addContentView: function(oFragment) {
		var oView = this.getView().byId("ContentBox");
		oView.addContent(oFragment);
	},
	_removeContentView: function() {
		var oView = this.getView().byId("ContentBox");
		oView.removeAllContent();
	},
});
