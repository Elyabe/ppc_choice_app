var disciplinas_selec = new Map(), percentual_corresp = new Map(), corresp = new Map();
var perc = new Array(100);

$(document).ready( function() {
        carregar("sl-current-grid","current-grid","bar-progress-current-grid");
        carregar("sl-target-grid","target-grid", "bar-progress-target-grid");
        
         $("#comparar").click( function(e) {
                    
                    var id_curso_atual = $("#sl-current-grid").children("option:selected").val();
                    var id_curso_alvo = $("#sl-target-grid").children("option:selected").val();
                    
                    if ( id_curso_atual > 0 )
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
                            data.forEach( (item) => { percentual_corresp.set( Number( item.cod_cc_corresp), 0 ) })


                            for (var i = 0; i < data.length; i++) 
                            {
                                d = data[i]
                                
                                if ( disciplinas_selec.has( Number(d.cod_comp_curricular)) )  
                                {
                                    percentual_corresp.set( Number(d.cod_cc_corresp), percentual_corresp.get(Number(d.cod_cc_corresp)) + Number(d.percentual_corresp) );
                                    let percentual_total = percentual_corresp.get(Number(d.cod_cc_corresp));
                                    if ( percentual_total >= 1 ) 
                                    {   
                                        $("#"  + d.cod_cc_corresp ).css("background-color","rgba(33,94,33)");    
                                        $("#"  + d.cod_cc_corresp ).css("color","white");
                    
                                        $("#"  + d.cod_comp_curricular ).css("background-color","rgba(33,94,33," + d.percentual_corresp + ")");    
                                        $("#"  + d.cod_comp_curricular ).css("color", "white" )
                                    } else if (percentual_total > 0 )
                                    {
                                        $("#"  + d.cod_cc_corresp ).css("background-color","rgba(33,94,33," + percentual_total + ")")
                                        $("#"  + d.cod_cc_corresp ).css("color","black");
                    
                                        $("#"  + d.cod_comp_curricular ).css("background-color","rgba(33,94,33," + d.percentual_corresp + ")");    
                                        $("#"  + d.cod_comp_curricular ).css("color", "black" )
                                    }
                                } else if ( percentual_corresp.get(Number(d.cod_cc_corresp)) == 0)
                                {
                                    $("#"  + d.cod_cc_corresp ).css("background-color","white");    
                                    $("#"  + d.cod_cc_corresp ).css("color", "gray" )
                                }

                            }
                            console.log( disciplinas_selec.get(1) )
                            console.log(percentual_corresp)
                            
                        } });

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
                                // if ( perc[ % 100 ] < 1 )
                                {
                                    $("#"  + item.cod_comp_curricular ).css("background-color","#ff0");    
                                    $("#"  + item.cod_comp_curricular ).css("color", "black" )
                                }
                            } })

                        } })
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


function  carregar( nome_seletor, nome_container, bar_progress ) 
{
    var grid = new Map();

        $("#cont-"+bar_progress).hide()
        $("#canvas-"+nome_container).hide()
        $("#toggle-button-" + nome_container).prop("disabled",true);
    var instance = create_instance_jsplumb( nome_container );

    $("#"+nome_seletor).change(function(){

        grid.clear();
        var cursoSelecionado = $(this).children("option:selected").val();
        
        if ( cursoSelecionado > 0 )
        {
            $("#cont-"+bar_progress).show()
            $("#"+bar_progress).show()
            $("#"+bar_progress).css("width", "25%");


            $.ajax({
            url: '/getGrade/' + cursoSelecionado,
            type:'GET',
            cache:true,
            success: function(response) 
            {
                console.log(response)
                response.forEach( (item) => {
                    grid.set( Number(item.cod_comp_curricular), item );
                })

                console.log(grid)

                $("#"+nome_container).empty();
            

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
                                }
                                else
                                {
                                    disciplinas_selec.set( Number(item.cod_comp_curricular), item)
                                    $("#"+item.cod_comp_curricular).css("background-color","blue")
                                    $("#"+item.cod_comp_curricular).css("color","white")
                                }
                                
                                console.log(disciplinas_selec)
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

                    console.log(response)
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



