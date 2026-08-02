const fs = require("fs");

let archivesCss = fs.readFileSync("src/app/archives/page.module.css", "utf8");

// 1. Fix fullWidthContainer overflow
archivesCss = archivesCss.replace(
  ".fullWidthContainer {\r\n  width: 100%;\r\n  max-width: 100vw;\r\n  \r\n  padding: 0;\r\n  margin: 0;\r\n}",
  ".fullWidthContainer {\n  width: 100%;\n  max-width: 100vw;\n  overflow-x: hidden;\n  padding: 0;\n  margin: 0;\n}"
);

// 2. Fix blobWrapper
const startIndex = archivesCss.indexOf(".blobWrapper {");
const endIndex = archivesCss.indexOf(".header {");
if (startIndex !== -1 && endIndex !== -1) {
  const newBlobCSS = `.blobWrapper {
  position: absolute;
  top: -2rem;
  right: 5vw;
  width: 120px;
  height: 120px;
  z-index: 10;
  animation: floatAround 3s ease-in-out infinite;
  pointer-events: auto;
  cursor: pointer;
}
.blobWrapper:hover {
  animation-play-state: paused;
  transform: scale(1.15) translateY(-5%) !important;
  filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.15)) !important;
}
.blobWrapper:active {
  animation-play-state: paused;
  transform: scale(0.9) !important;
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.1)) !important;
}

@keyframes floatAround {
  0% { transform: rotate(0deg); }
  25% { transform: translateY(-10%) rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: translateY(10%) rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

`;
  archivesCss = archivesCss.substring(0, startIndex) + newBlobCSS + archivesCss.substring(endIndex);
}

// 3. Fix border radius
archivesCss = archivesCss.replace(/\.item \{\r?\n\s*position: relative;\r?\n\s*border-radius: 12px;/g, ".item {\n  position: relative;\n  border-radius: 0;");
archivesCss = archivesCss.replace(/max-height: 90vh;\r?\n\s*height: 85vh;\r?\n\s*border-radius: 12px;/g, "max-height: 90vh;\n  height: 85vh;\n  border-radius: 0;");

// 4. Fix modal overflow
archivesCss = archivesCss.replace(/\.modalImageContainer \{\r?\n\s*flex: 1;\r?\n\s*position: relative;\r?\n\s*background: var\(--card-bg\);\r?\n\s*min-height: 300px;\r?\n\s*\}/g, ".modalImageContainer {\n  flex: 1;\n  position: relative;\n  background: var(--card-bg);\n  min-height: 300px;\n  min-width: 0;\n}");
archivesCss = archivesCss.replace(/\.modalTextContainer \{\r?\n\s*flex: 1;\r?\n\s*padding: 4rem 3rem;\r?\n\s*display: flex;\r?\n\s*flex-direction: column;\r?\n\s*justify-content: center;\r?\n\s*border-left: 1px dashed var\(--card-border\);\r?\n\s*\}/g, ".modalTextContainer {\n  flex: 1;\n  padding: 4rem 3rem;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  border-left: 1px dashed var(--card-border);\n  min-width: 0;\n  overflow-y: auto;\n  word-break: break-word;\n}");
archivesCss = archivesCss.replace(/@media \(max-width: 900px\) \{\r?\n\s*\.modalContent \{\r?\n\s*flex-direction: column;\r?\n\s*height: 90vh;\r?\n\s*\}/g, "@media (max-width: 1024px) {\n  .modalContent {\n    flex-direction: column;\n    height: 90vh;\n    overflow-y: auto;\n  }");

// 5. Hide blobWrapper on mobile
if (!archivesCss.includes("@media (max-width: 900px) {\n  .blobWrapper {")) {
  archivesCss += "\n\n@media (max-width: 900px) {\n  .blobWrapper {\n    display: none;\n  }\n}\n";
}

fs.writeFileSync("src/app/archives/page.module.css", archivesCss);


let homeCss = fs.readFileSync("src/app/page.module.css", "utf8");
homeCss = homeCss.replace(/max-height: 90vh;\r?\n\s*height: 85vh;\s*\/\*\s*Force.*?\*\/\r?\n\s*border-radius: 12px;/g, "max-height: 90vh;\n  height: 85vh;\n  border-radius: 0;");
homeCss = homeCss.replace(/max-height: 90vh;\r?\n\s*height: 85vh;\r?\n\s*border-radius: 12px;/g, "max-height: 90vh;\n  height: 85vh;\n  border-radius: 0;");
homeCss = homeCss.replace(/\.modalImageContainer \{\r?\n\s*flex: 1;\r?\n\s*position: relative;\r?\n\s*background: #f5f5f5;\r?\n\s*min-height: 300px;\r?\n\s*padding: 2rem;\r?\n\s*\}/g, ".modalImageContainer {\n  flex: 1;\n  position: relative;\n  background: #f5f5f5;\n  min-height: 300px;\n  padding: 2rem;\n  min-width: 0;\n}");
homeCss = homeCss.replace(/\.modalTextContainer \{\r?\n\s*flex: 1;\r?\n\s*padding: 4rem 3rem;\r?\n\s*display: flex;\r?\n\s*flex-direction: column;\r?\n\s*justify-content: center;\r?\n\s*border-left: 1px dashed var\(--card-border\);\r?\n\s*\}/g, ".modalTextContainer {\n  flex: 1;\n  padding: 4rem 3rem;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  border-left: 1px dashed var(--card-border);\n  min-width: 0;\n  overflow-y: auto;\n  word-break: break-word;\n}");
homeCss = homeCss.replace(/@media \(max-width: 768px\) \{\r?\n\s*\.modalContent \{\r?\n\s*flex-direction: column;\r?\n\s*overflow-y: auto;\r?\n\s*\}/g, "@media (max-width: 1024px) {\n  .modalContent {\n    flex-direction: column;\n    overflow-y: auto;\n  }");
fs.writeFileSync("src/app/page.module.css", homeCss);

console.log("SUCCESS");
