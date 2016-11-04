var engine              = {};

// Canvas
engine.$canvas          = $("#canvas");
engine.canvas           = engine.$canvas[0];
engine.hide             = false;
engine.spin             = true;
engine.rot              = 1;

engine.audio            = $("#audio").get(0);
engine.audio_ctx        = new AudioContext();
engine.audio_src        = engine.audio_ctx.createMediaElementSource(engine.audio);
engine.analyser         = engine.audio_ctx.createAnalyser();
engine.freqData         = new Uint8Array();

engine.init = function () {
    engine.resize();
    engine.audio_src.connect(engine.analyser);
    engine.audio_src.connect(engine.audio_ctx.destination);
    engine.freqData = new Uint8Array(engine.analyser.frequencyBinCount);
    engine.audio.play();
    engine.draw();
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
        if(engine.spin){
            engine.ctx.rotate(engine.rot * Math.PI / 180);
        } else {
            engine.ctx.setTransform(1, 0, 0, 1, engine.canvas.width/2, engine.canvas.height/2);
        }
        engine.ctx.translate(-engine.canvas.width/2, -engine.canvas.height/2);
    engine.ctx.closePath();

    requestAnimFrame(engine.draw);
};

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(c) {window.setTimeout(c, 0);};
})();

engine.init();