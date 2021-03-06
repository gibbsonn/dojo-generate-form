define([
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/_base/declare",
	"./EmbeddedListWidget",
	"../widget/MvcDndSource",
	"../layout/LayoutWidgetList",
	"./RepeatedEmbeddedWidget",
	"../model/ArrayModel"
], function (lang, aspect, declare, EmbeddedListWidget, DndSource, WidgetList, RepeatedEmbeddedWidget, ArrayModel) {

	return declare([], {
		id: "array",
		constructor: function (kwArgs) {
			lang.mixin(this, kwArgs);
		},
		handles: function (attribute) {
			return attribute != null && attribute.type === "array" && attribute.group;
		},
		create: function (attribute, modelHandle) {

			var select = new EmbeddedListWidget({
				target: modelHandle,
				group: attribute.group,
				//typeProperty: attribute.typeProperty,
				editorFactory: this.editorFactory
			});

			var childMeta = attribute.group;

			var widgetList = new WidgetList();
			widgetList.set("partialRebuild", true);
			widgetList.set("children", modelHandle.value);
			widgetList.set("childClz", RepeatedEmbeddedWidget);
			widgetList.set("childParams", {
				group: childMeta,
				_relTargetProp: "modelHandle",
				editorFactory: this.editorFactory
			});
			select.addChild(widgetList);


			if (attribute.reorderable !== false) {
				var copy = function (original) {
					var plainValue = original.getPlainValue();
					return modelHandle.elementFactory(plainValue);
				};
				//var copyFn=lang.hitch(this,copy);
				aspect.after(widgetList, "startup", function () {
					new DndSource(widgetList.domNode, {copyFn: copy, copyOnly: false, singular: true, withHandles: true});
				});
			}


			return select;

		},
		createModel: function (meta, plainValue) {
			var validators = this.editorFactory.getModelValidators(meta);
			var model = new ArrayModel({validators: validators});
			var me = this;
			var ef = function (value) {
				var model = me.editorFactory.createGroupModel(meta.group);
				if (value) {
					model.update(value);
				}
				return model;
			};
			model.elementFactory = ef;
			model.update(plainValue);
			return model;
		}
	});
});
