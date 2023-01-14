export interface ComponentMapping {
  [k: string]: ComponentDocLocation;
}

export interface ComponentDocLocation {
  docAlias?: string; // by default use lower case component name
  anchorBeforeProps: string | string[];
  methods: string[];
}

export { antdComponentMapV4 } from '../versions/react/v4';
export { antdComponentMapV5 } from '../versions/react/v5';
