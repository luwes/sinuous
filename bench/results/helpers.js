
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

export function getId(lib) {
  // krausest/js-framework-benchmark uses `framework`.
  return lib.id || lib.framework;
}

export function getName(lib) {
  return getId(lib).split('-')[0];
}
