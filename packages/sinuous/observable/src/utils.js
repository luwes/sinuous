export function getChildrenDeep(children) {
  return children.reduce(
    (res, curr) => res.concat(curr, getChildrenDeep(curr._children)),
    []
  );
}
