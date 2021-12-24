# Webhooks

This is a simple Serverless project to get data from the Gitlab and GitHub APIs and store it in a DynamoDB tables.

The goal of the project is to create a "history" of my career. Check how many commits I've created, how many pipelines I've run, and how much time I've invested.

Also, I want to get the commits and information from those webhooks and send it to some Discord/Slack channels.

## Installation

This project is running under the [Serverless Stack](https://www.serverless-stack.com/) framework (❤️) with it's amazing live Lambda development. It means you don't need to bother about setting up anything like DynamoDB or NGROK in your local environment. It's everything running under AWS :D.

To run it, you need an AWS account though. After cloning the repo, you can:

```
npm i

cp .env.example .env

# export your AWS credentials to the terminal

npm run start

# do the following steps according to Serverless Stack
```

Obs. You need to setup the variables at the `.env` file you've created - specially the `DISCORD_WEBHOOK` variable.
