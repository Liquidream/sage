import { w as warn, G as GpuProgram, c as GlProgram, m as maxRecommendedTextures } from "../entry-index-play.js";
function addBits(srcParts, parts, name) {
  if (srcParts) {
    for (const i in srcParts) {
      const id = i.toLocaleLowerCase();
      const part = parts[id];
      if (part) {
        let sanitisedPart = srcParts[i];
        if (i === "header") {
          sanitisedPart = sanitisedPart.replace(/@in\s+[^;]+;\s*/g, "").replace(/@out\s+[^;]+;\s*/g, "");
        }
        if (name) {
          part.push(`//----${name}----//`);
        }
        part.push(sanitisedPart);
      } else {
        warn(`${i} placement hook does not exist in shader`);
      }
    }
  }
}
const findHooksRx = /\{\{(.*?)\}\}/g;
function compileHooks(programSrc) {
  var _a;
  const parts = {};
  const partMatches = ((_a = programSrc.match(findHooksRx)) == null ? void 0 : _a.map((hook) => hook.replace(/[{()}]/g, ""))) ?? [];
  partMatches.forEach((hook) => {
    parts[hook] = [];
  });
  return parts;
}
function extractInputs(fragmentSource, out) {
  let match;
  const regex = /@in\s+([^;]+);/g;
  while ((match = regex.exec(fragmentSource)) !== null) {
    out.push(match[1]);
  }
}
function compileInputs(fragments, template, sort = false) {
  const results = [];
  extractInputs(template, results);
  fragments.forEach((fragment) => {
    if (fragment.header) {
      extractInputs(fragment.header, results);
    }
  });
  const mainInput = results;
  if (sort) {
    mainInput.sort();
  }
  const finalString = mainInput.map((inValue, i) => `       @location(${i}) ${inValue},`).join("\n");
  let cleanedString = template.replace(/@in\s+[^;]+;\s*/g, "");
  cleanedString = cleanedString.replace("{{in}}", `
${finalString}
`);
  return cleanedString;
}
function extractOutputs(fragmentSource, out) {
  let match;
  const regex = /@out\s+([^;]+);/g;
  while ((match = regex.exec(fragmentSource)) !== null) {
    out.push(match[1]);
  }
}
function extractVariableName(value) {
  const regex = /\b(\w+)\s*:/g;
  const match = regex.exec(value);
  return match ? match[1] : "";
}
function stripVariable(value) {
  const regex = /@.*?\s+/g;
  return value.replace(regex, "");
}
function compileOutputs(fragments, template) {
  const results = [];
  extractOutputs(template, results);
  fragments.forEach((fragment) => {
    if (fragment.header) {
      extractOutputs(fragment.header, results);
    }
  });
  let index = 0;
  const mainStruct = results.sort().map((inValue) => {
    if (inValue.indexOf("builtin") > -1) {
      return inValue;
    }
    return `@location(${index++}) ${inValue}`;
  }).join(",\n");
  const mainStart = results.sort().map((inValue) => `       var ${stripVariable(inValue)};`).join("\n");
  const mainEnd = `return VSOutput(
                ${results.sort().map((inValue) => ` ${extractVariableName(inValue)}`).join(",\n")});`;
  let compiledCode = template.replace(/@out\s+[^;]+;\s*/g, "");
  compiledCode = compiledCode.replace("{{struct}}", `
${mainStruct}
`);
  compiledCode = compiledCode.replace("{{start}}", `
${mainStart}
`);
  compiledCode = compiledCode.replace("{{return}}", `
${mainEnd}
`);
  return compiledCode;
}
function injectBits(templateSrc, fragmentParts) {
  let out = templateSrc;
  for (const i in fragmentParts) {
    const parts = fragmentParts[i];
    const toInject = parts.join("\n");
    if (toInject.length) {
      out = out.replace(`{{${i}}}`, `//-----${i} START-----//
${parts.join("\n")}
//----${i} FINISH----//`);
    } else {
      out = out.replace(`{{${i}}}`, "");
    }
  }
  return out;
}
const cacheMap = /* @__PURE__ */ Object.create(null);
const bitCacheMap = /* @__PURE__ */ new Map();
let CACHE_UID = 0;
function compileHighShader({
  template,
  bits
}) {
  const cacheId = generateCacheId(template, bits);
  if (cacheMap[cacheId])
    return cacheMap[cacheId];
  const { vertex, fragment } = compileInputsAndOutputs(template, bits);
  cacheMap[cacheId] = compileBits(vertex, fragment, bits);
  return cacheMap[cacheId];
}
function compileHighShaderGl({
  template,
  bits
}) {
  const cacheId = generateCacheId(template, bits);
  if (cacheMap[cacheId])
    return cacheMap[cacheId];
  cacheMap[cacheId] = compileBits(template.vertex, template.fragment, bits);
  return cacheMap[cacheId];
}
function compileInputsAndOutputs(template, bits) {
  const vertexFragments = bits.map((shaderBit) => shaderBit.vertex).filter((v) => !!v);
  const fragmentFragments = bits.map((shaderBit) => shaderBit.fragment).filter((v) => !!v);
  let compiledVertex = compileInputs(vertexFragments, template.vertex, true);
  compiledVertex = compileOutputs(vertexFragments, compiledVertex);
  const compiledFragment = compileInputs(fragmentFragments, template.fragment, true);
  return {
    vertex: compiledVertex,
    fragment: compiledFragment
  };
}
function generateCacheId(template, bits) {
  return bits.map((highFragment) => {
    if (!bitCacheMap.has(highFragment)) {
      bitCacheMap.set(highFragment, CACHE_UID++);
    }
    return bitCacheMap.get(highFragment);
  }).sort((a, b) => a - b).join("-") + template.vertex + template.fragment;
}
function compileBits(vertex, fragment, bits) {
  const vertexParts = compileHooks(vertex);
  const fragmentParts = compileHooks(fragment);
  bits.forEach((shaderBit) => {
    addBits(shaderBit.vertex, vertexParts, shaderBit.name);
    addBits(shaderBit.fragment, fragmentParts, shaderBit.name);
  });
  return {
    vertex: injectBits(vertex, vertexParts),
    fragment: injectBits(fragment, fragmentParts)
  };
}
const vertexGPUTemplate = (
  /* wgsl */
  `
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
`
);
const fragmentGPUTemplate = (
  /* wgsl */
  `
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
`
);
const vertexGlTemplate = (
  /* glsl */
  `
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
`
);
const fragmentGlTemplate = (
  /* glsl */
  `
   
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
`
);
const globalUniformsBit = {
  name: "global-uniforms-bit",
  vertex: {
    header: (
      /* wgsl */
      `
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `
    )
  }
};
const globalUniformsBitGl = {
  name: "global-uniforms-bit",
  vertex: {
    header: (
      /* glsl */
      `
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `
    )
  }
};
function compileHighShaderGpuProgram({ bits, name }) {
  const source = compileHighShader({
    template: {
      fragment: fragmentGPUTemplate,
      vertex: vertexGPUTemplate
    },
    bits: [
      globalUniformsBit,
      ...bits
    ]
  });
  return GpuProgram.from({
    name,
    vertex: {
      source: source.vertex,
      entryPoint: "main"
    },
    fragment: {
      source: source.fragment,
      entryPoint: "main"
    }
  });
}
function compileHighShaderGlProgram({ bits, name }) {
  return new GlProgram({
    name,
    ...compileHighShaderGl({
      template: {
        vertex: vertexGlTemplate,
        fragment: fragmentGlTemplate
      },
      bits: [
        globalUniformsBitGl,
        ...bits
      ]
    })
  });
}
const colorBit = {
  name: "color-bit",
  vertex: {
    header: (
      /* wgsl */
      `
            @in aColor: vec4<f32>;
        `
    ),
    main: (
      /* wgsl */
      `
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `
    )
  }
};
const colorBitGl = {
  name: "color-bit",
  vertex: {
    header: (
      /* glsl */
      `
            in vec4 aColor;
        `
    ),
    main: (
      /* glsl */
      `
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `
    )
  }
};
const textureBatchBitGpuCache = {};
function generateBindingSrc(maxTextures) {
  const src = [];
  if (maxTextures === 1) {
    src.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;");
    src.push("@group(1) @binding(1) var textureSampler1: sampler;");
  } else {
    let bindingIndex = 0;
    for (let i = 0; i < maxTextures; i++) {
      src.push(`@group(1) @binding(${bindingIndex++}) var textureSource${i + 1}: texture_2d<f32>;`);
      src.push(`@group(1) @binding(${bindingIndex++}) var textureSampler${i + 1}: sampler;`);
    }
  }
  return src.join("\n");
}
function generateSampleSrc(maxTextures) {
  const src = [];
  if (maxTextures === 1) {
    src.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");
  } else {
    src.push("switch vTextureId {");
    for (let i = 0; i < maxTextures; i++) {
      if (i === maxTextures - 1) {
        src.push(`  default:{`);
      } else {
        src.push(`  case ${i}:{`);
      }
      src.push(`      outColor = textureSampleGrad(textureSource${i + 1}, textureSampler${i + 1}, vUV, uvDx, uvDy);`);
      src.push(`      break;}`);
    }
    src.push(`}`);
  }
  return src.join("\n");
}
function generateTextureBatchBit(maxTextures) {
  if (!textureBatchBitGpuCache[maxTextures]) {
    textureBatchBitGpuCache[maxTextures] = {
      name: "texture-batch-bit",
      vertex: {
        header: `
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `
      },
      fragment: {
        header: `
                @in @interpolate(flat) vTextureId: u32;
    
                ${generateBindingSrc(maxRecommendedTextures())}
            `,
        main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);
    
                ${generateSampleSrc(maxRecommendedTextures())}
            `
      }
    };
  }
  return textureBatchBitGpuCache[maxTextures];
}
const textureBatchBitGlCache = {};
function generateSampleGlSrc(maxTextures) {
  const src = [];
  for (let i = 0; i < maxTextures; i++) {
    if (i > 0) {
      src.push("else");
    }
    if (i < maxTextures - 1) {
      src.push(`if(vTextureId < ${i}.5)`);
    }
    src.push("{");
    src.push(`	outColor = texture(uTextures[${i}], vUV);`);
    src.push("}");
  }
  return src.join("\n");
}
function generateTextureBatchBitGl(maxTextures) {
  if (!textureBatchBitGlCache[maxTextures]) {
    textureBatchBitGlCache[maxTextures] = {
      name: "texture-batch-bit",
      vertex: {
        header: `
                in vec2 aTextureIdAndRound;
                out float vTextureId;
              
            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `
      },
      fragment: {
        header: `
                in float vTextureId;
    
                uniform sampler2D uTextures[${maxTextures}];
              
            `,
        main: `
    
                ${generateSampleGlSrc(maxRecommendedTextures())}
            `
      }
    };
  }
  return textureBatchBitGlCache[maxTextures];
}
const roundPixelsBit = {
  name: "round-pixels-bit",
  vertex: {
    header: (
      /* wgsl */
      `
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    )
  }
};
const roundPixelsBitGl = {
  name: "round-pixels-bit",
  vertex: {
    header: (
      /* glsl */
      `   
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {       
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    )
  }
};
const localUniformBit = {
  name: "local-uniform-bit",
  vertex: {
    header: (
      /* wgsl */
      `

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `
    ),
    main: (
      /* wgsl */
      `
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `
    ),
    end: (
      /* wgsl */
      `
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `
    )
  }
};
const localUniformBitGroup2 = {
  ...localUniformBit,
  vertex: {
    ...localUniformBit.vertex,
    // replace the group!
    header: localUniformBit.vertex.header.replace("group(1)", "group(2)")
  }
};
const localUniformBitGl = {
  name: "local-uniform-bit",
  vertex: {
    header: (
      /* glsl */
      `

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `
    ),
    main: (
      /* glsl */
      `
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `
    ),
    end: (
      /* glsl */
      `
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `
    )
  }
};
class BatchableSprite {
  constructor() {
    this.vertexSize = 4;
    this.indexSize = 6;
    this.location = 0;
    this.batcher = null;
    this.batch = null;
    this.roundPixels = 0;
  }
  get blendMode() {
    return this.renderable.groupBlendMode;
  }
  packAttributes(float32View, uint32View, index, textureId) {
    const sprite = this.renderable;
    const texture = this.texture;
    const wt = sprite.groupTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const bounds = this.bounds;
    const w0 = bounds.maxX;
    const w1 = bounds.minX;
    const h0 = bounds.maxY;
    const h1 = bounds.minY;
    const uvs = texture.uvs;
    const argb = sprite.groupColorAlpha;
    const textureIdAndRound = textureId << 16 | this.roundPixels & 65535;
    float32View[index + 0] = a * w1 + c * h1 + tx;
    float32View[index + 1] = d * h1 + b * w1 + ty;
    float32View[index + 2] = uvs.x0;
    float32View[index + 3] = uvs.y0;
    uint32View[index + 4] = argb;
    uint32View[index + 5] = textureIdAndRound;
    float32View[index + 6] = a * w0 + c * h1 + tx;
    float32View[index + 7] = d * h1 + b * w0 + ty;
    float32View[index + 8] = uvs.x1;
    float32View[index + 9] = uvs.y1;
    uint32View[index + 10] = argb;
    uint32View[index + 11] = textureIdAndRound;
    float32View[index + 12] = a * w0 + c * h0 + tx;
    float32View[index + 13] = d * h0 + b * w0 + ty;
    float32View[index + 14] = uvs.x2;
    float32View[index + 15] = uvs.y2;
    uint32View[index + 16] = argb;
    uint32View[index + 17] = textureIdAndRound;
    float32View[index + 18] = a * w1 + c * h0 + tx;
    float32View[index + 19] = d * h0 + b * w1 + ty;
    float32View[index + 20] = uvs.x3;
    float32View[index + 21] = uvs.y3;
    uint32View[index + 22] = argb;
    uint32View[index + 23] = textureIdAndRound;
  }
  packIndex(indexBuffer, index, indicesOffset) {
    indexBuffer[index] = indicesOffset + 0;
    indexBuffer[index + 1] = indicesOffset + 1;
    indexBuffer[index + 2] = indicesOffset + 2;
    indexBuffer[index + 3] = indicesOffset + 0;
    indexBuffer[index + 4] = indicesOffset + 2;
    indexBuffer[index + 5] = indicesOffset + 3;
  }
  reset() {
    this.renderable = null;
    this.texture = null;
    this.batcher = null;
    this.batch = null;
    this.bounds = null;
  }
}
function color32BitToUniform(abgr, out, offset) {
  const alpha = (abgr >> 24 & 255) / 255;
  out[offset++] = (abgr & 255) / 255 * alpha;
  out[offset++] = (abgr >> 8 & 255) / 255 * alpha;
  out[offset++] = (abgr >> 16 & 255) / 255 * alpha;
  out[offset++] = alpha;
}
export {
  BatchableSprite as B,
  colorBit as a,
  localUniformBit as b,
  compileHighShaderGpuProgram as c,
  color32BitToUniform as d,
  compileHighShaderGlProgram as e,
  colorBitGl as f,
  generateTextureBatchBit as g,
  generateTextureBatchBitGl as h,
  roundPixelsBitGl as i,
  localUniformBitGl as j,
  localUniformBitGroup2 as l,
  roundPixelsBit as r
};
