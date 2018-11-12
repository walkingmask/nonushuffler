FROM python:3.6-alpine

LABEL maintainer="walkingmask <walkingmask.jp@gmail.com>"
LABEL description="local environment for development"

ADD app /app
WORKDIR /app

RUN pip install --no-cache-dir -r requirements.txt
