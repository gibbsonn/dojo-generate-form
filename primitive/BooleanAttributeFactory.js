define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/_base/declare",//
"dojo/aspect",//
"dojox/mvc/at",//
"dijit/form/CheckBox",//
"../schema/meta",//
"./dijitHelper",//
"../model/PrimitiveModel",
], function(array, lang, declare, aspect, at, CheckBox,  meta, dijitHelper, PrimitiveModel) {

	return declare( [], {
		handles : function(attribute) {
			return meta.isType(attribute,"boolean") && !attribute.array;
		},
		create : function(attribute, modelHandle) {
			if (!modelHandle) {
				throw new Error(" attribute "+attribute.code+" was not initialized");
			}			
			var box= new CheckBox({
				"checked" : at(modelHandle,"value")
			});
			// remove errors when value changes because this select does not validate.
			aspect.after(box, "onChange", function() {
				modelHandle.set("message", null);
				modelHandle.set("valid", true);
			});
			return box;

		},
		createModel: function(meta, plainValue) {
			var model = new PrimitiveModel();
			model.update(plainValue);
			return model;
		},
		getSchema:function(){
			var schema={};
			schema["id"]="boolean";
			var properties={};
			properties.type={type:"string",required:true,"enum":["boolean"]};
			schema.properties=properties;
			dijitHelper.addSchemaProperties(properties);
			return schema;
		}
	})
});
