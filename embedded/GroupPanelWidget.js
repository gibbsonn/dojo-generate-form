define([ "dojo/_base/array", //
"dojo/_base/lang",//
"dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container",
		"dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
		"dojo/text!./polymorphic_embedded_attribute.html",
		"dijit/layout/StackContainer", "dojo/Stateful",
		"gform/Editor","../getStateful","../copyProperties","../mergeProperties","../group/_GroupMixin"//
], function(array, lang, declare, _WidgetBase, _Container, _TemplatedMixin,
		_WidgetsInTemplateMixin, template, StackContainer, Stateful,
		Editor,getStateful,copyProperties,mergeProperties,_GroupMixin) {

	return declare("app.GroupPanelWidget", [ _WidgetBase, _Container,
			_TemplatedMixin, _WidgetsInTemplateMixin,_GroupMixin ], {
		templateString : template,
		typeStack:null,
		nullable:true,
		postCreate: function() {
			var attribute=this.get("meta");
			var validTypes = attribute.validTypes;

			var modelHandle = this.get("modelHandle");
			this.validTypeOptions = array.map(attribute.validTypes,
					function(validType) {
						return {
							value : validType.code,
							label : validType.label
						};
					});
			if(this.nullable) {
				this.validTypeOptions.push({
					label : "null",
					value : "null"
				});
			}
			var attributeData=modelHandle.value;

			var currentType = attributeData && attributeData[attribute.type_property] ? attributeData[attribute.type_property].value:"null";
			
			this.panelModel = new Stateful({
				title : "",
				validTypes : this.validTypeOptions,
				type : currentType
			});

			this.typeStack = new StackContainer({doLayout:false});
			this.typeToGroup = {};
			var me=this;
			var typeToModel={};
			this.modelHandle.typeToModel=typeToModel;
			var cloned = new Stateful({});
			typeToModel[currentType]=getStateful({});
			typeToModel[currentType].value=modelHandle.value;
			array.forEach(attribute.validTypes, function(type) {
				if (type.code!=currentType) {	
					typeToModel[type.code]=getStateful({});
					typeToModel[type.code].value[attribute.type_property]=getStateful(type.code);
					array.forEach(type.attributes,function(attribute) {
						typeToModel[type.code].value[attribute.code]=getStateful(null);
					});
				}
				var editor = new Editor(
					{
						"modelHandle": typeToModel[type.code],
						"meta":type,editorFactory:this.editorFactory
					});
				this.typeStack.addChild(editor);
				this.typeToGroup[type.code] = editor;
			}, this);
			
			this.panelModel.watch("type",lang.hitch(this,"switchType"));
			this.addChild(this.typeStack);
			this.set("target", this.panelModel);
		},
		getChildrenToValidate: function() {
			if (this.modelHandle.value==null) {
				return [];
			}else{
				return [this.typeStack.selectedChildWidget];
			}
		},
		switchType: function(propName,oldValue,newValue) {
				var type = newValue;
				var modelHandle=this.get("modelHandle");
				if (type == "null") {
					modelHandle.set("value", null);
					// rather clear all properites
					this.typeStack.domNode.style.display="none";
					this.validateAndFire();
				} else {
					this.typeStack.domNode.style.display="block";
					if (oldValue!=newValue) {	
						if (modelHandle.get("value")==null) {
							modelHandle.value=this.modelHandle.typeToModel[type].value;
						}else{
							var oldModelHandleValue=modelHandle.value;	
							modelHandle.value=this.modelHandle.typeToModel[type].value;
							var oldMeta = this.typeToGroup[oldValue].meta;
							array.forEach(oldMeta.attributes,function(attribute) {
								//only copy primitives
								if (!attribute.validTypes && typeof modelHandle.value[attribute.code]!= "undefined") {
									modelHandle.value[attribute.code].set("value",oldModelHandleValue[attribute.code].value);
								}
							},this);
						}
					}
					this.typeStack.selectChild(this.typeToGroup[type]);
					this.validateAndFire();
				}			
		},
		startup: function() {
			this.inherited(arguments);
			if (this.modelHandle.value==null) {
				this.get("target").set("type","null");
			}else{
				this.get("target").set("type", this.modelHandle.value[this.meta.type_property].value);
			}
		}

	});

});
