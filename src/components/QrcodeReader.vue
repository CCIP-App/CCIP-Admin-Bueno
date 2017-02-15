<template>
  <div id='QrcodeReader'>
    <center>
      <h2 class="ma=0" v-if="title!=''">{{ title }}</h2>
      <p>{{ subTitle }}</p>
      <video v-if="webrtc" id="camsource" autoplay :width="width" :height="height">Put your fallback message here.</video>
      <input type="file" id="upload" v-else @change="uploadChange">
      <canvas id="qr-canvas" :width="width" :height="height" style="display:none"></canvas>
      <h6 class="ma=0" v-if="!noResult">{{ result }}</h6>
    </center>
  </div>
</template>

<script>
  import Qrcode from 'qrcode-reader';
  var qr = new Qrcode();
  export default {
    name: 'QrcodeReader',
    props: {
      title: String,
      subTitle: String,
      enable: Boolean,
      noResult: Boolean,
      width: {
        type: Number,
        default: 320
      },
      height: {
        type: Number,
        default: 240
      }
    },
    data() {
      return {
        result: "Loading...",
        cam: null,
        webrtc: true,
        stream: null
      }
    },
    watch: {
      enable: function (state) {
        var self = this;
        if (state == true) {
          self.cam.start()
        } else if (state == false) {
          self.cam.stop()
        }
      }
    },
    mounted() {
      var self = this;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      self.init("camsource");
      if (navigator.getUserMedia) {
        self.webrtc = true
        self.cam = this.camera("camsource")
        self.cam.start()
      } else {
        self.webrtc = false
        console.log("Sorry, native web camera streaming (getUserMedia) is not supported by this browser...")
        self.$emit('OnError', "No support getUserMedia");
      }
      qr.callback = self.onSuccess;
    },
    beforeDestroy() {
      var self = this;
      self.cam.stop();
      self.stream.getTracks()[0].stop();
    },
    methods: {
      init(vid_id) {
        var self = this;
        var video = document.getElementById(vid_id);
        var options = {
          "audio": false,
          "video": true
        };
        // Replace the source of the video element with the stream from the camera
        if (navigator.getUserMedia) {
          navigator.getUserMedia(options, function (stream) {
            self.stream = stream;
            video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
          }, function (error) {
            console.log(error)
            self.$emit('OnError', error);
          });
          // Below is the latest syntax. Using the old syntax for the time being for backwards compatibility.
          // navigator.getUserMedia({video: true}, successCallback, errorCallback);
        } else {
          self.result = 'Sorry, native web camera streaming (getUserMedia) is not supported by this browser...';
          self.$emit('OnError', "No support getUserMedia");
        }
      },
      camera(p_vid_id) {
        var self = this;

        var vid_id = p_vid_id;
        var interval = 100;
        var scale = 0.5;
        var video = document.getElementById(vid_id);
        var int_id = null;

        function start() {
          int_id = setInterval(function (video, scale) { capture() }, interval);
        }

        function stop() {
          console.log("Clearing interval with id " + int_id);
          clearInterval(int_id);
        }

        function capture() {
          // console.time('capture');
          var w = self.width * scale;
          var h = self.height * scale;
          var qr_can = document.getElementById('qr-canvas').getContext('2d');
          qr_can.drawImage(video, 0, 0, w, h);
          try { qr.decode(); }
          catch (err) { self.result = err; }
          // console.timeEnd('capture');
        }

        return {
          interval: interval,
          scale: scale,
          start: start,
          stop: stop,
          capture: capture
        }
      },
      onSuccess(result, err) {
        if (result !== undefined) {
          console.log(result)
          this.result = result;
          this.$emit('OnSuccess', result);
        } else {
          console.log(err)
          this.result = err;
          this.$emit('OnError', err);
        }

      },
      uploadChange() {
        var file = document.getElementById("upload").files[0];
        var imageType = /^image\//;

        if (!imageType.test(file.type)) {
          console.log('File type not valid');
        }
        // Read file
        var reader = new FileReader();
        reader.addEventListener('load', function () {
          var image = new Image();
          image.onload = function (imageEvent) {
            // Resize the image
            var canvas = document.getElementById("qr-canvas"),
              max_size = 320,// TODO : pull max size from a site config
              width = image.width,
              height = image.height;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);

            qr.decode();
          }
          image.src = this.result
        }.bind(reader), false);
        reader.readAsDataURL(file);
      }

    }
  }

</script>

<style scoped>

</style>