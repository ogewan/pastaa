# pastaa
Retrieve script via url on Node.js.

## Installation
* yarn add pasta

* npm install pasta*

## Usage
index.js
```js
//Await can only be used in Aync functions atm
(async () => {
    let pastaa = require('pastaa'),
        test = "     henlo Warudo  ",
        //returns the context that the script is run in.
        jQuery = await pastaa.paste('https://code.jquery.com/jquery-3.3.1.slim.min.js'),
        //Note: Without a Window Object most JS made for browsers won't work in Node
        $ = jQuery.$;

    console.log($.trim(test));
    //"henlo Warudo"
    await pastaa.copyPasta('./jQuery.custom.js', '/*PASTA|', '*/', '$');
})();
```
jQuery.custom.js
```js
//random JavaScript stuff
/*PASTA|https://code.jquery.com/jquery-3.3.1.slim.min.js*/
//more random JavaScript stuff
```
$jQuery.custom.js
```js
//random JavaScript stuff
/*! jQuery v3.3.1 -ajax,-ajax/jsonp,-ajax/load,-ajax/parseXML,-ajax/script...
//more random JavaScript stuff
```

##Caveats
TODO
