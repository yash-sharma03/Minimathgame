# o107_finalproject
**Riley Guioguio, Yash Sharma**

Shopping website

## setup
ASSUMING YOU ARE ON WINDOWS (similar steps for Mac/Linux users)

This project runs on Node.js version 22.11.0, we can use [Node Version manager](https://github.com/coreybutler/nvm-windows)

- `nvm install 22.11.0`
- `nvm use 22.11.0`

Move to directory where you want to install the project
- `git clone https://github.com/yelir4/o107_finalproject.git`
- `cd o107_finalproject`
- `npm install`


## running application locally
Make sure command line is in the project directory i.e. `xxxx\o107_finalproject\`

`node src/index.js` OR `npm start`

Then in browser you can visit http://localhost:3000

## pushing changes to main branch
- `git add .`
- `git commit -m "<message>"`
- `git push origin main`

# pulling changes from main branch
- `git pull origin main`

## what are the project files?
- package.json - project information and list of dependencies
- package-lock.json - specify version of project dependencies
- src/ - server side code
    - src/index.js - application entry point

## list of technologies used
- Node.js, Express
- HTML, CSS, JavaScript