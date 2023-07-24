
## Project Overview

This directory contains the Dockerfile and necessary files to set up the Jupyter notebook environment where the code will be executed.

## Prerequisites

Make sure Docker is installed on your system.

## Getting Started

First, navigate to the jupyter_client directory:

```bash
cd jupyter_client
```

Build the Docker image:

```bash
docker build -t jupyter_api .
```

Finally, run the docker container:

```bash
docker run -p 5008:5008 -p 8888:8888 jupyter_api
```

The Jupyter server will be running on http://localhost:8888 and serving API on http://localhost:5008

Disclaimer: This README assumes that you're familiar with Docker, NodeJS, and npm. If you're new to any of these, please refer to the official documentation of [Docker](https://www.docker.com/), [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), to get started.