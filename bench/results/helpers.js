
export const colors = {
  vanillajs: '#FFDD57',
  sinuous: '#70EDAC',
  solid: '#481B82',
  surplus: '#C559D4',
  react: '#61DAFB',
  mikado: '#59ABE9',
  stage0: '#374838',
  domc: '#704B38',
  inferno: '#E41E1D',
  wasm: '#644FF0',
  fidan: '#2B7489'
};

export function getId(lib) {
  // krausest/js-framework-benchmark uses `framework`.
  return lib.id || lib.framework;
}

export function getName(lib) {
  return getId(lib).split('-')[0];
}
