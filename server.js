const http = require('http');
const url = require('url');
const fs = require('fs');

const [,, ...args] = process.argv;

const config = JSON.parse(fs.readFileSync('config.json'));

const index = fs.readFileSync(config.index);
const ep = fs.readFileSync(config.errorpage);

var el = false;

if(args == '-el') {
    el = true;
}

var date = new Date();

var month = date.getMonth();
var day = date.getDate();
var year = date.getFullYear();

var hour = date.getHours();
var minute = date.getMinutes();
var seconds = ((date.getSeconds() < 10) ? `0${date.getSeconds()}` : date.getSeconds());

var time = `${month + 1}/${day}/${year} ${hour}:${minute}:${seconds}`;

console.log(`[Yakusoku] > ${time} > Started web server.`);

if(el) console.log(`[Yakusoku] > ${time} > Extra logging is enabled.`);

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    var q = url.parse(req.url, true).query;

    if(req.url == '/') {
        res.end(fs.readFileSync(config.index));

        if(el) console.log(`[LOG] > ${time} > ${req.connection.remoteAddress} -> Requested "/"`);
    } else if(fs.existsSync(`web/${req.url.replace('/', '')}`) && fs.lstatSync(`web/${req.url.replace('/', '')}`).isDirectory()) {
        if(fs.existsSync(`web/${req.url.replace('/', '')}/index.html`)) {
            res.end(fs.readFileSync(`web/${req.url.replace('/', '')}/index.html`));

            if(el) console.log(`[LOG] > ${time} > ${req.connection.remoteAddress} -> Requested "${req.url.replace('/', '')}"`);
        } else {
            res.end(fs.readFileSync(config.errorpage));
            if(el) console.log(`[LOG] > ${time} > ${req.connection.remoteAddress} -> Requested "${req.url.replace('/', '')}" -> Returned Error`);
        }
    } else if(fs.existsSync(`web/${req.url.replace('/', '')}`)) {
        res.end(fs.readFileSync(`web/${req.url.replace('/', '')}`));

        if(el) console.log(`[LOG] > ${time} > ${req.connection.remoteAddress} -> Requested "${req.url.replace('/', '')}"`);
    } else if(req.url == '/favicon.ico') {
        res.end(fs.readFileSync('favicon.ico'))

        if(el) console.log(`[LOG] > ${time} > ${req.connection.remoteAddress} -> Requested favicon`);
    } else if(!fs.existsSync(`web/${req.url.replace('/', '')}`)) {
        res.end(fs.readFileSync(config.errorpage));

        if(el) console.log(`[LOG] > ${time} > ${req.connection.remoteAddress} -> Requested "${req.url.replace('/', '')}" -> Returned Error`);
    }
}).listen(config.port);