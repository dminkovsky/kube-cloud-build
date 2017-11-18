import Promise from 'bluebird';

module.exports = function({
    listTags,
}) {
    return function filterMissingImages(containerBuilds, projectId, token) {
        return Promise.filter(
            containerBuilds,
            ({image: {repository, tag}}) => listTags(repository, projectId, token).then(tags => tags.indexOf(tag) < 0),
            {concurrency: 3}
        );
    };
}
