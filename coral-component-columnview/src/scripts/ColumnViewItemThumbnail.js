/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

/**
 @class Coral.ColumnView.Item.Thumbnail
 @classdesc ColumnView's Item thumbnail component
 @htmltag coral-columnview-item-thumbnail
 @extends {HTMLElement}
 */

class ColumnViewItemThumbnail extends HTMLElement {
  connectedCallback() {
    this.classList.add('_coral-AssetList-itemThumbnail');
  }
}

export default ColumnViewItemThumbnail;
