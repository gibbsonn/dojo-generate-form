define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/promise/all",
	"dojo/when",
	"dojo/Stateful",
	"dojo/i18n!../nls/messages"
], function (declare, lang, all, when, Stateful, messages) {
// module:
//		gform/controller/_CrudMixin

	return declare([Stateful], {
		// summary:
		//		the _CrudMixin wraps an editor and a store. Methods for loading or creating entities from a store are provided.

		// state:
		//		maybe "loading", "edit", "create".
		state: "loading",

		// plainValueFactory: function
		//		creates an instance of plainValue. parameter is the schema.
		plainValueFactory: null,

		// store:
		//		the store used to persist the entity.
		store: null,

		// editor:
		//		the editor
		editor: null,

		// dialog: gform/controller/ConfimDialog
		//		used to inform user of pending changes.
		dialog: null,

		invokeIfOk: function (callback) {
			// summary:
			//		check if there are pending changes. If so a dialog will be displayed to ask the user to either
			//		cancel his action or discard the changes.
			// callback: function
			//		will be invoked if no changes or changes can be discarded.
			var wrappedCallback = function (ok) {
				if (ok) callback();
			}
			var dialogOpened = this._checkState(wrappedCallback);
			if (!dialogOpened) callback();
		},

		_checkState: function (callback) {
			// summary:
			//		check if there are pending changes. If so a dialog will be displayed to ask the user to either
			//		cancel his action or discard the changes.
			// callback: function
			//		will be invoked with parameter true if no changes or changes shall be discarded.
			// return: boolean
			//		true if a dialog was opened
			this.editor.syncPendingChanges();
			var dialogOpened = false;
			if (this.state == "create" && this.editor.hasChanged()) {
				this.startConfirmDialog(messages["actions.unsavedNewEntity"], callback);
				dialogOpened = true;
			} else if (this.state == "edit" && this.editor.hasChanged()) {
				this.startConfirmDialog(messages["actions.unsavedChanges"], callback);
				dialogOpened = true;
			}
			return dialogOpened;
		},
		alert: function (message) {
			// summary:
			//		display messages to user
			// message: String	
			alert(message);
		},
		setCtx: function (ctx) {
			this.editor.set("ctx", ctx);
		},
		edit: function (id, schemaUrl) {
			// summary:
			//		load entity in editor
			// id:
			//		the id of the entity
			// schemaUrl: String
			//		the schema is loaded from the url.
			var dialogOpened = this.invokeIfOk(lang.hitch(this, "_edit", id, schemaUrl));

		},
		_showLoading: function () {
			this.set("state", "loading");
		},
		getSchema: function (url) {
			return this.editor.ctx.getSchema(url);
		},
		_edit: function (id, schemaUrl) {
			var instancePromise = this.store.get(id);
			if (schemaUrl) {
				// remove form 
				this.editor.set("meta", {});
				var schemaPromise = this.getSchema(schemaUrl);
				var promise = all([instancePromise, schemaPromise]);
				var me = this;
				this._showLoading();
				this._execute(promise, "LoadForEditAndSchema");
			} else {
				var promise = instancePromise;
				this._showLoading();
				this._execute(promise, "LoadForEdit");
			}
		},
		_onLoadForEdit: function (entity) {
			this.set("state", "edit");
			this.editor.set("plainValue", entity);
		},
		_onLoadForEditFailed: function (error) {
			this.set("state", "edit");
			alert("error while loading entity");
		},
		_onLoadForEditAndSchema: function (results) {
			this.set("state", "edit");
			this.editor.setMetaAndPlainValue(results[1], results[0]);
			this.emit("editor-changed");
		},
		_onLoadForEditAndSchemaFailed: function (error) {
			this.set("state", "edit");
			alert("error while loading entity");
		},
		startConfirmDialog: function (message, callback) {
			// summary:
			//		is called to signal pending changes to user.
			this.dialog.show({message: message, callback: callback});
		},
		_execute: function (promise, command) {
			when(promise, lang.hitch(this, "_on" + command), lang.hitch(this, "_on" + command + "Failed"));
		},
		createNew: function (schemaUrl, createCallback) {
			// summary:
			//		display empty editor
			// schemaUrl: String
			//		the schema is loaded from the url.
			// callback: function
			//		callback will be called once the entity is saved. id will be passed as single parameter.
			this.createCallback = createCallback;
			if (schemaUrl) {
				this.invokeIfOk(lang.hitch(this, "_createNewAndSchema", schemaUrl));
			} else {
				if (this.state == "create") {
					this.editor.reset();
				} else {
					this.invokeIfOk(lang.hitch(this, "_createNew"));
				}
			}
		},
		_createNew: function () {
			this.set("state", "create");
			this.editor.set("plainValue", this.createPlainValue(editor.meta));
		},
		_createNewAndSchema: function (schemaUrl) {
			var schemaPromise = this.getSchema(schemaUrl);
			var me = this;
			this._showLoading();
			this._execute(schemaPromise, "LoadForCreateAndSchema");
		},
		createPlainValue: function (schema) {
			if (this.plainValueFactory) {
				return this.plainValueFactory(schema);
			} else {
				return {};
			}
		},
		_onLoadForCreateAndSchema: function (schema) {
			this.set("state", "create");
			this.editor.setMetaAndPlainValue(schema, this.createPlainValue(schema));
			this.emit("editor-changed");
		},
		_onLoadForCreateAndSchemaFailed: function (error) {
			this.set("state", "create");
			alert("error while loading schema");
		},
		_removeChangeIndicator: function () {
			var entity = this.editor.get("plainValue");
			this.editor.set("plainValue", entity);
		},
		onCreated: function (id) {
			// summary:
			//		call when the entity is persisted. will notify the creator of the editor if interested.
			// id: String
			//		the id of the newly persisted entity.
			if (this.createCallback) {
				this.createCallback(id);
			}
			this.createCallback = null;
		}

	});


});
