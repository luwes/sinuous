export const ESM = 'esm';
export const UMD = 'umd';

export const bundleFormats = {
  ESM,
  UMD
};

export const bundles = [
  {
    formats: [ESM, UMD],
    global: 'sinuous',
    name: 'sinuous',
    input: 'packages/sinuous/src/index.js'
  }
];

export const fixtures = [
];
