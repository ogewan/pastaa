//use-case 3: paste and use jquery
(async () => {
    let pastaa = require('../pasta'),
        test = "     henlo Warudo  ",
        //returns the context that the script is run in.
        jQuery = await pastaa.paste('https://code.jquery.com/jquery-3.3.1.slim.min.js'),
        //Note: Without a Window Object most JS made for browsers won't work in Node
        $ = jQuery.$;

        //console.log($.trim(test));
})();