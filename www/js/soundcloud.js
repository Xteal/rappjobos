	/* 
	IDS DE SOUNDCLOUD
	Rajobos2: 263940954
	Rajobos: 135802134
	Kevin: 166601907
	*/
	
	//Función que dispara cuando inicia la página
	$(document).on('pageinit', function() {
			//Cargo el soundmanager con sus correspondientes iconos
			$("#svgs").load("./svgdefs.svg"); 
			soundManager.setup({
				url: './swf/'
			});
			
			//Muestro icono y texto de carga
			$( "div[data-role='page']" ).loader({
				html: "<span class='ui-icon ui-icon-loading'><img src='jquery-logo.png' /><h2>is loading for you ...</h2></span>"
			});
			
			//Declaro las variables MySound que contendrá la pista de audio que se escuchará, las canciones, que contendrá la lista de las canciones, la posicion inicial de la que se está reproduciendo y la url a la api (hay que almacenar la id y la client_id en variables aparte para mayor comodidad).
			var mySound, canciones ="",posicion=1;
			var url = 'https://api.soundcloud.com/tracks/263940954?client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea';
				//Obtengo el json
				$.getJSON(url, function(tracks) {
					$.mobile.loading( "show" );
					//Almaceno cada cancion en la variable canciones, 
					$(tracks).each(function(index,value) {
						var duracionPista = convertirTiempo(value.duration);
						
						if(value.artwork_url==null) 
							value.artwork_url = "img/cover.jpg";
						
							canciones +="<li style='background:url(\""+value.waveform_url+"\")!important' data-duracion='"+value.duration+"' data-posicion='"+posicion+"' class='play_song' data-id='"+value.id+"' data-stream='"+value.stream_url+"'><a class='ui-btn' href='index.html'><img src='"+value.artwork_url+"' /><h3>"+value.title+"</h3><p>"+duracionPista.min+":"+duracionPista.sec+"</p></a></li>";
						$(".ultimas_canciones").html(canciones);
						$(".ultimas_canciones").listview("refresh");
						posicion++;
						
						//Crea el sonido en SoundManager
						soundManager.createSound({
							id: value.id,
							url: value.stream_url+"?client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea"
						});
					});
				}).promise().done(function() {
					//Cuando termina todo el proceso, oculta la pantalla de carga
					$.mobile.loading( "hide" );
				});

		//Al pinchar sobre un bloque de cancion, la reproduce		
		$(".ultimas_canciones").on("click","li",function() {
			var id = $(this).attr("data-id");
			playSong(id);
			
		});
		
		//Añado las funciones a cada botón
		$(".playBtn").click(tooglePause);
		$(".nextBtn").click(playSiguiente);
		$(".antBtn").click(playAnterior);
		$(".bucleBtn").click(toogleLoop);
		$( "#slider-12" ).on( "slidestop", function(event,ui) {
			var seleccionaPosicion = $("#slider-12").val();
			soundManager.pauseAll();
			soundManager.setPosition(seleccionaPosicion);
			$("#slider12").slider("refresh");
			soundManager.resumeAll();			
		});
		$( "#volumen" ).on( "slidestop", function(event,ui) {
			var seleccionaVolumen = $("#volumen").val();
			soundManager.setVolume(seleccionaVolumen);		
		});
		$( ".volumenBtn" ).click(function() {
		  $( ".volumeBar" ).toggle();
		});
	});
	function playNext(posicion) {
		var nuevaposicion = parseInt(posicion)+parseInt(1);
		soundManager.stopAll();
		if($("li[data-posicion='"+nuevaposicion+"']").length==0) 
			posicion = 1;
		else
			posicion = nuevaposicion;

		playSong($("li[data-posicion='"+posicion+"']").attr("data-id"));
	}

	function playSong(id) {
		var posicion = $("li[data-id='"+id+"']").attr("data-posicion");
		var titulo = $("li[data-id='"+id+"']").find("h3").html();
		var duration = $("li[data-id='"+id+"']").attr("data-duracion");
		$(".media-info").html(titulo);
		soundManager.stopAll();
		soundManager.play(id,{
			onplay:function() {
				$("#slider-12").val(0);
				$("#slider-12").attr("max",duration);
				$("#currentPlaying").val(id);
				$(".play a").attr("data-playing","true");
				$(".play a").html('<svg class="icon icon-pause2"><use xlink:href="#icon-pause2"></use></svg>');
			},
			onfinish:function() {
				if($(".bucle a").attr("data-active")=="true")
					playNext(posicion);
			},
			whileplaying:function() {
				var duracionTotal = convertirTiempo(this.position);
				$("#slider-12").val(this.position);
				$("#slider-12").slider("refresh");
				$(".duration").html(duracionTotal.min+":"+duracionTotal.sec);
			}
		});
		soundManager.setVolume($("#volumen").val());
	}

	function tooglePause() {
		if($("#currentPlaying").val()=="false") {
			playSong($("li[data-posicion='1']").attr("data-id"));
		}else {
			if($(".play a").attr("data-playing")=="true"){
				soundManager.pauseAll();
				$(".play a").attr("data-playing","false");
				$(".play a").html('<svg class="icon icon-play3"><use xlink:href="#icon-play3"></use></svg>');
			}
			else if($(".play a").attr("data-playing")=="false"){
				soundManager.resumeAll();
				$(".play a").attr("data-playing","true");
				$(".play a").html('<svg class="icon icon-pause2"><use xlink:href="#icon-pause2"></use></svg>');
			}
		}
	}
	function convertirTiempo(mil) {
		var tiempo = {
			min : (mil/1000/60) << 0,
			sec : parseInt((mil/1000) % 60)
		};
		if(tiempo.sec<10)
			tiempo.sec = "0"+tiempo.sec;
		return tiempo;
	}
	function playSiguiente() {
		var idActual = $("#currentPlaying").val();
		if(idActual!="false") {
			var nuevaposicion = parseInt($("li[data-id='"+idActual+"']").attr("data-posicion"))+parseInt(1);
			soundManager.stopAll();
			if($("li[data-posicion='"+nuevaposicion+"']").length==0) 
				posicion = 1;
			else
				posicion = nuevaposicion;

			playSong($("li[data-posicion='"+posicion+"']").attr("data-id"));
		}
	}
	function playAnterior() {
		var idActual = $("#currentPlaying").val();
		if(idActual!="false") {
			var nuevaposicion = parseInt($("li[data-id='"+idActual+"']").attr("data-posicion"))-parseInt(1);
			soundManager.stopAll();
			if($("li[data-posicion='"+nuevaposicion+"']").length==0) 
				posicion = $(".ultimas_canciones li").length;
			else
				posicion = nuevaposicion;

			playSong($("li[data-posicion='"+posicion+"']").attr("data-id"));
		}
	}
	function toogleLoop() {
		if($(".bucle a").attr("data-active")=="true")
			$(".bucle a").attr("data-active","false");
		else if($(".bucle a").attr("data-active")=="false")
			$(".bucle a").attr("data-active","true");
	}