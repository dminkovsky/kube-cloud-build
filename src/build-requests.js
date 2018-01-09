export default function buildRequests({projectId, repoName, containerBuilds}) {
    const requests = [];
    containerBuilds.forEach(({tagName, commitSha, image, build}) => {
        let request = findRequest(requests, {tagName, commitSha});
        if (!request) {
            request = newBuildRequest({projectId, repoName, tagName, commitSha});
            requests.push(request);
        }
        build.steps.forEach(step => request.steps.push(step));
        request.images.push(formatImage(image));
    });
    return requests;
}

function findRequest(requests, {tagName, commitSha}) {
    return requests.filter(({source: {repoSource}}) => {
        return repoSource.tagName && repoSource.tagName === tagName ||
            repoSource.commitSha && repoSource.commitSha === commitSha;
    })[0] || null;
}

function newBuildRequest({projectId, repoName, tagName, commitSha}) {
    return {
        source: {
            repoSource: {
                projectId,
                repoName,
                tagName,
                commitSha,
            }
        },
        steps: [],
        images: [],
    };
}

function formatImage({registry, namespace, repository, tag}) {
    return `${registry}/${namespace}/${repository}:${tag}`;
}
