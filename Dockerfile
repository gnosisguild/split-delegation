FROM node:20.16-alpine3.19

ADD crontab /etc/crontabs/root
RUN chmod 0644 /etc/crontabs/root
RUN touch /var/log/cron.log

# Set up work directory
WORKDIR /app

ADD . .
RUN cd packages/api && yarn install

CMD ["crond", "&&", "tail", "-f", "/var/log/cron.log"]
