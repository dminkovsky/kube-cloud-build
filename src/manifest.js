const BUILD_INSTRUCTIONS_ANNOTATION = 'google.cloud.container.build';

const SUPPORTED_RESOURCES = [
    'Pod',
    'CronJob',
    'Deployment',
    'DaemonSet',
    'Job',
    'ReplicaSet',
    'ReplicationController',
    'StatefulSet',
];

function visitManifest(manifest, visitor) {
    const {kind} = manifest;
    switch (kind) {
        case 'Pod':
            return visitor.pod(manifest);
        case 'CronJob':
            return visitor.cronJob(manifest);
        case 'Deployment':
        case 'DaemonSet':
        case 'Job':
        case 'ReplicaSet':
        case 'ReplicationController':
        case 'StatefulSet':
            return visitor.composite(manifest);
    }
}

function getPodSpec(manifest) {
    return visitManifest(manifest, {
        pod: () => manifest.spec,
        cronJob: () => manifest.spec.jobTemplate.spec.template.spec,
        composite: () => manifest.spec.template.spec,
    });
}

function getPodSpecContainers({initContainers = [], containers = []}) {
    return initContainers.concat(containers);
}

function getContainers(manifest) {
    return getPodSpecContainers(getPodSpec(manifest));
}

function getBuilds(manifest) {
    const json = visitManifest(manifest, {
        pod: () => manifest.metadata &&
                manifest.metadata.annotations &&
                manifest.metadata.annotations[BUILD_INSTRUCTIONS_ANNOTATION],
        cronJob: () => manifest.spec.jobTemplate.spec.template.metadata &&
                manifest.spec.jobTemplate.spec.template.metadata.annotations &&
                manifest.spec.jobTemplate.spec.template.metadata.annotations[BUILD_INSTRUCTIONS_ANNOTATION],
        composite: () => manifest.spec.template.metadata &&
                manifest.spec.template.metadata.annotations &&
                manifest.spec.template.metadata.annotations[BUILD_INSTRUCTIONS_ANNOTATION]
    });
    return json && JSON.parse(json) || null;
}

function isSupported({kind}) {
    return SUPPORTED_RESOURCES.indexOf(kind) > -1;
}

export {
    BUILD_INSTRUCTIONS_ANNOTATION,
    isSupported,
    getContainers,
    getBuilds,
};
