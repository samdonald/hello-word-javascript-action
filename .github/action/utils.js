export const removeSpaces = text => text.replace(/ {2,}/gm, "");

export const stribEmptyLines = text => text.replace(/^\s*[\r\n]/gm, "");

export const platformSupport = text => platform => text.replace(/\s/g, "").indexOf(`[x]${platform}`) !== -1;

export const capitalise = text => {
  return text.toLowerCase().replace(
    /(?:^|\s|["'([{}])])+\S/g, 
    match => match.toUpperCase()
  );
};


export function stripComments(text) {
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
