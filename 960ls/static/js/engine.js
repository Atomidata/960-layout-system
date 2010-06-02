var fluid = false;
$(document).ready(function(){
        
        $('#main_form').submit(function(){
                        var submit_url = $(this).attr('action').toString();
                        var main_url = submit_url.split('?')[0];
                        var rand_param = parseInt(Math.random()*10000);
                        $(this).attr('action', main_url.toString() + "?" + rand_param.toString());
                        return true;
                });
        
        $('#column_number').attr('disabled','');
        $('input[type=hidden][name=column_number]').remove();
        $('#column_number').attr('name','_column_number');
        
        $('#fluid').click(function(){
            if(!fluid){
                $('#grid_width').attr('disabled','disabled');
                $('#gutter_width').val('1');
                $('#column_width').val('7.33333');
                fluid = true;
            }
            else{
                $('#grid_width').attr('disabled','');
                $('#gutter_width').val('20');
                $('#column_width').val('60');
                fluid = false;
            }
        });
        
        $("#generate_grid_btn").click(function(){
            if(!fluid)
                generateGrid();
            else
                generateFluidGrid();
            initToolbar();
            
        });
        initAddEvts();
        initEditEvts();
       

    });

function initToolbar(){
    $("#tc div[id!=dom_toolbox]").live('mouseover',function(){
        try{
            if($(this).children("#dom_toolbox").length <1 ){			    
                var thetoolbox = $("#dom_toolbox").html();
                $("#dom_toolbox").remove();
                $(this).prepend('<div id="dom_toolbox">'+thetoolbox+'</div>');
                
                $("#dom_toolbox").css('margin-left',((parseInt($(this).width())/2)-24)+'px');
                
                 $("#add_child").click(function(){
                
                var parentEm = $(this).parent("#dom_toolbox").parent("div:first");
                $('#add_form').dialog({
                    modal:true,
                    resizable:false,
                    title: "Add child element"
                });
                
                $('#add_form').data('parentEm',parentEm);
            });
            
            $("#delete_child").click(function(){
                
                deleteChild($(this).parent("#dom_toolbox").parent("div:first"));
                
            });
                
            $("#edit_child").click(function(){
                
                var parentEm = $(this).parent("#dom_toolbox").parent("div:first");
                $('#edit_form').dialog({
                    modal:true,
                    resizable:false,
                    title: "Edit element"
                });
                
                $('#edit_columns').val($(parentEm).data('columns'));
                $('#edit_id').val($(parentEm).data('id'));
                
                $('#edit_form').data('parentEm',parentEm);			    
            });
            }
        }
        catch(e){}
    });
}

function initAddEvts(){
    
    $('#add_button').click(function(){
        var em_type = $('#add_type').val();
        var em_columns = $('#add_columns').val();
        var em_classes = $('#add_classes').val();
        var em_id = $('#add_id').val();
        if(em_type!="" && em_columns >=1){
            addChild($('#add_form').data('parentEm'),em_type,em_columns,em_classes,em_id);
        }
        else{
            alert('NO!');
        }
    });
                    
    $('#add_close').click(function(){
        $('#add_form').dialog('destroy');
    });  
}

function initEditEvts(){
    
    $('#edit_button').click(function(){		    
            var em_columns = $('#edit_columns').val();
            var em_classes = $('#edit_classes').val();
            var em_id = $('#edit_id').val();
            if(em_columns >=1){
                editChild($('#edit_form').data('parentEm'),em_columns,em_classes,em_id);
                $('#edit_form').dialog('destroy');
            }
            else{
                alert('NO!');
            }
        });
    
    $('#edit_close').click(function(){
        $('#edit_form').dialog('destroy');
    }); 
}


function generateGrid(){
    
    var grid_width = parseInt($("#grid_width").val());
    var column_number = parseInt($("#column_number").val());
    var gutter_width = parseInt($("#gutter_width").val());
            
    if(grid_width >=0 && column_number>=0 && gutter_width>=0){
        var column_width = parseInt((grid_width-column_number*gutter_width)/column_number);
        var preview_inner = '<div class="outer_gutter" style="width:'+(gutter_width/2).toString()+'px"></div>';
        for(var i = 0;i<column_number-1;i++){
            preview_inner += '<div class="column" style="width:'+column_width.toString()+'px"></div>';
            preview_inner += '<div class="gutter" style="width:'+gutter_width.toString()+'px"></div>';
        }
        preview_inner += '<div class="column" style="width:'+column_width.toString()+'px"></div>';
        preview_inner += '<div class="outer_gutter" style="width:'+(gutter_width/2).toString()+'px"></div>';
        $('#preview_box').html(preview_inner);
        $('#preview_box').width(((column_width+gutter_width)*column_number).toString()+'px');
        $('#css_link').attr('href','960.css?column_width='+column_width.toString()+'&column_number='+column_number.toString()+'&gutter_width='+gutter_width.toString());
        $('#generated_href').attr('href','960.css?column_width='+column_width.toString()+'&column_number='+column_number.toString()+'&gutter_width='+gutter_width.toString());
        $('#generated_href').show();
        $('#column_width').val(column_width);
        $('#header').attr('class','container_'+column_number.toString());
        $('#header').data('columns',column_number);
        $('#content').attr('class','container_'+column_number.toString());
        $('#content').data('columns',column_number);
        $('#footer').attr('class','container_'+column_number.toString());
        $('#footer').data('columns',column_number);
        
        $('#css_link').ready(function(){
                $('#tc').show();
                $('#tc').parent("div:first:hidden").show();
                $('#column_number').attr('name','_column_number');
                if($('input[type=hidden][name=column_number]').length>0)
                        $('input[type=hidden][name=column_number]').val($('#column_number').val());
                else
                        $('#column_number').after('<input type="hidden" name="column_number" value="'+$('#column_number').val()+'"/>');
                $('#column_number').attr('disabled','disabled');
                
            });
    }
}

function generateFluidGrid(){
    var grid_width = 100;
    var column_number = parseInt($("#column_number").val());
    var gutter_width = parseFloat($("#gutter_width").val());
            
    if(grid_width >=0 && column_number>=0 && gutter_width>=0){
        var column_width = parseFloat((grid_width-column_number*gutter_width)/column_number).toFixed(5);
        var preview_inner = '<div class="outer_gutter" style="width:'+(gutter_width/2).toString()+'%"></div>';
        for(var i = 0;i<column_number-1;i++){
            preview_inner += '<div class="column" style="width:'+column_width.toString()+'%"></div>';
            preview_inner += '<div class="gutter" style="width:'+gutter_width.toString()+'%"></div>';
        }
        preview_inner += '<div class="column" style="width:'+column_width.toString()+'%"></div>';
        preview_inner += '<div class="outer_gutter" style="width:'+(gutter_width/2).toString()+'%"></div>';
        $('#preview_box').html(preview_inner);
        $('#preview_box').width('100%');
        $('#preview_box').css('border','0 none');
        $('#css_link').attr('href','960fluid.css?column_width='+column_width.toString()+'&column_number='+column_number.toString()+'&gutter_width='+gutter_width.toString());
        $('#generated_href').attr('href','960fluid.css?column_width='+column_width.toString()+'&column_number='+column_number.toString()+'&gutter_width='+gutter_width.toString());
        $('#generated_href').show();
        $('#column_width').val(column_width);
        $('#header').attr('class','container_'+column_number.toString());
        $('#header').data('columns',column_number);
        $('#content').attr('class','container_'+column_number.toString());
        $('#content').data('columns',column_number);
        $('#footer').attr('class','container_'+column_number.toString());
        $('#footer').data('columns',column_number);
        
        $('#css_link').ready(function(){
                $('#tc').show();
                $('#tc').parent("div:first:hidden").show();
                $('#column_number').attr('name','_column_number');
                if($('input[type=hidden][name=column_number]').length>0)
                        $('input[type=hidden][name=column_number]').val($('#column_number').val());
                else
                        $('#column_number').after('<input type="hidden" name="column_number" value="'+$('#column_number').val()+'"/>');
                $('#column_number').attr('disabled','disabled');
            });
    }
}

function addChild(parentEm, type, columns, additionalClasses, id){
    
    var parent_columns = parseInt($(parentEm).data('columns'));
    
    $(parentEm).find('>div[id!=dom_toolbox]').each(function(){
            parent_columns -= parseInt($(this).data('columns'));
        });
        
    if(columns<=parent_columns){
        var elem = $('<'+type+' id="'+id+'" class="grid_'+columns+' '+additionalClasses+'">\n</'+type+'>').appendTo(parentEm);
        $(elem).data('columns',columns);
        if($(parentEm).attr('id')!="header" && $(parentEm).attr('id')!="footer" && $(parentEm).attr('id')!="content"){
            $(parentEm).children("div[id!=dom_toolbox]").removeClass("alpha");
            $(parentEm).children("div[id!=dom_toolbox]").removeClass("omega");
            $(parentEm).children("div[id!=dom_toolbox]:first").addClass('alpha');
            $(parentEm).children("div[id!=dom_toolbox]:last").addClass('omega');
        }
        layoutChanged();
    }
    else{
        alert("That action is not allowed. Not enough space left.");
    }
}

function deleteChild(childEm){
    
    var parentEm = $(childEm).parent('div:first');
    if($(childEm).attr('id')!="header" && $(childEm).attr('id')!="footer" && $(childEm).attr('id')!="content"){
        $("#dom_toolbox").appendTo($(childEm).parent("div:first"));
        $(childEm).remove();
        if($(parentEm).attr('id')!="header" && $(parentEm).attr('id')!="footer" && $(parentEm).attr('id')!="content"){
            $(parentEm).children("div[id!=dom_toolbox]:first").addClass('alpha');
            $(parentEm).children("div[id!=dom_toolbox]:last").addClass('omega');
        }
        layoutChanged();
    }
}

function editChild(childEm, columns, additionalClasses, id){
    
    var parentEm = $(childEm).parent('div:first');
    var parent_columns = parseInt($(parentEm).data('columns'));
    var inner_columns = 0;//parseInt($(childEm).data('columns'));
    var child_columns = parseInt($(childEm).data('columns'));
    
    $(parentEm).find('>div[id!=dom_toolbox]').each(function(){
            parent_columns -= parseInt($(this).data('columns'));
        });
    
    $(childEm).find('>div[id!=dom_toolbox]').each(function(){
            inner_columns += parseInt($(this).data('columns'));
        });

    if(columns<=parent_columns+child_columns && columns>= inner_columns){
        
        $(childEm).removeClass('grid_'+child_columns);
        $(childEm).removeClass('alpha');
        $(childEm).removeClass('omega');
        
        $(childEm).addClass('grid_'+columns);
        
        $(childEm).data('columns',columns);
        if($(parentEm).attr('id')!="header" && $(parentEm).attr('id')!="footer" && $(parentEm).attr('id')!="content"){
            $(parentEm).children("div[id!=dom_toolbox]:first").addClass('alpha');
            $(parentEm).children("div[id!=dom_toolbox]:last").addClass('omega');
        }
        layoutChanged();
    }
    else{
        alert("That action is not allowed. Not enough space left.");
    }
}

function layoutChanged(){
    $('#dom_toolbox').appendTo('body');
    var htm = $('#tc').html();
    htm = htm.replace(/(<div)/gmi,'\n\n< div');
    htm = htm.replace(/(< div)/gmi,'<div');
    htm = htm.replace(/(<\/div><\/div>)/gmi,'</div>\n\n</div>\n');
    $('#html_code').val('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n<head>\n<title>Your title here</title>\n</head>\n<body>'+htm+'\n</body>\n</html>');
}
