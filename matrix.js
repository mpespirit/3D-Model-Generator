// Matrix Helper Functions

function add2(p1, p2){
	var x1 = p1.x; var x2 = p2.x;
	var y1 = p1.y; var y2 = p2.y;
	var z1 = p1.z; var z2 = p2.z;
	var add = new coord(x2+x1, y2+y1, z2+z1);
	
	return add;
}

function add3(p1, p2, p3){
	var x1 = p1.x; var x2 = p2.x;	var x3 = p3.x;
	var y1 = p1.y; var y2 = p2.y;	var y3 = p3.y;
	var z1 = p1.z; var z2 = p2.z;	var z3 = p3.z;
	var add = new coord(x1+x2+x3, y1+y2+y3, z1+z2+z3);
	
	return add;
}

function add4(p1, p2, p3, p4){
	var x1 = p1.x; var x2 = p2.x;	var x3 = p3.x; var x4 = p4.x;
	var y1 = p1.y; var y2 = p2.y;	var y3 = p3.y; var y4 = p4.y;
	var z1 = p1.z; var z2 = p2.z;	var z3 = p3.z; var z4 = p4.z;
	var add = new coord(x1+x2+x3+x4, y1+y2+y3+y4, z1+z2+z3+z4);
	
	return add;
}

//Vector of 2 points
function sub(p1, p2){
	var x1 = p1.x; var x2 = p2.x;
	var y1 = p1.y; var y2 = p2.y;
	var z1 = p1.z; var z2 = p2.z;
	var sub = new coord(x2-x1, y2-y1, z2-z1);
	
	return sub;
}

function mult2(p1, p2){
	var x1 = p1.x; var x2 = p2.x;
	var y1 = p1.y; var y2 = p2.y;
	var z1 = p1.z; var z2 = p2.z;
	var mult2 = new coord(x2*x1, y2*y1, z2*z1);
	
	return mult2;
}

function mult3(p1, p2, p3){
	var x1 = p1.x; var x2 = p2.x; var x3 = p3.x;
	var y1 = p1.y; var y2 = p2.y; var y3 = p3.y;
	var z1 = p1.z; var z2 = p2.z; var z3 = p3.z;
	var mult3 = new coord(x1*x2*x3, y1*y2*y3, z1*z2*z3);
	
	return mult3;
}

function dot(v1, v2){
  var x1 = v1.x; var x2 = v2.x;
  var y1 = v1.y; var y2 = v2.y;
  var z1 = v1.z; var z2 = v2.z;
  var dot = (x1 * x2) + (y1 * y2) + (z1 * z2);
  
  return dot;
}

/*
Cross Product
| x y z |
| a b c | = x(bf-ce) - y(af-cd) + z (ae - bd) 
| d e f |

x = bf-ce = v1.y*v2.z - v1.z * v2.y
y = -(af-cd) = -(v1.x * v2.z - v1.z * v2.x)
z = ae-bd = v1.x*v2.y - v1.y * v2.x
*/
function cross(v1, v2){
	var x = (v1.y * v2.z) - (v1.z * v2.y);
	var y = -((v1.x * v2.z) - (v1.z * v2.x));
	var z = (v1.x * v2.y) - (v1.y * v2.x);
  var result = new coord(x,y,z);
  
  return result;
}

/*
	Magnitude: sqrt(x^2+y^2+z^2)
*/
function magnitude(v){
	var x = v.x;
	var y = v.y;
	var z = v.z;
	var mag = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2)); 
	
	return mag; 
}

function scale(v, fx, fy, fz){
	var x = v.x;
	var y = v.y;
	var z = v.z;
	var Sx = x * fx;
	var Sy = y * fy;
	var Sz = z * fz;
	var scaled = new coord(Sx, Sy, Sz);
  
	return scaled;
}

function normalize(v, mag){
  var x = v.x / mag;
  var y = v.y / mag;
  var z = v.z / mag;
  var normalized = new coord (x, y, z);
  //console.log(Math.round(normalized.x*100)/100+" "+Math.round(normalized.x*100)/100+" "+Math.round(normalized.x*100)/100); 
  return normalized;
}