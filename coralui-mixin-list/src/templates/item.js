export default template; let template = (function anonymous(data_0
/*``*/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["icon"] = document.createElement("coral-icon");
  el0.setAttribute("size", "S");
  el0.className += " coral3-BasicList-item-icon";
  el0.setAttribute("handle", "icon");
  frag.appendChild(el0);
  var el1 = document.createTextNode("\n");
  frag.appendChild(el1);
  var el2 = this["outerContainer"] = document.createElement("div");
  el2.className += " coral3-BasicList-item-outerContainer";
  el2.setAttribute("handle", "outerContainer");
  var el3 = document.createTextNode("\n  ");
  el2.appendChild(el3);
  var el4 = this["contentContainer"] = document.createElement("div");
  el4.className += " coral3-BasicList-item-contentContainer";
  el4.setAttribute("handle", "contentContainer");
  el2.appendChild(el4);
  var el5 = document.createTextNode("\n");
  el2.appendChild(el5);
  frag.appendChild(el2);
  return frag;
});