// crée la socket sur le port 1234
var io = require('socket.io').listen(1234);
//pour le streaming
var ss = require('socket.io-stream');
//Api pour lancer un sous process
var spawn = require('child_process').spawn;
//on lance le process, pour l'instant on jette ses entrées sorties
var child = spawn('./prg', [], {
    stdio: ['ignore', 'pipe', 'ignore']
});


//si on se connecte a localhost:1234/user crée une socket
io.of('/user').on('connection', function (socket) {
    //si la socket demande le pipe en faisant .emit("Iamready") on lui envoie le stream 
	var stream = ss.createStream();
	ss(socket).emit("Streaming", stream)  ;
	child.stdout.pipe(stream) ;

});

// coté client


