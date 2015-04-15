var consolidate = require('consolidate');

global._ = require('lodash');
global.t = require('moment');

function run() {
	var express = require('express');
	var app = express();
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var path = require('path');

	// var livereload = require('connect-livereload');
	// app.use(livereload({ port: 35729 }));

	// SPECIAL REQUEST HANDLING
	app.use(cookieParser());
	// to support JSON-encoded bodies
  app.use(bodyParser.json());
  // to support URL-encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true
  }));

	app.dir = appdir;

	// WHERE ARE THE STATIC FILES?
	// app.use(express.static(app.dir + '/app'));
	app.use(express.static(path.join(__dirname, 'public')));

  // Where are templates located? (this might not be needed anymore - Obie)
	// app.set('views', app.dir + '/app');
	// app.engine('jade', consolidate.jade);

	app.get('/*',function(req, res){
	  res.sendFile("index.html",{root:'./public'});
	});

  // STANDARD ERROR HANDLING
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // FIRE UP SERVER
	var server = app.listen(process.env.PORT || 5555, function() {
	  console.log('Listening on port %d', server.address().port);
	});

}

run(__dirname);
