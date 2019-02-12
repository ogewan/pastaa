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
    getWrap = async (src, target) => {
        let err;
        
        try { remote = await pget(src, (target.protocol == 'https:') ? require('https') : require('http')); }
        catch (e) { err = e; }
        return {err, remote};
    }
    script = async (src, cache) => {
        let target = new URL(src),
            dest = path.join(scripts, path.basename(target.pathname)),
            res;

        if (!cache) res = await getWrap(src, target);
        try {
            let local = await read(dest, 'utf8');
                changes = [];
            
            if (res.remote) {
                let changes = diff(local, res.remote); 
                if (changes.length > 1) {
                    await write(dest, res.remote);
                    console.log(`${dest} has been updated.`)
                }
            } else {
                res.remote = local;
            }
        }
        catch (e) {
            if (cache) res = await getWrap(src, target);
            if (res.remote) {
                try { await mkdir(scripts); } catch (e) { }
                await write(dest, res.remote);
            }
            else {
                throw res.err;
            }
        }
        return res.remote;
    },
    //https://stackoverflow.com/a/3561711
    regEsc = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

//TODO: jsdocs
module.exports = {
    paste: async (src, cache = true) => {
        let sandbox = vm.createContext(),
            dest = path.join(scripts, path.basename((new URL(src)).pathname));

        vm.runInContext(await script(src), sandbox, dest);
        return sandbox;
    },
    copyPasta: async (target, start = `/*#PASTE:`, end = `#*/`, prefix = '_', cache = true) => {
        let source = await read(target, 'utf8'),
            buff = source.split(new RegExp(`(${regEsc(start)})|(${regEsc(end)})`, 'g'));

        for (let id in buff) {
            if (id > 1 && buff[id - 2] == start) {
                buff[id] = await script(buff[id], cache);
                buff[id - 2] = void(0);
            }
            if (buff[id] == end) buff[id] = void(0);
        }
        
        await write(path.join(path.dirname(target), `${prefix}${path.basename(target)}`), buff.join(''));
    },
};
/* jshint ignore:end */