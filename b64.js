// function encode64(input) {
// 	var output = "", i = 0, l = input.length,
// 	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
// 	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
// 	while (i < l) {
// 		chr1 = input.charCodeAt(i++);
// 		chr2 = input.charCodeAt(i++);
// 		chr3 = input.charCodeAt(i++);
// 		enc1 = chr1 >> 2;
// 		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
// 		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
// 		enc4 = chr3 & 63;
// 		if (isNaN(chr2)) enc3 = enc4 = 64;
// 		else if (isNaN(chr3)) enc4 = 64;
// 		output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
// 	}
// 	return output;
// }


function encode64(r){for(var t,c,a,h,e,A,o,n="",d=0,C=r.length,f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";d<C;)t=r.charCodeAt(d++),c=r.charCodeAt(d++),a=r.charCodeAt(d++),h=t>>2,e=(3&t)<<4|c>>4,A=(15&c)<<2|a>>6,o=63&a,isNaN(c)?A=o=64:isNaN(a)&&(o=64),n=n+f.charAt(h)+f.charAt(e)+f.charAt(A)+f.charAt(o);return n}