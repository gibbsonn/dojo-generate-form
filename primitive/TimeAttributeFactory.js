define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/_base/declare",//
"dojox/mvc/at",//
"dojo/date/stamp",//
"./TimeTextBox",//
"../schema/meta",//
"./standardAttributeProperties",
"./PrimitiveAttributeFactory"
], function(array, lang, declare, at, dateStamp, TimeTextBox, meta, standardAttributeProperties,PrimitiveAttributeFactory) {

	return declare( [PrimitiveAttributeFactory], {
		
		handles : function(attribute) {
			return meta.isType(attribute, "time") && !attribute.array;
		},
		
		create : function(attribute, modelHandle) {
			var box = this.createTimeTextBox(modelHandle);
			
			if (attribute.required) {
				box.set("required", attribute.required);
			}
			if (attribute.constraints) {
				box.set("constraints", attribute.constraints);
			}
			return box;
		},
		
		createTimeTextBox : function(modelHandle) {

			var valueConverter = this.createValueConverter();
			var valueAt = at(modelHandle, "value").transform(valueConverter);
			
			return new TimeTextBox({
				"value" : valueAt,
				"state" : at(modelHandle, "state"),
				"message" : at(modelHandle, "message")
			});
		},
		
		createValueConverter : function() {
			return {
				parse : function(date) {
					isoDateString = date;
					if (typeof date != "string") {
						isoDateString = dateStamp.toISOString(date, {
							selector : "time"
						});
					}
					return isoDateString;
				}
			};
		},
		getSchema:function(){
			var schema={};
			schema["id"]="time";
			schema.description="This attribute is a time value formatted according to ISO-8601. The dijit is based on 'dijit.form.TimeTextBox'";
			schema.example=dojo.toJson({code:"wakeupTime",type:"time"},true);
			schema.instanceExample=dojo.toJson({wakeupTime:"8:30"},true);
			schema.properties={};
			schema.properties.type={type:"string",required:true,"enum":["time"]};
			lang.mixin(schema.properties,standardAttributeProperties);
			schema.properties["required"]={ type : "boolean"};
			schema.properties["missingMessage"]={ type : "string"};
			schema.properties["promptMessage"]={ type : "string"};
			schema.properties["placeHolder"]={ type : "string"};
			schema.properties["invalidMessage"]={ type : "string"};
			return schema;
		}	

	});
});
