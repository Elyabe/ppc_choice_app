$(document).ready( function() {
        carregar("curso-atual","canvas","bar-progress-curso-atual");
        carregar("curso-alvo","grade-alvo", "bar-progress-curso-alvo");
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
    d.innerHTML = /*id.substring(0, 7) +*/ data.nome + "<br>(" + data.carga_horaria + " horas)" /*<div class=\"ep\"></div>"*/;
    d.style.left = (data.periodo - 1)*140 + "px";
    d.style.top = num*85 + "px";
    instance.getContainer().appendChild(d);
    initNode(instance, d);
    return d;
};


function selection_available(instance, data, disc_sel) 
{
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
            

            console.log("Clicado " + disc_sel )
            })
        });
}


function  carregar( nome_seletor, nome_container, bar_progress ) 
{
    var disc_sel = []
    var perc = new Array(100);

    

    $("#"+nome_seletor).change(function(){

        var cursoSelecionado = $(this).children("option:selected").val();
        
        if ( cursoSelecionado > 0 )
        {
            $("#"+bar_progress).show()
            $("#"+bar_progress).css("width", "25%");

            $.ajax({
            url: '/getGrade/' + cursoSelecionado,
            type:'GET',
            cache:true,
            success: function(response) 
            {
                console.log(response)
                $("#"+nome_container).empty();
            
                let instance = create_instance_jsplumb( nome_container );

                window.jsp = instance;

                var canvas = document.getElementById(nome_container);
                var windows = jsPlumb.getSelector(".statemachine-demo .w");

      



            $("#"+bar_progress).css("width", "50%");
            // suspend drawing and initialise.
            instance.batch( function () {
                
                for (var i = 0; i < windows.length; i++) {
                    initNode(instance, windows[i], true);
                }

                
                var ult_periodo = 0, k = 0;

                data = response.grade
                for (var i = 0; i < data.length; i++) 
                {
                    if ( ult_periodo == data[i].periodo ) {k++} else { k = 0 } ;
                        ult_periodo = data[i].periodo;

                    novaCC(instance, data[i], k )
                }

                if( nome_container == 'canvas')
                selection_available( instance, data, disc_sel )

                 data.forEach( (item) => {
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

                dep = response.depend;
                for (var i = 0; i < dep.length; i++) 
                {
                    instance.connect({ source: dep[i].cod_cc_pre_requisito, target: dep[i].cod_comp_curricular, type:"basic" })
                }

            })

            $("#"+bar_progress).css("width", "100%");        
            


            jsPlumb.fire("jsPlumbDemoLoaded", instance);
            $("#"+bar_progress).hide()

            }
            });
                
                
            
            } else { $('#' + nome_container).empty();}

        });     

    }   



