import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Language configurations
const LANGUAGE_CONFIG = {
  py: { ext: 'py', image: 'python-executor' },
  js: { ext: 'js', image: 'js-executor' },
  c: { ext: 'c', image: 'c-executor' },
  cpp: { ext: 'cpp', image: 'cpp-executor' },
  java: {
    ext: 'java',
    image: 'java-executor',
    fileName: 'Main.java',
    template: (code) => `
public class Main {
  public static void main(String[] args) {
    ${code}
  }
}`,
  },
  go: { ext: 'go', image: 'go-executor' },
  rs: { ext: 'rs', image: 'rs-executor' },
  rb: { ext: 'rb', image: 'rb-executor' },
  php: { ext: 'php', image: 'php-executor' },
  swift: { ext: 'swift', image: 'swift-executor' },
  pl: { ext: 'pl', image: 'pl-executor' },
  r: { ext: 'r', image: 'r-executor' },
};

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, language, stdin } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const langConfig = LANGUAGE_CONFIG[language];
  if (!langConfig) {
    return res.status(422).json({ error: 'Unsupported language' });
  }

  const projectTmpDir = path.join(process.cwd(), 'tmp');
  console.log('Temporary directory path:', projectTmpDir);

  try {
    // Create tmp directory if it doesn't exist
    await fs.mkdir(projectTmpDir, { recursive: true });
    console.log('Temporary directory created successfully');

    // Set directory permissions
    await fs.chmod(projectTmpDir, 0o777);
  } catch (err) {
    console.error('Failed to create/modify tmp directory:', err);
    return res.status(500).json({ error: 'Failed to create temporary directory' });
  }

  const fileName = langConfig.fileName || `code.${langConfig.ext}`;
  const filePath = path.join(projectTmpDir, fileName);

  try {
    // Write code to file
    const finalCode = language === 'java' && !code.includes('class')
      ? langConfig.template(code)
      : code;

    await fs.writeFile(filePath, finalCode);
    const fileStats = await fs.stat(filePath);
    console.log('File created:', {
      path: filePath,
      size: fileStats.size,
      mode: fileStats.mode.toString(8),
      code: finalCode, // Log the actual code being written
    });
  } catch (err) {
    console.error('Failed to write code file:', err);
    return res.status(500).json({ error: 'Failed to write code file' });
  }

  // Build Docker command
  const dockerCommand = stdin
    ? `echo ${JSON.stringify(stdin)} | docker run --rm -i -v "${projectTmpDir}:/sandbox" ${langConfig.image} /sandbox/${fileName}`
    : `docker run --rm -v "${projectTmpDir}:/sandbox" ${langConfig.image} /sandbox/${fileName}`;

  console.log('Executing Docker command:', dockerCommand);

  try {
    const output = await new Promise((resolve, reject) => {
      exec(dockerCommand, { timeout: 5000 }, (error, stdout, stderr) => {
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);

        if (error) {
          console.error('Docker execution error:', {
            message: error.message,
            code: error.code,
            signal: error.signal,
          });

          // Determine error type and return more detailed feedback
          if (error.signal === 'SIGTERM') {
            return reject({ type: 'timeout', message: 'Execution timed out.' });
          }
          return reject({ type: 'execution_error', message: stderr || error.message });
        }

        resolve({ stdout, stderr });
      });
    });

    // Handle warnings and errors in the output
    const warnings = output.stderr && output.stderr.includes('warning')
      ? output.stderr.split('\n').filter((line) => line.includes('warning'))
      : [];

    return res.status(200).json({
      stdout: output.stdout,
      stderr: output.stderr,
      warnings,
      status: warnings.length ? 'success_with_warnings' : 'success',
    });
  } catch (error) {
    console.error('Execution failed:', error);

    if (error.type === 'timeout') {
      return res.status(422).json({ error: 'Execution timed out.' });
    }

    return res.status(422).json({
      error: error.message || 'Execution failed',
      details: error.stderr || '',
    });
  } finally {
    // Cleanup temporary file
    try {
      await fs.unlink(filePath);
      console.log('Cleaned up temporary file:', filePath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}