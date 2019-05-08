
export function safePush(arr, item) {
  if (item && arr.indexOf(item) === -1) {
    return arr.push(item);
  }
}
