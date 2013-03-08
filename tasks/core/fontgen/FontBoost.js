var FontBoost = function (name, images, glyphSize) {

	var self = this,
		glyphs = {},
		descent = -48,
		ascent = glyphSize + descent,
		header = '<?xml version="1.0" standalone="no"?>\n' +
			'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >\n' +
			'<svg xmlns="http://www.w3.org/2000/svg">\n' +
			'\t<metadata></metadata>\n' + 
			'\t<defs>\n' +
				'\t\t<font id="'+ name +'" horiz-adv-x="'+ glyphSize +'" >\n' + 
					'\t\t\t<font-face units-per-em="'+ glyphSize +'" ascent="'+ ascent +'" descent="'+ descent +'" />\n' +
					'\t\t\t<missing-glyph horiz-adv-x="'+ glyphSize +'" />\n',
		footer = '\t\t</font>\n' + 
			'\t</defs>\n' + 
			'</svg>',
		Glyph = function (svg) {
			var self = this;

			function line(x1, y1, x2, y2) {
				return 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2 + 'z';
			}

			function rect(x, y, width, height) {
				var w = x + width,
					h = y + height;

				return 'M' + x + ',' + y + 'L' + w + ',' + y + 'L' + w + ',' + h + 'L' + x + ',' + h + 'z';
			}

			function polygon(points) {
				return 'M' + points + 'z';
			}

			function ellipse(cx, cy, rx, ry, l) {
				var y0 = cy - ry,
				y1 = cy + ry;

				return 'M' + cx + ',' + y0 + 'A' + [rx, ry, 0, 0, 0, cx, y1, rx, ry, 0, 0, 0, cx, y0].join(',') + 'z';
			}

			function circle (cx, cy, r) {
				return ellipse(cx, cy, r, r);
			}

			function flip(path) {
				var width = parseInt(svg.getAttribute('width'), 10),
					m = svg.createSVGMatrix(),
					segList = path.pathSegList,
					len = segList.numberOfItems,
					coord = ['', 1, 2],
					seg, 
					type, 
					pts,
					funcs = {
						M: 'createSVGPathSegMovetoAbs',
						L: 'createSVGPathSegLinetoAbs',
						H: 'createSVGPathSegLinetoHorizontalAbs',
						V: 'createSVGPathSegLinetoVerticalAbs',
						C: 'createSVGPathSegCurvetoCubicAbs',
						S: 'createSVGPathSegCurvetoCubicSmoothAbs',
						Q: 'createSVGPathSegCurvetoQuadraticAbs',
						T: 'createSVGPathSegCurvetoQuadraticSmoothAbs',
						A: 'createSVGPathSegArcAbs'
					};

				// init matrix [1, 0, 0, -1, 0, width]
				m.a = 1;
				m.b = 0;
				m.c = 0;
				m.d = -1;
				m.e = 0;
				m.f = width;

				for (var i = 0; i < len; ++i) {
					var seg = segList.getItem(i),
						type = seg.pathSegTypeAsLetter,
						pts = [];

					if(type.toUpperCase() == 'Z') { // closing path = Z
						continue;
					}

					for (var j = 0, x, y; j < coord.length; ++j) {
						x = seg['x' + coord[j]], 
						y = seg['y' + coord[j]];

						if(x !== undefined && y !== undefined) {
							var pt = { 
								x: m.a * x + m.c * y + m.e, 
								y: m.b * x + m.d * y + m.f
							};

							pts.splice(pts.length, 0, pt.x, pt.y);

							if (type == 'A') { //elliptical arc needs more parameters
								pts.push(seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag);
							}
						}
					}

					// replace item in path
					path.pathSegList.replaceItem(path[funcs[type]].apply(path, pts), i);
				}
			}

			function absolutize(path) {
				var segList = path.pathSegList,
					curx = 0, 
					cury = 0,
					d = '',
					lastEndDirective;

				var createDirective = function (cmd, start, more, end) {
					var pts = start.concat(more || [], end || []);

					return cmd + pts.join(' ');
				}
				
				for (var i = 0, len = segList.numberOfItems; i < len; ++i) {
					var seg = segList.getItem(i),
					x = seg.x || 0,
					y = seg.y || 0,
					x1 = seg.x1 || 0,
					y1 = seg.y1 || 0,
					x2 = seg.x2 || 0,
					y2 = seg.y2 || 0;
		
					var type = seg.pathSegTypeAsLetter;
					
					// check all element types
					// http://www.w3schools.com/svg/svg_path.asp
					switch (type) { 
						case 'z':
						case 'Z': // closepath (z,Z)
							d += 'z';
							break;
						case 'H': // absolute horizontal lineto (H)
							x -= curx;
						case 'h': // relative horizontal lineto (h)
							x += curx;
							curx = x;
							
							d += createDirective('L', [[x, cury]]); // convert to lineto
							break;
						case 'V': // absolute vertical lineto (V)
							y -= cury;
						case 'v': // relative vertical lineto (v)
							y += cury;
							cury = y;
							
							d += createDirective('L', [[curx, y]]); // convert to lineto
							break;
						case 'M': // absolute move (M)
						case 'L': // absolute lineto (L)
						case 'T': // absolute smooth quadratic Bézier curveto (T)
							x -= curx;
							y -= cury;
						case 'l': // relative lineto (l)
						case 'm': // relative moveto (m)
							// the move is realtive to the last end directive
							if(lastEndDirective && segList.getItem(i-1).pathSegTypeAsLetter.toUpperCase() === 'Z') {
								curx = lastEndDirective[0];
								cury = lastEndDirective[1];
							}
						case 't': // relative smooth quadratic Bézier curveto (t)
							x += curx;
							y += cury;

							curx = x;
							cury = y;

							if (type == 'm') {
								lastEndDirective = [curx, cury];
							}
							
							d += createDirective(type.toUpperCase(), [[x,y]]);
							break;
						case 'C': // absolute cubic (C)
							x -= curx; 
							x1 -= curx; 
							x2 -= curx;

							y -= cury; 
							y1 -= cury; 
							y2 -= cury;
						case 'c': // relative cubic (c)
							x += curx; 
							x1 += curx; 
							x2 += curx;

							y += cury; 
							y1 += cury; 
							y2 += cury;

							curx = x;
							cury = y;

							d += createDirective(type.toUpperCase(), [[x1,y1],[x2,y2],[x,y]]);
							break;
						case 'Q': // absolute quad (Q)
							x -= curx; 
							x1 -= curx;

							y -= cury; 
							y1 -= cury;
						case 'q': // relative quad (q) 
							x += curx; 
							x1 += curx;

							y += cury; 
							y1 += cury;

							curx = x;
							cury = y;

							d += createDirective(type.toUpperCase(), [[x1,y1],[x,y]]);
							break;
						case 'A': // absolute elliptical arc (A)
							x -= curx;
							y -= cury;
						case 'a': // relative elliptical arc (a)
							x += curx;
							y += cury;

							curx = x;
							cury = y;

							d += createDirective(type.toUpperCase(), 
									[[seg.r1,seg.r2]], 
									[seg.angle, (seg.largeArcFlag ? 1 : 0), (seg.sweepFlag ? 1 : 0)], 
									[x,y]);
							break;
						case 'S': // absolute smooth cubic (S)
							x -= curx; 
							x2 -= curx;

							y -= cury; 
							y2 -= cury;
						case 's': // relative smooth cubic (s)
							x += curx; 
							x2 += curx;

							y += cury; 
							y2 += cury;

							curx = x;
							cury = y;

							d += createDirective(type.toUpperCase(), [[x2,y2],[x,y]]);
							break;
					}
				}

				path.setAttribute('d', d);

				return path;
			}

			function normalize() {
				var data = '', 
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
					nodes = svg.getElementsByTagName('*');

				// convert objects to path
				for (var i=0, len=nodes.length; i < len; i++) {
					var e = nodes[i],
						tag = (e.tagName || '').toLowerCase();

					// skip if element is not visible anyways
					if(e.getAttribute && (e.getAttribute('fill') === 'none' ||
						e.getAttribute('fill') === 'transparent' ||
						e.getAttribute('display') === 'none' ||
						e.getAttribute('visibility') === 'none')) {
						continue;
					}

					if (tag === 'path') {
						data += e.getAttribute('d');
					} else if (tag === 'circle') {
						data += circle(+e.getAttribute('cx') || 0, +e.getAttribute('cy') || 0, +e.getAttribute('r') || 0);
					} else if (tag === 'ellipse') {
						data += ellipse(+e.getAttribute('cx') || 0, +e.getAttribute('cy') || 0, +e.getAttribute('rx') || 0, +e.getAttribute('ry') || 0);
					} else if (tag === 'polygon' || tag === 'polyline') {
						data += polygon(e.getAttribute('points'));
					} else if (tag === 'rect') {
						data += rect(+e.getAttribute('x') || 0, +e.getAttribute('y') || 0, +e.getAttribute('width') || 0, +e.getAttribute('height') || 0);
					}
				}

				// set new path
				path.setAttribute('d', data)

				// convert path to absolute directives
				absolutize(path);
				// flip with matrix (1, 0, 0, -1, 0, width)
				flip(path);

				// return path data only
				return path.getAttribute('d');
			}

			self.createGlyph = function (unicode, name) {
				return '\t\t\t<glyph unicode="' + unicode + '" d="'+ normalize() +'" glyph-name="'+ name +'" />\n';
			}

			return self;
		};

	for (c in images) {
		var glyph = new Glyph(images[c].elem);
		glyphs[c] = glyph.createGlyph(c, images[c].name);
	}

	self.build = function () {
		var font = header;
		for (var i in glyphs) {
			font += glyphs[i];
		}
		return font + footer;
	}

};