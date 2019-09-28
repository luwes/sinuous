export const colors = {
  vanillajs: '#FFDD57',
  sinuous: '#70EDAC',
  solid: '#481B82',
  surplus: '#C559D4',
  ivi: '#FF3800',
  stage0: '#374838',
  domc: '#704B38',
  hyperapp: '#037FFF',
  preact: '#673AB8',
  react: '#61DAFB',
  mikado: '#59ABE9',
  inferno: '#E41E1D',
  wasm: '#644FF0',
  fidan: '#2B7489',
  vue: '#40B883',
  angular: '#A6130C',
  ember: '#E04E39',
  svelte: '#FF3E00',
  lit: '#FF6C6A',
  mithril: '#1E5799',
  sifrr: '#364F6B'
};

export const defaultBenchmarks = [
  '01_run1k',
  '02_replace1k',
  '03_update10th1k_x16',
  '04_select1k',
  '05_swap1k',
  '06_remove-one-1k',
  '07_create10k',
  '08_create1k-after1k_x2',
  '09_clear1k_x8',
  '21_ready-memory',
  '22_run-memory',
  '23_update5-memory',
  '24_run5-memory',
  '25_run-clear-memory',
  '31_startup-ci',
  '32_startup-bt',
  '34_startup-totalbytes'
];

export function getId(lib) {
  // krausest/js-framework-benchmark uses `framework`.
  return lib.id || lib.framework;
}

export function getName(lib) {
  return getId(lib).split('-')[0];
}
