var buffer = '';

process.stdin
    .setEncoding('utf8')
    .on('data', function(chunk) {
        buffer += chunk;
    })
    .on('end', function() {
        process.stdout.write(
            '(function __selfScript(){' +
            // insert global definition because it may to be defined in outer bundle (upper scopes)
            // and after minifier quine break because of variable renaming
            'var global = new Function(\'return"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{}\')();' +
            // main part
            (buffer
                // remove amd since it leads to errors when using with webpack
                .replace(
                    /else if\(typeof define==="function"&&define\.amd\){define\(\[\],f\)}/,
                    ''
                )
                // replace getting a global in socket.io modules for explicit `global` reference,
                // since this solution doesn't work in strict mode
                .replace(
                    /function\(\){return this}\(\)/g,
                    'global'
                )
                // replace file read with its content
                .replace(
                    /typeof asset(.|\s)+?require\('fs'\)\.readFileSync\(__dirname \+ '\/style\.js', 'utf8'\)/,
                    JSON.stringify(require('fs').readFileSync(__dirname + '/../src/host/in-page/style.css', 'utf8'))
                )
                // replace file read with its content
                .replace(
                    /module.exports = require\('fs'\).+?(?=;)/,
                    'module.exports = "(" + __selfScript + ").call(this);"'
                )
            ) +
            '}).call(this);'
        );
    });
