const CMD_CONFIG = 'gcloud config config-helper --format=json';

module.exports = function({
    exec,
}) {
    return function getConfig() {
        return new Promise((resolve, reject) => {
            exec(CMD_CONFIG, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        })
        .then(JSON.parse)
        .then(({credential: {access_token: token}, configuration: {properties: {core: {project: projectId}}}}) => ({projectId, token}));
    };
}

module.exports.CMD_CONFIG = CMD_CONFIG;
