define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/request",
	"dojo/promise/all",	
	"dojo/when",
	"./_ActionMixin",
	"dojo/i18n!../../nls/messages",	
	
], function(declare, lang, array, domClass, request, all, when, _ActionMixin, messages	){


	
	return declare( [_ActionMixin], {
		messageModule: "actions.delete",
		execute: function() {
			if (this.state!="create") {
				var entity = this.ctrl.editor.get("plainValue");
				this.ctrl._removeChangeIndicator();
				this.ctrl.showProgressBar("deleting "+this.ctrl.editor.getLabel());	
				this.ctrl.store.remove(entity.id)
					.then(lang.hitch(this,"_onRemoved"))
					.otherwise(lang.hitch(this,"_onRemoveFailed"));
			}
		},
		_onRemoved: function() {
			this.ctrl.editor.setPlainValue({});
			this.ctrl.set("state","create");
		},
		_onRemoveFailed: function() {
			this.ctrl.set("state","edit");
			this.ctrl.alert(messages["actions.delete.serverError"]);
		},
	});
});
