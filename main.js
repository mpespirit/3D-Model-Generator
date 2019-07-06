// Paula Espiritu
// CMPS 160 - Prog 4
// References the Matsuda Lea book

var points   = []; //Clicked points
var vertices = []; //Vertices for cylinders
var vNorms   = []; //Normals for each vertex
var poly     = []; //Indexes for polygon
var pNorms   = []; //Normals for each polygon
var drawN    = []; //Normals for draw toggle
var colors   = []; //Array for normals drawing
var meshObjs = [];

var n  = 0;
var NS = 1;

var end     = false;
var loading = false;
var toggle  = false;
var clear   = false;
var ambient = true; 
var spec    = false;
var smooth  = false;
var dir     = false;
var point   = false;
var pers    = false;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas, { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var u_NS = gl.getUniformLocation(gl.program, 'u_NS');
  var u_Amb = gl.getUniformLocation(gl.program, 'u_Amb');
  var u_Spec = gl.getUniformLocation(gl.program, 'u_Spec');
  if (!u_NS || !u_Amb || !u_Spec) {
      console.log("Failed to get the storage location of uniform variable");
      return;
  }
  
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  canvas.onmousedown  = function(ev){ click(ev, gl, canvas); };
  canvas.onmousemove  = function(ev){ hover(ev, gl, canvas); };
  if(pers) canvas.onwheel = function(ev){ mouseZoom(ev, gl, canvas); }; 
  
  var specSlider = document.getElementById("specSlider");
  var output = document.getElementById("value");
  output.innerHTML = specSlider.value;
  gl.uniform1f(u_NS, specSlider.value);
  
  // Change specular gloss value as use toggles the slider
  // Specular toggle must be turned on
  specSlider.oninput = function () {
    output.innerHTML = this.value;
    NS = this.value;
    gl.uniform1f(u_NS, NS);
    if(spec) initVertexBuffers(gl, colors); 
  }
  
  setViewProj(gl, canvas);
  if(spec) gl.uniform1i(u_Spec, 1.0);
  else gl.uniform1i(u_Spec, 0.0); 
  if(ambient) gl.uniform1i(u_Amb, 1.0);
  else gl.uniform1i(u_Amb, 0.0); 
  
  drawDirectionalLight(gl);
  drawPointLight(gl);
  
  setupIOSOR("fileName");
  
  if(end) drawCylinderObjects(gl);
}

/*-------- Helper Functions -----------*/
// Constructor Function - Coordinates
function coord(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}

// Constructor Function - Triangles
function triangle(a, b, c){
  this.a = a;
  this.b = b;
  this.c = c;
}

// Constructor for Objects
function meshObj(){
  this.verts   = [];
  this.poly    = [];
  this.colors  = [];
  this.vNorms  = [];
  this.pNorms  = [];
  this.drawN   = [];
  this.KD      = [];
  this.KA      = [];
  this.KS      = [];
  this.NS      = 1.0;
}

/*-------- User-Event Functions -----------*/
//Helper variables
var pFlag = false; var cFlag = false;

var oldX = 0;    var oldY = 0;
var orX  = 500;  var orY  = 500;   var orNF = 900;
var fov  = 40;   var pNr  = 1;     var pFr = 2000;
var ex   = 600;  var ey   = 400;   var ez = 1500;
var cx   = 0;    var cy   = 0;     var cz = 0;
var ux   = 0;    var uy   = 1;     var uz = 0; 

/*
  Manage responses to user clicks
*/
function click(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect() ;	
  var x = ((ev.clientX - rect.left) - canvas.width/2);
  var y = (canvas.height/2 - (ev.clientY - rect.top));
  
  // If user left-clicks
  if(ev.button == 0 && !end) {
    store(ev, gl, canvas, x , y, rect);
    initVertexBuffers(gl);
  }
  
  if(ev.button == 1){
    cFlag = !cFlag; 
    if(!cFlag) pFlag = true;
    canvas.addEventListener('wheel', 
      function(ev){ if(cFlag && end) cameraMove(ev, gl, canvas); }, false); 
  }
  
  if(ev.button == 0 && end){
    pFlag = true;
    oldX = x;
    oldY = y;
  }
  console.log(pFlag);

  canvas.addEventListener('mousemove',
    function(newEv){ if(pFlag && end) mousePan(newEv, gl, canvas, rect); }, false);
  canvas.addEventListener('mouseup',
    function(eve) { pFlag = false; }, false);

	// If user right-clicks
	if(ev.button == 2 && !end) {
		end = true;
		generateCylinder(gl);
  }
  
  if(end == true){
    store(ev, gl, canvas, x, y, rect); 
    drawCylinderObjects(gl);
  }
	
	//Disable right click menu - Piazza/TA Section
	canvas.addEventListener('contextmenu',function(ev){
		if(ev.button == 2){
			ev.preventDefault();
			return false;
		}
	}, false);
}

/*
  Creates rubber band line when user is hovered over the canvas
*/
function hover(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect() ;	
  var x = ((ev.clientX - rect.left) - canvas.width/2);
  var y = (canvas.height/2 - (ev.clientY - rect.top));
  
  if(end == false){ 
		// Store the coordinates
		var len = points.length;
		if(len>0){
			if (len > 1){
              points.splice(len-1);
              colors.splice(len-1);
			}

			store(ev,gl,canvas, x, y, rect);
			initVertexBuffers(gl);
		}
	}
}

/*
	Store the mouse position in the array of points
*/
function store (ev, gl, canvas, x, y, rect){
  if(end == false){
    points.push(new coord(x, y, 0));
    colors.push(new coord(0.4, 0.4, 1.0));
  } else {
    x = ev.clientX - rect.left;
    y = rect.bottom - ev.clientY;
    var px = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    
    if (px[3] == 250) { // If directional light is clicked
      dir = !dir;
    }
    if (px[3] == 245) { // If point light is clicked
      point = !point;
    }
  }
}

function mouseZoom (ev, gl, canvas){
  if(pers){
    //mouse scroll down
    if(ev.deltaY < 0 && fov < 179) fov++;
    //mouse scroll up
    if(ev.deltaY > 0 && fov > 1)   fov--; 
      
    setViewProj(gl, canvas);
    initVertexBuffers(gl);
  }
}

function mousePan (ev, gl, canvas, rect){
  var newX = ((ev.clientX - rect.left) - canvas.width/2);
  var newY = (canvas.height/2 - (ev.clientY - rect.top));
  var deltaX = newX - oldX; 
  var deltaY = newY - oldY;
  
  if(!pers){
    orX += deltaX;
    orY += deltaY;
  } else {
    ex += deltaX;
    cx += deltaX;
    ey += deltaY;
    cy += deltaY;
  }
  
  setViewProj(gl, canvas);
  initVertexBuffers(gl);
  oldX = newX; oldY = newY;
}

function cameraMove (ev, gl, canvas, rect){
  if(!pers){
    if(ev.deltaY > 0 && orNF < 1100) orNF += 5;
    if(ev.deltaY < 0 && orNF > 800) orNF -= 5;
  }
  else ez += ev.deltaY
  setViewProj(gl, canvas);
  initVertexBuffers(gl); 
}

function setViewProj (gl, canvas){
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  
  if (!u_ViewMatrix || !u_ProjMatrix) {
      console.log("Failed to get the storage location of uniform variable");
      return;
  }
  
  // Set the eye point and the viewing volume
  var viewMatrix = new Matrix4();
  var projMatrix = new Matrix4();
  if(!pers) //left, right, bottom, top, near, far
    projMatrix.setOrtho(orX-1000, orX, orY-1000, orY, orNF-1000, orNF);
  else {
    //fov, aspect, near, far
    projMatrix.setPerspective(fov, 1, pNr, pFr); 
    //eyex, eyez, eyez, centerx, centery, centerz, upx, upy, upz
    viewMatrix.setLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz); 
  }
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
}

/*-------- Cylinder Functions -----------*/

/*
	Generates the unit circle for each point clicked.
*/
function generateCylinder(gl) {
  var r = 40; 
  
  for(var i = 0; i < points.length; i++){
    var pointV = new Vector3([points[i].x, points[i].y, r]); //z vector
    var axisV; //vector created by 2 pts
    if(i == 0)
      axisV = new Vector3([points[i].x - points[i+1].x, points[i].y - points[i+1].y, 0]); 
    else
      axisV = new Vector3([points[i-1].x - points[i].x, points[i-1].y - points[i].y, 0]);
    
    for(var angle = 0; angle < 360; angle+=30)
      matrixTransformations(angle, r, pointV, axisV);
   
    if (i != 0 && i+1 < points.length){
      for(var angle = 0; angle < 360; angle+=30){
        axisV = new Vector3([points[i].x - points[i+1].x, points[i].y - points[i+1].y, 0]);
        matrixTransformations(angle, r, pointV, axisV);
      }
    }
  }
  
  if(loading == false) vertices = calcIntersect(vertices);
  drawCylinderObjects(gl);
}


/* 
  Matrix calculations to find the unit circle related to each point.
  Provided by TA/Piazza.
*/
function matrixTransformations(angle, r, pointV, axisV){
  var mat = new Matrix4();
  mat.rotate(angle, axisV.elements[0], axisV.elements[1], axisV.elements[2]);
  var transMat = new Matrix4();
  transMat.translate(pointV.elements[0], pointV.elements[1], 0);
  var combMat = transMat.multiply(mat);
  var result = combMat.multiplyVector3(new Vector3([0,0,r]));
  vertices.push(new coord(result.elements[0], result.elements[1], result.elements[2]));
}


/*
  Create an array that contains the order in which to connect the vertices to 
  create a cylinder.
*/
function drawCylinderObjects(gl) {
  vNorms = [];
  pNorms = [];
  drawN = [];
  poly = [];
  
  //Traverse through vertices and connect the indeces.
  for(var i = 0; i < vertices.length-24; i+=2){
    poly.push(new triangle(i, i+24, i+25));
    poly.push(new triangle(i+1, i, i+25));
    
    calcNormals(vertices, i);

    if((i+2)%24 == 0) i+=24;
  }
  
  calcSmooth();
  
  //this.colors  = [];
  /*
  mesh.verts  = vertices;
  mesh.poly   = poly;
  mesh.drawN  = drawN;
  mesh.vNorms = vNorms;
  mesh.pNorms = pNorms;
  */
  initVertexBuffers(gl); 
}


/*-------- Intersecting Circles -----------*/

/*
  Calculate intersecting points for points with the same z coordinate by extending
  the line. Push the new circle points into a new array that replaces the previous
  2 unit circles.
*/
function calcIntersect(vertices){
  var newArr = [];
  var count = 0;
  
  for(var i = 0; i<12; i++) newArr.push(vertices[i]);        

  //Calculate the intersecting circle using points with matching z axis from 
  //each of the 4 unit circles forming 2 connecting cylinders.
  for(var i = 0; i < (points.length-2)*24; i++){
    var Ax = vertices[i].x;      var Ay = vertices[i].y;
    var Bx = vertices[i+12].x;   var By = vertices[i+12].y;
    var Cx = vertices[i+24].x;   var Cy = vertices[i+24].y;
    var Dx = vertices[i+36].x;   var Dy = vertices[i+36].y;
    
    var a = Bx - Ax;    var d = Dy - Cy;
    var b = Dx - Cx;    var e = Cx - Ax;
    var c = By - Ay;    var f = Cy - Ay;

    var h = (1/(a*d-b*c))*(d*e+(-b)*f);
    
    var Lx = Ax+(Bx-Ax)*h; 
    var Ly = Ay+(By-Ay)*h;
    
    newArr.push(new coord(Lx,Ly,vertices[i+12].z)); 

    if((i+1)%12 == 0){
      i+=12;
    }
  }
   
  for(var i = 12; i>0; i--) newArr.push(vertices[vertices.length-i]);
  
  //Duplicate each vertex for flat shading
  var arr = newArr;
  newArr = [];
  for(var i = 0; i < arr.length; i++){
    newArr.push(arr[i]);
    if(i!=0 && i%12 != 0){ 
      newArr.push(arr[i]);
    }
    if(i!=0 && (i+1)%12 == 0){
      newArr.push(arr[i-11]);
      //change the last one to not duplicate if its the last set. HOW TO!?
      if(count!=0 && count%2!=0 && (count/2) < points.length-2) i-=12;
      count++;       
    }
  }  
  
  return newArr;
}

/*-------- Buffer Information -----------*/
function initVertexBuffers(gl) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  var colorBuffer = gl.createBuffer();
  if (!colorBuffer) 
    return -1;
  
  drawDirectionalLight(gl);
  drawPointLight(gl);
  checkLightStatus(gl);
  drawTexture(gl);
  
  var pts = new Float32Array(convertCoords(points));
  var verts = new Float32Array(convertCoords(vertices));
  var ind = new Uint16Array(convertTriangles(poly));
  if (end == false) var color = new Float32Array(convertCoords(colors));
  if (smooth == true) var normal = new Float32Array(convertCoords(vNorms));
  else var normal = new Float32Array(convertCoords(dupCoords(pNorms)));

  if(end == false){
    if (!initArrayBuffer(gl, pts, 3, gl.FLOAT, 'a_Position', 0))
      return -1;
      
    if (!initArrayBuffer(gl, color, 3, gl.FLOAT, 'a_Color', 0))
      return -1;
      
    gl.drawArrays(gl.POINTS, 0, points.length);
    gl.drawArrays(gl.LINE_STRIP, 0, points.length);
  }
  
  if(end == true) {
    var co = [];
    for(var i=0; i <verts.length;i++) co.push(1.0);
    var FSIZE = verts.BYTES_PER_ELEMENT * 3;
    if (!initArrayBuffer(gl, verts, 3, gl.FLOAT, 'a_Position', FSIZE))
      return -1;
    if (!initArrayBuffer(gl, normal, 3, gl.FLOAT, 'a_Normal', 0))
      return -1;
    if (!initArrayBuffer(gl, new Float32Array(co), 3, gl.FLOAT, 'a_Color', 0))
      return -1;
      
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, ind.length, gl.UNSIGNED_SHORT, 0);
  }
  
  if(toggle == true && drawN.length > 0) {
    var norms = new Float32Array(convertCoords(drawN));
    var c = [];
    for(var i = 0; i < drawN.length; i++) c.push(1.0, 0.0, 1.0);
    if (!initArrayBuffer(gl, new Float32Array(c), 3, gl.FLOAT, 'a_Color', 0))
      return -1;   
    if (!initArrayBuffer(gl, norms, 3, gl.FLOAT, 'a_Position', 0))
      return -1; 
    gl.drawArrays(gl.LINES, 0, drawN.length);
  }
  
}

function initArrayBuffer(gl, data, num, type, attribute, size) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, size, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

/*-------- Draw Lighting -----------*/
//Directional light from 0,0,0 to 500,500,0
function drawDirectionalLight(gl){
  var light = [  -5.0,   5.0, 0.0, 
                  5.0,  -5.0, 0.0,
                505.0, 495.0, 0.0,
                495.0, 505.0, 0.0];
  
  var r = 1.0, g = 0.0, b = 0.0, a = 0.98;
  var color = [];
  if(dir != true) r = g = b = 0.5;
  var color = [r, g, b, a,    //A = 250
               r, g, b, a,
               r, g, b, a,
               r, g, b, a ];
  
  var indBuffer = gl.createBuffer();
  var ind = [0, 1, 2, 3, 0, 2];
    
  if(!initArrayBuffer(gl, new Float32Array(light), 3, gl.FLOAT, 'a_Position'))
    return -1;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ind), gl.STATIC_DRAW);
  if(!initArrayBuffer(gl, new Float32Array(color), 4, gl.FLOAT, 'a_Color'))
    return -1;
  gl.drawElements(gl.TRIANGLES, ind.length, gl.UNSIGNED_SHORT,0);  
}

function drawPointLight(gl){
    var cube = new Float32Array([   // Vertex coordinates
       25.0, 525.0,  25.0,   -25.0, 525.0,  25.0,  // v0 , v1 | front
      -25.0, 475.0,  25.0,    25.0, 475.0,  25.0,  // v2 , v3 | front
       25.0, 525.0,  25.0,    25.0, 475.0,  25.0,  // v0 , v3 | right
       25.0, 475.0, -25.0,    25.0, 525.0, -25.0,  // v4 , v5 | right
       25.0, 525.0,  25.0,    25.0, 525.0, -25.0,  // v0 , v5 | up
      -25.0, 525.0, -25.0,   -25.0, 525.0,  25.0,  // v6 , v1 | up
      -25.0, 525.0,  25.0,   -25.0, 525.0, -25.0,  // v1 , v6 | left
      -25.0, 475.0, -25.0,   -25.0, 475.0,  25.0,  // v7 , v2 | left
      -25.0, 475.0, -25.0,    25.0, 475.0, -25.0,  // v7 , v4 | down
       25.0, 475.0,  25.0,   -25.0, 475.0,  25.0,  // v3 , v2 | down
       25.0, 475.0, -25.0,   -25.0, 475.0, -25.0,  // v4 , v7 | back
      -25.0, 525.0, -25.0,    25.0, 525.0, -25.0   // v6 , v5 | back
    ]);

    var r = 1.0, g = 1.0, b = 0.0, a = 0.96;
    if (point == false) r = g = b = 0.5;
    var color = new Float32Array([
       r, g, b, a,  r, g, b, a,  r, g, b, a,  r, g, b, a,  //A = 245
       r, g, b, a,  r, g, b, a,  r, g, b, a,  r, g, b, a, 
       r, g, b, a,  r, g, b, a,  r, g, b, a,  r, g, b, a, 
       r, g, b, a,  r, g, b, a,  r, g, b, a,  r, g, b, a, 
       r, g, b, a,  r, g, b, a,  r, g, b, a,  r, g, b, a, 
       r, g, b, a,  r, g, b, a,  r, g, b, a,  r, g, b, a
    ]);
    
    var indBuffer = gl.createBuffer();
    var ind = new Uint16Array([
       0, 1, 2, 0, 2, 3,        // front
       4, 5, 6, 4, 6, 7,        // right
       8, 9, 10, 8, 10, 11,     // up
      12, 13, 14, 12, 14, 15,   // left
      16, 17, 18, 16, 18, 19,   // down
      20, 21, 22, 20, 22, 23    // back
    ]);
    
    if (!initArrayBuffer(gl, cube, 3, gl.FLOAT, 'a_Position')) 
      return -1;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW);
    if (!initArrayBuffer(gl, color, 4, gl.FLOAT, 'a_Color')) 
      return -1;
    gl.drawElements(gl.TRIANGLES, ind.length, gl.UNSIGNED_SHORT, 0);
}

function checkLightStatus(gl){
  var u_Dir = gl.getUniformLocation(gl.program, 'u_Dir');
  var u_Point = gl.getUniformLocation(gl.program, 'u_Point');
  var u_Amb = gl.getUniformLocation(gl.program, 'u_Amb');
  if (!u_Dir || !u_Point || !u_Amb) {
      console.log("Failed to get the storage location of uniform variable");
      return;
  }
  if (dir == true) gl.uniform1i(u_Dir, 1.0);
  else gl.uniform1i(u_Dir, 0.0);
  if (point == true) gl.uniform1i(u_Point, 1.0);
  else gl.uniform1i(u_Point, 0.0); 
  if (ambient == false || (point == false && dir == false)) gl.uniform1i(u_Amb, 0.0);
  else gl.uniform1i(u_Amb, 1.0); 
}

function drawTexture(gl){
  var texCoordLocation= gl.getAttribLocation(program,"a_TexCoords");
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
  setTexCoords(gl);
}

function setTexCoords(gl){
  //coordinates
  var coords = [ 
    //coords here
    
    
  ];
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
}

/*-------- Object Conversions -----------*/
// Turn coordinate object into an array
function convertCoords(arr){
  var newArr = [];
  for(var i = 0; i < arr.length; i++){
    newArr.push(arr[i].x);
    newArr.push(arr[i].y);
    newArr.push(arr[i].z);
  }
  return newArr;
}

// Duplicate coordinate objects 
function dupCoords(arr){
  var newArr = [];
  var j = 0;
  
  for(var i = 0; i < arr.length; i++){
	newArr[j] = arr[i];
	newArr[j+1] = arr[i];
	newArr[j+24] = arr[i];
	newArr[j+25] = arr[i];
	if((i+1)%12==0) j+=26;
    else j+=2;
  }
  
  return newArr;
}

// Turn array into coordinate objects
function makeCoords(arr){
  var newArr = [];
  for(var i = 0; i < arr.length; i+=3){
    newArr.push(new coord(arr[i],arr[i+1],arr[i+2]));
  }
  return newArr;
}

// Turn polygon objects into an array
function convertTriangles(arr){
  var newArr = [];
  for(var i = 0; i < arr.length; i++){
      newArr.push(arr[i].a);
      newArr.push(arr[i].b);
      newArr.push(arr[i].c);
  }
  return newArr;
}

// Turn array into array of polygon objects
function makePoly(arr){
  var newArr = [];
  for(var i = 0; i < arr.length; i+=3){
    newArr.push(new triangle(arr[i],arr[i+1],arr[i+2]));
  }
  return newArr;
}

/*-------- HTML Button Calls -----------*/

// Save user file
function save(){
  var fileName = prompt("Please enter a file name", "default");
  saveFile(new SOR(fileName, convertCoords(vertices), convertTriangles(poly)));
}


// Load user file
function load(){
  points = [];
  vNorms = [];
  pNorms = [];
  drawN = [];
  colors = [];
  end = true;
  loading = true;
  
  
  var SORObj = readFile();
  vertices = makeCoords(SORObj.vertices);
  poly = makePoly(SORObj.indexes);

  main();
}

function normalToggle(){
  toggle = !toggle;
  main();
}

function clearCanv(){
  points   = [];
  vertices = [];
  vNorms   = [];
  poly     = [];
  pNorms   = [];
  drawN    = [];
  colors   = []; 
  meshObjs = [];

  n  = 0;
  NS = 1;

  end     = false;
  loading = false;
  toggle  = false;
  clear   = false;
  ambient = true; 
  spec    = false;
  smooth  = false;
  dir     = false;
  point   = false;
  pers    = false;
  clear   = false;

  resetCam();
}

function ambientToggle(){
  ambient = !ambient;
  main();
}

function specularToggle(){
  spec = !spec;
  main();
}

function smoothToggle(){
  smooth = !smooth;
  main();
}

function perspectiveToggle(){
  pers = !pers;
  main();
}

function resetCam(){
  pFlag = false; cFlag = false;
  
  oldX = 0; oldY = 0;
  orX  = 500;  orY  = 500;   orNF = 500;
  fov  = 40;   pNr  = 1;     pFr = 2000;
  ex   = 600;  ey   = 400;   ez = 1500;
  cx   = 0;    cy   = 0;     cz = 0;
  ux   = 0;    uy   = 1;     uz = 0; 
  
  main();
}

/*-------- Extras -----------*/


function printCoord(arr){
  var x, y, z;
  
  for(var i = 0; i < arr.length; i++){ 
    x = Math.round(arr[i].x*100)/100;
    y = Math.round(arr[i].y*100)/100;
    z = Math.round(arr[i].z*100)/100;
    
    console.log("("+x+", "+y+", "+z+")");
  }
}

function printObject(arr){
  var a, b, c;
  
  for(var i = 0; i < arr.length; i++){ 
    a = Math.round(arr[i].a*100)/100;
    b = Math.round(arr[i].b*100)/100;
    c = Math.round(arr[i].c*100)/100;
    
    console.log("("+a+", "+b+", "+c+")");
  }
}