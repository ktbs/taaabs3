/**
 * Converts a valid HTML/CSS color name to it's hexadecimal code
 * @param string colorName the color name to convert
 * @return string the hexadecimal code for the color, or null if the provided color name is not valid
 */
function colorNameToHex(colorName) {
    let colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
                    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
                    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
                    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
                    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
                    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
                    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
                    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
                    "honeydew":"#f0fff0","hotpink":"#ff69b4",
                    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
                    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
                    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
                    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
                    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
                    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
                    "navajowhite":"#ffdead","navy":"#000080",
                    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
                    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
                    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
                    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
                    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
                    "violet":"#ee82ee",
                    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
                    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if(colors[colorName.toLowerCase()])
        return colors[colorName.toLowerCase()];
    else
        return null;
}

/**
 * Estimates if a color is rather light or dark
 * @param string color the color to estimate
 * @return string 'light' or 'dark'
 */
function lightOrDark(color) {
    // Variables for red, green, blue values
    let r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if(color.match(/^rgb/)) {
        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        if(colorNameToHex(color))
            color = colorNameToHex(color);

        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(0.299 * (r * r) +
                    0.587 * (g * g) +
                    0.114 * (b * b));

    // Using the HSP value, determine whether the color is light or dark
    if(hsp > 127.5)
        return 'light';
    else
        return 'dark';
}


/**
 * Converts a HSV (Hue/Saturation/Value) color
 * @param int h Hue
 * @param int s Saturation
 * @param int v Value
 * @return An array containing the three values for R,G & B
 */
function hsvToRgb(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;
    
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;
    
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
    
        case 1:
            r = q;
            g = v;
            b = p;
            break;
    
        case 2:
            r = p;
            g = v;
            b = t;
            break;
    
        case 3:
            r = p;
            g = q;
            b = v;
            break;
    
        case 4:
            r = t;
            g = p;
            b = v;
            break;
    
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB-coded color to a HTML/CSS hexadecimal code
 * @param int r Red
 * @param int g Green
 * @param int b Blue
 * @return string The hexadecimal code for the color
 */
function rgb2hex(r, g, b) {
    let rgb = [r.toString(16), g.toString(16), b.toString(16)];

    for (let i = 0; i < 3; i++)
        if (rgb[i].length==1)
        rgb[i]=rgb[i]+rgb[i];
    
    if(rgb[0][0]==rgb[0][1] && rgb[1][0]==rgb[1][1] && rgb[2][0]==rgb[2][1])
        return '#'+rgb[0][0]+rgb[1][0]+rgb[2][0];

    return '#'+rgb[0]+rgb[1]+rgb[2];
}

/**
 * Generates a color from a palette with a known number of colors, so that each color of the palette is easily distinctive as possible from the others
 * @param int colorRank The position of the desired color within the palette
 * @param int totalColorCount The total number of colors in the palette
 * @return string An HTML/CSS hexadecimal color code
 */
function getDistinctColor(colorRank, totalColorCount) {
    let rgbColor;

    if(totalColorCount > 1) {
        let hueCoef = 360 / (totalColorCount - 1); // distribute the colors evenly on the hue range
        rgbColor = hsvToRgb(hueCoef * colorRank, 80 , 80);
    }
    else
        rgbColor = hsvToRgb(0, 80 , 80);

    let colorCode = rgb2hex(rgbColor[0], rgbColor[1], rgbColor[2]);
    return colorCode;
}

export {getDistinctColor, lightOrDark, colorNameToHex};