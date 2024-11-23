cd server

if ! command -v node &> /dev/null; then
    echo "@@ Node.js is required." 
    install node.js
else
    echo "@@ Node.js is already installed."
fi

if ! command -v npm &> /dev/null; then
    echo "@@ NPM is required." 
    install npm.js
else
    echo "@@ NPM is already installed."
fi

echo "@@ Initializing npm"
npm init -y

echo "@@ Installing express open fs"
if ! command -v express open fs &> /dev/null; then
    echo "@@ express open fs are required." 
    npm install express open fs
else
    echo "@@ express open fs are already installed."
fi

echo "@@ Installing cors"
if ! command -v cors &> /dev/null; then
    echo "@@ cors is required." 
    npm install cors
else
    echo "@@ cors is already installed."
fi

echo "@@ Installing body-parser"
if ! command -v body-parser &> /dev/null; then
    echo "@@ body-parser is required." 
    npm install body-parser
else
    echo "@@ body-parser is already installed."
fi

echo "@@ Installing dotenv"
if ! command -v dotenv &> /dev/null; then
    echo "@@ dotenv is required." 
    npm install dotenv
else
    echo "@@ dotenv is already installed."
fi

echo "@@ Installing nodemon"
if ! command -v nodemon &> /dev/null; then
    echo "@@ nodemon is required." 
    npm install --save-dev nodemon
else
    echo "@@ dotenv is already installed."
fi

echo "@@ Installing eslint"
if ! command -v eslint &> /dev/null; then
    echo "@@ eslint is required." 
    npm install --save-dev eslint
else
    echo "@@ eslint is already installed."
fi

echo "@@ Installing mssql"
if ! command -v npm mssql &> /dev/null; then
    echo "@@ mssql is required." 
    npm install mssql
else
    echo "@@ mssql is already installed."
fi

echo "@@ Starting eslint"
# npx eslint --init

echo "@@ Starting server"
node server.js