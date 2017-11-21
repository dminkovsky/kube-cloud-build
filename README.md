# kube-cloud-build

[![Build Status](https://travis-ci.org/dminkovsky/kube-cloud-build.svg?branch=master)](https://travis-ci.org/dminkovsky/kube-cloud-build)

`kube-cloud-build` integrates Kubernetes and [Google Cloud Container Builder](https://cloud.google.com/container-builder/docs/).
It lets you declare [build steps](https://cloud.google.com/container-builder/docs/how-to/writing-build-requests)
for containers right inside the manifests where they are used. `kube-cloud-build`
parses your manifests and identifies images that are missing from Google
Container Registry ("GCR"). It generates and submits build requests for missing
images, then streams the build logs to your terminal.

### Install

```
$ npm install -g kube-cloud-build
```

### Example

Suppose you have the following manifest:
```
$ cat examples/deployment.yaml
apiVersion: apps/v1beta2
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  template:
    metadata:
      annotations:
        google.cloud.container.build: >
            [{
              "container": "init",
              "steps": [{
                "name": "gcr.io/cloud-builders/docker",
                "dir": "init",
                "args": [
                  "build",
                  "-t",
                  "gcr.io/some-project-123456/init:8f4dfd28dbc51960d0bd2d463c23593cb878fd14",
                  "."
                ]
              }]
            },{
              "container": "container1",
              "steps": [{
                "name": "gcr.io/cloud-builders/docker",
                "dir": "container1",
                "args": [
                  "build",
                  "-t",
                  "gcr.io/some-project-123456/container1:v4",
                  "."
                ]
              }]
            },{
              "container": "container2",
              "steps": [{
                "name": "gcr.io/cloud-builders/docker",
                "dir": "container2",
                "args": [
                  "build",
                  "-t",
                  "gcr.io/some-project-123456/container2:v4",
                  "."
                ]
              }]
            }]
    spec:
      initContainers:
      - name: init
        image: gcr.io/some-project-123456/init:8f4dfd28dbc51960d0bd2d463c23593cb878fd14
      containers:
      - name: container1
        image: gcr.io/some-project-123456/container1:v4
      - name: container2
        image: gcr.io/some-project-123456/container2:v4
```

Suppose the images in this manifest do not exist on GCR. If you supply this
manifest to `kube-cloud-build` it will communicate with GCR and identify required images that are missing:

```
$ kube-cloud-build -r repo -f deployment.yaml
? The following images are missing from Google Container Registry. Choose the ones you want to build: (Press <space> to select, <a> to toggle all, <i> to inverse selection)
❯◯ gcr.io/some-project-123456/init:8f4dfd28dbc51960d0bd2d463c23593cb878fd14
 ◯ gcr.io/some-project-123456/container1:v4
 ◯ gcr.io/some-project-123456/container2:v4
```

`kube-cloud-build` ignores images that are [not part of your project](test/manifest-container-builds.test.js#L21)
or lack build instructions. Given the images you select, `kube-cloud-build`
compiles the required containers' build steps into Container Builder build
requests. Steps are grouped into build requests by tag. You review and
optionally submit the requests:

```
{
    "source": {
        "repoSource": {
            "projectId": "some-project-123456",
            "repoName": "repo",
            "commitSha": "8f4dfd28dbc51960d0bd2d463c23593cb878fd14"
        }
    },
    "steps": [
        {
            "name": "gcr.io/cloud-builders/docker",
            "dir": "init",
            "args": [
                "build",
                "-t",
                "gcr.io/some-project-123456/init:8f4dfd28dbc51960d0bd2d463c23593cb878fd14",
                "."
            ]
        }
    ],
    "images": [
        "gcr.io/some-project-123456/init:8f4dfd28dbc51960d0bd2d463c23593cb878fd14"
    ]
}
{
    "source": {
        "repoSource": {
            "projectId": "some-project-123456",
            "repoName": "repo",
            "tagName": "v4"
        }
    },
    "steps": [
        {
            "name": "gcr.io/cloud-builders/docker",
            "dir": "container1",
            "args": [
                "build",
                "-t",
                "gcr.io/some-project-123456/container1:v4",
                "."
            ]
        },
        {
            "name": "gcr.io/cloud-builders/docker",
            "dir": "container2",
            "args": [
                "build",
                "-t",
                "gcr.io/some-project-123456/container2:v4",
                "."
            ]
        }
    ],
    "images": [
        "gcr.io/some-project-123456/container1:v4",
        "gcr.io/some-project-123456/container2:v4"
    ]
}
? Do you want to submit these build requests? (y/N)
```

If you choose "yes", `kube-cloud-build` will submit these build requests
serially. Build logs will stream to your terminal:

```
------------------------------- REMOTE BUILD OUTPUT ------------------------------------------
starting build "46c86411-b1f0-4003-a3c3-72a63497b377"

FETCHSOURCE
Initialized empty Git repository in /workspace/.git/
...
```

### Usage

```
kube-cloud-build -r <repository> [-f <file>]

OPTIONS
-f  Manifest file, if not reading from stdin
-r  Google Source Repository to use in build requests
```

`kube-cloud-build` accepts input by way of the `-f` switch or on `stdin`.
`stdin` is useful for deploying Helm charts:

```
$ helm template /path/to/chart | kube-cloud-build -r repo
```

The project ID and API access token used to communicate with the Google Cloud
API are determined using [`gcloud config config-helper`](blob/master/src/get-config.js).

During the course of its operation, `kube-cloud-build` makes Google Cloud API
calls analgous to:

* [`gcloud container images list-tags`](src/list-tags.js)
* [`gcloud container builds submit`](src/submit-build-request.js)
* [`gcloud container builds log --stream`](src/log-build.js)
