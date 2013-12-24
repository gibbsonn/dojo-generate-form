define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/Stateful",
	"../patch/StatefulArray",
	"./getPlainValue",
	"./enhanceArray",
	"../Context",
	"./MetaModel",
	"../schema/meta"
], function(array, lang, Stateful, StatefulArray, getPlainValue, enhanceArray, Context, MetaModel, metaHelper){
// module:
//		gform/updateModelHandle

  var updateModelHandle= {
	// summary:
	//		this object offers a function to update a modelHandle. 
	//		Also it offers functions to update individual attributes of a modelHandle.
	// description:	
	//		| var editorFactory = createStandardEditorFactory();
	//		| var modelHandle = updateModelHandle.createMeta();
	//		| updateModelHandle.update(schema, {}, modelHandle, editorFactory);

		collectAttributes: function(/*Object*/groupOrType, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		creates an array of all attributes in the given group. In case of a tab group this function will find all attributes in all tabs. The function must delegate to the responsible GroupFactory's implementation.
			// groupOrType: 
			//		the group or type.
			// editorFactory:
			//		used to find the responsible GroupFactory.
			// returns: Array
			//		returns an array of attributes 
			if (groupOrType.attributes){
				return groupOrType.attributes; 
			}else{
				var groupFactory = editorFactory.getGroupFactory(groupOrType);
				if (groupFactory==null) {	
					return [];
				}else{
					return groupFactory.collectAttributes(groupOrType);
				}
			}
		},
		update: function(/*Object*/groupOrType, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory, context) {
			// summary:
			//		update the group with the given plainValue
			// groupOrType:
			//		the schema of the group.
			// plainValue:
			//		the new value of the modelHandle
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			var attributes = this.collectAttributes(groupOrType,editorFactory);
			if (plainValue==null) {
				modelHandle.set("value",null);
			}else{
				if (modelHandle.value==null ) {
					modelHandle.set("value",new Stateful({}));
				}
				array.forEach(attributes,function(attribute) {
					var childHandle = modelHandle.value[attribute.code];
					if (!childHandle) {
						childHandle=this.createMeta(modelHandle);
						modelHandle.value[attribute.code]=childHandle;
					}else {
						this.resetMeta(childHandle);
					}
					this.cascadeAttribute(attribute,plainValue[attribute.code], childHandle,editorFactory, context);
				},this);
			}
		},
		updatePolyObject: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory, context) {
			// summary:
			//		update the attribute of type object with the given plainValue. The attribute has more than one valid type. There is a modelHandle for each type. These can be bound to different gform/Editor instances. Switching the type will switch visibility of the widget instances.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			if (plainValue!=null) {
				var typeCode=plainValue[meta.typeProperty];
			}
			var typeToValue=modelHandle.typeToValue;
			if (!typeToValue) {
				modelHandle.typeToValue={};
				array.forEach(meta.groups,function(type) {
					var metaObject= this.createMeta();
					metaObject.value=new Stateful({});
					metaObject.value[meta.typeProperty]=this.createMeta(modelHandle);
					metaObject.value[meta.typeProperty].value=type.code;
					modelHandle.typeToValue[type.code]=metaObject;
					if (type.code==typeCode)  {
						this.update(type,plainValue,metaObject,editorFactory);
					}else{
						this.update(type,{},metaObject,editorFactory);
					}
				},this);
				typeToValue=modelHandle.typeToValue;
			}else{
				array.forEach(meta.groups,function(type) {
					var metaObject = typeToValue[type.code];
					if (type.code==typeCode)  {
						this.update(type,plainValue,metaObject,editorFactory, context);
					}else{
						this.update(type,{},metaObject,editorFactory, context);
					}
				},this);
			}
			if (plainValue==null) {
				if (meta.required) {
					modelHandle.set("value",modelHandle.typeToValue[meta.groups[0].code].value);
				} else {
					modelHandle.set("value",null);
				}	
			}else{
				if (meta.groups.length>1 && !meta.typeProperty) {
					throw new Error("more than one type defined but no type property");
				}
				var type=metaHelper.getFromValidTypes(meta.groups,typeCode);
				if (type==null) {
					throw new Error("type "+typeCode+" is invalid");
				}
				var value = typeToValue[typeCode].value;
				modelHandle.set("value",value);
			}
			modelHandle.set("oldValue",getPlainValue(modelHandle.value));
		},
		updateString: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		update an attribute of type string.	null or undefined is initialized with empty string.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			if (!plainValue) {
				modelHandle.set("value","");
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateNullableString: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		update an attribute of type string.	undefined is initialized with null.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			if (!plainValue) {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateBoolean: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		update an attribute of type boolean.	null && undefined is initialized with false.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			if (plainValue==null) {
				if (typeof meta.default != "undefined") {
					modelHandle.set("value",meta.default);
				} else {
					modelHandle.set("value",false);
				}
			}else{
				modelHandle.set("value",!!plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateNumber: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		update an attribute of type number.	undefined is initialized with null.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			if (plainValue == null || typeof plainValue == "undefined") {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateAny: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory) {
			// summary:
			//		update an attribute of type any.	undefined is initialized with null.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			if (typeof plainValue=="undefined") {
				modelHandle.set("value",null);
			}else{
				modelHandle.set("value",plainValue);
			}
			modelHandle.set("oldValue",modelHandle.value);
		},
		updateMergedObject: function(/*Object*/meta, /*Object*/plainValue, /*dojo/stateful*/modelHandle, /*gform/EditorFactory*/editorFactory, context) {
			// summary:
			//		update the attribute of type object with the given plainValue. The attribute has more than one valid type. The modelHandle keeps all attributes in a single Stateful. This way the model can be bound to a single row of a table.
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			var combinedAttributes=modelHandle.tmp.combininedAttributes;
			if (!combinedAttributes) {
				combinedAttributes=this.mergeAttributeDefinitions(meta.validTypes);
				modelHandle.tmp.combinedAttributes=combinedAttributes;
			}
			if (!modelHandle.value) {
				modelHandle.set("value",new Stateful());
			}
			var typeCode=plainValue ? plainValue[meta.type_property] :null;
			if (!modelHandle.value[meta.type_property]) {
				modelHandle.value[meta.type_property]=this.createMeta(modelHandle);
			}else{
				this.resetMeta(modelHandle.value[meta.type_property]);
			}
			modelHandle.value[meta.type_property].set("value",typeCode);
			array.forEach(combinedAttributes, function(attribute) {
				if (!modelHandle.value[attribute.code]) {
					modelHandle.value[attribute.code]=this.createMeta(modelHandle);
				}
				var attributeModelHandle=modelHandle.value[attribute.code];
				this.cascadeAttribute(attribute,plainValue[attribute.code],attributeModelHandle,editorFactory, context);
				attributeModelHandle.ignore=true;
			}, this);
			if (typeCode!=null) {
				var type=metaHelper.getFromValidTypes(meta.validTypes,typeCode);
				array.forEach(type.attributes,function(attribute) {
					modelHandle.value[attribute.code].ignore=false;					
				},this);
			}
		
		},
		switchTypeInMergedObject: function(/*Object*/meta, /*String*/typeCode, /*dojo/Stateful*/modelHandle) {
			// summary:
			//		switch the type of a merged modelHandle. this will set the ignore meta value on the types attributes.
			// metypeCode:
			//		the of the type to switch to.
			// meta:
			//		the schema for the attribute.
			// modelHandle:
			//		the modelHandle bound to the Editor.
			modelHandle.value[meta.type_property].set("value",typeCode);
			var type=metaHelper.getFromValidTypes(meta.validTypes,typeCode);
			array.forEach(modelHandle.tmp.combinedAttributes,function(attribute) {
				modelHandle.value[attribute.code].ignore=true;					
			},this);
			array.forEach(type.attributes,function(attribute) {
				modelHandle.value[attribute.code].ignore=false;					
			},this);
		},
		mergeAttributeDefinitions: function(validTypes) {
		// summary:
		//		merge attributes from all valid types into an array. Consider attributes with the same code as equal and keep only one instance.
		// validTypes: Array
		//		the array of valid types.
		// returns: Array
		//		an array of attributes.
			var combinedAttributes = [];
			var addedAttributes={};
			array.forEach(validTypes, function(type) {
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
		updateArray: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory, cascadeAttribute/*function*/, context) {
			// summary:
			//		update the array attribute with the given plainValue. The corresponding value is a StatefulArray. The update operation will be delegated for the value of the elements. 
			// meta:
			//		the schema for the attribute.
			// plainValue:
			//		the new value of the attribute
			// modelHandle:
			//		the modelHandle bound to the Editor.
			// editorFactory:
			//		editorFactory provides access to AttributeFactory and GroupFactory which may override the update behavior.
			// cascadeAttribute:
			//		if not null the function will be called to update  the element modelHandle. 
			if (modelHandle.value==null) {
				modelHandle.set("value",new StatefulArray([]));
			}
			enhanceArray(modelHandle);
			modelHandle.value.splice(0,modelHandle.value.length);
			if (plainValue==null) {
				modelHandle.set("oldValue",[]);
			}else	if (typeof plainValue== "undefined"	) {
				modelHandle.set("oldValue",[]);
			}else{
				var modelArray=modelHandle.value;
				array.forEach(plainValue,function(element,i) {
					var model=modelArray[i];
					if (model==null) {
						model = this.createMeta(modelHandle);
					}else {
						this.resetMeta(model);
					}
					(cascadeAttribute || this.cascadeAttribute).apply(this,[meta.items,element,model,editorFactory, context]);
					modelArray.push(model);
				},this);
				modelHandle.set("oldValue",plainValue);
			}
		},
		updateSelectModelHandle : function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*Array*/options) {
		// summary:
		//		update attribute with options. Make sure that the value is to the first element if necessary.
		// meta:
		//		the attribute meta data
		// plainValue:
		//		the value
		// modelHandle:
		//		the modelHandle to update
		// options:
		//		the options
			if (!plainValue && meta.required) {
				this.updateNullableString(meta, options[0].value,
						modelHandle);
			}else{
				this.updateNullableString(meta, plainValue,
					modelHandle);
			}
		},

		cascadeAttribute: function(/*Object*/meta, /*Object*/plainValue, /*dojo/Stateful*/modelHandle, /*gform/EditorFactory*/editorFactory, /*gform/Context*/context) {
			// summary:
			//		delegate the update to the appropriate function
			// meta:
			//		the attribute meta data
			// plainValue:
			//		the value
			// modelHandle:
			//		the modelHandle to update
			// editorFactory:
			//		consult the editorFactory for the proper update function
			// context:
			//		pass the context to update
			if (editorFactory) {
				var handle=editorFactory.getAttributeFactory(meta);
				if (handle && handle.updateModelHandle) {
					return handle.updateModelHandle(meta,plainValue,modelHandle,context);
				}
			}
			if (meta.array ) {
				this.updateArray(meta,plainValue,modelHandle,editorFactory, context);
			}else if (meta.validTypes && meta.validTypes.length==1) {
				this.updateObject(meta,plainValue,modelHandle, context);
			}else if (meta.validTypes && meta.validTypes.length>1) {
				this.updatePolyObject(meta,plainValue,modelHandle, context);
			}else if (meta.type=="string") {
				this.updateNullableString(meta,plainValue,modelHandle);
			}else if (meta.type=="date") {
				this.updateNullableString(meta,plainValue,modelHandle);
			}else if (meta.type=="number") {
				this.updateNumber(meta,plainValue,modelHandle);
			}else if (meta.type=="ref") {
				this.updateNumber(meta,plainValue,modelHandle);
			}else if (meta.type=="time") {
				this.updateNumber(meta,plainValue,modelHandle);
			}else if (meta.type=="boolean") {
				this.updateBoolean(meta,plainValue,modelHandle);
			}else {
				this.updateAny(meta,plainValue,modelHandle);
			}
		}
	}
	

	return updateModelHandle;
});
