# courses-app-backend

This project was created for educational purposes and is used as a back-end for educational applications.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Swagger

## Run Swagger UI

1) Pull the backend project and install dependencies
```bash
$ npm install
```

2) Execute the following command into the terminal

```bash
$ npm run start
```

3) Go to http://localhost:4000/api in your browser to see Swagger UI

## Authorization

1) Choose any user from the *bd -> users.json* file and pass this user data into *Auth -> /login* method into the swagger. And then execute it

![Login](assets/img/login.png?raw=true "Login")

2) Copy result token from the response (token after *Barier*)

![Token](assets/img/token.png?raw=true "Token")

3) Click on the *Authorize* button at the top of the page. Paste the token from the previous step to the *value* input and click the *Authorize* button

![Auth](assets/img/auth.png?raw=true "Auth")

