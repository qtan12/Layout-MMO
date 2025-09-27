const fs = require('fs');
const { icons } = require('lucide');
const { minify } = require('terser');

// Đọc danh sách icons đã sử dụng
const usedIcons = fs.readFileSync('../../icons-used.txt', 'utf8').trim().split('\n');

console.log(`Tạo file JS tùy chỉnh với ${usedIcons.length} icons...`);
console.log('Available icons in lucide:', Object.keys(icons).slice(0, 10), '...');

// Hàm convert tên icon từ slug sang PascalCase
function slugToPascalCase(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

// Hàm tìm icon trong lucide với fallback
function findIconInLucide(iconName) {
    // Thử convert trực tiếp
    let pascalName = slugToPascalCase(iconName);
    if (icons[pascalName]) {
        return pascalName;
    }
    
    // Thử các biến thể khác
    const variations = [
        // Thử với số ở cuối
        pascalName.replace(/(\d+)$/, '$1'),
        // Thử với số ở giữa
        pascalName.replace(/(\d+)/, '$1'),
        // Thử với các từ viết tắt phổ biến
        pascalName.replace(/2/g, '2'),
        pascalName.replace(/3/g, '3'),
        // Thử với các từ đặc biệt
        pascalName.replace(/Circle/g, 'Circle'),
        pascalName.replace(/Square/g, 'Square'),
        pascalName.replace(/Triangle/g, 'Triangle'),
    ];
    
    for (const variation of variations) {
        if (icons[variation]) {
            return variation;
        }
    }
    
    // Thử tìm kiếm gần đúng
    const availableIcons = Object.keys(icons);
    const similarIcon = availableIcons.find(icon => 
        icon.toLowerCase().includes(iconName.toLowerCase()) ||
        iconName.toLowerCase().includes(icon.toLowerCase())
    );
    
    return similarIcon || null;
}

// Tạo object chỉ chứa các icon đã sử dụng
const customIcons = {};
const notFoundIcons = [];

usedIcons.forEach(iconName => {
    const lucideName = findIconInLucide(iconName);
    if (lucideName && icons[lucideName]) {
        customIcons[iconName] = icons[lucideName];
        console.log(`✅ ${iconName} -> ${lucideName}`);
    } else {
        notFoundIcons.push(iconName);
        console.warn(`❌ Icon "${iconName}" không tìm thấy trong lucide`);
    }
});

if (notFoundIcons.length > 0) {
    console.log(`\n⚠️  ${notFoundIcons.length} icons không tìm thấy:`);
    notFoundIcons.forEach(icon => console.log(`   - ${icon}`));
    console.log('\n💡 Gợi ý: Kiểm tra tên icon tại https://lucide.dev/icons/');
}

// Tạo file JS theo format Lucide gốc
const jsContent = `/**
 * @license lucide v0.544.0 - ISC
 * Custom Build - Chỉ chứa ${Object.keys(customIcons).length} icons đã sử dụng
 * Generated: ${new Date().toISOString()}
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.lucide = {}));
})(this, (function (exports) { 'use strict';

  const defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  const createSVGElement = ([tag, attrs, children]) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children?.length) {
      children.forEach((child) => {
        const childElement = createSVGElement(child);
        element.appendChild(childElement);
      });
    }
    return element;
  };

  const createElement = (iconNode, customAttrs = {}) => {
    const tag = "svg";
    const attrs = {
      ...defaultAttributes,
      ...customAttrs
    };
    return createSVGElement([tag, attrs, iconNode]);
  };

  const getAttrs = (element) => Array.from(element.attributes).reduce((attrs, attr) => {
    attrs[attr.name] = attr.value;
    return attrs;
  }, {});

  const getClassNames = (attrs) => {
    if (typeof attrs === "string") return attrs;
    if (!attrs || !attrs.class) return "";
    if (attrs.class && typeof attrs.class === "string") {
      return attrs.class.split(" ");
    }
    if (attrs.class && Array.isArray(attrs.class)) {
      return attrs.class;
    }
    return "";
  };

  const combineClassNames = (arrayOfClassnames) => {
    const classNameArray = arrayOfClassnames.flatMap(getClassNames);
    return classNameArray.map((classItem) => classItem.trim()).filter(Boolean).filter((value, index, self) => self.indexOf(value) === index).join(" ");
  };

  const toPascalCase = (string) => string.replace(/(\\w)(\\w*)(_|-|\\s*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());

  const replaceElement = (element, { nameAttr, icons, attrs }) => {
    const iconName = element.getAttribute(nameAttr);
    if (iconName == null) return;
    const ComponentName = toPascalCase(iconName);
    const iconNode = icons[ComponentName];
    if (!iconNode) {
      return console.warn(
        \`\${element.outerHTML} icon name was not found in the provided icons object.\`
      );
    }
    const elementAttrs = getAttrs(element);
    const iconAttrs = {
      ...defaultAttributes,
      "data-lucide": iconName,
      ...attrs,
      ...elementAttrs
    };
    const classNames = combineClassNames(["lucide", \`lucide-\${iconName}\`, elementAttrs, attrs]);
    if (classNames) {
      Object.assign(iconAttrs, {
        class: classNames
      });
    }
    const svgElement = createElement(iconNode, iconAttrs);
    return element.parentNode?.replaceChild(svgElement, element);
  };

${Object.entries(customIcons).map(([slugName, iconData]) => {
  const pascalName = slugToPascalCase(slugName);
  return `  const ${pascalName} = ${JSON.stringify(iconData, null, 2)};`;
}).join('\n')}

  var iconAndAliases = /*#__PURE__*/Object.freeze({
    __proto__: null,
${Object.entries(customIcons).map(([slugName, iconData]) => {
  const pascalName = slugToPascalCase(slugName);
  return `    ${pascalName}: ${pascalName},`;
}).join('\n')}
  });

  const createIcons = ({
    icons = iconAndAliases,
    nameAttr = "data-lucide",
    attrs = {},
    root = document
  } = {}) => {
    if (!Object.values(icons).length) {
      throw new Error(
        "Please provide an icons object.If you want to use all the icons you can import it like: import { createIcons, icons } from 'lucide'; lucide.createIcons({icons});"
      );
    }
    if (typeof root === "undefined") {
      throw new Error("\`createIcons()\` only works in a browser environment.");
    }
    const elementsToReplace = root.querySelectorAll(\`[\${nameAttr}]\`);
    Array.from(elementsToReplace).forEach(
      (element) => replaceElement(element, { nameAttr, icons, attrs })
    );
    if (nameAttr === "data-lucide") {
      const deprecatedElements = root.querySelectorAll("[icon-name]");
      if (deprecatedElements.length > 0) {
        console.warn(
          "[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"
        );
        Array.from(deprecatedElements).forEach(
          (element) => replaceElement(element, { nameAttr: "icon-name", icons, attrs })
        );
      }
    }
  };

${Object.entries(customIcons).map(([slugName, iconData]) => {
  const pascalName = slugToPascalCase(slugName);
  return `  exports.${pascalName} = ${pascalName};`;
}).join('\n')}
  exports.icons = iconAndAliases;
  exports.createIcons = createIcons;

}));
//# sourceMappingURL=lucide-custom.js.map`;

// Hàm minify sử dụng terser
async function minifyJS(code) {
    try {
        const result = await minify(code, {
            compress: {
                drop_console: false,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            mangle: {
                keep_fnames: true, // Giữ tên function để tránh lỗi
            },
            format: {
                comments: false, // Loại bỏ comments
            }
        });
        return result.code;
    } catch (error) {
        console.warn('⚠️  Terser minify failed, using fallback:', error.message);
        // Fallback minify đơn giản nếu terser lỗi
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([{}();,=])\s*/g, '$1')
            .replace(/;\s*}/g, '}')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .trim();
    }
}

// Lưu file gốc
fs.writeFileSync('../lucide-custom.js', jsContent);

// Tạo file minified
(async () => {
    try {
        const minifiedContent = await minifyJS(jsContent);
        fs.writeFileSync('../lucide-custom.min.js', minifiedContent);

console.log(`✅ Đã tạo file lucide-custom.js với ${Object.keys(customIcons).length} icons`);
        console.log(`📁 File: ../lucide-custom.js`);
        console.log(`📊 Kích thước: ${(fs.statSync('../lucide-custom.js').size / 1024).toFixed(2)} KB`);

        console.log(`✅ Đã tạo file lucide-custom.min.js (minified)`);
        console.log(`📁 File: ../lucide-custom.min.js`);
        console.log(`📊 Kích thước: ${(fs.statSync('../lucide-custom.min.js').size / 1024).toFixed(2)} KB`);

// So sánh với file gốc
        const originalSize = fs.existsSync('../lucide.0.544.0.js') 
            ? fs.statSync('../lucide.0.544.0.js').size 
    : 0;
        const customSize = fs.statSync('../lucide-custom.js').size;
        const minifiedSize = fs.statSync('../lucide-custom.min.js').size;

if (originalSize > 0) {
    const savings = ((originalSize - customSize) / originalSize * 100).toFixed(1);
            const minifiedSavings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            console.log(`💾 Tiết kiệm (normal): ${savings}% (${(originalSize / 1024).toFixed(2)}KB → ${(customSize / 1024).toFixed(2)}KB)`);
            console.log(`💾 Tiết kiệm (minified): ${minifiedSavings}% (${(originalSize / 1024).toFixed(2)}KB → ${(minifiedSize / 1024).toFixed(2)}KB)`);
        }
    } catch (error) {
        console.error('❌ Error creating minified file:', error.message);
        process.exit(1);
    }
})();
