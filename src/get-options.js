module.exports = function({
    process,
    minimist
}) {
    return function getOptions() {
        const {
            f: file,
            r: repoName,
        } = minimist(process.argv.slice(2));
        if (!repoName) {
            throw 'repoName (-r) required';
        }
        return {
            file,
            repoName,
        };
    }
}
