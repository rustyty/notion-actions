const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require("@notionhq/client")
const { Octokit } = require("octokit");

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
console.log(GITHUB_TOKEN)
const octokit = new Octokit({ auth: GITHUB_TOKEN })
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const databaseId = 'd79598c718644e939f8b5e13d0dca4c9';


async function run() {

  // Initializing a client
  const notion = new Client({
    auth: NOTION_TOKEN,
  })
  console.log('Hello, world!');

  await getPullRequest();
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

  async function getPullRequest() {
    const pr = await octokit.rest.pulls.get({});
    console.log(pr);
    return pr;
  }
}
run();