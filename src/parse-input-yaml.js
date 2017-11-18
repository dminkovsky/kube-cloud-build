module.exports = function({
    process,
    fs,
    rawBody,
    jsYaml,
}) {
    return function parseInputYaml(file) {
        const stream = file ? fs.createReadStream(file) : process.stdin;
        return rawBody(stream, {encoding: 'utf-8'})
            .then(jsYaml.safeLoadAll);
    };
}
