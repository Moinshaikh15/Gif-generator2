/*
 * NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994. See
 * "Kohonen neural networks for optimal colour quantization" in "Network:
 * Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of
 * the algorithm.
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal in
 * this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons who
 * receive copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 */

/*
 * This class handles Neural-Net quantization algorithm
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @version 0.1 AS3 implementation
 */

// NeuQuant = function() {

// 	var exports = {};
// 	var netsize = 256; /* number of colours used */

// 	/* four primes near 500 - assume no image has a length so large */
// 	/* that it is divisible by all four primes */

// 	var prime1 = 499;
// 	var prime2 = 491;
// 	var prime3 = 487;
// 	var prime4 = 503;
// 	var minpicturebytes = (3 * prime4); /* minimum size for input image */

// 	/*
// 	 * Program Skeleton ---------------- [select samplefac in range 1..30] [read
// 	 * image from input file] pic = (unsigned char*) malloc(3*width*height);
// 	 * initnet(pic,3*width*height,samplefac); learn(); unbiasnet(); [write output
// 	 * image header, using writecolourmap(f)] inxbuild(); write output image using
// 	 * inxsearch(b,g,r)
// 	 */

// 	/*
// 	 * Network Definitions -------------------
// 	 */

// 	var maxnetpos = (netsize - 1);
// 	var netbiasshift = 4; /* bias for colour values */
// 	var ncycles = 100; /* no. of learning cycles */

// 	/* defs for freq and bias */
// 	var intbiasshift = 16; /* bias for fractions */
// 	var intbias = (1 << intbiasshift);
// 	var gammashift = 10; /* gamma = 1024 */
// 	var gamma = (1 << gammashift);
// 	var betashift = 10;
// 	var beta = (intbias >> betashift); /* beta = 1/1024 */
// 	var betagamma = (intbias << (gammashift - betashift));

// 	/* defs for decreasing radius factor */
// 	var initrad = (netsize >> 3); /* for 256 cols, radius starts */
// 	var radiusbiasshift = 6; /* at 32.0 biased by 6 bits */
// 	var radiusbias = (1 << radiusbiasshift);
// 	var initradius = (initrad * radiusbias); /* and decreases by a */
// 	var radiusdec = 30; /* factor of 1/30 each cycle */

// 	/* defs for decreasing alpha factor */
// 	var alphabiasshift = 10; /* alpha starts at 1.0 */
// 	var initalpha = (1 << alphabiasshift);
// 	var alphadec; /* biased by 10 bits */

// 	/* radbias and alpharadbias used for radpower calculation */
// 	var radbiasshift = 8;
// 	var radbias = (1 << radbiasshift);
// 	var alpharadbshift = (alphabiasshift + radbiasshift);
// 	var alpharadbias = (1 << alpharadbshift);

// 	/*
// 	 * Types and Global Variables --------------------------
// 	 */

// 	var thepicture; /* the input image itself */
// 	var lengthcount; /* lengthcount = H*W*3 */
// 	var samplefac; /* sampling factor 1..30 */

// 	// typedef int pixel[4]; /* BGRc */
// 	var network; /* the network itself - [netsize][4] */
// 	var netindex = [];

// 	/* for network lookup - really 256 */
// 	var bias = [];

// 	/* bias and freq arrays for learning */
// 	var freq = [];
// 	var radpower = [];

// 	var NeuQuant = exports.NeuQuant = function NeuQuant(thepic, len, sample) {

// 		var i;
// 		var p;

// 		thepicture = thepic;
// 		lengthcount = len;
// 		samplefac = sample;

// 		network = new Array(netsize);

// 		for (i = 0; i < netsize; i++) {

// 			network[i] = new Array(4);
// 			p = network[i];
// 			p[0] = p[1] = p[2] = (i << (netbiasshift + 8)) / netsize;
// 			freq[i] = intbias / netsize; /* 1/netsize */
// 			bias[i] = 0;
// 		}
// 	};

// 	var colorMap = function colorMap() {

// 		var map = [];
// 		var index = new Array(netsize);

// 		for (var i = 0; i < netsize; i++)
// 			index[network[i][3]] = i;

// 		var k = 0;
// 		for (var l = 0; l < netsize; l++) {
// 			var j = index[l];
// 			map[k++] = (network[j][0]);
// 			map[k++] = (network[j][1]);
// 			map[k++] = (network[j][2]);
// 		}

// 		return map;
// 	};

// 	/*
// 	 * Insertion sort of network and building of netindex[0..255] (to do after
// 	 * unbias)
// 	 * -------------------------------------------------------------------------------
// 	 */

// 	var inxbuild = function inxbuild() {

// 		var i;
// 		var j;
// 		var smallpos;
// 		var smallval;
// 		var p;
// 		var q;
// 		var previouscol;
// 		var startpos;

// 		previouscol = 0;
// 		startpos = 0;
// 		for (i = 0; i < netsize; i++) {

// 			p = network[i];
// 			smallpos = i;
// 			smallval = p[1]; /* index on g */

// 			/* find smallest in i..netsize-1 */
// 			for (j = i + 1; j < netsize; j++) {

// 				q = network[j];
// 				if (q[1] < smallval) { /* index on g */
// 					smallpos = j;
// 					smallval = q[1]; /* index on g */
// 				}
// 			}
// 			q = network[smallpos];

// 			/* swap p (i) and q (smallpos) entries */
// 			if (i != smallpos) {
// 				j = q[0];
// 				q[0] = p[0];
// 				p[0] = j;
// 				j = q[1];
// 				q[1] = p[1];
// 				p[1] = j;
// 				j = q[2];
// 				q[2] = p[2];
// 				p[2] = j;
// 				j = q[3];
// 				q[3] = p[3];
// 				p[3] = j;
// 			}

// 			/* smallval entry is now in position i */

// 			if (smallval != previouscol) {

// 				netindex[previouscol] = (startpos + i) >> 1;

// 				for (j = previouscol + 1; j < smallval; j++) netindex[j] = i;

// 				previouscol = smallval;
// 				startpos = i;
// 			}
// 		}

// 		netindex[previouscol] = (startpos + maxnetpos) >> 1;
// 		for (j = previouscol + 1; j < 256; j++) netindex[j] = maxnetpos; /* really 256 */
// 	};

// 	/*
// 	 * Main Learning Loop ------------------
// 	 */

// 	var learn = function learn() {

// 		var i;
// 		var j;
// 		var b;
// 		var g;
// 		var r;
// 		var radius;
// 		var rad;
// 		var alpha;
// 		var step;
// 		var delta;
// 		var samplepixels;
// 		var p;
// 		var pix;
// 		var lim;

// 		if (lengthcount < minpicturebytes) samplefac = 1;

// 		alphadec = 30 + ((samplefac - 1) / 3);
// 		p = thepicture;
// 		pix = 0;
// 		lim = lengthcount;
// 		samplepixels = lengthcount / (3 * samplefac);
// 		delta = (samplepixels / ncycles) | 0;
// 		alpha = initalpha;
// 		radius = initradius;

// 		rad = radius >> radiusbiasshift;
// 		if (rad <= 1) rad = 0;

// 		for (i = 0; i < rad; i++) radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));

// 		if (lengthcount < minpicturebytes) step = 3;

// 		else if ((lengthcount % prime1) !== 0) step = 3 * prime1;

// 		else {

// 			if ((lengthcount % prime2) !== 0) step = 3 * prime2;
// 			else {
// 				if ((lengthcount % prime3) !== 0) step = 3 * prime3;
// 				else step = 3 * prime4;
// 			}
// 		}

// 		i = 0;
// 		while (i < samplepixels) {

// 			b = (p[pix + 0] & 0xff) << netbiasshift;
// 			g = (p[pix + 1] & 0xff) << netbiasshift;
// 			r = (p[pix + 2] & 0xff) << netbiasshift;
// 			j = contest(b, g, r);

// 			altersingle(alpha, j, b, g, r);
// 			if (rad !== 0) alterneigh(rad, j, b, g, r); /* alter neighbours */

// 			pix += step;
// 			if (pix >= lim) pix -= lengthcount;

// 			i++;

// 			if (delta === 0) delta = 1;

// 			if (i % delta === 0) {
// 				alpha -= alpha / alphadec;
// 				radius -= radius / radiusdec;
// 				rad = radius >> radiusbiasshift;

// 				if (rad <= 1) rad = 0;

// 				for (j = 0; j < rad; j++) radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
// 			}
// 		}
// 	};

// 	/*
// 	 ** Search for BGR values 0..255 (after net is unbiased) and return colour
// 	 * index
// 	 * ----------------------------------------------------------------------------
// 	 */

// 	var map = exports.map = function map(b, g, r) {

// 		var i;
// 		var j;
// 		var dist;
// 		var a;
// 		var bestd;
// 		var p;
// 		var best;

// 		bestd = 1000; /* biggest possible dist is 256*3 */
// 		best = -1;
// 		i = netindex[g]; /* index on g */
// 		j = i - 1; /* start at netindex[g] and work outwards */

// 		while ((i < netsize) || (j >= 0)) {

// 			if (i < netsize) {
// 				p = network[i];
// 				dist = p[1] - g; /* inx key */

// 				if (dist >= bestd) i = netsize; /* stop iter */

// 				else {

// 					i++;
// 					if (dist < 0) dist = -dist;
// 					a = p[0] - b;
// 					if (a < 0) a = -a;
// 					dist += a;

// 					if (dist < bestd) {
// 						a = p[2] - r;
// 						if (a < 0) a = -a;
// 						dist += a;

// 						if (dist < bestd) {
// 							bestd = dist;
// 							best = p[3];
// 						}
// 					}
// 				}
// 			}

// 			if (j >= 0) {

// 				p = network[j];
// 				dist = g - p[1]; /* inx key - reverse dif */

// 				if (dist >= bestd) j = -1; /* stop iter */

// 				else {

// 					j--;
// 					if (dist < 0) dist = -dist;
// 					a = p[0] - b;
// 					if (a < 0) a = -a;
// 					dist += a;

// 					if (dist < bestd) {
// 						a = p[2] - r;
// 						if (a < 0) a = -a;
// 						dist += a;
// 						if (dist < bestd) {
// 							bestd = dist;
// 							best = p[3];
// 						}
// 					}
// 				}
// 			}
// 		}

// 		return (best);
// 	};

// 	var process = exports.process = function process() {
// 		learn();
// 		unbiasnet();
// 		inxbuild();
// 		return colorMap();
// 	};

// 	/*
// 	 * Unbias network to give byte values 0..255 and record position i to prepare
// 	 * for sort
// 	 * -----------------------------------------------------------------------------------
// 	 */

// 	var unbiasnet = function unbiasnet() {

// 		var i;
// 		var j;

// 		for (i = 0; i < netsize; i++) {
// 			network[i][0] >>= netbiasshift;
// 			network[i][1] >>= netbiasshift;
// 			network[i][2] >>= netbiasshift;
// 			network[i][3] = i; /* record colour no */
// 		}
// 	};

// 	/*
// 	 * Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2)) in
// 	 * radpower[|i-j|]
// 	 * ---------------------------------------------------------------------------------
// 	 */

// 	var alterneigh = function alterneigh(rad, i, b, g, r) {

// 		var j;
// 		var k;
// 		var lo;
// 		var hi;
// 		var a;
// 		var m;
// 		var p;

// 		lo = i - rad;
// 		if (lo < -1) lo = -1;

// 		hi = i + rad;
// 		if (hi > netsize) hi = netsize;

// 		j = i + 1;
// 		k = i - 1;
// 		m = 1;

// 		while ((j < hi) || (k > lo)) {
// 			a = radpower[m++];

// 			if (j < hi) {
// 				p = network[j++];

// 				try {
// 					p[0] -= (a * (p[0] - b)) / alpharadbias;
// 					p[1] -= (a * (p[1] - g)) / alpharadbias;
// 					p[2] -= (a * (p[2] - r)) / alpharadbias;
// 				} catch (e) {} // prevents 1.3 miscompilation
// 			}

// 			if (k > lo) {
// 				p = network[k--];

// 				try {
// 					p[0] -= (a * (p[0] - b)) / alpharadbias;
// 					p[1] -= (a * (p[1] - g)) / alpharadbias;
// 					p[2] -= (a * (p[2] - r)) / alpharadbias;
// 				} catch (e) {}
// 			}
// 		}
// 	};

// 	/*
// 	 * Move neuron i towards biased (b,g,r) by factor alpha
// 	 * ----------------------------------------------------
// 	 */

// 	var altersingle = function altersingle(alpha, i, b, g, r) {

// 		/* alter hit neuron */
// 		var n = network[i];
// 		n[0] -= (alpha * (n[0] - b)) / initalpha;
// 		n[1] -= (alpha * (n[1] - g)) / initalpha;
// 		n[2] -= (alpha * (n[2] - r)) / initalpha;
// 	};

// 	/*
// 	 * Search for biased BGR values ----------------------------
// 	 */

// 	var contest = function contest(b, g, r) {

// 		/* finds closest neuron (min dist) and updates freq */
// 		/* finds best neuron (min dist-bias) and returns position */
// 		/* for frequently chosen neurons, freq[i] is high and bias[i] is negative */
// 		/* bias[i] = gamma*((1/netsize)-freq[i]) */

// 		var i;
// 		var dist;
// 		var a;
// 		var biasdist;
// 		var betafreq;
// 		var bestpos;
// 		var bestbiaspos;
// 		var bestd;
// 		var bestbiasd;
// 		var n;

// 		bestd = ~ (1 << 31);
// 		bestbiasd = bestd;
// 		bestpos = -1;
// 		bestbiaspos = bestpos;

// 		for (i = 0; i < netsize; i++) {
// 			n = network[i];
// 			dist = n[0] - b;
// 			if (dist < 0) dist = -dist;
// 			a = n[1] - g;
// 			if (a < 0) a = -a;
// 			dist += a;
// 			a = n[2] - r;
// 			if (a < 0) a = -a;
// 			dist += a;

// 			if (dist < bestd) {
// 				bestd = dist;
// 				bestpos = i;
// 			}

// 			biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));

// 			if (biasdist < bestbiasd) {
// 				bestbiasd = biasdist;
// 				bestbiaspos = i;
// 			}

// 			betafreq = (freq[i] >> betashift);
// 			freq[i] -= betafreq;
// 			bias[i] += (betafreq << gammashift);
// 		}

// 		freq[bestpos] += beta;
// 		bias[bestpos] -= betagamma;
// 		return (bestbiaspos);
// 	};

// 	NeuQuant.apply(this, arguments);
// 	return exports;
// };



NeuQuant=function(){var $,_,r,f,n,o={},t=64,a=65536,u=[],c=[],i=[],v=[],e=o.NeuQuant=function $(o,t,a){var u,v;for(u=0,_=o,r=t,f=a,n=Array(256);u<256;u++)n[u]=[,,,,],(v=n[u])[0]=v[1]=v[2]=(u<<12)/256,i[u]=256,c[u]=0},p=function $(){for(var _=[],r=Array(256),f=0;f<256;f++)r[n[f][3]]=f;for(var o=0,t=0;t<256;t++){var a=r[t];_[o++]=n[a][0],_[o++]=n[a][1],_[o++]=n[a][2]}return _},h=function $(){var _,r,f,o,t,a,c,i;for(_=0,c=0,i=0;_<256;_++){for(t=n[_],f=_,o=t[1],r=_+1;r<256;r++)(a=n[r])[1]<o&&(f=r,o=a[1]);if(a=n[f],_!=f&&(r=a[0],a[0]=t[0],t[0]=r,r=a[1],a[1]=t[1],t[1]=r,r=a[2],a[2]=t[2],t[2]=r,r=a[3],a[3]=t[3],t[3]=r),o!=c){for(u[c]=i+_>>1,r=c+1;r<o;r++)u[r]=_;c=o,i=_}}for(u[c]=i+255>>1,r=c+1;r<256;r++)u[r]=255},s=function n(){var o,t,a,u,c,i,e,p,h,s,x,N,Q,b;for(r<1509&&(f=1),$=30+(f-1)/3,N=_,Q=0,b=r,s=(x=r/(3*f))/100|0,p=1024,(e=(i=2048)>>6)<=1&&(e=0),o=0;o<e;o++)v[o]=p*((e*e-o*o)*256/(e*e));for(h=r<1509?3:r%499!=0?1497:r%491!=0?1473:r%487!=0?1461:1509,o=0;o<x;)if(a=(255&N[Q+0])<<4,t=m(a,u=(255&N[Q+1])<<4,c=(255&N[Q+2])<<4),l(p,t,a,u,c),0!==e&&y(e,t,a,u,c),(Q+=h)>=b&&(Q-=r),0===s&&(s=1),++o%s==0)for(p-=p/$,i-=i/30,e=i>>6,e<=1&&(e=0),t=0;t<e;t++)v[t]=p*((e*e-t*t)*256/(e*e))};o.map=function $(_,r,f){var o,t,a,c,i,v,e;for(i=1e3,e=-1,t=(o=u[r])-1;o<256||t>=0;)o<256&&((a=(v=n[o])[1]-r)>=i?o=256:(o++,a<0&&(a=-a),(c=v[0]-_)<0&&(c=-c),(a+=c)<i&&((c=v[2]-f)<0&&(c=-c),(a+=c)<i&&(i=a,e=v[3])))),t>=0&&((a=r-(v=n[t])[1])>=i?t=-1:(t--,a<0&&(a=-a),(c=v[0]-_)<0&&(c=-c),(a+=c)<i&&((c=v[2]-f)<0&&(c=-c),(a+=c)<i&&(i=a,e=v[3]))));return e},o.process=function $(){return s(),x(),h(),p()};var x=function $(){var _;for(_=0;_<256;_++)n[_][0]>>=4,n[_][1]>>=4,n[_][2]>>=4,n[_][3]=_},y=function $(_,r,f,o,t){var a,u,c,i,e,p,h;for((c=r-_)<-1&&(c=-1),(i=r+_)>256&&(i=256),a=r+1,u=r-1,p=1;a<i||u>c;){if(e=v[p++],a<i){h=n[a++];try{h[0]-=e*(h[0]-f)/262144,h[1]-=e*(h[1]-o)/262144,h[2]-=e*(h[2]-t)/262144}catch(s){}}if(u>c){h=n[u--];try{h[0]-=e*(h[0]-f)/262144,h[1]-=e*(h[1]-o)/262144,h[2]-=e*(h[2]-t)/262144}catch(x){}}}},l=function $(_,r,f,o,t){var a=n[r];a[0]-=_*(a[0]-f)/1024,a[1]-=_*(a[1]-o)/1024,a[2]-=_*(a[2]-t)/1024},m=function $(_,r,f){var o,u,v,e,p,h,s,x,y,l;for(o=0,y=x=2147483647,s=h=-1;o<256;o++)(u=(l=n[o])[0]-_)<0&&(u=-u),(v=l[1]-r)<0&&(v=-v),u+=v,(v=l[2]-f)<0&&(v=-v),(u+=v)<x&&(x=u,h=o),(e=u-(c[o]>>12))<y&&(y=e,s=o),p=i[o]>>10,i[o]-=p,c[o]+=p<<10;return i[h]+=t,c[h]-=a,s};return e.apply(this,arguments),o};