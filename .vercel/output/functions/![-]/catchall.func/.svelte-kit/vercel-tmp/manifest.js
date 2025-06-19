export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","about.png","ai.png","carousel-1-en.png","carousel-1.png","carousel-2-en.png","carousel-2.png","chart.png","dord3.png","dordrecht-icon.png","dordrecht-icon2.png","dordrecht-icon3.png","download.png","favicon.png","global.css","info.png","uitleg-grafieken.png"]),
	mimeTypes: {".png":"image/png",".css":"text/css"},
	_: {
		client: {start:"_app/immutable/entry/start.DYE54q4r.js",app:"_app/immutable/entry/app.CT9KpMpd.js",imports:["_app/immutable/entry/start.DYE54q4r.js","_app/immutable/chunks/CqpvUkLu.js","_app/immutable/chunks/BtgGQ92H.js","_app/immutable/chunks/B5Lywc65.js","_app/immutable/entry/app.CT9KpMpd.js","_app/immutable/chunks/BtgGQ92H.js","_app/immutable/chunks/YORhUFDs.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
