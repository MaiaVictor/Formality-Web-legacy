var fs = require("fs");
var md2json = require("simple-markdown").defaultBlockParse;

var mdFile = fs.readFileSync('./markdown/test-template.md', 'utf8');

/**
 *  TODO
 * - blockquote (não funcionando apropriadamente)
 * - table 
 * - footer
 * - term definition 
 */
const json2h = (node) => {
  var str = "";
  const make = (lv, node) => {

    const text = (txt) => {
      str += txt;
    };

    const line = (lv, s) => {
      str += "\n";
      for (var i = 0; i < lv; ++i) {
        str += "  ";
      }
      str += s;
    };

    if (node instanceof Array) {
      line(lv, "[");
      for (var i = 0; i < node.length; ++i) {
        make(lv + 1, node[i]);
        text(i < node.length - 1 ? "," : "");
      };
      line(lv, "]");
    } else {
      switch (node.type) {

        case "newline":
          line(lv, "h('br', {style: {'margin-top': '10px'}})");
          break;

        case "paragraph":
          line(lv, "h('p', ");
          
          // var auxTitle = 1;
          // var content = "";
          // for (var i = 0; i < node.content.length; ++i) {
          //   if (node.content[i].content.includes("#")) {
          //     var content = node.content[i].content.split("#");
          //     if (content[1] !== '') { // last use of #, has the content of the title
          //       console.log(">>> content[1] !== vazio "+i);
          //       console.log(content);
          //       console.log(content[1]);
          //       console.log(content[1].split("\n"));
          //       var hs = "h('h"+auxTitle+"', '"+content[1].split("\n")[0]+"'),";
          //       line(lv, hs);
          //       auxTitle = 1;
          //       make(lv+1, "");
          //     } else {
          //       auxTitle ++;
          //     }
          //   } else {
          //     make(lv+1, node.content);
          //   }  
          // }

          make(lv+1, node.content);
          line(lv, ")");
          break;

        case "text":
          line(lv, JSON.stringify(node.content));
          break;

        case "heading":
          line(lv, "h('h" + node.level + "',");
          make(lv + 1, node.content);
          line(lv, ")");
          break;

        case "list":
          line(lv, "h(" + (node.ordered ? "'ol'" : "'ul'") + ", {style: {'margin-left': '23px'}}, [");
          for (var i = 0; i < node.items.length; ++i) {
            line(lv+1, "h('li', ");
            make(lv+2, node.items[i]);
            line(lv+1, ")");
            text(",");
          }
          line(lv, "])");
          break;

        case "codeBlock":
          line(lv, "h('pre', [");
          line(lv+1, "h('code.bash', {style: {'font-size': '15px' }},");
          line(lv+2, JSON.stringify(node.content));
          line(lv+1, ")");
          line(lv, "])");
          break;

        case "strong":
          line(lv, "h('b', ");
          make(lv + 1, node.content);
          line(lv, ")");
          break;

        case "em": 
          line(lv, "h('i', ");
          make(lv + 1, node.content);
          line(lv, ")");
          break;

        case "blockQuote":
          line(lv, "h('blockquote', ");
          make(lv + 1, node.content);
          line(lv, ")");
          break;

        case "inlineCode":
          line(lv, "h('code', {style: {'font-size': '15px' }},'"+node.content+"')");
          break;

        case "hr":
          line(lv, "h('hr')");
          break;

        case "link":
          line(lv, "h('a', {href: '"+node.target+"'}, ");
          make(lv + 1, node.content);
          line(lv, ")");
          break;
        
        case "del": 
          line(lv, "h('del', ");
          make(lv + 1, node.content);
          line(lv, ")");
          break;
        
        case "table": 
          // console.log("======== Table ");
          // console.log(JSON.stringify(node, null, 2));
          line(lv, "h('table', [");

            // ----- Header
            line(lv + 1, "h('tr', {style: {'border': '1px solid #dddddd', 'justify-content': 'flex-start'}}, [");
            for (var i = 0; i < node.header.length; ++i) {
              line(lv + 2, "h('th', ");
                // console.log("============== Header item "+ i);
                // console.log(JSON.stringify(node.header[i], null, 2));
                make(lv + 3, node.header[i]);
              line(lv + 2, ")");
              text(",");
            }
            line(lv, "]), ");
            // ------ 

            // ------ Cells
            for (var i = 0; i < node.cells.length; ++i) {
              line(lv, "h('tr', {style: {'border': '1px solid #dddddd', 'justify-content': 'flex-start', 'flex-direction': 'column', 'color': '#123666'}}, [");
              // console.log("============== Cells item "+ i);
              // console.log(JSON.stringify(node.cells[i], null, 2));

              for (var j = 0; j < node.cells[i].length; ++j) {
                // console.log("----------");
                // console.log(JSON.stringify(node.cells[i][j], null, 2));
                line(lv + 2, "h('td', ");
                make(lv + 3, node.cells[i][j]);
                line(lv + 2, "), ");
                // text(",");
              }   
              line(lv, "]), ");
            }
           
          // ------

          line(lv, "])");
          break;

        default:
          line(lv, "h('div', 'UNKNOWN_TYPE: " + node.type + "')");
          break;
      }
    }
  };
  make(0, node);
  return str;
};

// console.log(":: MARKDOWN\n");
// console.log(markdown);
// console.log("");

// console.log(":: JSON\n");
// console.log(JSON.stringify(md2json(mdFile), null, 2));
// console.log("");

// json2h(md2json(mdFile), null, 2);
// console.log("---------------------- OUTPUT");
// console.log(json2h(md2json(mdFile), null, 2));

console.log(":>>>>>>>>>>>>>>  HYPERSCRIPT\n");
console.log(json2h(md2json(mdFile), null, 2));
console.log("");