define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/request",
	"dojo/promise/all",	
	"dojo/when",
	"dojo/Stateful",	
	"gform/Editor",	
	"gform/createLayoutEditorFactory",	
  "dijit/_WidgetBase", 
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./crudController.html",
	"../schema/labelHelper",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"./actions/Save",
	"./actions/Discard",
	"./actions/Delete",
	"dojo/i18n!../nls/messages",
	"dijit/form/Button",
	"dijit/layout/StackContainer",
	"dijit/layout/ContentPane",
	"dijit/ProgressBar",
	"dijit/Dialog",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
], function(declare, lang, array, domClass, request, all, when, Stateful, Editor, createEditorFactory, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, labelHelper, domStyle, domGeometry, Save, Discard, Delete, messages, Button	){


	
return declare( [Stateful], {
		state:"loading",
		_checkState: function(callback) {
			var openDialog=false;
			if (this.state=="create" && this.editor.hasChanged()) {
				openDialog=true;
				this._startConfirmDialog(messages["actions.unsavedNewEntity"],callback);
			} else if (this.state=="edit" && this.editor.hasChanged()) {
				this._startConfirmDialog(messages["actions.unsavedChanges"],callback);
				openDialog=true;
			}else if (callback) {
				callback(true);
			}
			return openDialog;
		},
		alert: function(message) {
			alert(message);
		},
		edit: function(id, schemaUrl) {
			this._checkState(lang.hitch(this,"_edit", id, schemaUrl));
		},
		_showLoading: function() {
			this.set("state","loading");	
		},
		_edit: function(id, schemaUrl) {
			var instancePromise = this.store.get(id);
			if (schemaUrl) {
				// remove form 
				this.editor.set("meta", {});
				var schemaPromise = request.get(schemaUrl, {handleAs: "json"});
				var promise = all([instancePromise, schemaPromise]);
				var me = this;
				this._showLoading();
				this._execute(promise,"LoadForEditAndSchema");
			}else {
				var promise = instancePromise;
				this._showLoading();
				this._execute(promise,"LoadForEdit");
			}
		},
		_onLoadForEdit: function(entity) {
			this.set("state","edit");
			this.editor.set("plainValue", entity);
		},
		_onLoadForEditFailed: function(error) {
			this.set("state","edit");
			alert("error while loading entity");
		},
		_onLoadForEditAndSchema: function(results) {
			this.set("state","edit");
			this.editor.setMetaAndPlainValue(results[1], results[0]);
			this.emit("editor-changed");
		},
		_onLoadForEditAndSchemaFailed: function(error) {
			this.set("state","edit");
			alert("error while loading entity");
		},
		showProgressBar: function(message) {
			this.ctrl.showProgressBar();
		},
		hideProgressBar: function() {
			this.ctrl.hideProgressBar();
		},
		_execute: function(promise, command) {
			when(promise,lang.hitch(this,"_on"+command),lang.hitch(this,"_on"+command+"Failed"));
		},
		createNew: function(schemaUrl) {
			if (schemaUrl) {
				this._checkState(lang.hitch(this,"_createNewAndSchema", schemaUrl));
			} else {			
				if (this.state=="create") {
					this.editor.reset();
				}	else {
					this._checkState(lang.hitch(this,"_createNew"));
				}
			}
		},
		_createNew: function() {
			this.set("state","create");
			this.editor.set("plainValue", {});
		},
		_createNewAndSchema: function(schemaUrl) {
			var schemaPromise = request.get(schemaUrl, {handleAs: "json"});
			var me = this;
			this._showLoading();
			this._execute(schemaPromise,"LoadForCreateAndSchema");
		},
		_onLoadForCreateAndSchema: function(schema) {
			this.set("state","create");
			this.editor.setMetaAndPlainValue(schema, {});
			this.emit("editor-changed");
		},
		_onLoadForCreateAndSchemaFailed: function(error) {
			this.set("state","create");
			alert("error while loading schema");
		},
		_removeChangeIndicator: function() {
			var entity = this.editor.get("plainValue");
			this.editor.set("plainValue",entity);
		},
		_startConfirmDialog: function(message,callback) {
			this.ctrl.dialog.show({message: message, callback: callback});
		},

	});


});
