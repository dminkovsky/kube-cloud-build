#!/usr/bin/env node

import fs from 'fs';
import assert from 'assert';
import {exec} from 'child_process';
import rawBody from 'raw-body';
import jsYaml from 'js-yaml';
import dockerParseImage from 'docker-parse-image';
import request from 'request-promise';
import Promise from 'bluebird';
import minimist from 'minimist';
import inquirer from 'inquirer';
import ttys from 'ttys';
import __deepEqual from 'deep-equal';

import {isSupported, getContainers, getBuilds} from './manifest';
import buildRequests from './build-requests';

const {log} = console;

const getConfig = require('./get-config')({exec});
const getOptions = require('./get-options')({process, minimist});
const parseInputYaml = require('./parse-input-yaml')({process, fs, rawBody, jsYaml});
const listTags = require('./list-tags')({request});
const submitBuildRequest = require('./submit-build-request')({request});
const manifestContainerBuilds = require('./manifest-container-builds')({getContainers, getBuilds});
const compileRequiredImages = require('./compile-required-images')({isSupported, manifestContainerBuilds, compareBuilds: deepEqual});
const filterMissingImages = require('./filter-missing-images')({listTags});
const inquirerModule = inquirer.createPromptModule({input: ttys.stdin, output: ttys.stdout});
const selectImages = require('./select-images')({inquirer: inquirerModule});
const confirmSubmit = require('./confirm-submit')({log, inquirer: inquirerModule});
const logBuild = require('./log-build')({process, exec});

(async function main() {
    try {
        const {projectId, token} = await getConfig();
        const {file, repoName} = getOptions();
        const manifests = await parseInputYaml(file);
        const requiredImages = compileRequiredImages(projectId, manifests);
        const missingImages = await filterMissingImages(requiredImages, projectId, token);
        if (!missingImages.length) {
            process.exit(0);
        }
        const selected = await selectImages(missingImages)
        if (!selected.length) {
            process.exit(0);
        }
        const requests = buildRequests({projectId, repoName, containerBuilds: selected});
        const {confirmed} = await confirmSubmit(requests);
        if (!confirmed) {
            process.exit(1);
        }
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            const id = await submitBuildRequest({buildRequest: request, projectId, token});
            await logBuild(id);
        }
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})();

function deepEqual(a, b) {
    return __deepEqual(a, b, {strict: true});
}
