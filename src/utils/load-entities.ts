import fg from 'fast-glob';

export async function loadEntityFiles(): Promise<string[]> {
    const isProd = process.env.NODE_ENV === 'production';
    const baseDir = isProd ? 'dist' : 'src'
    return fg([`${baseDir}/**/*.entity.{js,ts}`]);
}

