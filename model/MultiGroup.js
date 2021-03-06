define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"./Model"
], function (lang, declare, Model) {
	// module: 
	//		gform/model/SingleObject

	return declare([Model], {
		// summary:
		//		Provides access to sibling attributes of modelHandle.
		groups: null,
		isNull: true,
		required:false,
		getTypeCode: function () {
			return null;
		},
		_isNullSetter: function (value) {
			if (value !== this.isNull) {
				if (value === true) {
					this.update(null);
				} else {
					this.update({});
				}
			}
		},
		_groupsSetter: function (groups) {
			groups.forEach(function (group) {
				group.parent = this;
			}, this);
			this._changeAttrValue("groups", groups);
		},
		update: function (/*Object*/plainValue) {
			// summary:
			//		update the attribute with the given plainValue. Attribute has a single valid type.
			// plainValue:
			//		the new value of the attribute
			if (this.required && plainValue == null) {
				plainValue = {};
			}
			if (plainValue == null) {
				this.isNull = true;
			} else {
				this.isNull = false;
				this.groups.forEach(function (group) {
					group.update(plainValue);
				});
			}
            this.oldValue = this.getPlainValue();

        },
		visit: function (cb, parentIdx) {
			for (var index = 0; index < this.groups.length; index++) {
				this.getModelByIndex(index).visit(cb, parentIdx);

			}
		},
		iterateChildren: function (cb) {
			for (var index = 0; index < this.groups.length; index++) {
				cb.call(this, this.getModelByIndex(index));
			}
		},
		getModelByIndex: function (index) {
			return this.groups[index];
		},
		_getModelByPath: function (index, path) {
			var model = this.getModel(index);
			if (model == null) {
				return null;
			} else {
				return model.getModelByPath(path);
			}
		},
		getModel: function (attributeCode) {
			var model = null;
			this.groups.map(function (group) {
				var m = group.getModel(attributeCode);
				if (m != null) {
					model = m;
				}
			});
			return model;
		},
		getPlainValue: function () {
			if (this.isNull) {
				return null;
			} else {
				var plainValue = {};
				this.groups.forEach(function (group) {
					var value = group.getPlainValue();
					lang.mixin(plainValue, value);
				});
				return plainValue;
			}
		}
	});
})
;
