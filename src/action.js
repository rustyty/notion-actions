const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require("@notionhq/client")
const { Octokit } = require("octokit");


const {
  SNIPPET_ENDPOINT,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
  NOTION_TOKEN,
} = process.env;


const octokit = new Octokit({ auth: GITHUB_TOKEN });
const databaseId = 'd79598c718644e939f8b5e13d0dca4c9';

const [owner, repo] = GITHUB_REPOSITORY.split("/");
const repoInfo = { owner, repo };

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
    const openPRs = await octokit.rest.pulls.list({
      ...repoInfo,
    });
    console.log(openPRs);
    return openPRs;
  }
}
run();