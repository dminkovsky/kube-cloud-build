import dockerParseImage from 'docker-parse-image';

import compileRequiredImages, {REPEAT_ERROR} from '../src/compile-required-images';

describe('`compileManifest()`', () => {

    const manifest = 'manifest';
    const projectId = 'projectId';
    const containerBuild = {image: {fullname: 'image'}, build: {}};

    function getIsSupported() {
        return jest.fn().mockReturnValue(true);
    }

    function getCompareBuilds() {
        return jest.fn().mockReturnValue(true);
    }

    test('ignores unsupported kubernetes types', () => {
        const isSupported = jest.fn().mockReturnValue(false);
        const manifestContainerBuilds = jest.fn().mockReturnValue([containerBuild]);
        const compareBuilds = getCompareBuilds();
        const fn = compileRequiredImages({isSupported, manifestContainerBuilds, compareBuilds});
        expect(fn(projectId, [manifest])).toEqual([]);
        expect(isSupported).toBeCalledWith(manifest);
    });

    test('works within a single manifest', () => {
        const isSupported = getIsSupported();
        const containerBuild1 = {image: {fullname: 'image1'}};
        const containerBuild2 = {image: {fullname: 'image2'}};
        const manifestContainerBuilds = jest.fn().mockReturnValue([containerBuild1, containerBuild2]);
        const compareBuilds = getCompareBuilds();
        const fn = compileRequiredImages({isSupported, manifestContainerBuilds, compareBuilds});
        expect(fn(projectId, [manifest])).toEqual([containerBuild1, containerBuild2]);
        expect(manifestContainerBuilds).toBeCalledWith(projectId, manifest);
    });

    test('works across manifests', () => {
        const isSupported = getIsSupported();
        const containerBuild1 = {image: {fullname: 'image1'}};
        const containerBuild2 = {image: {fullname: 'image2'}};
        const manifestContainerBuilds = jest.fn()
            .mockReturnValueOnce([containerBuild1])
            .mockReturnValueOnce([containerBuild2]);
        const compareBuilds = getCompareBuilds();
        const fn = compileRequiredImages({isSupported, manifestContainerBuilds, compareBuilds});
        expect(fn(projectId, [manifest, manifest])).toEqual([containerBuild1, containerBuild2]);
        expect(manifestContainerBuilds.mock.calls[0]).toEqual([projectId, manifest]);
        expect(manifestContainerBuilds.mock.calls[1]).toEqual([projectId, manifest]);
    });

    test('de-duplicates duplicate container builds within a single manifest', () => {
        const isSupported = getIsSupported();
        const manifestContainerBuilds = jest.fn()
            .mockReturnValue([containerBuild, containerBuild]);
        const compareBuilds = getCompareBuilds();
        const fn = compileRequiredImages({isSupported, manifestContainerBuilds, compareBuilds});
        expect(fn(projectId, [manifest])).toEqual([containerBuild]);
        expect(manifestContainerBuilds.mock.calls[0]).toEqual([projectId, manifest]);
    }); 

    test('de-duplicates duplicate container builds across manifests', () => {
        const isSupported = getIsSupported();
        const manifestContainerBuilds = jest.fn()
            .mockReturnValueOnce([containerBuild])
            .mockReturnValueOnce([containerBuild]);
        const compareBuilds = getCompareBuilds();
        const fn = compileRequiredImages({isSupported, manifestContainerBuilds, compareBuilds});
        expect(fn(projectId, [manifest, manifest])).toEqual([containerBuild]);
        expect(manifestContainerBuilds.mock.calls[0]).toEqual([projectId, manifest]);
        expect(manifestContainerBuilds.mock.calls[1]).toEqual([projectId, manifest]);
    }); 

    test('fails when repeat container builds have different builds', () => {
        const isSupported = getIsSupported();
        const manifestContainerBuilds = jest.fn().mockReturnValue([containerBuild, containerBuild]);
        const compareBuilds = jest.fn().mockReturnValue(false);
        const fn = compileRequiredImages({isSupported, manifestContainerBuilds, compareBuilds});
        expect(() => fn(projectId, [manifest])).toThrow(REPEAT_ERROR);
    });
});
