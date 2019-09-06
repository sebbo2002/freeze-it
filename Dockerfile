FROM node
RUN mkdir -p "/app"

WORKDIR "/app"
ADD "." "/app"
RUN npm ci && \
    npm run build

# Crome & CUPS Client
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y cups-client google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg \
        fonts-kacst fonts-freefont-ttf --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

CMD [ "npm", "run", "start" ]