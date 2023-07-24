# Code Interpreter with GPT-3.5 / GPT-4

Welcome to the Code Interpreter project. This software emulates OpenAI's ChatGPT locally, adding additional features and capabilities. Unlike OpenAI's model, this advanced solution supports multiple Jupyter kernels, allows users to install extra packages and provides unlimited file access.

## Project Description

ChatGPT's inbuilt code interpreter is versatile, functioning as a Python interpreter within a secure and firewalled sandbox environment. It can manage file uploads and downloads, interface with a long-lasting session (subject to an upper time limit), and perform other essential tasks.

Our local interpreter extends this model to provide more extensive functionality:

- A specifically designed chatbot based on ChatGPT's familiar and user-friendly implementation.
- The capability to execute Python and NodeJS codes within a Jupyter notebook environment, deployed within a Docker container.
- Multiple kernel support courtesy of Jupyter, fostering programming versatility.
- An unrestricted file access system with no limitation on file size or type.

These features are designed to render the benefits of programming available to a wider audience.

Promising applications of our code interpreter include:

- Performing quantitative and qualitative mathematic operations.
- Conducting detailed data analysis and visualization.
- Facilitating file conversions between different formats.

The possibilities are only limited by your creativity and exploration.

## Demo Video

Here is a short demo of the project:

[![Demo Video](http://i3.ytimg.com/vi/g7rnSWRVtXc/hqdefault.jpg)](http://www.youtube.com/watch?v=g7rnSWRVtXc "Demo Video")


## Repository Structure

This repository consists of three directories:

1. `client`: This directory contains a React application that provides the chatbot's user interface.
2. `server`: This directory houses the server, which responds to requests from the React application.
3. `jupyter_client`: This directory includes a Dockerfile and the essential files necessary to launch the Jupyter notebook server environment.

## Getting Started

Before beginning, please ensure you have Docker, Node.js, and npm installed.

### How to Install

Here are the installation instructions:

#### Step 1: Docker Image Creation

Navigate to the root directory containing the `Dockerfile` and enter the Docker build command.

```bash
docker build -t jupyter_api .
```

#### Step 2: Docker Container Deployment

Upon the Docker image's successful build, start the Docker container with:

```bash
docker run -p 5008:5008 -p 8888:8888 jupyter_api
```


### Step 3: Install Dependencies

Navigate to the `client` and `server` folders and install the dependencies using the `npm install` command.


### Step 4: Run the Server and Client

Then, start the server and client by navigating into their respective directories and using the `npm start` command.


## To-Do

The project is currently in its alpha stage and actively seeking contributions to enhance its capabilities. The repository is substantially based on the live-chat React application from [IdoBouskila](https://github.com/IdoBouskila/live-chat-app/). As I am primarily a backend developer, I am seeking help, especially from frontend developers, to improve this project's overall aesthetic and functionality.

Key areas for improvement include:

- Optimizing the chat interface.
- Facilitating selective language usage per room (e.g., allowing only Python or NodeJS in a given room). Presently, rooms can use both languages interchangeably.
- Adding more model options including temperature, top_p, max_tokens, etc.

## Contributing

Contributions are highly appreciated. Please fork this repository and submit a pull request to propose your changes.

## License

The software in this repository operates under the MIT License. Check out the [LICENSE](LICENSE) file for more details.

Disclaimer: You should have some command over Docker, NodeJS, and React to interact effectively with this software. If you're new, refer to the official [Docker](https://www.docker.com/), [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and [React](https://reactjs.org/) documentation and guides.