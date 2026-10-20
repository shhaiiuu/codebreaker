// Repeating doodle tile for the blue background (numbers, ?, star, crown, smiley, shapes).
const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' fill='none' stroke='rgba(255,255,255,0.13)' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>
<circle cx='60' cy='60' r='24'/><circle cx='51' cy='54' r='2'/><circle cx='69' cy='54' r='2'/><path d='M48 68q12 10 24 0'/>
<path d='M200 40l8 18 20 2-15 13 5 20-18-10-18 10 5-20-15-13 20-2z'/>
<text x='285' y='95' font-size='64' font-family='cursive' fill='rgba(255,255,255,0.13)' stroke='none'>?</text>
<path d='M30 250l8-30 14 18 14-24 14 24 14-18 8 30z'/>
<path d='M160 190l32 56h-64z'/>
<text x='245' y='265' font-size='70' font-family='cursive' fill='rgba(255,255,255,0.13)' stroke='none'>4</text>
<text x='70' y='340' font-size='60' font-family='cursive' fill='rgba(255,255,255,0.13)' stroke='none'>2</text>
<text x='190' y='345' font-size='60' font-family='cursive' fill='rgba(255,255,255,0.13)' stroke='none'>7</text>
<rect x='300' y='150' width='36' height='36' rx='6' transform='rotate(12 318 168)'/>
</svg>`
export const DOODLE = `data:image/svg+xml,${encodeURIComponent(svg)}`
