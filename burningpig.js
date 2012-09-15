﻿var net = require('net'),
    util = require('util'),
    fs = require('fs'),
    zlib = require('zlib'),
    colors = require('colors'),
    PacketParser = require('./packetParser'),
    BinaryWriter = require('./beConverters').BinaryWriter,
    World = require('./world');

console.log('Lighting up the BurningPig!'.bold);
    
var world = new World();
world.loadSettings();

var server = net.createServer(function (stream) {
    var client = { network: stream };
    var parser = new PacketParser(client);

    stream.on('connect', function () {
        console.log('Got connection!'.green);
        stream.isClosed = false;

        var baseStreamWrite = stream.write;
        stream.write = function () {
            // I feel this is not the best way to do a safety check for an open socket before trying to write to it.
            if (stream.isClosed)
                return;

            baseStreamWrite.apply(stream, arguments);
        };
    });

    stream.on('error', function () {
        stream.isClosed = true;
    });

    stream.on('end', function () {
        stream.isClosed = true;
    });

    stream.on('destroy', function () {
        stream.isClosed = true;
    });

	stream.pipe(parser).pipe(world, { end: false });
});

server.listen(world.settings.listenPort);

console.log('Server listening on port %d.'.green, world.settings.listenPort);