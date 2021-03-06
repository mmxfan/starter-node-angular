angular.module('ScoreCtrl', []).controller('ScoreController', function($scope) {

	$scope.tagline = 'Get your score!';	
	$scope.recording = false; //not recording
	$scope.timer1Visible = true;

	var socket = io.connect(location.host);

  socket.on('scoring',function(data){
    console.log(data.text);
    // $scope.rebuildtxt = 'rebuild';
    // $scope.bolrebuild = false;
    // $scope.$apply()
  });

	socket.on('decode', function (data) {        
        // var current = output_elem.innerHTML;
        // output_elem.innerHTML = current + data.result;
        $scope.shOutput = data.result;
        $scope.$apply();
        console.log(data.result);
      });

      var onFail = function(e) {
        console.log('Rejected!', e);
      };

      var context = new AudioContext();
      var onSuccess = function(s) {
        var mediaStreamSource = context.createMediaStreamSource(s);
        var config = {outputSampleRate: 8000};
        recorder = new Recorder(mediaStreamSource,config);
        recorder.record();
        // audio loopback
        // mediaStreamSource.connect(context.destination);
      }

      
      window.URL = window.URL || window.webkitURL;
      navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      var recorder;
      var audio = document.querySelector('audio');

	$scope.startRecording = function() {
		//must have a user name.
		// if ($scope.username == '') {
		// 	alert("Input the user name.");
		// 	return;
		// }
		// recording
		$scope.recording = true;
		//show timer
		$scope.timer1Visible = false;


        if (navigator.getUserMedia) {
          navigator.getUserMedia({audio: true}, onSuccess, onFail);
        } else {
          console.log('navigator.getUserMedia not present');
        }
		//start the timer
		$scope.$broadcast('timer-start');
	};

	$scope.stopRecording = function() {
		// console.log("stop rec.");
		// not recording
		$scope.recording = false;
		//stop the timer
		$scope.$broadcast('timer-stop');

		recorder.stop();
        
        recorder.getBuffer(function(s) {
            // return value holds interleaved stereo audio data at mic's sample rate (44.1 or 48 kHz)
            // "interleaved": indices alternate between left and right channels
            var buffer = s;
            var sampleRateFromMic = context.sampleRate;
            // resample input stereo to 16khz stereo
            // Resample args: inputRate, outputRate, numChannels, length of buffer, noReturn boolean
            // since we want the returned value, noReturn is set to false          
            var resamplerObj = new Resampler(sampleRateFromMic, 8000, 1, buffer.length, false);
            var resampledBuffer = resamplerObj.resampler(buffer);
            // convert stereo to mono and export
            recorder.exportDownsampledWAV(function(s) {
            src = window.URL.createObjectURL(s);
            
            audio.src = src;

            // convert blob to binary data so can send over socket
            var reader = new FileReader();
            //pass the user name as the file name to the server
            // var userFileName=document.getElementById("username").value;
            //clear username field
            // document.getElementById("username").value="";
            // console.log("filename is " + userFileName);
            reader.onloadend = function () {
            console.log('wav file created...sending to server ' + 'test');        
            socket.emit('test_score',{'str':reader.result, 'filename':'test'});
            }
            // send binary string to server where it will save wav locally and decode
            reader.readAsBinaryString(s);
            
          }, resampledBuffer, 'audio/wav', 8000);
        });

	};
});