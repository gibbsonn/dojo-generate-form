define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/_base/declare",//
"dojo/aspect",//
"dojo/Stateful",//
"dojox/mvc/at",//
"./ValidationTextBox",//
"../schema/meta",//
"./mixinTextboxBindings",
"./dijitHelper",
"../model/PrimitiveModel"
], function(array, lang, declare, aspect, Stateful, at, TextBox,  meta, mixinTextboxBindings, dijitHelper, PrimitiveModel) {

	return declare([Stateful], {
		handles : function(attribute) {
			return meta.isType(attribute, "string") && !attribute.array;
		},
		create : function(attribute, modelHandle) {

			var props={
			}
			mixinTextboxBindings(modelHandle,props);
			dijitHelper.copyProperty("pattern",attribute,props)
			dijitHelper.copyDijitProperties(attribute,props);
			return new TextBox(props);

		},
		createModel: function(schema, plainValue) {
			var model = new PrimitiveModel();
			if (typeof plainValue != "undefined") {
				model.update(plainValue);
			}
			return model
		},	
		getSchema:function(){
			var schema={};
			schema["id"]="string";
			schema["description"]="This is a textfield based on 'dijit.form.ValidationTextBox'";
			schema["example"]=dojo.toJson({code:'name',type:'string'},true);
			var properties={};
			properties.type={type:"string",required:true,"enum":["string"]};
			dijitHelper.addSchemaProperties(properties);
			dijitHelper.addSchemaProperty("required",properties);
			dijitHelper.addSchemaProperty("maxLength",properties);
			dijitHelper.addSchemaProperty("missingMessage",properties);
			dijitHelper.addSchemaProperty("promptMessage",properties);
			dijitHelper.addSchemaProperty("placeHolder",properties);
			dijitHelper.addSchemaProperty("invalidMessage",properties);
			dijitHelper.addSchemaProperty("pattern",properties);
			dijitHelper.addSchemaProperty("properCase",properties);
			dijitHelper.addSchemaProperty("upperCase",properties);

			schema.properties=properties;
			return schema;
		}


	})
});
