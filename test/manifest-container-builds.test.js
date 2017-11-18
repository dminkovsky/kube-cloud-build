import dockerParseImage from 'docker-parse-image';

import manifestContainerBuilds from '../src/manifest-container-builds';

describe('`manifestContainerBuilds(manifest)`', () => {

    const projectId = 'projectId';
    const manifest = 'manifest';
    const tag = 'tag';
    const image = `gcr.io/${projectId}/image:${tag}`;

    function mockGetContainers(image) {
        return jest.fn().mockReturnValue([{name: 'container', image}]);
    }

    function mockGetBuilds() {
        return jest.fn().mockReturnValue([{container: 'container'}]);
    }

    test('ignores containers with unsupported images', () => {
        const unsupportedImages = [
            'busybox',
            'gcr.io/some/image',
            `gcr.io/${projectId}/image`,
            `gcr.io/${projectId}/image:latest`
        ]
        unsupportedImages.forEach(image => {
            const getContainers = mockGetContainers(image);
            const getBuilds = mockGetBuilds();
            const fn = manifestContainerBuilds({getContainers, getBuilds});
            expect(fn(projectId, manifest)).toEqual([]);
        });
    });

    test('ignores containers with empty build annotiations', () => {
        const getContainers = mockGetContainers(image);
        const getBuilds = jest.fn().mockReturnValue([]);
        const fn = manifestContainerBuilds({getContainers, getBuilds});
        expect(fn(projectId, manifest)).toEqual([]);
    });

    test('ignores containers without build annotiation', () => {
        const getContainers = mockGetContainers(image);
        const getBuilds = jest.fn().mockReturnValue(null);
        const fn = manifestContainerBuilds({getContainers, getBuilds});
        expect(fn(projectId, manifest)).toEqual([]);
    });

    test('handles image tagged with a tag', () => {
        const image = `gcr.io/${projectId}/image:${tag}`;
        const getContainers = mockGetContainers(image);
        const getBuilds = mockGetBuilds();
        const fn = manifestContainerBuilds({getContainers, getBuilds});
        expect(fn(projectId, manifest)).toEqual([{
            tagName: tag,
            image: dockerParseImage(image),
            build: getBuilds()[0],
        }]);
    });

    test('handles images tagged with a commit', () => {
        const commitSha = 'c485b392c587652b74623d3694a7888c3b5ce259';
        const image = `gcr.io/${projectId}/image:${commitSha}`;
        const getContainers = mockGetContainers(image);
        const getBuilds = mockGetBuilds();
        const fn = manifestContainerBuilds({getContainers, getBuilds});
        expect(fn(projectId, manifest)).toEqual([{
            commitSha,
            image: dockerParseImage(image),
            build: getBuilds()[0],
        }]);
    });
});



