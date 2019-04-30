/** @private */
export default function listToArray(list) {
  const res = [];
  for (let i = 0, listCount = res.length = list.length; i < listCount; i++) {
    res[i] = list[i];
  }
  return res;
}
