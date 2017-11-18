import submitBuildRequest from '../src/submit-build-request';
import authorization from '../src/authorization';

const {submitBuildRequestUrl} = submitBuildRequest;

describe('`submitBuildRequest()`', () => {
    const projectId = 'projectId';
    const repository = 'repository';
    const token = 'token';

    const result = require('fs').readFileSync(`${__dirname}/submit-build-request.fixture.result.json`, 'utf-8');
    const resultId = '20c4df1d-e71b-4085-9a30-d76b2747d8ad';
    const request = jest.fn().mockReturnValue(Promise.resolve(result));

    test('works', async () => {
        const buildRequest = {};
        const id = await submitBuildRequest({request})({buildRequest, projectId, token});
        expect(id).toBe(resultId);
        expect(request).toBeCalledWith({
            url: submitBuildRequestUrl(projectId),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authorization(token),
            },
            body: JSON.stringify(buildRequest),
        });
    });
});

