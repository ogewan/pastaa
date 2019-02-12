//use-case 2: copy paste to file
(async () => {
    await require('../pasta').copyPasta(require('path').join(__dirname, 'paste.js'), "await require('../pasta').paste(`", '`);');
})();