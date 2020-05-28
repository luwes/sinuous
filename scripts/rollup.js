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

// For every type in bundle.types creates a new bundle obj.
const allBundles = bundles.filter((bundle, index) => {
  const name = bundleNames[index];
  if (requestedBundleNames.length > 0 && !requestedBundleNames.includes(name))
    return false;
  if (requestedBundleTypes.length === 0)
    return true;

  bundle.output = bundle.output.filter(
    ({ format }) => requestedBundleTypes.includes(format));
  // Are any left after filtering?
  return bundle.output.length > 0;
});

export default allBundles;
