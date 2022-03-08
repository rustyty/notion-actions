const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require("@notionhq/client")

async function run() {

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  // Initializing a client
  const notion = new Client({
    auth: NOTION_TOKEN,
  })
  console.log('Hello, world!');
  const databaseId = 'd79598c718644e939f8b5e13d0dca4c9';
  const listUsersResponse = await notion.users.list({});
  console.log(listUsersResponse)
  const ddd = await notion.databases.retrieve({ database_id: databaseId })
  console.log(ddd);
  const response = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      'Name': {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: 'Tomatoes',
            },
          },
        ],
      },
    },
  });
  console.log(response);
}

run();