/*-------- Normal Calculations -----------*/

/*
	Find the Normals of the surfaces 
	Needs vertex normals, how to calculate?
*/
function calcNormals(arr, i){
	if(arr.length == 0) alert("No wireframe detected.");
  
  var p1 = arr[i];    var p3 = arr[i+24];
  var p2 = arr[i+1];  var p4 = arr[i+25];
  
  // Calculate point between 2 vectors and cross product for normal
  var v1 = sub(p2, p1); //Returns P2 -> P1
  var v2 = sub(p1, p3); //Returns P3 -> P1
  var norm = cross(v1, v2); //v1 x v2, returns normal vector for surface
  var mag = magnitude(norm);  
  
  pNorms.push(normalize(norm,mag));

  var L = new coord(1.0, 1.0, 1.0); //Light Source
  
  // Draw Normals
  var scaled = scale(norm, 75.0, 75.0, 75.0);
  
  var midx = (p1.x + p2.x + p3.x + p4.x)/4;
  var midy = (p1.y + p2.y + p3.y + p4.y)/4;
  var midz = (p1.z + p2.z + p3.z + p4.z)/4;
  
  var pointV = new Vector3([midx, midy, midz]);
  var transMat = new Matrix4();
  transMat.translate(pointV.elements[0], pointV.elements[1], pointV.elements[2]);
  var result = transMat.multiplyVector3(new Vector3([scaled.x/mag, scaled.y/mag, scaled.z/mag]));
        
  drawN.push(new coord(midx,midy,midz));
  drawN.push(new coord(result.elements[0], result.elements[1], result.elements[2]));
}

/*       
        23

    11   0   1
    
        12
        
        norm i, i+1, i+11, i+23, i+12 add together,
        calculate lighting
		
	For the first 12 points and last 12 points, you should only be adding 2 from side and 1 from above/below
	Everything else, add norms from all over
*/
function calcSmooth(){
  var pts = poly.length/12+1;
  var j = 24+(48*(pts-2)); 
  var k = 24*(pts-(pts-3)); 
  var N1, N2;
  //console.log(vNorms.length);
  //so far it works for 2 cylinders
  //Next step get it to work for n cylinderrs.
  //Also, clean up your code bitch
  for(var i = 0; i < pNorms.length; i++){
    if(i < 12){ //You need to address the next row copies also! 
      if(i==0){ //add vertex 0 normal at index 0 & 23
        vNorms[i]    = add2(pNorms[i], pNorms[i+11]); //Vertex 0
        vNorms[i+23] = add2(pNorms[i], pNorms[i+11]); //Vertex 0
        //console.log(i+" "+(i+23));
        if (pts>2){
          vNorms[i+24] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
          vNorms[i+47] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
          vNorms[i+48] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
          vNorms[i+71] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
        } else {
          vNorms[i+24] = add2(pNorms[i], pNorms[i+11]); //Vertex 12
          vNorms[i+47] = add2(pNorms[i], pNorms[i+11]); //Vertex 12
        }
      } else if(i==11){ //add vertex 11 normal at index 21, 22
        vNorms[i+10] = add2(pNorms[i], pNorms[i-11]); //Vertex 11
        vNorms[i+11] = add2(pNorms[i], pNorms[i-11]); //Vertex 11
        //console.log((i+10)+" "+(i+11));
        if (pts>2){
          //ok top row duplicated is 0-23, where vertex 11 is 21,22
          //Next row duplicates is 24-47, where vertex 23 is 45,46
          //So, 46-11=x x=35
          //x=70-11 = 59,58
          vNorms[i+34] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
          vNorms[i+35] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
          vNorms[i+58] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
          vNorms[i+59] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
        } else {
          vNorms[i+34] = add2(pNorms[i], pNorms[i-11]);//Vertex 23
          vNorms[i+35] = add2(pNorms[i], pNorms[i-11]);//Vertex 23
        }
      } else { //add all other vertices at index i, 2i+1 - ex (1,2), (3,4), (5,6), (7,8)
        //let i = 1, 2*1-1 = 1, 2*1 = 2
        //let i = 2, 2*2-1 = 3, 2*2 = 4
        //let i = 3, 2*3-1 = 5, 2*3 = 6
        //Ok now what about mid points?
        //Next row is 24-47, we only care about 25-44, 25,26 27,28 29,30
        //let i = 1, 2*1+23 = 25
        //let i = 2, 2*2+23 = 27 
        vNorms[2*i-1]  = add2(pNorms[i], pNorms[i-1]); 
        vNorms[2*i]    = add2(pNorms[i], pNorms[i-1]);
        //console.log((2*i-1)+" "+(2*i));
        if(pts>2){
          vNorms[2*i+23] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]); 
          vNorms[2*i+24] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]);
          vNorms[2*i+47] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]); 
          vNorms[2*i+48] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]);
        } else {
          vNorms[2*i+23] = add2(pNorms[i], pNorms[i-1]); 
          vNorms[2*i+24] = add2(pNorms[i], pNorms[i-1]);
        }
      }
    } else if(i > pNorms.length-13){
      if(i%12 == 0){ //add vertex 0 normal at index 0 & 23
        vNorms[k] = add2(pNorms[i], pNorms[i+11]); 
        vNorms[k+23] = add2(pNorms[i], pNorms[i+11]);
        k++; 
      } else if((i+1)==pNorms.length){
        vNorms[k] = add2(pNorms[i], pNorms[i-11]); 
        vNorms[k+1] = add2(pNorms[i], pNorms[i-11]);
      } else {
        vNorms[k] = add2(pNorms[i], pNorms[i-1]); 
        vNorms[k+1] = add2(pNorms[i], pNorms[i-1]);
        if((i+1)!=pNorms.length)k+=2;
      }
    } else if(pts > 3){
      if(k%12 == 0){
        vNorms[k] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
        vNorms[k+23] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
        vNorms[k+24] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
        vNorms[k+47] = add4(pNorms[i], pNorms[i+11], pNorms[i+12], pNorms[i+23]); //Vertex 12
        k++;
      } else if ((i+1)%12 == 0){
        vNorms[k] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
        vNorms[k+1] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
        vNorms[k+24] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23
        vNorms[k+25] = add4(pNorms[i], pNorms[i-11], pNorms[i+1], pNorms[i+12]);//Vertex 23        
        k+=27;
      } else { 
        vNorms[k] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]); 
        vNorms[k+1] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]);
        vNorms[k+24] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]); 
        vNorms[k+25] = add4(pNorms[i], pNorms[i-1], pNorms[i+11], pNorms[i+12]);
        k+=2;
      }
    }
  }
  
  //console.log(vNorms.length);
  //printCoord(vNorms);

  for(var i = 0; i < vNorms.length; i++){
    vNorms[i] = normalize(vNorms[i], magnitude(vNorms[i]));
  }
}