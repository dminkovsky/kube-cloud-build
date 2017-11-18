import confirmSubmit from '../src/confirm-submit';
import stringify from '../src/stringify';

describe('`confirmSubmit()`', () => {

    test('works', async () => {
        const log = jest.fn();
        const result = true;
        const inquirer = jest.fn().mockReturnValue(Promise.resolve(result));
        const request = {};
        expect(await confirmSubmit({log, inquirer})([request, request])).toBe(result);
        expect(log).toBeCalledWith(stringify(request));
        expect(log).toHaveBeenCalledTimes(2);
        expect(inquirer).toBeCalledWith({
            type: 'confirm', 
            name: 'confirmed',
            message: 'Do you want to submit these build requests?',
            default: false,
        });
    });
});

