const qs = require('querystring');

module.exports = {
    twitter: (opts) => `http://twitter.com/intent/tweet?${qs.stringify(opts)}`,
    facebook: (opts) => `https://www.facebook.com/sharer/sharer.php?${qs.stringify(opts)}`,
    line: (opts) => `http://line.me/R/msg/text/?${encodeURIComponent(opts.text + ' ' + opts.url)}`
};