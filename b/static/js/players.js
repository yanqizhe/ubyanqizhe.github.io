(function($){'use strict';var isEnabled=g1.config.use_gif_player;g1.gifPlayer=function($scope){if(!isEnabled){return}
if(!$scope){$scope=$('body')}
if(typeof XMLHttpRequest.prototype.overrideMimeType==='undefined'){return}
g1.gifPlayerIncludeSelectors=['.entry-content img.aligncenter[src$=".gif"]','.entry-content .aligncenter img[src$=".gif"]','img.g1-enable-gif-player','.entry-featured-media-main img[src$=".gif"]','.entry-tpl-stream .entry-featured-media img[src$=".gif"]','.entry-tpl-grid-l .entry-featured-media img[src$=".gif"]'];g1.gifPlayerExcludeSelectors=['.ajax-loader','.g1-disable-gif-player','.wp-block-image.g1-disable-gif-player img[src$=".gif"]'];$(g1.gifPlayerIncludeSelectors.join(','),$scope).not(g1.gifPlayerExcludeSelectors.join(',')).each(function(){var $img=$(this);var imgClasses=$img.attr('class');var imgSrc=$img.attr('src');var gifObj=new SuperGif({gif:this,auto_play:0});var $gitIndicator=$('<span class="g1-indicator-gif g1-loading">');gifObj.load(function(){var frames=gifObj.get_length();var $canvasWrapper=$(gifObj.get_canvas()).parent();if(frames>1){gifObj.isPlaying=!1;var playRef=gifObj.play;var pauseRef=gifObj.pause;var playGif=function(){playRef();gifObj.isPlaying=!0;$gitIndicator.addClass('g1-indicator-gif-playing')};var pauseGif=function(){pauseRef();gifObj.isPlaying=!1;$gitIndicator.removeClass('g1-indicator-gif-playing')};gifObj.play=playGif;gifObj.pause=pauseGif;$canvasWrapper.on('click',function(e){e.preventDefault();if(gifObj.isPlaying){pauseGif()}else{playGif()}});$gitIndicator.toggleClass('g1-loading g1-loaded');$(document).trigger('bimberGifPlayerLoaded',[$canvasWrapper])}else{$gitIndicator.remove()}});var $canvasWrapper=$(gifObj.get_canvas()).parent();$canvasWrapper.addClass(imgClasses+' g1-enable-share-links').attr('data-img-src',imgSrc).append($gitIndicator).data('gifPlayer',gifObj)})};$('body').on('g1NewContentLoaded',function(e,$newContent){g1.gifPlayer($newContent)})})(jQuery);(function($){'use strict';var selectors={'iframe':'iframe','mp4':'.mejs-video','gif':'.jsgif','html5Video':'.snax-native-video','embedly':'.embedly-card iframe','maceYT':'.mace-youtube'};g1.mediaPlayers={};g1.getMediaPlayer=function(element){var player=$(element).data('g1MediaPlayer');if(player){g1.log('Returning a player ('+player.getType()+') assigned to the element.');return player}
var $iframe=$(selectors.iframe,element);if($iframe.length>0){var iframesrc=!1;if($iframe.attr('data-src')){iframesrc=$iframe.attr('data-src')}else{iframesrc=$iframe.attr('src')}
if(iframesrc){if(iframesrc.indexOf('youtu')>0){player=g1.mediaPlayers.youtube($iframe);$(element).data('g1MediaPlayer',player);return player}
if(iframesrc.indexOf('vimeo')>0){player=g1.mediaPlayers.vimeo($iframe);$(element).data('g1MediaPlayer',player);return player}
if(iframesrc.indexOf('dailymotion')>0){player=g1.mediaPlayers.dailymotion($iframe);$(element).data('g1MediaPlayer',player);return player}
if(iframesrc.indexOf('gfycat')>0){player=g1.mediaPlayers.gfycat($iframe);$(element).data('g1MediaPlayer',player);return player}}
return!1}
var $mp4=$(selectors.mp4,element);if($mp4.length>0){var playerId=$mp4.attr('id');if(playerId&&mejs&&typeof mejs.players!=='undefined'){if(typeof mejs.players[playerId]!=='undefined'){var mejsPlayer=mejs.players[playerId];player=g1.mediaPlayers.mp4(mejsPlayer);$(element).data('g1MediaPlayer',player);return player}}
return!1}
var $gif=$(selectors.gif,element);if($gif.length>0){var gifPlayer=$gif.data('gifPlayer');if(gifPlayer){player=g1.mediaPlayers.gif(gifPlayer);$(element).data('g1MediaPlayer',player);return player}
return!1}
var $maceYT=$(selectors.maceYT,element);var $html5=$(selectors.html5Video,element);if($html5.length>0){player=g1.mediaPlayers.html5video($html5[0]);$(element).data('g1MediaPlayer',player);return player}
if(typeof embedly!=='undefined'){var $embedly=$(selectors.embedly,element);if($embedly.length>0){embedly('player',function(embedlyPlayer){if($embedly[0]===$(embedlyPlayer.frame.elem)[0]){player=g1.mediaPlayers.embedly(embedlyPlayer);$(element).data('g1MediaPlayer',player);return player}else{player.pause()}});return!1}else{embedly('player',function(player){player.pause()})}}
if($maceYT.length>0){$maceYT.find('.mace-play-button').trigger('click');$maceYT.on('maceIframeLoaded',function(e,$iframe){player=g1.getMediaPlayer($maceYT);$(element).data('g1MediaPlayer',player)});return!1}}})(jQuery);(function($){'use strict';g1.mediaPlayers.youtube=function($iframe){let obj={};let isPlaying=!1;function init(){g1.log('YouTube player object initialized');$iframe.on('load',function(){$iframe[0].contentWindow.postMessage(JSON.stringify({'event':'command','func':'mute','args':''}),'*')});let iframesrc='';let separator='?';if($iframe.attr('data-src')){iframesrc=$iframe.attr('data-src')}else{iframesrc=$iframe.attr('src')}
if(iframesrc.indexOf('?')>0){separator='&'}
$iframe.attr('src',iframesrc+separator+'autoplay=1&enablejsapi=1&loop=1');return obj}
obj.getType=function(){return'YouTube'};obj.play=function(){$iframe[0].contentWindow.postMessage(JSON.stringify({'event':'command','func':'playVideo','args':''}),'*');isPlaying=!0};obj.pause=function(){$iframe[0].contentWindow.postMessage(JSON.stringify({'event':'command','func':'pauseVideo','args':''}),'*');isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.vimeo=function($iframe){let obj={};let isPlaying=!1;function init(){g1.log('Vimeo player object initialized');$iframe.on('load',function(){$iframe[0].contentWindow.postMessage(JSON.stringify({method:'setVolume',value:0}),'*')});let iframesrc='';let separator='?';if($iframe.attr('data-src')){iframesrc=$iframe.attr('data-src')}else{iframesrc=$iframe.attr('src')}
if(iframesrc.indexOf('?')>0){separator='&'}
$iframe.attr('src',iframesrc+separator+'autoplay=1&autopause=0');return obj}
obj.getType=function(){return'Vimeo'};obj.play=function(){$iframe[0].contentWindow.postMessage(JSON.stringify({method:'play'}),'*');isPlaying=!0};obj.pause=function(){$iframe[0].contentWindow.postMessage(JSON.stringify({method:'pause'}),'*');isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.dailymotion=function($iframe){let obj={};let isPlaying=!1;function init(){g1.log('DailyMotion player object initialized');let iframesrc='';let separator='?';if($iframe.attr('data-src')){iframesrc=$iframe.attr('data-src')}else{iframesrc=$iframe.attr('src')}
if(iframesrc.indexOf('?')>0){separator='&'}
$iframe.attr('src',iframesrc+separator+'autoplay=1&api=postMessage&mute=1');return obj}
obj.getType=function(){return'DailyMotion'};obj.play=function(){$iframe[0].contentWindow.postMessage('play','*');isPlaying=!0};obj.pause=function(){$iframe[0].contentWindow.postMessage('pause','*');isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.gfycat=function($iframe){let obj={};let isPlaying=!1;function init(){g1.log('Gfycat player object initialized');return obj}
obj.getType=function(){return'Gfycat'};obj.play=function(){$iframe[0].contentWindow.postMessage('play','*');isPlaying=!0};obj.pause=function(){$iframe[0].contentWindow.postMessage('pause','*');isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.mp4=function(mejsPlayer){let obj={};let isPlaying=!1;function init(){g1.log('MP4 player initialized');mejsPlayer.setMuted(!0);mejsPlayer.media.addEventListener('ended',function(){mejsPlayer.play()},!1);return obj}
obj.getType=function(){return'MP4'};obj.play=function(){mejsPlayer.play();isPlaying=!0};obj.pause=function(){mejsPlayer.pause();isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.gif=function(gifPlayer){let obj={};function init(){g1.log('GIF player initialized');return obj}
obj.getType=function(){return'GIF'};obj.play=function(){gifPlayer.play()};obj.pause=function(){gifPlayer.pause()};obj.isPlaying=function(){return gifPlayer.isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.html5video=function(video){let obj={};let isPlaying=!1;function init(){g1.log('HTML5 Video player initialized');return obj}
obj.getType=function(){return'HTML5 Video'};obj.play=function(){video.play();isPlaying=!0};obj.pause=function(){video.pause();isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';g1.mediaPlayers.embedly=function(embedlyPlayer){let obj={};let isPlaying=!1;function init(){g1.log('Embedly player initialized');embedlyPlayer.mute();return obj}
obj.getType=function(){return'Embedly'};obj.play=function(){embedlyPlayer.play();isPlaying=!0};obj.pause=function(){embedlyPlayer.pause();isPlaying=!1};obj.isPlaying=function(){return isPlaying};return init()}})(jQuery);(function($){'use strict';var selectors={'postMedia':'.archive-body-stream .entry-tpl-stream .entry-featured-media:not(.entry-media-nsfw-embed)'};g1.isAutoPlayEnabled=g1.config.auto_play_videos&&!g1.isTouchDevice();var players={};g1.autoPlayVideo=function(){if(!g1.isAutoPlayEnabled){return}
var pauseAllVideos=function(){g1.log('Pausing all videos');for(var i in players){players[i].pause()}};var play=function(element){var postId=$(element).parents('article').attr('id');g1.log('Trying to play media...');var player=g1.getMediaPlayer(element);if(!player){g1.log('Media player not defined for the element');return}
pauseAllVideos();player.play();g1.log(player.getType()+' played');if(!players[postId]){players[postId]=player}};var pause=function(element){g1.log('Trying to pause media...');var player=g1.getMediaPlayer(element);if(!player){g1.log('Media player not defined for the element');return}
player.pause();g1.log(player.getType()+' paused')};var bindEvents=function(){var scrollEvents=0;var allowPlaying=!1;$(document).scroll(function(){scrollEvents++;if(scrollEvents>5){allowPlaying=!0}});$(selectors.postMedia).waypoint(function(direction){if('down'===direction){if(allowPlaying){g1.log(['>>> ENTER post (direction: DOWN)',this.element]);play(this.element)}}},{offset:'bottom-in-view'});$(selectors.postMedia).waypoint(function(direction){if('up'===direction){if(allowPlaying){g1.log(['>>> ENTER post (direction: UP)',this.element]);play(this.element)}}},{offset:'0'});$(selectors.postMedia).waypoint(function(direction){if('down'===direction){g1.log(['>>> EXIT post (direction: DOWN)',this.element]);pause(this.element)}},{offset:function(){return-Math.round(this.element.clientHeight/2)}});$(selectors.postMedia).waypoint(function(direction){if('up'===direction){g1.log(['>>> EXIT post (direction: UP)',this.element]);pause(this.element)}},{offset:function(){var viewportHeight=Math.max(document.documentElement.clientHeight,window.innerHeight||0);return viewportHeight-Math.round(this.element.clientHeight/2)}});$(selectors.postMedia).on('bimber:play',function(){g1.log(['>>> PLAY ',$(this).get(0)]);play($(this).get(0))});$(selectors.postMedia).on('bimber:pause',function(){g1.log(['>>> PAUSE ',$(this).get(0)]);pause($(this).get(0))})};bindEvents()}})(jQuery);(function($){'use strict';$(document).ready(function(){g1.gifPlayer();g1.autoPlayVideo()})})(jQuery)