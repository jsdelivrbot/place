const express = require('express');
const passport = require('passport');
const APIRouter = require('../routes/api');
const PublicRouter = require('../routes/public');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const ejs = require("ejs");
const session = require('cookie-session');

function HTTPServer(app) {
    var server = express();

    // Setup for parameters and bodies
    server.use(bodyParser.urlencoded({extended: false}));
    server.use(bodyParser.json());

    // Set rendering engine
    server.set('view engine', 'html');
    server.engine('html', ejs.renderFile);

    // Use public folder for resources
    server.use(express.static('public'));

    // Log to console
    server.use(morgan('dev'));

    server.set('trust proxy', 1)

    // Setup passport for auth
    server.use(session({
        secret: app.config.secret,
        name: "session"
    }));
    server.use(passport.initialize())
    server.use(passport.session())

    // Handle routes
    server.use('/api', APIRouter(app));
    server.use('/', PublicRouter(app));

    // 404 pages
    server.use(function(req, res, next){
        res.status(404);

        // respond with json
        if (req.accepts('json') && !req.accepts("html")) return res.send({ error: 'Not found' });

        // send HTML
        app.responseFactory.sendRenderedResponse("errors/404", req, res);
    });

    return {
        server: server,

        start: function() {
            this.server.listen(app.config.port, () => console.info(`Place HTTP server listening on port ${app.config.port}`))
        }
    }
}

HTTPServer.prototype = Object.create(HTTPServer.prototype);

module.exports = HTTPServer;