# kube-cloud-build

Specify container builds inside your Kubernetes manifests.

[![Build Status](https://travis-ci.org/dminkovsky/kube-cloud-build.svg?branch=master)](https://travis-ci.org/dminkovsky/kube-cloud-build)

Kubernetes helps orchestrate container deployments. But before Kubernetes can
orchestrate anything, the container images specified in your Kubernetes
manifests must be built and available in an image registry. Making this happen
can be much easier said than done!

`kube-cloud-build` integrates Kubernetes and [Google Cloud Container Builder](https://cloud.google.com/container-builder/docs/).
It lets you declare Cloud Container Builder [build steps](https://cloud.google.com/container-builder/docs/how-to/writing-build-requests)
for containers right inside the manifests where they are used. With the build
steps inside your manifests, any time you update the images specified by your
manifests, `kube-cloud-build` will automatically generate build requests based
on the missing images' build steps. Never write a build request by hand again!

`kube-cloud-build` examines your Kubernetes manifests, identifies images that
are missing from Google Container Registry (GCR), generates build requests for
the missing images, and submits the build requests for you. It then streams
build logs to your terminal.

To use this tool, just add Container Builder build steps to your manifests.
Then, any time you update an image's tag in a manifest, run that manifest
through this tool. It'll make sure the images you need are built and available
on GCR. Deploy with confidence, knowing you wont receive an image pull error.

### Install

```
$ npm install -g kube-cloud-build
```

### Usage

Process a single manifest:

```
$ kube-cloud-build -r repo -f examples/deployment.yaml
```

or an entire helm chart:

```
$ helm template /path/to/chart | kube-cloud-build -r repo
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

You can deploy this manifest, but you will get a bunch of image pull errors if
the images for the containers it specifies do not exist on GCR. You can build these images
manually by submitting build requests to Container Builder, but with many manifests
and containers this quickly becomes difficult to manage.

The solution: add your Container Builder build steps directly to your manifest:

```
$ cat examples/deployment.yaml
apiVersion: apps/v1beta2
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  template:
+   metadata:
+     annotations:
+       google.cloud.container.build: >
+           [{
+             "container": "init",
+             "steps": [{
+               "name": "gcr.io/cloud-builders/docker",
+               "dir": "init",
+               "args": [
+                 "build",
+                 "-t",
+                 "gcr.io/some-project-123456/init:8f4dfd28dbc51960d0bd2d463c23593cb878fd14",
+                 "."
+               ]
+             }]
+           },{
+             "container": "container1",
+             "steps": [{
+               "name": "gcr.io/cloud-builders/docker",
+               "dir": "container1",
+               "args": [
+                 "build",
+                 "-t",
+                 "gcr.io/some-project-123456/container1:v4",
+                 "."
+               ]
+             }]
+           },{
+             "container": "container2",
+             "steps": [{
+               "name": "gcr.io/cloud-builders/docker",
+               "dir": "container2",
+               "args": [
+                 "build",
+                 "-t",
+                 "gcr.io/some-project-123456/container2:v4",
+                 "."
+               ]
+             }]
+           }]
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

Now feed this manifest to `kube-cloud-build`. It will communicate with GCR,  identify images
that are missing, and ask which you want to build:

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
requests. Steps are grouped into build requests by tag.

Review and optionally submit the requests:

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

If you choose "yes," `kube-cloud-build` will submit these build requests
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

-f  Manifest file, if not reading from stdin
-r  Google Source Repository to use in build requests
```

`kube-cloud-build` accepts input by way of the `-f` switch or on `stdin`.
`stdin` is useful for deploying Helm charts:

```
$ helm template /path/to/chart | kube-cloud-build -r repo
```

The project ID and API access token used to communicate with the Google Cloud
API are determined using [`gcloud config config-helper`](src/get-config.js).

If all required images are present on GCR, `kube-cloud-build` exits silently with status 0.

### FAQ

**What API calls does this tool make?**

During the course of its operation, `kube-cloud-build` makes Google Cloud API
calls analogous to:

* [`gcloud container images list-tags`](src/list-tags.js)
* [`gcloud container builds submit`](src/submit-build-request.js)
* [`gcloud container builds log --stream`](src/log-build.js)

**What resource types can this tool handle?**

`kube-cloud-build` handles Kubernetes resources that are either a `Pod` or
contain a `PodTemplateSpec`:

* `Pod`
* `CronJob`
* `Deployment`
* `DaemonSet`
* `Job`
* `ReplicaSet`
* `ReplicationController`
* `StatefulSet`

For each of these resources types, `kube-cloud-build` looks for a `google.cloud.container.build`
 annotation inside of the metadata of the relevant [Pod](https://kubernetes.io/docs/api-reference/v1.8/#pod-v1-core) or
 [PodTemplateSpec](https://kubernetes.io/docs/api-reference/v1.8/#podtemplatespec-v1-core).
