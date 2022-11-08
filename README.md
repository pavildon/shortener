# Simple URL Shortener

The project consist in two project ./backend and ./frontend.

## Run in docker

To run the project in your machine, use docker (Docker 20.10.18):

```
git clone https://github.com/pavildon/shortener
cd shortener

# it will take a while (it runs the tests)
docker build -t shortener .

# the frontend is going to be in the port 8080 and the backend in port 3001
docker run -it --rm shortener
```
## Rest API

To hit the rest API assuming docker has the ip http://172.17.0.2 using httpie:
```
# put an URL
$ http put "http://172.17.0.2:3001/" url="https://google.com"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 66
Content-Type: application/json; charset=utf-8
Date: Tue, 08 Nov 2022 20:49:42 GMT
ETag: W/"42-j/HUfY/FgSHLNIpEbhkb88PlyBQ"
Keep-Alive: timeout=5
X-Powered-By: Express

{
    "_id": "k3qga3vo",
    "delete_key": "zpvi3ddny6fwwu7f791e15bghqka8jx6"
}

# get the url
$ http get "http://172.17.0.2:3001/k3qga3vo"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 28
Content-Type: application/json; charset=utf-8
Date: Tue, 08 Nov 2022 20:51:06 GMT
ETag: W/"1c-Mw08iNt2+VPN6IPU0lPbCMvnOKc"
Keep-Alive: timeout=5
X-Powered-By: Express

{
    "url": "https://google.com"
}

# get a list of the urls (ordered internally by date)
http get "http://172.17.0.2:3001/?skip=0&limit=100"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 67
Content-Type: application/json; charset=utf-8
Date: Tue, 08 Nov 2022 20:52:16 GMT
ETag: W/"43-XhwlUhckKSi6Rf6gZE68c/nj4O0"
Keep-Alive: timeout=5
X-Powered-By: Express

{
    "items": [
        {
            "_id": "k3qga3vo",
            "url": "https://google.com"
        }
    ],
    "total": 1
}

# delete the url
$ http delete "http://172.17.0.2:3001/k3qga3vo?delete_key=zpvi3ddny6fwwu7f791e15bghqka8jx6"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 2
Content-Type: application/json; charset=utf-8
Date: Tue, 08 Nov 2022 20:54:36 GMT
ETag: W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"
Keep-Alive: timeout=5
X-Powered-By: Express

{}

```

### Notes

frontend tested on chromium (104.0.5112.101) and firefox (104.0.1)
backend nixos 22.05, alpine 3.16 and ubuntu:20.04
