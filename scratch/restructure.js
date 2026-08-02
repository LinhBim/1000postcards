const fs = require('fs');
let clientPath = 'src/app/archives/ArchivesClient.tsx';
let clientCode = fs.readFileSync(clientPath, 'utf8');

// 1. Change root <div className={styles.fullWidthContainer}> to <>
clientCode = clientCode.replace(
  /return \(\s*<div className=\{styles\.fullWidthContainer\}>\s*<div className=\{styles\.header\}>/,
  "return (\n    <>\n      <div className={styles.header}>"
);

// 2. Wrap <div className={styles.masonry}> in fullWidthContainer
clientCode = clientCode.replace(
  /<div className=\{styles\.masonry\}>/,
  "<div className={styles.fullWidthContainer}>\n        <div className={styles.masonry}>"
);

// 3. Close the fullWidthContainer after the masonry closing tag
// Find the end of masonry by looking for the closing tag before the "No postcards match" check
clientCode = clientCode.replace(
  /<\/AnimatePresence>\s*<\/div>\s*\{filteredPostcards\.length === 0/,
  "</AnimatePresence>\n        </div>\n      </div>\n      \n      {filteredPostcards.length === 0"
);

// 4. Change the very last </div> to </>
clientCode = clientCode.replace(
  /<\/AnimatePresence>\s*<\/div>\s*\);\s*\}\s*$/,
  "</AnimatePresence>\n    </>\n  );\n}\n"
);

fs.writeFileSync(clientPath, clientCode);
console.log('Restructured ArchivesClient successfully');
