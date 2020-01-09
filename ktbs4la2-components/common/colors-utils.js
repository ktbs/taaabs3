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

export {getDistinctColor};