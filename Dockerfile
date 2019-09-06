FROM node
RUN mkdir -p "/app"

ARG UID=1099
ARG GID=1099

WORKDIR "/app"
ADD "." "/app"

# Crome & CUPS Client
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y cups-client google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg \
        fonts-kacst fonts-freefont-ttf --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN npm ci && \
    npm run build && \
    addgroup -gid $GID app && \
    adduser -uid $UID --ingroup app --shell /bin/sh app

USER app
CMD [ "npm", "run", "start" ]