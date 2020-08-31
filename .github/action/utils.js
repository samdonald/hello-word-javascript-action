exports.removeSpaces = text => text.replace(/ {2,}/gm, "");

exports.stribEmptyLines = text => text.replace(/^\s*[\r\n]/gm, "");

exports.platformSupport = text => platform => text.replace(/\s/g, "").indexOf(`[x]${platform}`) !== -1;

exports.capitalise = text => {
  return text.toLowerCase().replace(
    /(?:^|\s|["'([{])+\S/g, 
    match => match.toUpperCase()
  );
};


exports.stripComments = function stripComments(text) {
  let string = text;
  const openIndex = text.indexOf("<!--");
  const closeIndex = text.indexOf("-->", openIndex);
  const hasComment = openIndex !== -1 && closeIndex !== -1;
  
  if (hasComment) {
    string = text.substring(0, openIndex) + "" + text.substring(closeIndex+3);
    return stripComments(string);
  }
  
  return string;
}
