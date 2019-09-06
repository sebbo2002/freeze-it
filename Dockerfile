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
    && apt-get install -y cups-client google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* && \

RUN npm ci && \
    npm run build && \
    addgroup -gid $GID app && \
    adduser -uid $UID --ingroup app --shell /bin/sh --system app && \
    wget -o "/usr/local/share/fonts/American Typewriter Regular.ttf" "https://d.sebbo.net/American-Typewriter-Regular-v0fBkA9aF161dFukjnTwK2JoiCzfUTKcDuIZpALZAjAZp52tmX8QB4oukV02tDcymLDEy7OJCyYiRqnb7myr8LQHvAGv5ibTK9mY.ttf"

USER app
CMD [ "npm", "run", "start" ]