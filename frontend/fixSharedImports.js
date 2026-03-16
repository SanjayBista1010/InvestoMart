import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let dirty = false;
    
    if (content.includes('components/Layout')) {
      content = content.replace(/components\/Layout/g, 'shared/components/Layout');
      dirty = true;
    }
    if (content.includes('components/Shared')) {
      content = content.replace(/components\/Shared/g, 'shared/components/Shared');
      dirty = true;
    }
    if (content.includes('/utils/')) {
      content = content.replace(/\/utils\//g, '/shared/utils/');
      dirty = true;
    }
    
    if (dirty) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed Shared Imports:', filePath);
    }
  }
});
