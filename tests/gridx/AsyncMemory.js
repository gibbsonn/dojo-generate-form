define(["dojo/_base/declare", "dojo/Deferred", "dojo/store/Memory" ],
function(declare, Deferred, Memory){

	var currentId=1000;

	var finishDeferred = function( error, callback, errorValue) {
		var returnError = errorValue || "error";
		var deferred = new Deferred();
		if (error) {
			window.setTimeout(function(){
				deferred.reject(returnError)
			},600);
		} else {
			window.setTimeout(function(){
				var returnValue = callback();
				deferred.resolve(returnValue)
			},600);
		}
		return deferred;	
	}	

return declare([], {
	constructor: function(memory) {
		this.wrapped=memory;
	},
	get: function(id){
		var me = this;
		var entity = this.wrapped.get(id);
		return finishDeferred(entity.error,function(){
			return entity;
		});
	},
	put: function(object, options){
		var me = this;
		return finishDeferred(object.error,function(){
			return me.wrapped.put(object,options);
		},{message:"validation error",fields:[
				{path:"name",message:"This name is not unique"},
				{path:"error",message:"As long as error is checked the entity is not persistable."}
				]});
	},
	add: function(object, options){
		var me = this;
		object.id=currentId++;
		return finishDeferred(object.error,function(){
			return me.wrapped.add(object,options);
		});
	},
	remove: function(id){
		var me = this;
		var entity = this.wrapped.get(id);
		return finishDeferred(entity.error,function(){
			return me.wrapped.get(id);
		});
	},
	query: function(query, options){
		return this.wrapped.query(query, options);
	},
	getIdentity: function(object){
		return this.wrapped.getIdentity(object);
	}
});

});