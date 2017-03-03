angular.module('EnrollCtrl', []).controller('EnrollController', function($scope) {

	// $scope.tagline = 'Nothing beats a pocket protector!';
	$scope.username = '';
	$scope.recording = false; //not recording
	$scope.timer1Visible = true;
	$scope.dataArray;

	var socket = io.connect(location.host);
	//refresh target models in database.
    // var target_models_elem =  document.getElementById("target-models");

	socket.on('decode', function (data) {        
        // var current = output_elem.innerHTML;
        // output_elem.innerHTML = current + data.result;
        $scope.shOutput = data.result;
        $scope.$apply();
        console.log(data.result);
      });

	socket.on('refreshTarget',function(data){
        // target_models_elem.innerHTML = data;
        console.log(data);
		//clear user name field
		// $scope.username = '';
		// document.getElementById("username").value = '';
		// console.log($scope.username);
		$scope.dataArray = data;
		$scope.$apply();
      });

      var onFail = function(e) {
        console.log('Rejected!', e);
      };

      var context = new AudioContext();
      var onSuccess = function(s) {
        var mediaStreamSource = context.createMediaStreamSource(s);
        recorder = new Recorder(mediaStreamSource);
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
		if ($scope.username == '') {
			alert("Input the user name.");
			return;
		}
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
            var resamplerObj = new Resampler(sampleRateFromMic, 16000, 2, buffer.length, false);
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
            console.log('wav file created...sending to server ' + $scope.username);        
            socket.emit('wav',{'str':reader.result, 'filename':$scope.username});
            }
            // send binary string to server where it will save wav locally and decode
            reader.readAsBinaryString(s);
            
          }, resampledBuffer);
        });

	};

});