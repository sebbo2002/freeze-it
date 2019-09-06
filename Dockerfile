FROM node:alpine
RUN mkdir -p "/app"

WORKDIR "/app"
ADD "." "/app"
RUN apk update && \
    apk add \
        bash \
        git \
        libstdc++ \
        python \
        make \
        gcc \
        g++ && \
    npm ci && \
    npm run build

CMD [ "npm", "run", "start" ]