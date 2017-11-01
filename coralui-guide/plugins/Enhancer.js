const fs = require('fs');

class Enhancer {
  onHandleDocs(ev) {
    for (const doc of ev.data.docs) {
      
      if (doc.description && doc.description.indexOf('\n\nnull') !== -1) {
        doc.description = doc.description.replace('\n\nnull', '');
      }
      
      if (doc.extends && doc.extends.length > 1) {
        const extendArr = doc.extends.slice();
        const buildExpression = () => extendArr.length === 1 ? extendArr.pop() : extendArr.pop() + '(' + buildExpression() + ')';
        doc.expressionExtends = buildExpression();
      }
      
      if (doc.unknown) {
        let isEnhanced = [];
        let baseTag;
        
        doc.unknown.forEach((item) => {
          if (item.tagName === '@class') {
            doc.examples = doc.examples || [];
            doc.examples.unshift('<caption>JS constructor</caption>\nnew '+ item.tagValue +'();');
          }
          
          if (item.tagName === '@htmlbasetag') {
            baseTag = item.tagValue;
          }
          
          if (item.tagName === '@htmltag') {
            doc.examples = doc.examples || [];
            const markup = baseTag ? `<${baseTag} is="${item.tagValue}"></${baseTag}>` : `<${item.tagValue}></${item.tagValue}>`;
            doc.examples.unshift(`<caption>Markup</caption>\n${markup}`);
            baseTag = null;
          }
          
          if (item.tagName === '@classdesc') {
            doc.description = item.tagValue;
          }
          
          if (item.tagName === '@readonly') {
            isEnhanced.push('<code>read-only</code>');
          }
          
          if (item.tagName === '@htmlattributereflected') {
            isEnhanced.push('<code>reflected</code>');
          }
          
          if (item.tagName === '@default') {
            isEnhanced.push('<code>'+ item.tagValue +'</code> by default.');
          }
          
          if (item.tagName === '@contentzone') {
            isEnhanced.push('<code>content-zone</code>');
          }
        });
        
        if (isEnhanced.length) {
          doc.description = doc.description + '\n<ul><li>'+ isEnhanced.join('</li><li>') +'</li></ul>';
        }
      }
      
      if (doc.importStyle && doc.importStyle.indexOf('{') === -1) {
        doc.importStyle = `{${doc.importStyle}}`;
      }
    }
  }
}

module.exports = new Enhancer();
