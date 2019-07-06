// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec3 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +

  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +

  'varying vec4 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoord;\n' +

  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
  '  v_Position = u_ViewMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '  v_Color = a_Color;\n' +
  '  v_Normal = a_Normal;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  
  'uniform bool u_Amb;\n' +
  'uniform bool u_Spec;\n' +
  'uniform bool u_Dir;\n' +
  'uniform bool u_Point;\n' +
  'uniform float u_NS;\n' +
  'uniform sampler2D u_TexCoord;\n' +

  'varying vec4 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoord;\n' +

  'void main() {\n' +
  '  vec4 color = v_Color;\n' +
  '  vec3 normal = v_Normal;\n' +
  
  '  vec3 lightPos = vec3(1, 1, 1);\n' +
  '  vec3 pointPos = vec3(0.0, 500.0, 0.0);\n' +
  '  vec3 lightDir = normalize(lightPos);\n' +
  '  vec3 pointDir = normalize(pointPos - vec3(v_Position));\n' +

  '  vec3 Ka = vec3(0.0, 0.0, 1.0);\n' +
  '  vec3 Kd = vec3(1.0, 0.0, 0.0);\n' +
  '  vec3 Ks = vec3(0.0, 1.0, 0.0);\n' +

  '  float spec  = 0.0;\n' +
  '  float dSpec = 0.0;\n' +
  '  float pSpec = 0.0;\n' +
  
  '  float amb   = 0.2;\n' +

  //Point Diffuse
  '  float pColor = max(dot(pointDir, normal), 0.0);\n' +
  '  if(!u_Point) pColor = 0.0;\n' +

  //Directional Diffuse - Max at 1.0
  '  float diff = (max(dot(normal, lightDir), 0.0) + pColor);\n' +
  '  if(diff > 1.0) diff = 1.0;\n' +
  '  if(!u_Dir) diff = pColor;\n' +
  '  vec3 Id = diff * Kd;\n' +

  //Calculate specular
  '  vec3 viewV   = vec3(0.0, 0.0, 1.0);\n' +
  '  vec3 halfV   = normalize(lightDir + viewV);\n' +
  '  vec3 pointHV = normalize(pointDir + viewV);\n' +
  '  if(u_Spec){ \
       dSpec = max(pow(dot(normal, halfV), u_NS), 0.0); \
       pSpec = max(pow(dot(normal, pointHV), u_NS), 0.0); \
       spec = (dSpec + pSpec); \
       if(spec > 1.0) spec = 1.0; \
     }' +
  '  if(!u_Dir && !u_Point) spec = 0.0;\n' +
  '  vec3 Is = spec * Ks;\n' +
   
  '  if(!u_Dir && !u_Point && !u_Spec) amb = 0.2;\n' +
  '  if(!u_Amb) amb = 0.0;\n' +
  '  vec3 Ia    = amb * Ka;\n' +

  //'  gl_FragColor = v_Color;\n' +
  '  gl_FragColor = texture2D(u_texture, v_TexCoord;\n' +
  '  if(v_Color.a == 1.0) gl_FragColor.rgb = Id + Is + Ia;\n' +
  '}\n';