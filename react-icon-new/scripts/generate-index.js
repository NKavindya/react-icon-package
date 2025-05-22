import { readdirSync, writeFileSync } from 'fs';
import { resolve, join, basename } from 'path';
import path from 'path';

const iconsDir = resolve('src/icons');
const indexPath = join(resolve(), 'index.js');

const files = readdirSync(iconsDir).filter((file) => {
    const isJsxOrJs = file.endsWith('.js') || file.endsWith('.jsx');
    const isNotIndexFile = basename(file, path.extname(file)) !== 'index';
    return isJsxOrJs && isNotIndexFile;
});

const exportStatements = files
    .map((file) => {
        const componentName = basename(file, path.extname(file));
        return `export { default as ${componentName} } from './src/icons/${componentName}';`;
    })
    .join('\n');

writeFileSync(indexPath, exportStatements);

console.log(`Generated index.js with ${files.length} icon exports.`);
