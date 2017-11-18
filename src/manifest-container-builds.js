import dockerParseImage from 'docker-parse-image';

module.exports = function({
    getContainers,
    getBuilds,
}) {
    return function manifestContainerBuilds(projectId, manifest) {
        const containers = getContainers(manifest);
        const builds = getBuilds(manifest);
        const accum = [];
        if (!builds) {
            return accum;
        }
        return containers.reduce((accum, {name, image}) => {
            const build = getBuild(builds, name);
            const parsedImage = dockerParseImage(image);
            const {registry, namespace, tag} = parsedImage;
            if (!(build &&
                registry === 'gcr.io' &&
                namespace === projectId &&
                tag !== null &&
                tag !== 'latest')) {
                    return accum;
            }
            accum.push({
                image: parsedImage,
                build,
                ...(isCommitSha(tag) ? {commitSha: tag} : {tagName: tag}),
            });
            return accum;
        }, accum);
    };
}

function isCommitSha(str) {
    try {
        return Buffer.from(str, 'hex').length === 20;
    } catch(e) {
        return false;
    }
}

function getBuild(builds, name) {
    return builds.filter(({container}) => container === name)[0] || null;
}
