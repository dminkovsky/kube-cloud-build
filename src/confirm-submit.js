import stringify from './stringify';

module.exports = function({
    log,
    inquirer,
}) {
    return function confirmSubmit(requests) {
        requests.forEach(request => log(stringify(request)));
        return inquirer({
            type: 'confirm', 
            name: 'confirmed',
            message: 'Do you want to submit these build requests?',
            default: false,
        });
    };
}
