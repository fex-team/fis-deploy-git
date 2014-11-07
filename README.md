# fis-deploy-git

## 说明

将FIS产出进行git部署 **仅支持FIS 1.8.5+**

## 使用方法

安装

```bash
npm i fis-deploy-git -g
```

启用

```javascript
fis.config.set('modules.deploy', ['default', 'git'])
```

配置

```javascript
fis.config.set('settings.deploy.git', {
    publish : {
        from : '/',
        to: '/',
        remote: 'https://github.com/hefangshi/git-deploy-test.git',
        branch: 'gh-pages'
    }
});
```

发布

```bash
fis release -Dompd publish
```
