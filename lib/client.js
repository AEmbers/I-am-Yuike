window.__ModuleLoader__.load({
	id: "i-am-yuike",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		// 浏览器半区。本插件只负责在 node 半区铺设人格预设，不需要任何浏览器
		// 设置面板，因此这里仅作合法空模块占位。
		exports.name = 'i-am-yuike'
		exports.inject = []
		exports.apply = function () {}

		return module.exports;
	}
});