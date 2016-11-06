var engine              = {};

// Canvas
engine.$canvas          = $("#canvas");
engine.canvas           = engine.$canvas[0];
engine.hide             = false;
engine.rot              = 1;
engine.limit            = 1024;
engine.drawtype         = 0;
engine.drawmax          = 2;
engine.songindex        = 0;
engine.stop             = false;

engine.songs = [
    "public/audio/seven_years.wav",
    "public/audio/Cetus.m4a",
    "public/audio/Spectre.m4a",
    "public/audio/Save The World.m4a",
    "public/audio/OK.m4a"
];

engine.audio            = $("#audio").get(0);
engine.audio_ctx        = new AudioContext();
engine.audio_src        = engine.audio_ctx.createMediaElementSource(engine.audio);
engine.analyser         = engine.audio_ctx.createAnalyser();
engine.freqData         = new Uint8Array();

engine.init = function () {
    $("#audio").attr('src', engine.songs[engine.songindex]);
    engine.audio.pause();
    engine.audio.currentTime = 0;
    engine.resize();
    engine.audio_src.connect(engine.analyser);
    engine.audio_src.connect(engine.audio_ctx.destination);
    engine.freqData = new Uint8Array(engine.analyser.frequencyBinCount);
    engine.audio.play();
    engine.audio.volume = 0.2;
    engine.check_type();
};

engine._rand = function(max,min){
    return Math.floor(Math.random() * (max - min) + min);
};

engine.resize = function(){
    engine.$canvas.css({ width : $(window).width(), height : $(window).height() });
    engine.canvas.width     = $(window).width();
    engine.canvas.height    = $(window).height();
    engine.ctx              = engine.canvas.getContext('2d');
};

engine._rc = function(max) {
    var h = 260 - max;
    var s = 50;
    var l = 50;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
};

engine.io = function(n) {
    return n % 2;
};

engine.draw2 = function(){
    engine.analyser.getByteFrequencyData(engine.freqData);

    for(var i in engine.freqData){
        var wave = engine.freqData[i];
        var size = (engine.canvas.width / engine.limit) / 2;
        if(wave < engine.limit){
            engine.ctx.fillStyle = engine._rc(wave);
            engine.ctx.fillRect((engine.canvas.width/2) + i * size, engine.canvas.height/2, size, wave);
            engine.ctx.fillRect((engine.canvas.width/2) - i * size, engine.canvas.height/2, size, wave);
            engine.ctx.fillRect((engine.canvas.width/2) + i * size, engine.canvas.height/2, size, -wave);
            engine.ctx.fillRect((engine.canvas.width/2) - i * size, engine.canvas.height/2, size, -wave);
        }
    }

    engine.ctx.globalCompositeOperation = "source-over";
    engine.ctx.fillStyle = "rgba(0,0,0,0.25)";
    engine.ctx.fillRect(0,0,canvas.width,canvas.height);

    engine.check_type();
};

engine.draw3 = function(){
    engine.analyser.getByteFrequencyData(engine.freqData);
    engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);

    for(var i in engine.freqData){
        var wave = engine.freqData[i];
        if(wave > 0 && engine.io(wave)){
            engine.ctx.beginPath();
            engine.ctx.strokeStyle = engine._rc(wave);
            engine.ctx.rect(
                (engine.canvas.width/2) - (wave),
                (engine.canvas.height/2) - (wave),
                wave * 2,
                wave * 2
            );
            engine.ctx.stroke();
            engine.ctx.closePath();
        }
    }

    engine.check_type();
};

engine.draw = function () {
    engine.analyser.getByteFrequencyData(engine.freqData);
    engine.ctx.clearRect(0,0,engine.canvas.width,engine.canvas.height);

    for(var i in engine.freqData){
        var wave = engine.freqData[i];
        if(wave > 0 && engine.io(wave)){
            engine.ctx.beginPath();
            engine.ctx.strokeStyle = engine._rc(wave);
            engine.ctx.rect(
                (engine.canvas.width/2) - (wave),
                (engine.canvas.height/2) - (wave),
                wave * 2,
                wave * 2
            );
            engine.ctx.stroke();
            engine.ctx.closePath();
        }
    }

    engine.ctx.beginPath();
        engine.ctx.translate(engine.canvas.width/2, engine.canvas.height/2);
        engine.ctx.rotate(engine.rot * Math.PI / 180);
        engine.ctx.translate(-engine.canvas.width/2, -engine.canvas.height/2);
    engine.ctx.closePath();

    engine.check_type();
};

engine.check_type = function(){
    if(engine.stop) return engine.stop = false;
    switch(engine.drawtype){
        case 0:
            requestAnimFrame(engine.draw); break;
        case 1:
            requestAnimFrame(engine.draw2); break;
        case 2:
            requestAnimFrame(engine.draw3); break;
    }
};

engine.next = function(){
    engine.reset_rotation();
    if(engine.drawtype + 1 > engine.drawmax){
        engine.drawtype = 0;
    } else {
        engine.drawtype += 1;
    }
};

engine.loaded = function(){
    $(".loading").hide();
};

engine.nextsong = function(){
    $(".loading").show();
    engine.stop = true;
    if(engine.songindex + 1 > engine.songs.length-1){
        engine.songindex = 0;
    } else {
        engine.songindex ++;
    }
    engine.init();
};

engine.reset_rotation = function(){
    engine.ctx.translate(engine.canvas.width/2, engine.canvas.height/2);
    engine.ctx.setTransform(1, 0, 0, 1, engine.canvas.width/2, engine.canvas.height/2);
    engine.ctx.translate(-engine.canvas.width/2, -engine.canvas.height/2);
};

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(c) {window.setTimeout(c, 0);};
})();

engine.init();