import getOptions from '../src/get-options';

describe('`getOptions()`', () => {

    test('fails when repoName not specified', () => {
        const file = 'file';
        const repoName = 'repoName';
        const process = {argv: [0, 1, 2]}
        const minimist = jest.fn().mockReturnValue({f: file});
        expect(() => getOptions({process, minimist})()).toThrow('repoName (-r) required');
    });

    test('works', () => {
        const file = 'file';
        const repoName = 'repoName';
        const process = {argv: [0, 1, 2]}
        const minimist = jest.fn().mockReturnValue({f: file, r: repoName});
        expect(getOptions({process, minimist})()).toEqual({file, repoName});
        expect(minimist).toBeCalledWith([2]);
    });
});
