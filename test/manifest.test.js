import {
    getContainers,
    getBuilds,
    BUILD_INSTRUCTIONS_ANNOTATION
} from '../src/manifest';

const projectId = 'project-id';
const initContainer = {image: 'init-container-image'};
const container = {image: 'container-image'};
const containers = [initContainer, container];
const builds = [];

describe('`getContainers()` gets all containers from a manifest', () => {

    test('works with Pods', () => expect(getContainers(podManifest())).toEqual(containers));
    test('works with Deployments', () => expect(getContainers(deploymentManifest())).toEqual(containers));
    test('works with DaemonSets', () => expect(getContainers(daemonSetManifest())).toEqual(containers));
    test('works with Jobs', () => expect(getContainers(jobManifest())).toEqual(containers));
    test('works with ReplicaSets', () => expect(getContainers(replicaSetManifest())).toEqual(containers));
    test('works with ReplicationControllers', () => expect(getContainers(replicationControllerManifest())).toEqual(containers));
    test('works with StatefulSets', () => expect(getContainers(statefulSetManifest())).toEqual(containers));
    test('works with CronJobs', () => expect(getContainers(cronJobManifest())).toEqual(containers));
});

describe('`getBuilds()` gets build instructions from a manifest', () => {

    test('works with Pods', () => expect(getBuilds(podManifest())).toEqual(builds));
    test('works with Deployments', () => expect(getBuilds(deploymentManifest())).toEqual(builds));
    test('works with DaemonSets', () => expect(getBuilds(daemonSetManifest())).toEqual(builds));
    test('works with Jobs', () => expect(getBuilds(jobManifest())).toEqual(builds));
    test('works with ReplicaSets', () => expect(getBuilds(replicaSetManifest())).toEqual(builds));
    test('works with ReplicationControllers', () => expect(getBuilds(replicationControllerManifest())).toEqual(builds));
    test('works with StatefulSets', () => expect(getBuilds(statefulSetManifest())).toEqual(builds));
    test('works with CronJobs', () => expect(getBuilds(cronJobManifest())).toEqual(builds));
});

function podManifest() {
    return {
        kind: 'Pod',
        metadata: metadata(),
        spec: podSpec(),
    };
}

function deploymentManifest() {
    return {
        kind: 'Deployment',
        spec: {
            template: podTemplateSpec()
        }
    };
}

function daemonSetManifest() {
    return {
        kind: 'DaemonSet',
        spec: {
            template: podTemplateSpec()
        }
    };
}

function jobManifest() {
    return {
        kind: 'Job',
        spec: {
            template: podTemplateSpec()
        }
    };
}

function replicaSetManifest() {
    return {
        kind: 'ReplicaSet',
        spec: {
            template: podTemplateSpec()
        }
    };
}

function replicationControllerManifest() {
    return {
        kind: 'ReplicationController',
        spec: {
            template: podTemplateSpec()
        }
    };
}

function statefulSetManifest() {
    return {
        kind: 'StatefulSet',
        spec: {
            template: podTemplateSpec()
        }
    };
}

function cronJobManifest() {
    return {
        kind: 'CronJob',
        spec: {
            jobTemplate: {
                spec: {
                    template: podTemplateSpec()
                }
            }
        }
    };
}

function podTemplateSpec() {
    return {
        metadata: metadata(),
        spec: podSpec(),
    };
}

// TODO add cases where `containers` or `initContainers` are missing
function podSpec() {
    return {
        containers: [container],
        initContainers: [initContainer],
    }
}

function metadata() {
    return {
        annotations: {
            [BUILD_INSTRUCTIONS_ANNOTATION]: JSON.stringify(builds),
        }
    };
}
