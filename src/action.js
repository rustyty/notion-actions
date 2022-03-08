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
  const listUsersResponse = await notion.users.list({});
  console.log(listUsersResponse)
  const ddd = await notion.databases.query()
  console.log(ddd)
  const databaseId = 'a973e59126804e55b92eb3d5aca39ed1';
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