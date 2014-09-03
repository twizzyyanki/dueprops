var hbs = require('express-hbs');

exports.init = function(app) {
	hbs.registerHelper('isoMoment', function(t) { t.toISOString() });

	var hbsEngine = hbs.express3({ partialsDir: app.dir + '/app/partials' });
	app.engine('hbs', hbsEngine);
}
