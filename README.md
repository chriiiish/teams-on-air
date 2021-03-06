# Teams On Air
A physical on-air light for Microsoft Teams


## Repo Layout

```
  .
  ├── .github             # All CI/CD workflows
  ├── docs                # Files needed to support READMEs
  ├── ESP8266-Board       # Code for the Arduino board 
  ├── infrastructure      # Cloud Infrastructure Code   
  ├── web                 # Web application Code
  └── README.md
```


## About
Imagine you're working away and you get a call through Microsoft Teams. You're in the office and you've got your headphones on. But how do other people know you're on a call? Well now they can! With the Teams On-Air light you've now got a physical light on your desk that reflects when you're on a call or not!

<img src="docs/imgs/web_connected.png" height="300" /> <img src="docs/imgs/board_01.jpg" width="300" />


## Demo

[![Teams On-Air Light Demo](docs/imgs/demo_screenshot.png)](https://youtu.be/296F3C0Eh5M "Teams On-Air Light Demo")


## Google Analytics 👀
Not currently turned on, but if you install it in the project put the details here


## Documentation
See the specific README files for how the web and infrastructure work:
  * [physical board](ESP8266-Board/README.md)
  * [infrastructure](infrastructure/README.md)
  * [web application](web/README.md) 


## Contributing (and test environments)
1. Don't commit straight to the `main` branch
2. Open a pull request with the work
3. When you open a PR a temporary test environment is created on _branch-name_.on-air.cjl.nz
4. The temporary test environment is deleted when the PR is closed


## The basics

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/2048px-Unofficial_JavaScript_logo_2.svg.png" alt="Javascript Logo" height="50"/> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png" alt="Typescript logo" height="50" /> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png" alt="AWS Logo" height="50"/> <img src="https://storage.googleapis.com/blog-images-backup/1*3SVfBkNZI2f-sspiq59xcw.png" alt="React Logo" height="50"/> <img src="https://d2908q01vomqb2.cloudfront.net/7719a1c782a1ba91c031a682a0a2f8658209adbf/2021/01/15/cdk-logo6-1260x476.png" alt="CDK Logo" height="50"/>


## Tagging
All resources should have these tags

`project` : `on-air`


## Microsoft Application
In order to do authentication with Microsoft Teams we need to register an application. This was done manually. Details below:

To open this in the Azure Portal [CLICK HERE](https://portal.azure.com/?quickstart=true#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/quickStartType//sourceType/Microsoft_AAD_IAM/appId/e7437bd4-595b-4333-a64e-fe264f7d06d2/objectId/362555a5-a66e-4ae6-9150-952902587f62/isMSAApp//defaultBlade/Overview/appSignInAudience/AzureADMultipleOrgs/servicePrincipalCreated/true)
```
  Azure Tenant:             chrislloydhigmailcom
  Name:                     Teams On-Air
  Application (client) ID:  e7437bd4-595b-4333-a64e-fe264f7d06d2
  Object ID:                362555a5-a66e-4ae6-9150-952902587f62
  Directory ID:             3da725d9-22b5-4fff-848d-e0cd027b7bc0
```
See [Web Application README](web/README.md) for further instructions on how to set this up