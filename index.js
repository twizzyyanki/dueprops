global._ = require('lodash');
global.t = require('moment');

function run(appdir) {

	var express = require('express');
	var app = express();

	var livereload = require('connect-livereload');
	app.use(livereload({ port: 35729 }));

	app.dir = appdir;
	app.use(express.static(app.dir + '/app'));
	app.use(express.static(app.dir + '/public'));

  // Where are templates located?
	app.set('views', app.dir + '/app');

	// Setup template helper functions and rendering systems (handlebars, jade, etc)
	require('./templates').init(app);

	// Temporary Homepage
	app.get('/', function(req,res) { res.status(200).render('index.hbs') });

	// Standard error handling
	app.use(function(err, req, res, next){
	  console.error(err.stack);
	  res.status(500).send('Something broke!');
	});

  // Fire up server
	var server = app.listen(process.env.PORT || 5555, function() {
	  console.log('Listening on port %d', server.address().port);
	});

}

run(__dirname);
