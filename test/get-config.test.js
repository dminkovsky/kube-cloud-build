import fs from 'fs';

import getConfig from '../src/get-config.js';

const {CMD_CONFIG} = getConfig;

describe('`getConfig()`', () => {

   test('works', async () => {
       const result = fs.readFileSync(`${__dirname}/get-config.fixture.gcloud-config-helper-output.json`, 'utf-8');
       const exec = jest.fn((cmd, cb) => cb(null, result));
       expect(await getConfig({exec})()).toEqual({token: 'token', projectId: 'projectId'});
       expect(exec.mock.calls[0][0]).toBe(CMD_CONFIG);
    });
});
