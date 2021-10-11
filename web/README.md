# Teams On Air Web Application

This is the code for the actual website. 

## Project Layout

    .
    ├── public             # Any public static file
    ├── src                # The actual application source code
    │   ├── assets         # Static files (e.g. images)
    │   ├── components     # The react components used to build the site
    │   └── helpers        # Processing logic that requires no front-end
    └── README.md

![](../docs/application_walkthrough.gif)

## Getting started
1. Install Node
2. Run the following commands
   ```
    cd web/             # Go to the right folder
    npm install         # Install NPM packages
    npm run build       # Build the application
    npm run test        # Run unit tests
   ```

This will verify that the code builds and the tests run.

3. Run this command to start a webserver to see the site working on your local machine
   `npm run start`
4. This will start a webserver on [http://localhost:3000]()


## CSS
The CSS styles here use [CSS custom props](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) (variables). You can find all the variable values in `index.css`. Do not define variables anywhere else.

When using/defining variables please make sure to declare _what_ the variable stores (purpose), not where it's used. E.g --padding-small instead of --padding-login-page-right

## Useful commands

 * `npm start` run local webserver on [http://localhost:3000]()
 * `npm run test` run unit tests
 * `npm run build` build the application

## CI-CD
Continuous integration / deployment is setup in GitHub Workflows. See the workflow in `.github/workflows/deploy-website.yml`

If the unit tests pass and the code builds it will be deployed to the production site at [https://on-air.cjl.nz]().

**NOTE: This site is versioned according the SHORT SHA HASH of the git commit.**

## Deployment
For implementation see `.github/workflows/deploy-website.yml`

Once the code has been built and tested, it is sync'd to an S3 bucket in two places:
 - /live
 - /{SHORT_SHA}

This means that we have a version we can roll back to if needed (by copying the files from the version, {SHORT_SHA} back into the /live folder).

The /live folder is... understandably... the live code currently being served on funqr.cjl.nz


## Google Analytics
Option to add Google Analytics - not currently installed.

-------

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).