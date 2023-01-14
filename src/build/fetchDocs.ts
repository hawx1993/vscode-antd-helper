import { ensureDirSync, outputFile } from 'fs-extra';
import { Base64 } from 'js-base64';
import logSymbols from 'log-symbols';
import { Octokit } from '@octokit/rest';
import { ResourceVersion } from '../types';
import { ANTD_REACT_GITHUB, IGNORED_FOLDERS } from './constants';
import { STORAGE } from './storage';

let GITHUB_TOKEN = '';
try {
  GITHUB_TOKEN = require('./token').GITHUB_TOKEN;
} catch {
  console.info('NO GitHub token available, request frequency will be limited');
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

/**
 * @property {string} [k] component name
 */
interface IShaMap {
  [k: string]: { enSha: string; zhSha: string };
}

const findFolderENMdFile = (data) => {
  return data.find((file) => file.name === ANTD_REACT_GITHUB.EN_MD_NAME);
};
const findFolderCNMdFile = (data) => {
  return data.find((file) => file.name === ANTD_REACT_GITHUB.ZH_MD_NAME);
};

async function buildShaMap(): Promise<IShaMap> {
  const tagContentRes = await octokit.repos.getContent({
    owner: ANTD_REACT_GITHUB.OWNER_NAME,
    repo: ANTD_REACT_GITHUB.REPO_NAME,
    path: '/components',
    ref: 'master',
  });

  const contentData = tagContentRes.data;
  if (!Array.isArray(contentData)) {
    throw new Error('failed to get contents in `/components`');
  }

  const componentPaths = contentData
    .filter((c) => !IGNORED_FOLDERS.includes(c.name))
    .map((c) => c.name);

  const shaMap: IShaMap = {};
  const promises = componentPaths.map(async (name) => {
    try {
      const folderRes = await octokit.repos.getContent({
        owner: ANTD_REACT_GITHUB.OWNER_NAME,
        repo: ANTD_REACT_GITHUB.REPO_NAME,
        path: `/components/${name}`,
        ref: 'master',
      });
      if (Array.isArray(folderRes.data)) {
        shaMap[name] = {
          enSha: findFolderENMdFile(folderRes.data)!.sha,
          zhSha: findFolderCNMdFile(folderRes.data)!.sha,
        };
      }
    } catch (err) {
      console.error('buildShaMap', err.message);
    }
  });

  await Promise.all(promises);
  return shaMap;
}

async function _downloadMdFiles(args: {
  componentName: string;
  fileName: string;
  fileSha: string;
  version: ResourceVersion;
}) {
  const { componentName, fileName, fileSha, version } = args;
  try {
    const contentRes = await octokit.git.getBlob({
      owner: ANTD_REACT_GITHUB.OWNER_NAME,
      repo: ANTD_REACT_GITHUB.REPO_NAME,
      file_sha: fileSha,
    });
    ensureDirSync(STORAGE.getMarkdownPath(componentName, '', version));
    await outputFile(
      STORAGE.getMarkdownPath(componentName, fileName, version),
      Base64.decode(contentRes.data.content)
    );
    console.log(
      logSymbols.success,
      `${componentName}/${fileName} download succeed.`
    );
  } catch (e) {
    console.error(
      logSymbols.error,
      `failed to get ${componentName}/${fileName}. Error: ${e}`
    );
  }
}

/**
 * Download Markdown files by file sha
 *
 * @param shaMap An object maps component name and its Markdown files sha
 */
function downloadByShaMap(shaMap: IShaMap, version: ResourceVersion) {
  return Object.entries(shaMap).map(async ([componentName, entity]) => {
    await _downloadMdFiles({
      componentName,
      fileName: ANTD_REACT_GITHUB.EN_MD_NAME,
      fileSha: entity.enSha,
      version: version,
    });

    await _downloadMdFiles({
      componentName,
      fileName: ANTD_REACT_GITHUB.ZH_MD_NAME,
      fileSha: entity.zhSha,
      version: version,
    });
  });
}
export { downloadByShaMap, buildShaMap };
