var fs = require('fs'),
    system = require('system');

var iconFolder = system.args[1] || fs.workingDirectory + fs.separator + 'icons' + fs.separator,
    outCssFolder = system.args[2] || fs.workingDirectory + fs.separator + 'out' + fs.separator,
    outFontFolder = system.args[3] || fs.workingDirectory + fs.separator + 'out' + fs.separator,
    resFolder = system.args[4] || fs.workingDirectory + fs.separator + 'res' + fs.separator;



var commentRE = /<!--.*?-->\n?/g, // Regex to replace comments added by Illustrator
    badCSSCharsRE = /[^\w-]/g,
    svgRE = /\.svg$/i,
    opacityRE = / opacity="[.\d]+"/ig,
    svgTagRE = /<svg/i,
    backgroundRE = / enable-background="new[ ]*"/ig,
    newlineRE = /(\r\n|\n|\r)/g,
    layerNameRE = / id="Layer_\d+"/i,
    zeroPXRE = /0px/g,
    psuedoSelector = ':before',
    classPrefix = 'icon-';

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

if (!fs.exists(outCssFolder)) {
    fs.makeDirectory(outCssFolder);    
}
if (!fs.exists(outFontFolder)) {
    fs.makeDirectory(outFontFolder);    
}

if (fs.exists(outFontFolder + 'AdobeIcons.svg')) {
    fs.remove(outFontFolder + 'AdobeIcons.svg');    
}
if (fs.exists(outCssFolder + 'AdobeIcons.css')) {
    fs.remove(outCssFolder + 'AdobeIcons.css');    
}

fs.write(outFontFolder + 'AdobeIcons.svg', font, 'w');
fs.copy(resFolder + 'template.css', outCssFolder + 'AdobeIcons.css');
fs.write(outCssFolder + 'AdobeIcons.css', cssOutput, 'a');

phantom.exit();