define(["dojo/_base/lang",
	"./createVisitor",
	"doh/runner", "gform/model/SingleObject", "gform/model/PrimitiveModel", "gform/model/SingleObject", "gform/model/MapModel"], function (lang, createVisitor, doh, SingleObject, PrimitiveModel, SingleObject, MapModel) {


	var assertEqual = function (expected, actual) {
		doh.assertEqual(JSON.stringify(expected), JSON.stringify(actual));
	};

	var elementFactory = function (value) {
		var element = new PrimitiveModel();
		var key = new PrimitiveModel();
		var attributes = {"x": element, "keyx": key};
		var model = new SingleObject({attributes: attributes, subgroup: false});
		model.update(value);
		return model;
	};
	var am = new MapModel({keyProperty: "keyx", elementFactory: elementFactory});

	doh.register("MapModel", [
		function testParent() {
			am.update({"x": {"x": 4}});
			doh.assertEqual(am, am.value[0].parent);
		},
		function testValue() {
			am.update({"x": {"x": 4}});
			var plainValue = am.getPlainValue();
			assertEqual({"x": {"x": 4}}, plainValue);
		},
		function testNull() {
			am.update(null);
			var plainValue = am.getPlainValue();
			assertEqual({}, plainValue);
		},
		function testDefaults() {
			am.update({});
			am.put("z", {"x": 9});
			var plainValue = am.getPlainValue();
			assertEqual({"z": {"x": 9}}, plainValue);
		},
		function testState() {
			assertEqual(0, am.errorCount);
			am.getModelByKey("z").set("state", "Error");
			assertEqual(1, am.errorCount);
		},
		function testChanged() {
			am.getModelByKey("z").update({"x": 8});
			assertEqual(1, am.changedCount);
		},
		function testVisit() {
			am.update({"j": {x: "jjj"}});
			var visitor = createVisitor();
			am.visit(lang.hitch(visitor, "fn"));
			assertEqual(["noidx", "j", "x", "keyx"], visitor.events);
		},
		function testUniqueProperties() {
			am.resetMetaRecursively();
			assertEqual(0, am.errorCount);
			am.update({"j": {x: "jjj"}});
			am.push({"keyx": "j", x: "ll"});
			assertEqual("Error", am.getModelByIndex(1).getModelByPath("keyx").state);
		},
		function testUniqueProperties2() {
			am.resetMetaRecursively();
			assertEqual(0, am.errorCount);
			am.update({"j": {x: "jjj"}});
			am.push({"keyx": "j", x: "ll"});
			assertEqual("Error", am.getModelByIndex(1).getModelByPath("keyx").state);
			am.getModelByIndex(1).getModelByPath("x").set("value", "444");
			assertEqual("Error", am.getModelByIndex(1).getModelByPath("keyx").state);
		}
	]);


});

