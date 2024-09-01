import { PythonShell } from 'python-shell';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export function runPythonScript(scriptName: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    let scriptPath: string;
    let pythonPath: string;

    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'src', 'python', 'services', `${scriptName}.py`);
      pythonPath = path.join(process.resourcesPath, 'python_venv', 'Scripts', 'python.exe');
    } else {
      scriptPath = path.join(app.getAppPath(), 'src', 'python', 'services', `${scriptName}.py`);
      pythonPath = path.join(app.getAppPath(), 'python_venv', 'Scripts', 'python.exe');
    }

    if (process.platform !== 'win32') {
      pythonPath = pythonPath.replace('Scripts', 'bin').replace('.exe', '');
    }

    console.log('Attempting to run Python script at:', scriptPath);
    console.log('Using Python interpreter at:', pythonPath);

    if (!fs.existsSync(scriptPath)) {
      console.error('Python script not found at:', scriptPath);
      reject(new Error(`Python script not found: ${scriptPath}`));
      return;
    }

    if (!fs.existsSync(pythonPath)) {
      console.error('Python interpreter not found at:', pythonPath);
      reject(new Error(`Python interpreter not found: ${pythonPath}`));
      return;
    }

    PythonShell.run(scriptPath, { pythonPath, args })
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