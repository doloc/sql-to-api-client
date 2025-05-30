## Base ########################################################################
FROM 140677575285.dkr.ecr.ap-southeast-1.amazonaws.com/node:lts as base
# FROM node:lts as base

# Reduce npm log spam and colour during install within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /home/node/app
COPY --chown=node:node . /home/node/app/

ENV PATH="$PATH:$HOME/go/bin"

## Development #################################################################
FROM base as development
WORKDIR /home/node/app
RUN npm cache clean --force &&  rm -rf node_modules && rm -f package-lock.json
RUN npm install

# Expose port
EXPOSE 80
# EXPOSE 3000

# Start the app in debug mode so we can attach the debugger
CMD ["npm", "run", "start", "--", "--port", "80"]
# CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]