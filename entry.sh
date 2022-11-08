#!/usr/bin/env bash

/usr/bin/mongod --dbpath /var/mongodb --fork --logpath /var/log/mongo.log
/usr/bin/mongosh /mongo-init.js

node /backend/app.js &

cd /frontend
export SHORT_BASE_URL="https://pbid.io"
npm install && SHORT_API_BASE="http://$(awk 'END{print $1}' /etc/hosts):3001" npm run build

http-server /frontend/build

