//use-case 1: paste direction
(async () => {
    var retrieved = await require('./pasta').paste(`https://ogewan.github.io/direction.js/direction.min.js`);
    console.log(retrieved);
})();