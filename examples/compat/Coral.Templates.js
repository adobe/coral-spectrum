/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

window["Coral"] = window["Coral"] || {};
window["Coral"]["templates"] = window["Coral"]["templates"] || {};
window["Coral"]["templates"]["Element"] = window["Coral"]["templates"]["Element"] || {};
window["Coral"]["templates"]["Element"]["base"] = (function anonymous(data_0
                                                                     /**/) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = this["slider"] = document.createElement("div");
  el0.setAttribute("handle", "slider");
  el0.className += " _coral-Drawer-slider";
  var el1 = document.createTextNode("\n  ");
  el0.appendChild(el1);
  var el2 = this["contentWrapper"] = document.createElement("div");
  el2.setAttribute("handle", "contentWrapper");
  el2.className += " _coral-Drawer-content";
  el0.appendChild(el2);
  var el3 = document.createTextNode("\n");
  el0.appendChild(el3);
  frag.appendChild(el0);
  var el4 = document.createTextNode("\n");
  frag.appendChild(el4);
  var el5 = document.createElement("div");
  el5.className += " _coral-Drawer-toggle";
  var el6 = document.createTextNode("\n  ");
  el5.appendChild(el6);
  var el7 = this["toggle"] = document.createElement("button","coral-button");
  el7.className += " _coral-Drawer-toggleButton";
  el7.setAttribute("type", "button");
  el7.setAttribute("handle", "toggle");
  el7.setAttribute("is", "coral-button");
  el7.setAttribute("variant", "minimal");
  el7.setAttribute("icon", "chevronDown");
  el7.setAttribute("iconSize", "XS");
  el7.setAttribute("aria-label", "coral-element");
  el5.appendChild(el7);
  var el8 = document.createTextNode("\n");
  el5.appendChild(el8);
  frag.appendChild(el5);
  return frag;
});
