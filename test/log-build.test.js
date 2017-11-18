import logBuild from '../src/log-build';

const {cmdLogStream} = logBuild;

describe('`logBuild()`', () => {

    test('works', async () => {
        const result = 'result';
        const process = {stdout: 'stdout'};
        const pipe = jest.fn();
        const on = jest.fn((event, fn) => {
            if (event === 'end') {
                setTimeout(() => fn(result), 0);
            }
        });
        const childProcess = {stdout: {pipe, on}};
        const exec = jest.fn().mockReturnValue(childProcess);
        const id = 'id';
        expect(await logBuild({process, exec})(id)).toEqual(result);
        expect(exec).toBeCalledWith(cmdLogStream(id));
        expect(pipe).toBeCalledWith(process.stdout);
    });
});

