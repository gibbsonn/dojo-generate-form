define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/Stateful",
	"dojo/i18n!dijit/form/nls/validate",
	"dojo/i18n!../nls/validate",
	"./equals"
], function (lang, declare, Stateful, dijitNls, nls, equals) {
	// module: 
	//		gform/Resolver

	var emptyCascade = function () {
	};

	var MESSAGE_PATTERN = /^\{(.*)\}$/;

	return declare([Stateful], {
		// summary:
		//		Provides access to sibling attributes of modelHandle.

		// schema:,
		//		the schema of this model
		schema: null,

		emptyCascade: emptyCascade,

		// parent:,
		//		the parent model
		parent: null,
		alwaysUseInvalidMessage: false,
		touched: false,
		state: "",
		errorCount: 0,
		ownErrorCount: 0,
		incompleteCount: 0,
		changedCount: 0,
		oldErrors: [],
		validateOnChange: true,
		editorFactory: null,
		tmp: {},
		bubble: true,
		constructor: function (kwArgs) {
			this.messages = this.messages || {};
			if (kwArgs && kwArgs.meta) {
				this.messages.missingMessage = kwArgs.meta.missingMessage;
				this.messages.invalidMessage = kwArgs.meta.invalidMessage;
			}
			this.watch("state", lang.hitch(this, "_onChangeState"));
			this.watch("value", lang.hitch(this, "_onChangeState"));
			this.watch("touched", lang.hitch(this, "_onChangeState"));
		},
		getPath: function (modelHandle) {
			// summary:
			//		get the absolute path to the current attribute
			// returns: String
			//		absolute path
			return "";
		},
		getParent: function (attributeCode) {
			// summary:
			//		get value of sibling attribute
			// attributeCode: String
			//		the name of he sibling attribute
			var model = this.parent.getModelByPath(attributeCode);
			if (model == null) {
				return null;
			} else {
				return model.getPlainValue();
			}
		},
		watchParent: function (attributeCode, watchCallback) {
			// summary:
			//		watch value of sibling attribute
			// attributeCode: String
			//		the name of he sibling attribute
			// watchCallback: function
			//		callback
			// returns: Object
			//		WatchHandle and sibling a PrimitiveModel

			// TODO only works for parent being an object
			return this.parent.watchPath(attributeCode, watchCallback);
		},
		createMeta: function (schema) {
			// summary:
			//		create a meta object
			// returns: dojo/Stateful
			var meta = this.editorFactory.createMeta(schema);
			meta.set("tmp", new Stateful());
			meta.parent = this;
			return meta;
		},
		_onChangeState: function (prop, old, nu) {
			if (old !== nu) {
				this.onChange(prop !== "state");
			}
		},
		hasChanged: function () {
			return typeof this.oldValue !== "undefined" && this.getPlainValue() !== this.oldValue && !equals(this.getPlainValue(), this.oldValue);
		},
		onChange: function (validate) {
			if (validate !== false && this.validateOnChange) {
				this.validate();
			}
			this.computeProperties();
			if (this.bubble) {
				if (this.parent) {
					this.parent.onChange(validate);
				}
			}
		},
		_execute: function (cb, bubble) {
			var oldBubble = this.bubble;
			this.bubble = bubble === true;
			try {
				cb.call(this);
			} finally {
				this.bubble = oldBubble;
			}
		},
		computeProperties: function () {
			var errorCount = 0;
			var incompleteCount = 0;
			var changedCount = 0;
			var ownErrorCount = 0;
			if (this.iterateChildren) {
				this.iterateChildren(function (model) {
					errorCount += model.errorCount;
					//ownErrorCount += model.ownErrorCount;
					incompleteCount += model.incompleteCount;
					changedCount += model.changedCount;
				});
			}
			if (this.state === "Error") errorCount++;
			if (this.state === "Incomplete") incompleteCount++;
			if (this.oldErrors.length > 0) ownErrorCount++;
			if (this.hasChanged() && changedCount === 0) {
				changedCount = 1;
			}
			this.set("incompleteCount", incompleteCount);
			this.set("ownErrorCount", ownErrorCount);
			this.set("changedCount", changedCount);
			this.set("errorCount", errorCount);
		},
		remove: function () {
			if (this.parent && this.parent.removeChild) {
				this.parent.removeChild(this);
			}
		},
		visit: function (cb, idx) {
			cb(this, idx);
		},
		resetMetaRecursively: function () {
			this.visit(function (model, cascade) {
				model.resetMeta();
				cascade();
				model.computeProperties();
			});
		},
		reset: function () {
			// summary:
			//		reset value and state.
			this.visit(function (model, cascade, idx) {
				model.resetMeta();
				cascade();
			});
			this.update(this.oldValue, false);
		},
		getModelByPath: function (path) {
			if (path === "") {
				return this;
			}
			if (!Array.isArray(path)) {
				path = path.split(".");
			}
			if (path.length === 0) {
				return this;
			} else {
				return this._getModelByPath(path[0], path.slice(1));
			}

		},
		resetMeta: function () {
			// summary:
			//		reset meta data. does not cascade.
			this.set("state", "");
			this.set("message", "");
			this.set("touched", false);
		},
		hasChildrenErrors: function () {
			return this.errorCount > this.ownErrorCount;
		},
		isEmpty: function () {
			return false;
		},
		validateRecursively: function (force) {
			this.visit(function (model, cascade) {
				cascade();
				model.validate(force);
			});
		},
		onTouch: function () {
			this.set("touched", true);
		},
		validate: function (force) {
			if (this.isEmpty()) {
				if (this.required) {
					if (force === true || this.touched || this.hasChanged()) {
						this.set("state", "Error");
						this.set("message", this.getMissingMessage());

					} else {
						this.set("state", "Incomplete");
						this.set("message", this.getMissingMessage());
					}
					return;

				} else {
					return;
				}
			} else {
				if (this.state === "Incomplete") {
					this.state = "";
				}
			}
			this._execute(function () {
				var errors = [];

				if (this._validate) {
					errors = errors.concat(this._validate());
				}
				if (this.validators) {
					this.validators.forEach(function (validator) {
						errors = errors.concat(validator(this));
					}, this);
				}
				var changes = this._getErrorChanges(errors, this.oldErrors);
				changes.a.forEach(function (error) {
					this.addError(error.path, error.message);
				}, this);
				changes.r.forEach(function (error) {
					this.removeError(error.path, error.message);
				}, this);
				this.oldErrors = errors;
			}, false);
		},
		_getErrorChanges: function (newErrors, oldErrors) {
			var errorsToRemove = oldErrors.filter(function (oe) {
				return !newErrors.some(function (e) {
					return e.path === oe.path;
				});
			});
			var errorsToAdd = newErrors.filter(function (e) {
				return !oldErrors.some(function (oe) {
					return e.path === oe.path;
				});
			}, this);
			return {a: errorsToAdd, r: errorsToRemove};
		},
		watchPath: function (path, watcher) {
			return this.getModelByPath(path).watch(watcher);
		},
		getMessage: function (keyOrMessage, internal) {
			// summary:
			//		get the human readable message. If the parameter is enclosed in curly braces then the message
			// 		will be served from this model's messages property or the message bundle.  Otherwise it will be returned as is.
			if (!keyOrMessage) {
				return this.getMessageForKey("invalidMessage");
			} else if (internal && this.alwaysUseInvalidMessage) {
				// TODO this is wrong if the message comes from an model validation.
				return this.getMessageForKey("invalidMessage");
			} else {
				var key = keyOrMessage.match(MESSAGE_PATTERN);
				if (key !== null && key.length === 2) {
					return this.getMessageForKey(key[1]);
				} else {
					return keyOrMessage;
				}
			}

		},
		getMessageForKey: function (key) {
			return this.messages[key] || nls[key] || dijitNls[key];
		},
		getMissingMessage: function () {
			return this.messages.missingMessage || dijitNls.missingMessage;
		},
		addError: function (path, message) {
			var model = this.getModelByPath(path);
			model._addError(message, !path || path.length == 0);
		},
		_addError: function (message, internal) {
			this.set("state", "Error");
			this.set("message", this.getMessage(message, internal));
		},
		removeError: function (path, message) {
			var model = this.getModelByPath(path);
			if (model) {
				model._removeError(message);
			}
		},
		_removeError: function (message) {
			if (this.get("message") === this.getMessage(message)) {
				this.set("state", "");
				this.set("message", "");
			}
		}
	});
});
