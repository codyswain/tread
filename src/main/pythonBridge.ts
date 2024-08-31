import { PythonShell } from 'python-shell';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export function runPythonScript(scriptName: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    let scriptPath: string;

    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'src', 'python', 'services', `${scriptName}.py`);
    } else {
      scriptPath = path.join(app.getAppPath(), 'src', 'python', 'services', `${scriptName}.py`);
    }

    console.log('Attempting to run Python script at:', scriptPath);

    // Check if the file exists
    if (!fs.existsSync(scriptPath)) {
      console.error('Python script not found at:', scriptPath);
      reject(new Error(`Python script not found: ${scriptPath}`));
      return;
    }

    PythonShell.run(scriptPath, { args })
      .then(results => {
        console.log('Python script results:', results);
        resolve(JSON.parse(results[0]));
      })
      .catch(err => {
        console.error('Error running Python script:', err);
        reject(err);
      });
  });
}