# bHeater-Nodejs

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/bitofreedom/bHeater-Nodejs.git
    cd bHeater-Nodejs
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Running the Application

1. Start the server:
    ```sh
    npm start
    ```

2. The server will be running at:
    ```
    http://localhost:3000
    ```

## Available Endpoints

- `POST /execute`: Execute a command on a remote host.
- `GET /commands`: List available named commands.
- `GET /heaters`: List available heaters from the JSON file.
- `POST /set_heater`: Set the heater configuration.

## Testing the Application

1. Run the tests:
    ```sh
    npm test
    ```

2. Ensure all tests pass before deploying the application.
