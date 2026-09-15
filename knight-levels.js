(function (root) {
  'use strict';
  // Cell indices run left to right, top to bottom, from 0 to 35.
  const levels = [
    { name: 'القفزة الأولى', tip: 'اتبع المربعات المضيئة. اجمع النجمة ثم اقفز إلى البوابة.', start: 32, exit: 17, stars: [21], blocks: [], optimal: 2 },
    { name: 'خطوة أبعد', tip: 'يتحرك الحصان على شكل L: مربعان ثم مربع جانبي.', start: 23, exit: 33, stars: [31], blocks: [], optimal: 4 },
    { name: 'نجمتان وطريق', tip: 'اجمع النجمتين. يمكنك القفز فوق العوائق، لكن لا تهبط عليها.', start: 3, exit: 4, stars: [0,16], blocks: [15,23], optimal: 5 },
    { name: 'اختر الترتيب', tip: 'ترتيب جمع النجوم قد يختصر الطريق إلى البوابة.', start: 14, exit: 3, stars: [15,8], blocks: [7,23], optimal: 7 },
    { name: 'درب النجوم', tip: 'ثلاث نجوم تنتظرك. خطّط لطريقك قبل القفز.', start: 28, exit: 33, stars: [25,6,8], blocks: [26,17,29,13], optimal: 8 },
    { name: 'الطريق الملتف', tip: 'أحيانًا تقفز بعيدًا عن الهدف لتقترب منه لاحقًا.', start: 1, exit: 5, stars: [8,34,20], blocks: [2,32,13,23], optimal: 10 },
    { name: 'بين الصخور', tip: 'راقب أماكن الهبوط؛ العوائق لا تمنع القفز فوقها.', start: 27, exit: 16, stars: [24,25,34], blocks: [5,20,0,15,31,3], optimal: 11 },
    { name: 'القفزة الأخيرة', tip: 'اجمع النجوم الثلاث وافتح آخر بوابة في الرحلة.', start: 4, exit: 34, stars: [15,33,5], blocks: [30,20,22,18,13,29], optimal: 13 }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = levels;
  else root.KnightLevels = levels;
})(globalThis);
