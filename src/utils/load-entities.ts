import fg from 'fast-glob';
import path from 'path';

export async function loadEntityFiles(): Promise<Function[]> {
  const isProd = process.env.NODE_ENV === 'production';
  const baseDir = isProd ? 'dist' : 'src';

  const files = await fg(`${baseDir}/**/*.entity.{ts,js}`);
  console.log(`🔍 Found entity files:`, files); 
  const entities: Function[] = [];

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    const moduleExports = require(fullPath);

    Object.values(moduleExports).forEach((entity) => {
      if (typeof entity === 'function') {
        entities.push(entity);
      }
    });
  }

  return entities;
}
