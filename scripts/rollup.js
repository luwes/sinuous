import minimist from 'minimist';
import { bundles, bundleNames } from './bundles.js';
const argv = minimist(process.argv.slice(2));

const requestedBundleNames
  = argv.name
    ? argv.name
      .split(',')
      .map(name => name.trim())
    : [];
const requestedBundleTypes
  = argv.type
    ? argv.type
      .split(',')
      .map(type => type.trim())
    : [];

const allBundles = bundles.filter(({ output: { format } }, index) => {
  const name = bundleNames[index];
  if (requestedBundleNames.length > 0 && !requestedBundleNames.includes(name))
    return false;
  if (requestedBundleTypes.length > 0 && !requestedBundleTypes.includes(format))
    return false;

  return true;
});

export default allBundles;
