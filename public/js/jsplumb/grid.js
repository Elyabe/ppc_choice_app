var disciplinas_selec = new Map(), percentual_corresp = new Map(), corresp = new Map();
var opt_pendentes = new Map(); 


$(document).ready( function() {
        var instance_current_grid;
        var instance_targe_grid;
        var current_grid = new Map();
        var target_grid = new Map();

        carregar(instance_current_grid, current_grid, "sl-current-grid","current-grid","bar-progress-current-grid");
        carregar(instance_targe_grid, target_grid, "sl-target-grid","target-grid", "bar-progress-target-grid");
        
         $("#comparar").click( function(e) {
                    
                var id_curso_atual = $("#sl-current-grid").children("option:selected").val();
                var id_curso_alvo = $("#sl-target-grid").children("option:selected").val();
                    
                if ( id_curso_atual > 0 )
                {
                   if ( id_curso_alvo > 0 )
                   {
                        $.ajax({
                        url: '/compare/' + id_curso_atual + "/" + id_curso_alvo,
                        type:'GET',
                        cache:true,
                        success: function (response) 
                        {
                            console.log(response)
                            data = response

                            percentual_corresp.clear();
                            corresp.clear();
                            data.forEach( (item) => { 
                                percentual_corresp.set( Number( item.cod_cc_corresp), 0 );
                                corresp.set( Number(item.cod_comp_curricular), item )
                            })


                            for (var i = 0; i < data.length; i++) 
                            {
                                d = data[i]
                                
                                if ( disciplinas_selec.has( Number(d.cod_comp_curricular)) )  
                                {
                                    percentual_corresp.set( Number(d.cod_cc_corresp), percentual_corresp.get(Number(d.cod_cc_corresp)) + Number(d.percentual_corresp) );
                                    let percentual_total = percentual_corresp.get(Number(d.cod_cc_corresp));

                                    $("#"  + d.cod_comp_curricular ).removeClass('selected');    

                                    if ( percentual_total >= 1 ) 
                                    {   
                                        $("#"  + d.cod_cc_corresp ).css("background-color","rgba(62,143,62)");    
                                        $("#"  + d.cod_cc_corresp ).css("color","white");
                    
                                        if ( d.percentual_corresp == 1 )
                                        {
                                            $("#"  + d.cod_comp_curricular ).css("background-color","rgba(62,143,62)");    
                                            $("#"  + d.cod_comp_curricular ).css("color", "white" )
                                        } else
                                        {
                                            $("#"  + d.cod_comp_curricular ).css("background-color","#84ab0d");    
                                            $("#"  + d.cod_comp_curricular ).css("color", "white" )                        
                                        }
                                    } else if (percentual_total > 0 )
                                    {
                                        $("#"  + d.cod_cc_corresp ).css("background-color","#84ab0d")
                                        $("#"  + d.cod_cc_corresp ).css("color","white");
                    
                                        $("#"  + d.cod_comp_curricular ).css("background-color","#84ab0d");    
                                        $("#"  + d.cod_comp_curricular ).css("color", "white" )
                                    }
                                } else if ( percentual_corresp.get(Number(d.cod_cc_corresp)) == 0)
                                {
                                    $("#"  + d.cod_cc_corresp ).css("background-color","white");    
                                    $("#"  + d.cod_cc_corresp ).css("color", "gray" )

                                }

                            }

                            for( var [k,v] of disciplinas_selec )
                            {
                                if ( !corresp.has(k) )
                                {
                                    $("#"  + k ).removeClass('selected');    
                                    $("#"  + k ).css("background-color","#925b8e");    
                                    $("#"  + k ).css("color", "white" )                                    
                                }
                            }
                            console.log( disciplinas_selec )
                            console.log(percentual_corresp)
                            console.log(corresp)
                            

                        opt_pendentes.clear();
                        var qtd_horas = 0.0;
                        for( var [k,v] of current_grid )
                        {
                            if ( !disciplinas_selec.has(k) && v.nome.includes("Optativa") )
                            {
                                opt_pendentes.set( k, v );
                            }
                        }


                        $.ajax({
                        url: '/getReaprov/' + id_curso_alvo,
                        type:'GET',
                        cache:true,
                        success: function (response) 
                        {
                            disciplina = response;

                            disciplina.forEach( (item )=> {
                            if ( disciplinas_selec.has( Number(item.cod_comp_curricular) ) ) 
                            {
                                qtd_horas +=  Number( disciplinas_selec.get( Number(item.cod_comp_curricular) ).carga_horaria );
                                // if ( perc[ % 100 ] < 1 )
                                {
                                    $("#"  + item.cod_comp_curricular ).css("background-color","#ed9121");    
                                    $("#"  + item.cod_comp_curricular ).css("color", "white" )
                                }
                            } })

                            var mit = opt_pendentes.keys();
                            for ( var i = 0; i < Math.floor( qtd_horas / 60 ); i++ )
                            {
                                var id = mit.next().value;

                                if ( corresp.has(id) )
                                {
                                var j =  corresp.get(id).cod_cc_corresp ;

                                $("#"  + j ).css("background-color","#ed9121");    
                                $("#"  + j ).css("color", "white" )
                                    
                                }
                            }
                            
                            console.log(qtd_horas)

                        } 

                        })

                        } });

                        console.log("optativas")
                        console.log(opt_pendentes)
                   } else {
                        alert('Um curso alvo deve ser selecionado!')
                   }
                    
                } else
                {
                    alert('Um curso atual deve ser selecionado.')
                }
            });
        });


function create_instance_jsplumb( nome_container )
{
  let instance = jsPlumb.getInstance({
    Endpoint: ["Dot", {radius: 2}],
    Connector:"StateMachine",
    HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 1 },
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

    return instance;
}

var initNode = function(instance, el) 
{

    instance.makeSource(el, {
        filter: ".ep",
        anchor: "Continuous",
        connectorStyle: { stroke: "#e9e9e9", strokeWidth: 1, outlineStroke: "transparent", outlineWidth: 4 },
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

    instance.fire("jsPlumbDemoNodeAdded", el);
};


var novaCC = function(instance, data, num ) {
    var d = document.createElement("div");
    var id = data["cod_comp_curricular"];
    d.className = "w";
    d.id = id;
    d.innerHTML = data.nome + "<br>(" + data.carga_horaria + " horas)";
    d.style.left = (data.periodo - 1)*140 + "px";
    d.style.top = num*85 + "px";
    instance.getContainer().appendChild(d);
    initNode(instance, d);
    return d;
};


function  carregar(instance, grid,  nome_seletor, nome_container, bar_progress ) 
{
        $("#cont-"+bar_progress).hide()
        $("#canvas-"+nome_container).hide()
        $("#toggle-button-" + nome_container).prop("disabled",true);
        

    $("#"+nome_seletor).change(function(){

        grid.clear();
        var cursoSelecionado = $(this).children("option:selected").val();
        
        if ( cursoSelecionado > 0 )
        {
            instance = create_instance_jsplumb( nome_container );
            $("#cont-"+bar_progress).show()
            $("#"+bar_progress).show()
            $("#"+bar_progress).css("width", "25%");
            $("#"+nome_container).empty();


            $.ajax({
            url: '/getGrade/' + cursoSelecionado,
            type:'GET',
            cache:true,
            success: function(response) 
            {
                // console.log(response)
                response.forEach( (item) => {
                    grid.set( Number(item.cod_comp_curricular), item );
                })

                // console.log(grid)

            

                window.jsp = instance;

                var canvas = document.getElementById(nome_container);
                var windows = jsPlumb.getSelector(".statemachine-demo .w");



               $("#"+bar_progress).css("width", "50%");
            
                 $.ajax({
                    url: '/getDep/' + cursoSelecionado,
                    type:'GET',
                    cache:true,
                    success: function(response) 
                    {
                        instance.batch( function () {
                    
                        for (var i = 0; i < windows.length; i++) {
                            initNode(instance, windows[i], true);
                        }

                        
                        var ult_periodo = 0, k = 0;

                        
                        for (var [cod, disciplina] of grid ) 
                        {
                            if ( ult_periodo == disciplina.periodo ) {k++} else { k = 0 } ;
                                ult_periodo = disciplina.periodo;

                            novaCC(instance, disciplina, k )
                        }

                        if ( nome_container == 'current-grid')
                        {
                            disciplinas_selec.clear();
                            grid.forEach( (item) => {
                               let el_disciplina = document.getElementById(item.cod_comp_curricular);
                               
                                instance.on( el_disciplina, "click", function(e) {
                                if ( disciplinas_selec.has( Number(item.cod_comp_curricular)) )
                                {   
                                    disciplinas_selec.delete( Number(item.cod_comp_curricular) );
                                    $("#"+item.cod_comp_curricular).css("background-color","white")
                                    $("#"+item.cod_comp_curricular).css("color","gray")   
                                    $("#"+item.cod_comp_curricular).removeClass('selected')
                                }
                                else
                                {
                                    disciplinas_selec.set( Number(item.cod_comp_curricular), item)
                                    // $("#"+item.cod_comp_curricular).css("background-color","#e9e9e9")
                                    // $("#"+item.cod_comp_curricular).css("color","white")
                                    
                                    $("#"+item.cod_comp_curricular).addClass('selected')
                                }
                                
                                // console.log(disciplinas_selec)
                                })
                            })
                        }    

                         grid.forEach( (item) => {
                            let el_disciplina = document.getElementById(item.cod_comp_curricular);
                         
                            instance.on(el_disciplina, "mouseover", function(e) {
                            instance.select({"source": item.cod_comp_curricular}).setHover(true);
                            instance.select({"target": item.cod_comp_curricular}).setHover(true);
                            });

                            instance.on(el_disciplina, "mouseout", function(e) {
                            instance.select({"source": item.cod_comp_curricular}).setHover(false);
                            instance.select({"target": item.cod_comp_curricular}).setHover(false);
                            });
                        })



                        $("#"+bar_progress).css("width", "75%");


                    $("#"+bar_progress).css("width", "100%");        
                    


                    jsPlumb.fire("jsPlumbDemoLoaded", instance);
                    $("#"+bar_progress).hide()
                    $("#cont-"+bar_progress).hide()
                    $('#canvas-' + nome_container).show()

                    // console.log(response)
                    response.forEach( (dep) =>
                    {
                        instance.connect({ source: dep.cod_cc_pre_requisito, target: dep.cod_comp_curricular, type:"basic" })
                    })

                    $("#toggle-button-" + nome_container).prop("disabled",false);


                        })
                    }

                })


            }
            });
                
                
            
            } 
            else 
                { $('#' + nome_container).empty();
                  $('#canvas-' + nome_container).hide();
                  $("#toggle-button-" + nome_container).prop("disabled",true);
                }

        }); 

    }   



