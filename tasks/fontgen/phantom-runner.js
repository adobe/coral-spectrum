var fs = require('fs');
var system = require('system');

// Source
var iconFolder = system.args[1] || fs.workingDirectory + fs.separator + 'icons' + fs.separator;

// Dest
var outCssFolder = system.args[2] || fs.workingDirectory + fs.separator + 'out' + fs.separator;
var cssName = system.args[3] || 'iconClasses.less';
var outFontFolder = system.args[4] || fs.workingDirectory + fs.separator + 'out' + fs.separator;
var fontName = system.args[5] || 'Icons';
var classPrefix = system.args[6] || 'icon-';

// Cached regular expressions
var commentRE = /<!--.*?-->\n?/g; // Regex to replace comments added by Illustrator
var badCSSCharsRE = /[^\w-]/g;
var svgRE = /\.svg$/i;
var opacityRE = / opacity="[.\d]+"/ig;
var svgTagRE = /<svg/i;
var backgroundRE = / enable-background="new[ ]*"/ig;
var newlineRE = /(\r\n|\n|\r)/g;
var layerNameRE = / id="Layer_\d+"/i;
var zeroPXRE = /0px/g;
var psuedoSelector = ':before';

// SVG font generator
phantom.injectJs('FontBoost.js');

function getCSSClassFromFileName(input) { // Basic filename transform function
    // Remove path
    input = input.slice(input.lastIndexOf('/')+1);

    // Remove extension
    input = input.replace(svgRE, '');

    // Lowercase filename
    input = input.toLowerCase();

    return input;
}

function sanitizeCSSClass(input) { // Remove any chars that could break the CSS classname
    return input.replace(badCSSCharsRE, '');
}

function decimalToHex(d) { // returns the unicode hex
	var hex = Number(d).toString(16);
	hex = "000".substr(0, 3 - hex.length) + hex; 
	return hex;
}

// loop through files and folders
var files = {},
    cssOutput = '';
    curdir = fs.list(iconFolder);

for(var i = 0; i < curdir.length; i++)
{
    var fullpath = iconFolder + curdir[i];
    // check if item is a file
    if(fs.isFile(fullpath))
    {
        // check that file is html
        if(fullpath.indexOf('.svg') != -1)
        {
        	// get content
        	var file = fs.read(fullpath),
                hex = decimalToHex(i),
                unicode = '&#xf' + hex + ';',
                className = sanitizeCSSClass(getCSSClassFromFileName(fullpath));

            // Strip comments
            file = file.replace(commentRE, '');
            // Remove opacity
            file = file.replace(opacityRE, '');
            // Remove background tag
            file = file.replace(backgroundRE, '');
            // Remove newlines
            file = file.replace(newlineRE, '');
            // Remove/normalize arbitrary layer names
            file = file.replace(layerNameRE, ' id="icon"');
            // Make zero unitless
            file = file.replace(zeroPXRE, '0');

            cssOutput += '.' + classPrefix + className + psuedoSelector + ' { content: "\\f' + hex + '"; }\n';

        	// content to DOM Element
            var div = document.createElement('div');
        	div.innerHTML = file;

        	files[unicode] = {
        		elem: div.getElementsByTagName('svg')[0],
        		name: className
        	}
        }
    }
}

var font = new FontBoost('AdobeIcons', files).build();

var fontPath = outFontFolder + fontName + '.svg';
var cssPath = outCssFolder + cssName;

if (!fs.exists(outCssFolder))
    fs.makeDirectory(outCssFolder);
    
if (!fs.exists(outFontFolder))
    fs.makeDirectory(outFontFolder);

if (fs.exists(fontPath))
    fs.remove(fontPath);

if (fs.exists(cssPath))
    fs.remove(cssPath);

console.log('Writing font to '+fontPath);

console.log('Writing CSS to '+cssPath);

fs.write(fontPath, font, 'w');

fs.write(cssPath, cssOutput, 'w');

phantom.exit();