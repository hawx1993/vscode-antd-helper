import { antdComponentMapV4, antdComponentMapV5 } from './componentsMap';

const ANTD_REACT_GITHUB = {
  OWNER_NAME: 'ant-design',
  REPO_NAME: 'ant-design',
  V4_TAG: '4.24.7',
  V5_TAG: '5.1.4',
  EN_MD_NAME: 'index.en-US.md',
  ZH_MD_NAME: 'index.zh-CN.md',
} as const;

const ANTD_MAP_VERSION = {
  v4: antdComponentMapV4,
  v5: antdComponentMapV5,
};

/**
 * These folders are not exported component
 */
const IGNORED_FOLDERS: string[] = [
  '__tests__',
  '_util',
  'locale',
  'style',
  'version',
  'col',
  'row',
  'locale-provider',
];

export { ANTD_REACT_GITHUB, ANTD_MAP_VERSION, IGNORED_FOLDERS };
