import dockerParseImage from 'docker-parse-image';

import buildRequests from '../src/build-requests';

const projectId = 'projectId';
const repoName = 'repoName';

describe('`buildRequests()`', () => {

    const tagName1 = 'tag1';
    const tagName2 = 'tag2';
    const commitSha1 = '19a0cee5919812aae6ccabea10855b3848f3d72b';
    const commitSha2 = '3801c83e4f36e6cb2a26f7734b1fd7b631112724';
    const image1 = `registry/namespace/repository:${tagName1}`;
    const image2 = `registry/namespace/repository:${tagName2}`;
    const image3 = `registry/namespace/repository:${commitSha1}`;
    const image4 = `registry/namespace/repository:${commitSha2}`;

    const build1 = { steps: ['step1'] };
    const build2 = { steps: ['step2'] };
    const build3 = { steps: ['step3'] };
    const build4 = { steps: ['step4'] };

    const containerBuild1 = {
        tagName: tagName1,
        image: dockerParseImage(image1),
        build: build1,
    };
    const containerBuild2 = {
        tagName: tagName2,
        image: dockerParseImage(image2),
        build: build2,
    };
    const containerBuild3 = {
        commitSha: commitSha1,
        image: dockerParseImage(image3),
        build: build3,
    };
    const containerBuild4 = {
        commitSha: commitSha2,
        image: dockerParseImage(image4),
        build: build4,
    };

    test('two different tags', () => {
        const containerBuilds = [containerBuild1, containerBuild2];
        const requests = buildRequests({projectId, repoName, containerBuilds});
        expect(requests).toEqual([{
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    tagName: tagName1,
                },
            },
            steps: build1.steps,
            images: [image1]
        }, {
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    tagName: tagName2,
                },
            },
            steps: build2.steps,
            images: [image2]
        }]);
    });

    test('two different commitSha', () => {
        const containerBuilds = [containerBuild3, containerBuild4];
        const requests = buildRequests({projectId, repoName, containerBuilds});
        expect(requests).toEqual([{
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    commitSha: commitSha1,
                },
            },
            steps: build3.steps,
            images: [image3]
        }, {
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    commitSha: commitSha2,
                },
            },
            steps: build4.steps,
            images: [image4]
        }]);
    });

    test('a tag and a commitSha', () => {
        const containerBuilds = [containerBuild2, containerBuild3];
        const requests = buildRequests({projectId, repoName, containerBuilds});
        expect(requests).toEqual([{
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    tagName: tagName2,
                },
            },
            steps: build2.steps,
            images: [image2]
        }, {
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    commitSha: commitSha1,
                },
            },
            steps: build3.steps,
            images: [image3]
        }]);
    });

    test('a commitSha and a tag', () => {
        const containerBuilds = [containerBuild3, containerBuild2];
        const requests = buildRequests({projectId, repoName, containerBuilds});
        expect(requests).toEqual([{
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    commitSha: commitSha1,
                },
            },
            steps: build3.steps,
            images: [image3]
        }, {
            source: {
                repoSource: {
                    projectId,
                    repoName,
                    tagName: tagName2,
                },
            },
            steps: build2.steps,
            images: [image2]
        }]);
    });
});

