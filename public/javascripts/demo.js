$(document).ready( function() {
        carregar("curso-atual","canvas","bar-progress-curso-atual");
        carregar("curso-alvo","grade-alvo", "bar-progress-curso-alvo");
        });


    function comparar_grades( sel_curso_atual, sel_curso_alvo )
    {
        /*var id_curso_atual = $("#"+sel_curso_atual).children("option:selected").val();
        var id_curso_alvo = $("#"+sel_curso_alvo).children("option:selected").val();
        

        $.ajax({
         url: '/compare/' + id_curso_atual + "/" + id_curso_alvo,
         type:'GET',
         cache:true,
         success: function (response) {
             console.log(response.equiv)

        data = response.grade
        for (var i = 0; i < data.length; i++) 
        {
            instance.select({"source": data[i].cod_}).setHover(true);
        }
         }
        });*/
    }


function  carregar( nome_seletor, nome_container, bar_progress ) {
    var disc_sel = []

    

    $("#"+nome_seletor).change(function(){

        var cursoSelecionado = $(this).children("option:selected").val();
        
        $("#"+bar_progress).show()
        $("#"+bar_progress).css("width", "25%");

        $.ajax({
         url: '/getGrade/' + cursoSelecionado,
         type:'GET',
         cache:true,
         success: function(response){
             
 
             console.log(response)
             // console.log(response["cod_comp_curricular"])

             $("#"+nome_container).empty();

    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 2}],
        Connector:"StateMachine",
        HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 2 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 5,
                foldback: 0.8,
                width: 10
            } ]/*,
            [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]*/
        ],
        Container: nome_container
    });

    // instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });
    instance.registerConnectionType("basic", { anchor:"Continuous", 
        connector:"Flowchart", 
        paintStyle : { strokeWidth : 1} });

    window.jsp = instance;

    // var seletorCurso = document.getElementById("curso-atual");
    var canvas = document.getElementById(nome_container);
    var windows = jsPlumb.getSelector(".statemachine-demo .w");

    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: instance.bind("click", instance.deleteConnection), but I wanted to make it clear what was
    // happening.
   /* instance.bind("click", function (c) {
        instance.deleteConnection(c);
    });*/

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
 /*   instance.bind("connection", function (info) {
        // info.connection.getOverlay("label").setLabel(info.connection.id);
    });*/

    // Cria um nova disciplina ao ocorrer um duplo-clique
    /*jsPlumb.on(canvas, "dblclick", function(e) {
        newNode(e.offsetX, e.offsetY);
    });*/

    /*instance.on(seletorCurso, "change", function(e) {
        // newNode(e.offsetX+15, e.offsetY+200);
        console.log("Teste");
    });
*/
    instance.on(canvas, "dblclick", function(e) {
        instance.select({"source": "1"}).setHover(true);
        // instance.getConnections("1").setHover(true);
    });





    

    instance.on( document.getElementById("comparar"), "click", function(e) {
        
        var id_curso_atual = $("#curso-atual").children("option:selected").val();
        var id_curso_alvo = $("#curso-alvo").children("option:selected").val();
        

        $.ajax({
         url: '/compare/' + id_curso_atual + "/" + id_curso_alvo,
         type:'GET',
         cache:true,
         success: function (response) {
             console.log(response.equiv)

            
            data = response.equiv
            // data.forEach( (item) => {
            //     disc_sel.push(item.cod_comp_curricular) 
            //     console.log("Adicionado", disc_sel)   
            // })
            
            var perc = new Array(100);
            perc.fill(0,0,100);

            for (var i = 0; i < data.length; i++) 
            {
                d = data[i]
                
                if ( disc_sel.indexOf(d.cod_comp_curricular) > -1 )  
                {
                    perc[ d.cod_cc_corresp % 100 ] += d.percentual_corresp;
                    if ( perc[ d.cod_cc_corresp % 100 ] >= 1 ) 
                    {   
                        $("#"  + d.cod_cc_corresp ).css("background-color","green");    
                        $("#"  + d.cod_cc_corresp ).css("color","white");
    
                        $("#"  + d.cod_comp_curricular ).css("background-color","rgba(0,255,0," + d.percentual_corresp + ")");    
                        $("#"  + d.cod_comp_curricular ).css("color", "black" )
                    } else if ( perc[ d.cod_cc_corresp % 100 ] > 0 )
                    {
                        $("#"  + d.cod_cc_corresp ).css("background-color","rgba(0,255,0," + perc[ d.cod_cc_corresp % 100 ] % 2 + ")")
                        $("#"  + d.cod_cc_corresp ).css("color","white");
    
                        $("#"  + d.cod_comp_curricular ).css("background-color","rgba(0,255,0," + d.percentual_corresp + ")");    
                        $("#"  + d.cod_comp_curricular ).css("color", "black" )
                    }
                }
            }
            console.log(perc)
            
            }
            });
        
    });




    //
    // initialise element as connection targets and source.
    //
    var initNode = function(el) {

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { stroke: "#a0a0a0", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            extract:{
                "action":"the-action"
            },
            maxConnections: 10,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: true
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    };

    /*var newNode = function(x, y) {
        var d = document.createElement("div");
        //var id = jsPlumbUtil.uuid();
        var id = "disciplina" + jsPlumbUtil.uuid();
        d.className = "w";
        d.id = id;
        d.innerHTML = id.substring(0, 7) + "<div class=\"ep\"></div>";
        d.style.left = x + "px";
        d.style.top = y + "px";
        instance.getContainer().appendChild(d);
        initNode(d);
        return d;
    };
*/

    var novaCC = function( data, num ) {
        var d = document.createElement("div");
        //var id = jsPlumbUtil.uuid();
        var id = data["cod_comp_curricular"];
        d.className = "w";
        d.id = id;
        d.innerHTML = /*id.substring(0, 7) +*/ data.nome + "<br>(" + data.carga_horaria + " horas)" /*<div class=\"ep\"></div>"*/;
        d.style.left = (data.periodo - 1)*140 + "px";
        d.style.top = num*80 + "px";
        instance.getContainer().appendChild(d);
        initNode(d);
        return d;
    };


    $("#"+bar_progress).css("width", "50%");
    // suspend drawing and initialise.
    instance.batch(function () {
        
        for (var i = 0; i < windows.length; i++) {
            initNode(windows[i], true);
        }

        
        var ult_periodo = 0, k = 0;

        data = response.grade
        for (var i = 0; i < data.length; i++) 
        {
            if ( ult_periodo == data[i].periodo ) {k++} else { k = 0 } ;
                ult_periodo = data[i].periodo;

            novaCC( data[i], k )
        }

         data.forEach( (item) => {
            let el_disciplina = document.getElementById(item.cod_comp_curricular);
            instance.on( el_disciplina, "click", function(e) {
            
            var pos = disc_sel.indexOf(item.cod_comp_curricular)
            if ( pos > -1 )
            {    
                disc_sel.splice( pos, 1 )
                $("#"+item.cod_comp_curricular).css("background-color","white")
                $("#"+item.cod_comp_curricular).css("color","gray")   
            }
            else
            {
                disc_sel.push(item.cod_comp_curricular)
                $("#"+item.cod_comp_curricular).css("background-color","blue")
                $("#"+item.cod_comp_curricular).css("color","white")
            }
            

            console.log("Clicado " + item.cod_comp_curricular + disc_sel )
            })

            instance.on(el_disciplina, "mouseover", function(e) {
            instance.select({"source": item.cod_comp_curricular}).setHover(true);
            });

            instance.on(el_disciplina, "mouseout", function(e) {
            instance.select({"source": item.cod_comp_curricular}).setHover(false);
            });
        })



        $("#"+bar_progress).css("width", "75%");

        dep = response.depend;
        for (var i = 0; i < dep.length; i++) 
        {
            instance.connect({ source: dep[i].cod_cc_pre_requisito, target: dep[i].cod_comp_curricular, type:"basic" })
        }

    })

        $("#"+bar_progress).css("width", "100%");        
        

        // and finally, make a few connections
        // instance.connect({ source: "1", target: "6", type:"basic" })

        jsPlumb.fire("jsPlumbDemoLoaded", instance);
       // $("#" + bar_progress ).closest('.progress').fadeOut();
        $("#"+bar_progress).hide()
        }
        });
        
        
    
    });     
    /*function abrir_secao(secao){
        window.open(""+secao+"", "_parent");
    }*/ 

    }   



