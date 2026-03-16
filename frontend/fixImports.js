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
    
    if (content.includes('context/AuthContext')) {
      content = content.replace(/context\/AuthContext/g, 'features/auth/context/AuthContext');
      dirty = true;
    }
    if (content.includes('components/Auth/LoginPage')) {
      content = content.replace(/components\/Auth\/LoginPage/g, 'features/auth/components/LoginPage');
      dirty = true;
    }
    if (content.includes('components/AuthModal')) {
      content = content.replace(/components\/AuthModal/g, 'features/auth/components/AuthModal');
      dirty = true;
    }
    if (content.includes('components/AuthDrawer')) {
      // In case they imported AuthDrawer directly
      content = content.replace(/components\/Auth\/AuthDrawer/g, 'features/auth/components/AuthDrawer');
      dirty = true;
    }
    
    // Fix imports that lost one level of nesting (e.g. from components/Auth/LoginPage to features/auth/components/LoginPage means we might need to add one more "../" for anything it imports like Layout or utils.
    // Wait, LoginPage and AuthDrawer were already moved. Their internal imports might be broken now.
    // In LoginPage: import { useAuth } from '../../context/AuthContext'; (was ../../context/AuthContext from components/Auth/, now features/auth/components/LoginPage -> ../../context/AuthContext works perfectly!)
    // Wait, features/auth/components/LoginPage -> "../../" is features/. And context is in features/auth/context!
    // NO, features/auth/components -> ../context/AuthContext.
    // I already manually fixed LoginPage and AuthModal! I used multi_replace_file_content!
    // I should skip features/auth folder if I already fixed it, but my regex only replaces exact string.
    
    if (dirty) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
