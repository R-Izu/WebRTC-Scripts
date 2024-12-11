$(function(){

    let localStream = null;
    let peer = null;
    let existingCall = null;

    // let constraints = {
    //      video: {},
    //      audio: true
    // };
    // constraints.video.width = {
    //     min: 320,
    //     max: 320
    // };
    // constraints.video.height = {
    //     min: 240,
    //     max: 240        
    // };

    let stream = null;
    const width = 640;
    const height = 480;

    var inputCanvas = document.getElementById("inputCanvas");
    inputCanvas.width = width;
    inputCanvas.height = height;
    var inputCtx = inputCanvas.getContext("2d");
    var outputCanvas = document.getElementById("outputCanvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    var outputCtx = outputCanvas.getContext("2d");

    stream = outputCanvas.captureStream();
    //localStream = stream;
    var outputImg = new Image();

    navigator.mediaDevices.getUserMedia({
        video: { 
        facingMode: { exact: "environment" }, 
        width: { ideal: 1280 },
        height: { ideal: 720 }
        },
        audio: false 
    })
    .then(function(stream) {
        localStream = stream;
        $('#myStream').get(0).srcObject = stream; // カメラ映像のプレビュー
    })
    .catch(function(error) {
        console.error('mediaDevice.getUserMedia() error:', error);
    });


    peer = new Peer({
        key: '3d69d042-3fa9-4f57-beb2-55e70d8c005a',
        debug: 3
    });

    peer.on('open', function(){
        $('#my-id').text(peer.id);
    });

    peer.on('error', function(err){
        alert(err.message);
    });

    $('#make-call').submit(function(e){
        e.preventDefault();
        let roomName = $('#join-room').val();
        if (!roomName) {
            return;
        }
        const call = peer.joinRoom(roomName, {
            mode: 'sfu', 
            stream: localStream,
            mediaConstraints: {
                video: {
                    bitrate: 1000 * 1000 // 1Mbps
                }
            }
        });
        setupCallEventHandlers(call);
    });

    $('#end-call').click(function(){
        existingCall.close();
    });

    function setupCallEventHandlers(call){
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;
        setupEndCallUI();
        $('#room-id').text(call.name);

        call.on('stream', function(stream){
            addVideo(stream);
        });

        call.on('peerLeave', function(peerId){
            removeVideo(peerId);
        });

        call.on('close', function(){
            removeAllRemoteVideos();
            setupMakeCallUI();
        });
    }

    function addVideo(stream){
        const videoDom = $('<video autoplay>');
        videoDom.attr('id','streampeerId');
        videoDom.get(0).srcObject = stream;
        $('.videosContainer').empty();
        $('.videosContainer').append(videoDom);

        // var video = document.querySelectorAll('#streamPeerId').item(0);
        // var fData = new FormData();
        // fData.append('video', null);

        // inputCtx.drawImage(video, 0, 0, width, height);
        // inputCanvas.toBlob(function(blob){
        //     fData.set('video', blob);

        //     $.ajax({
        //         url : "/post",
        //         type : "POST",
        //         processData : false,
        //         contentType : false,
        //         data : fData,
        //     }).done(function(data){
        //         let res = data.ResultSet.result;
        //         outputImg.src = "data:image/jpeg;base64," + res;
        //         outputImg.onload = function(){
        //         outputCtx.drawImage(outputImg, 0, 0, width, height);
        //         }
        //     }).fail(function(data){
        //         console.log(data);
        //     });
        // }, 'image/jpeg');
    }

    let element = document.querySelector(".videosContainer");
    window.addEventListener('load', function(){
        document.getElementById('button1').addEventListener('click', function(){
            element.requestFullscreen();				
        });
    });

    function removeVideo(peerId){
        $('#'+peerId).remove();
    }

    function removeAllRemoteVideos(){
        $('.videosContainer').empty();
    }

    function setupMakeCallUI(){
        $('#make-call').show();
        $('#end-call').hide();
    }
    
    function setupEndCallUI() {
        $('#make-call').hide();
        $('#end-call').show();
    }

});