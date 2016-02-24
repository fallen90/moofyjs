 var oxfordEmotion = require("node-oxford-emotion")("f376558f9354404e8b6b0ee7c30ec568");
 var fs = require("fs");

 var emotion = oxfordEmotion.recognize("image", binaryRead("../home.jpg"), function(cb) {
     console.log(JSON.parse(cb)[0].scores);
 });

function binaryRead(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap.toString('binary'),'binary');
}