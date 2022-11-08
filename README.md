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
