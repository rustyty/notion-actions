const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require("@notionhq/client")
const { Octokit } = require("octokit");

const _ = require("lodash")

const {
  SNIPPET_ENDPOINT,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
  NOTION_TOKEN,
} = process.env;

const OPERATION_BATCH_SIZE = 10

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const databaseId = 'd79598c718644e939f8b5e13d0dca4c9';

const [owner, repo] = GITHUB_REPOSITORY.split("/");
const repoInfo = { owner, repo };
const notion = new Client({
  auth: NOTION_TOKEN,
})

const gitHubPRsIDToNotionPageId = {}

async function run() {

  // Initializing a client

  console.log('Hello, world!');

  await syncPRNotionDatabaseWithGitHub()

}
run();


function getPropertiesFromPR(PR) {
  const { title, number, state, html_url, created_at } = PR
  return {
    Name: {
      title: [{ type: "text", text: { content: title } }],
    },
    "#": {
      number,
    },
    State: {
      select: { name: state },
    },
    "URL": {
      url: html_url,
    },
    "Date": {
      date: { start: created_at }
    }
  }
}


async function syncPRNotionDatabaseWithGitHub() {
  // Get all PRs currently in the provided GitHub repository.
  await setInitialGitHubToNotionIdMap();
  console.log("\nFetching PRs from Notion DB...")
  const PRs = await getPullRequest()
  console.log(`Fetched ${PRs.length} PRs from GitHub repository.`)

  // Group PRs into those that need to be created or updated in the Notion database.
  const { pagesToCreate, pagesToUpdate } = getNotionPRs(PRs)

  // Create pages for new PRs.
  console.log(`\n${pagesToCreate.length} new PRs to add to Notion.`)
  await createPages(pagesToCreate)

  // Updates pages for existing PRs.
  console.log(`\n${pagesToUpdate.length} PRs to update in Notion.`)
  await updatePages(pagesToUpdate)

  // Success!
  console.log("\n✅ Notion database is synced with GitHub.")
}

function getNotionPRs(PRs) {
  const pagesToCreate = []
  const pagesToUpdate = []
  for (const PR of PRs) {
    const pageId = gitHubPRsIDToNotionPageId[PR.number]
    if (pageId) {
      pagesToUpdate.push({
        ...PR,
        pageId,
      })
    } else {
      pagesToCreate.push(PR)
    }
  }
  return { pagesToCreate, pagesToUpdate }
}

async function setInitialGitHubToNotionIdMap() {
  const currentPRs = await getPRsFromNotion()
  for (const { pageId, number } of currentPRs) {
    gitHubPRsIDToNotionPageId[number] = pageId
  }
}


async function getPRsFromNotion() {
  const pages = []
  let cursor = undefined
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })
    pages.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }
  console.log(`${pages.length} PRs successfully fetched.`)
  return pages.map(page => {
    return {
      pageId: page.id,
      number: page.properties["#"].number,
    }
  })
}

async function createPages(pagesToCreate) {
  const pagesToCreateChunks = _.chunk(pagesToCreate, OPERATION_BATCH_SIZE)
  for (const pagesToCreateBatch of pagesToCreateChunks) {
    await Promise.all(
      pagesToCreateBatch.map(PR =>
        notion.pages.create({
          parent: {
            database_id: databaseId,
          },
          properties: getPropertiesFromPR(PR),
        })
      )
    )
    console.log(`Completed batch size: ${pagesToCreateBatch.length}`)
  }
}

async function updatePages(pagesToUpdate) {
  const pagesToUpdateChunks = _.chunk(pagesToUpdate, OPERATION_BATCH_SIZE)
  for (const pagesToUpdateBatch of pagesToUpdateChunks) {
    await Promise.all(
      pagesToUpdateBatch.map(({ pageId, ...PR }) =>
        notion.pages.update({
          page_id: pageId,
          properties: getPropertiesFromPR(PR),
        })
      )
    )
    console.log(`Completed batch size: ${pagesToUpdateBatch.length}`)
  }
}

async function getPullRequest() {
  const PRs = await octokit.rest.pulls.list({
    ...repoInfo,
    state: "all"
  });
  return PRs.data;
}