import listTags from '../src/list-tags';
import authorization from '../src/authorization';

const {listTagsUrl} = listTags;

describe('`listTags()`', () => {
    const projectId = 'projectId';
    const repository = 'repository';
    const token = 'token';

    const result = require('fs').readFileSync(`${__dirname}/list-tags.fixture.result.json`, 'utf-8');
    const resultTags = ['90a0a34c6d85aa439c2be9baefbef091b86369e1', 'ecd6a597f7a54c3dc878525577c4a8af8ce271cf'];
    const request = jest.fn().mockReturnValue(Promise.resolve(result));

    test('works', async () => {
        const tags = await listTags({request})(repository, projectId, token);
        expect(tags).toEqual(resultTags);
        expect(request).toBeCalledWith({
            url: listTagsUrl(projectId, repository),
            headers: {
                ...authorization(token)
            },
        });
    });
});

