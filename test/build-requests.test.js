import dockerParseImage from 'docker-parse-image';

import buildRequests from '../src/build-requests';

const projectId = 'projectId';
const repoName = 'repoName';

describe('`buildRequests()`', () => {

    const tagName = 'tagName';
    const image = 'registry/namespace/repository:tag';

    test('works', () => {
        const build = {
            steps: ['step1', 'step2', 'step3']
        };
        const containerBuilds = [{
            tagName,
            image: dockerParseImage(image),
            build,
        }]
        const requests = buildRequests({projectId, repoName, containerBuilds});
        expect(requests).toEqual([{
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    tagName,
                },
            },
            steps: build.steps,
            images: [image]
        }]);
    });
});

