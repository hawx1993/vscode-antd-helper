import fs from 'fs';
import { remove } from 'fs-extra';
import path from 'path';
import { STORAGE } from './storage';
import { ResourceVersion } from '../types';
import { promisify } from 'util';
import { ANTD_REACT_GITHUB, ANTD_MAP_VERSION } from './constants';
import { buildShaMap, downloadByShaMap } from './fetchDocs';
import { DefinitionBuilder } from './buildDocJson';

const pWriteFile = promisify(fs.writeFile);

async function buildVersionResource(
  version: ResourceVersion,
  download: boolean
) {
  try {
    if (download) {
      const shaMap = await buildShaMap();
      console.log('shaMap', shaMap);
      await Promise.all(downloadByShaMap(shaMap, version));
    }
    const builder = new DefinitionBuilder(version, ANTD_MAP_VERSION[version]);
    const enEmit = builder.emitJson('en');
    const zhEmit = builder.emitJson('zh');
    const [
      { propDefJson: enPropDefJson, rawTableJson: enRawTableJson },
      { propDefJson: zhPropDefJson, rawTableJson: zhRawTableJson },
    ] = await Promise.all([enEmit, zhEmit]);
    const definitionPath = path.resolve(
      __dirname,
      STORAGE.getDefinitionPath(version)
    );
    const getRawDefinitionPath = path.resolve(
      __dirname,
      STORAGE.getRawDefinitionPath(version)
    );
    const prettifyRawDefinition = JSON.stringify(
      {
        zh: zhRawTableJson,
        en: enRawTableJson,
      },
      null,
      2
    );
    const prettifyDefinition = JSON.stringify(
      {
        zh: zhPropDefJson,
        en: enPropDefJson,
      },
      null,
      2
    );
    pWriteFile(definitionPath, prettifyDefinition, 'utf8');
    pWriteFile(getRawDefinitionPath, prettifyRawDefinition, 'utf8');
  } catch (e) {
    console.error(e.message);
  }
}

/**
 * Clean downloaded Markdown files or JSON.
 *
 * @param {(('markdown' | 'json')[])} scope where to clean
 */
async function clean(scope: ('markdown' | 'json')[]) {
  if (scope.includes('markdown')) {
    await remove(STORAGE.resourcePath);
  }

  if (scope.includes('json')) {
    await remove(STORAGE.getDefinitionPath('v4'));
    await remove(STORAGE.getRawDefinitionPath('v4'));
  }
}

/**
 * Download docs and parse it to ast if argument set to true
 */
async function buildResource({
  v4,
  v5,
  download,
}: Record<'v4' | 'v5' | 'download', boolean>) {
  clean(download ? ['markdown', 'json'] : ['json']);
  console.log('resource cleaned');

  if (v4) {
    console.log('start fetching v4');
    await buildVersionResource('v4', download);
  }
  if (v5) {
    await buildVersionResource('v5', download);
  }
}

/**
 * 🚀
 */
buildResource({
  v4: true,
  v5: true,
  download: process.env.DOWNLOAD === 'true',
});
