const cmdLogStream = id => `gcloud container builds log --stream ${id}`;

module.exports = function({
    process,
    exec,
}) {
    return function logBuild(id) {
        return new Promise((resolve, reject) => {
            const log = exec(cmdLogStream(id))
            log.stdout.pipe(process.stdout);
            log.stdout.on('end', resolve);
            log.stdout.on('error', reject);
        });
    };
}

module.exports.cmdLogStream = cmdLogStream;
