define([ "dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
		 "dojo/text!./description.html"
], function(declare, lang,_WidgetBase, _TemplatedMixin,
		template) {

	return declare("gform.DescriptionWidget",[ _WidgetBase, _TemplatedMixin ], {
		descriptionText:"",
		constructor:function(config) {
			this.inherited(arguments);
			this.descriptionText = (typeof config.description!="undefined" || config.description) ? config.description : "";
		},
		templateString : template,
	
	});

});
