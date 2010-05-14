$.fn.livescape = function(options){
            var landscape = this;
            this.w = (options.width)?(options.width):(0);
            this.h = (options.height)?(options.height):(0);
            this.bg_url = (options.background_image)?(options.background_image):("");
            
            if(this.w!=0)
                $(this).width(this.w);
            
            if(this.h!=0)
                $(this).height(this.h);
            
            if(this.bg_url!="")
                $(this).css('background-image',"url("+this.bg_url+")");
            
            $(this).css('position',"relative");
            
            $.each(options.objects,function(){
                    var obj = this;
                    
                    var jqob = $('<div class="moving-object"><img src="'+this.image+'"/></div>');
                    if(obj.href){
                        var target = (obj.target)?(obj.target):("")
                        var jqob = $('<div class="moving-object"><a target="'+target+'" href="'+obj.href+'"><img style="border:0 none;" src="'+this.image+'"/></a></div>');
                    }
                    
                    $(jqob).css("position","absolute");
                    if(obj.fade)
                        $(jqob).css('display',"none");
                    $(jqob).appendTo(landscape);
                    
                    obj.anim = function(){
                        
                        var start_x = (this.start_x)?(this.start_x):((Math.random()*parseInt($(landscape).width())).toString()+"px");
                        var start_y = (this.start_y)?(this.start_y):((Math.random()*parseInt($(landscape).height())).toString()+"px");
                        var end_x = (this.end_x)?(this.end_x):((Math.random()*parseInt($(landscape).width())).toString()+"px");
                        var end_y = (this.end_y)?(this.end_y):((Math.random()*parseInt($(landscape).height())).toString()+"px");
                        var duration = (obj.duration)?(obj.duration):(parseInt(Math.random()*10000));
                        
                        $(jqob).css("left",start_x);
                        $(jqob).css("top",start_y);
                        $(jqob).fadeIn();
                        $(jqob).animate({left:end_x, top:end_y},duration,function(){
                                if(obj.fade)
                                    $(jqob).fadeOut("normal",function(){
                                            if(obj.loop){
                                                var pause = (obj.pause)?(obj.pause):(0);
                                                setTimeout(function(){obj.anim()},pause);                                    
                                            }
                                        });
                                else
                                    if(obj.loop){
                                        var pause = (obj.pause)?(obj.pause):(0);
                                        setTimeout(function(){obj.anim()},pause);                                    
                                    }
                            }); 
                    }
                    obj.anim();
                });
        }