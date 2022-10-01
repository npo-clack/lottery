FROM node:14.19.3-alpine3.15

ENV LANG=ja_JP.UTF-8
ENV HOME=/home/node
ENV APP_HOME="$HOME/lottery"
ENV NODE_ENV=development
WORKDIR $APP_HOME

# global install curlはapiテストように入れた。
# gitはjestのwatchモードに必要
# RUN apt-get update && apt-get install -y \
#   curl \
#   git

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#global-npm-dependencies
# npmのグローバル設定
# ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
# ENV PATH=$PATH:/home/node/.npm-global/bin

# 設定ファイル系
COPY package*.json ./

RUN echo "WORKDIR is $WORKDIR . HOME is $HOME . LANG is $LANG ." && npm config list

RUN npm install
