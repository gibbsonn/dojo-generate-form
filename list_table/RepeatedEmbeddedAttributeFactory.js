define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/aspect",//
"../Editor",//
"dojo/_base/declare",//
"dojox/mvc/at",//
"../model/ArrayModel",//
"dojo/Stateful",//
"../widget/MvcDndSource",//
"./EmbeddedListWidget",//
"dojox/mvc/sync",//
"./TableWidgetList",//
"./RepeatedEmbeddedWidget",//
"../model/MergedMultiObject",//
"./TableHeader",//
"./TableElementHeader",//
"./mergeAttributeDefinitions",//
"dojo/text!../schema/embeddedAttributeProperties.json",
"dojo/text!./embeddedExample.json",
"dojo/text!./embeddedInstanceExample.json"
], function(array, lang, aspect, Editor, declare, at, 
		ArrayModel, Stateful, DndSource, EmbeddedListWidget, sync, WidgetList,RepeatedEmbeddedWidget, MergedMultiObject,TableHeader,TableElementHeader,mergeAttributeDefinitions, embeddedAttributeProperties, embeddedExample, embeddedInstanceExample) {

	return declare( [], {

		constructor : function(kwArgs) {
			lang.mixin(this, kwArgs);
		},
		handles : function(attribute) {
			return attribute != null && attribute.type=="table-multi-array";
		},
		
		create : function(attribute, modelHandle) {

			if (modelHandle.value==null) {
				throw new Error("modelHandle.value should be initialized here");
			}
			
			var select = new EmbeddedListWidget({
				target : modelHandle,
				attribute:attribute,
				editorFactory: this.editorFactory
			});

				
			var tableHeader =new TableHeader();
			if (attribute.groups.length>1) {
				tableHeader.addChild(new TableElementHeader({label:attribute.typeProperty}));
				
			}

			var attributes = this.mergeAttributeDefinitions(attribute.groups);


			array.forEach(attributes,function(attribute) {
				tableHeader.addChild(new TableElementHeader({label: attribute.label || attribute.code, description: attribute.description}));
			},this);
			select.addChild(tableHeader);
			
			var widgetList = new WidgetList();
			widgetList.set("partialRebuild", true);
			widgetList.set("children", modelHandle.value);
			widgetList.set("childClz", RepeatedEmbeddedWidget);
			widgetList.set("childParams", {
				meta : attribute,
				combinedAttributes: attributes,
				_relTargetProp : "modelHandle",
				editorFactory: this.editorFactory
			});
			select.addChild(widgetList);

			var me = this;
			if (attribute.reorderable!==false) {
				var copy = function(original) {
					var value =original.getPlainValue();
					return this.modelHandle.push(value);
				}
				aspect.after(widgetList, "startup", function() {
					new DndSource(widgetList.domNode, {copyFn: copy, copyOnly:false, singular:true, withHandles: true});
				});
			}


			return select;

		},
		_createFactory: function() {
			var me = this;
			var factory = function(childMeta) {
				return me.editorFactory.createAttributeModel(childMeta,null);
			};
			return factory;
		},
		createModel: function(meta, value) {
			var me =this;
			var model = new ArrayModel();
			model.elementFactory = function(element) {
				var elModel =  MergedMultiObject.create(meta, me._createFactory());
				elModel.update(element);
				return elModel;
			}
			model.update(value);
			return model;
			
		},
		mergeAttributeDefinitions: function(groups) {
		// summary:
		//		merge attributes from all valid types into an array. Consider attributes with the same code as equal and keep only one instance.
		// validTypes: Array
		//		the array of valid types.
		// returns: Array
		//		an array of attributes.
			var combinedAttributes = [];
			var addedAttributes={};
			array.forEach(groups, function(type) {
				array.forEach(type.attributes, function(attribute) {
					if (!addedAttributes[attribute.code]) {
						attribute.types=[type.code];
						combinedAttributes.push(attribute);
						addedAttributes[attribute.code]=attribute;
					}else{
						addedAttributes[attribute.code].types.push(type.code);
					}
				}, this);
			}, this);
			return combinedAttributes;
		},
		getSchema : function() {
			var schema = dojo.fromJson(embeddedAttributeProperties);
			schema.description="This attribute represents an array of objects. They are displayed in a table. validTypes describes the possible types/groups of objects. The table columns represent the union of all properties. Common properties appear only once. Proerty cells will be invisible if not applicable to the rows object";
			schema.example=embeddedExample;
			schema.instanceExample=embeddedInstanceExample;
			schema.properties.editor={type:"string","enum":["table"],required:true};
			return schema;
		}
	})
});
