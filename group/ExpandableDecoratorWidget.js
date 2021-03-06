define([ "dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin", "dojo/text!./expandable-decorator.html"
], function (declare, _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

	return declare("app.ExpandableDecoratorWidget", [ _WidgetBase, _Container, _TemplatedMixin, _WidgetsInTemplateMixin ], {
		templateString: template
	});

});
