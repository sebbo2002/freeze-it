FROM node
RUN mkdir -p "/app"

ARG UID=1099
ARG GID=1099

WORKDIR "/app"
ADD package*.json "/app/"

# Crome & CUPS Client
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y cups-client google-chrome-unstable fonts-ebgaramond fonts-ebgaramond-extra --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN npm ci
ADD "." "/app"

RUN npm run build && \
    addgroup -gid $GID app && \
    adduser -uid $UID --ingroup app --shell /bin/sh --system app

USER app
CMD [ "npm", "run", "start" ]