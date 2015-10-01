(function( $ ) {
    $.fn.pico = function(options) {

    	var picoMenu = '<div id="sticky-main-container"><div id="add-button">Add</div><div id="menu-container" class="hidden"><div id="menu" class="hidden"><div class="menu-item summary-link">summarylink</div><div class="menu-item external-link">externallink</div><div class="menu-item video">video</div><div class="menu-item pop-up">popup</div></div></div><div id="code-container" class="hidden"><h3>HTML</h3><textarea id="html"> </textarea><h3>CSS</h3><textarea id="css"></textarea><h3>ParentClass</h3><textarea id="parent-class"></textarea></div></div>';
    	var defaults = {
    		$container : $('body'),
    	};
    	var settings = $.extend({},defaults,options);
    	var	drawMode = false;
    	var pageX = null;
    	var pageY = null;
    	var startX = null;
    	var startY = null;
    	var endX = null;
    	var endY = null;
    	var $selectedElement = null;
    	settings.$container.append($(picoMenu));
        function init() {

        }
        attachDragEvent();
        function getConfig() {
            var res;
            $.getJSON('src/cfg/config.json', function(data, textStatus) {
                res = data;
            });
        }
        function updateCode(el, w , h) {
            var offset = el.offset();
            startX = offset.left;
            startY = offset.top;
            displayCode(el, w , h);
        }
        $(picoMenu).css('display', 'block');
        function attachSelectEvent(element) {
            element.click(function(event) {
               $selectedElement = $(this);
               highlightSelectedElement();
               console.log($(this));
               console.log($selectedElement);
           });
        }
        $("#add-button").click(function(e) {
            $("#menu-container").removeClass('hidden');
        });
       
        function highlightSelectedElement() {
            $('.generated-element').removeClass('selected-element');
            $selectedElement.addClass(($selectedElement.hasClass('selected-element') ? '' : 'selected-element'));
        }
        $(".menu-item.summary-link").click(function(e) {
            if(drawMode !== true) {
                drawMode = true;
            } 
                
            elemType = 'summary-link';
        });    
        $(".menu-item.external-link").click(function(e) {
            if(drawMode !== true) drawMode = true;
            elemType = 'external-link';
        });        
        $(".menu-item.video").click(function(e) {
            if(drawMode !== true) drawMode = true;
            elemType = 'video';
        });        
        $(".menu-item.pop-up").click(function(e) {
            if(drawMode !== true) drawMode = true;
            elemType = 'info-plus';
        });

        settings.$container.mousedown(function(e) {
            if(drawMode === true) {
            settings.$container.addClass('draw-mode');
                startX = e.offsetX ;
                startY = e.offsetY;
                pageX = e.pageX;
                pageY = e.pageY;
            }
        });
        settings.$container.mouseup(function(e) {
            settings.$container.removeClass('draw-mode');
            if(drawMode === true) {
                if(isNumeric(startX) && isNumeric(startY)) {
                    endX = e.offsetX;
                    endY = e.offsetY;
                    draw($(this));
                }
                drawMode = false;
            }
        })
        function attachDragEvent() {
            interact('.draggable').draggable({
                // enable inertial throwing
                inertia: true,
                // keep the element within the area of it's parent
                restrict: {
                  restriction: "parent",
                  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                },

                // call this function on every dragmove event
                onmove: dragMoveListener,
                onend:function(event) {
                    drawMode = true;
                    var element = $(event.target);
                    updateCode(element, element.width(), element.height() );
                }
              }).resizable({
                edges: { left: true, right: true, bottom: true, top: true }
              }).on('resizemove', function (event) {
                drawMode = false;
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                // update the element's style
                target.style.width  = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';
                target.style.cursor = event.rect.height + 'px';

                // translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                target.style.webkitTransform = target.style.transform =
                    'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                target.textContent = event.rect.width + '×' + event.rect.height;
              }).on('resizeend', function(event) {
                drawMode = true;
                var element = $(event.target);
                updateCode(element, element.width(), element.height());
              });
        }
        function dragMoveListener (event) {

          drawMode = false;
          var target = event.target,
              // keep the dragged position in the data-x/data-y attributes
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          // translate the element
          target.style.webkitTransform =
          target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';

          // update the posiion attributes
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          return false;
        }

        // this is used later in the resizing demo
        window.dragMoveListener = dragMoveListener;
        function draw(element) {
            var width = Math.abs(endX - startX);
            var height = Math.abs(endY - startY)-5;
            var uuid = generateUUID();
            var el = '';
            switch(elemType) {
                case "summary-link":
                    // el = '<a data-to-page="" href="" id="'+uuid+'" class="generated-element summary-link transparent-link"></a>';
                    el = '<div data-to-page="" id="'+uuid+'" class="generated-element summary-link transparent-link"></div>';
                    break;  
                case "external-link":
                    el = '<a target="_blank" href="#" id="'+uuid+'" class="generated-element transparent-link"></a>';
                    break;
                case "video":
                    el = '<video id="'+uuid+'" class="video-page-23" width="554" height="311" poster="" controls="controls"><source src="" type="video/mp4"></video>';
                    break;
                case "info-plus":
                    el = '<a href="#infos-plus" id="'+uuid+'" class="info-plus infos-plus'+uuid+'">&nbsp;</a>';
                    break;
            }
            element.append(el);
            $("#"+uuid).css('position', 'absolute');
            $("#"+uuid).css('top', startY);
            $("#"+uuid).css('left', startX);
            if(elemType === "video") {
                $("#"+uuid).attr('width', width);
                $("#"+uuid).attr('height', height);
            } else {
                $("#"+uuid).css('width', width);
                $("#"+uuid).css('height', height);
            }
            $("#"+uuid).addClass('draggable');
            attachDragEvent();
            attachSelectEvent($("#"+uuid));
            displayCode($("#"+uuid), width, height);
        }
        function displayCode(element, width, height) {
            
            $("#code-container").removeClass('hidden');
            $("#code-container #html").text(element[0].outerHTML);
            var className = element.attr('class');
            var parentClass = element.parent().attr('class');
            var css = [" {\n\ttext-decoration: none",
                       "display: block",
                       "width: "+Math.round(width)+"px",
                       "height: "+Math.round(height)+"px",
                       "top: "+Math.round(startY)+"px",
                       "left: "+Math.round(startX)+"px",
                       "position: absolute",
                       "z-index: 500;\n}"];
            var cssText = css.join(';\n\t');
            $("#code-container #css").text(className+ cssText);
            $("#code-container #parent-class").text(parentClass);
        }
        function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }
        function generateUUID(){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        }
    };
 
}( jQuery ));