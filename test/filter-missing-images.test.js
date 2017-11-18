import filterMissingImages from '../src/filter-missing-images';

describe('`filterMissingImages()`', () => {

    const projectId = 'projectId';
    const token = 'token';
    const repository = 'repository';
    const tag = 'tag';
    const containerBuilds = [{image: {repository, tag}}];

    test('identifies container builds that are missing', async () => {
        const listTags = jest.fn().mockReturnValue(Promise.resolve([]));
        expect(await filterMissingImages({listTags})(containerBuilds, projectId, token)).toEqual(containerBuilds);
        expect(listTags).toHaveBeenCalledWith(repository, projectId, token);
    });

    test('identifies container builds that are not missing', async () => {
        const listTags = jest.fn().mockReturnValue(Promise.resolve([tag]));
        expect(await filterMissingImages({listTags})(containerBuilds, projectId, token)).toEqual([]);
        expect(listTags).toHaveBeenCalledWith(repository, projectId, token);
    });
});

