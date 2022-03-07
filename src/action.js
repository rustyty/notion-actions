const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require("@notionhq/client")
const NOTION_TOKEN = core.getInput('NOTION_TOKEN');
// Initializing a client
const notion = new Client({
  auth: NOTION_TOKEN,
})
async function run() {
  console.log('Hello, world!');

  const databaseId = 'a973e59126804e55b92eb3d5aca39ed1';
  const response = await notion.pages.create({
    parent: {
      databaseId,
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