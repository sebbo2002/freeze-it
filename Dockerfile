FROM node:alpine
RUN mkdir -p "/app"

WORKDIR "/app"
ADD "." "/app"
RUN npm ci && \
    npm run build

CMD [ "npm", "run", "start" ]