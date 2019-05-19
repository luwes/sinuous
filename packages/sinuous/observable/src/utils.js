export function safePush(arr, item) {
  if (item && arr.indexOf(item) === -1) {
    arr.push(item);
  }
}
