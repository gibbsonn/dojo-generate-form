define([
	"dojo/_base/declare", // declare
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/i18n", // i18n.getLocalization
	"dijit/form/CurrencyTextBox",
	"./_NotValidatingOnFocusMixin"//
], function (declare, kernel, i18n, CurrencyTextBox, _NotValidatingOnFocusMixin) {


	return declare("gform.CurrencyTextBox", [CurrencyTextBox, _NotValidatingOnFocusMixin], {
		// summary:
		//		Base class for textbox widgets with the ability to validate content of various types and provide user feedback.

		_isValidSubset: function () {
			// otherwise initially entered illegal characters are not marked as error.
			return false;
		},
		displayMessage: function (/*String*/ message) {
		}

	});
});
