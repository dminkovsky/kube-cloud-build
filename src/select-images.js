module.exports = function({
    inquirer,
}) {
    return function selectImages(containerBuilds) {
        return inquirer({
            type: 'checkbox',
            message: 'The following images are missing from Google Container Registry. Choose the ones you want to build:',
            name: 'images',
            choices: containerBuilds.map(({image: {fullname}}) => ({name: fullname})),
        })
        .then(({images}) => {
            return containerBuilds.filter(({image: {fullname}}) => images.indexOf(fullname) > -1);
        });
    }
}
