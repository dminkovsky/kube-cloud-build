import parseInputYaml from '../src/parse-input-yaml';

describe('`parseInputYaml()`', () => {

    const stream = 'stream';
    const agg = 'agg';
    const parsed = 'parsed';
    const fs = {createReadStream: jest.fn().mockReturnValue(stream)};
    const rawBody = jest.fn().mockReturnValue(Promise.resolve(agg));
    const jsYaml = {safeLoadAll: jest.fn().mockReturnValue(parsed)};

    test('gets from specified file', async () => {
        const file = 'file';
        expect(await parseInputYaml({fs, rawBody, jsYaml})(file)).toEqual(parsed);
        expect(fs.createReadStream).toBeCalledWith(file);
        expect(rawBody).toBeCalledWith(stream, {encoding: 'utf-8'});
        expect(jsYaml.safeLoadAll).toBeCalledWith(agg);
    });

    test('gets from stdin when file not specified', async () => {
        const process = {stdin: stream};
        expect(await parseInputYaml({fs, rawBody, jsYaml, process})()).toEqual(parsed);
        expect(rawBody).toBeCalledWith(stream, {encoding: 'utf-8'});
        expect(jsYaml.safeLoadAll).toBeCalledWith(agg);
    })
});

