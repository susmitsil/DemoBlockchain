FROM node:4.6

RUN mkdir /mapps

RUN mkdir /mapps/mychain

ADD package.json /mapps/mychain/

ADD main.js /mapps/mychain/

RUN cd /mapps/mychain && npm install

EXPOSE 9001

EXPOSE 5001

ENTRYPOINT cd /mapps/mychain && npm install && CHAIN_PEERS=$CHAIN_PEERS npm start