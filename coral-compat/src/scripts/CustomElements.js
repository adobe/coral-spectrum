/* eslint-disable-next-line no-empty-function */
const f = () => {};

// Mostly empty functions to avoid breaking code
if (!window.CustomElements) {
  window.CustomElements = {
    flags: {}
  };
  window.CustomElements.upgrade = f;
  window.CustomElements.upgradeAll = f;
  window.CustomElements.instanceof = (el, ins) => el instanceof ins;
  window.CustomElements.upgradeDocumentTree = f;
  window.CustomElements.upgradeSubtree = f;
  window.CustomElements.addModule = f;
  window.CustomElements.initializeModules = f;
  window.CustomElements.takeRecords = f;
  window.CustomElements.takeRecords = f;
  window.CustomElements.watchShadow = f;
}
