import path from 'path';
import { ResourceVersion } from '../types';

export const STORAGE = {
  /**
   * Path of downloaded .md files and composed definition JSON
   */
  resourcePath: path.resolve(__dirname, '../resource/react'),
  /**
   * Decorate path with version prefix
   */
  versioned(raw: string, version: ResourceVersion) {
    return `${raw}${version.toUpperCase()}`;
  },
  /**
   * Path of downloaded .md files
   */
  getMarkdownPath(
    componentName: string,
    fileName: string,
    version: ResourceVersion
  ) {
    return path.join(
      STORAGE.resourcePath,
      `/${version}/md/${componentName}/${fileName}`
    );
  },
  /**
   * Path of dist file -- definition-{lang}.json, will be used for hover on props
   */
  getDefinitionPath(version: ResourceVersion) {
    return path.join(STORAGE.resourcePath, `/${version}/definition.json`);
  },
  /**
   * Path of dist file -- raw-table-{lang}.json, will be used for hover on component
   */
  getRawDefinitionPath(version: ResourceVersion) {
    return path.join(STORAGE.resourcePath, `/${version}/raw-table.json`);
  },
};
