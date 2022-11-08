FROM ubuntu:focal as builder
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - &&\
      apt-get update && apt-get install -y \
      nodejs \
      && rm -rf /var/lib/apt/lists/*

COPY ./backend /backend
COPY ./frontend /frontend

WORKDIR /backend
RUN npm install && npm test && npm run build

WORKDIR /frontend
RUN npm install && CI=true npm run test

FROM ubuntu:focal
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  gnupg \
  && rm -rf /var/lib/apt/lists/*

RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - &&\
      apt-get update && apt-get install -y \
      nodejs \
      mongodb-org \
      && rm -rf /var/lib/apt/lists/*

COPY ./mongo-init.js /
COPY ./entry.sh /
COPY ./frontend /frontend

RUN mkdir /var/mongodb
RUN chmod +x /entry.sh

COPY --from=builder /backend/dist ./backend


RUN npm install --global http-server

WORKDIR /
ENTRYPOINT ["./entry.sh"]

