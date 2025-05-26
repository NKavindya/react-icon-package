import fs from 'fs/promises'; // ✅ Use promises API for cleaner async/await
import path from 'path';
import { fileURLToPath } from 'url';

// Needed in ESM to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '..', 'src', 'icons');

const modifyIcon = async (filePath: string) => {
    let content = await fs.readFile(filePath, 'utf-8');

    const propsRegex = /SVGProps<SVGSVGElement>/;
    if (propsRegex.test(content)) {
        content = content.replace(
            propsRegex,
            `(SVGProps<SVGSVGElement> & { size?: string | number; color?: string })`
        );
    }

    const svgTagRegex = /<svg([^>]*)>/;
    const svgMatch = content.match(svgTagRegex);
    if (svgMatch) {
        const svgAttributes = svgMatch[1];

        let newSvgAttributes = svgAttributes
            .replace(/width="[^"]*"/, '{...(props.size ? { width: props.size, height: props.size } : { width: "1em", height: "1em" })}')
            .replace(/height="[^"]*"/, '');

        newSvgAttributes += ' fill={props.color || "currentColor"}';

        content = content.replace(svgTagRegex, `<svg${newSvgAttributes}>`);
    }

    await fs.writeFile(filePath, content, 'utf-8');
};

const main = async () => {
    try {
        const files = await fs.readdir(ICONS_DIR);

        for (const file of files) {
            const filePath = path.join(ICONS_DIR, file);
            if (path.extname(file) === '.tsx') {
                try {
                    await modifyIcon(filePath);
                    console.log(`Modified: ${file}`);
                } catch (error) {
                    console.error(`Error modifying ${file}:`, error);
                }
            }
        }
    } catch (err) {
        console.error('Error reading icons directory:', err);
        process.exit(1);
    }
};

main();
