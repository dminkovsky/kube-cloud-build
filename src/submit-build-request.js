import authorization from './authorization';

module.exports = function({
    request,
}) {
    return function submitBuildRequest({buildRequest, projectId, token}) {
        return request({
            url: submitBuildRequestUrl(projectId),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authorization(token),
            },
            body: JSON.stringify(buildRequest),
        })
        .then(JSON.parse)
        .then(({metadata: {build: {id}}}) => id);
    }
}

function submitBuildRequestUrl(projectId) {
    return `https://cloudbuild.googleapis.com/v1/projects/${projectId}/builds`;
}

module.exports.submitBuildRequestUrl = submitBuildRequestUrl;
