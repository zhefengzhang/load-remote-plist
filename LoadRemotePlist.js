
const BRACE_REGEX = /[\{\}]/g;

function parseSize (sizeStr) {
    sizeStr = sizeStr.slice(1, -1);
    let arr = sizeStr.split(',');
    let width = parseFloat(arr[0]);
    let height = parseFloat(arr[1]);
    return new cc.Size(width, height);
}

function parseVec2 (vec2Str) {
    vec2Str = vec2Str.slice(1, -1);
    var arr = vec2Str.split(',');
    var x = parseFloat(arr[0]);
    var y = parseFloat(arr[1]);
    return new cc.Vec2(x, y);
}

function parseTriangles (trianglesStr) {
    return trianglesStr.split(' ').map(parseFloat);
}

function parseVertices (verticesStr) {
    return verticesStr.split(' ').map(parseFloat);
}

function parseRect (rectStr) {
    rectStr = rectStr.replace(BRACE_REGEX, '');
    let arr = rectStr.split(',');
    return new cc.Rect(
        parseFloat(arr[0] || 0),
        parseFloat(arr[1] || 0),
        parseFloat(arr[2] || 0),
        parseFloat(arr[3] || 0),
    );
}

function parsePlist (plist, texture) {
    let info = plist.metadata;
    let frames = plist.frames;

    let atlas = new cc.SpriteAtlas();
    let spriteFrames = atlas._spriteFrames;

    for (let key in frames) {
        let frame = frames[key];
        let rotated = false, sourceSize, offsetStr, textureRect;
        // let trimmed = frame.trimmed;
        if (info.format === 0) {
            rotated = false;
            // trimmed = frame.trimmed;
            sourceSize = `{${frame.originalWidth},${frame.originalHeight}}`;
            offsetStr = `{${frame.offsetX},${frame.offsetY}}`;
            textureRect = `{{${frame.x},${frame.y}},{${frame.width},${frame.height}}}`;
        }
        else if (info.format === 1 || info.format === 2) {
            rotated = frame.rotated;
            // trimmed = frame.trimmed;
            sourceSize = frame.sourceSize;
            offsetStr = frame.offset;
            textureRect = frame.frame;
        }
        else if (info.format === 3) {
            rotated = frame.textureRotated;
            // trimmed = frame.trimmed;
            sourceSize = frame.spriteSourceSize;
            offsetStr = frame.spriteOffset;
            textureRect = frame.textureRect;
        }

        var sprite = new cc.SpriteFrame();

        sprite.setTexture(texture, parseRect(textureRect), !!rotated, parseVec2(offsetStr), parseSize(sourceSize));
        if (frame.triangles) {
            let vertices = parseVertices(frame.vertices);
            let verticesUV = parseVertices(frame.verticesUV);

            sprite.vertices = {
                triangles: parseTriangles(frame.triangles),
                x: [],
                y: [],
                u: [],
                v: []
            };

            for (let i = 0; i < vertices.length; i+=2) {
                sprite.vertices.x.push(vertices[i]);
                sprite.vertices.y.push(vertices[i+1]);
            }
            for (let i = 0; i < verticesUV.length; i+=2) {
                sprite.vertices.u.push(verticesUV[i]);
                sprite.vertices.v.push(verticesUV[i+1]);
            }
        }

        let name = cc.path.mainFileName(key);
        spriteFrames[name] = sprite;
    }

    return atlas;
}


module.exports = function (url, callback) {
    cc.loader.load(url, function (err, plist) {
        if (err) {
            return callback(err);
        }
        let texture = plist.metadata.realTextureFileName || plist.metadata.textureFileName;
        texture = cc.path.join(cc.path.dirname(url), texture);
        cc.loader.load(texture, function (err, tex) {
            if (err) {
                return callback(err);
            }
            let atlasSprite = parsePlist(plist, tex);
            callback(null, atlasSprite);
        });
    });
};
