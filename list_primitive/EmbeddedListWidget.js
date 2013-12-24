define([ "dojo/_base/lang", "dojo/_base/declare", "dijit/_WidgetBase",
		"dijit/_Container", "dijit/_TemplatedMixin", "../schema/meta",
		"dijit/_WidgetsInTemplateMixin", 
		"dojo/text!./embedded_list_attribute.html", "dijit/form/TextBox", "dojo/i18n!../nls/messages"//
], function(lang, declare, _WidgetBase, _Container, _TemplatedMixin, meta,
		_WidgetsInTemplateMixin,    template, TextBox, messages) {

	return declare( [ _WidgetBase, _Container,
			_TemplatedMixin, _WidgetsInTemplateMixin ], {
		templateString : template,
		attribute:null,
		childAttribute:null,
		messages:messages,
		_addElement : function() {
				
			this.target.push(null);
		},
		postCreate : function() {
			this.addButton.set("onClick", lang.hitch(this, "_addElement"));
		}
	});

});
