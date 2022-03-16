export const rem = (px, root?, type?) => ( px.toString().replace(/px/g,'') / (root || 16) ) + (type || 'rem');

export const em = (px, root?) => rem(px, (root || null), 'em');
