基于 Cocos Creator 2.x 版本开发,用于加载远程 plist 资源。
---
Developed based on the Cocos Creator 2.x version for loading remote plist resources.
---
示范：/ demonstration：
```
const LoadRemotePlist = require("./LoadRemotePlist");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    start () {
        LoadRemotePlist("http://127.0.0.1:5500/assets/resources/emoji.plist",(err, plist)=>{
            let spriteFrames = plist.getSpriteFrames();
        });
    },
});

```
