var os = require('os');
var path = require('path');
require('shelljs/global');

var cwd = process.cwd();

function normalizePath(to, root){
    if (!to){
        to = '/';
    }else if(to[0] === '.'){
        to = fis.util(cwd + '/' +  to);
    } else if(/^output\b/.test(to)){
        to = fis.util(root + '/' +  to);
    }else {
        to = fis.util(to);
    }
    return to;
}

module.exports = function (files, settings, callback) {
    if (!which('git')) {
        fis.log.error('need install git first');
    }

    if (!fis.util.is(settings, 'Array')){
        settings = [settings];
    }
    var conf = {};
    settings.forEach(function(setting){
        fis.util.merge(conf, setting);
    });
    conf.silent = conf.silent || true;
    conf.deepSilent = conf.deepSilent || false;
    conf.message = '[fis-deploy-git] commit ${__timestamp__}';
    conf.branch= conf.branch || 'master';

    var tmp = fis.project.getTempPath() + path.sep + 'fis_deploy_git_' + conf.remote.replace(/\/\/(.*):(.*)@/,'').replace(/[:\/\\\.]+/g,'_') ;

    if(fis.util.exists(tmp) && !fis.util.isDir(tmp)){
        fis.log.error('dir['+ tmp + ']: invalid tmp dir.');
    }

    fis.util.mkdir(tmp);

    cd(tmp);

    if (exec('git status ' + tmp, {silent: conf.silent}).code !== 0){
        cd('/..');
        fis.util.del(tmp);
        if (exec('git clone ' + conf.remote + ' ' + tmp).code !== 0){
            fis.log.error('git clone failed');
        }
    }

    cd(tmp);

    exec('git checkout ' + conf.branch, {silent: conf.silent});
    exec('git reset --hard HEAD^', {silent: conf.silent});
    exec('git pull', {silent: conf.silent});
    files.forEach(function(fileInfo){
        var file = fileInfo.file;
        if(!file.release){
            fis.log.error('unable to get release path of file['
                + file.realpath
                + ']: Maybe this file is neither in current project or releasable');
        }
        var name = tmp + (fileInfo.dest.to || '/') + fileInfo.dest.release;
        fis.util.write(name, fileInfo.content);
    });
    exec('git add -A', {silent: conf.silent});
    exec('git status', {silent: conf.deepSilent});
    fis.config.set('__timestamp__', (new Date().getTime()));
    exec('git commit -m "' + fis.uri.replaceDefine(conf.message, false) + '"', {silent: conf.deepSilent})
    exec('git push', {silent: conf.deepSilent})
}

module.exports.fullpack = true;