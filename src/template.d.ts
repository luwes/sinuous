export function t(key: string): () => string;
export function o(key: string): () => string;

interface CloneFunction {
  (props: Record<string, any>): Node;
}

export function template(elementRef: () => Node): CloneFunction;

interface FillFunction {
  (props: Record<string, any>): Node;
}

export function fill(elementRef: () => Node): FillFunction;
