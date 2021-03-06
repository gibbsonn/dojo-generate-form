define([
	"dojo/_base/lang",
	"../model/PrimitiveModel",
	"dojo/_base/declare"
], function (lang, PrimitiveModel, declare) {
	// module:
	//		gform/model/MappedSelectModel

	return declare([PrimitiveModel], {
		options: [],
		isValid: function (value) {
			if (this.parent == null) {
				return true;
			}
			return this.options.some(function (e) {
				return e.value === value;
			});

		},
		getDefault: function () {
			if (this.options.length > 0) {
				return this.options[0].value;
			} else {
				return null;
			}
		},
		_valueSetter: function (value) {
			if (this.isValid(value)) {
				this._changeAttrValue("value", value);
			} else if (this.required) {
				this._changeAttrValue("value", this.getDefault());
			} else {
				this._changeAttrValue("value", null);
			}
		}
	});
});
