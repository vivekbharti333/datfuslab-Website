// Load Google Analytics script
var script = document.createElement('script');
script.async = true;
script.src = "https://www.googletagmanager.com/gtag/js?id=G-ES38YM2KS3";
document.head.appendChild(script);

// Initialize GA
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-ES38YM2KS3');