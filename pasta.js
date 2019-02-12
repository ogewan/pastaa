/* jshint ignore:start */
const scripts = `${__dirname}/scripts`,
    fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    diff = require('fast-diff'),
    prom = require('util').promisify,
    mkdir = prom(fs.mkdir),
    read = prom(fs.readFile),
    write = prom(fs.writeFile),
    pget = (src, http = require('https')) => {
        return new Promise((resolve, reject) => {
            const body = [],
                request = http.get(src, response => {
                    if (response.statusCode < 200 || response.statusCode > 299) {
                        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
                    }

                    response.on('data', chunk => body.push(chunk));
                    response.on('end', () => resolve(body.join('')));
                });

            request.on('error', (err) => reject(err))
        });
    },
    script = async src => {
        let target = new URL(src),
            filename = path.basename(target.pathname),
            dest = path.join(scripts, filename),
            remote = '',
            remoteE;
        
        try { remote = await pget(src, (target.protocol == 'https:') ? require('https') : require('http')); }
        catch (e) { remoteE = e; }

        try {
            let local = await read(dest, 'utf8');
                changes = [];
            
            if (remote.length) {
                let changes = diff(local, remote); 
                if (changes.length > 1) {
                    await write(dest, remote);
                    console.log(`${dest} has been updated.`)
                }
            } else {
                remote = local;
            }
        }
        catch (e) {
            if (remote.length) {
                try { await mkdir(scripts); } catch (e) { }
                await write(dest, remote);
            }
            else {
                throw remoteE;
            }
        }
        return remote;
    };
    
module.exports = {
    paste: async (src) => {
        let sandbox = vm.createContext();
        vm.runInContext(await script(src), sandbox, dest);
        return sandbox;
    },
    copyPasta: async target => {
        let source = await read(target, 'utf8'),
            buff = source.split(/(\/\*#PASTA:)|(#\*\/)/g);

        for (let id in buff) {
            if (id > 1 && buff[id - 2] == "/*#PASTA:") {
                buff[id] = script(buff[id]);
            }
        }
        
        await write(path.join(path.dirname(target), "_", path.basename(target)), buff.join(''));
    },
    //TODO: Called from a build script, write a new JS file where paste(...) is replaced by the called scripts
    pasteProd: () => 0
};
/* jshint ignore:end */