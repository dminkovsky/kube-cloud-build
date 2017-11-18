import stringify from './stringify';

module.exports = function({
    isSupported,
    manifestContainerBuilds,
    compareBuilds,
}) {
    return function compileRequiredImages(projectId, manifests) {
        return manifests.reduce((accum, manifest) => {
            if (!isSupported(manifest)) {
                return accum;
            }
            manifestContainerBuilds(projectId, manifest).forEach(containerBuild => {
                const {image, build} = containerBuild;
                const exists = accum.filter(c => c.image.fullname === image.fullname)[0];
                if (!exists) {
                    accum.push(containerBuild)
                } else if (!compareBuilds(exists.build.steps, build.steps)) {
                    console.log(stringify(exists.build), stringify(build));
                    throw REPEAT_ERROR;
                }
            });
            return accum;
        }, []);
    }
}

export const REPEAT_ERROR = 'Repeat container builds must have identical build steps';
