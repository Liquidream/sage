import{w as H,G as W,c as _,m as I}from"../entry-index-play.js";function j(e,o,r){if(e)for(const t in e){const n=t.toLocaleLowerCase(),u=o[n];if(u){let a=e[t];t==="header"&&(a=a.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),r&&u.push(`//----${r}----//`),u.push(a)}else H(`${t} placement hook does not exist in shader`)}}const k=/\{\{(.*?)\}\}/g;function G(e){var t;const o={};return(((t=e.match(k))==null?void 0:t.map(n=>n.replace(/[{()}]/g,"")))??[]).forEach(n=>{o[n]=[]}),o}function y(e,o){let r;const t=/@in\s+([^;]+);/g;for(;(r=t.exec(e))!==null;)o.push(r[1])}function R(e,o,r=!1){const t=[];y(o,t),e.forEach(i=>{i.header&&y(i.header,t)});const n=t;r&&n.sort();const u=n.map((i,c)=>`       @location(${c}) ${i},`).join(`
`);let a=o.replace(/@in\s+[^;]+;\s*/g,"");return a=a.replace("{{in}}",`
${u}
`),a}function B(e,o){let r;const t=/@out\s+([^;]+);/g;for(;(r=t.exec(e))!==null;)o.push(r[1])}function E(e){const r=/\b(\w+)\s*:/g.exec(e);return r?r[1]:""}function L(e){const o=/@.*?\s+/g;return e.replace(o,"")}function O(e,o){const r=[];B(o,r),e.forEach(c=>{c.header&&B(c.header,r)});let t=0;const n=r.sort().map(c=>c.indexOf("builtin")>-1?c:`@location(${t++}) ${c}`).join(`,
`),u=r.sort().map(c=>`       var ${L(c)};`).join(`
`),a=`return VSOutput(
                ${r.sort().map(c=>` ${E(c)}`).join(`,
`)});`;let i=o.replace(/@out\s+[^;]+;\s*/g,"");return i=i.replace("{{struct}}",`
${n}
`),i=i.replace("{{start}}",`
${u}
`),i=i.replace("{{return}}",`
${a}
`),i}function A(e,o){let r=e;for(const t in o){const n=o[t];n.join(`
`).length?r=r.replace(`{{${t}}}`,`//-----${t} START-----//
${n.join(`
`)}
//----${t} FINISH----//`):r=r.replace(`{{${t}}}`,"")}return r}const l=Object.create(null),S=new Map;let F=0;function N({template:e,bits:o}){const r=z(e,o);if(l[r])return l[r];const{vertex:t,fragment:n}=Y(e,o);return l[r]=D(t,n,o),l[r]}function X({template:e,bits:o}){const r=z(e,o);return l[r]||(l[r]=D(e.vertex,e.fragment,o)),l[r]}function Y(e,o){const r=o.map(a=>a.vertex).filter(a=>!!a),t=o.map(a=>a.fragment).filter(a=>!!a);let n=R(r,e.vertex,!0);n=O(r,n);const u=R(t,e.fragment,!0);return{vertex:n,fragment:u}}function z(e,o){return o.map(r=>(S.has(r)||S.set(r,F++),S.get(r))).sort((r,t)=>r-t).join("-")+e.vertex+e.fragment}function D(e,o,r){const t=G(e),n=G(o);return r.forEach(u=>{j(u.vertex,t,u.name),j(u.fragment,n,u.name)}),{vertex:A(e,t),fragment:A(o,n)}}const V=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}
        
        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);
       
        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,q=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;
   
    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {
        
        {{start}}

        var outColor:vec4<f32>;
      
        {{main}}
        
        return outColor * vColor;
      };
`,w=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;
        
        {{start}}
        
        vColor = vec4(1.);
        
        {{main}}
        
        vUV = uv;
        
        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,J=`
   
    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {
        
        {{start}}

        vec4 outColor;
      
        {{main}}
        
        finalColor = outColor * vColor;
    }
`,K={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},Q={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};function eo({bits:e,name:o}){const r=N({template:{fragment:q,vertex:V},bits:[K,...e]});return W.from({name:o,vertex:{source:r.vertex,entryPoint:"main"},fragment:{source:r.fragment,entryPoint:"main"}})}function no({bits:e,name:o}){return new _({name:o,...X({template:{vertex:w,fragment:J},bits:[Q,...e]})})}const ao={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},io={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}},M={};function Z(e){const o=[];if(e===1)o.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),o.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let r=0;for(let t=0;t<e;t++)o.push(`@group(1) @binding(${r++}) var textureSource${t+1}: texture_2d<f32>;`),o.push(`@group(1) @binding(${r++}) var textureSampler${t+1}: sampler;`)}return o.join(`
`)}function oo(e){const o=[];if(e===1)o.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{o.push("switch vTextureId {");for(let r=0;r<e;r++)r===e-1?o.push("  default:{"):o.push(`  case ${r}:{`),o.push(`      outColor = textureSampleGrad(textureSource${r+1}, textureSampler${r+1}, vUV, uvDx, uvDy);`),o.push("      break;}");o.push("}")}return o.join(`
`)}function uo(e){return M[e]||(M[e]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;
    
                ${Z(I())}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);
    
                ${oo(I())}
            `}}),M[e]}const $={};function ro(e){const o=[];for(let r=0;r<e;r++)r>0&&o.push("else"),r<e-1&&o.push(`if(vTextureId < ${r}.5)`),o.push("{"),o.push(`	outColor = texture(uTextures[${r}], vUV);`),o.push("}");return o.join(`
`)}function co(e){return $[e]||($[e]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;
              
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;
    
                uniform sampler2D uTextures[${e}];
              
            `,main:`
    
                ${ro(I())}
            `}}),$[e]}const so={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},lo={name:"round-pixels-bit",vertex:{header:`   
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {       
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},T={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},mo={...T,vertex:{...T.vertex,header:T.vertex.header.replace("group(1)","group(2)")}},vo={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}};class fo{constructor(){this.vertexSize=4,this.indexSize=6,this.location=0,this.batcher=null,this.batch=null,this.roundPixels=0}get blendMode(){return this.renderable.groupBlendMode}packAttributes(o,r,t,n){const u=this.renderable,a=this.texture,i=u.groupTransform,c=i.a,m=i.b,v=i.c,f=i.d,p=i.tx,d=i.ty,h=this.bounds,x=h.maxX,g=h.minX,b=h.maxY,C=h.minY,s=a.uvs,P=u.groupColorAlpha,U=n<<16|this.roundPixels&65535;o[t+0]=c*g+v*C+p,o[t+1]=f*C+m*g+d,o[t+2]=s.x0,o[t+3]=s.y0,r[t+4]=P,r[t+5]=U,o[t+6]=c*x+v*C+p,o[t+7]=f*C+m*x+d,o[t+8]=s.x1,o[t+9]=s.y1,r[t+10]=P,r[t+11]=U,o[t+12]=c*x+v*b+p,o[t+13]=f*b+m*x+d,o[t+14]=s.x2,o[t+15]=s.y2,r[t+16]=P,r[t+17]=U,o[t+18]=c*g+v*b+p,o[t+19]=f*b+m*g+d,o[t+20]=s.x3,o[t+21]=s.y3,r[t+22]=P,r[t+23]=U}packIndex(o,r,t){o[r]=t+0,o[r+1]=t+1,o[r+2]=t+2,o[r+3]=t+0,o[r+4]=t+2,o[r+5]=t+3}reset(){this.renderable=null,this.texture=null,this.batcher=null,this.batch=null,this.bounds=null}}function po(e,o,r){const t=(e>>24&255)/255;o[r++]=(e&255)/255*t,o[r++]=(e>>8&255)/255*t,o[r++]=(e>>16&255)/255*t,o[r++]=t}export{fo as B,ao as a,T as b,eo as c,po as d,no as e,io as f,uo as g,co as h,lo as i,vo as j,mo as l,so as r};
