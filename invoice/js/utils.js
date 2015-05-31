jQuery.sap.declare("sap.umc.mobile.invoice.js.utils");

sap.umc.mobile.invoice.js.utils = jQuery.extend(sap.umc.mobile.app.js.utils, {
	invoiceFormatter: function(oInvoices) {
		if (jQuery.isEmptyObject(oInvoices.getData())) {
			return;
		}
		var aMonthNames = sap.umc.mobile.app.js.utils.getMonths();
		var dDate;
		var i;
		var iAmountPaid, iAmountDue, iAmountRemaining, sCurrency;
		for (i = 0; i < oInvoices.getData().results.length; i++) {
			iAmountDue = oInvoices.getData().results[i].AmountDue;
			iAmountPaid = oInvoices.getData().results[i].AmountPaid;
			iAmountRemaining = oInvoices.getData().results[i].AmountRemaining;
			sCurrency = oInvoices.getData().results[i].Currency;

			oInvoices.getData().results[i].FormatteDueDate = this.Date(oInvoices.getData().results[i].DueDate);
			dDate = new Date(oInvoices.getData().results[i].InvoiceDate);
			oInvoices.getData().results[i].FormatteInvoiceDate = aMonthNames[dDate.getMonth()].Month + " " + dDate.getFullYear();

			oInvoices.getData().results[i].FormatteAmountDue = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(iAmountDue, sCurrency);
			oInvoices.getData().results[i].FormatteAmountPaid = sap.umc.mobile.app.js.formatters.amountWithCurrencyFormatter(iAmountPaid, sCurrency);
			oInvoices.getData().results[i].FormatteAmountRemaining = sap.umc.mobile.app.js.formatters.amountWithCurrencyFormatter(iAmountRemaining, sCurrency);
		}
		return oInvoices;
	},
	Date: function(value) {
		if (value) {
			return sap.umc.mobile.app.js.formatters.dateFormatter(new Date(value));
		} else {
			return value;
		}
	},
	TickToDate: function(dDate) {
		var newDate = new Date();
		if (dDate) {
			newDate.setYear(dDate.getUTCFullYear());
			newDate.setMonth(dDate.getUTCMonth());
			newDate.setDate(dDate.getUTCDate());
			newDate.setHours(0);
			newDate.setMinutes(0);
			newDate.setSeconds(0);
			return newDate.toLocaleDateString();
		}
		return dDate;
	},
	FormattedDueDate: function(value) {
		return sap.ui.getCore().getModel("i18n").getProperty("INVOICE.DUE_DATE") + ": " + value;
	},
	Price: function(value, currency) {
		return sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(value, currency);
	},
	Cvc: function(oKey) {
		if (oKey) {
			if (oKey === parseInt(oKey, 10)) {
				return false;
			}
			if (oKey.indexOf("card") >= 0) {
				return true;
			}
		}
		return false;
	},
	invoiceBillHistoryFormatter: function(oInvoices) {
		if (jQuery.isEmptyObject(oInvoices.getData())) {
			return;
		}
		var aMonthNames = sap.umc.mobile.app.js.utils.getMonths();
		var dDate;
		var i;
		var iTotalAmountDue = 0;
		for (i = 0; i < oInvoices.getData().results.length; i++) {	
			oInvoices.getData().results[i].AmountDue = parseFloat(oInvoices.getData().results[i].AmountDue);
			
			dDate = new Date(oInvoices.getData().results[i].InvoiceDate);
			oInvoices.getData().results[i].FormatteInvoiceDate = aMonthNames[dDate.getMonth()].Month.slice(0, 3) + " "
					+ dDate.getFullYear().toString().slice(2, 4);
			oInvoices.getData().results[i].FormatteAmountDue = sap.umc.mobile.app.js.formatters.amountWithoutCurrencyFormatter(oInvoices.getData().results[i].AmountDue, oInvoices.getData().results[i].Currency);
			iTotalAmountDue = iTotalAmountDue + parseFloat(oInvoices.getData().results[i].AmountDue);
		}
		if (i > 0) {
			iTotalAmountDue = parseFloat(iTotalAmountDue / i).toFixed(2);		
		}
		return {
			Invoices: oInvoices,
			Average: iTotalAmountDue
		};
	},
	invoiceBillHistoryFormatter2: function(oInvoices, average) {
		if (jQuery.isEmptyObject(oInvoices.getData())) {
			return;
		}
		for ( var i = 0; i < oInvoices.getData().results.length; i++) {
			oInvoices.getData().results[i].average = parseFloat(average);
		}
		return oInvoices;
	}

});