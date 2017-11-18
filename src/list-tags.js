import authorization from './authorization';

module.exports = function({
    request,
}) {
    return function listTags(repository, projectId, token) {
        return request({
            url: listTagsUrl(projectId, repository),
            headers: {
                ...authorization(token),
            },
        })
        .then(JSON.parse)
        .then(({tags}) => tags);
    }
}

function listTagsUrl(projectId, repository) {
    return `https://gcr.io/v2/${projectId}/${repository}/tags/list`;
}

module.exports.listTagsUrl = listTagsUrl;
