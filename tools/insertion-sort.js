var { createProbable: Probable } = require('probable');
var seedrandom = require('seedrandom');
var probable = Probable({ random: seedrandom('3') });

function sort(array, arrayPopulation) {
  if (arrayPopulation < 2) {
    return;
  }

  for (let i = 1; i < arrayPopulation; ++i) {
    const current = array[i];
    for (let j = i - 1; j > -1; --j) {
      const other = array[j];
      if (current >= other) {
        array[j + 1] = current;
        // console.log('i', i, 'current', current, 'j', j, 'other', other, array);
        break;
      }
      // Shift other to the right.
      array[j + 1] = other;
      array[j] = current;
    }
  }
}

(async function go() {
  var d3Array = await import('d3-array');
  var sortTarget = probable.shuffle(d3Array.range(8));
  console.log('Original:', sortTarget);
  sort(sortTarget, 8);
  console.log('Sorted:', sortTarget);

  var randomTarget = d3Array.range(8).map(() => probable.rollDie(8));
  console.log('Original:', randomTarget);
  sort(randomTarget, 8);
  console.log('Sorted:', randomTarget);
})();
