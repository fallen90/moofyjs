var Faced = require("./lib/faced");
var faced = new Faced();
var emotion = require("node-oxford-emotion")("f376558f9354404e8b6b0ee7c30ec568");
var fs = require("fs");
var http = require('http');
var _ = require('underscore');

faced.detect('../home.jpg', function(faces, image, file) {
    if (!faces) {
        return console.log("No faces found!");
    }

    var face = faces[0];


    console.log(
        "Found a face at %d,%d with dimensions %dx%d",
        face.getX(),
        face.getY(),
        face.getWidth(),
        face.getHeight()
    );

    //if found a face
    var emotions = emotion.recognize("image", binaryRead('../home.jpg'), function(cb) {
        var cb = JSON.parse(cb)[0];
        var scores = cb.scores;
        var detected = sortProperties(scores)[0][0];
        console.log("emotion detected", detected);

        getMoodPlaylist(detected, function(response) {
            console.log('recvd playlist', response);
        });

    });


});

var concat = require('concat-stream');
var request = require('request');

function getMoodPlaylist(mood, callback) {

    return request.get('http://developer.echonest.com/api/v4/song/search?api_key=QVHLCJV8HZQQUMFYE&format=json&results=15&bucket=id:spotify&bucket=tracks&limit=true&sort=tempo-asc&bucket=song_discovery&mood=' + mood)
        .on('response', function(response) {
            response.pipe(concat(function(body) {
                // Data reception is done, do whatever with it!
                var resp = JSON.parse(body).response;
                callback(formatOutputPlaylist(resp));
            }))
        })
        .on('error', function(err) {
            console.log('error getting playlist', err);
        })
        .pipe(fs.createWriteStream('output.json'));

}

function formatOutputPlaylist(playlist) {
    var songs = playlist.songs;
    var song_playlist = [];
    _.each(songs, function(song) {
        song_playlist.push(song.title + " by " + song.artist_name);
    });
    return song_playlist;
}

function binaryRead(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap.toString('binary'), 'binary');
}

function draw(image, frec) {
    image.rectangle(
        [frec.top, frec.left], [frec.width, frec.height], [255, 255, 255],
        2
    );
    image.save('output.jpg');
}

function sortProperties(obj) {
    // convert object into array
    var sortable = [];
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

        // sort items by value
    sortable.sort(function(a, b) {
        return b[1] - a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}
